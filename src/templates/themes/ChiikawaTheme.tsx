// ============================================================
// src/templates/themes/ChiikawaTheme.tsx
// ------------------------------------------------------------
// Tema Undangan: Chiikawa Days (Kategori: RSVP)
// Konsep       : SLIDE DECK HORIZONTAL TANPA SCROLL — navigasi
//                geser kiri/kanan antar section (panah, usap sentuh,
//                tombol keyboard, dan petak pembatas di bawah). Tiap
//                section adalah satu slide penuh; transisi memakai
//                AnimatePresence + arah (masuk dari kanan/ kiri) dengan
//                spring 3D ala kartu kawaii.
// Karakter     : ちいかわ (Chiikawa), ハチワレ (Hachiware), うさぎ
//                (Usagi) — diambil dari CDN Chiikawa Fandom
//                (static.wikia.nocookie.net) + logo resmi dari Wikimedia
//                Commons. Tiap gambar punya fallback emoji yang aman
//                bila gagal termuat (onError), jadi tema tak pernah rusak.
// Warna        : palet MILIK TEMA sendiri di @theme src/index.css
//                (--color-cw-*): krem #FFF9EC, mint #E0F2EE, biru
//                langit #8ECBE0, pink Usagi #F9BCCB, kuning Hachiware
//                #FFE27A, tinta cokelat #5C4633, coral #F2797E.
//                Font Baloo 2 + Quicksand.
// Dipakai di   : templates/Registry.ts (slug 'chiikawa')
// Keterikatan  : types/template, types/database, utils/templateHelpers,
//                hooks/useCountdown, hooks/useCopyToClipboard,
//                templates/shared/useOpenInvitation, framer-motion
// ============================================================

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Gift,
  Heart,
  MapPin,
  Pause,
  Play,
  Send,
  Star,
} from 'lucide-react';
import type { TemplateProps, RsvpPayload } from '../../types/template';
import type { RsvpStatus } from '../../types/database';
import { useCountdown } from '../../hooks/useCountdown';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import {
  formatDate,
  resolveBanks,
  resolveGallery,
  resolvePhotos,
  resolveVenue,
  resolveSchedule,
} from '../../utils/templateHelpers';
import { useOpenInvitation } from '../shared/useOpenInvitation';

// ─── KOSAKATA GERAK ────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── ASET KARAKTER CHIIKAWA (CDN stabil + hotlink) ─────────────
const CHIIKAWA = {
  logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/ChiikawaLogo.png',
  chiikawa: 'https://static.wikia.nocookie.net/chiikawa/images/2/2c/AdorableCutieChiikawa.png/revision/latest?cb=20240709065538',
  hachiware: 'https://static.wikia.nocookie.net/chiikawa/images/6/61/SweetBabyHachiware2.png/revision/latest?cb=20260214172321',
  usagi: 'https://static.wikia.nocookie.net/chiikawa/images/4/43/YahaUsagi.png/revision/latest?cb=20240709065537',
};

/** Gambar karakter dengan fallback emoji aman bila CDN gagal. */
function Chibi({
  src,
  alt,
  fallback = '🐻',
  size = 64,
  className = '',
}: {
  src: string;
  alt: string;
  fallback?: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        className={`flex items-center justify-center rounded-full bg-cw-yellow/70 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
        role="img"
        aria-label={alt}
      >
        {fallback}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  );
}

/** Wrapper reveal ber-stagger untuk konten tiap slide. */
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Karakter yang "mengambang" (bobbing) dengan goyangan pelan. */
function Bob({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{ y: [0, -12, 0], rotate: [0, -3, 3, 0] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  );
}

/** Digit countdown "jelly": angka lama meluncur keluar, angka baru masuk. */
function JellyNum({ value, label }: { value: number; label: string }) {
  return (
    <div className="w-16 rounded-2xl border-[3px] border-cw-ink/15 bg-white px-1 py-2 text-center shadow-[0_4px_0_rgba(92,70,51,0.08)]">
      <div className="h-9 overflow-hidden text-3xl font-extrabold tabular-nums text-cw-coral">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="inline-block"
            initial={{ y: -34, opacity: 0, rotateX: 90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: 34, opacity: 0, rotateX: -90 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="block text-[10px] font-bold uppercase tracking-widest text-cw-ink/50">{label}</span>
    </div>
  );
}

/** Kartu mempelai flip 3D (depan foto / belakang profil). */
function FlipCard({
  photo,
  name,
  tag,
  color,
  parents,
}: {
  photo: string;
  name: string;
  tag: string;
  color: string;
  parents: string;
}) {
  const [flip, setFlip] = useState(false);
  return (
    <motion.button
      type="button"
      onClick={() => setFlip((v) => !v)}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      className="w-36 cursor-pointer"
      aria-label={`Kartu ${name}, ketuk untuk membalik`}
    >
      <div className="relative h-48 w-36 [perspective:900px]">
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateY: flip ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        >
          {/* Depan */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl border-4 border-white [backface-visibility:hidden]">
            <img src={photo} alt={name} className="h-full w-full object-cover" />
            <span className={`font-cute absolute bottom-0 left-0 right-0 py-1 text-center text-sm font-extrabold text-white ${color}`}>{name}</span>
          </div>
          {/* Belakang */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-4 border-white bg-cw-cream p-2 text-center shadow-inner [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className={`font-cute rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${color}`}>{tag}</span>
            <p className="font-cute mt-2 text-base font-extrabold">{name}</p>
            <p className="mt-1 text-[10px] leading-tight text-cw-ink/60">{parents}</p>
            <Heart size={16} className="mt-2 text-cw-coral" fill="var(--color-cw-coral)" />
          </div>
        </motion.div>
      </div>
    </motion.button>
  );
}

export default function ChiikawaTheme({
  groom,
  bride,
  date,
  guestName,
  onRsvpSubmit,
  submittedData,
  data,
}: TemplateProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const copyToClipboard = useCopyToClipboard();

  // Amplop & pemutar musik (pola bersama antar-tema)
  const { isOpen, open, playing: isPlaying, toggle: toggleAudio } =
    useOpenInvitation(audioRef, 900);

  // Data resolusi dengan fallback cerdas (utilitas bersama antar-tema)
  const photos = resolvePhotos(data);
  const gallery = resolveGallery(data);
  const banks = resolveBanks(data);
  const venue = resolveVenue(data);
  const schedule = resolveSchedule(data, date);

  const quote =
    data?.quote ||
    'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.';
  const quoteSrc = data?.quote_src || 'QS. Ar-Rum: 21';
  const audioUrl = data?.audio_url || 'https://r2.loverse.my.id/defaults/audio/ee2e74c72c.mp3';
  const groomParents = data?.groom_parents || 'Putra Bpk. & Ibu.';
  const brideParents = data?.bride_parents || 'Putri Bpk. & Ibu.';

  const formattedDate = formatDate(date, 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedAkadDate = schedule.akadDate
    ? formatDate(schedule.akadDate, 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : formattedDate;
  const formattedResepsiDate = schedule.resepsiDate
    ? formatDate(schedule.resepsiDate, 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : formattedDate;
  const akadClock = (schedule.akadTime || '08:00').split(' ')[0].substring(0, 5);
  const timeLeft = useCountdown(date, akadClock);

  // ─── STATE SLIDE DECK ──────────────────────────────────────────
  const SLIDES = [
    'Pembuka', 'Sambutan', 'Mempelai', 'Waktu',
    'Acara', 'Galeri', 'Hadiah', 'RSVP', 'Ucapan', 'Penutup',
  ] as const;
  const TOTAL = SLIDES.length;

  const [[page, dir], setPage] = useState<[number, number]>([0, 0]);

  const paginate = (newDir: number) => {
    if (!isOpen) return;
    setPage(([cur]) => {
      const next = cur + newDir;
      if (next < 0 || next >= TOTAL) return [cur, newDir];
      return [next, newDir];
    });
  };
  const goTo = (target: number) => setPage(([cur]) => [target, target > cur ? 1 : -1]);

  // Navigasi keyboard: panah kiri/kanan.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') paginate(1);
      if (e.key === 'ArrowLeft') paginate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, page]);

  // Usap sentuh (swipe) untuk ponsel.
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 60) paginate(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  // ─── STATE RSVP & SALIN ───────────────────────────────────────
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(submittedData?.status || 'hadir');
  const [rsvpPax, setRsvpPax] = useState<number>(submittedData?.pax || 1);
  const [rsvpName, setRsvpName] = useState<string>(submittedData?.guest_name || guestName || '');
  const [rsvpMessage, setRsvpMessage] = useState<string>(submittedData?.message || '');
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);

  const handleCopyRekening = (
    e: React.MouseEvent<HTMLElement>,
    num: string,
    bank: string,
    idx: number,
  ) => {
    e.stopPropagation();
    copyToClipboard(num, `Nomor Rekening ${bank}`);
    setCopiedIndex(idx);
    window.setTimeout(() => setCopiedIndex(null), 2200);
  };

  const handleSendRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;
    setIsSubmittingRsvp(true);
    const payload: RsvpPayload = { status: rsvpStatus, pax: Number(rsvpPax), message: rsvpMessage.trim() };
    try {
      if (onRsvpSubmit) await onRsvpSubmit(payload);
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

return (
    <div
      className="h-screen w-screen select-none overflow-hidden bg-cw-cream font-body text-cw-ink"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      dir="ltr"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Quicksand:wght@400;600;700&display=swap');
        .font-cute { font-family: 'Baloo 2', cursive; }
        .font-body { font-family: 'Quicksand', sans-serif; }
        .cw-dots {
          background-image: radial-gradient(rgba(92, 70, 51, 0.10) 1.5px, transparent 1.5px);
          background-size: 26px 26px;
        }
      `}</style>

      {/* ─── COVER: BUKA UNDANGAN ───────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="cover"
            exit={{ y: '-100%', opacity: 1 }}
            transition={{ duration: 0.85, ease: EASE }}
            className="cw-dots fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-cw-cream bg-gradient-to-b from-cw-mint to-cw-cream px-6"
          >
            <Bob delay={0.1}>
              <div className="relative">
                <div className="absolute -inset-6 rounded-full bg-cw-yellow/50 blur-2xl" />
                <Chibi src={CHIIKAWA.chiikawa} alt="Chiikawa" fallback="🐻" size={130} className="relative" />
              </div>
            </Bob>
            <Reveal delay={0.2}>
              <img src={CHIIKAWA.logo} alt="Chiikawa logo" className="mx-auto mt-5 h-10 opacity-80" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            </Reveal>
            <Reveal delay={0.3} className="mt-4 text-center">
              <p className="font-cute text-sm font-bold uppercase tracking-[0.3em] text-cw-blue">Kawaii Wedding</p>
              <h1 className="font-cute mt-2 text-5xl font-extrabold leading-tight">
                {groom} <span className="text-cw-coral">&amp;</span> {bride}
              </h1>
              <p className="mt-3 text-sm font-semibold text-cw-ink/60">{formattedDate}</p>
            </Reveal>
            <motion.button
              onClick={open}
              whileHover={{ scale: 1.07, rotate: -1 }}
              whileTap={{ scale: 0.93 }}
              className="font-cute mt-8 rounded-full border-2 border-cw-ink/10 bg-cw-coral px-9 py-3.5 text-lg font-bold text-white shadow-[0_6px_0_rgba(92,70,51,0.15)]"
            >
              Buka Undangan 💌
            </motion.button>
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="mt-8 text-cw-ink/40"
            >
              ▶ geser ke kanan
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Baru tampil setelah undangan dibuka — agar tidak bertumpuk + transparan. */}
      {isOpen && (
      <>
      {/* ─── TOP BAR: LOGO + TANDA PETIK ────────────────────────── */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4">
        <img src={CHIIKAWA.logo} alt="Chiikawa" className="h-7 opacity-75" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        <div className="flex items-center gap-1.5 rounded-full border border-cw-ink/10 bg-white/70 px-3 py-1.5">
          <span className="font-cute text-[11px] font-bold uppercase tracking-widest text-cw-ink/60">
            {SLIDES[page]}
          </span>
        </div>
      </div>

{/* ─── DECK SLIDE (KIRI-KANAN, TANPA SCROLL) ──────────────── */}
      <div className="absolute inset-0 top-16 flex items-center justify-center px-6 pb-24">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={page}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? '110%' : '-110%', opacity: 0, scale: 0.9, rotate: d > 0 ? 6 : -6 }),
              center: { x: 0, opacity: 1, scale: 1, rotate: 0 },
              exit: (d: number) => ({ x: d > 0 ? '-110%' : '110%', opacity: 0, scale: 0.9, rotate: d > 0 ? -6 : 6 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="relative flex h-full w-full max-w-md flex-col items-center justify-center text-center"
          >
            {/* ===== SLIDE 0 · PEMBUKA ===== */}
            {page === 0 && (
              <div className="flex flex-col items-center">
                <Reveal>
                  <img src={photos.cover} alt="Sampul" className="h-36 w-36 rounded-[2rem] border-4 border-white object-cover shadow-[0_8px_30px_rgba(92,70,51,0.18)]" />
                </Reveal>
                <Reveal delay={0.1} className="mt-5">
                  <p className="font-cute text-lg font-bold text-cw-coral">The Wedding Of</p>
                  <h2 className="font-cute text-4xl font-extrabold">{groom} &amp; {bride}</h2>
                  <p className="mt-2 text-sm text-cw-ink/60">{formattedDate}</p>
                </Reveal>
                <div className="mt-6 flex gap-3">
                  <Bob delay={0}><Chibi src={CHIIKAWA.chiikawa} alt="Chiikawa" size={60} /></Bob>
                  <Bob delay={0.4}><Chibi src={CHIIKAWA.hachiware} alt="Hachiware" fallback="🐱" size={60} /></Bob>
                  <Bob delay={0.8}><Chibi src={CHIIKAWA.usagi} alt="Usagi" fallback="🐰" size={60} /></Bob>
                </div>
              </div>
            )}

            {/* ===== SLIDE 1 · SAMBUTAN ===== */}
            {page === 1 && (
              <div className="flex flex-col items-center">
                <Bob><Chibi src={CHIIKAWA.chiikawa} alt="Chiikawa" size={110} /></Bob>
                <Reveal delay={0.15} className="mt-4 max-w-sm">
                  <p className="font-cute text-2xl font-extrabold leading-snug">
                    Halo, <span className="text-cw-coral">{guestName || 'Tamu Istimewa'}!</span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-cw-ink/70">
                    Dengan senang hati kami mengundangmu ikut merayakan hari paling bahagia kami — semanis dan sekecil momen kawaii.
                  </p>
                </Reveal>
                <Reveal delay={0.3}>
                  <button
                    onClick={() => goTo(2)}
                    className="font-cute mt-6 rounded-full bg-cw-blue px-6 py-2.5 font-bold text-white shadow-[0_4px_0_rgba(92,70,51,0.12)]"
                  >
                    Lanjut →
                  </button>
                </Reveal>
              </div>
            )}

            {/* ===== SLIDE 2 · MEMPELAI (flip 3D) ===== */}
            {page === 2 && (
              <div className="flex flex-col items-center">
                <Reveal>
                  <p className="font-cute text-sm font-bold uppercase tracking-[0.3em] text-cw-blue">Sang Mempelai</p>
                  <h2 className="font-cute mt-1 text-3xl font-extrabold">Dua Pemenang Takdir</h2>
                </Reveal>
                <div className="mt-6 flex w-full items-center justify-center gap-4">
                  {[
                    { name: groom, photo: photos.groom, tag: 'Chiikawa', color: 'bg-cw-blue' },
                    { name: bride, photo: photos.bride, tag: 'Usagi', color: 'bg-cw-pink' },
                  ].map((p, i) => (
                    <FlipCard key={p.name} photo={p.photo} name={p.name} tag={p.tag} color={p.color} parents={i === 0 ? groomParents : brideParents} />
                  ))}
                </div>
                <Reveal delay={0.2}>
                  <div className="mt-6 flex items-center gap-2 text-cw-ink/60">
                    <Bob><Chibi src={CHIIKAWA.hachiware} alt="Hachiware" fallback="🐱" size={40} /></Bob>
                    <p className="text-xs font-semibold">ketuk kartu untuk membalik profil</p>
                  </div>
                </Reveal>
              </div>
            )}

            {/* ===== SLIDE 3 · WAKTU (countdown) ===== */}
            {page === 3 && (
              <div className="flex flex-col items-center">
                <Reveal>
                  <p className="font-cute text-sm font-bold uppercase tracking-[0.3em] text-cw-pink">Countdown</p>
                  <h2 className="font-cute mt-1 text-3xl font-extrabold">Tunggu Sebentar Lagi…</h2>
                </Reveal>
                <div className="mt-8 flex justify-center gap-2.5">
                  <JellyNum value={timeLeft.days} label="Hari" />
                  <JellyNum value={timeLeft.hours} label="Jam" />
                  <JellyNum value={timeLeft.minutes} label="Menit" />
                  <JellyNum value={timeLeft.seconds} label="Detik" />
                </div>
                <Reveal delay={0.2}>
                  <div className="mt-7 flex items-center gap-2">
                    <Bob><Chibi src={CHIIKAWA.usagi} alt="Usagi" fallback="🐰" size={52} /></Bob>
                    <p className="max-w-[220px] text-xs text-cw-ink/60">Semakin dekat hari "yatta!" kami ✨</p>
                  </div>
                </Reveal>
              </div>
            )}

            {/* ===== SLIDE 4 · ACARA & LOKASI ===== */}
            {page === 4 && (
              <div className="flex w-full flex-col items-center">
                <Reveal>
                  <p className="font-cute text-sm font-bold uppercase tracking-[0.3em] text-cw-blue">Jadwal Acara</p>
                  <h2 className="font-cute mt-1 text-3xl font-extrabold">Petik &amp; Petik Keberuntungan</h2>
                </Reveal>
                <div className="mt-6 w-full max-w-sm space-y-3">
                  {[
                    { label: 'Akad Nikah', date: formattedAkadDate, time: schedule.akadTime, icon: '💍', color: 'bg-cw-blue' },
                    { label: 'Resepsi', date: formattedResepsiDate, time: schedule.resepsiTime, icon: '🎉', color: 'bg-cw-pink' },
                  ].map((ev, i) => (
                    <Reveal key={ev.label} delay={i * 0.12}>
                      <div className="flex items-center gap-3 rounded-2xl border border-cw-ink/10 bg-white p-4 text-left shadow-[0_4px_0_rgba(92,70,51,0.08)]">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${ev.color}`}>{ev.icon}</span>
                        <div className="flex-1">
                          <p className="font-cute text-lg font-extrabold">{ev.label}</p>
                          <p className="text-xs font-semibold text-cw-ink/70">{ev.date}</p>
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-cw-coral"><Clock3 size={12} /> {ev.time}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
                <Reveal delay={0.2}>
                  <button
                    onClick={() => { window.open(venue.mapsLink, '_blank', 'noopener'); }}
                    className="font-cute mt-5 inline-flex items-center gap-2 rounded-full bg-cw-yellow px-6 py-2.5 font-bold text-cw-ink shadow-[0_4px_0_rgba(92,70,51,0.12)]"
                  >
                    <MapPin size={15} /> {venue.name}
                  </button>
                </Reveal>
              </div>
            )}

            {/* ===== SLIDE 5 · GALERI (polaroid) ===== */}
            {page === 5 && (
              <div className="flex w-full flex-col items-center">
                <Reveal>
                  <p className="font-cute text-sm font-bold uppercase tracking-[0.3em] text-cw-pink">Galeri</p>
                  <h2 className="font-cute mt-1 text-3xl font-extrabold">Tanda Kenangan</h2>
                </Reveal>
                <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3 sm:max-w-none sm:grid-cols-4">
                  {gallery.slice(0, 4).map((url, i) => (
                    <motion.div
                      key={url}
                      initial={{ opacity: 0, y: 24, rotate: i % 2 ? 4 : -4 }}
                      animate={{ opacity: 1, y: 0, rotate: i % 2 ? 3 : -3 }}
                      transition={{ type: 'spring', stiffness: 240, damping: 19, delay: i * 0.1 }}
                      whileHover={{ scale: 1.06, rotate: i % 2 ? -2 : 2 }}
                      className="relative aspect-[4/5]"
                    >
                      <img src={url} alt={`Kenangan ${i + 1}`} className="h-full w-full rounded-2xl border-4 border-white object-cover shadow-[0_6px_20px_rgba(92,70,51,0.16)]" />
                      <span className={`absolute -left-1 -top-2 text-lg drop-shadow ${i === 1 ? '-rotate-12' : i === 2 ? 'rotate-12' : ''}`}>
                        <Chibi
                          src={[CHIIKAWA.chiikawa, CHIIKAWA.hachiware, CHIIKAWA.usagi, CHIIKAWA.chiikawa][i]}
                          alt="stiker"
                          size={34}
                        />
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== SLIDE 6 · HADIAH ===== */}
            {page === 6 && (
              <div className="flex w-full flex-col items-center">
                <Reveal>
                  <p className="font-cute text-sm font-bold uppercase tracking-[0.3em] text-cw-blue">Hadiah</p>
                  <h2 className="font-cute mt-1 text-3xl font-extrabold">Kotak Kejutan 🎁</h2>
                </Reveal>
                <div className="mt-6 w-full max-w-sm space-y-3">
                  {banks.length === 0 ? (
                    <p className="text-sm text-cw-ink/50">Informasi rekening menyusul ya~</p>
                  ) : (
                    banks.map((bank, i) => (
                      <Reveal key={i} delay={i * 0.1}>
                        <div className="flex items-center justify-between gap-3 rounded-2xl border border-cw-ink/10 bg-white p-3 text-left shadow-[0_4px_0_rgba(92,70,51,0.08)]">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cw-mint text-cw-ink"><Gift size={20} /></span>
                          <div className="flex-1">
                            <p className="font-cute text-base font-bold text-cw-coral">{bank.bank}</p>
                            <p className="font-mono text-xs text-cw-ink/70">{bank.number}</p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.8, rotate: [0, -14, 14, 0] }}
                            onClick={(e) => handleCopyRekening(e, bank.number, bank.bank, i)}
                            className="rounded-xl border border-cw-ink/15 bg-cw-yellow/60 p-2.5 text-cw-ink"
                            aria-label={`Salin nomor ${bank.bank}`}
                          >
                            {copiedIndex === i ? <CheckCircle2 size={17} className="text-cw-coral" /> : <Copy size={17} />}
                          </motion.button>
                        </div>
                      </Reveal>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ===== SLIDE 7 · RSVP ===== */}
            {page === 7 && (
              <div className="w-full max-w-sm">
                <Reveal className="text-center">
                  <p className="font-cute text-sm font-bold uppercase tracking-[0.3em] text-cw-pink">RSVP</p>
                  <h2 className="font-cute mt-1 text-3xl font-extrabold">Balas Undangan ya!</h2>
                </Reveal>
                {submittedData ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="mt-6 rounded-2xl border border-cw-ink/10 bg-white p-6 text-center shadow-[0_4px_0_rgba(92,70,51,0.08)]">
                    <motion.div animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.15, duration: 0.5 }} className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-cw-mint text-cw-coral">
                      <CheckCircle2 size={30} />
                    </motion.div>
                    <p className="font-cute text-2xl font-extrabold">Yatta! 🎉</p>
                    <p className="mt-1 text-sm text-cw-ink/60">Konfirmasi {submittedData.guest_name} sudah tercatat.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSendRsvp} className="mt-6 space-y-3 rounded-2xl border border-cw-ink/10 bg-white p-4 text-left shadow-[0_4px_0_rgba(92,70,51,0.08)]">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-cw-ink/50">Nama</label>
                      <input required value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="Nama kamu" className="w-full rounded-xl border border-cw-ink/15 bg-cw-cream/50 p-2.5 text-sm outline-none focus:border-cw-coral" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-cw-ink/50">Status</label>
                        <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)} className="w-full rounded-xl border border-cw-ink/15 bg-cw-cream/50 p-2.5 text-sm outline-none focus:border-cw-coral">
                          <option value="hadir">Hadir 💖</option>
                          <option value="tidak_hadir">Berhalangan</option>
                          <option value="ragu">Masih Ragu</option>
                        </select>
                      </div>
                      <AnimatePresence initial={false}>
                        {rsvpStatus === 'hadir' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                            <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-cw-ink/50">Jumlah</label>
                            <select value={rsvpPax} onChange={(e) => setRsvpPax(Number(e.target.value))} className="w-full rounded-xl border border-cw-ink/15 bg-cw-cream/50 p-2.5 text-sm outline-none focus:border-cw-coral">
                              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} Orang</option>)}
                            </select>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-cw-ink/50">Pesan</label>
                      <textarea required maxLength={100} value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} placeholder="Tulis doa & ucapan..." className="h-20 w-full resize-none rounded-xl border border-cw-ink/15 bg-cw-cream/50 p-2.5 text-sm outline-none focus:border-cw-coral" />
                      <div className="mt-0.5 text-right text-[10px] text-cw-ink/40">{rsvpMessage.length}/100</div>
                    </div>
                    <motion.button type="submit" disabled={isSubmittingRsvp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="font-cute w-full rounded-xl bg-cw-coral py-3 font-bold text-white shadow-[0_4px_0_rgba(92,70,51,0.2)] disabled:opacity-60">
                      {isSubmittingRsvp ? 'Mengirim...' : <span className="inline-flex items-center gap-2"><Send size={15} /> Kirim</span>}
                    </motion.button>
                  </form>
                )}
              </div>
            )}

            {/* ===== SLIDE 8 · UCAPAN ===== */}
            {page === 8 && (
              <div className="flex w-full flex-col items-center">
                <Reveal>
                  <p className="font-cute text-sm font-bold uppercase tracking-[0.3em] text-cw-blue">Ucapan</p>
                  <h2 className="font-cute mt-1 text-3xl font-extrabold">Papan Pesan 💌</h2>
                </Reveal>
                <div className="mt-5 w-full max-w-sm rounded-2xl border border-cw-ink/10 bg-white/70 p-3 shadow-[0_4px_0_rgba(92,70,51,0.08)]">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-cute text-sm font-bold text-cw-ink/60">Doa &amp; harapan</span>
                    <span className="rounded-full bg-cw-mint px-2.5 py-0.5 text-[11px] font-bold text-cw-ink/70">{(data?.rsvps || []).length}</span>
                  </div>
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {(data?.rsvps || []).length === 0 ? (
                      <p className="py-6 text-center text-xs italic text-cw-ink/40">Belum ada pesan. Jadilah yang pertama! 🐻</p>
                    ) : (
                      (data?.rsvps || []).map((item, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.05, 0.4) }} className="rounded-xl border border-cw-ink/10 bg-cw-cream/60 p-2.5 text-left">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cw-yellow/70 text-xs font-bold">{item.guest_name.charAt(0).toUpperCase()}</span>
                            <span className="font-cute text-sm font-bold">{item.guest_name}</span>
                            <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${item.status === 'hadir' ? 'bg-cw-blue/20 text-cw-blue' : item.status === 'tidak_hadir' ? 'bg-cw-pink/30 text-cw-pink' : 'bg-cw-yellow/50 text-cw-ink/60'}`}>
                              {item.status === 'hadir' ? 'Hadir' : item.status === 'tidak_hadir' ? 'Absen' : 'Ragu'}
                            </span>
                          </div>
                          {item.message && <p className="mt-1.5 text-xs text-cw-ink/70">{item.message}</p>}
                          {item.reply && <p className="mt-1 text-[11px] italic text-cw-coral">Mempelai: {item.reply}</p>}
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===== SLIDE 9 · PENUTUP ===== */}
            {page === 9 && (
              <div className="flex flex-col items-center">
                <Bob><Chibi src={CHIIKAWA.usagi} alt="Usagi" fallback="🐰" size={100} /></Bob>
                <Reveal delay={0.1} className="mt-4 max-w-sm">
                  <p className="font-cute text-xl font-extrabold leading-snug">Terima kasih sudah menyaksikan kisah kecil kami!</p>
                  <p className="mt-3 text-sm italic text-cw-ink/70">"{quote}"</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-cw-coral">— {quoteSrc}</p>
                </Reveal>
                <Reveal delay={0.25}>
                  <button onClick={() => goTo(0)} className="font-cute mt-6 rounded-full border-2 border-cw-ink/10 bg-cw-yellow px-7 py-2.5 font-bold text-cw-ink shadow-[0_4px_0_rgba(92,70,51,0.12)]">
                    ↺ Main Lagi
                  </button>
                </Reveal>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── PANAH NAVIGASI KIRI/KANAN ─────────────────────────── */}
      <button
        onClick={() => paginate(-1)}
        disabled={page === 0}
        aria-label="Slide sebelumnya"
        className="fixed left-2 top-1/2 z-40 -translate-y-1/2 rounded-full border border-cw-ink/10 bg-white/85 p-2.5 text-cw-ink shadow-[0_3px_0_rgba(92,70,51,0.12)] disabled:opacity-30"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => paginate(1)}
        disabled={page >= TOTAL - 1}
        aria-label="Slide berikutnya"
        className="fixed right-2 top-1/2 z-40 -translate-y-1/2 rounded-full border border-cw-ink/10 bg-white/85 p-2.5 text-cw-ink shadow-[0_3px_0_rgba(92,70,51,0.12)] disabled:opacity-30"
      >
        <ChevronRight size={20} />
      </button>

      {/* ─── PROGRESS PETAK (bawah) ────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-4 z-40 flex items-center justify-center">
        <div className="flex items-center gap-1.5 rounded-full border border-cw-ink/10 bg-white/80 px-3 py-2 shadow-[0_3px_0_rgba(92,70,51,0.1)]">
          {SLIDES.map((label, i) => (
            <button
              key={label}
              onClick={() => goTo(i)}
              aria-label={`Ke ${label}`}
              className={`flex items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                page === i ? 'h-5 w-5 bg-cw-coral text-white' : 'h-4 w-4 bg-cw-mint text-cw-ink/40 hover:bg-cw-pink'
              }`}
            >
              {page === i ? <Star size={10} fill="currentColor" /> : ''}
            </button>
          ))}
        </div>
      </div>

      {/* ─── FAB MUSIK ─────────────────────────────────────────── */}
      <motion.button
        onClick={toggleAudio}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
        className="fixed bottom-16 right-3 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-cw-blue text-white shadow-[0_4px_0_rgba(92,70,51,0.2)]"
        aria-label={isPlaying ? 'Matikan musik' : 'Nyalakan musik'}
      >
        {isPlaying ? <Pause size={17} /> : <Play size={17} />}
      </motion.button>

      {/* Audio pemutar musik latar */}
      <audio ref={audioRef} src={audioUrl} loop preload="auto" />
      </>
      )}
    </div>
  );
}