// ============================================================
// src/pages/PortfolioPage.tsx
// ------------------------------------------------------------
// Halaman portofolio ala brand besar: hero + statistik + filter kategori +
// grid karya + CTA. Data DUMMY (src/lib/portfolioData.ts) memakai variasi
// tema katalog; tiap kartu tertaut ke demo live temanya.
// Keterikatan : react-router-dom; lucide-react; ../lib/{constants,
// portfolioData}; ../i18n.
// ============================================================

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Eye,
  Heart,
  Images,
  MapPin,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { MASTER_TEMPLATES } from '../lib/constants';
import { PORTFOLIO_ITEMS } from '../lib/portfolioData';
import { useTranslation } from '../i18n';
import { usePageMeta } from '../hooks/usePageMeta';

const templateOf = (slug: string) =>
  MASTER_TEMPLATES.find((t) => t.slug === slug);

export default function PortfolioPage() {
  const { t } = useTranslation();
  usePageMeta(
    'Portofolio Undangan Pernikahan Digital — LoVerse',
    'Lihat koleksi undangan pernikahan digital LoVerse: puluhan tema elegan, modern, dan lucu dengan demo live yang bisa langsung dicoba.',
  );
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of PORTFOLIO_ITEMS) {
      const cat = templateOf(item.templateSlug)?.category;
      if (cat) set.add(cat);
    }
    return ['all', ...Array.from(set)];
  }, []);

  const items = useMemo(
    () =>
      PORTFOLIO_ITEMS.filter((item) => {
        if (category === 'all') return true;
        return templateOf(item.templateSlug)?.category === category;
      }),
    [category],
  );

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#EBDFCE]/60">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-20 left-1/4 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#E59A59]/15 to-transparent blur-3xl" />
          <div className="absolute top-32 right-10 h-[380px] w-[380px] rounded-full bg-gradient-to-bl from-[#712E1E]/10 to-transparent blur-3xl" />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-14 text-center sm:px-6 md:py-20 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#EBDFCE] bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur-sm">
            <Images size={14} className="text-[#E59A59]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#712E1E] sm:text-xs">
              {t('portfolio.badge')}
            </span>
          </div>
          <h1 className="mx-auto mt-4 max-w-3xl font-brand text-4xl font-semibold leading-tight text-[#712E1E] sm:text-5xl md:text-6xl">
            {t('portfolio.title')}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-stone-600 sm:text-base md:text-lg">
            {t('portfolio.subtitle')}
          </p>

          {/* Statistik */}
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3">
            {[
              { icon: <Award size={16} />, value: '40+', label: t('portfolio.statThemes') },
              { icon: <Heart size={16} />, value: '68+', label: t('portfolio.statCouples') },
              { icon: <Star size={16} />, value: '4.9', label: t('portfolio.statRating') },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-[#EBDFCE] bg-white/80 px-2 py-4 shadow-sm backdrop-blur-sm"
              >
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF3E9] text-[#712E1E]">
                  {s.icon}
                </span>
                <p className="mt-2 font-brand text-2xl font-semibold text-[#712E1E] sm:text-3xl">
                  {s.value}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-stone-500 sm:text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTER */}
      <section className="container mx-auto px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition sm:text-sm ${
                category === c
                  ? 'bg-[#712E1E] text-white shadow-md'
                  : 'border border-[#EBDFCE] bg-white text-stone-500 hover:border-[#E59A59]/60 hover:text-[#712E1E]'
              }`}
            >
              {c === 'all' ? t('portfolio.filterAll') : c}
            </button>
          ))}
        </div>
      </section>

      {/* GRID KARYA */}
      <section className="container mx-auto px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const tpl = templateOf(item.templateSlug);
            return (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-[#EBDFCE] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link to={`/demo/${item.templateSlug}`} className="relative block aspect-[3/4] overflow-hidden bg-[#F3EBDF]">
                  {tpl ? (
                    <img
                      src={tpl.image}
                      alt={`${item.groom} & ${item.bride}`}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-300">
                      <Images size={40} />
                    </div>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center gap-2 bg-[#3a140c]/0 text-sm font-bold text-white opacity-0 transition duration-300 group-hover:bg-[#3a140c]/55 group-hover:opacity-100">
                    <Eye size={18} /> {t('portfolio.viewDemo')}
                  </span>
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#712E1E] backdrop-blur-sm">
                    {tpl?.category ?? '-'}
                  </span>
                </Link>
                <div className="p-4 sm:p-5">
                  <h3 className="font-brand text-xl font-semibold text-[#712E1E] sm:text-2xl">
                    {item.groom} &amp; {item.bride}
                  </h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {item.city} · {item.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} /> {item.guests}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#B4693F]">
                      <Star size={12} className="fill-amber-400 text-amber-400" /> {item.rating.toFixed(1)}
                    </span>
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    {t('portfolio.themeLabel')}: {tpl?.name ?? item.templateSlug}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#712E1E] px-6 py-12 text-center shadow-xl sm:px-10">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#E59A59]/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FFD5AF]">
              <Sparkles size={13} /> {t('portfolio.ctaBadge')}
            </span>
            <h2 className="mx-auto mt-3 max-w-xl font-brand text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {t('portfolio.ctaTitle')}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#FFD5AF]/80">
              {t('portfolio.ctaDesc')}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/order"
                className="inline-flex items-center gap-2 rounded-xl bg-[#E59A59] px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#d48b4b] active:scale-95"
              >
                {t('portfolio.ctaOrder')} <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/20 active:scale-95"
              >
                {t('portfolio.ctaContact')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
