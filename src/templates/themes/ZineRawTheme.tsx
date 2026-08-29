// ============================================================
// src/templates/themes/ZineRawTheme.tsx
// ------------------------------------------------------------
// Tema Undangan: Zine Raw (Kategori: RSVP)
// Konsep       : Anti-Mainstream Gen Z — Zine / Neo-Brutalist
//              : Collage scrapbook, torn paper, tape, sticker,
//              : mixed typography, thick borders + hard shadows.
// Referensi    : 2025-2026 Gen Z trends — indie sleaze comeback,
//              : brutalism, ransom-note type, doodle stickers,
//              : "it's giving", "no cap", "slay" culture.
//              : Fully responsive — desktop chaos -> mobile stack.
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
  Star,
  Sparkles,
  Send,
  MessageCircle,
  CheckCircle2,
  X,
  ExternalLink,
  Zap,
  Smile,
  ArrowUpRight,
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

export default function ZineRawTheme({
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
  const { isOpen, open, playing: isPlaying, toggle: toggleAudio } = useOpenInvitation(audioRef, 500);

  const photos = resolvePhotos(data);
  const gallery = resolveGallery(data);
  const banks = resolveBanks(data);
  const venue = resolveVenue(data);
  const schedule = resolveSchedule(data, date);

  const coverPhoto = data?.cover_photo || photos.cover;
  const audioUrl = data?.audio_url || 'https://r2.loverse.my.id/defaults/audio/ee2e74c72c.mp3';

  const groomParents = data?.groom_parents || 'Putra dari Bpk. Santoso & Ibu Rina';
  const brideParents = data?.bride_parents || 'Putri dari Bpk. Wijaya & Ibu Ayu';

  const quote =
    data?.quote ||
    'Cinta itu bukan soal seberapa lama kamu menunggu, tapi seberapa paham kamu arti pulang.';
  const quoteSrc = data?.quote_src || '— No Cap Poetry';

  const formattedDate = formatDate(date, 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedAkadDate = schedule.akadDate
    ? formatDate(schedule.akadDate, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : formattedDate;
  const formattedResepsiDate = schedule.resepsiDate
    ? formatDate(schedule.resepsiDate, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : formattedDate;

  const akadClock = (schedule.akadTime || '08:00').split(' ')[0].substring(0, 5);
  const timeLeft = useCountdown(date, akadClock);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
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
    const payload: RsvpPayload = { status: rsvpStatus, pax: Number(rsvpPax), message: rsvpMessage.trim() };
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
      console.error('[ZineRaw] RSVP fail', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#121212] relative overflow-x-hidden selection:bg-[#FF3B82] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Fraunces:opsz,ital,wght@9..144,0,800;9..144,1,800&family=Caveat:wght@600;700&family=JetBrains+Mono:wght@500&display=swap');
        .font-grotesk { font-family: 'Space Grotesk', sans-serif; }
        .font-display-zine { font-family: 'Fraunces', serif; }
        .font-hand { font-family: 'Caveat', cursive; }
        .font-mono-zine { font-family: 'JetBrains Mono', monospace; }
        .paper {
          background-color: #FFFEFB;
          background-image:
            radial-gradient(at 20% 10%, rgba(255,59,130,0.06) 0, transparent 50%),
            radial-gradient(at 90% 90%, rgba(42,127,255,0.06) 0, transparent 50%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
        }
        .brutal { border: 2.5px solid #121212; box-shadow: 6px 6px 0 #121212; }
        .brutal-sm { border: 2px solid #121212; box-shadow: 4px 4px 0 #121212; }
        .brutal-pink { border: 2.5px solid #121212; box-shadow: 6px 6px 0 #FF3B82; }
        .tape {
          background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,243,150,0.9));
          border-left: 1px solid rgba(18,18,18,0.1);
          border-right: 1px solid rgba(18,18,18,0.1);
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .torn {
          clip-path: polygon(0 2%, 3% 0, 7% 3%, 12% 0, 18% 2%, 24% 0, 30% 2%, 36% 0, 42% 3%, 48% 0, 54% 2%, 60% 0, 66% 3%, 72% 0, 78% 2%, 84% 0, 90% 3%, 95% 0, 100% 2%, 100% 98%, 97% 100%, 91% 97%, 85% 100%, 79% 97%, 73% 100%, 67% 97%, 61% 100%, 55% 97%, 49% 100%, 43% 97%, 37% 100%, 31% 97%, 25% 100%, 19% 97%, 13% 100%, 7% 97%, 0 100%);
        }
        @keyframes wiggle { 0%,100%{transform:rotate(-1.5deg)} 50%{transform:rotate(1.5deg)} }
        .wiggle { animation: wiggle 2.5s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar{ display:none } .no-scrollbar{ -ms-overflow-style:none; scrollbar-width:none }
      `}</style>

      <audio ref={audioRef} src={audioUrl} loop preload="auto" />

      {/* ================= COVER ================= */}
      <div
        className={`fixed inset-0 z-50 bg-[#F5F1E8] flex flex-col lg:flex-row transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Left — poster collage */}
        <div className="relative h-[52vh] lg:h-full w-full lg:w-[55%] overflow-hidden bg-[#121212] shrink-0 flex items-center justify-center p-4 lg:p-8">
          {/* bg photo with halftone */}
          <div className="absolute inset-0">
            <img src={coverPhoto} alt="cover" className="w-full h-full object-cover opacity-90 grayscale contrast-125" />
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(#fff 1.2px, transparent 1.2px)', backgroundSize: '12px 12px' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          {/* stickers floating */}
          <div className="absolute top-4 left-4 lg:top-8 lg:left-8 brutal-sm bg-[#D6FF2A] px-3 py-1.5 -rotate-3 font-mono-zine text-[10px] lg:text-xs font-bold">
            ★ ISSUE #01 — 2026
          </div>
          <div className="absolute top-4 right-4 lg:top-8 lg:right-8 brutal-sm bg-[#2A7FFF] text-white px-3 py-1.5 rotate-2 font-grotesk text-[10px] font-bold">
            NO CAP FR 💅
          </div>
          <div className="absolute bottom-20 left-4 brutal-sm bg-white px-2.5 py-1 text-[11px] font-hand -rotate-2 hidden sm:flex items-center gap-1">
            <Smile size={14} className="text-[#FF3B82]" /> pls be there!!
          </div>
          {/* main typographic poster — centered */}
          <div className="relative z-10 text-center -rotate-1">
            <p className="font-mono-zine text-[11px] tracking-[0.32em] text-white/80">UNDANGAN NIKAH • ANTI MAINSTREAM</p>
            <h1 className="font-display-zine text-5xl lg:text-7xl leading-[0.85] text-white mt-2" style={{ textShadow: '4px 4px 0 #FF3B82, -2px -2px 0 #2A7FFF' }}>
              {groom}
              <span className="block font-hand text-4xl lg:text-5xl text-[#D6FF2A] -rotate-2 my-1" style={{ textShadow: '2px 2px 0 #121212' }}>
                & {bride}
              </span>
            </h1>
            <div className="mt-3 inline-block brutal-sm bg-white px-4 py-2 rotate-1">
              <span className="font-grotesk font-bold text-xs tracking-widest">IT&apos;S GIVING FOREVER ✨</span>
            </div>
          </div>
        </div>

        {/* Right — guest card torn */}
        <div className="flex-1 paper relative flex flex-col items-center justify-center px-5 lg:px-10 py-6 lg:py-10 text-center overflow-y-auto no-scrollbar">
          {/* tape top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 tape -rotate-1 hidden lg:block" />
          <div className="w-full max-w-sm">
            <div className="inline-flex items-center gap-2 brutal-sm bg-[#FF3B82] text-white px-3 py-1.5 font-mono-zine text-[11px] font-bold -rotate-1">
              <Zap size={12} fill="white" /> YOU&apos;RE INVITED — NO RSVP NO PARTY
            </div>

            <div className="mt-4 brutal paper torn p-6 lg:p-7 text-left relative rotate-[0.4deg]">
              <div className="absolute -top-3 left-6 w-20 h-6 tape rotate-2" />
              <p className="font-hand text-xl text-[#FF3B82]">hey bestieee,,</p>
              <h2 className="font-display-zine text-3xl leading-none mt-1">
                {groom} <span className="font-hand text-2xl text-[#2A7FFF]">&</span> {bride}
              </h2>
              <p className="font-mono-zine text-[11px] tracking-widest text-[#121212]/60 mt-2">{formattedDate.toUpperCase()}</p>
              <div className="mt-4 border-t-2 border-dashed border-[#121212]/15 pt-4">
                <p className="font-mono-zine text-[10px] tracking-[0.18em] text-[#121212]/50">KEPADA YTH. SEPUH / BESTIE:</p>
                <p className="font-grotesk font-bold text-lg mt-1 leading-tight break-words">{guestName || 'Tamu Undangan (ur fave person)'}</p>
                <p className="font-hand text-sm text-[#2A7FFF] mt-1">— pls datang ya, jangan ghosting 😭🙏</p>
              </div>
              {/* doodle arrow */}
              <div className="absolute -right-3 top-1/2 hidden lg:block rotate-6">
                <span className="font-hand text-xs bg-[#D6FF2A] brutal-sm px-2 py-1">→ slay</span>
              </div>
            </div>

            <button
              onClick={open}
              className="mt-5 w-full brutal bg-[#D6FF2A] hover:bg-[#E0FF55] py-4 font-grotesk font-black text-sm tracking-wide flex items-center justify-center gap-2 active:translate-y-[2px] active:shadow-[3px_3px_0_#121212] transition cursor-pointer"
            >
              BUKA UNDANGAN <ArrowUpRight size={18} className="bg-[#121212] text-white rounded-full p-1 w-6 h-6" />
            </button>
            <p className="mt-2 font-mono-zine text-[10px] text-[#121212]/40 flex items-center justify-center gap-1.5">
              <Music size={10} /> tap to unmute • ada musiknya fr
            </p>
            <p className="mt-4 font-hand text-sm text-[#121212]/60">anti mainstream • anti boring • anti telat 😜</p>
          </div>
        </div>
      </div>

      {/* ================= AUDIO FAB ================= */}
      <button
        onClick={toggleAudio}
        className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-40 w-12 h-12 lg:w-14 lg:h-14 brutal bg-white flex items-center justify-center hover:rotate-1 active:translate-y-[2px] active:shadow-[3px_3px_0_#121212] transition cursor-pointer"
        aria-label={isPlaying ? 'Jeda' : 'Putar'}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        {isPlaying && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF3B82] rounded-full animate-ping" />}
      </button>

      {/* ================= MAIN ================= */}
      <main className="relative w-full max-w-[920px] mx-auto px-3 sm:px-6 lg:px-0 pb-10">
        {/* background grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#121212 1px, transparent 1px), linear-gradient(90deg, #121212 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* ---------- HERO COLLAGE ---------- */}
        <section className="pt-6 lg:pt-10">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch">
            {/* Big heading */}
            <div className="flex-1 paper brutal p-5 lg:p-7 -rotate-[0.6deg] relative">
              <div className="absolute -top-3 left-6 w-24 h-6 tape rotate-1" />
              <p className="font-mono-zine text-[10px] tracking-[0.28em] text-[#FF3B82] font-bold">★ VOL. 01 — THE WEDDING ZINE</p>
              <h2 className="font-display-zine text-[42px] lg:text-[56px] leading-[0.85] mt-2">
                IT&apos;S
                <br />
                <span className="bg-[#D6FF2A] px-2 brutal-sm inline-block -rotate-1">GIVING</span>
                <br />
                FOREVER.
              </h2>
              <p className="font-hand text-xl text-[#2A7FFF] mt-3 -rotate-1">no cap, we&apos;re getting married fr 💍</p>
              <div className="mt-4 flex flex-wrap gap-2 font-mono-zine text-[10px] font-bold">
                <span className="brutal-sm bg-[#121212] text-white px-2.5 py-1">{formattedDate}</span>
                <span className="brutal-sm bg-white px-2.5 py-1">{venue.name}</span>
              </div>
              <div className="mt-5 flex gap-2">
                <span className="w-8 h-8 brutal-sm bg-[#FF3B82] text-white flex items-center justify-center rotate-3"><Heart size={14} fill="white" /></span>
                <span className="w-8 h-8 brutal-sm bg-[#2A7FFF] text-white flex items-center justify-center -rotate-3"><Star size={14} fill="white" /></span>
                <span className="w-8 h-8 brutal-sm bg-[#D6FF2A] flex items-center justify-center rotate-6"><Smile size={14} /></span>
              </div>
            </div>
            {/* Polaroid stack */}
            <div className="relative w-full lg:w-[360px] shrink-0 flex flex-col items-center">
              <div className="paper brutal p-2 pb-8 rotate-2 w-[86%] sm:w-[72%] lg:w-full relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 tape -rotate-2" />
                <img src={coverPhoto} alt="cover" className="w-full aspect-[4/5] object-cover" />
                <p className="absolute bottom-2 left-1/2 -translate-x-1/2 font-hand text-sm whitespace-nowrap">{groom} & {bride} — 2026 ✦</p>
              </div>
              <div className="paper brutal p-1.5 -rotate-3 -mt-6 ml-6 hidden sm:block w-40">
                <img src={photos.groom} alt="groom thumb" className="w-full aspect-square object-cover grayscale" />
              </div>
            </div>
          </div>

          {/* Countdown brutal */}
          <div className="mt-6 lg:mt-8 brutal bg-[#121212] text-white p-4 lg:p-5 -rotate-[0.3deg]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="font-mono-zine text-xs tracking-[0.2em] flex items-center gap-2">
                <Clock size={14} className="text-[#D6FF2A]" /> COUNTDOWN — JANGAN TELAT BESTIE
              </p>
              <span className="font-hand text-sm text-[#D6FF2A] hidden sm:block">tick tock ⏰</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 lg:gap-3">
              {[
                { v: timeLeft.days, l: 'HARI' },
                { v: timeLeft.hours, l: 'JAM' },
                { v: timeLeft.minutes, l: 'MENIT' },
                { v: timeLeft.seconds, l: 'DETIK' },
              ].map((c) => (
                <div key={c.l} className="bg-white text-[#121212] brutal-sm p-2.5 lg:p-3 text-center">
                  <span className="block font-display-zine text-2xl lg:text-3xl leading-none">{String(c.v).padStart(2, '0')}</span>
                  <span className="block font-mono-zine text-[10px] font-bold tracking-widest">{c.l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- QUOTE RANSOM ---------- */}
        <section className="mt-8 paper brutal p-5 lg:p-7 rotate-[0.4deg] relative">
          <div className="absolute -top-3 right-8 w-20 h-6 tape rotate-2 hidden sm:block" />
          <div className="flex items-start gap-3">
            <span className="brutal-sm bg-[#FF3B82] text-white px-2 py-1 font-mono-zine text-[10px] font-bold shrink-0 -rotate-2">QUOTE</span>
            <p className="font-grotesk text-[15px] lg:text-lg leading-relaxed">
              <span className="bg-[#D6FF2A] px-1 font-bold">“{quote}”</span>
            </p>
          </div>
          <p className="text-right font-hand text-base mt-3 text-[#2A7FFF]">{quoteSrc}</p>
          <div className="absolute -bottom-2 -left-2 bg-[#2A7FFF] text-white font-mono-zine text-[10px] px-2 py-1 brutal-sm rotate-3 hidden lg:block">✦ certified banger quote</div>
        </section>

        {/* ---------- COUPLE ZINE ---------- */}
        <section className="mt-8">
          <div className="text-center">
            <span className="inline-block brutal-sm bg-[#D6FF2A] px-3 py-1 font-mono-zine text-xs font-black -rotate-1">MEET THE MAIN CHARACTERS ★</span>
            <h3 className="font-display-zine text-3xl lg:text-4xl mt-3">She&apos;s / He&apos;s The Moment</h3>
            <p className="font-hand text-base text-[#121212]/60 -rotate-1">it&apos;s giving soulmate energy fr</p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Groom */}
            <div className="paper brutal p-4 lg:p-5 -rotate-1 relative">
              <div className="absolute -top-3 left-4 w-20 h-6 tape rotate-1" />
              <div className="flex gap-4">
                <div className="w-[132px] h-[168px] lg:w-[160px] lg:h-[200px] brutal-sm overflow-hidden shrink-0 -rotate-1 bg-[#F5F1E8]">
                  <img src={photos.groom} alt={groom} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono-zine text-[10px] font-bold bg-[#121212] text-white px-2 py-1">THE GROOM</span>
                  <h4 className="font-display-zine text-2xl leading-none mt-2 break-words">{groom}</h4>
                  <p className="font-mono-zine text-[11px] leading-relaxed mt-2 text-[#121212]/70">
                    Putra dari
                    <br />
                    <span className="font-bold text-[#121212]">{groomParents}</span>
                  </p>
                  <span className="mt-3 inline-block font-hand text-xs bg-[#D6FF2A] px-2 py-1 brutal-sm rotate-1">slay 💅</span>
                </div>
              </div>
              <div className="mt-3 font-mono-zine text-[10px] text-[#121212]/40 border-t-2 border-dashed border-[#121212]/10 pt-2">ID: GROOM-001 • VERIFIED ✓</div>
            </div>
            {/* Bride */}
            <div className="paper brutal p-4 lg:p-5 rotate-1 relative md:mt-6">
              <div className="absolute -top-3 right-4 w-20 h-6 tape -rotate-1" />
              <div className="flex gap-4">
                <div className="w-[132px] h-[168px] lg:w-[160px] lg:h-[200px] brutal-sm overflow-hidden shrink-0 rotate-1 bg-[#F5F1E8]">
                  <img src={photos.bride} alt={bride} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono-zine text-[10px] font-bold bg-[#FF3B82] text-white px-2 py-1">THE BRIDE</span>
                  <h4 className="font-display-zine text-2xl leading-none mt-2 break-words">{bride}</h4>
                  <p className="font-mono-zine text-[11px] leading-relaxed mt-2 text-[#121212]/70">
                    Putri dari
                    <br />
                    <span className="font-bold text-[#121212]">{brideParents}</span>
                  </p>
                  <span className="mt-3 inline-block font-hand text-xs bg-[#2A7FFF] text-white px-2 py-1 brutal-sm -rotate-1">periodt ✨</span>
                </div>
              </div>
              <div className="mt-3 font-mono-zine text-[10px] text-[#121212]/40 border-t-2 border-dashed border-[#121212]/10 pt-2">ID: BRIDE-001 • VERIFIED ✓</div>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <span className="paper brutal-sm px-4 py-2 font-display-zine text-lg -rotate-1">& — it&apos;s giving soulmates — &</span>
          </div>
        </section>

        {/* ---------- SCHEDULE — TICKETS ---------- */}
        <section className="mt-8">
          <h3 className="font-display-zine text-3xl text-center">
            Pull Up <span className="bg-[#FF3B82] text-white px-2 brutal-sm inline-block rotate-1">Or Don&apos;t</span> (pls pull up)
          </h3>
          <p className="text-center font-hand text-base -rotate-1">jangan jadi ghost, bestie 👻</p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {/* Akad */}
            <div className="paper brutal p-0 overflow-hidden -rotate-[0.5deg] relative">
              <div className="bg-[#D6FF2A] border-b-2 border-[#121212] px-4 py-2 flex items-center justify-between">
                <span className="font-mono-zine text-xs font-black">● AKAD NIKAH — ADMIT ONE</span>
                <Zap size={14} />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 brutal-sm bg-[#121212] text-white flex items-center justify-center shrink-0"><Calendar size={14} /></span>
                  <div><p className="font-mono-zine text-[11px] text-[#121212]/50">TANGGAL</p><p className="font-grotesk font-bold text-sm">{formattedAkadDate}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 brutal-sm bg-[#FF3B82] text-white flex items-center justify-center shrink-0"><Clock size={14} /></span>
                  <div><p className="font-mono-zine text-[11px] text-[#121212]/50">JAM</p><p className="font-grotesk font-bold text-sm">{schedule.akadTime}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 brutal-sm bg-[#2A7FFF] text-white flex items-center justify-center shrink-0"><MapPin size={14} /></span>
                  <div className="min-w-0"><p className="font-mono-zine text-[11px] text-[#121212]/50">TEMPAT</p><p className="font-grotesk font-bold text-sm break-words">{venue.name}</p><p className="font-mono-zine text-xs text-[#121212]/60">{venue.address}</p></div>
                </div>
              </div>
              {/* perforation */}
              <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[#F5F1E8] rounded-full border-2 border-[#121212] hidden md:block" />
              <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#F5F1E8] rounded-full border-2 border-[#121212] hidden md:block" />
            </div>

            {/* Resepsi */}
            <div className="bg-[#121212] text-white brutal p-0 overflow-hidden rotate-[0.5deg] relative">
              <div className="bg-[#FF3B82] border-b-2 border-white px-4 py-2 flex items-center justify-between">
                <span className="font-mono-zine text-xs font-black">● RESEPSI — VIP ONLY</span>
                <Sparkles size={14} />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-white text-[#121212] border-2 border-white flex items-center justify-center shrink-0"><Calendar size={14} /></span>
                  <div><p className="font-mono-zine text-[11px] text-white/50">TANGGAL</p><p className="font-grotesk font-bold text-sm">{formattedResepsiDate}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-[#D6FF2A] text-[#121212] border-2 border-white flex items-center justify-center shrink-0"><Clock size={14} /></span>
                  <div><p className="font-mono-zine text-[11px] text-white/50">JAM</p><p className="font-grotesk font-bold text-sm text-[#D6FF2A]">{schedule.resepsiTime}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-[#2A7FFF] text-white flex items-center justify-center shrink-0"><MapPin size={14} /></span>
                  <div className="min-w-0"><p className="font-mono-zine text-[11px] text-white/50">TEMPAT</p><p className="font-grotesk font-bold text-sm">{venue.name}</p><p className="font-mono-zine text-xs text-white/60">{venue.address}</p></div>
                </div>
              </div>
              <div className="px-5 pb-4">
                <span className="font-hand text-xs text-[#D6FF2A]">— after party till u drop 🪩</span>
              </div>
            </div>
          </div>

          {venue.mapsLink && venue.mapsLink !== '#' && (
            <div className="mt-5 flex justify-center">
              <a href={venue.mapsLink} target="_blank" rel="noreferrer" className="brutal bg-[#2A7FFF] text-white px-6 py-3 font-mono-zine font-black text-xs tracking-widest flex items-center gap-2 hover:translate-y-[2px] hover:shadow-[4px_4px_0_#121212] transition">
                <MapPin size={14} /> GOOGLE MAPS <ExternalLink size={14} />
              </a>
            </div>
          )}
        </section>

        {/* ---------- GALLERY SCRAPBOOK ---------- */}
        {gallery.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-display-zine text-3xl">Dump 📸</h3>
              <span className="font-mono-zine text-[11px] bg-[#121212] text-white px-3 py-1 brutal-sm -rotate-1">PHOTO DUMP — NO FILTER</span>
            </div>
            <p className="font-hand text-sm">our camera roll kinda ate 😍</p>

            <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {gallery.map((url, idx) => {
                const rots = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-[0.8deg]', '-rotate-[0.8deg]'];
                const rot = rots[idx % rots.length];
                const bg = idx % 3 === 0 ? 'bg-[#D6FF2A]' : idx % 3 === 1 ? 'bg-[#FF3B82]' : 'bg-[#2A7FFF]';
                return (
                  <div key={idx} onClick={() => setActiveImage(url)} className={`paper brutal p-2 pb-6 cursor-pointer hover:z-10 hover:scale-[1.02] transition ${rot} ${idx === 0 ? 'col-span-2 lg:col-span-2 lg:row-span-2' : ''}`}>
                    <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 tape ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}`} />
                    <div className={`w-full ${idx === 0 ? 'aspect-[4/3] lg:aspect-square' : 'aspect-square'} overflow-hidden border-2 border-[#121212] ${bg} p-1`}>
                      <img src={url} alt={`gallery ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <p className="text-center font-hand text-xs mt-2">#{String(idx + 1).padStart(2, '0')} — slay</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeImage && (
          <div onClick={() => setActiveImage(null)} className="fixed inset-0 z-50 bg-[#121212]/90 backdrop-blur-md flex items-center justify-center p-4">
            <button onClick={() => setActiveImage(null)} className="absolute top-4 right-4 w-10 h-10 brutal bg-white flex items-center justify-center" aria-label="tutup"><X size={18} /></button>
            <img src={activeImage} alt="preview" className="max-w-full max-h-[84vh] brutal bg-white p-2" />
          </div>
        )}

        {/* ---------- RSVP — BRUTAL CHAT ---------- */}
        <section className="mt-10 paper brutal p-5 lg:p-6 -rotate-[0.3deg]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="brutal-sm bg-[#D6FF2A] px-3 py-1 font-mono-zine text-xs font-black">RSVP</span>
            <h3 className="font-display-zine text-2xl lg:text-3xl">WYM Pulling Up? 👀</h3>
            <span className="font-hand text-sm bg-[#FF3B82] text-white px-2 py-1 brutal-sm rotate-2">drop ur wishes bestie</span>
          </div>

          <form onSubmit={handleSendRsvp} className="mt-5 space-y-3">
            <div>
              <label className="font-mono-zine text-[11px] font-bold">NAMA LO</label>
              <input
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                required
                placeholder="ketik nama kamu..."
                className="mt-1 w-full brutal-sm bg-white px-3 py-3 font-grotesk text-sm placeholder:text-[#121212]/40 focus:outline-none focus:shadow-[2px_2px_0_#FF3B82]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono-zine text-[11px] font-bold">STATUS</label>
                <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)} className="mt-1 w-full brutal-sm bg-white px-3 py-3 font-grotesk text-sm">
                  <option value="hadir">GAS HADIR 🔥</option>
                  <option value="tidak_hadir">GABISA DATENG 😭</option>
                  <option value="ragu">MASIH RAGU 🤔</option>
                </select>
              </div>
              <div>
                <label className="font-mono-zine text-[11px] font-bold">BERAPA ORANG?</label>
                <input type="number" min={1} max={10} value={rsvpPax} onChange={(e) => setRsvpPax(Math.max(1, parseInt(e.target.value) || 1))} className="mt-1 w-full brutal-sm bg-white px-3 py-3 font-grotesk text-sm" />
              </div>
            </div>
            <div>
              <label className="font-mono-zine text-[11px] font-bold">UCAPAN / WISHES</label>
              <textarea rows={3} value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} placeholder="happy wedding bestie!! semoga langgeng..." className="mt-1 w-full brutal-sm bg-white px-3 py-3 font-grotesk text-sm resize-none placeholder:text-[#121212]/40 focus:outline-none" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full brutal bg-[#121212] text-white py-3.5 font-mono-zine font-black text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-black active:translate-y-[2px] active:shadow-[4px_4px_0_#121212] disabled:opacity-50">
              {isSubmitting ? 'SENDING...' : <><Send size={16} /> KIRIM — LET&apos;S GOOO</>}
            </button>
            {rsvpSuccess && (
              <div className="brutal-sm bg-[#D6FF2A] px-3 py-2 font-mono-zine text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> TERKIRIM! thank u bestie 🫶
              </div>
            )}
          </form>

          {/* wishes wall */}
          <div className="mt-6 border-t-2 border-dashed border-[#121212] pt-4">
            <p className="font-mono-zine text-xs font-black flex items-center gap-2">
              <MessageCircle size={14} /> WISHES WALL ({wishesList.length}) <span className="font-hand font-normal text-[#FF3B82]">— real ones only</span>
            </p>
            <div className="mt-3 max-h-[320px] overflow-y-auto pr-1 space-y-3 no-scrollbar">
              {wishesList.length === 0 ? (
                <p className="text-center py-6 font-hand text-sm text-[#121212]/40">belum ada wishes, jadi yang pertama dong bestie 😗</p>
              ) : (
                wishesList.map((w, idx) => (
                  <div key={w.id || idx} className="brutal-sm bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-grotesk font-bold text-sm truncate">{w.guest_name}</span>
                      <span className={`px-2 py-0.5 font-mono-zine text-[10px] font-black brutal-sm text-xs ${w.status === 'hadir' ? 'bg-[#D6FF2A]' : w.status === 'tidak_hadir' ? 'bg-[#FF3B82] text-white' : 'bg-[#2A7FFF] text-white'}`}>
                        {w.status === 'hadir' ? 'HADIR' : w.status === 'tidak_hadir' ? 'ABSEN' : 'RAGU'}
                      </span>
                    </div>
                    {w.message && <p className="font-grotesk text-xs mt-1.5 leading-relaxed whitespace-pre-wrap">{w.message}</p>}
                    {w.reply && (
                      <div className="mt-2 bg-[#F5F1E8] border-l-[3px] border-[#FF3B82] px-2.5 py-2">
                        <p className="font-mono-zine text-[10px] font-bold text-[#FF3B82]">REPLY FROM {groom} & {bride}:</p>
                        <p className="font-grotesk text-xs">{w.reply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ---------- GIFT BRUTAL ---------- */}
        {banks.length > 0 && (
          <section className="mt-8">
            <h3 className="font-display-zine text-3xl text-center">
              Send Love <span className="bg-[#121212] text-white px-2 brutal-sm inline-block -rotate-1"> ( & Money )</span>
            </h3>
            <p className="text-center font-hand text-sm">no pressure bestie, cash is cool too 💸</p>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[640px] mx-auto">
              {banks.map((bank, idx) => (
                <div key={idx} className="paper brutal p-4 relative overflow-hidden">
                  <div className="absolute -top-1 -right-1 w-12 h-12 bg-[#D6FF2A] brutal-sm rotate-12 flex items-center justify-center text-xs font-black">💸</div>
                  <p className="font-mono-zine text-[11px] font-bold tracking-widest">{bank.bank.toUpperCase()}</p>
                  <p className="font-display-zine text-xl mt-1">{bank.number}</p>
                  <p className="font-mono-zine text-xs text-[#121212]/60">a.n. {bank.name}</p>
                  <button onClick={() => handleCopy(bank.number, bank.bank, idx)} className="mt-3 w-full brutal-sm bg-[#121212] text-white py-2.5 font-mono-zine text-xs font-black flex items-center justify-center gap-2 hover:bg-black">
                    {copiedIndex === idx ? <><Check size={14} /> TERSALIN!</> : <><Copy size={14} /> SALIN NO. REK</>}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <span className="font-mono-zine text-[10px] bg-white brutal-sm px-3 py-1 rotate-1">✦ transfer proof? dm us fr ✦</span>
            </div>
          </section>
        )}

        {/* ---------- FOOTER RANSOM ---------- */}
        <footer className="mt-10 text-center border-t-2 border-dashed border-[#121212]/20 pt-6">
          <p className="font-hand text-base">thx for coming besties, luv u all 🫶</p>
          <h4 className="font-display-zine text-3xl mt-1">
            {groom} <span className="text-[#FF3B82]">&</span> {bride}
          </h4>
          <p className="font-mono-zine text-[11px] tracking-[0.2em] text-[#121212]/40 mt-1">ZINE RAW • MADE WITH NO CAP • 2026</p>
          <div className="mt-4 flex justify-center gap-2 flex-wrap">
            <span className="brutal-sm bg-[#D6FF2A] px-2 py-1 font-mono-zine text-[10px] font-black">#ANTIMAINSTREAM</span>
            <span className="brutal-sm bg-[#2A7FFF] text-white px-2 py-1 font-mono-zine text-[10px] font-black">#GENZCORE</span>
            <span className="brutal-sm bg-[#FF3B82] text-white px-2 py-1 font-mono-zine text-[10px] font-black">#SLAY</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
