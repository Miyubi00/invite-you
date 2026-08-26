// ============================================================
// src/pages/HomePage.tsx
// ------------------------------------------------------------
// Halaman utama (/) - Landing page LoVerse:
// Hero Split Layout Kiri-Kanan (dengan Interactive Multi-Template Carousel Mockup),
// Value Pillars, Cara Buat (3 Steps), Katalog Tema + Search & Filter,
// Testimoni, FAQ Accordion, & Bottom CTA.
// Dipakai di  : App.tsx
// Keterikatan : lib/constants (katalog), lib/supabaseClient (statistik), types/database
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { MASTER_TEMPLATES, TESTIMONIALS } from '../lib/constants';
import { TemplateCardSkeleton } from '../components/ui/SkeletonLoaders';
import { SkeletonImage } from '../components/ui/SkeletonImage';
import type { TemplateRow } from '../types/database';
import { useTranslation } from '../i18n';
import {
  Search, Eye, Edit3, Sparkles, MessageSquare,
  Star, ShoppingBag, LayoutTemplate, ArrowRight, Heart,
  CheckCircle2, Music, Share2, ShieldCheck, HelpCircle, ChevronDown,
  Calendar, Users
} from 'lucide-react';

type CategoryFilter = 'All' | 'Basic' | 'RSVP';

// Dummy data showcase multi-template carousel pada Hero section
const SHOWCASE_SLIDES = [
  {
    slug: 'botanical-gold',
    name: 'Botanical Gold',
    category: 'Basic',
    image: 'https://r2.loverse.my.id/themes/botanical-gold.webp',
    couple: 'Dimas & Sarah',
    date: 'Sabtu, 24 Oktober 2026',
    rsvpCount: 142,
    songTitle: 'Sampai Jadi Debu',
    days: 48,
    hours: 14,
    mins: 32,
    secs: 10,
  },
  {
    slug: 'cinamon',
    name: 'Cinnamon Blue',
    category: 'RSVP',
    image: 'https://r2.loverse.my.id/themes/cinamon.webp',
    couple: 'Radit & Anisa',
    date: 'Minggu, 15 November 2026',
    rsvpCount: 218,
    songTitle: 'Akad - Payung Teduh',
    days: 70,
    hours: 9,
    mins: 15,
    secs: 45,
  },
  {
    slug: 'rustic-floral',
    name: 'Rustic Floral',
    category: 'Basic',
    image: 'https://r2.loverse.my.id/themes/rustic-floral.webp',
    couple: 'Kevin & Jessica',
    date: 'Jumat, 18 Desember 2026',
    rsvpCount: 185,
    songTitle: 'A Thousand Years',
    days: 103,
    hours: 16,
    mins: 40,
    secs: 20,
  },
  {
    slug: 'modern-dark',
    name: 'Modern Dark',
    category: 'Basic',
    image: 'https://r2.loverse.my.id/themes/modern-dark.webp',
    couple: 'Arya & Nabila',
    date: 'Sabtu, 09 Januari 2027',
    rsvpCount: 310,
    songTitle: 'Kisah Romantis',
    days: 125,
    hours: 11,
    mins: 20,
    secs: 55,
  },
  {
    slug: 'playful-pop',
    name: 'Playful Pop',
    category: 'RSVP',
    image: 'https://r2.loverse.my.id/themes/playful-pop.webp',
    couple: 'Fajar & Tiara',
    date: 'Minggu, 14 Februari 2027',
    rsvpCount: 164,
    songTitle: 'Cinta Luar Biasa',
    days: 160,
    hours: 8,
    mins: 5,
    secs: 30,
  },
];

// Offset dasar dummy (misal 60 + data pesanan asli 7 = 67)
const BASE_DUMMY_SOLD = 60;

export default function Landing() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [templates, setTemplates] = useState<Array<TemplateRow & { image: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [soldCount, setSoldCount] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Carousel State for Hero Showcase (Otomatis berganti tema)
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  useEffect(() => {
    if (isCarouselHovered) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isCarouselHovered]);

  const currentSlide = SHOWCASE_SLIDES[activeSlide];

  const featuresList = [
    {
      icon: Sparkles,
      title: t('home.features.f1Title'),
      desc: t('home.features.f1Desc'),
    },
    {
      icon: MessageSquare,
      title: t('home.features.f2Title'),
      desc: t('home.features.f2Desc'),
    },
    {
      icon: Edit3,
      title: t('home.features.f3Title'),
      desc: t('home.features.f3Desc'),
    },
    {
      icon: ShieldCheck,
      title: t('home.features.f4Title'),
      desc: t('home.features.f4Desc'),
    },
  ];

  const stepsList = [
    {
      num: t('home.step1Num'),
      title: t('home.step1Title'),
      desc: t('home.step1Desc'),
      icon: LayoutTemplate,
    },
    {
      num: t('home.step2Num'),
      title: t('home.step2Title'),
      desc: t('home.step2Desc'),
      icon: Edit3,
    },
    {
      num: t('home.step3Num'),
      title: t('home.step3Title'),
      desc: t('home.step3Desc'),
      icon: Share2,
    },
  ];

  const faqList = [
    { q: t('home.faq1Q'), a: t('home.faq1A') },
    { q: t('home.faq2Q'), a: t('home.faq2A') },
    { q: t('home.faq3Q'), a: t('home.faq3A') },
    { q: t('home.faq4Q'), a: t('home.faq4A') },
  ];

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data: dbTemplates, error } = await supabase
          .from('templates')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        if (dbTemplates) {
          const combinedData = dbTemplates.map((dbItem) => {
            const localTemplate = MASTER_TEMPLATES.find((t) => t.slug === dbItem.slug);
            return {
              ...dbItem,
              image: localTemplate ? localTemplate.image : 'https://via.placeholder.com/400x300?text=No+Image',
            };
          });
          setTemplates(combinedData);
        }
      } catch (error) {
        console.error('Gagal mengambil data template:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSoldCount = async () => {
      const { count, error } = await supabase
        .from('public_invitations')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) {
        setSoldCount(BASE_DUMMY_SOLD + count);
      } else {
        setSoldCount(BASE_DUMMY_SOLD + 7);
      }
    };

    fetchTemplates();
    fetchSoldCount();
  }, []);

  const filteredTemplates = useMemo(
    () =>
      templates
        .filter((tpl) => tpl.is_active)
        .filter((tpl) => categoryFilter === 'All' || tpl.category === categoryFilter)
        .filter((tpl) => tpl.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [templates, searchTerm, categoryFilter],
  );

  const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  const displaySold = soldCount ?? (BASE_DUMMY_SOLD + 7);

  return (
    <div className="min-h-screen bg-[#F1E8DC] font-sans text-stone-800 selection:bg-[#E59A59] selection:text-white">

      {/* --- HERO SECTION: SPLIT LAYOUT KIRI - KANAN --- */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden border-b border-[#EBDFCE]/60">
        {/* Subtle decorative mesh backdrops */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#E59A59]/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-[#712E1E]/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            {/* SISI KIRI: Headline, Subtitle, CTA & Trust Points */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
              
              {/* Badge Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#EBDFCE] shadow-sm backdrop-blur-sm">
                <Sparkles size={14} className="text-[#E59A59]" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#712E1E]">
                  {t('home.badge')}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-[#712E1E] leading-[1.18] tracking-tight">
                {t('home.heroTitlePrefix')}{' '}
                <span className="text-[#E59A59] inline-block relative">
                  {t('home.heroTitleHighlight')}
                  <span className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-[#E59A59]/25 rounded-full" />
                </span>{' '}
                {t('home.heroTitleSuffix')}
              </h1>

              {/* Persuasive Description */}
              <p className="text-stone-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                {t('home.heroDesc')}
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-2">
                <a
                  href="#katalog"
                  className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#E59A59] text-white font-bold text-sm md:text-base hover:bg-[#d48b4b] shadow-lg shadow-[#E59A59]/25 transition duration-200 active:scale-95"
                >
                  <LayoutTemplate size={18} />
                  <span>{t('home.heroCtaCatalog')}</span>
                </a>
                <Link
                  to="/order"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#712E1E] font-bold text-sm md:text-base border border-[#EBDFCE] hover:bg-[#FAF6EE] hover:border-[#712E1E]/30 shadow-sm transition duration-200 active:scale-95"
                >
                  <span>{t('home.heroCtaOrder')}</span>
                  <ArrowRight size={16} className="text-[#E59A59]" />
                </Link>
              </div>

              {/* Social Proof & Rating Strip */}
              <div className="pt-4 border-t border-[#EBDFCE] w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Avatars */}
                <div className="flex items-center -space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#712E1E] text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">
                    RA
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#E59A59] text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">
                    DP
                  </div>
                  <div className="w-9 h-9 rounded-full bg-stone-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">
                    MR
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#FAF6EE] text-[#712E1E] border border-[#EBDFCE] font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                    +{displaySold}
                  </div>
                </div>

                {/* Rating & Review */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                    <span className="text-xs font-black text-[#712E1E] ml-1">4.9 / 5.0</span>
                  </div>
                  <p className="text-xs font-medium text-stone-500">
                    {t('home.heroRating', { count: displaySold })}
                  </p>
                </div>
              </div>

              {/* Key Trust Highlights */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-600 pt-1">
                <span className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-lg border border-[#EBDFCE]/80">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  {t('home.heroTrustInstant')}
                </span>
                <span className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-lg border border-[#EBDFCE]/80">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  {t('home.heroTrustMedia')}
                </span>
                <span className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-lg border border-[#EBDFCE]/80">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  {t('home.heroTrustRsvp')}
                </span>
              </div>

            </div>

            {/* SISI KANAN: Interactive Multi-Template Carousel Showcase */}
            <div 
              className="lg:col-span-5 relative mt-4 lg:mt-0 flex flex-col items-center"
              onMouseEnter={() => setIsCarouselHovered(true)}
              onMouseLeave={() => setIsCarouselHovered(false)}
            >
              
              {/* Phone Showcase Frame */}
              <div className="relative w-full max-w-[340px] sm:max-w-[360px] bg-white rounded-[36px] p-3.5 shadow-2xl border-4 border-white/90 ring-1 ring-stone-900/5 transition duration-300">
                
                {/* Smartphone Speaker Notch & Status Bar */}
                <div className="flex items-center justify-between px-3 mb-2">
                  <span className="text-[10px] font-bold text-stone-400 tracking-wider">
                    {currentSlide.category}
                  </span>
                  <div className="w-14 h-3 bg-stone-100 rounded-full flex items-center justify-center">
                    <div className="w-6 h-1 bg-stone-300 rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-[#E59A59] truncate max-w-[90px]">
                    {currentSlide.name}
                  </span>
                </div>

                {/* Inner Screen Card with Smooth Fade/Slide */}
                <div 
                  key={currentSlide.slug}
                  className="rounded-[28px] overflow-hidden bg-gradient-to-b from-[#FAF6EE] to-[#F1E8DC] border border-[#EBDFCE] p-4 text-center relative transition-all duration-500 animate-fade-in"
                >
                  
                  {/* Photo Preview Frame */}
                  <div className="relative h-44 rounded-2xl overflow-hidden mb-4 shadow-sm group">
                    <img
                      src={currentSlide.image}
                      alt={currentSlide.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent flex items-end justify-between p-2.5">
                      <span className="text-white text-[10px] font-bold tracking-widest uppercase bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                        {currentSlide.name}
                      </span>
                      <span className="text-white text-[9px] font-bold bg-[#E59A59] px-2 py-0.5 rounded-full">
                        {activeSlide + 1} / {SHOWCASE_SLIDES.length}
                      </span>
                    </div>
                  </div>

                  {/* Couple Name */}
                  <h3 className="text-xl sm:text-2xl font-black text-[#712E1E] tracking-tight mb-1">
                    {currentSlide.couple}
                  </h3>

                  {/* Wedding Date */}
                  <p className="text-xs font-semibold text-[#E59A59] mb-4 flex items-center justify-center gap-1.5">
                    <Calendar size={13} />
                    {currentSlide.date}
                  </p>

                  {/* Mini Countdown Timer */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-[#EBDFCE] mb-4">
                    <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1.5">
                      {t('home.mockupCountdownDays')}
                    </p>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="bg-[#FAF6EE] rounded-lg p-1 border border-[#EBDFCE]">
                        <span className="block text-sm font-black text-[#712E1E]">{currentSlide.days}</span>
                        <span className="text-[8px] text-stone-500 font-semibold">Hari</span>
                      </div>
                      <div className="bg-[#FAF6EE] rounded-lg p-1 border border-[#EBDFCE]">
                        <span className="block text-sm font-black text-[#712E1E]">{currentSlide.hours}</span>
                        <span className="text-[8px] text-stone-500 font-semibold">Jam</span>
                      </div>
                      <div className="bg-[#FAF6EE] rounded-lg p-1 border border-[#EBDFCE]">
                        <span className="block text-sm font-black text-[#712E1E]">{currentSlide.mins}</span>
                        <span className="text-[8px] text-stone-500 font-semibold">Mnt</span>
                      </div>
                      <div className="bg-[#FAF6EE] rounded-lg p-1 border border-[#EBDFCE]">
                        <span className="block text-sm font-black text-[#712E1E]">{currentSlide.secs}</span>
                        <span className="text-[8px] text-stone-500 font-semibold">Dtk</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Demo Link */}
                  <Link
                    to={`/demo/${currentSlide.slug}`}
                    className="w-full py-2.5 rounded-xl bg-[#712E1E] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#8E3B27] transition"
                  >
                    <Eye size={13} className="text-[#FFD5AF]" />
                    <span>Lihat Demo Template Ini</span>
                  </Link>
                </div>

              </div>

              {/* Carousel Dot Indicators */}
              <div className="flex items-center gap-2 mt-4 z-20">
                {SHOWCASE_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.slug}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Slide ${idx + 1}: ${slide.name}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeSlide === idx
                        ? 'w-7 bg-[#712E1E]'
                        : 'w-2 bg-[#EBDFCE] hover:bg-[#E59A59]'
                    }`}
                  />
                ))}
              </div>

              {/* Floating Card 1: Dynamic RSVP Status */}
              <div className="absolute -top-3 -right-2 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-[#EBDFCE] flex items-center gap-3 z-20 transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Users size={18} />
                </div>
                <div className="text-left pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-extrabold text-stone-800">
                      {currentSlide.rsvpCount} Tamu Hadir
                    </p>
                  </div>
                  <p className="text-[10px] font-medium text-stone-400">RSVP Terkonfirmasi</p>
                </div>
              </div>

              {/* Floating Card 2: Dynamic Audio Player */}
              <div className="absolute -bottom-4 -left-2 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-[#EBDFCE] flex items-center gap-3 z-20 transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-[#E59A59]/15 text-[#E59A59] flex items-center justify-center shrink-0 border border-[#E59A59]/20">
                  <Music size={18} />
                </div>
                <div className="text-left pr-1">
                  <p className="text-xs font-bold text-stone-800">{t('home.mockupMusicStatus')}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1 h-3 bg-[#E59A59] rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-[#E59A59] rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-[#E59A59] rounded-full animate-pulse delay-150" />
                    <span className="text-[10px] text-stone-500 font-bold ml-1 truncate max-w-[120px]">
                      {currentSlide.songTitle}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* --- SECTION: VALUE PILLARS (MENGAPA MEMILIH LOVERSE) --- */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-[#E59A59] bg-white px-3.5 py-1 rounded-full border border-[#EBDFCE]">
            Keunggulan Layanan
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#712E1E] mt-3">
            {t('home.aboutTitle')}
          </h2>
          <p className="mt-2 text-sm md:text-base text-stone-600 max-w-xl mx-auto">
            {t('home.aboutDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 max-w-7xl mx-auto">
          {featuresList.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl border border-[#EBDFCE] shadow-sm p-6 text-left hover:-translate-y-1.5 hover:shadow-md transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#F7EEE3] text-[#B4693F] flex items-center justify-center mb-5 border border-[#EBDFCE]/60">
                  <feature.icon size={22} />
                </div>
                <h3 className="text-base md:text-lg font-bold text-[#712E1E] mb-2 leading-snug">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-stone-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECTION: 3 LANGKAH MUDAH (HOW IT WORKS) --- */}
      <section className="bg-[#FAF6EE] py-14 md:py-20 border-y border-[#EBDFCE]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-[#E59A59] bg-white px-3.5 py-1 rounded-full border border-[#EBDFCE]">
              Alur Praktis
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#712E1E] mt-3">
              {t('home.stepsTitle')}
            </h2>
            <p className="mt-2 text-sm md:text-base text-stone-600 max-w-xl mx-auto">
              {t('home.stepsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {stepsList.map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-2xl border border-[#EBDFCE] p-7 text-left relative shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[#E59A59]/15 text-[#E59A59] flex items-center justify-center font-bold">
                    <step.icon size={20} />
                  </div>
                  <span className="text-2xl font-black text-[#EBDFCE] font-mono">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#712E1E] mb-2">{step.title}</h3>
                <p className="text-xs md:text-sm text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS STRIP --- */}
      <section className="bg-[#712E1E] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto text-center divide-x divide-white/10">
            <div className="px-2">
              <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl md:text-4xl font-black text-white">
                <ShoppingBag className="w-5 h-5 md:w-7 md:h-7 text-[#E59A59]" />
                <span>{displaySold}</span>
                <span className="text-[#E59A59] text-xl md:text-3xl">+</span>
              </div>
              <p className="mt-1 text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#FFD5AF]">
                {t('home.stats.sold')}
              </p>
            </div>

            <div className="px-2">
              <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl md:text-4xl font-black text-white">
                <LayoutTemplate className="w-5 h-5 md:w-7 md:h-7 text-[#E59A59]" />
                <span>{templates.filter((t) => t.is_active).length || MASTER_TEMPLATES.length}</span>
              </div>
              <p className="mt-1 text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#FFD5AF]">
                {t('home.stats.templates')}
              </p>
            </div>

            <div className="px-2">
              <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl md:text-4xl font-black text-white">
                <Star className="w-5 h-5 md:w-7 md:h-7 text-amber-400 fill-amber-400" />
                <span>4.9</span>
                <span className="text-xs md:text-base font-normal text-stone-300">/5</span>
              </div>
              <p className="mt-1 text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#FFD5AF]">
                {t('home.stats.rating')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- KATALOG TEMA --- */}
      <section id="katalog" className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24 scroll-mt-20">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-[#E59A59] bg-white px-3.5 py-1 rounded-full border border-[#EBDFCE]">
            Katalog Desain
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#712E1E] mt-3">
            {t('home.catalogTitle')}
          </h2>
          <p className="mt-2 text-sm md:text-base text-stone-600 max-w-xl mx-auto">
            {t('home.catalogDesc')}
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="max-w-3xl mx-auto mb-10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex items-center w-full group">
            <Search className="absolute left-4 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t('home.catalogSearchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-11 pr-12 rounded-xl bg-white border border-[#EBDFCE] outline-none text-[#712E1E] placeholder:text-stone-400 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 transition-all text-xs sm:text-sm font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 text-xs text-stone-400 hover:text-stone-600 font-bold"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex gap-1 rounded-xl border border-[#EBDFCE] bg-white p-1 shrink-0 self-start sm:self-auto">
            {(['All', 'Basic', 'RSVP'] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 h-9 rounded-lg text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-[#712E1E] text-white shadow-sm'
                    : 'text-stone-500 hover:bg-[#FAF6EE] hover:text-[#712E1E]'
                }`}
              >
                {cat === 'All' ? t('home.catalogCategoryAll') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mx-auto">
            <TemplateCardSkeleton count={8} />
          </div>
        ) : filteredTemplates.length > 0 ? (
          /* Grid Template Cards */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-6 lg:gap-7 mx-auto">
            {filteredTemplates.map((template) => (
              <div
                key={template.slug}
                className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl border border-[#EBDFCE] hover:border-[#E59A59]/40 flex flex-col items-start transition-all duration-300 h-full group"
              >
                {/* Gambar Cover (Klik langsung membuka demo tema) */}
                <Link
                  to={`/demo/${template.slug}`}
                  className="block w-full aspect-[4/3] bg-[#FAF6EE] rounded-xl sm:rounded-2xl mb-3 overflow-hidden relative group/img cursor-pointer"
                  title={`Lihat demo ${template.name}`}
                >
                  <SkeletonImage
                    src={template.image}
                    alt={template.name}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover group-hover/img:scale-105 group-hover:scale-105 transition duration-500"
                  />

                  {/* Kategori Badge */}
                  <div
                    className={`
                      absolute top-2.5 left-2.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-xs
                      ${template.category === 'RSVP'
                        ? 'bg-[#712E1E]/90 text-white'
                        : 'bg-white/95 text-[#712E1E] border border-[#EBDFCE]'}
                    `}
                  >
                    {template.category}
                  </div>
                </Link>

                {/* Nama & Harga */}
                <div className="w-full flex flex-col items-start mb-3 px-0.5">
                  <Link
                    to={`/demo/${template.slug}`}
                    className="text-[#712E1E] text-xs sm:text-sm md:text-base font-extrabold leading-snug line-clamp-1 text-left group-hover:text-[#E59A59] transition"
                  >
                    {template.name}
                  </Link>
                  <span className="text-xs sm:text-sm md:text-base font-black text-[#E59A59] mt-0.5">
                    {formatIDR(template.price)}
                  </span>
                </div>

                {/* Dua Tombol Aksi Bersih & Konsisten di Mobile & Desktop */}
                <div className="w-full mt-auto grid grid-cols-2 gap-1.5 sm:gap-2">
                  <Link
                    to={`/demo/${template.slug}`}
                    className="w-full py-2 sm:py-2.5 rounded-xl border border-[#EBDFCE] hover:border-[#E59A59] bg-[#FAF6EE] hover:bg-white text-[#712E1E] font-bold text-[11px] sm:text-xs md:text-sm transition flex items-center justify-center gap-1 sm:gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#E59A59] shrink-0" />
                    <span>{t('home.catalogPreviewShort')}</span>
                  </Link>

                  <Link
                    to={`/order?template=${template.slug}`}
                    className="w-full py-2 sm:py-2.5 rounded-xl bg-[#E59A59] hover:bg-[#d48b4b] text-white font-bold text-[11px] sm:text-xs md:text-sm transition flex items-center justify-center gap-1 sm:gap-1.5 shadow-xs active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t('home.catalogCreate')}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-stone-400 bg-white rounded-2xl border border-[#EBDFCE]">
            <p className="text-lg font-bold text-stone-600">{t('home.catalogEmpty')}</p>
            <p className="text-xs text-stone-400 mt-1">{t('home.catalogEmptySub')}</p>
          </div>
        )}
      </section>

      {/* --- SECTION: TESTIMONI --- */}
      <section className="bg-[#FAF6EE] py-14 md:py-20 border-t border-[#EBDFCE]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-[#E59A59] bg-white px-3.5 py-1 rounded-full border border-[#EBDFCE]">
              Testimoni
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#712E1E] mt-3">
              {t('home.testimonialsTitle')}
            </h2>
            <p className="mt-2 text-sm md:text-base text-stone-600 max-w-xl mx-auto">
              {t('home.testimonialsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
            {TESTIMONIALS.map((item) => (
              <figure
                key={item.name}
                className="bg-white rounded-2xl border border-[#EBDFCE] shadow-sm p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-xs md:text-sm text-stone-600 italic leading-relaxed">
                    "{item.message}"
                  </blockquote>
                </div>
                <figcaption className="mt-5 pt-4 border-t border-[#F3EBDF] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F7EEE3] text-[#B4693F] grid place-items-center font-bold text-xs shrink-0 border border-[#EBDFCE]">
                    {item.name.charAt(0)}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-bold text-xs md:text-sm text-stone-800 truncate">{item.name}</p>
                    <p className="text-[11px] text-stone-400 truncate">
                      {t('home.testimonialsBought', { template: item.template })}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION: FAQ ACCORDION --- */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="text-center mb-10 md:mb-12">
          <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-[#E59A59] bg-white px-3.5 py-1 rounded-full border border-[#EBDFCE]">
            Bantuan & Jawaban
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#712E1E] mt-3">
            {t('home.faqTitle')}
          </h2>
          <p className="mt-2 text-sm md:text-base text-stone-600 max-w-xl mx-auto">
            {t('home.faqDesc')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3.5">
          {faqList.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-[#EBDFCE] overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-bold text-sm md:text-base text-[#712E1E] flex items-center justify-between gap-4 hover:bg-[#FAF6EE] transition"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle size={18} className="text-[#E59A59] shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#712E1E]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-stone-600 leading-relaxed border-t border-[#FAF6EE]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --- BOTTOM CTA BANNER --- */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="bg-gradient-to-r from-[#712E1E] to-[#8E3B27] rounded-3xl p-8 sm:p-12 md:p-14 text-center text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {t('home.ctaBannerTitle')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#FFD5AF] leading-relaxed">
              {t('home.ctaBannerDesc')}
            </p>
            <div className="pt-3">
              <Link
                to="/order"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#E59A59] text-white font-bold text-sm md:text-base hover:bg-[#d48b4b] shadow-lg shadow-black/20 transition active:scale-95"
              >
                <span>{t('home.ctaBannerBtn')}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#712E1E] border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
          <p className="text-[#FFD5AF] font-bold text-sm flex items-center gap-1.5">
            <Heart size={15} fill="currentColor" /> LoVerse
          </p>
          <p className="text-[#FFD5AF]/70 text-xs font-medium">
            {t('home.footerText', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>

    </div>
  );
}
