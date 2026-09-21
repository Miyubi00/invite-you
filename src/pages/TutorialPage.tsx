// ============================================================
// src/pages/TutorialPage.tsx
// ------------------------------------------------------------
// Halaman tutorial: panduan memesan + mengatur undangan. Tiap kartu
// berisi video YouTube (bila youtubeId diisi) + langkah tertulis.
// Tambah tutorial baru cukup di src/lib/tutorialData.ts + i18n.
// Keterikatan : react-router-dom; lucide-react; ../lib/tutorialData;
// ../i18n.
// ============================================================

import {
  BookOpen,
  GraduationCap,
  Image as ImageIcon,
  KeyRound,
  ListOrdered,
  Lock,
  Music,
  Play,
  Share2,
  ShoppingCart,
  User,
  Youtube,
} from 'lucide-react';
import { TUTORIAL_ITEMS, type TutorialItem } from '../lib/tutorialData';
import { useTranslation } from '../i18n';
import { usePageMeta } from '../hooks/usePageMeta';
import { id as idDict } from '../i18n/locales/id';
import { en as enDict } from '../i18n/locales/en';

const ICONS = {
  cart: ShoppingCart,
  key: KeyRound,
  user: User,
  image: ImageIcon,
  music: Music,
  book: BookOpen,
  share: Share2,
  lock: Lock,
} as const;

function TutorialCard({ item }: { item: TutorialItem }) {
  const { t, language } = useTranslation();
  const base = `tutorial.items.${item.id}` as const;
  const title = t(`${base}.title`);
  const desc = t(`${base}.desc`);
  const dict = language === 'en' ? enDict : idDict;
  const steps = (dict.tutorial.items[item.id] as unknown as { steps: readonly string[] }).steps;
  const Icon = ICONS[item.icon];

  return (
    <article className="overflow-hidden rounded-2xl border border-[#EBDFCE] bg-white shadow-sm transition duration-300 hover:shadow-lg">
      {/* Video / placeholder */}
      <div className="relative aspect-video bg-[#3a140c]">
        {item.youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}`}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
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
        <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white">
          {item.duration}
        </span>
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
    </article>
  );
}

export default function TutorialPage() {
  const { t } = useTranslation();
  usePageMeta(
    'Tutorial Undangan Digital — LoVerse',
    'Panduan video dan langkah tertulis: cara memesan, login dashboard, edit data, galeri, musik, RSVP, dan bagikan undangan digital LoVerse.',
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
