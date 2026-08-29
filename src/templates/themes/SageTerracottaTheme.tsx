// ============================================================
// src/templates/themes/SageTerracottaTheme.tsx
// ------------------------------------------------------------
// Tema Undangan: Sage Terracotta (Kategori: RSVP)
// Konsep       : Wabi-Sabi Earthy Minimal — linen, sage, terracotta
// Referensi    : 2025-2026 Pinterest / Editorial Wedding Trends
//              : arched frames, soft linen texture, warm earth palette,
//              : editorial serif + clean sans. Fully responsive.
// Dipakai di   : templates/Registry.ts
// Keterikatan  : types/template, utils/templateHelpers, hooks/*
// ============================================================

import { useState, useRef } from 'react';
import {
  MapPin,
  Clock,
  Calendar,
  Heart,
  Gift,
  Copy,
  Check,
  Play,
  Pause,
  Music,
  Sparkles,
  ExternalLink,
  X,
  Send,
  MessageCircle,
  CheckCircle2,
  Leaf,
  Sun,
} from 'lucide-react';
import type { TemplateProps, RsvpPayload } from '../../types/template';
import type { RsvpRow, RsvpStatus } from '../../types/database';
import { useCountdown } from '../../hooks/useCountdown';
import {
  formatDate,
  resolveBanks,
  resolveGallery,
  resolvePhotos,
  resolveVenue,
  resolveSchedule,
} from '../../utils/templateHelpers';
import { useOpenInvitation } from '../shared/useOpenInvitation';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

export default function SageTerracottaTheme({
  groom,
  bride,
  date,
  guestName,
  orderId,
  onRsvpSubmit,
  submittedData,
  data,
}: TemplateProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const copyToClipboard = useCopyToClipboard();

  const { isOpen, open, playing: isPlaying, toggle: toggleAudio } = useOpenInvitation(audioRef, 600);

  // ---- resolve data (ngikutin semua variabel tema lain) ----
  const photos = resolvePhotos(data);
  const gallery = resolveGallery(data);
  const banks = resolveBanks(data);
  const venue = resolveVenue(data);
  const schedule = resolveSchedule(data, date);

  const coverPhoto = data?.cover_photo || photos.cover;
  const audioUrl = data?.audio_url || 'https://r2.loverse.my.id/defaults/audio/ee2e74c72c.mp3';

  const groomParents = data?.groom_parents || 'Putra dari Bpk. Hartono & Ibu Siti';
  const brideParents = data?.bride_parents || 'Putri dari Bpk. Wijaya & Ibu Dewi';

  const quote =
    data?.quote ||
    'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri agar kamu cenderung dan merasa tenteram kepadanya.';
  const quoteSrc = data?.quote_src || 'QS. Ar-Rum: 21';

  const formattedDate = formatDate(date, 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedAkadDate = schedule.akadDate
    ? formatDate(schedule.akadDate, 'id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : formattedDate;
  const formattedResepsiDate = schedule.resepsiDate
    ? formatDate(schedule.resepsiDate, 'id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : formattedDate;

  const akadClock = (schedule.akadTime || '08:00').split(' ')[0].substring(0, 5);
  const timeLeft = useCountdown(date, akadClock);

  // ---- local UI state ----
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // RSVP state (persist via parent if provided)
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(submittedData?.status || 'hadir');
  const [rsvpPax, setRsvpPax] = useState<number>(submittedData?.pax || 1);
  const [rsvpName, setRsvpName] = useState<string>(submittedData?.guest_name || guestName || '');
  const [rsvpMessage, setRsvpMessage] = useState<string>(submittedData?.message || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(Boolean(submittedData));
  const [wishesList, setWishesList] = useState<RsvpRow[]>(() => data?.rsvps || []);

  const handleCopy = (num: string, bank: string, idx: number) => {
    copyToClipboard(num, `Nomor Rekening ${bank}`);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSendRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;
    setIsSubmitting(true);
    const payload: RsvpPayload = {
      status: rsvpStatus,
      pax: Number(rsvpPax),
      message: rsvpMessage.trim(),
    };
    try {
      if (onRsvpSubmit) await onRsvpSubmit(payload);
      if (rsvpMessage.trim()) {
        const newWish: RsvpRow = {
          id: String(Date.now()),
          order_id: orderId || 'demo',
          session_id: 'local',
          guest_name: rsvpName.trim(),
          status: rsvpStatus,
          pax: Number(rsvpPax),
          message: rsvpMessage.trim(),
          created_at: new Date().toISOString(),
        };
        setWishesList((prev) => [newWish, ...prev]);
      }
      setRsvpSuccess(true);
    } catch (err) {
      console.error('[SageTerracotta] RSVP gagal', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F3EE] text-[#2E2B29] relative overflow-x-hidden selection:bg-[#C86B43]/20 selection:text-[#2E2B29]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        .font-display { font-family: 'Instrument Serif', serif; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans-sage { font-family: 'Plus Jakarta Sans', sans-serif; }
        .arch { border-top-left-radius: 9999px; border-top-right-radius: 9999px; }
        .arch-soft { border-radius: 32px 32px 16px 16px; }
        .linen {
          background-image:
            radial-gradient(at 20% 30%, rgba(200,107,67,0.08) 0, transparent 50%),
            radial-gradient(at 80% 70%, rgba(122,143,125,0.12) 0, transparent 50%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        @keyframes float { 0%,100% { transform: translateY(0)} 50% { transform: translateY(-8px)}}
        .float { animation: float 6s ease-in-out infinite; }
        /* hide scrollbar for horizontal gallery */
        .no-scrollbar::-webkit-scrollbar{ display:none } .no-scrollbar{ -ms-overflow-style:none; scrollbar-width:none }
      `}</style>

      <audio ref={audioRef} src={audioUrl} loop preload="auto" />

      {/* ================= COVER / ENVELOPE ================= */}
      <div
        className={`fixed inset-0 z-50 flex flex-col lg:flex-row bg-[#F8F3EE] transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Left / Top image — 52% on desktop, 46vh on mobile */}
        <div className="relative h-[46vh] lg:h-full w-full lg:w-[52%] overflow-hidden bg-[#E9DDD1] shrink-0">
          <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          {/* soft gradient + sage tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2E2B29]/50 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[#7A8F7D]/10 mix-blend-multiply" />

          {/* floating badge on image - desktop only */}
          <div className="hidden lg:flex absolute top-8 left-8 items-center gap-2 px-3.5 py-2 rounded-full bg-white/85 backdrop-blur-md border border-[#E9DDD1] shadow-sm font-sans-sage text-[11px] font-semibold tracking-widest uppercase text-[#7A8F7D]">
            <Leaf size={14} className="text-[#C86B43]" /> Est. 2026
          </div>

          {/* mobile arch mask overlap */}
          <div className="lg:hidden absolute -bottom-1 left-0 right-0 h-10 bg-[#F8F3EE] rounded-t-[32px]" />
        </div>

        {/* Right / Bottom content */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 lg:px-12 py-6 lg:py-12 text-center relative linen overflow-y-auto no-scrollbar">
          {/* corner ornaments */}
          <div className="hidden lg:block absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-[#C86B43]/20 rounded-tr-3xl pointer-events-none" />
          <div className="hidden lg:block absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-[#7A8F7D]/20 rounded-bl-3xl pointer-events-none" />

          <p className="font-sans-sage text-[11px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-[#7A8F7D] flex items-center gap-2">
            <span className="hidden sm:inline-block w-8 h-px bg-[#C86B43]/30" />
            Undangan Pernikahan
            <span className="hidden sm:inline-block w-8 h-px bg-[#C86B43]/30" />
          </p>

          <h1 className="mt-3 font-display text-[40px] sm:text-[52px] lg:text-[56px] leading-[0.9] text-[#2E2B29]">
            {groom}
            <span className="block font-serif italic font-normal text-[28px] sm:text-[36px] text-[#C86B43] my-1">&</span>
            {bride}
          </h1>

          <p className="mt-3 font-sans-sage text-xs sm:text-sm tracking-[0.18em] uppercase text-[#2E2B29]/60">
            {formattedDate}
          </p>

          {/* divider leaf */}
          <div className="flex items-center gap-3 my-5 lg:my-6 text-[#C86B43]/40">
            <span className="w-10 h-px bg-[#C86B43]/30" />
            <Leaf size={16} className="text-[#7A8F7D]" />
            <span className="w-10 h-px bg-[#C86B43]/30" />
          </div>

          {/* guest card */}
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E9DDD1] shadow-[0_8px_32px_rgba(46,43,41,0.08)] p-4 sm:p-5">
            <p className="font-sans-sage text-[11px] tracking-[0.18em] uppercase text-[#7A8F7D]">Kepada Yth.</p>
            <p className="mt-1 font-display text-xl sm:text-2xl text-[#2E2B29] truncate">
              {guestName || 'Tamu Undangan'}
            </p>
            <p className="mt-1 font-sans-sage text-xs text-[#2E2B29]/55">
              Kami mengundang dengan penuh kasih untuk hadir di hari bahagia kami
            </p>
          </div>

          <button
            onClick={open}
            className="mt-5 lg:mt-6 group w-full max-w-sm inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full bg-[#C86B43] text-white font-sans-sage font-bold text-sm tracking-wide shadow-[0_8px_24px_rgba(200,107,67,0.25)] hover:bg-[#B85E36] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Heart size={16} className="group-hover:scale-110 transition" />
            Buka Undangan
          </button>

          <p className="mt-3 font-sans-sage text-[11px] text-[#2E2B29]/40 flex items-center gap-1.5">
            <Music size={12} /> Musik akan diputar otomatis
          </p>
        </div>
      </div>

      {/* ================= FLOATING AUDIO ================= */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={toggleAudio}
          aria-label={isPlaying ? 'Jeda musik' : 'Putar musik'}
          title={isPlaying ? 'Jeda musik' : 'Putar musik'}
          className="w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-full bg-white border border-[#E9DDD1] shadow-[0_8px_24px_rgba(46,43,41,0.12)] flex items-center justify-center text-[#C86B43] hover:shadow-lg hover:border-[#C86B43]/30 active:scale-95 transition cursor-pointer relative overflow-hidden"
        >
          <span className={`absolute inset-0 rounded-full border-2 border-[#C86B43]/20 ${isPlaying ? 'animate-ping' : 'hidden'}`} />
          {isPlaying ? <Pause size={18} className="relative" /> : <Play size={18} className="translate-x-0.5 relative" />}
        </button>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <main className="relative w-full max-w-[880px] mx-auto px-4 sm:px-6 lg:px-0">
        {/* subtle side linen border on desktop */}
        <div className="hidden lg:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-1/2 w-[880px] border-x border-[#E9DDD1]/70" />

        {/* ---------- HERO ---------- */}
        <section className="pt-6 sm:pt-10 pb-8 text-center">
          {/* hero arch image */}
          <div className="relative mx-auto w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9] overflow-hidden arch bg-[#E9DDD1] p-1.5 sm:p-2 shadow-[0_16px_40px_rgba(46,43,41,0.10)]">
            <div className="w-full h-full overflow-hidden arch bg-white">
              <img src={coverPhoto} alt="Hero" className="w-full h-full object-cover hover:scale-[1.02] transition duration-[1.2s]" />
            </div>
            {/* label */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-white/60 rounded-full px-4 py-2 shadow-md flex items-center gap-2 font-sans-sage text-[11px] font-semibold tracking-widest uppercase text-[#7A8F7D] whitespace-nowrap">
              <Sun size={14} className="text-[#C86B43]" /> Save The Date — {formattedDate}
            </div>
          </div>

          <div className="mt-8 sm:mt-10 space-y-3">
            <p className="font-serif italic text-base sm:text-lg text-[#7A8F7D]">Together with our families</p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-[56px] leading-none text-[#2E2B29]">
              {groom} <span className="font-serif italic text-3xl sm:text-4xl text-[#C86B43] font-normal">&</span> {bride}
            </h2>
            <p className="font-sans-sage text-xs sm:text-sm tracking-[0.22em] uppercase text-[#2E2B29]/55">
              Mengundang kehadiran Anda di hari bahagia kami
            </p>
          </div>

          {/* Countdown — 4 glass cards */}
          <div className="mt-8 max-w-[560px] mx-auto bg-white rounded-3xl border border-[#E9DDD1] shadow-[0_12px_32px_rgba(46,43,41,0.08)] p-4 sm:p-6">
            <p className="font-sans-sage text-[11px] font-bold tracking-[0.24em] uppercase text-[#7A8F7D] flex items-center justify-center gap-2">
              <Clock size={14} className="text-[#C86B43]" /> Menuju Hari Bahagia
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { v: timeLeft.days, l: 'Hari' },
                { v: timeLeft.hours, l: 'Jam' },
                { v: timeLeft.minutes, l: 'Menit' },
                { v: timeLeft.seconds, l: 'Detik' },
              ].map((c) => (
                <div
                  key={c.l}
                  className="rounded-2xl bg-[#F8F3EE] border border-[#E9DDD1] p-2.5 sm:p-4 text-center"
                >
                  <span className="block font-display text-2xl sm:text-3xl leading-none text-[#2E2B29]">{String(c.v).padStart(2, '0')}</span>
                  <span className="block mt-1 font-sans-sage text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#7A8F7D]">
                    {c.l}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- QUOTE ---------- */}
        <section className="py-6 sm:py-8">
          <div className="relative bg-[#7A8F7D] rounded-[28px] sm:rounded-[32px] p-[1.5px] shadow-[0_12px_32px_rgba(122,143,125,0.18)]">
            <div className="rounded-[26px] sm:rounded-[30px] bg-[#FFFBF7] px-6 sm:px-10 py-8 sm:py-10 text-center relative overflow-hidden linen">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-[#C86B43] to-transparent opacity-60" />
              <div className="w-12 h-12 mx-auto rounded-full bg-[#F0E6DA] border border-[#E9DDD1] flex items-center justify-center text-[#C86B43] mb-4">
                <Heart size={18} className="fill-[#C86B43]/20" />
              </div>
              <p className="font-serif italic text-[15px] sm:text-lg leading-relaxed text-[#2E2B29] max-w-[560px] mx-auto">
                “{quote}”
              </p>
              <p className="mt-4 font-sans-sage text-xs font-bold tracking-widest uppercase text-[#7A8F7D]">— {quoteSrc}</p>
            </div>
          </div>
        </section>

        {/* ---------- COUPLE ---------- */}
        <section className="py-6 sm:py-10 text-center">
          <div className="space-y-2">
            <p className="font-sans-sage text-[11px] font-bold tracking-[0.28em] uppercase text-[#C86B43] flex items-center justify-center gap-2">
              <span className="w-6 h-px bg-[#C86B43]/30" /> Mempelai <span className="w-6 h-px bg-[#C86B43]/30" />
            </p>
            <h3 className="font-display text-3xl sm:text-4xl text-[#2E2B29]">Dua Hati, Satu Janji</h3>
            <p className="font-serif italic text-sm sm:text-base text-[#2E2B29]/60 max-w-md mx-auto">
              Dengan memohon rahmat & ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
            {/* Groom */}
            <div className="group bg-white rounded-[28px] border border-[#E9DDD1] p-5 sm:p-6 flex flex-col items-center shadow-[0_8px_24px_rgba(46,43,41,0.06)] hover:shadow-[0_12px_32px_rgba(46,43,41,0.10)] hover:border-[#C86B43]/20 transition">
              <div className="relative w-[200px] h-[250px] sm:w-[220px] sm:h-[280px] arch overflow-hidden p-1.5 bg-gradient-to-b from-[#C86B43]/60 via-[#E9DDD1] to-transparent shadow-md">
                <div className="w-full h-full arch overflow-hidden bg-[#E9DDD1]">
                  <img src={photos.groom} alt={groom} className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-700" />
                </div>
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#7A8F7D] text-white font-sans-sage text-[10px] font-bold tracking-widest uppercase shadow">
                  Mempelai Pria
                </span>
              </div>
              <h4 className="mt-7 font-display text-2xl sm:text-[26px] text-[#2E2B29]">{groom}</h4>
              <p className="mt-2 font-sans-sage text-xs leading-relaxed text-[#2E2B29]/60 text-center max-w-[240px]">
                Putra tercinta dari
                <br />
                <span className="font-semibold text-[#2E2B29]">{groomParents}</span>
              </p>
            </div>

            {/* Bride */}
            <div className="group bg-white rounded-[28px] border border-[#E9DDD1] p-5 sm:p-6 flex flex-col items-center shadow-[0_8px_24px_rgba(46,43,41,0.06)] hover:shadow-[0_12px_32px_rgba(46,43,41,0.10)] hover:border-[#7A8F7D]/20 transition">
              <div className="relative w-[200px] h-[250px] sm:w-[220px] sm:h-[280px] arch overflow-hidden p-1.5 bg-gradient-to-b from-[#7A8F7D]/60 via-[#E9DDD1] to-transparent shadow-md">
                <div className="w-full h-full arch overflow-hidden bg-[#E9DDD1]">
                  <img src={photos.bride} alt={bride} className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-700" />
                </div>
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#C86B43] text-white font-sans-sage text-[10px] font-bold tracking-widest uppercase shadow">
                  Mempelai Wanita
                </span>
              </div>
              <h4 className="mt-7 font-display text-2xl sm:text-[26px] text-[#2E2B29]">{bride}</h4>
              <p className="mt-2 font-sans-sage text-xs leading-relaxed text-[#2E2B29]/60 text-center max-w-[240px]">
                Putri tercinta dari
                <br />
                <span className="font-semibold text-[#2E2B29]">{brideParents}</span>
              </p>
            </div>
          </div>

          {/* ampersand divider */}
          <div className="hidden md:flex relative -mt-4 justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-[#F8F3EE] border border-[#E9DDD1] flex items-center justify-center font-display text-xl text-[#C86B43] shadow-sm">
              &
            </div>
          </div>
        </section>

        {/* ---------- SCHEDULE ---------- */}
        <section className="py-6 sm:py-8">
          <div className="text-center space-y-2 mb-6">
            <h3 className="font-display text-3xl sm:text-4xl text-[#2E2B29]">Rangkaian Acara</h3>
            <p className="font-serif italic text-sm text-[#2E2B29]/60">Waktu & tempat pelaksanaan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Akad */}
            <div className="bg-white rounded-3xl border border-[#E9DDD1] overflow-hidden shadow-[0_8px_24px_rgba(46,43,41,0.06)]">
              <div className="h-1.5 w-full bg-[#C86B43]" />
              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FDF0E7] border border-[#C86B43]/15 text-[#C86B43] font-sans-sage text-xs font-bold">
                    <Sparkles size={14} /> Akad Nikah
                  </span>
                  <span className="w-8 h-8 rounded-full bg-[#F8F3EE] border border-[#E9DDD1] flex items-center justify-center text-[#C86B43]">
                    <Heart size={14} />
                  </span>
                </div>
                <div className="space-y-3 font-sans-sage text-sm">
                  <div className="flex gap-3">
                    <Calendar size={18} className="text-[#C86B43] shrink-0 mt-0.5" />
                    <span className="font-semibold text-[#2E2B29]">{formattedAkadDate}</span>
                  </div>
                  <div className="flex gap-3">
                    <Clock size={18} className="text-[#C86B43] shrink-0 mt-0.5" />
                    <span className="text-[#2E2B29]/80">{schedule.akadTime}</span>
                  </div>
                  <div className="flex gap-3">
                    <MapPin size={18} className="text-[#C86B43] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#2E2B29]">{venue.name}</p>
                      <p className="text-xs text-[#2E2B29]/60 mt-0.5">{venue.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resepsi */}
            <div className="bg-[#7A8F7D] rounded-3xl overflow-hidden shadow-[0_12px_32px_rgba(122,143,125,0.25)] text-white">
              <div className="h-1.5 w-full bg-white/20" />
              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#7A8F7D] font-sans-sage text-xs font-bold">
                    <Leaf size={14} /> Resepsi
                  </span>
                  <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                    <Sparkles size={14} />
                  </span>
                </div>
                <div className="space-y-3 font-sans-sage text-sm">
                  <div className="flex gap-3">
                    <Calendar size={18} className="text-white/80 shrink-0 mt-0.5" />
                    <span className="font-semibold">{formattedResepsiDate}</span>
                  </div>
                  <div className="flex gap-3">
                    <Clock size={18} className="text-white/80 shrink-0 mt-0.5" />
                    <span className="text-white/90">{schedule.resepsiTime}</span>
                  </div>
                  <div className="flex gap-3">
                    <MapPin size={18} className="text-white/80 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{venue.name}</p>
                      <p className="text-xs text-white/70 mt-0.5">{venue.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Maps */}
          {venue.mapsLink && venue.mapsLink !== '#' && (
            <div className="mt-5 flex justify-center">
              <a
                href={venue.mapsLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#2E2B29] text-white font-sans-sage font-semibold text-sm shadow-[0_8px_24px_rgba(46,43,41,0.18)] hover:bg-black active:scale-[0.98] transition"
              >
                <MapPin size={16} /> Petunjuk Arah Google Maps <ExternalLink size={14} className="opacity-60" />
              </a>
            </div>
          )}
        </section>

        {/* ---------- GALLERY ---------- */}
        {gallery.length > 0 && (
          <section className="py-6 sm:py-8">
            <div className="text-center space-y-2 mb-6">
              <h3 className="font-display text-3xl sm:text-4xl text-[#2E2B29]">Galeri Bahagia</h3>
              <p className="font-serif italic text-sm text-[#2E2B29]/60">Kisah kami dalam bingkai</p>
            </div>

            {/* masonry-like: first image spans 2 cols on desktop, all responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {gallery.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(url)}
                  className={`group relative overflow-hidden cursor-pointer bg-[#E9DDD1] border border-[#E9DDD1] shadow-sm hover:shadow-md transition
                    ${idx === 0 ? 'col-span-2 sm:col-span-2 sm:row-span-2 aspect-[4/3] sm:aspect-square' : 'aspect-[4/5] sm:aspect-square'}
                    ${idx % 3 === 0 ? 'rounded-[24px]' : idx % 3 === 1 ? 'rounded-2xl' : 'rounded-[20px]'}
                  `}
                >
                  <img
                    src={url}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2E2B29]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center p-3">
                    <span className="text-xs font-semibold text-white flex items-center gap-1">
                      <Sparkles size={12} /> Lihat
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Lightbox */}
        {activeImage && (
          <div onClick={() => setActiveImage(null)} className="fixed inset-0 z-50 bg-[#1A1816]/90 backdrop-blur-md flex items-center justify-center p-4">
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition cursor-pointer"
              aria-label="Tutup"
            >
              <X size={20} />
            </button>
            <img src={activeImage} alt="Preview" className="max-w-full max-h-[86vh] rounded-2xl object-contain shadow-2xl border border-white/10" />
          </div>
        )}

        {/* ---------- RSVP ---------- */}
        <section className="py-6 sm:py-8">
          <div className="text-center space-y-2 mb-6">
            <h3 className="font-display text-3xl sm:text-4xl text-[#2E2B29]">Konfirmasi & Doa</h3>
            <p className="font-serif italic text-sm text-[#2E2B29]/60">Kehadiran & doa restu Anda sangat berarti</p>
          </div>

          <div className="bg-white rounded-[28px] border border-[#E9DDD1] shadow-[0_12px_32px_rgba(46,43,41,0.08)] p-5 sm:p-7 space-y-6">
            <form onSubmit={handleSendRsvp} className="space-y-4">
              <div>
                <label className="block font-sans-sage text-xs font-semibold tracking-widest uppercase text-[#7A8F7D] mb-1.5">
                  Nama Anda
                </label>
                <input
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Tulis nama lengkap..."
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F3EE] border border-[#E9DDD1] text-sm text-[#2E2B29] placeholder:text-[#2E2B29]/40 focus:outline-none focus:border-[#C86B43]/40 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans-sage text-xs font-semibold tracking-widest uppercase text-[#7A8F7D] mb-1.5">
                    Kehadiran
                  </label>
                  <select
                    value={rsvpStatus}
                    onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F3EE] border border-[#E9DDD1] text-sm text-[#2E2B29] focus:outline-none focus:border-[#C86B43]/40 focus:bg-white transition"
                  >
                    <option value="hadir">Hadir</option>
                    <option value="tidak_hadir">Tidak Hadir</option>
                    <option value="ragu">Masih Ragu</option>
                  </select>
                </div>
                <div>
                  <label className="block font-sans-sage text-xs font-semibold tracking-widest uppercase text-[#7A8F7D] mb-1.5">
                    Jumlah Tamu
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={rsvpPax}
                    onChange={(e) => setRsvpPax(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F3EE] border border-[#E9DDD1] text-sm text-[#2E2B29] focus:outline-none focus:border-[#C86B43]/40 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans-sage text-xs font-semibold tracking-widest uppercase text-[#7A8F7D] mb-1.5">
                  Ucapan & Doa
                </label>
                <textarea
                  rows={3}
                  value={rsvpMessage}
                  onChange={(e) => setRsvpMessage(e.target.value)}
                  placeholder="Tuliskan doa terbaik untuk kedua mempelai..."
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F3EE] border border-[#E9DDD1] text-sm text-[#2E2B29] placeholder:text-[#2E2B29]/40 focus:outline-none focus:border-[#C86B43]/40 focus:bg-white transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#C86B43] text-white font-sans-sage font-bold text-sm tracking-wide shadow-[0_8px_20px_rgba(200,107,67,0.25)] hover:bg-[#B85E36] active:scale-[0.98] disabled:opacity-50 transition inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  'Mengirim...'
                ) : (
                  <>
                    <Send size={16} /> {rsvpSuccess ? 'Kirim Ulang' : 'Kirim Konfirmasi & Doa'}
                  </>
                )}
              </button>

              {rsvpSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#7A8F7D]/10 border border-[#7A8F7D]/20 text-[#3A4A3C] text-xs">
                  <CheckCircle2 size={16} className="text-[#7A8F7D] shrink-0" />
                  Terima kasih! Konfirmasi & doa Anda berhasil tercatat.
                </div>
              )}
            </form>

            {/* Wishes wall */}
            <div className="pt-5 border-t border-[#E9DDD1] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-sans-sage text-xs font-bold tracking-widest uppercase text-[#7A8F7D] flex items-center gap-1.5">
                  <MessageCircle size={14} className="text-[#C86B43]" /> Ucapan Doa ({wishesList.length})
                </h4>
                <span className="font-sans-sage text-[11px] text-[#2E2B29]/40">Terbaru</span>
              </div>

              <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2.5 no-scrollbar">
                {wishesList.length === 0 ? (
                  <p className="text-center py-6 font-sans-sage text-xs italic text-[#2E2B29]/40">
                    Belum ada ucapan. Jadilah yang pertama memberi doa restu!
                  </p>
                ) : (
                  wishesList.map((w, idx) => (
                    <div key={w.id || idx} className="bg-[#F8F3EE] border border-[#E9DDD1] rounded-2xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-sans-sage font-bold text-sm text-[#2E2B29] truncate">{w.guest_name}</span>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            w.status === 'hadir'
                              ? 'bg-[#7A8F7D]/15 text-[#3A4A3C] border-[#7A8F7D]/20'
                              : w.status === 'tidak_hadir'
                                ? 'bg-[#C86B43]/10 text-[#8A3A1F] border-[#C86B43]/20'
                                : 'bg-amber-500/15 text-amber-800 border-amber-500/20'
                          }`}
                        >
                          {w.status === 'hadir' ? 'Hadir' : w.status === 'tidak_hadir' ? 'Tidak Hadir' : 'Ragu'}
                        </span>
                      </div>
                      {w.message && <p className="font-sans-sage text-xs leading-relaxed text-[#2E2B29]/75 whitespace-pre-wrap">{w.message}</p>}
                      {w.reply && (
                        <div className="mt-2 rounded-xl bg-white border-l-[3px] border-[#C86B43] p-2.5 text-xs">
                          <span className="font-bold text-[#C86B43]">Balasan mempelai:</span> <span className="text-[#2E2B29]/80">{w.reply}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- GIFT ---------- */}
        {banks.length > 0 && (
          <section className="py-6 sm:py-8">
            <div className="text-center space-y-2 mb-6">
              <p className="font-sans-sage text-[11px] font-bold tracking-[0.28em] uppercase text-[#C86B43]">Tanda Kasih</p>
              <h3 className="font-display text-3xl sm:text-4xl text-[#2E2B29]">Kado Digital</h3>
              <p className="font-sans-sage text-xs sm:text-sm text-[#2E2B29]/60 max-w-md mx-auto">
                Doa restu Anda adalah hadiah terindah. Namun jika berkenan memberi tanda kasih:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[620px] mx-auto">
              {banks.map((bank, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-[#E9DDD1] p-5 shadow-[0_8px_24px_rgba(46,43,41,0.06)] space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg text-[#2E2B29]">{bank.bank}</span>
                    <span className="w-8 h-8 rounded-full bg-[#FDF0E7] border border-[#C86B43]/15 flex items-center justify-center text-[#C86B43]">
                      <Gift size={14} />
                    </span>
                  </div>
                  <div>
                    <p className="font-sans-sage text-[10px] tracking-widest uppercase text-[#2E2B29]/50">Nomor Rekening</p>
                    <p className="font-mono text-base font-bold tracking-wide text-[#2E2B29]">{bank.number}</p>
                    <p className="font-sans-sage text-xs text-[#2E2B29]/60">a.n. {bank.name}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(bank.number, bank.bank, idx)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#F8F3EE] hover:bg-[#C86B43] hover:text-white border border-[#E9DDD1] hover:border-[#C86B43] text-[#2E2B29] font-sans-sage text-xs font-bold transition cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check size={14} className="text-emerald-600" /> Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Salin Nomor
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------- FOOTER ---------- */}
        <footer className="text-center pt-8 pb-10 sm:pb-12 mt-4 border-t border-[#E9DDD1] space-y-4">
          <p className="font-serif italic text-sm sm:text-base text-[#2E2B29]/60 max-w-md mx-auto">
            Terima kasih atas doa, restu & kehadiran Anda di hari bahagia kami.
          </p>
          <div>
            <p className="font-sans-sage text-[11px] tracking-[0.22em] uppercase text-[#7A8F7D]">Dengan kasih,</p>
            <h4 className="font-display text-3xl sm:text-4xl text-[#2E2B29] mt-1">
              {groom} <span className="text-[#C86B43] font-serif italic font-normal">&</span> {bride}
            </h4>
            <p className="font-sans-sage text-xs text-[#2E2B29]/45 mt-1">Beserta keluarga besar</p>
          </div>
          <div className="flex items-center justify-center gap-2 font-sans-sage text-[11px] tracking-wide text-[#2E2B29]/30">
            <Leaf size={12} className="text-[#7A8F7D]/50" /> Sage Terracotta • LoVerse Digital Invitation{' '}
            <Leaf size={12} className="text-[#C86B43]/40" />
          </div>
        </footer>
      </main>
    </div>
  );
}
