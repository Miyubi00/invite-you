// ============================================================
// src/lib/tutorialData.ts
// ------------------------------------------------------------
// Daftar tutorial: tiap item = 1 kartu panduan berisi video + langkah
// tertulis (i18n). Cara pasang video asli: isi `youtubeId` dengan ID video
// (bagian setelah v=). Kosongkan (null) = placeholder "segera hadir".
// Kelompok: 'order' (cara memesan) & 'setup' (atur undangan).
// ============================================================

export type TutorialId =
  | 'cara-memesan'
  | 'login-dashboard'
  | 'lupa-pin'
  | 'edit-data'
  | 'atur-galeri'
  | 'atur-musik'
  | 'rsvp-bukutamu'
  | 'bagikan-undangan';

export interface TutorialItem {
  id: TutorialId;
  group: 'order' | 'setup';
  duration: string;
  youtubeId: string | null;
  icon: 'cart' | 'key' | 'user' | 'image' | 'music' | 'book' | 'share' | 'lock';
}

export const TUTORIAL_ITEMS: TutorialItem[] = [
  { id: 'cara-memesan', group: 'order', duration: '3:12',   youtubeId: null, icon: 'cart' },
  { id: 'login-dashboard', group: 'order', duration: '1:45',   youtubeId: null, icon: 'key' },
  { id: 'lupa-pin', group: 'order', duration: '2:03',   youtubeId: null, icon: 'lock' },
  { id: 'edit-data', group: 'setup', duration: '2:47',   youtubeId: null, icon: 'user' },
  { id: 'atur-galeri', group: 'setup', duration: '3:05',   youtubeId: null, icon: 'image' },
  { id: 'atur-musik', group: 'setup', duration: '2:20',   youtubeId: null, icon: 'music' },
  { id: 'rsvp-bukutamu', group: 'setup', duration: '2:51',   youtubeId: null, icon: 'book' },
  { id: 'bagikan-undangan', group: 'setup', duration: '1:58',   youtubeId: null, icon: 'share' },
];
