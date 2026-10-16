// ============================================================
// src/pages/TutorialPage.tsx
// ------------------------------------------------------------
// Halaman tutorial: panduan memesan + mengatur undangan. Tiap kartu
// berisi thumbnail video (klik → popup player YouTube bila youtubeId
// diisi) + langkah tertulis. Tambah tutorial baru cukup di
// src/lib/tutorialData.ts + i18n.
// Keterikatan : react-router-dom; lucide-react; ../lib/tutorialData;
// ../i18n.
// ============================================================

import { useEffect, useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Lock,
  Pencil,
  Play,
  ListOrdered,
  Share2,
  ShoppingCart,
  X,
  Youtube,
} from 'lucide-react';
import { TUTORIAL_ITEMS, type TutorialItem } from '../lib/tutorialData';
import { useTranslation } from '../i18n';
import { usePageMeta } from '../hooks/usePageMeta';
import { id as idDict } from '../i18n/locales/id';
import { en as enDict } from '../i18n/locales/en';

const ICONS = {
  cart: ShoppingCart,
  lock: Lock,
  edit: Pencil,
  share: Share2,
  book: BookOpen,
} as const;

function VideoModal({
  youtubeId,
  title,
  onClose,
}: {
  youtubeId: string;
  title: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
        <div
          className="w-full max-w-5xl lg:max-w-6xl"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="truncate font-brand text-lg font-semibold text-white sm:text-xl">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('tutorial.videoClose')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X size={18} />
          </button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}

function TutorialCard({ item }: { item: TutorialItem }) {
  const { t, language } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const base = `tutorial.items.${item.id}` as const;
  const title = t(`${base}.title`);
  const desc = t(`${base}.desc`);
  const dict = language === 'en' ? enDict : idDict;
  const steps = (dict.tutorial.items[item.id] as unknown as { steps: readonly string[] }).steps;
  const Icon = ICONS[item.icon];

  return (
    <article className="overflow-hidden rounded-2xl border border-[#EBDFCE] bg-white shadow-sm transition duration-300 hover:shadow-lg">
      {/* Thumbnail / placeholder */}
      <div className="relative aspect-video bg-[#3a140c]">
        {item.youtubeId ? (
          <>
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`${t('tutorial.videoPlay')}: ${title}`}
              className="group absolute inset-0 h-full w-full cursor-pointer"
            >
              <img
                src={`https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] group-hover:brightness-75"
                onError={(e) => {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${item.youtubeId}/mqdefault.jpg`;
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#712E1E]/90 text-white shadow-xl transition duration-300 group-hover:scale-110 group-hover:bg-[#712E1E]">
                  <Play size={26} className="ml-0.5 fill-current" />
                </span>
              </span>
            </button>
            <span className="pointer-events-none absolute bottom-2.5 right-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white">
              {item.duration}
            </span>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <Youtube size={26} className="text-[#FFD5AF]" />
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-[#FFD5AF]/70">
              {t('tutorial.videoSoon')}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E9] text-[#712E1E]">
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-brand text-xl font-semibold text-[#712E1E]">{title}</h3>
            <p className="truncate text-xs text-stone-500">{desc}</p>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#B4693F]">
          <ListOrdered size={13} /> {t('tutorial.stepsLabel')}
        </p>
        <ol className="mt-2 space-y-2.5">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-stone-600">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#712E1E] text-[10px] font-black text-white">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {playing && item.youtubeId && (
        <VideoModal
          youtubeId={item.youtubeId}
          title={title}
          onClose={() => setPlaying(false)}
        />
      )}
    </article>
  );
}

export default function TutorialPage() {
  const { t } = useTranslation();
  usePageMeta(
    'Tutorial Undangan Digital — LoVerse',
    'Panduan video dan langkah tertulis: cara pesan undangan, edit undangan, lupa PIN, bagikan undangan, dan cek RSVP & buku tamu LoVerse.',
  );
  const orders = TUTORIAL_ITEMS.filter((i) => i.group === 'order');
  const setups = TUTORIAL_ITEMS.filter((i) => i.group === 'setup');

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <section className="relative overflow-hidden border-b border-[#EBDFCE]/60">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-20 left-1/4 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#E59A59]/15 to-transparent blur-3xl" />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-14 text-center sm:px-6 md:py-20 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#EBDFCE] bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur-sm">
            <GraduationCap size={14} className="text-[#E59A59]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#712E1E] sm:text-xs">
              {t('tutorial.badge')}
            </span>
          </div>
          <h1 className="mx-auto mt-4 max-w-3xl font-brand text-4xl font-semibold leading-tight text-[#712E1E] sm:text-5xl">
            {t('tutorial.title')}
          </h1>
          <p className="mx-auto mt-3 flex max-w-xl items-center justify-center gap-2 text-sm text-stone-600 sm:text-base">
            <Play size={15} className="shrink-0 text-[#E59A59]" />
            {t('tutorial.subtitle')}
          </p>
        </div>
      </section>

      {(
        [
          { key: 'order', title: t('tutorial.groupOrder'), items: orders },
          { key: 'setup', title: t('tutorial.groupSetup'), items: setups },
        ] as const
      ).map((group) => (
        <section key={group.key} className="container mx-auto px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <h2 className="text-center font-brand text-2xl font-semibold text-[#712E1E] sm:text-3xl">
            {group.title}
          </h2>
          <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
            {group.items.map((item) => (
              <TutorialCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
