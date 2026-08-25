// ============================================================
// src/hooks/useCountdown.ts
// ------------------------------------------------------------
// Countdown timer bersama untuk tema undangan: auto-stop saat habis, nilai awal langsung dihitung, cleanup aman StrictMode.
// Dipakai di  : src/templates/themes/*
// Keterikatan : utils/templateHelpers (parsing tanggal acara)
// ============================================================

// Hook countdown bersama untuk semua tema undangan.
// Menggantikan logika setInterval yang sebelumnya di-copy-paste di tiap tema.
//
// Keunggulan dibanding implementasi lama:
// - Timer otomatis BERHENTI (clearInterval) saat waktu habis
// - Nilai awal langsung dihitung saat mount (tidak menunggu 1 detik)
// - Cleanup otomatis saat unmount / date berubah (aman untuk StrictMode)

import { useEffect, useState } from 'react';
import { calcTimeLeft, type TimeLeft } from '../utils/templateHelpers';

/**
 * @param dateStr Tanggal target (string ISO). Jika kosong, fallback ke sekarang.
 * @param timeStr Opsional, jam target format 'HH:MM'. Jika diisi, waktu target
 *                memakai jam ini pada tanggal `dateStr` (meniru perilaku tema
 *                yang countdown ke jam akad, bukan tengah malam).
 * @returns Sisa waktu { days, hours, minutes, seconds }
 */
export function useCountdown(dateStr?: string, timeStr?: string): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const base = new Date(dateStr || new Date());
    let targetDate = base;

    if (timeStr && !Number.isNaN(base.getTime())) {
      // Ambil bagian tanggal dari string ASLI bila berformat YYYY-MM-DD*;
      // JANGAN lewat toISOString() (UTC) — di zona waktu +07:00 tanggal bisa
      // bergeser satu hari sehingga countdown meleset saat digabung jam lokal.
      const raw = String(dateStr ?? '');
      const pad = (n: number) => String(n).padStart(2, '0');
      const dayPart = /^\d{4}-\d{2}-\d{2}/.test(raw)
        ? raw.slice(0, 10)
        : `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
      targetDate = new Date(`${dayPart}T${timeStr}:00`);
    }

    if (Number.isNaN(targetDate.getTime())) {
      // Tanggal invalid: countdown diam di nol — log agar mudah didiagnosa,
      // alih-alih gagal senyap.
      console.warn('[useCountdown] Tanggal target tidak valid:', dateStr, timeStr);
      return;
    }

    // Returns true jika countdown masih berjalan.
    const tick = (): boolean => {
      const t = calcTimeLeft(targetDate);
      setTimeLeft(t);
      return t.days + t.hours + t.minutes + t.seconds > 0;
    };

    tick(); // set nilai awal segera

    const interval = setInterval(() => {
      if (!tick()) clearInterval(interval); // berhenti saat waktu habis
    }, 1000);

    return () => clearInterval(interval);
  }, [dateStr, timeStr]);

  return timeLeft;
}
