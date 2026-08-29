// ============================================================
// src/templates/themes/OceanVowsTheme.tsx
// ------------------------------------------------------------
// Tema Undangan: Ocean Vows (Kategori: RSVP)
// Konsep       : PERJALANAN LAUT DALAM (underwater odyssey) —
//                konsep yang belum ada di katalog. Bintang utamanya
//                adalah EFEK TRANSISI PARALLAX bertingkat:
//                  • Backdrop tetap (gradasi palung + siluet karang +
//                    gelembung) bergeser pelan mengikuti scroll global
//                    via useScroll + useTransform.
//                  • Tiap section membungkus dekorasinya dalam wrapper
//                    <Parallax> ref-scoped sehingga lapisan terdalam
//                    meluncur lebih lambat daripada konten.
//                  • Pembagi section berupa gelombang SVG 2 lapis yang
//                    melengkung & ikut bergeser.
//                  • Kawanan ikan menyilang layar, gelembung naik terus.
//                Isi mengalir seperti menyelam: Amplop-botol →
//                Hero → Mempelai → Countdown → Acara &
//                Lokasi → Galeri Mutiara (lightbox) → Harta Karun →
//                Pesan dalam Botol → Dermaga RSVP & Ucapan.
// Warna        : palet MILIK TEMA sendiri di @theme src/index.css
//                (--color-ow-*): palung #04202C, kedalaman #0B4A57,
//                permukaan aqua #7BD8E6, karang coral #FF7A59,
//                buih #D7F5EC, pasir emas #FFE2A8. Font Caveat +
//                Quicksand.
// Dipakai di   : templates/Registry.ts (slug 'ocean-vows')
// Keterikatan  : types/template, types/database, utils/templateHelpers,
//                hooks/useCountdown, hooks/useCopyToClipboard,
//                templates/shared/useOpenInvitation, framer-motion
// ============================================================

import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  Anchor,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Fish,
  Gift,
  Heart,
  Mail,
  MapPin,
  Navigation,
  Pause,
  Play,
  Quote,
  Send,
  Shell,
  Sparkles,
  Waves,
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

// ─── Kosakata gerak: satu easing agar ritme seluruh tema konsisten ───
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** PRNG deterministik (mulberry32) agar dekorasi render tetap murni. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Parallax per-section: lapisan dalam meluncur berlawanan arah scroll. */
function Parallax({
  children,
  className,
  distance = 80,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

/** Wrapper scroll-reveal generik untuk semua section. */
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
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Pembagi section: dua lapis gelombang laut yang mengalir. */
function WaveDivider({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 z-[2] ${flip ? 'top-0' : 'bottom-0'} ${className}`}>
      <svg className="block w-full" style={{ height: 56 }} viewBox="0 0 1440 56" preserveAspectRatio="none">
        <path d="M0 28 C 240 56 480 0 720 28 C 960 56 1200 0 1440 28 L 1440 56 L 0 56 Z" fill="var(--color-ow-surface)" opacity="0.14" />
        <path d="M0 40 C 240 64 480 16 720 40 C 960 64 1200 16 1440 40 L 1440 56 L 0 56 Z" fill="var(--color-ow-coral)" opacity="0.12" />
      </svg>
    </div>
  );
}

/** Gelembung ambient yang terus naik (deterministik via PRNG). */
function BubbleField({
  count = 12,
  seed = 7,
  className = '',
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const bubbles = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand() * 100,
      size: 6 + rand() * 16,
      duration: 9 + rand() * 12,
      delay: rand() * 9,
      drift: -14 + rand() * 28,
    }));
  }, [count, seed]);
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {bubbles.map((b) => (
        <motion.span
          key={b.id}
          className="absolute bottom-[-50px] rounded-full border"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            borderColor: 'rgba(123, 216, 230, 0.5)',
          }}
          animate={{ y: '-96vh', x: [0, b.drift, 0], opacity: [0.15, 0.85, 0] }}
          transition={{
            y: { duration: b.duration, repeat: Infinity, ease: 'linear', delay: b.delay },
            x: { duration: b.duration / 2.4, repeat: Infinity, ease: 'easeInOut', delay: b.delay },
            opacity: { duration: b.duration, repeat: Infinity, delay: b.delay },
          }}
        />
      ))}
    </div>
  );
}

/** Kawanan ikan kecil melintas layar ke kiri/kanan. */
function FishSwarm({
  direction = 1,
  seed = 11,
  count = 3,
  className = '',
}: {
  direction?: 1 | -1;
  seed?: number;
  count?: number;
  className?: string;
}) {
  const fishes = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: 12 + rand() * 62,
      scale: 0.4 + rand() * 0.8,
      duration: 18 + rand() * 16,
      delay: rand() * 8,
    }));
  }, [seed, count]);
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {fishes.map((f) => (
        <motion.span
          key={f.id}
          className="absolute"
          style={{ top: `${f.top}%` }}
          initial={{ x: direction > 0 ? '-12vw' : '112vw' }}
          animate={{ x: direction > 0 ? '112vw' : '-12vw' }}
          transition={{ duration: f.duration, repeat: Infinity, ease: 'linear', delay: f.delay }}
        >
          <Fish
            size={Math.round(26 * f.scale)}
            className="text-ow-surface/45"
            style={{ transform: direction > 0 ? 'scaleX(1)' : 'scaleX(-1)' }}
          />
        </motion.span>
      ))}
    </div>
  );
}

/** Digit countdown "jelly": angka lama keluar, angka baru masuk. */
function JellyCount({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-ow-surface/25 bg-ow-mid/70 px-2.5 py-2.5 backdrop-blur">
      <div className="overflow-hidden text-3xl font-bold tabular-nums text-ow-surface">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="inline-block"
            initial={{ y: -30, opacity: 0, rotateX: 90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: 30, opacity: 0, rotateX: -90 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-widest text-ow-foam/55">{label}</span>
    </div>
  );
}

export default function OceanVowsTheme({
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

  // Status galeri mutiara (lightbox) & salin rekening
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Status Form RSVP (pola identik antar-tema RSVP)
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(submittedData?.status || 'hadir');
  const [rsvpPax, setRsvpPax] = useState<number>(submittedData?.pax || 1);
  const [rsvpName, setRsvpName] = useState<string>(submittedData?.guest_name || guestName || '');
  const [rsvpMessage, setRsvpMessage] = useState<string>(submittedData?.message || '');
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);

  const handleCopyRekening = (
    e: React.MouseEvent<HTMLElement>,
    number: string,
    bankName: string,
    idx: number,
  ) => {
    e.stopPropagation();
    copyToClipboard(number, `Nomor Rekening ${bankName}`);
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
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  // Parallax global: backdrop tetap (palung) meluncur lebih lambat.
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const raysY = useTransform(scrollYProgress, [0, 1], [0, 160]);

return (
    <div className="relative min-h-screen overflow-x-hidden bg-ow-deep font-body text-ow-foam">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Quicksand:wght@400;600;700&display=swap');
        .font-script { font-family: 'Caveat', cursive; }
        .font-body { font-family: 'Quicksand', sans-serif; }
        .ow-card {
          background: rgba(9, 60, 74, 0.55);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(123, 216, 230, 0.24);
          border-radius: 26px;
          box-shadow: 0 22px 50px rgba(2, 17, 24, 0.5);
        }
        .wish-scroll::-webkit-scrollbar { width: 4px; }
        .wish-scroll::-webkit-scrollbar-thumb { background: rgba(123, 216, 230, 0.4); border-radius: 999px; }
        .wish-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* ─── BACKDROP TETAP: PARALLAX GLOBAL (palung + karang + sinar) ─── */}
      <motion.div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-gradient-to-b from-ow-mid via-ow-deep to-ow-deep" />
        <div className="absolute left-1/2 top-[-20%] h-[70vh] w-[130vw] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(ellipse at top, var(--color-ow-surface), transparent 60%)' }} />
        <div className="absolute bottom-0 left-[-6%] h-56 w-56 rounded-full bg-ow-surface/10 blur-2xl" />
        <div className="absolute bottom-0 right-[-4%] h-64 w-64 rounded-full bg-ow-coral/10 blur-3xl" />
      </motion.div>
      <motion.div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" style={{ y: raysY }}>
        <BubbleField count={10} seed={3} />
      </motion.div>

      {/* ─── COVER: UNDANGAN DALAM BOTOL ─────────────────── */}
      <motion.div
        initial={false}
        animate={isOpen ? { y: '-100%' } : { y: 0 }}
        transition={{ duration: 1, ease: EASE_OUT }}
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ow-deep"
      >
        {/* Gradien solid sebagai latar amplop agar konten di baliknya TIDAK tembus */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ow-mid via-ow-deep to-ow-deep" />
        <BubbleField count={16} seed={21} className="z-0" />
        <FishSwarm seed={31} count={2} className="z-0" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.15 }}
          className="relative z-10 w-full max-w-md px-7 text-center"
        >
          <motion.span
            animate={{ y: [0, -10, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-ow-surface/40 bg-ow-mid text-ow-coral shadow-lg"
          >
            <Mail size={34} />
          </motion.span>

          <p className="font-script text-3xl text-ow-sand">Perjalanan Laut</p>
          <p className="font-script text-xl text-ow-surface/90">The Wedding Of</p>
          <h1 className="font-script mt-3 text-5xl font-bold leading-tight text-ow-foam">
            {groom} <span className="text-ow-coral">&amp;</span> {bride}
          </h1>
          <p className="mt-4 text-sm font-semibold tracking-wide text-ow-foam/70">{formattedDate}</p>

          <motion.button
            onClick={open}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-ow-coral/60 bg-ow-coral px-7 py-3 font-semibold text-ow-deep shadow-lg transition-colors hover:bg-ow-surface"
          >
            <Waves size={16} /> Buka Botol Undangan
          </motion.button>
        </motion.div>
      </motion.div>

{/* ─── HERO (parallax berlapis) ──────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16 pb-24">
        <Parallax distance={140} className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-[-10%] top-[30%] h-40 w-40 rounded-full bg-ow-coral/15 blur-2xl" />
          <div className="absolute right-[-8%] top-[55%] h-52 w-52 rounded-full bg-ow-surface/15 blur-3xl" />
          <div className="absolute bottom-[8%] left-[12%] h-24 w-24 rounded-full bg-ow-sand/10 blur-xl" />
        </Parallax>
        <FishSwarm className="z-0" seed={5} />
        <FishSwarm className="z-0" direction={-1} seed={17} count={2} />
        <BubbleField count={14} seed={9} className="z-0" />

        <div className="relative z-10 w-full max-w-2xl text-center">
          <Reveal>
            <motion.p
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              className="font-script text-3xl text-ow-sand"
            >
              Selami Samudra Cinta Kami
            </motion.p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-script mt-3 text-6xl font-bold leading-tight text-ow-foam md:text-7xl">
              {groom}
              <span className="mx-3 inline-block text-ow-coral">&hearts;</span>
              {bride}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-ow-surface/30 bg-ow-mid/60 px-5 py-2 text-sm font-semibold text-ow-surface backdrop-blur">
              <Anchor size={14} className="text-ow-coral" /> {formattedDate}
            </p>
          </Reveal>
        </div>

        <motion.button
          onClick={() => document.getElementById('tamu')?.scrollIntoView({ behavior: 'smooth' })}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-ow-surface/70"
          aria-label="Gulir ke bawah"
        >
          <ChevronDown size={28} />
        </motion.button>
      </section>

      <WaveDivider flip />

{/* ─── MEMPELAI ──────────────────────────────────────────── */}
      <section id="tamu" className="relative px-6 py-24">
        <Reveal className="text-center">
          <h2 className="font-script text-4xl text-ow-sand">Sang Kapten &amp; Penjelajah</h2>
          <p className="mt-2 text-sm text-ow-foam/60">Dua hati yang memutuskan berlayar bersama</p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
          {[
            { name: groom, parents: groomParents, photo: photos.groom, color: 'var(--color-ow-coral)' },
            { name: bride, parents: brideParents, photo: photos.bride, color: 'var(--color-ow-surface)' },
          ].map((p, i) => (
            <Reveal key={p.name} delay={i * 0.15}>
              <div className="ow-card p-7 text-center">
                <motion.div
                  whileHover={{ scale: 1.06, rotate: i % 2 ? 2 : -2 }}
                  className="mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-ow-surface/40 shadow-lg"
                >
                  <img src={p.photo} alt={p.name} className="h-full w-full object-cover" />
                </motion.div>
                <h3 className="font-script text-3xl font-bold text-ow-foam">{p.name}</h3>
                <p className="mt-1 text-xs font-semibold text-ow-foam/60">{p.parents}</p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: p.color }}>
                  <Heart size={12} fill="currentColor" /> {i === 0 ? 'Sang Kapten' : 'Penjelajah Laut'}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <WaveDivider />

{/* ─── COUNTDOWN (pelampung waktu) ────────────────────────── */}
      <section className="relative px-6 py-24">
        <Reveal className="text-center">
          <h2 className="font-script text-4xl text-ow-sand">Menanti Arus Waktu</h2>
          <p className="mt-2 text-sm text-ow-foam/60">Hari berlayar semakin dekat</p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex justify-center gap-3">
            <JellyCount value={timeLeft.days} label="Hari" />
            <JellyCount value={timeLeft.hours} label="Jam" />
            <JellyCount value={timeLeft.minutes} label="Mnt" />
            <JellyCount value={timeLeft.seconds} label="Dtk" />
          </div>
        </Reveal>
      </section>

      <WaveDivider />

      {/* ─── ACARA & LOKASI ─────────────────────────────────────── */}
      <section className="relative px-6 py-24">
        <Parallax distance={70} className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-[8%] top-[15%] h-36 w-36 rounded-full bg-ow-coral/10 blur-2xl" />
        </Parallax>
        <Reveal className="relative z-10 text-center">
          <h2 className="font-script text-4xl text-ow-sand">Jadwal Pelayaran</h2>
          <p className="mt-2 text-sm text-ow-foam/60">Dua petik kisah yang siap dilayari</p>
        </Reveal>

        <div className="relative z-10 mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
          {[
            { label: 'Akad Nikah', date: formattedAkadDate, time: schedule.akadTime, icon: CalendarDays, color: 'var(--color-ow-coral)' },
            { label: 'Resepsi', date: formattedResepsiDate, time: schedule.resepsiTime, icon: Sparkles, color: 'var(--color-ow-surface)' },
          ].map((ev, i) => (
            <Reveal key={ev.label} delay={i * 0.15}>
              <div className="ow-card h-full p-6">
                <span
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${ev.color}` }}
                >
                  <ev.icon size={22} className="text-ow-deep" />
                </span>
                <h3 className="font-script text-3xl font-bold text-ow-foam">{ev.label}</h3>
                <p className="mt-2 text-sm font-semibold text-ow-sand">{ev.date}</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: ev.color }}>
                  <Clock3 size={14} /> {ev.time}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="ow-card mx-auto mt-8 max-w-3xl p-6">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ow-coral/50 bg-ow-coral/15 text-ow-coral">
                <MapPin size={22} />
              </span>
              <div className="flex-1">
                <h3 className="font-script text-3xl font-bold text-ow-sand">{venue.name}</h3>
                <p className="mt-1 text-sm text-ow-foam/70">{venue.address}</p>
              </div>
              <motion.a
                href={venue.mapsLink}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-2 rounded-full bg-ow-coral px-5 py-2.5 text-sm font-semibold text-ow-deep transition-colors hover:bg-ow-surface"
              >
                <Navigation size={14} /> Buka Peta
              </motion.a>
            </div>
          </div>
        </Reveal>
      </section>

{/* ─── GALERI MUTIARA (lightbox shared-element) ───────────── */}
      <section className="relative px-6 py-24">
        <Reveal className="text-center">
          <h2 className="font-script text-4xl text-ow-sand">Mutiara Kenangan</h2>
          <p className="mt-2 text-sm text-ow-foam/60">Ketuk mutiara untuk menyelami kenangan</p>
        </Reveal>
        <div className="relative z-10 mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {gallery.slice(0, 4).map((url, i) => (
            <motion.button
              key={url}
              type="button"
              layoutId={`ow-photo-${url}`}
              onClick={() => setLightbox(url)}
              whileHover={{ scale: 1.06, rotate: i % 2 ? 2 : -2, zIndex: 5 }}
              whileTap={{ scale: 0.94 }}
              className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-ow-surface/30 shadow-lg"
            >
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-ow-mid/80 text-ow-sand backdrop-blur"
              >
                <Shell size={14} />
              </motion.span>
              <img src={url} alt={`Kenangan ${i + 1}`} className="h-full w-full object-cover" />
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox(null)}
              className="fixed inset-0 z-[120] flex items-center justify-center bg-ow-deep/90 p-6 backdrop-blur"
            >
              <motion.img
                layoutId={`ow-photo-${lightbox}`}
                src={lightbox}
                alt="Pratinjau kenangan"
                className="max-h-[80vh] max-w-full rounded-3xl border border-ow-surface/30 object-contain shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <WaveDivider />

      {/* ─── HARTA KARUN (salin rekening) ───────────────────────── */}
      <section className="relative px-6 py-24">
        <Reveal className="text-center">
          <h2 className="font-script text-4xl text-ow-sand">Harta Karun</h2>
          <p className="mt-2 text-sm text-ow-foam/60">Titipan cinta untuk pelabuhan bahagia kami</p>
        </Reveal>
        <div className="relative z-10 mx-auto mt-12 max-w-xl space-y-4">
          {banks.map((bank, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="ow-card flex items-center justify-between gap-4 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-ow-sand/40 bg-ow-sand/15 text-ow-sand">
                  <Gift size={22} />
                </span>
                <div className="flex-1">
                  <p className="font-bold text-ow-sand">{bank.bank}</p>
                  <p className="font-mono text-sm text-ow-foam/80">{bank.number}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.85, rotate: [0, -12, 12, 0] }}
                  onClick={(e) => handleCopyRekening(e, bank.number, bank.bank, i)}
                  className="rounded-xl border border-ow-surface/40 bg-ow-surface/15 p-2.5 text-ow-surface transition-colors hover:bg-ow-surface hover:text-ow-deep"
                  aria-label={`Salin nomor ${bank.bank}`}
                >
                  {copiedIndex === i ? <CheckCircle2 size={18} className="text-ow-sand" /> : <Copy size={18} />}
                </motion.button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <WaveDivider />

      {/* ─── PESAN DALAM BOTOL (kutipan) ──────────────────────── */}
      <section className="relative px-6 py-24">
        <Parallax distance={55} className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute right-[10%] top-[20%] h-32 w-32 rounded-full bg-ow-sand/10 blur-2xl" />
        </Parallax>
        <Reveal className="relative z-10 mx-auto max-w-2xl text-center">
          <div className="ow-card p-8">
            <motion.span
              animate={{ rotate: [0, -5, 5, 0], y: [0, -6, 0] }}
              transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ow-sand/15 text-ow-sand"
            >
              <Quote size={22} />
            </motion.span>
            <p className="font-script text-3xl leading-relaxed text-ow-foam">"{quote}"</p>
            <p className="mt-4 text-sm font-bold uppercase tracking-widest text-ow-surface">— {quoteSrc}</p>
          </div>
        </Reveal>
      </section>

{/* ─── DERMAGA RSVP & UCAPAN ─────────────────────────────── */}
      <section id="rsvp" className="relative px-6 py-24">
        <WaveDivider />
        <Reveal className="text-center">
          <h2 className="font-script text-4xl text-ow-sand">Dermaga Ucapan</h2>
          <p className="mt-2 text-sm text-ow-foam/60">Tinggalkan doa terbaik bagi pelayaran kami</p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-2">
          {/* FORM */}
          <Reveal>
            <div className="ow-card p-6">
              {submittedData ? (
                <div className="py-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 16 }}
                    className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-ow-sand/20 text-ow-sand"
                  >
                    <CheckCircle2 size={30} />
                  </motion.div>
                  <p className="font-script text-3xl text-ow-sand">Terima Kasih!</p>
                  <p className="mt-2 text-sm text-ow-foam/70">Ucapanmu sudah terkirim ke pelabuhan kami.</p>
                </div>
              ) : (
                <form onSubmit={handleSendRsvp} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-ow-surface/70">Nama Pelaut</label>
                    <input
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="Nama kamu"
                      className="w-full rounded-xl border border-ow-surface/25 bg-ow-mid/50 p-3 text-sm text-ow-foam outline-none placeholder:text-ow-foam/40 focus:border-ow-coral"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-ow-surface/70">Status</label>
                    <select
                      value={rsvpStatus}
                      onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                      className="w-full rounded-xl border border-ow-surface/25 bg-ow-mid/50 p-3 text-sm text-ow-foam outline-none focus:border-ow-coral"
                    >
                      <option value="hadir">Aku ikut berlayar</option>
                      <option value="tidak_hadir">Belum bisa hadir</option>
                      <option value="ragu">Masih ragu</option>
                    </select>
                  </div>
                  <AnimatePresence initial={false}>
                    {rsvpStatus === 'hadir' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT }}
                        className="overflow-hidden"
                      >
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-ow-surface/70">Jumlah Tamu</label>
                        <select
                          value={rsvpPax}
                          onChange={(e) => setRsvpPax(Number(e.target.value))}
                          className="w-full rounded-xl border border-ow-surface/25 bg-ow-mid/50 p-3 text-sm text-ow-foam outline-none focus:border-ow-coral"
                        >
                          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} Orang</option>)}
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-ow-surface/70">Doa &amp; Pesan</label>
                    <textarea
                      required
                      maxLength={100}
                      value={rsvpMessage}
                      onChange={(e) => setRsvpMessage(e.target.value)}
                      placeholder="Semoga bahtera kalian selalu dilimpahi ridho-Nya..."
                      className="h-24 w-full resize-none rounded-xl border border-ow-surface/25 bg-ow-mid/50 p-3 text-sm text-ow-foam outline-none placeholder:text-ow-foam/40 focus:border-ow-coral"
                    />
                    <div className="mt-1 text-right text-[10px] text-ow-foam/40">{rsvpMessage.length}/100</div>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isSubmittingRsvp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full rounded-xl bg-ow-coral py-3.5 font-semibold text-ow-deep transition-colors hover:bg-ow-surface disabled:opacity-60"
                  >
                    {isSubmittingRsvp ? 'Mengirim...' : <span className="inline-flex items-center gap-2"><Send size={15} /> Kirim Ucapan</span>}
                  </motion.button>
                </form>
              )}
            </div>
          </Reveal>

{/* Ucapan */}
          <Reveal delay={0.15}>
            <div className="ow-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-script text-2xl text-ow-sand">Ucapan Tamu</h3>
                <span className="rounded-full border border-ow-surface/30 bg-ow-mid/50 px-3 py-1 text-xs font-bold text-ow-surface">
                  {(data?.rsvps || []).length} Pesan
                </span>
              </div>
              <div className="wish-scroll max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {(data?.rsvps || []).length === 0 ? (
                  <p className="py-8 text-center text-sm italic text-ow-foam/40">Belum ada pesan. Jadilah yang pertama!</p>
                ) : (
                  (data?.rsvps || []).map((item, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(idx * 0.06, 0.5) }} className="rounded-2xl border border-ow-surface/15 bg-ow-deep/40 p-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ow-coral/30 text-xs font-bold text-ow-sand">
                          {item.guest_name.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm font-bold text-ow-foam">{item.guest_name}</span>
                        <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${item.status === 'hadir' ? 'bg-ow-surface/20 text-ow-surface' : item.status === 'tidak_hadir' ? 'bg-ow-coral/15 text-ow-coral' : 'bg-ow-sand/15 text-ow-sand'}`}>
                          {item.status === 'hadir' ? 'Hadir' : item.status === 'tidak_hadir' ? 'Absen' : 'Ragu'}
                        </span>
                      </div>
                      {item.message && <p className="mt-2 text-sm text-ow-foam/75">{item.message}</p>}
                      {item.reply && <p className="mt-1.5 text-xs italic text-ow-surface/70">Mempelai: {item.reply}</p>}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER: TERIMA KASIH ─────────────────────────────── */}
      <footer className="relative px-6 pb-28 pt-6 text-center">
        <Reveal>
          <motion.p
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-ow-surface/40 bg-ow-mid/60 text-ow-sand"
          >
            <Anchor size={22} />
          </motion.p>
          <p className="font-script text-2xl text-ow-sand">Terima kasih telah menyelami kisah kami</p>
          <p className="mt-2 text-sm font-semibold text-ow-foam/80">
            {groom} <span className="text-ow-coral">&amp;</span> {bride}
          </p>
        </Reveal>
      </footer>

      {/* ─── FAB: MUSIK ────────────────────────────────────────── */}
      <motion.button
        onClick={toggleAudio}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
        className="fixed bottom-5 right-5 z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-ow-coral text-ow-deep shadow-lg"
        aria-label={isPlaying ? 'Matikan musik' : 'Nyalakan musik'}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </motion.button>

      {/* Audio pemutar musik latar */}
      <audio ref={audioRef} src={audioUrl} loop preload="auto" />
    </div>
  );
}