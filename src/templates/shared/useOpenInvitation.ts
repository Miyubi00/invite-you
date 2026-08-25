// ============================================================
// src/templates/shared/useOpenInvitation.ts
// ------------------------------------------------------------
// Pola bersama tema undangan (pilot dedup 3.2): state amplop terbuka +
// autoplay musik latar ber-delay, state playing sinkron hasil promise play().
// Dipakai di  : themes/* (pilot: Comic, HelloKitty, PlayfulPop —
//               lanjutkan ke tema lain secara inkremental)
// Keterikatan : hooks/useAudioToggle, react
// ============================================================

// Menggantikan copy-paste `handleOpen` di tiap tema:
//   const { isOpen, open: handleOpen, playing: isPlaying, toggle: toggleAudio }
//     = useOpenInvitation(audioRef, 500);
//
// - open(): membuka amplop lalu memutar musik setelah delayMs (memberi waktu
//   transisi amplop), sinkron dengan hasil promise play() sehingga autoplay
//   yang diblokir browser tidak memalsukan ikon "playing".
// - Seluruh AudioToggle ikut dikembalikan agar tombol musik tema tetap bisa
//   memakai toggle/pause/setPlaying seperti sebelumnya.

import { useCallback, useState, type RefObject } from 'react';
import { useAudioToggle, type AudioToggle } from '../../hooks/useAudioToggle';

export function useOpenInvitation(
  audioRef: RefObject<HTMLAudioElement | null>,
  delayMs = 500,
): { isOpen: boolean; open: () => void } & AudioToggle {
  const [isOpen, setIsOpen] = useState(false);
  const audio = useAudioToggle(audioRef);
  const { play } = audio;

  const open = useCallback(() => {
    setIsOpen(true);
    window.setTimeout(() => void play(), delayMs);
  }, [play, delayMs]);

  return { isOpen, open, ...audio };
}