// ============================================================
// src/lib/tutorialData.ts
// ------------------------------------------------------------
// Daftar tutorial: tiap item = 1 kartu panduan berisi video + langkah
// tertulis (i18n). Cara pasang video asli: isi `youtubeId` dengan ID video
// (bagian setelah v=). Kosongkan (null) = placeholder "segera hadir".
// Kelompok: 'order' (cara memesan & akun) & 'setup' (kelola undangan).
// ============================================================

export type TutorialId =
  | 'cara-pesan'
  | 'lupa-pin'
  | 'cara-edit'
  | 'bagikan-undangan'
  | 'rsvp-bukutamu';

export interface TutorialItem {
  id: TutorialId;
  group: 'order' | 'setup';
  duration: string;
  youtubeId: string | null;
  icon: 'cart' | 'lock' | 'edit' | 'share' | 'book';
}

export const TUTORIAL_ITEMS: TutorialItem[] = [
  { id: 'cara-pesan',     group: 'order', duration: '3:12', youtubeId: '0N8RlC7Ir7E', icon: 'cart' },
  { id: 'lupa-pin',       group: 'order', duration: '2:03', youtubeId: 'mnlgc0P0LS0', icon: 'lock' },
  { id: 'cara-edit',      group: 'setup', duration: '4:00', youtubeId: 'VitNJdoPeUg', icon: 'edit' },
  { id: 'bagikan-undangan', group: 'setup', duration: '1:58', youtubeId: '87UEuUwqYeg', icon: 'share' },
  { id: 'rsvp-bukutamu',  group: 'setup', duration: '2:51', youtubeId: 'oqHIr__BqyM', icon: 'book' },
];
