// ============================================================
// src/components/shared/form/ui.ts
// ------------------------------------------------------------
// Design token form bersama (CARD, CARD_TITLE, FIELD_LABEL, ICON_CHIP, INPUT) - satu sumber gaya agar seragam.
// Dipakai di  : FormKit, SectionCards, ShareTab, EditOrderModal
// Keterikatan : -(murni konstanta string Tailwind)
// ============================================================

// Design token form bersama: satu sumber untuk gaya card, field, dan label
// agar radius, padding, shadow, dan tipografi seragam di seluruh dashboard.

// Palet tema: terracotta/warm brown (#712E1E, #E59A59), cream (#F1E8DC),
// netral gelap untuk teks (stone).
export const CARD =
  'rounded-2xl border border-[#EBDFCE] bg-white p-6 shadow-sm space-y-5';

export const CARD_TITLE =
  'flex items-center gap-2.5 font-bold text-sm text-stone-800';

export const ICON_CHIP =
  'rounded-lg bg-[#F7EEE3] p-1.5 text-[#B4693F]';

export const FIELD_LABEL =
  'block text-[10px] font-bold uppercase tracking-wider text-stone-500';

export const INPUT =
  'w-full rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-800 ' +
  'placeholder:text-stone-400 outline-none transition ' +
  'focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20';
