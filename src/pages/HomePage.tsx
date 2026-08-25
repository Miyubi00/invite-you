// ============================================================
// src/pages/HomePage.tsx
// ------------------------------------------------------------
// Halaman utama (/) - landing marketing LoVerse: hero, fitur, statistik terjual (real count), testimoni, katalog tema + filter.
// Dipakai di  : App.tsx
// Keterikatan : lib/constants (katalog), lib/supabaseClient (statistik), types/database
// ============================================================

// Halaman utama LoVerse: hero, penjelasan fitur, statistik terjual (real count),
// testimoni, dan katalog tema dengan pencarian + filter kategori.
// Palet mengikuti design system dashboard (terracotta/cream).

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { MASTER_TEMPLATES, TESTIMONIALS } from '../lib/constants';
import { TemplateCardSkeleton } from '../components/ui/SkeletonLoaders';
import { SkeletonImage } from '../components/ui/SkeletonImage';
import type { TemplateRow } from '../types/database';
import {
  Search, Eye, Edit3, Sparkles, MessageSquare,
  Wallet, Star, ShoppingBag, LayoutTemplate, ChevronDown, Heart,
} from 'lucide-react';

type CategoryFilter = 'All' | 'Basic' | 'RSVP';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Desain Premium',
    desc: '26+ tema pilihan bergaya modern, elegan, hingga unik — semuanya dibuat oleh desainer.',
  },
  {
    icon: MessageSquare,
    title: 'RSVP & Buku Tamu Realtime',
    desc: 'Konfirmasi kehadiran tamu masuk langsung ke dashboard, lengkap dengan export Excel.',
  },
  {
    icon: Edit3,
    title: 'Edit Mandiri 24 Jam',
    desc: 'Ganti foto, musik, lokasi, dan cerita kapan saja lewat dashboard tanpa perlu coding.',
  },
  {
    icon: Wallet,
    title: 'Harga Bersahabat',
    desc: 'Mulai Rp60 ribu sekali bayar — aktif sampai hari-H, tanpa biaya bulanan tersembunyi.',
  },
];

export default function Landing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [templates, setTemplates] = useState<Array<TemplateRow & { image: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [soldCount, setSoldCount] = useState<number | null>(null);

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
            const localTemplate = MASTER_TEMPLATES.find(t => t.slug === dbItem.slug);
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
      // Hitung lewat VIEW publik (RLS membatasi akses langsung ke tabel orders).
      const { count, error } = await supabase
        .from('public_invitations')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) setSoldCount(count);
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

  return (
    <div className="min-h-screen bg-[#F1E8DC] font-sans text-stone-800 pb-0">

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#E59A59]/10" />
          <div className="absolute top-32 -right-20 w-80 h-80 rounded-full bg-[#712E1E]/5" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-24 pb-10 md:pb-16 text-center relative">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-[#EBDFCE] shadow-sm text-[11px] md:text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-5">
            <Heart size={12} className="text-[#E59A59]" />
            Undangan Digital Pernikahan
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 leading-tight text-[#712E1E]">
            Bagikan Momen Bahagiamu <br className="hidden md:block" />
            dengan <span className="text-[#E59A59]">Undangan Digital</span> Elegan
          </h1>

          <p className="text-stone-600 mb-8 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            LoVerse membantu kamu membuat undangan pernikahan digital yang cantik,
            lengkap dengan RSVP & buku tamu — dalam hitungan menit, mulai Rp10 ribu.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="#katalog"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#E59A59] text-white font-bold text-sm md:text-base hover:bg-[#d48b4b] transition shadow-md active:scale-95"
            >
              <LayoutTemplate size={18} />
              Lihat Koleksi Tema
            </a>
            <Link
              to="/order"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#712E1E] font-bold text-sm md:text-base border border-[#EBDFCE] hover:bg-[#FAF6EE] transition shadow-sm active:scale-95"
            >
              Buat Sekarang
              <ChevronDown size={16} className="rotate-[-90deg]" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- SECTION: APA ITU LOVEVERSE --- */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#712E1E]">Apa itu LoVerse?</h2>
          <p className="mt-2 text-sm md:text-base text-stone-600 max-w-xl mx-auto">
            Platform undangan digital all-in-one: pilih tema, isi data, selesaikan pembayaran — undangan langsung aktif.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl border border-[#EBDFCE] shadow-sm p-6 text-left hover:-translate-y-1 hover:shadow-md transition duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F7EEE3] text-[#B4693F] grid place-items-center mb-4">
                <feature.icon size={22} />
              </div>
              <h3 className="font-bold text-[#712E1E] mb-1.5">{feature.title}</h3>
              <p className="text-xs md:text-sm text-stone-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS STRIP --- */}
      <section className="bg-[#712E1E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto text-center text-[#FFD5AF]">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-2xl md:text-4xl font-black text-white">
                <ShoppingBag className="w-5 h-5 md:w-7 md:h-7 text-[#E59A59]" />
                {loading || soldCount === null ? '500+' : soldCount}
                <span className="text-base md:text-2xl">+</span>
              </div>
              <p className="mt-1 text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-90">
                Undangan Terjual
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-2xl md:text-4xl font-black text-white">
                <LayoutTemplate className="w-5 h-5 md:w-7 md:h-7 text-[#E59A59]" />
                {templates.filter(t => t.is_active).length || MASTER_TEMPLATES.length}
              </div>
              <p className="mt-1 text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-90">
                Pilihan Tema
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-2xl md:text-4xl font-black text-white">
                <Star className="w-5 h-5 md:w-7 md:h-7 text-[#E59A59]" fill="currentColor" />
                4.9
                <span className="text-base md:text-2xl">/5</span>
              </div>
              <p className="mt-1 text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-90">
                Rating Pelanggan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION: TESTIMONI --- */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#712E1E]">Kata Mereka</h2>
          <p className="mt-2 text-sm md:text-base text-stone-600">
            Cerita pasangan yang sudah memakai LoVerse di hari bahagianya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="bg-white rounded-2xl border border-[#EBDFCE] shadow-sm p-6 flex flex-col"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
              <blockquote className="text-sm text-stone-600 italic leading-relaxed flex-1">
                "{item.message}"
              </blockquote>
              <figcaption className="mt-4 pt-4 border-t border-[#F3EBDF] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F7EEE3] text-[#B4693F] grid place-items-center font-bold text-sm shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-stone-800 truncate">{item.name}</p>
                  <p className="text-[11px] text-stone-400 truncate">Membeli: {item.template}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* --- KATALOG TEMA --- */}
      <section id="katalog" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24 scroll-mt-20">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#712E1E]">Pilih Tema Favoritmu</h2>
          <p className="mt-2 text-sm md:text-base text-stone-600">
            Cari desain yang cocok, preview dulu, lalu buat undanganmu.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="max-w-3xl mx-auto mb-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex items-center w-full group">
            <Search className="absolute left-5 w-5 h-5 text-stone-400 hidden sm:block pointer-events-none" />
            <input
              type="text"
              placeholder="Cari desain impianmu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-6 sm:pl-12 pr-14 rounded-xl shadow-sm bg-white border border-[#EBDFCE] outline-none text-[#712E1E] placeholder:text-stone-400 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 transition-all text-sm sm:text-base"
            />
            <button
              type="button"
              aria-label="Cari"
              className="absolute right-1.5 bg-[#E59A59] h-9 w-9 rounded-lg text-white hover:bg-[#d48b4b] transition-all flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-1.5 rounded-xl border border-[#EBDFCE] bg-white p-1.5 shrink-0 self-start sm:self-auto">
            {(['All', 'Basic', 'RSVP'] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 h-9 rounded-lg text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-[#712E1E] text-white shadow-sm'
                    : 'text-stone-500 hover:bg-[#FAF6EE] hover:text-[#712E1E]'
                }`}
              >
                {cat === 'All' ? 'Semua' : cat}
              </button>
            ))}
          </div>
        </div>

                {/* Loading / Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 mx-auto">
            <TemplateCardSkeleton count={8} />
          </div>
        ) : filteredTemplates.length > 0 ? (
          /* Grid Template */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 mx-auto">
            {filteredTemplates.map((template) => (
              <div
                key={template.slug}
                className="bg-white p-2.5 md:p-4 rounded-2xl md:rounded-[2rem] shadow-sm border border-[#EBDFCE] flex flex-col items-start transition-all hover:-translate-y-1 hover:shadow-md duration-300 h-full"
              >
                {/* Gambar Cover */}
                <div className="w-full aspect-[4/3] bg-[#FAF6EE] rounded-xl md:rounded-2xl mb-3 md:mb-4 overflow-hidden relative group">
                                    <SkeletonImage
                    src={template.image}
                    alt={template.name}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div
                    className={`
                      absolute top-2 left-2 md:top-3 md:left-3 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm
                      ${template.category === 'RSVP'
                        ? 'bg-[#712E1E] text-white'
                        : 'bg-[#F7EEE3] text-[#712E1E] border border-[#EBDFCE]'}
                    `}
                  >
                    {template.category}
                  </div>
                </div>

                {/* Nama & Harga */}
                <div className="w-full flex flex-col items-start mb-2 md:mb-4 px-1 gap-0.5 md:gap-0">
                  <h3 className="text-[#712E1E] text-sm md:text-lg font-bold leading-tight line-clamp-2 text-left">
                    {template.name}
                  </h3>
                  <span className="text-sm md:text-lg font-bold text-[#E59A59]">
                    {formatIDR(template.price)}
                  </span>
                </div>

                {/* Tombol Action */}
                <div className="flex gap-2 md:gap-3 w-full mt-auto">
                  <Link
                    to={`/demo/${template.slug}`}
                    className="flex-1 py-1.5 md:py-2.5 rounded-lg md:rounded-xl border md:border-2 border-[#E59A59] text-[#E59A59] font-bold text-xs md:text-sm hover:bg-[#FAF6EE] transition flex justify-center items-center gap-1 md:gap-2"
                  >
                    <Eye className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden xs:inline">Preview</span>
                    <span className="inline xs:hidden">Lihat</span>
                  </Link>

                  <Link
                    to={`/order?template=${template.slug}`}
                    className="flex-1 py-1.5 md:py-2.5 rounded-lg md:rounded-xl bg-[#E59A59] text-white font-bold text-xs md:text-sm hover:bg-[#d48b4b] hover:shadow-md transition flex justify-center items-center gap-1 md:gap-2"
                  >
                    <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                    Buat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-stone-400">
            <p className="text-xl font-bold">Tidak ada template yang cocok.</p>
            <p className="text-sm">Coba kata kunci atau kategori lain.</p>
          </div>
        )}
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#712E1E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <p className="text-[#FFD5AF] font-bold flex items-center gap-1.5">
            <Heart size={14} fill="currentColor" /> LoVerse
          </p>
          <p className="text-[#FFD5AF]/70 text-xs">
            © {new Date().getFullYear()} LoVerse — Undangan Digital Pernikahan.
          </p>
        </div>
      </footer>
    </div>
  );
}
