// ============================================================
// src/templates/themes/SpidermanTheme.tsx
// ------------------------------------------------------------
// Tema Undangan: Into The Love-Verse (Kategori: RSVP)
// Konsep       : SPIDER-VERSE — grafik & art style mengikuti film
//                Spider-Man: Into the Spider-Verse: halftone dots,
//                glitch chromatic-aberration, panel komik dengan
//                hard-shadow, onomatopoeia ala buku komik, garis
//                aksi diagonal, dan logo spider SVG inline.
// Font         : Bangers (judul komik sangar) + Archivo Black +
//                Permanent Marker + Nunito. Di-import via <style>.
// Aset         : SVG/CSS inline semua (logo spider, web divider,
//                bubble onomatopoeia) tanpa hotlink eksternal.
// Warna        : ink #141414, spider-red #E2231A, cyan #00E5FF,
//                pink #FF1966, bone #F7F2EA.
// Dipakai di   : templates/Registry.ts (slug 'spiderman')
// Keterikatan  : types/template, types/database, utils/templateHelpers,
//                hooks/useCountdown, hooks/useCopyToClipboard,
//                templates/shared/useOpenInvitation, framer-motion
// ============================================================

import { useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Gift,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  PartyPopper,
  Pause,
  Play,
  Send,
  Sparkles,
} from 'lucide-react';
import type { TemplateProps, RsvpPayload } from '../../types/template';
import type { RsvpStatus, RsvpRow } from '../../types/database';
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

const EASE = [0.22, 1, 0.36, 1] as const;

// Reveal lokal: fade-up saat elemen masuk viewport
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.65, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* Emblem laba-laba — simbol dada khas Spider-Man (SVG inline) */
function SpiderLogo({
  size = 96,
  color = '#fff',
  className = '',
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="Emblem laba-laba">
      {/* Badan: kepala + abdomen teardrop */}
      <g fill={color}>
        <circle cx="50" cy="28" r="9" />
        <ellipse cx="50" cy="58" rx="18" ry="22" />
      </g>
      {/* Kaki: 4 pasang dengan siku khas */}
      <g stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M43 24 L30 12 L14 10" />
        <path d="M57 24 L70 12 L86 10" />
        <path d="M40 40 L26 34 L10 38" />
        <path d="M60 40 L74 34 L90 38" />
        <path d="M40 56 L26 62 L12 70" />
        <path d="M60 56 L74 62 L88 70" />
        <path d="M44 70 L34 84 L20 92" />
        <path d="M56 70 L66 84 L80 92" />
      </g>
    </svg>
  );
}

/* Masker Spider-Man ala Into the Spider-Verse — mata putih besar (SVG inline) */
function SpiderMask({ size = 160, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className} aria-label="Masker Spider-Man">
      {/* Wajah merah */}
      <path
        d="M100 14
           C138 14 154 32 158 52
           C162 70 156 86 148 96
           C134 114 112 126 100 130
           C88 126 66 114 52 96
           C44 86 38 70 42 52
           C46 32 62 14 100 14 Z"
        fill="#E2231A"
        stroke="#141414"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Benang jaring hitam di wajah */}
      <g stroke="#141414" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M66 66 C 58 84 60 104 72 124" />
        <path d="M134 66 C 142 84 140 104 128 124" />
        <path d="M50 58 C 36 70 34 86 44 100" />
        <path d="M150 58 C 164 70 166 86 156 100" />
        <path d="M78 44 C 88 32 112 32 122 44" />
        <path d="M52 110 C 72 122 128 122 148 110" />
      </g>
      {/* Mata putih khas */}
      <path
        d="M50 54 C 62 44 74 44 86 60 C 80 70 62 74 52 68 C 46 62 46 58 50 54 Z"
        fill="#F4F4F4"
        stroke="#141414"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M150 54 C 138 44 126 44 114 60 C 120 70 138 74 148 68 C 154 62 154 58 150 54 Z"
        fill="#F4F4F4"
        stroke="#141414"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Jaring divider — benang web dengan spider kecil di tengah */
function WebDivider() {
  return (
    <div className="relative mx-auto h-16 w-56">
      <svg viewBox="0 0 200 60" className="h-full w-full">
        <path d="M10 55 C 55 5, 145 5, 190 55" stroke="#141414" strokeWidth="3" fill="none" />
        <path d="M40 50 C 62 35, 82 32, 100 33" stroke="#E2231A" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M170 50 C 148 35, 128 32, 110 33" stroke="#00E5FF" strokeWidth="2" fill="none" opacity="0.6" />
      </svg>
      <span className="absolute -top-1 left-1/2 -translate-x-1/2">
        <SpiderLogo size={26} color="#141414" />
      </span>
    </div>
  );
}

/* Gelembung onomatopoeia ala komik */
function Boom({ text, className = '' }: { text: string; className?: string }) {
  return <span className={`sm-boom inline-block ${className}`}>{text}</span>;
}

export default function SpidermanTheme({
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
  // Amplop & pemutar musik (pola bersama antar-tema)
  const { isOpen, open, playing: isPlaying, toggle: toggleAudio } = useOpenInvitation(audioRef, 900);

  const venue = resolveVenue(data);
  const schedule = resolveSchedule(data, date);
  const gallery = resolveGallery(data);
  const banks = resolveBanks(data);
  const photos = resolvePhotos(data);
  const hasGroomPhoto = Boolean(data?.groom_photo);
  const hasBridePhoto = Boolean(data?.bride_photo);
  const quote =
    data?.quote ||
    'Dengan kuasa besar datang tanggung jawab besar — dan tanggung jawab terbesar kami adalah saling menjaga selamanya.';
  const quoteSrc = data?.quote_src || '— The Amazing Spider-Couple';
  const audioUrl = data?.audio_url || 'https://r2.loverse.my.id/defaults/audio/ee2e74c72c.mp3';

  const formattedDate = formatDate(date, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const akadClock = (schedule.akadTime || '08:00').split(' ')[0].substring(0, 5);
  const timeLeft = useCountdown(date, akadClock);
  const fmt = (v?: string) =>
    formatDate(v || date, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const akadDateText = fmt(schedule.akadDate);
  const resepsiDateText = fmt(schedule.resepsiDate);

  // ─── STATE RSVP & SALIN ──────────────────────────────────
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [rsvpSuccess, setRsvpSuccess] = useState(Boolean(submittedData));
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(submittedData?.status || 'hadir');
  const [rsvpPax, setRsvpPax] = useState<number>(submittedData?.pax || 1);
  const [rsvpName, setRsvpName] = useState<string>(submittedData?.guest_name || guestName || '');
  const [rsvpMessage, setRsvpMessage] = useState<string>(submittedData?.message || '');
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [wishesList, setWishesList] = useState<RsvpRow[]>(() => data?.rsvps || []);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const handleCopyRekening = (e: React.MouseEvent<HTMLElement>, num: string, bank: string, idx: number) => {
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
      console.error('[Spiderman] RSVP fail', err);
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  return (
    <div className="sm-body sm-web-light min-h-screen w-full overflow-x-hidden bg-[#F7F2EA] text-[#141414]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Permanent+Marker&family=Archivo+Black&family=Nunito:wght@600;700;800;900&display=swap');
        .sm-body { font-family: 'Nunito', sans-serif; }
        .sm-comic { font-family: 'Bangers', cursive; letter-spacing: .03em; }
        .sm-marker { font-family: 'Permanent Marker', cursive; }
        .sm-archivo { font-family: 'Archivo Black', sans-serif; }
        .sm-halftone { background-image: radial-gradient(rgba(20,20,20,.16) 1.5px, transparent 1.5px); background-size: 10px 10px; }
        .sm-title { font-family: 'Bangers', cursive; color: #141414; text-shadow: 3px 3px 0 #FF1966, -3px -3px 0 #00E5FF; letter-spacing: .02em; }
        .sm-boom { font-family: 'Bangers', cursive; color: #E2231A; text-shadow: 2px 2px 0 #141414; }
        .sm-panel { border: 3px solid #141414; box-shadow: 8px 8px 0 #141414; }
        .sm-panel-sm { border: 3px solid #141414; box-shadow: 5px 5px 0 #141414; }
        .sm-tilt { transform: rotate(-1.8deg); }
        .sm-tilt-r { transform: rotate(1.8deg); }
        @keyframes sm-glitch {
          0%, 100% { transform: translate(0,0); text-shadow: 4px 0 0 #FF1966, -4px 0 0 #00E5FF; }
          20% { transform: translate(-3px,1px); text-shadow: 5px 1px 0 #00E5FF, -5px -1px 0 #FF1966; }
          40% { transform: translate(3px,-1px); text-shadow: -4px 0 0 #FF1966, 4px 0 0 #00E5FF; }
          60% { transform: translate(-2px,2px); text-shadow: 4px 2px 0 #00E5FF, -4px -2px 0 #FF1966; }
          80% { transform: translate(2px,-2px); text-shadow: -5px 0 0 #FF1966, 5px 0 0 #00E5FF; }
        }
        .sm-glitch { animation: sm-glitch 1.4s steps(2, jump-none) infinite; }
        .sm-web-bg {
          background-color: #141414;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Cg fill='none' stroke='%23FFFFFF' stroke-opacity='0.09' stroke-width='1.6'%3E%3Cpath d='M75 0V150 M0 75H150 M0 0L150 150 M150 0L0 150'/%3E%3Ccircle cx='75' cy='75' r='20'/%3E%3Ccircle cx='75' cy='75' r='40'/%3E%3Ccircle cx='75' cy='75' r='60'/%3E%3Ccircle cx='75' cy='75' r='80'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 150px 150px;
        }
        .sm-web-light {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Cg fill='none' stroke='%23141414' stroke-opacity='0.085' stroke-width='1.5'%3E%3Cpath d='M75 0V150 M0 75H150 M0 0L150 150 M150 0L0 150'/%3E%3Ccircle cx='75' cy='75' r='20'/%3E%3Ccircle cx='75' cy='75' r='40'/%3E%3Ccircle cx='75' cy='75' r='60'/%3E%3Ccircle cx='75' cy='75' r='80'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 150px 150px;
        }
      `}</style>

      {/* ─── COVER: DIMENSI SPIDER-VERSE ─────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="cover"
            className="sm-web-bg fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-6 text-center"
            exit={{ opacity: 0, scale: 1.15, filter: 'blur(8px)' }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {/* Aksen diagonal ala poster komik */}
            <div className="sm-halftone pointer-events-none absolute inset-0" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="pointer-events-none absolute -left-24 top-1/4 h-[130%] w-16 -rotate-[24deg] bg-[#E2231A]"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="pointer-events-none absolute -right-24 bottom-1/4 h-[130%] w-16 rotate-[24deg] bg-[#00E5FF]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 16 }}
            >
              <SpiderMask size={100} className="drop-shadow-[0_8px_24px_rgba(226,35,26,0.45)]" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="sm-marker mt-4 text-sm text-[#00E5FF]"
            >
              great power comes with great responsibility
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
              className="sm-title sm-glitch mt-3 text-6xl leading-none sm:text-7xl"
            >
              THE LOVE-VERSE
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="mt-4 text-sm font-extrabold text-white/70"
            >
              {groom} <span className="text-[#FF1966]">&amp;</span> {bride}
            </motion.p>

            {guestName && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, type: 'spring', stiffness: 220, damping: 18 }}
                className="mt-6 rounded-2xl border-2 border-white/15 bg-white/10 px-6 py-2.5 backdrop-blur"
              >
                <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/50">Kepada tamu istimewa</p>
                <p className="sm-comic text-xl text-white">{guestName}</p>
              </motion.div>
            )}

            <motion.button
              onClick={() => open()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94, y: 4 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="sm-comic mt-8 rounded-2xl bg-[#E2231A] px-10 py-4 text-2xl text-white shadow-[0_8px_0_#8F1410]"
            >
              THWIP! MASUK
            </motion.button>
            <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/40">
              Masuk ke dimensi cinta kami
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <main className="relative z-10 mx-auto max-w-lg px-5 pb-16 pt-14">
          {/* ─── HERO BANNER ─────────────────────────────────────── */}
          <div className="sm-panel sm-web-bg relative overflow-hidden rounded-[2rem] px-6 py-12 text-center">
            <div className="sm-halftone pointer-events-none absolute inset-0" />
            {/* Watermark masker Spider-Man di pojok hero */}
            <SpiderMask
              size={150}
              className="pointer-events-none absolute -right-10 -top-8 -rotate-12 opacity-25"
            />
            <motion.span
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-3 -top-2"
            >
              <Boom text="BAM!" className="text-4xl" />
            </motion.span>
            <span className="sm-marker relative text-xs uppercase tracking-[0.3em] text-[#00E5FF]">Wedding Invitation</span>
            <h2 className="sm-comic relative mt-3 text-5xl leading-none text-white sm:text-6xl">
              {groom} <span className="text-[#FF1966]">&amp;</span> {bride}
            </h2>
            <p className="relative mt-4 inline-block rounded-full bg-[#E2231A] px-5 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white">
              {formattedDate}
            </p>
            <p className="relative mt-4 text-sm font-bold text-white/60">{venue.name}</p>
          </div>

          <div className="mt-6 flex justify-center">
            <WebDivider />
          </div>

          {/* ─── MEMPELAI: DUA PAHLAWAN ──────────────────────────── */}
          <Reveal className="mt-6 text-center">
            <h3 className="sm-title text-4xl">Dua Pahlawan</h3>
            <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.3em] text-[#141414]/50">
              The Amazing Groom &amp; The Spectacular Bride
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { name: groom, role: 'The Groom', c: '#E2231A', photo: photos.groom, hasPhoto: hasGroomPhoto },
              { name: bride, role: 'The Bride', c: '#00E5FF', photo: photos.bride, hasPhoto: hasBridePhoto },
            ].map((p, i) => (
              <Reveal key={p.role} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -6, rotate: i === 0 ? -1.5 : 1.5 }}
                  className={`sm-panel-sm rounded-2xl bg-white p-4 text-center ${i === 0 ? 'sm-tilt' : 'sm-tilt-r'}`}
                >
                  <div
                    className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-[3px] border-[#141414]"
                    style={{ backgroundColor: p.c, boxShadow: '4px 4px 0 #141414' }}
                  >
                    {p.hasPhoto && p.photo ? (
                      <img
                        src={p.photo}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <SpiderMask size={76} />
                      </div>
                    )}
                  </div>
                  <p className="sm-comic mt-3 truncate text-2xl leading-snug">{p.name}</p>
                  <p className="sm-marker text-xs text-[#141414]/60">{p.role}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* ─── COUNTDOWN: D-DAY COUNTDOWN ──────────────────────── */}
          <Reveal className="mt-14">
            <div className="sm-panel rounded-2xl bg-[#141414] p-6 text-center">
              <p className="sm-marker text-xs text-[#FF1966]">counting down…</p>
              <p className="sm-comic mt-2 text-3xl text-white">D-Day Countdown</p>
              <div className="mt-5 flex justify-center gap-2.5">
                {[
                  { v: timeLeft.days, l: 'Days', c: '#E2231A' },
                  { v: timeLeft.hours, l: 'Hrs', c: '#00E5FF' },
                  { v: timeLeft.minutes, l: 'Min', c: '#FF1966' },
                  { v: timeLeft.seconds, l: 'Sec', c: '#F5CD30' },
                ].map(({ v, l, c }) => (
                  <div key={l} className="w-16 rounded-xl border-2 border-white/15 bg-white/5 py-2.5 sm:w-[4.5rem]">
                    <span className="sm-comic block text-3xl" style={{ color: c }}>{String(v).padStart(2, '0')}</span>
                    <span className="block text-[9px] font-extrabold uppercase tracking-widest text-white/40">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ─── ACARA: DUA MISI RAHASIA ──────────────────────────── */}
          <Reveal className="mt-14 text-center">
            <h3 className="sm-title text-4xl">Dua Misi Rahasia</h3>
            <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.3em] text-[#141414]/50">
              Tanggal bahagia kami
            </p>
          </Reveal>
          <div className="mt-8 space-y-4">
            {[
              { title: 'Akad Nikah', date: akadDateText, time: schedule.akadTime, c: '#E2231A', icon: CalendarDays },
              { title: 'Resepsi', date: resepsiDateText, time: schedule.resepsiTime, c: '#00E5FF', icon: PartyPopper },
            ].map((ev, i) => (
              <Reveal key={ev.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="sm-panel-sm flex items-center gap-4 rounded-2xl bg-white p-4"
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-[#141414] text-white"
                    style={{ backgroundColor: ev.c }}
                  >
                    <ev.icon size={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="sm-comic text-2xl leading-tight">{ev.title}</p>
                    <p className="text-xs font-extrabold text-[#141414]/60">{ev.date}</p>
                    <p className="inline-flex items-center gap-1 text-xs font-extrabold" style={{ color: ev.c }}>
                      <Clock3 size={12} /> {ev.time} WIB
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* ─── LOKASI ───────────────────────────────────────────── */}
          <Reveal className="mt-10">
            <div className="sm-panel rounded-2xl bg-[#F7F2EA] p-6 text-center">
              <MapPin size={26} className="mx-auto text-[#E2231A]" />
              <h4 className="sm-comic mt-2 text-2xl">{venue.name}</h4>
              <p className="mt-1 text-xs font-bold text-[#141414]/60">{venue.address}</p>
              <motion.a
                href={venue.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.94 }}
                className="sm-comic mt-4 inline-flex items-center gap-2 rounded-xl bg-[#141414] px-6 py-2.5 text-white shadow-[0_5px_0_#00E5FF]"
              >
                <Navigation size={15} /> SWING KE MAPS
              </motion.a>
            </div>
          </Reveal>

          {/* ─── GALERI: KOMIK KENANGAN ───────────────────────────── */}
          <Reveal className="mt-14 text-center">
            <h3 className="sm-title text-4xl">Komik Kenangan</h3>
            <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.3em] text-[#141414]/50">
              Panel-panel momen kami
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {gallery.slice(0, 8).map((url, i) => (
              <Reveal key={url} delay={i * 0.05}>
                <motion.button
                  onClick={() => setActiveImage(url)}
                  whileHover={{ scale: 1.04, rotate: i % 2 ? 2 : -2 }}
                  className={`sm-panel-sm block w-full overflow-hidden rounded-xl bg-white p-1.5 ${i % 2 ? 'sm-tilt-r' : 'sm-tilt'}`}
                >
                  <img src={url} alt={`Kenangan ${i + 1}`} loading="lazy" className="aspect-[4/5] w-full rounded-lg object-cover" />
                </motion.button>
              </Reveal>
            ))}
          </div>

          {/* Lightbox galeri */}
          <AnimatePresence>
            {activeImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveImage(null)}
                className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-6"
              >
                <motion.img
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.7 }}
                  src={activeImage}
                  alt="Preview"
                  className="max-h-[80vh] w-auto rounded-2xl border-4 border-white"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── KUTIPAN: SPEECH BUBBLE ───────────────────────────── */}
          <Reveal className="mt-14">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="sm-panel relative mx-auto max-w-sm rounded-2xl rounded-bl-sm bg-white p-5"
            >
              <span className="absolute -left-2 -top-3 rounded-full border-[3px] border-[#141414] bg-[#E2231A] p-1 text-white">
                <SpiderLogo size={22} color="#fff" />
              </span>
              <p className="text-sm font-extrabold leading-relaxed">"{quote}"</p>
              <p className="sm-marker mt-3 text-right text-sm text-[#E2231A]">{quoteSrc}</p>
            </motion.div>
          </Reveal>

          {/* ─── HADIAH: WEB OF GIFTS ─────────────────────────────── */}
          <Reveal className="mt-14 text-center">
            <h3 className="sm-title text-4xl">Web Of Gifts</h3>
            <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.3em] text-[#141414]/50">
              Kado &amp; tanda kasih untuk pengantin
            </p>
          </Reveal>
          <div className="mt-8 space-y-3">
            {banks.length === 0 ? (
              <Reveal>
                <p className="text-center text-sm font-bold text-[#141414]/50">Jaring kado menyusul ya!</p>
              </Reveal>
            ) : (
              banks.map((bank, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="sm-panel-sm flex items-center justify-between gap-3 rounded-2xl bg-white p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] border-[#141414] bg-[#00E5FF]">
                        <Gift size={18} className="text-[#141414]" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#E2231A]">{bank.bank}</p>
                        <p className="break-all text-xs font-bold text-[#141414]/70">{bank.number}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => handleCopyRekening(e, bank.number, bank.bank, i)}
                      className="rounded-lg border-[3px] border-[#141414] bg-[#E2231A] p-2 text-white shadow-[3px_3px_0_0_#141414]"
                      aria-label={`Salin nomor ${bank.bank}`}
                    >
                      {copiedIndex === i ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </motion.button>
                  </motion.div>
                </Reveal>
              ))
            )}
          </div>

          {/* ─── RSVP: JOIN THE PARTY ─────────────────────────────── */}
          <Reveal className="mt-14 text-center">
            <h3 className="sm-title text-4xl">Join The Party</h3>
            <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.3em] text-[#141414]/50">
              Konfirmasi kehadiran &amp; kirim ucapan
            </p>
          </Reveal>

          <Reveal className="mt-8">
            <div className="sm-panel rounded-2xl bg-white p-5">
              {rsvpSuccess ? (
                <div className="py-8 text-center">
                  <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#E2231A] text-white shadow-[4px_4px_0_0_#141414]">
                    <CheckCircle2 size={26} />
                  </span>
                  <p className="sm-comic text-2xl">Nice Try, Hero!</p>
                  <p className="mt-2 text-xs font-bold text-[#141414]/60">
                    Ucapanmu sudah masuk ke jaring kami. Sampai jumpa di pesta!
                  </p>
                  <button
                    onClick={() => setRsvpSuccess(false)}
                    className="mt-4 text-xs font-extrabold text-[#E2231A] underline underline-offset-4"
                  >
                    Ubah jawaban
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendRsvp} className="space-y-4 text-left">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#141414]/50">
                      Identitas pahlawan
                    </label>
                    <input
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="Nama lengkap"
                      className="w-full rounded-xl border-[3px] border-[#141414] bg-[#F7F2EA] px-3.5 py-2.5 text-sm font-extrabold outline-none focus:border-[#E2231A]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#141414]/50">
                        Status
                      </label>
                      <select
                        value={rsvpStatus}
                        onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                        className="w-full rounded-xl border-[3px] border-[#141414] bg-[#F7F2EA] px-3.5 py-2.5 text-sm font-extrabold outline-none focus:border-[#E2231A]"
                      >
                        <option value="hadir">Hadir 💖</option>
                        <option value="ragu">Masih Ragu</option>
                        <option value="tidak_hadir">Berhalangan</option>
                      </select>
                    </div>
                    <AnimatePresence initial={false}>
                      {rsvpStatus === 'hadir' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#141414]/50">
                            Jumlah
                          </label>
                          <select
                            value={rsvpPax}
                            onChange={(e) => setRsvpPax(Number(e.target.value))}
                            className="w-full rounded-xl border-[3px] border-[#141414] bg-[#F7F2EA] px-3.5 py-2.5 text-sm font-extrabold outline-none focus:border-[#E2231A]"
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>{n} Orang</option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#141414]/50">
                      Pesan singkat
                    </label>
                    <textarea
                      required
                      maxLength={160}
                      value={rsvpMessage}
                      onChange={(e) => setRsvpMessage(e.target.value)}
                      placeholder="Tulis doa &amp; ucapan buat kami..."
                      className="h-20 w-full resize-none rounded-xl border-[3px] border-[#141414] bg-[#F7F2EA] px-3.5 py-2.5 text-sm font-extrabold outline-none focus:border-[#E2231A]"
                    />
                    <div className="mt-1 text-right text-[10px] font-bold text-[#141414]/40">{rsvpMessage.length}/160</div>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isSubmittingRsvp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="sm-comic w-full rounded-2xl bg-[#E2231A] py-3.5 text-2xl text-white shadow-[0_6px_0_#8F1410] disabled:opacity-60"
                  >
                    {isSubmittingRsvp ? (
                      <Loader2 className="mx-auto animate-spin" size={22} />
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2"><Send size={17} /> SEND!</span>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </Reveal>

          {/* ─── UCAPAN PARA PAHLAWAN ─────────────────────────────── */}
          <div className="mt-8 space-y-3">
            {wishesList.length === 0 ? (
              <Reveal>
                <p className="text-center text-xs font-bold text-[#141414]/40">
                  Belum ada ucapan — jadi hero pertama yang ngasih pesan!
                </p>
              </Reveal>
            ) : (
              wishesList.slice(0, 12).map((w) => (
                <Reveal key={w.id} className="text-left">
                  <div className="sm-panel-sm rounded-xl bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-extrabold">{w.guest_name}</p>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white"
                        style={{
                          backgroundColor:
                            w.status === 'hadir' ? '#E2231A' : w.status === 'ragu' ? '#F5CD30' : '#6B7280',
                          color: w.status === 'ragu' ? '#141414' : '#fff',
                        }}
                      >
                        {w.status === 'hadir' ? 'Hadir' : w.status === 'ragu' ? 'Ragu' : 'Tidak Hadir'}
                      </span>
                    </div>
                    {w.message && <p className="mt-1.5 text-sm leading-relaxed text-[#141414]/75">{w.message}</p>}
                  </div>
                </Reveal>
              ))
            )}
          </div>

          {/* ─── FOOTER: THE END ──────────────────────────────────── */}
          <Reveal className="mt-16 text-center">
            <div className="sm-panel sm-web-bg relative overflow-visible rounded-2xl p-6">
              <span className="absolute -top-4 right-2 text-3xl">
                <Boom text="THE END!" />
              </span>
              <SpiderLogo size={44} color="#E2231A" className="mx-auto" />
              <p className="sm-marker mt-3 text-xs text-[#00E5FF]">to be continued… in forever</p>
              <p className="mt-3 text-sm font-bold leading-relaxed text-white/70">
                Terima kasih sudah menjadi bagian dari kisah kami. Dengan kuasa cinta yang besar,
                kami mengundangmu merayakan hari bahagia kami.
              </p>
              <h4 className="sm-comic mt-4 text-4xl text-white">
                {groom} <span className="text-[#FF1966]">&amp;</span> {bride}
              </h4>
              <p className="mt-1 text-xs font-extrabold text-white/50">Beserta keluarga besar</p>
            </div>
            <div className="mt-6 flex justify-center">
              <Sparkles size={18} className="mr-1 text-[#FF1966]" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#141414]/40">
                Into The Love-Verse • LoVerse Digital Invitation
              </p>
            </div>
          </Reveal>
        </main>
      )}

      {/* ─── FAB MUSIK ─────────────────────────────────────────────── */}
      {isOpen && (
        <motion.button
          onClick={toggleAudio}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
          className="fixed bottom-16 right-3 z-[70] flex h-11 w-11 items-center justify-center rounded-full bg-[#E2231A] text-white shadow-[0_4px_0_#8F1410]"
          aria-label={isPlaying ? 'Matikan musik' : 'Nyalakan musik'}
        >
          {isPlaying ? <Pause size={17} /> : <Play size={17} />}
        </motion.button>
      )}

      {/* Audio pemutar musik latar */}
      <audio ref={audioRef} src={audioUrl} loop preload="auto" />
    </div>
  );
}