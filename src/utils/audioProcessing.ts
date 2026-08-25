// ============================================================
// src/utils/audioProcessing.ts
// ------------------------------------------------------------
// Wrapper konversi audio -> WebM (Opus) via Web Worker: main thread decode + transfer channel, worker encode & mux dengan progres.
// Dipakai di  : hooks/useFileUpload.tsx
// Keterikatan : ./workers/audioConvert.worker (via new Worker)
// ============================================================

// Wrapper konversi audio -> WebM (Opus) via Web Worker.
//
// Pembagian tugas:
//   Main thread : decodeAudioData (Web Audio hanya terekspos di Window),
//                 ekstrak channel-planar Float32 lalu transfer zero-copy.
//   Worker      : encode Opus (WebCodecs) + mux WebM + progres persen.
//
// Bila konversi tidak memungkinkan, fungsi mengembalikan alasan eksplisit
// agar UI/console bisa menampilkannya.

export interface WebMConversionResult {
  blob: Blob;
}

export type ConvertProgress = (pct: number) => void;

export type ConvertOutcome =
  | { ok: true; blob: Blob }
  | { ok: false; reason: string };

const TARGET_SAMPLE_RATE = 48000;

const workerUrl = new URL('../workers/audioConvert.worker.ts', import.meta.url);

function isConversionSupported(): boolean {
  const supported =
    typeof Worker !== 'undefined' && typeof AudioEncoder !== 'undefined';
  if (!supported) {
    console.warn('[AudioConvert] Browser tidak mendukung WebCodecs AudioEncoder.');
  }
  return supported;
}

export async function convertToWebMAudio(
  file: File | Blob,
  onProgress?: ConvertProgress,
): Promise<ConvertOutcome> {
  if (!isConversionSupported()) {
    return { ok: false, reason: 'Browser tidak mendukung konversi audio' };
  }

  console.info('[AudioConvert] Decode audio di main thread (Web Audio)...');

  return new Promise<ConvertOutcome>((resolve) => {
    const worker = new Worker(workerUrl, { type: 'module' });

    // Watchdog: jika encoder WebCodecs macet senyap (tanpa onerror), spinner
    // `converting` akan hang selamanya. Watchdog di-reset tiap ada progres;
    // habis masa tenggang -> terminate worker + fallback ke file asli.
    const WATCHDOG_TIMEOUT_MS = 120_000;
    let watchdogId: ReturnType<typeof setTimeout> | undefined;
    let settled = false;

    const finish = (result: ConvertOutcome) => {
      if (settled) return;
      settled = true;
      if (watchdogId !== undefined) clearTimeout(watchdogId);
      worker.terminate();
      resolve(result);
    };

    const resetWatchdog = () => {
      if (watchdogId !== undefined) clearTimeout(watchdogId);
      watchdogId = setTimeout(() => {
        finish({ ok: false, reason: 'Konversi audio melebihi batas waktu' });
      }, WATCHDOG_TIMEOUT_MS);
    };

    resetWatchdog();

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data as
        | { type: 'progress'; pct: number }
        | { type: 'done'; blob: Blob }
        | { type: 'error'; message: string };

      if (msg.type === 'progress') {
        resetWatchdog();
        onProgress?.(msg.pct);
      } else if (msg.type === 'done') {
        console.info(`[AudioConvert] Selesai (${Math.round(msg.blob.size / 1024)}KB).`);
        finish({ ok: true, blob: msg.blob });
      } else {
        console.warn('[AudioConvert] Worker error:', msg.message);
        finish({ ok: false, reason: msg.message });
      }
    };

    worker.onerror = (e) => {
      console.warn('[AudioConvert] Worker crashed:', e.message);
      finish({ ok: false, reason: 'Worker konversi gagal dimuat' });
    };

    void (async () => {
      try {
        // --- DECODE (main thread, Web Audio hanya ada di sini) ---
        const offline = new OfflineAudioContext(1, 1, TARGET_SAMPLE_RATE);
        const bytes = await file.arrayBuffer();
        const audioBuffer = await offline.decodeAudioData(bytes);

        const channels = Math.min(2, Math.max(1, audioBuffer.numberOfChannels));
        const length = audioBuffer.length;

        // --- Ekstrak channel-planar ke satu buffer transferable ---
        const planarBuffer = new ArrayBuffer(length * channels * 4);
        const planarView = new Float32Array(planarBuffer);
        for (let c = 0; c < channels; c++) {
          planarView.set(
            audioBuffer.getChannelData(Math.min(c, audioBuffer.numberOfChannels - 1)),
            c * length,
          );
        }

        console.info(
          `[AudioConvert] Decode selesai (${length} frame, ${channels}ch). Encode di worker...`,
        );

        worker.postMessage(
          {
            type: 'convert',
            channels,
            sampleRate: audioBuffer.sampleRate,
            length,
            data: planarView,
          },
          [planarBuffer],
        );
      } catch (error) {
        console.warn('[AudioConvert] Gagal decode:', error);
        finish({ ok: false, reason: 'Gagal membaca / decode audio' });
      }
    })();
  });
}
