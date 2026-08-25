// ============================================================
// src/utils/templateHelpers.ts
// ------------------------------------------------------------
// Utilitas bersama untuk semua tema undangan: foto default, format tanggal/waktu, helper amplop & RSVP. Impor dari sini, jangan duplikat di tema.
// Dipakai di  : src/templates/themes/*, hooks/useCountdown
// Keterikatan : types/database, types/template
// ============================================================

// Shared utility functions for all invitation template themes.
// Import these instead of duplicating logic in each theme file.

import type { EventDetails, RsvpRow, BankAccount } from '../types/database';
import type { TemplateData, RsvpPayload } from '../types/template';

// ──────────────────────────────────────────────
// 1. DEFAULT PHOTOS (fallback URLs)
// ──────────────────────────────────────────────

export const DEFAULT_PHOTOS = {
  groom: 'https://loverse.my.id/defaults/img/ddeac34add.jpg',
  bride: 'https://loverse.my.id/defaults/img/be5e4750ac.jpg',
  cover: 'https://loverse.my.id/defaults/img/1772b3133b.jpg',
  gallery: [
    'https://loverse.my.id/defaults/img/146c15097b.jpg',
    'https://loverse.my.id/defaults/img/9a293ef1a6.jpg',
    'https://loverse.my.id/defaults/img/0150ee7a32.jpg',
    'https://loverse.my.id/defaults/img/3c8de55846.jpg',
  ],
  audio: 'https://loverse.my.id/defaults/audio/ee2e74c72c.mp3',
} as const;

// ──────────────────────────────────────────────
// 2. PHOTO RESOLUTION
// ──────────────────────────────────────────────

export interface ResolvedPhotos {
  groom: string;
  bride: string;
  cover: string;
  header?: string;
  bg?: string;
}

/** Resolve couple/gallery/bank data with sensible defaults. */
export function resolvePhotos(data?: TemplateData | null): ResolvedPhotos {
  return {
    groom: data?.groom_photo || DEFAULT_PHOTOS.groom,
    bride: data?.bride_photo || DEFAULT_PHOTOS.bride,
    cover: data?.cover_photo || DEFAULT_PHOTOS.cover,
  };
}

export function resolveGallery(data?: TemplateData | null): string[] {    return data?.gallery || [...DEFAULT_PHOTOS.gallery];
}

export function resolveBanks(data?: TemplateData | null): BankAccount[] {
  return data?.banks || [];
}

// ──────────────────────────────────────────────
// 2b. VENUE RESOLUTION
// ──────────────────────────────────────────────

export interface ResolvedVenue {
  name: string;
  address: string;
  mapsLink: string;
}

const DEFAULT_VENUE: ResolvedVenue = {
  name: 'Grand Ballroom Hotel',
  address: 'Jl. Jendral Sudirman No. 1, Jakarta Pusat',
  mapsLink: '#',
} as const;

/** Resolve venue data with sensible defaults. */
export function resolveVenue(data?: TemplateData | null): ResolvedVenue {
  return {
    name: data?.venue_name || DEFAULT_VENUE.name,
    address: data?.venue_address || DEFAULT_VENUE.address,
    mapsLink: data?.maps_link || DEFAULT_VENUE.mapsLink,
  };
}

// ──────────────────────────────────────────────
// 2c. SCHEDULE RESOLUTION
// ──────────────────────────────────────────────

export interface ResolvedSchedule {
  akadTime: string;
  akadDate: string;
  resepsiTime: string;
  resepsiDate: string;
}

const DEFAULT_SCHEDULE: ResolvedSchedule = {
  akadTime: '08:00 WIB',
  akadDate: '',
  resepsiTime: '11:00 WIB',
  resepsiDate: '',
} as const;

/** Teks ramah saat tanggal acara belum diisi pemilik undangan. */
const SCHEDULE_PLACEHOLDER = 'Akan segera diumumkan';

/**
 * Resolve schedule data with sensible defaults.
 * `fallbackDate` is the main wedding_date used when akad_date/resepsi_date are not set.
 */
export function resolveSchedule(data?: TemplateData | null, fallbackDate?: string): ResolvedSchedule {
  return {
    akadTime: data?.akad_time || DEFAULT_SCHEDULE.akadTime,
    // Placeholder teks (bukan string kosong) agar tema tidak merender baris
    // tanggal kosong; formatDate() meneruskan teks non-tanggal apa adanya.
    akadDate: data?.akad_date || fallbackDate || SCHEDULE_PLACEHOLDER,
    resepsiTime: data?.resepsi_time || DEFAULT_SCHEDULE.resepsiTime,
    resepsiDate: data?.resepsi_date || fallbackDate || SCHEDULE_PLACEHOLDER,
  };
}

// ──────────────────────────────────────────────
// 3. DATE / COUNTDOWN
// ──────────────────────────────────────────────

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Format a date string to a locale string. */
export function formatDate(
  dateStr?: string,
  locale: string = 'id-ID',
  options?: Intl.DateTimeFormatOptions,
): string {
  // String kosong/tidak valid diteruskan apa adanya. Sebelumnya '' jatuh ke
  // new Date() sehingga tema menampilkan tanggal HARI INI, dan teks acak
  // menjadi "Invalid Date".
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(
    locale,
    options ?? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  );
}

/** Parse a date string safely, returning a Date. Falls back to now. */
export function safeDate(dateStr?: string): Date {
  const d = dateStr ? new Date(dateStr) : new Date();
  // String tidak valid menghasilkan Invalid Date — fallback ke sekarang
  // agar countdown tema tidak crash.
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

/** Calculate the remaining time until `targetDate`. */
export function calcTimeLeft(targetDate: Date): TimeLeft {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// ──────────────────────────────────────────────
// 4. AUDIO TOGGLE
// ──────────────────────────────────────────────

export interface AudioControls {
  isPlaying: boolean;
  toggle: () => void;
  play: () => void;
  pause: () => void;
}

/**
 * Create audio controls bound to a ref.
 * Usage in component:
 *   const audio = useAudioControls(audioRef);
 */
export function createAudioControls(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  isPlaying: boolean,
  setIsPlaying: (v: boolean) => void,
): AudioControls {
  return {
    isPlaying,
    toggle: () => {
      const el = audioRef.current;
      if (!el) return;
      if (isPlaying) {
        el.pause();
        setIsPlaying(false);
      } else {
        el.play().catch(() => {});
        setIsPlaying(true);
      }
    },
    play: () => {
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
    },
    pause: () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    },
  };
}

// ──────────────────────────────────────────────
// 5. CLIPBOARD — kini via hooks/useCopyToClipboard (fallback + toast)
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
// 6. RSVP HELPER
// ──────────────────────────────────────────────

export function createDefaultRsvpData() {
  return { status: 'hadir' as const, pax: 1, message: '' };
}

// ──────────────────────────────────────────────
// 7. TEMPLATE SECTION ID TYPE
// ──────────────────────────────────────────────

/** Section keys used by themes that render content by section ID. */
export type SectionId =
  | 'cover'
  | 'couple'
  | 'event'
  | 'location'
  | 'gallery'
  | 'gift'
  | 'rsvp'
  | string;
