// ============================================================
// src/hooks/useAudioToggle.ts
// ------------------------------------------------------------
// Hook play/pause/toggle audio background untuk tema undangan (pengganti duplikasi logic di tiap tema).
// Dipakai di  : src/templates/themes/*
// Keterikatan : react (useCallback/RefObject)
// ============================================================

// Hook audio background bersama untuk tema undangan.
// Menggantikan duplikasi logic play/pause/toggle yang sebelumnya
// di-copy-paste di tiap tema.

import { useCallback, useState, type RefObject } from 'react';

export interface AudioToggle {
  /** Apakah audio sedang bermain (sinkron dengan hasil play(), bukan blind-set). */
  playing: boolean;
  /** Setter manual — untuk flow khusus mis. auto-play saat amplop dibuka. */
  setPlaying: (v: boolean) => void;
  /** Play dan sinkronkan state berdasarkan hasil promise-nya. */
  play: () => void;
  /** Pause dan set state false. */
  pause: () => void;
  /** Toggle play/pause. */
  toggle: () => void;
}

/**
 * @param audioRef ref ke elemen <audio> di dalam tema
 * @param onPlayError callback opsional saat autoplay diblokir browser
 */
export function useAudioToggle(
  audioRef: RefObject<HTMLAudioElement | null>,
  onPlayError?: () => void,
): AudioToggle {
  const [playing, setPlaying] = useState(false);

  const play = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.play()
      .then(() => setPlaying(true))
      .catch(() => {
        // Autoplay tanpa gesture user akan diblokir browser — bukan error nyata.
        setPlaying(false);
        onPlayError?.();
      });
  }, [audioRef, onPlayError]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, [audioRef]);

  const toggle = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, pause, play]);

  return { playing, setPlaying, play, pause, toggle };
}
