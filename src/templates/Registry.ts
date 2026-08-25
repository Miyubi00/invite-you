// ============================================================
// src/templates/Registry.ts
// ------------------------------------------------------------
// Registry semua tema undangan: dimuat via React.lazy sehingga tiap tema jadi chunk terpisah. Wajib dibungkus <Suspense> saat render.
// Dipakai di  : InvitationPage, TemplateDemoPage
// Keterikatan : react (lazy), types/template (TemplateProps)
// ============================================================

// Semua tema dimuat via dynamic import (React.lazy) sehingga masing-masing
// menjadi chunk terpisah — hanya di-download saat temanya benar-benar dirender.
// Pemakai wajib membungkus render tema dengan <Suspense>.
//
// KONTRAK KATALOG: slug di THEME_LOADERS harus sama dengan slug di
// MASTER_TEMPLATES (src/lib/constants.ts) yang memegang data bisnis
// (nama/kategori/harga/gambar preview). Menambah tema baru =
// tambah loader di sini + entri baru di MASTER_TEMPLATES.
// Ketidaksesuaian dilaporkan console.warn saat development (blok bawah).

import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { TemplateProps } from '../types/template';

export type LazyTheme = LazyExoticComponent<ComponentType<TemplateProps>>;
type ThemeLoader = () => Promise<{ default: ComponentType<TemplateProps> }>;

// --- PETA SLUG -> LOADER (satu-satunya tempat registrasi tema) ---
const THEME_LOADERS: Record<string, ThemeLoader> = {
  'rustic-floral': () => import('./themes/RusticTheme'),
  'rustic-boho': () => import('./themes/RusticBohoTheme'),
  'modern-dark': () => import('./themes/ModernDarkTheme'),
  'botanical-gold': () => import('./themes/BotanicalTheme'),
  'monochrome': () => import('./themes/MonochromeTheme'),
  'navy-gold': () => import('./themes/NavyGoldTheme'),
  'bohaemin': () => import('./themes/BohaeminTheme'),
  'elegant-pastel': () => import('./themes/ElegantTheme'),
  'iphone': () => import('./themes/IphoneTheme'),
  'bit': () => import('./themes/BitTheme'),
  'comic': () => import('./themes/ComicTheme'),
  'diary': () => import('./themes/DiaryTheme'),

  'japanese': () => import('./themes/JapaneseTheme'),
  'javanese': () => import('./themes/JavaneseTheme'),
  'lilac': () => import('./themes/LilacTheme'),
  'playful-pop': () => import('./themes/PlayfulPopTheme'),
  'static-canvas': () => import('./themes/StaticCanvasTheme'),

  'cloud-sky': () => import('./themes/CloudSkyTheme'),
  'cyberpunk': () => import('./themes/CyberPunkTheme'),
  'cinamon': () => import('./themes/CinamonTheme'),
  'insta': () => import('./themes/InstaTheme'),
  'hello-kitty': () => import('./themes/HelloKityTheme'),
  'mobile': () => import('./themes/MobileTheme'),
  'binder-book': () => import('./themes/BinderTheme'),
  'art-gallery': () => import('./themes/ArtTheme'),
  'art-block': () => import('./themes/ArtBlockTheme'),
};

/** Daftar slug yang punya komponen tema terdaftar. */
export const TEMPLATE_SLUGS: string[] = Object.keys(THEME_LOADERS);

export const TEMPLATE_COMPONENTS: Record<string, LazyTheme> = Object.fromEntries(
  Object.entries(THEME_LOADERS).map(([slug, loader]) => [slug, lazy(loader)]),
);

// Fallback tetap RusticTheme — banyak pemanggil bergantung pada perilaku ini.
const FALLBACK_THEME = lazy(() => import('./themes/RusticTheme'));

const warnedFallbacks = new Set<string>();

export const getTemplateComponent = (slug: string): LazyTheme => {
  const component = TEMPLATE_COMPONENTS[slug];
  if (component) return component;
  // Peringatkan sekali per slug agar salah konfigurasi DB terlihat di log
  // produksi, tanpa membanjiri console pada tiap render ulang.
  if (!warnedFallbacks.has(slug)) {
    warnedFallbacks.add(slug);
    console.warn(`[Registry] Slug tema "${slug}" tidak dikenal — fallback ke rustic-floral.`);
  }
  return FALLBACK_THEME;
};

// --- Validasi sinkronisasi katalog (khusus development) ---
// Setiap slug di MASTER_TEMPLATES harus punya komponen tema di registry ini.
// Typo slug membuat undangan diam-diam fallback ke rustic-floral tanpa jejak.
// Dynamic import agar constants tidak ikut ke chunk halaman undangan publik.
if (import.meta.env.DEV) {
  void import('../lib/constants').then(({ MASTER_TEMPLATES }) => {
    for (const t of MASTER_TEMPLATES) {
      if (!TEMPLATE_COMPONENTS[t.slug]) {
        console.warn(
          `[Registry] Template "${t.slug}" (${t.name}) tidak memiliki komponen tema — akan fallback diam-diam ke rustic-floral.`,
        );
      }
    }
  });
}