// ============================================================
// src/workers/audioConvert.worker.ts
// ------------------------------------------------------------
// Web Worker encode audio: Opus via WebCodecs + mux WebM (webm-muxer), kirim progres ke main thread.
// Dipakai di  : utils/audioProcessing.ts
// Keterikatan : webm-muxer
// ============================================================

// Web Worker: encode Opus (WebCodecs) + mux WebM dari data PCM planar
// yang sudah di-decode main thread, lengkap dengan progres persen.
//
// Protokol pesan:
//   in : { type: 'convert'; channels; sampleRate; length; data: Float32Array }
//   out: { type: 'progress'; pct } | { type: 'done'; blob } | { type: 'error'; message }

import { Muxer, ArrayBufferTarget } from 'webm-muxer';

const TARGET_BITRATE = 112_000;
const CHUNK_FRAMES = 4800; // ±100ms per chunk @48kHz

interface ConvertIn {
  type: 'convert';
  channels: number;
  sampleRate: number;
  length: number;
  /** PCM planar (channel berurutan), sudah ditransfer dari main thread. */
  data: Float32Array<ArrayBuffer>;
}

type ConvertOut =
  | { type: 'progress'; pct: number }
  | { type: 'done'; blob: Blob }
  | { type: 'error'; message: string };

const workerSelf = self as unknown as {
  onmessage: ((e: MessageEvent<ConvertIn>) => void) | null;
  postMessage: (message: ConvertOut) => void;
};

/** Potong satu chunk f32-planar dari buffer besar. */
function sliceChunk(
  data: Float32Array<ArrayBuffer>,
  channels: number,
  offset: number,
  frameCount: number,
): Float32Array<ArrayBuffer> {
  const channelLength = data.length / channels;
  const backing = new ArrayBuffer(frameCount * channels * 4);
  const out = new Float32Array(backing);
  for (let c = 0; c < channels; c++) {
    const srcStart = c * channelLength + offset;
    out.set(data.subarray(srcStart, srcStart + frameCount), c * frameCount);
  }
  return out;
}

async function convert(
  data: Float32Array<ArrayBuffer>,
  channels: number,
  sampleRate: number,
): Promise<Blob> {
  const totalFrames = data.length / channels;

  const muxTarget = new ArrayBufferTarget();
  const muxer = new Muxer({
    target: muxTarget,
    audio: {
      codec: 'A_OPUS',
      numberOfChannels: channels,
      sampleRate,
    },
    firstTimestampBehavior: 'offset',
  });

  let encoderError: unknown = null;
  const encoder = new AudioEncoder({
    output: (chunk, meta) => {
      muxer.addAudioChunk(chunk, meta);
    },
    error: (err) => {
      encoderError = err;
    },
  });
  encoder.configure({
    codec: 'opus',
    sampleRate,
    numberOfChannels: channels,
    bitrate: TARGET_BITRATE,
  });

  let offset = 0;
  let lastPct = -1;

  while (offset < totalFrames) {
    if (encoderError) throw encoderError;

    // Backpressure: beri napas worker saat antrean menumpuk.
    if (encoder.encodeQueueSize > 16) {
      await new Promise((r) => setTimeout(r, 0));
      continue;
    }

    const frameCount = Math.min(CHUNK_FRAMES, totalFrames - offset);
    const chunk = sliceChunk(data, channels, offset, frameCount);

    const audioData = new AudioData({
      format: 'f32-planar',
      sampleRate,
      numberOfFrames: frameCount,
      numberOfChannels: channels,
      timestamp: Math.round((offset / sampleRate) * 1e6),
      data: chunk,
    });
    encoder.encode(audioData);
    audioData.close();
    offset += frameCount;

    const pct = Math.floor((offset / totalFrames) * 100);
    if (pct !== lastPct) {
      lastPct = pct;
      workerSelf.postMessage({ type: 'progress', pct });
    }
  }

  await encoder.flush();
  encoder.close();
  if (encoderError) throw encoderError;

  muxer.finalize();
  return new Blob([muxTarget.buffer], { type: 'audio/webm' });
}

workerSelf.onmessage = async (e: MessageEvent<ConvertIn>) => {
  if (e.data?.type !== 'convert') return;
  try {
    const blob = await convert(e.data.data, e.data.channels, e.data.sampleRate);
    workerSelf.postMessage({ type: 'done', blob });
  } catch (error) {
    workerSelf.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
