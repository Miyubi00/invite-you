// ============================================================
// src/templates/themes/PopCardFiestaTheme.tsx
// ------------------------------------------------------------
// Tema Undangan: Pop Card Fiesta (Kategori: RSVP)
// Konsep       : Karnaval kartu — seluruh undangan disajikan sebagai
//                tumpukan kartu warna-warni berbasis framer-motion.
//                Setiap klik memicu banyak gerakan sekaligus: letupan
//                konfeti di titik sentuh, flip 3D kartu mempelai,
//                accordion kartu acara, wobble kartu kado, judul
//                per-huruf spring, dan lightbox shared-element.
// Warna        : palet MILIK TEMA sendiri (@theme src/index.css):
//                --color-pc-cream #FFF6E9, --color-pc-ink #33224B,
//                --color-pc-coral #FF5D73, --color-pc-sun #FFC93C,
//                --color-pc-mint #2EC4B6. Sengaja TIDAK memakai token
//                --color-brand-* agar tetap konsisten saat situs berubah.
// Dipakai di   : templates/Registry.ts (slug 'pop-card')
// Keterikatan  : types/template, types/database, utils/templateHelpers,
//                hooks/useCountdown, hooks/useCopyToClipboard,
//                templates/shared/useOpenInvitation, framer-motion
// ============================================================

import { useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Gift,
  Heart,
  Loader2,
  MapPin,
  Pause,
  Play,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import type { TemplateProps, RsvpPayload } from '../../types/template';
import type { RsvpRow, RsvpStatus } from '../../types/database';
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

// ─── Kosakata gerak: satu easing agar ritme seluruh tema konsisten ──
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── LETUPAN KONFETI (efek utama "kartu diklik") ───────────────────
interface BurstPoint { id: number; x: number; y: number }

const CONFETTI_COLORS = [
  'var(--color-pc-coral)',
  'var(--color-pc-sun)',
  'var(--color-pc-mint)',
  'var(--color-pc-ink)',
];

function useBursts(): { bursts: BurstPoint[]; spawn: (x: number, y: number) => void } {
  const [bursts, setBursts] = useState<BurstPoint[]>([]);
  const spawn = (x: number, y: number) => {
    const id = Date.now() + Math.random();
    // Maksimal 5 letupan aktif agar aman terhadap spam klik cepat.
    setBursts((prev) => [...prev.slice(-4), { id, x, y }]);
    window.setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== id)), 800);
  };
  return { bursts, spawn };
}

/** 12 serpihan konfeti beterbangan keluar dari satu titik layar. */
function BurstLayer({ bursts }: { bursts: BurstPoint[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[70]" aria-hidden="true">
      {bursts.map((b) => (
        <span key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const dist = 44 + (i % 4) * 16;
            return (
              <motion.span
                key={i}
                className="absolute block rounded-full"
                style={{
                  width: i % 3 === 0 ? 10 : 6,
                  height: i % 3 === 0 ? 10 : 6,
                  backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist - 16,
                  opacity: 0,
                  scale: 0.25,
                  rotate: i % 2 === 0 ? 170 : -170,
                }}
                transition={{ duration: 0.75, ease: EASE_OUT }}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}

/** Scroll-reveal generik antar-section. */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Judul per-huruf: tiap karakter melompat masuk secara bergelombang. */
function BouncyWord({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="inline-block" aria-label={text}>
      {[...text].map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          className="inline-block"
          aria-hidden="true"
          initial={{ opacity: 0, y: 36, rotate: -16, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          transition={{ delay: delay + i * 0.05, type: 'spring', stiffness: 330, damping: 15 }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
  );
}

export default function PopCardFiestaTheme({
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
  const { bursts, spawn } = useBursts();

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
  const groomParents = data?.groom_parents || 'Bpk. Capulet & Ibu Capulet';
  const brideParents = data?.bride_parents || 'Bpk. Montague & Ibu Montague';

  const formattedDate = formatDate(date, 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const akadClock = (schedule.akadTime || '08:00').split(' ')[0].substring(0, 5);
  const timeLeft = useCountdown(date, akadClock);

  // Status UI interaksi
  const [activeImageIdx, setActiveImageIdx] = useState<number | null>(null);
  const activeImage = activeImageIdx !== null ? gallery[activeImageIdx] : null;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [openEvent, setOpenEvent] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<{ groom: boolean; bride: boolean }>({
    groom: false,
    bride: false,
  });

  // Status Form RSVP (pola identik antar-tema RSVP)
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(submittedData?.status || 'hadir');
  const [rsvpPax, setRsvpPax] = useState<number>(submittedData?.pax || 1);
  const [rsvpName, setRsvpName] = useState<string>(submittedData?.guest_name || guestName || '');
  const [rsvpMessage, setRsvpMessage] = useState<string>(submittedData?.message || '');
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(Boolean(submittedData));
  const [wishesList, setWishesList] = useState<RsvpRow[]>(() => data?.rsvps || []);

  const handleCopyRekening = (
    e: React.MouseEvent<HTMLDivElement>,
    number: string,
    bankName: string,
    idx: number,
  ) => {
    copyToClipboard(number, `Nomor Rekening ${bankName}`);
    spawn(e.clientX, e.clientY); // letupan konfeti di titik klik
    setCopiedIndex(idx);
    window.setTimeout(() => setCopiedIndex(null), 2200);
  };

  const handleSendRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    setIsSubmittingRsvp(true);
    const payload: RsvpPayload = {
      status: rsvpStatus,
      pax: Number(rsvpPax),
      message: rsvpMessage.trim(),
    };

    try {
      if (onRsvpSubmit) await onRsvpSubmit(payload);
      if (rsvpMessage.trim()) {
        // Optimistic update ke wall ucapan
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
      console.error('Gagal mengirim RSVP:', err);
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  const coupleCards = [
    { key: 'groom' as const, role: 'Mempelai Pria', name: groom, img: photos.groom, parents: groomParents },
    { key: 'bride' as const, role: 'Mempelai Wanita', name: bride, img: photos.bride, parents: brideParents },
  ];

  return (
    <div className="font-party-body min-h-screen bg-pc-cream text-pc-ink relative overflow-x-hidden selection:bg-pc-coral selection:text-white">
      {/* Font tema + kelas utilitas flip-3D (scoped nama pc-*) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700&display=swap');
        .font-party-display { font-family: 'Baloo 2', sans-serif; }
        .font-party-body { font-family: 'Nunito', sans-serif; }
        .pc-perspective { perspective: 1300px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>

      <audio ref={audioRef} src={audioUrl} loop preload="auto" />
      <BurstLayer bursts={bursts} />

      {/* ─── DEKORASI LATAR: blob permen + glyph melayang naik ─── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <motion.div
          className="absolute -top-24 -left-20 w-72 h-72 rounded-full blur-3xl opacity-30 bg-pc-sun"
          animate={{ y: [0, 30, 0], x: [0, 24, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 -right-24 w-80 h-80 rounded-full blur-3xl opacity-25 bg-pc-mint"
          animate={{ y: [0, -34, 0], x: [0, -20, 0] }}
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* ─── AMPLOP PEMBUKA: kartu tiket karnaval ─── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="cover"
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{
              background:
                'radial-gradient(circle at 50% 25%, var(--color-pc-sun) 0%, var(--color-pc-coral) 55%, var(--color-pc-ink) 150%)',
            }}
            initial={{ opacity: 1 }}
            exit={{ rotateX: -95, y: '12%', opacity: 0, transformOrigin: 'top center' }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
          >
            {/* Konfeti statis yang melayang di atas sampul */}
            {[...Array(14)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute block"
                style={{
                  left: `${(i * 37 + 11) % 100}%`,
                  top: `${(i * 53 + 7) % 100}%`,
                  width: 8 + (i % 3) * 5,
                  height: 8 + (i % 3) * 5,
                  backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  borderRadius: i % 2 === 0 ? '999px' : '4px',
                  opacity: 0.55,
                }}
                animate={{ y: [0, -22, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 5 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
              />
            ))}

            <div className="min-h-full flex items-center justify-center px-6 py-12">
              <motion.div
                className="relative max-w-md w-full rounded-[2rem] bg-pc-cream/95 shadow-2xl border-4 border-dashed border-pc-ink/20 p-8 text-center"
                initial={{ scale: 0.8, rotate: -4, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 18 }}
              >
                <p className="text-xs uppercase tracking-[0.4em] text-pc-ink/60">Tiket Karnaval</p>
                <h1 className="font-party-display font-extrabold text-4xl sm:text-5xl mt-3 leading-tight text-pc-ink">
                  <BouncyWord text={`${groom} & ${bride}`} delay={0.45} />
                </h1>
                <p className="mt-3 text-sm text-pc-ink/70">{formattedDate}</p>

                {guestName && (
                  <motion.div
                    className="mt-5 inline-block bg-white rounded-xl px-5 py-2 shadow border-2 border-pc-sun/70"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.15, type: 'spring', stiffness: 240, damping: 16 }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-pc-ink/50">Untuk</p>
                    <p className="font-bold">{guestName}</p>
                  </motion.div>
                )}

                <motion.button
                  onClick={(e) => {
                    open();
                    spawn(e.clientX, e.clientY);
                  }}
                  whileHover={{ scale: 1.06, rotate: -1.5 }}
                  whileTap={{ scale: 0.9 }}
                  className="mt-7 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-pc-coral text-white font-bold shadow-lg shadow-pc-coral/40 cursor-pointer"
                >
                  <Sparkles size={18} />
                  Tekan &amp; Letupkan!
                </motion.button>
                <p className="mt-4 text-[11px] text-pc-ink/45">Sentuh tombolnya — jangan cuma dilihat</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <main className="relative z-10">
          {/* ─── HERO POLAROID ─── */}
          <section className="pt-16 pb-8 px-5 text-center">
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.45em] text-pc-ink/55">We Are Getting Married</p>
              <h2 className="font-party-display text-4xl sm:text-6xl font-extrabold mt-3 leading-tight">
                {groom} <span className="text-pc-coral">&amp;</span> {bride}
              </h2>
            </Reveal>
            <Reveal delay={0.15} className="mt-9 flex justify-center">
              <motion.div
                className="bg-white p-3 pb-10 rounded-2xl shadow-2xl max-w-sm w-full relative"
                initial={{ rotate: -4, y: 26 }}
                whileInView={{ rotate: 2.5, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
              >
                <img
                  src={photos.cover}
                  alt={`${groom} & ${bride}`}
                  className="rounded-xl w-full aspect-[4/3] object-cover"
                  draggable={false}
                />
                <p className="font-party-display mt-3 text-lg">{formattedDate}</p>
                <motion.span
                  className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-pc-sun flex items-center justify-center shadow-lg"
                  animate={{ rotate: [0, 14, -14, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Heart size={18} fill="white" strokeWidth={0} />
                </motion.span>
              </motion.div>
            </Reveal>
            <Reveal delay={0.2}>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="mt-10 text-pc-ink/40 mx-auto w-fit"
              >
                <ChevronDown size={26} />
              </motion.div>
            </Reveal>
          </section>

          {/* ─── KUTIPAN ─── */}
          <section className="px-5 py-4">
            <Reveal>
              <figure className="max-w-md mx-auto bg-white/80 border-2 border-dashed border-pc-coral/40 rounded-3xl p-6 text-center">
                <Sparkles size={18} className="mx-auto text-pc-coral" />
                <blockquote className="mt-3 text-sm italic leading-relaxed text-pc-ink/80">“{quote}”</blockquote>
                <figcaption className="mt-3 text-[11px] uppercase tracking-[0.3em] text-pc-ink/50">— {quoteSrc}</figcaption>
              </figure>
            </Reveal>
          </section>

          {/* ─── COUNTDOWN JELLY (angka melompat tiap detik) ─── */}
          <section className="px-5 py-10">
            <Reveal>
              <h3 className="font-party-display text-2xl sm:text-3xl font-bold text-center mb-6">Menuju Hari Bahagia</h3>
              <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                {(
                  [
                    ['Hari', timeLeft.days],
                    ['Jam', timeLeft.hours],
                    ['Menit', timeLeft.minutes],
                    ['Detik', timeLeft.seconds],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="bg-pc-ink text-pc-cream rounded-2xl py-3 text-center shadow-lg overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={value}
                        className="block font-party-display text-2xl sm:text-3xl font-extrabold"
                        initial={{ scale: 0.4, y: '80%', opacity: 0, rotate: -10 }}
                        animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.4, y: '-80%', opacity: 0, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                      >
                        {String(value).padStart(2, '0')}
                      </motion.span>
                    </AnimatePresence>
                    <span className="block text-[10px] uppercase tracking-[0.25em] text-pc-cream/60 mt-1">{label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          {/* ─── COUPLE CARD DECK: flip 3D + letupan konfeti ─── */}
          <section className="px-5 py-10">
            <Reveal>
              <h3 className="font-party-display text-3xl font-bold text-center mb-2">Kartu Mempelai</h3>
              <p className="text-center text-sm text-pc-ink/55 mb-7">Ketuk kartunya untuk dibalik!</p>
              <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {coupleCards.map((person) => {
                  const isFlipped = person.key === 'groom' ? flippedCards.groom : flippedCards.bride;
                  return (
                    <div key={person.key} className="pc-perspective h-[26rem]">
                      <motion.div
                        className="relative w-full h-full preserve-3d cursor-pointer"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ type: 'spring', stiffness: 210, damping: 20 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={(e) => {
                          setFlippedCards((prev) => ({ ...prev, [person.key]: !isFlipped }));
                          spawn(e.clientX, e.clientY);
                        }}
                      >
                        {/* SISI DEPAN: foto */}
                        <div className="absolute inset-0 backface-hidden rounded-[2rem] overflow-hidden shadow-xl bg-white">
                          <img src={person.img} alt={person.name} className="w-full h-full object-cover" draggable={false} />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pc-ink/85 to-transparent p-5 pt-16">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">{person.role}</p>
                            <p className="font-party-display text-2xl font-extrabold text-white">{person.name}</p>
                            <p className="mt-1 text-[11px] text-white/75">Ketuk untuk detail</p>
                          </div>
                        </div>
                        {/* SISI BELAKANG: detail orang tua */}
                        <div
                          className="absolute inset-0 backface-hidden rounded-[2rem] overflow-hidden shadow-xl bg-pc-ink text-pc-cream p-6 flex flex-col justify-between"
                          style={{ transform: 'rotateY(180deg)' }}
                        >
                          <div>
                            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] bg-pc-coral text-white px-3 py-1 rounded-full">
                              <Users size={12} /> {person.role}
                            </span>
                            <p className="font-party-display text-3xl font-extrabold mt-4 leading-tight">{person.name}</p>
                            <p className="mt-2 text-sm text-pc-cream/75">{person.parents}</p>
                          </div>
                          <p className="text-[11px] text-pc-cream/50 italic">Ketuk lagi untuk menutup kartu</p>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </section>

          {/* ─── KARTU ACARA: accordion expand dengan layout animation ─── */}
          <section className="px-5 py-10">
            <Reveal>
              <h3 className="font-party-display text-3xl font-bold text-center mb-7">Rangkaian Acara</h3>
              <div className="space-y-4 max-w-xl mx-auto">
                {[
                  {
                    id: 'akad',
                    title: 'Akad Nikah',
                    icon: <Heart size={20} />,
                    time: schedule.akadTime,
                    schedDate: schedule.akadDate,
                    desc: 'Prosesi ijab kabul — inti dari hari bahagia kami.',
                  },
                  {
                    id: 'resepsi',
                    title: 'Resepsi',
                    icon: <CalendarDays size={20} />,
                    time: schedule.resepsiTime,
                    schedDate: schedule.resepsiDate,
                    desc: 'Ramah tamah bersama keluarga besar — mari bertegur sapa.',
                  },
                ].map((ev) => {
                  const isOpenEv = openEvent === ev.id;
                  return (
                    <motion.div
                      key={ev.id}
                      layout
                      onClick={() => setOpenEvent(isOpenEv ? null : ev.id)}
                      className={`bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer border-2 ${isOpenEv ? 'border-pc-coral' : 'border-transparent'}`}
                      whileHover={{ y: -4 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                    >
                      <div className="flex items-center gap-4 p-5">
                        <span
                          className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                            isOpenEv ? 'bg-pc-coral text-white' : 'bg-pc-sun/40 text-pc-ink'
                          }`}
                        >
                          {ev.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-party-display font-bold text-lg leading-tight">{ev.title}</p>
                          <p className="text-xs text-pc-ink/60 truncate">
                            {formatDate(ev.schedDate || date, 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · {ev.time}
                          </p>
                        </div>
                        <motion.span animate={{ rotate: isOpenEv ? 180 : 0 }}>
                          <ChevronDown size={20} className="text-pc-ink/40" />
                        </motion.span>
                      </div>
                      <AnimatePresence initial={false}>
                        {isOpenEv && (
                          <motion.div
                            key="detail"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.45, ease: EASE_OUT }}
                          >
                            <div className="px-5 pb-5 pt-0 space-y-3">
                              <p className="text-sm text-pc-ink/70">{ev.desc}</p>
                              <a
                                href={venue.mapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-pc-coral hover:underline"
                              >
                                <MapPin size={15} /> Lihat lokasi di Google Maps
                              </a>
                              <p className="text-xs text-pc-ink/50 flex items-start gap-1.5">
                                <Clock3 size={13} className="shrink-0 mt-0.5" /> {venue.name} — {venue.address}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </Reveal>
          </section>

          {/* ─── GALERI: dinding polaroid miring + letupan saat klik ─── */}
          <section className="px-5 py-10">
            <Reveal>
              <h3 className="font-party-display text-3xl font-bold text-center mb-7">Dinding Polaroid</h3>
              <div className="columns-2 sm:columns-3 gap-4 max-w-4xl mx-auto [column-fill:_balance]">
                {gallery.map((img, idx) => (
                  <motion.button
                    key={`${img}-${idx}`}
                    layoutId={`pc-photo-${idx}`}
                    onClick={(e) => {
                      setActiveImageIdx(idx);
                      spawn(e.clientX, e.clientY);
                    }}
                    initial={{ opacity: 0, y: 40, rotate: idx % 2 === 0 ? -6 : 6, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, rotate: idx % 2 === 0 ? -2 : 2, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    whileHover={{ scale: 1.06, rotate: 0, zIndex: 10 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: 0.65, ease: EASE_OUT, delay: (idx % 3) * 0.09 }}
                    className="mb-4 block w-full bg-white p-2 pb-6 rounded-xl shadow-lg cursor-pointer break-inside-avoid relative"
                  >
                    <img src={img} alt={`Polaroid ${idx + 1}`} loading="lazy" className="w-full rounded-lg object-cover" draggable={false} />
                    <span className="absolute bottom-1.5 right-3 text-[10px] text-pc-ink/40 italic">#moment {idx + 1}</span>
                  </motion.button>
                ))}
              </div>
            </Reveal>

            {/* Lightbox: shared-element transition dari kartu polaroid */}
            <AnimatePresence>
              {activeImage && (
                <motion.div
                  key="lightbox"
                  className="fixed inset-0 z-50 bg-pc-ink/90 backdrop-blur-sm flex items-center justify-center p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveImageIdx(null)}
                >
                  <motion.figure
                    layoutId={`pc-photo-${activeImageIdx}`}
                    className="bg-white p-3 pb-10 rounded-2xl shadow-2xl relative max-w-lg"
                    transition={{ type: 'spring', stiffness: 190, damping: 24 }}
                  >
                    <img
                      src={activeImage}
                      alt="Foto diperbesar"
                      draggable={false}
                      className="w-full max-h-[70vh] object-contain rounded-xl"
                    />
                    <button
                      onClick={() => setActiveImageIdx(null)}
                      aria-label="Tutup foto"
                      className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-pc-coral text-white flex items-center justify-center shadow-lg cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </motion.figure>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ─── AMPELOP DIGITAL: kartu kado wobble + konfeti ─── */}
          <section className="px-5 py-10">
            <Reveal>
              <h3 className="font-party-display text-3xl font-bold text-center mb-2">Amplop Digital</h3>
              <p className="text-center text-sm text-pc-ink/55 mb-7">Ketuk nomor rekening — salin otomatis + kejutan kecil</p>
              <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
                {banks.length === 0 && (
                  <p className="col-span-full text-center text-sm text-pc-ink/40 italic">Informasi kado menyusul.</p>
                )}
                {banks.map((bank, idx) => (
                  <motion.div
                    key={`${bank.bank}-${bank.number}`}
                    variants={{
                      idle: {},
                      wobble: {
                        scale: [1, 1.06, 0.97, 1.02, 1],
                        rotate: [0, -2, 2, -1, 0],
                        transition: { duration: 0.6, ease: 'easeInOut' },
                      },
                    }}
                    animate={copiedIndex === idx ? 'wobble' : 'idle'}
                    onClick={(e) => handleCopyRekening(e, bank.number, bank.bank, idx)}
                    className="relative bg-gradient-to-br from-white to-pc-sun/25 border-2 border-pc-sun/70 rounded-3xl p-6 shadow-lg cursor-pointer select-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-party-display font-bold text-lg flex items-center gap-2">
                          <Gift size={17} className="text-pc-coral shrink-0" /> {bank.bank}
                        </p>
                        <p className="mt-2 text-xl sm:text-2xl font-extrabold tracking-wider tabular-nums">{bank.number}</p>
                        <p className="mt-1 text-sm text-pc-ink/65 truncate">a.n. {bank.name}</p>
                      </div>
                      <span className="w-10 h-10 rounded-full bg-pc-coral text-white flex items-center justify-center shrink-0 shadow">
                        {copiedIndex === idx ? <CheckCircle2 size={18} /> : <Copy size={16} />}
                      </span>
                    </div>
                    <AnimatePresence>
                      {copiedIndex === idx && (
                        <motion.p
                          key="copied"
                          initial={{ opacity: 0, y: 10, scale: 0.85 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-pc-mint"
                        >
                          Tersalin — lakukan transfer dengan tenang
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </section>

          {/* ─── RSVP: segmented control pil geser ─── */}
          <section className="px-5 py-10">
            <Reveal>
              <h3 className="font-party-display text-3xl font-bold text-center mb-7">Konfirmasi Kehadiran</h3>
              {rsvpSuccess ? (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                  className="max-w-md mx-auto bg-white rounded-3xl border-2 border-pc-mint/60 p-8 text-center shadow-lg"
                >
                  <motion.span
                    className="mx-auto w-16 h-16 rounded-full bg-pc-mint text-white flex items-center justify-center"
                    animate={{ scale: [0.6, 1.15, 1], rotate: [-14, 8, 0] }}
                    transition={{ duration: 0.7, ease: EASE_OUT }}
                  >
                    <CheckCircle2 size={30} />
                  </motion.span>
                  <p className="font-party-display font-bold text-xl mt-4">Terima kasih!</p>
                  <p className="text-sm text-pc-ink/65 mt-1">
                    Konfirmasimu sudah kami catat:{' '}
                    <strong>
                      {rsvpStatus === 'hadir'
                        ? `Hadir (${rsvpPax} orang)`
                        : rsvpStatus === 'ragu'
                          ? 'Masih ragu'
                          : 'Tidak hadir'}
                    </strong>
                    .
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSendRsvp}
                  className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-pc-ink/10 space-y-5"
                >

                  <div className="grid grid-cols-3 gap-1 bg-pc-cream rounded-full p-1 relative">
                    {(
                      [
                        ['hadir', 'Hadir'],
                        ['ragu', 'Ragu'],
                        ['tidak_hadir', 'Berhalangan'],
                      ] as const
                    ).map(([value, label]) => {
                      const selected = rsvpStatus === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRsvpStatus(value)}
                          className={`relative py-2 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                            selected ? 'text-white' : 'text-pc-ink/60'
                          }`}
                        >
                          {selected && (
                            <motion.span
                              layoutId="pc-rsvp-pill"
                              className="absolute inset-0 rounded-full bg-pc-coral shadow"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {rsvpStatus !== 'tidak_hadir' && (
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-pc-ink/50">Jumlah Tamu</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={rsvpPax}
                        onChange={(e) => setRsvpPax(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-xl border border-pc-ink/15 bg-pc-cream/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pc-coral/50"
                      />
                    </label>
                  )}

                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-pc-ink/50">Nama</span>
                    <input
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="Nama kamu"
                      className="mt-1.5 w-full rounded-xl border border-pc-ink/15 bg-pc-cream/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pc-coral/50"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-pc-ink/50">Ucapan &amp; Doa</span>
                    <textarea
                      rows={3}
                      value={rsvpMessage}
                      onChange={(e) => setRsvpMessage(e.target.value)}
                      placeholder="Titipkan doa terbaikmu…"
                      className="mt-1.5 w-full resize-none rounded-xl border border-pc-ink/15 bg-pc-cream/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pc-coral/50"
                    />
                  </label>

                  <motion.button
                    type="submit"
                    disabled={isSubmittingRsvp}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.93 }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-pc-ink text-pc-cream font-bold disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmittingRsvp ? (
                      <>
                        <Loader2 size={17} className="animate-spin" /> Mengirim…
                      </>
                    ) : (
                      <>
                        <Send size={17} /> Kirim Konfirmasi
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* Wall ucapan (optimistic update, layout spring) */}
              {wishesList.length > 0 && (
                <div className="max-w-md mx-auto mt-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-pc-ink/45 mb-3 flex items-center gap-1.5">
                    <Users size={14} /> {wishesList.length} Ucapan Masuk
                  </p>
                  <div className="max-h-72 space-y-3 pr-1 chat-scroll">
                    <AnimatePresence initial={false}>
                      {wishesList.map((wish) => (
                        <motion.article
                          key={wish.id}
                          layout
                          initial={{ opacity: 0, y: -16, rotate: -2, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                          className="bg-white rounded-2xl p-4 border border-pc-sun/50 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-sm">{wish.guest_name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                wish.status === 'hadir' ? 'bg-pc-coral/15 text-pc-ink' : 'bg-pc-ink/10 text-pc-ink/50'
                              }`}
                            >
                              {wish.status === 'hadir'
                                ? `Hadir · ${wish.pax}`
                                : wish.status === 'ragu'
                                  ? 'Ragu'
                                  : 'Tidak Hadir'}
                            </span>
                          </div>
                          <p className="text-sm text-pc-ink/80 leading-relaxed">{wish.message}</p>
                        </motion.article>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </Reveal>
          </section>

          {/* ─── CLOSING ─── */}
          <footer className="pt-10 pb-8 px-5 text-center border-t-2 border-dashed border-pc-coral/30">
            <Reveal>
              <p className="text-sm italic text-pc-ink/70 max-w-sm mx-auto leading-relaxed">
                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan
                memberikan doa restu kepada kami.
              </p>
              <motion.div
                className="mx-auto mt-8 w-14 h-14 rounded-full bg-pc-coral text-white flex items-center justify-center shadow-xl"
                animate={{ scale: [1, 1.18, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2.6, repeat: Infinity }}
              >
                <Heart size={22} fill="currentColor" strokeWidth={0} />
              </motion.div>
              <h4 className="font-party-display text-3xl sm:text-4xl font-extrabold mt-4">
                {groom} &amp; {bride}
              </h4>
              <p className="text-xs text-pc-ink/55 mt-1">Beserta Keluarga Besar</p>
              <p className="pt-8 text-[11px] text-pc-ink/40 tracking-wider">Pop Card Fiesta · LoVerse Digital Invitation</p>
            </Reveal>
          </footer>
        </main>
      )}

      {/* ─── TOMBOL MUSIK MELAYANG ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.button
            key="music"
            onClick={toggleAudio}
            initial={{ opacity: 0, scale: 0, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            aria-label={isPlaying ? 'Jeda musik' : 'Putar musik'}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-pc-ink text-pc-cream shadow-xl flex items-center justify-center cursor-pointer"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
