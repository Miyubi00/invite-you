// ============================================================
// src/templates/themes/BoardGameTheme.tsx
// ------------------------------------------------------------
// Tema Undangan: Dice Voyage (Kategori: RSVP)
// Konsep       : PAPAN PERMAINAN (board game) — konsep yang belum ada
//                di katalog. Seluruh undangan adalah jalur petak zig-zag
//                bernomor: Start → Mempelai → Acara → Countdown →
//                Galeri → Lokasi → Kado → RSVP → Chance Card.
//                Inti interaksinya sebuah HUD dadu melayang: lempar
//                dadu (tumble 3D), pion melompat N petak di jalur HUD,
//                halaman auto-scroll ke petak tujuan, petak aktif
//                menyala border "marching ants", dan konfeti meletup.
// Efek lain    : flip 3D kartu pemain (mempelai), peti harta yang bisa
//                dibuka (lid rotateX), stiker galeri flip berhadiah,
//                kartu chance bergoyang, digit countdown wobble per
//                detik, judul per-huruf memantul, hiasan game-piece
//                melayang di latar.
// Warna        : palet MILIK TEMA sendiri (@theme src/index.css):
//                --color-bg-cream #FFF6E0, --color-bg-ink #221B45,
//                --color-bg-tomato #FF4D3D, --color-bg-teal #00B8A9,
//                --color-bg-mustard #FFC53D. Font Fredoka + Nunito.
// Dipakai di   : templates/Registry.ts (slug 'board-game')
// Keterikatan  : types/template, types/database, utils/templateHelpers,
//                hooks/useCountdown, hooks/useCopyToClipboard,
//                templates/shared/useOpenInvitation, framer-motion
// ============================================================

import { useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Crown,
  Flag,
  Gift,
  Heart,
  Loader2,
  MapPin,
  Navigation,
  Pause,
  PartyPopper,
  Play,
  Quote,
  Gem,
  Send,
  Sparkles,
  Trophy,
  Users,
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

// ─── LETUPAN KONFETI PAPAN (dipicu lemparan dadu & aksi penting) ─────
interface BurstPoint { id: number; x: number; y: number }

const BOARD_COLORS = [
  'var(--color-bg-tomato)',
  'var(--color-bg-teal)',
  'var(--color-bg-mustard)',
  'var(--color-bg-ink)',
];

function useBursts(): { bursts: BurstPoint[]; spawn: (x: number, y: number) => void } {
  const [bursts, setBursts] = useState<BurstPoint[]>([]);
  const spawn = (x: number, y: number) => {
    const id = Date.now() + Math.random();
    // Maksimal 5 letupan aktif agar aman terhadap spam klik cepat.
    setBursts((prev) => [...prev.slice(-4), { id, x, y }]);
    window.setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== id)), 900);
  };
  return { bursts, spawn };
}

/** 14 serpihan konfeti keluar dari satu titik layar. */
function BurstLayer({ bursts }: { bursts: BurstPoint[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[80]" aria-hidden="true">
      {bursts.map((b) => (
        <span key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
          {[...Array(14)].map((_, i) => {
            const angle = (i / 14) * Math.PI * 2;
            const dist = 46 + (i % 5) * 18;
            return (
              <motion.span
                key={i}
                className="absolute block"
                style={{
                  width: i % 3 === 0 ? 12 : 7,
                  height: i % 4 === 0 ? 4 : i % 3 === 0 ? 12 : 7,
                  borderRadius: i % 4 === 0 ? 2 : 999,
                  backgroundColor: BOARD_COLORS[i % BOARD_COLORS.length],
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist - 20,
                  opacity: 0,
                  scale: 0.2,
                  rotate: i % 2 === 0 ? 200 : -200,
                }}
                transition={{ duration: 0.85, ease: EASE_OUT }}
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
      initial={{ opacity: 0, y: 46, rotate: -1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Judul per-huruf: tiap karakter memantul masuk seperti token jatuh. */
function BouncyWord({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="inline-block" aria-label={text}>
      {[...text].map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          className="inline-block"
          aria-hidden="true"
          initial={{ opacity: 0, y: -34, scale: 1.4 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: delay + i * 0.05, type: 'spring', stiffness: 300, damping: 12 }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
  );
}

// ─── PETAK PAPAN ─────────────────────────────────────────────────────
// Kartu section dengan bingkai papan tebal; saat jadi tujuan lemparan
// dadu, border-nya menyala "marching ants" (stroke berjalan via SVG).
function BoardTile({
  children,
  step,
  color,
  active,
  className = '',
  id,
}: {
  children: ReactNode;
  step: number;
  color: string;
  active: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <motion.div
      id={id}
      className={`relative scroll-mt-28 rounded-[28px] border-[3px] border-bg-ink bg-white p-6 shadow-[6px_6px_0_0_var(--color-bg-ink)] ${className}`}
      whileHover={{ y: -6, rotate: -0.6 }}
      animate={active ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={active ? { duration: 0.6, ease: EASE_OUT } : { type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Nomor petak ala papan ular tangga */}
      <motion.span
        className="absolute -top-5 -left-4 z-10 flex h-11 w-11 items-center justify-center rounded-2xl border-[3px] border-bg-ink font-game text-lg font-bold text-white shadow-[3px_3px_0_0_var(--color-bg-ink)]"
        style={{ backgroundColor: color }}
        initial={{ rotate: -12, scale: 0 }}
        whileInView={{ rotate: -6, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 380, damping: 14 }}
      >
        {step}
      </motion.span>

      {/* Border marching ants saat petak aktif */}
      <AnimatePresence>
        {active && (
          <motion.span
            className="pointer-events-none absolute -inset-[6px] rounded-[32px] border-[3px] border-dashed border-bg-tomato"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: [0, 1, 0.5, 1], scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ opacity: { duration: 1.6, repeat: Infinity }, scale: { duration: 0.35 } }}
          />
        )}
      </AnimatePresence>

      {children}
    </motion.div>
  );
}

// ─── WAJAH DADU (1–6 pip) ────────────────────────────────────────────
const PIP_LAYOUTS: Record<number, Array<[string, string]>> = {
  1: [['50%', '50%']],
  2: [['26%', '26%'], ['74%', '74%']],
  3: [['26%', '26%'], ['50%', '50%'], ['74%', '74%']],
  4: [['26%', '26%'], ['74%', '26%'], ['26%', '74%'], ['74%', '74%']],
  5: [['26%', '26%'], ['74%', '26%'], ['50%', '50%'], ['26%', '74%'], ['74%', '74%']],
  6: [['26%', '26%'], ['74%', '26%'], ['26%', '50%'], ['74%', '50%'], ['26%', '74%'], ['74%', '74%']],
};

export function DiceFace({ value, size = 64 }: { value: number; size?: number }) {
  return (
    <div
      className="relative rounded-2xl border-[3px] border-bg-ink bg-white shadow-[3px_3px_0_0_var(--color-bg-ink)]"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Dadu menunjukkan angka ${value}`}
    >
      {(PIP_LAYOUTS[value] ?? PIP_LAYOUTS[1]).map(([x, y], i) => (
        <span
          key={i}
          className="absolute block rounded-full bg-bg-ink"
          style={{ left: x, top: y, width: size * 0.16, height: size * 0.16, transform: 'translate(-50%, -50%)' }}
        />
      ))}
    </div>
  );
}

/** Kartu "kupon gores" galeri: ketukan membuka gambar tersembunyi. */
function ScratchCard({
  index,
  url,
  revealed,
  onReveal,
}: {
  index: number;
  url: string;
  revealed: boolean;
  onReveal: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onReveal}
      whileHover={{ scale: 1.06, rotate: index % 2 ? 2 : -2 }}
      whileTap={{ scale: 0.92 }}
      className="relative aspect-square overflow-hidden rounded-2xl border-[3px] border-bg-ink shadow-[3px_3px_0_0_var(--color-bg-ink)]"
      aria-label={revealed ? `Foto galeri ${index + 1}` : `Buka kupon ${index + 1}`}
    >
      <motion.img
        src={url}
        alt={`Foto galeri ${index + 1}`}
        className="h-full w-full object-cover"
        initial={false}
        animate={revealed ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 1.4, rotate: index % 2 ? 6 : -6 }}
      />
      {!revealed && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-ink/75">
          <motion.span
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ rotate: { duration: 5, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.4, repeat: Infinity } }}
            className="font-game text-2xl font-bold text-bg-mustard"
          >
            ✦
          </motion.span>
        </div>
      )}
    </motion.button>
  );
}

/** Penghubung antar-petak di jalur papan (desktop, sisi kiri/kanan). */
function Connector(props: { right?: boolean; left?: boolean }) {
  const side = props.right ? 'right' : 'left';
  return (
    <motion.span
      animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.08, 0.9] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute top-6 hidden h-10 w-12 -translate-y-1/2 items-center md:flex ${side === 'right' ? '-right-16' : '-left-16'}`}
      aria-hidden="true"
    >
      <span className="block h-0 flex-1 border-t-2 border-dashed border-bg-ink/40" />
      <span className={`font-game text-sm font-bold text-bg-ink/40 ${side === 'right' ? '' : 'scale-x-[-1]'}`}>▶</span>
    </motion.span>
  );
}

export default function BoardGameTheme({
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
  const { bursts, spawn } = useBursts();

  // Amplop & pemutar musik (pola bersama antar-tema)
  const { isOpen, open, playing: isPlaying, toggle: toggleAudio } =
    useOpenInvitation(audioRef, 900);

  // Data resolusi dengan fallback cerdas (utilitas bersama antar-tema)
  const photos = resolvePhotos(data);
  const gallery = resolveGallery(data);
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
  const formattedAkadDate = schedule.akadDate
    ? formatDate(schedule.akadDate, 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : formattedDate;
  const formattedResepsiDate = schedule.resepsiDate
    ? formatDate(schedule.resepsiDate, 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : formattedDate;
  const akadClock = (schedule.akadTime || '08:00').split(' ')[0].substring(0, 5);
  const timeLeft = useCountdown(date, akadClock);

  // ─── ID petak jalur papan (urutan section di halaman) ───
  const SECTION_IDS = ['tile-start', 'tile-couple', 'tile-countdown', 'tile-events', 'tile-gallery', 'tile-gift', 'tile-quote', 'tile-rsvp'] as const;

  // Status papan
  const [diceValue, setDiceValue] = useState<number>(6);
  const [isRolling, setIsRolling] = useState(false);
  const [pawnTile, setPawnTile] = useState(0); // index SECTION_IDS tempat pion berdiri
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Galeri "kupon gores": kupon mana yang sudah dibuka.
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());
  const revealCard = (i: number) =>
    setRevealedSet((prev) => {
      if (prev.has(i)) return prev;
      spawn(0, 0);
      return new Set(prev).add(i);
    });

  // Hint HUD dadu: petak tujuan yang akan dituju saat lemparan.
  const [diceTarget, setDiceTarget] = useState(0);
  const [diceHint, setDiceHint] = useState(false);

  // Status Form RSVP (pola identik antar-tema RSVP)
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(submittedData?.status || 'hadir');
  const [rsvpPax, setRsvpPax] = useState<number>(submittedData?.pax || 1);
  const [rsvpName, setRsvpName] = useState<string>(submittedData?.guest_name || guestName || '');
  const [rsvpMessage, setRsvpMessage] = useState<string>(submittedData?.message || '');
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);

  // ─── MEKANIKA LEMPAR DADU ────────────────────────────────────────────
  // Lempar → dadu tumbling acak → nilai final → pion melompat N petak di
  // HUD → halaman auto-scroll ke petak tujuan → petak menyala + konfeti.
  const rollDice = () => {
    if (isRolling || !isOpen) return;
    setIsRolling(true);

    const target = 2 + Math.floor(Math.random() * 5); // 2..6 agar selalu maju
    let ticks = 0;
    const tumble = window.setInterval(() => {
      setDiceValue(1 + Math.floor(Math.random() * 6));
      ticks += 1;
      if (ticks >= 9) {
        window.clearInterval(tumble);
        setDiceValue(target);

        const nextTile = Math.min(pawnTile + target, SECTION_IDS.length - 1);
        setDiceTarget(nextTile);
        setDiceHint(true);
        // Pion melompat petak demi petak (animasi berantai via setTimeout).
        for (let hop = pawnTile + 1; hop <= nextTile; hop++) {
          window.setTimeout(() => setPawnTile(hop), (hop - pawnTile) * 160);
        }

        window.setTimeout(() => {
          document.getElementById(SECTION_IDS[nextTile])?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, (nextTile - pawnTile) * 160 + 120);

        window.setTimeout(() => {
          spawn(window.innerWidth / 2, window.innerHeight / 2);
          setDiceHint(false);
          setIsRolling(false);
        }, (nextTile - pawnTile) * 160 + 520);
      }
    }, 90);
  };

  const handleCopyRekening = (
    e: React.MouseEvent<HTMLElement>,
    number: string,
    bankName: string,
    idx: number,
  ) => {
    copyToClipboard(number, `Nomor Rekening ${bankName}`);
    spawn(e.clientX, e.clientY);
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
      spawn(window.innerWidth / 2, window.innerHeight / 2);
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream font-body text-bg-ink">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;700;900&display=swap');
        .font-game { font-family: 'Fredoka', sans-serif; }
        .font-body { font-family: 'Nunito', sans-serif; }
        /* Motif papan: titik-titik halus di latar */
        .board-dots {
          background-image: radial-gradient(rgba(34, 27, 69, 0.10) 1.5px, transparent 1.5px);
          background-size: 22px 22px;
        }
      `}</style>

      <BurstLayer bursts={bursts} />

      {/* ─── COVER: KOTAK PERMAINAN ─────────────────────────────── */}
      <motion.div
        initial={false}
        animate={isOpen ? { y: '-100%', rotate: -2 } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
        className="board-dots fixed inset-0 z-[100] flex items-center justify-center bg-bg-mustard px-6"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.15 }}
          className="relative w-full max-w-md rounded-[36px] border-[4px] border-bg-ink bg-white p-8 text-center shadow-[10px_10px_0_0_var(--color-bg-ink)]"
        >
          {/* Bingkai dalam putus-putus khas kotak board game */}
          <div className="pointer-events-none absolute inset-3 rounded-[26px] border-[3px] border-dashed border-bg-teal/60" />

          {/* Dadu besar yang berguling pelan di atas kotak */}
          <motion.div
            className="mx-auto mb-6 w-fit"
            animate={{ rotate: [0, 14, -10, 6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <DiceFace value={diceValue} size={76} />
          </motion.div>

          <p className="font-game text-xs font-bold uppercase tracking-[0.3em] text-bg-teal">A Board Game Wedding</p>
          <h1 className="font-game mt-3 text-4xl font-bold leading-tight">
            <BouncyWord text={groom} delay={0.3} />
            <span className="mx-2 inline-block text-bg-tomato">&amp;</span>
            <BouncyWord text={bride} delay={0.55} />
          </h1>
          <p className="font-body mt-4 text-sm font-bold text-bg-ink/60">
            Pemain: <span className="text-bg-tomato">{guestName || 'Tamu Istimewa'}</span> — lempar dadunya dan jelajahi
            setiap petak cerita kami!
          </p>

          <motion.button
            onClick={open}
            whileHover={{ scale: 1.06, rotate: -1 }}
            whileTap={{ scale: 0.93 }}
            className="font-game mt-7 inline-flex items-center gap-2 rounded-2xl border-[3px] border-bg-ink bg-bg-tomato px-8 py-3.5 text-base font-bold text-white shadow-[5px_5px_0_0_var(--color-bg-ink)] transition-colors hover:bg-bg-teal"
          >
            <Play size={18} /> MULAI PERMAINAN
          </motion.button>

          <p className="font-game mt-5 text-[11px] font-bold uppercase tracking-widest text-bg-ink/40">
            {formattedDate}
          </p>
        </motion.div>

        {/* Bidak game melayang di tepi layar */}
        {[
          { icon: Crown, top: '12%', left: '8%', color: 'var(--color-bg-tomato)', delay: 0 },
          { icon: Heart, top: '70%', left: '5%', color: 'var(--color-bg-teal)', delay: 0.6 },
          { icon: Sparkles, top: '18%', right: '8%', color: 'var(--color-bg-teal)', delay: 1.1 },
          { icon: Gift, top: '76%', right: '6%', color: 'var(--color-bg-tomato)', delay: 1.7 },
        ].map(({ icon: Icon, top, left, right, color, delay }, i) => (
          <motion.span
            key={i}
            className="absolute"
            style={{ top, left, right, color }}
            animate={{ y: [0, -18, 0], rotate: [0, 10, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay }}
          >
            <Icon size={44} strokeWidth={2.2} />
          </motion.span>
        ))}
      </motion.div>

      {/* ─── PAPAN: JALUR PETAK ZIG-ZAG ─────────────────────────── */}
      <main className="board-dots relative mx-auto max-w-4xl px-5 pb-40 pt-10">
        {/* Jalur putus-putus di tengah papan (desktop) */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-0 -translate-x-1/2 border-l-[3px] border-dashed border-bg-ink/25 md:block" />

        {/* PETAK 1 · START — tile go Finish sebelum garis */}
        <div id="tile-start" className="relative mb-14 md:w-[46%]">
          <BoardTile step={1} color="var(--color-bg-tomato)" active={pawnTile === 0 && isOpen}>
            <Flag size={34} className="mx-auto mb-2 text-bg-tomato" />
            <h2 className="font-game text-2xl font-bold">START</h2>
            <p className="font-body mt-2 text-sm font-bold text-bg-ink/60">
              Petak awal! Lemparkan dadu di bawah layar untuk melompat ke petak cerita berikutnya.
            </p>
            <div className="font-game mt-4 inline-block rounded-xl border-2 border-bg-ink bg-bg-mustard px-4 py-1.5 text-xs font-bold shadow-[3px_3px_0_0_var(--color-bg-ink)]">
              {groom} &amp; {bride} · {formattedDate}
            </div>
          </BoardTile>
          <Connector right />
        </div>

        {/* PETAK 2 · MEMPELAI — kartu pemain flip 3D (klik untuk balik) */}
        <div id="tile-couple" className="relative mb-14 md:ml-auto md:w-[46%]">
          <BoardTile step={2} color="var(--color-bg-teal)" active={pawnTile === 1}>
            <h3 className="font-game mb-4 text-center text-xl font-bold">Pemain 1 &amp; Pemain 2</h3>
            <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
              {[{ name: groom, photo: photos.groom, parents: groomParents, role: 'Pemain 1', color: 'var(--color-bg-tomato)' },
                { name: bride, photo: photos.bride, parents: brideParents, role: 'Pemain 2', color: 'var(--color-bg-teal)' }].map((p, i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setFlipped((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className="group w-40 cursor-pointer"
                  whileHover={{ y: -6 }}
                  aria-label={`Kartu pemain ${p.name}, ketuk untuk membalik`}
                >
                  <div className="relative h-52 w-40 [perspective:900px]">
                    <motion.div
                      className="relative h-full w-full [transform-style:preserve-3d]"
                      animate={{ rotateY: flipped[i] ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                    >
                      {/* Sisi depan: foto */}
                      <div className="absolute inset-0 overflow-hidden rounded-3xl border-[3px] border-bg-ink shadow-[4px_4px_0_0_var(--color-bg-ink)] [backface-visibility:hidden]">
                        <img src={p.photo} alt={p.name} className="h-full w-full object-cover" />
                        <span
                          className="font-game absolute bottom-0 left-0 right-0 py-1.5 text-center text-xs font-bold text-white"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.name}
                        </span>
                      </div>
                      {/* Sisi belakang: profil pemain */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-[3px] border-bg-ink bg-white p-4 shadow-[4px_4px_0_0_var(--color-bg-ink)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                      >
                        <span
                          className="font-game rounded-lg border-2 border-bg-ink px-2 py-0.5 text-[10px] font-bold text-white"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.role}
                        </span>
                        <p className="font-game mt-2 text-center text-sm font-bold leading-snug">{p.name}</p>
                        <p className="font-body mt-1 text-center text-[10px] font-bold text-bg-ink/50">{p.parents}</p>
                        <Heart size={16} className="mt-2 text-bg-tomato" fill="var(--color-bg-tomato)" />
                      </div>
                    </motion.div>
                  </div>
                </motion.button>
              ))}
            </div>
            <p className="font-game mt-4 text-center text-[11px] font-bold uppercase tracking-widest text-bg-ink/40">
              Ketuk kartu untuk membalik profil
            </p>
          </BoardTile>
          <Connector left />
        </div>

        {/* PETAK 3 · COUNTDOWN — petak "tunggu giliran" dengan kubus waktu */}
        <div id="tile-countdown" className="relative mb-14 md:w-[46%]">
          <BoardTile step={3} color="hourglass" active={pawnTile === 2}>
            <h3 className="font-game mb-1 text-center text-xl font-bold">Ganti Giliran…</h3>
            <p className="font-game mb-4 text-center text-[11px] font-bold uppercase tracking-widest text-bg-ink/40">
              Hari bahagia menanti
            </p>
            <div className="flex justify-center gap-2.5">
              {[
                { v: timeLeft.days, l: 'Hari' },
                { v: timeLeft.hours, l: 'Jam' },
                { v: timeLeft.minutes, l: 'Mnt' },
                { v: timeLeft.seconds, l: 'Dtk' },
              ].map(({ v, l }) => (
                <div
                  key={l}
                  className="relative w-16 rounded-2xl border-[3px] border-bg-ink bg-white py-2 text-center shadow-[3px_3px_0_0_var(--color-bg-ink)]"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={v}
                      initial={{ y: -22, opacity: 0, rotateX: 90 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: 22, opacity: 0, rotateX: -90 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                      className="font-game block text-2xl font-bold text-bg-teal"
                    >
                      {String(v).padStart(2, '0')}
                    </motion.span>
                  </AnimatePresence>
                  <span className="font-game block text-[9px] font-bold uppercase tracking-widest text-bg-ink/40">{l}</span>
                </div>
              ))}
            </div>
          </BoardTile>
          <Connector right />
        </div>

        {/* PETAK 4 · ACARA — dua "misi" Akad & Resepsi */}
        <div id="tile-events" className="relative mb-14 md:ml-auto md:w-[46%]">
          <BoardTile step={4} color="var(--color-bg-teal)" active={pawnTile === 3}>
            <h3 className="font-game mb-4 text-center text-xl font-bold">Misi Utama</h3>
            <div className="space-y-4">
              {[
                { title: 'Akad Nikah', date: formattedAkadDate, time: schedule.akadTime, color: 'var(--color-bg-tomato)', icon: Gem },
                { title: 'Resepsi', date: formattedResepsiDate, time: schedule.resepsiTime, color: 'var(--color-bg-teal)', icon: PartyPopper },
              ].map((ev, i) => (
                <motion.div
                  key={ev.title}
                  initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                  whileHover={{ scale: 1.03, rotate: i === 0 ? -1 : 1 }}
                  className="flex items-center gap-3 rounded-2xl border-[3px] border-bg-ink bg-white p-4 text-left shadow-[4px_4px_0_0_var(--color-bg-ink)]"
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-bg-ink text-white"
                    style={{ backgroundColor: ev.color }}
                  >
                    <ev.icon size={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-game text-base font-bold">{ev.title}</p>
                    <p className="font-body text-xs font-bold text-bg-ink/60">{ev.date}</p>
                    <p className="font-game text-sm font-bold" style={{ color: ev.color }}>{ev.time} WITA</p>
                    <p className="font-body text-[11px] font-bold text-bg-ink/50">{resolveVenue(data).name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.a
              href={resolveVenue(data).mapsLink}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              className="font-game mt-5 inline-flex items-center gap-2 rounded-xl border-[3px] border-bg-ink bg-bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0_0_var(--color-bg-ink)] transition-colors hover:bg-bg-tomato"
            >
              <MapPin size={16} /> BUKA PETA LOKASI
            </motion.a>
          </BoardTile>
          <Connector left />
        </div>

        {/* PETAK 5 · GALERI — kartu kupon gores (scratch-card reveal) */}
        <div id="tile-gallery" className="relative mb-14 md:w-[46%]">
          <BoardTile step={5} color="var(--color-bg-tomato)" active={pawnTile === 4}>
            <h3 className="font-game mb-1 text-center text-xl font-bold">Galeri Harta Karun</h3>
            <p className="font-game mb-4 text-center text-[11px] font-bold uppercase tracking-widest text-bg-ink/40">
              Ketuk kupon untuk membukanya
            </p>
            <div className="grid grid-cols-3 gap-3">
              {gallery.slice(0, 6).map((url, i) => (
                <ScratchCard key={i} index={i} url={url} revealed={revealedSet.has(i)} onReveal={() => revealCard(i)} />
              ))}
            </div>
          </BoardTile>
          <Connector right />
        </div>

        {/* PETAK 6 · HADIAH — kartu hadiah dengan salin rekening */}
        <div id="tile-gift" className="relative mb-14 md:ml-auto md:w-[46%]">
          <BoardTile step={6} color="hourglass" active={pawnTile === 5}>
            <h3 className="font-game mb-1 text-center text-xl font-bold">Kotak Hadiah</h3>
            <p className="font-game mb-4 text-center text-[11px] font-bold uppercase tracking-widest text-bg-ink/40">
              Bonus item untuk para pemain
            </p>
            <div className="space-y-3">
              {resolveBanks(data).map((bank, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18, delay: i * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center justify-between rounded-2xl border-[3px] border-bg-ink bg-white p-3 text-left shadow-[3px_3px_0_0_var(--color-bg-ink)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-bg-ink bg-bg-mustard text-bg-ink">
                      <Gift size={18} />
                    </span>
                    <div>
                      <p className="font-game text-sm font-bold text-bg-tomato">{bank.bank}</p>
                      <p className="font-body font-mono text-xs font-bold text-bg-ink/70">{bank.number}</p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.8, rotate: [0, -15, 15, 0] }}
                    onClick={(event) => handleCopyRekening(event, bank.number, bank.bank, i)}
                    className="font-game rounded-xl border-2 border-bg-ink bg-bg-teal p-2 text-white shadow-[3px_3px_0_0_var(--color-bg-ink)]"
                    aria-label={`Salin nomor ${bank.bank}`}
                  >
                    <Copy size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
            <p className="font-game mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-bg-ink/40">
              {copiedIndex !== null ? '★ Item ditambahkan ke inventaris!' : 'Ketuk ikon salin untuk menyimpan nomor'}
            </p>
          </BoardTile>
          <Connector left />
        </div>

        {/* PETAK 7 · KUTIPAN — kartu "hikmat permainan" */}
        <div id="tile-quote" className="relative mb-14 md:w-[46%]">
          <BoardTile step={7} color="var(--color-bg-teal)" active={pawnTile === 6}>
            <motion.span
              animate={{ rotate: [-8, 8, -8], y: [0, -5, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto mb-2 block w-fit"
            >
              <Quote size={30} className="text-bg-tomato" fill="var(--color-bg-mustard)" />
            </motion.span>
            <p className="font-body text-center text-sm font-bold italic leading-relaxed text-bg-ink/80">
              "{quote}"
            </p>
            <p className="font-game mt-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-bg-teal">
              — {quoteSrc}
            </p>
          </BoardTile>
          <Connector right />
        </div>

        {/* PETAK 8 · FINISH + RSVP — papan skor & kartu ucapan */}
        <div id="tile-rsvp" className="relative">
          <BoardTile step={8} color="var(--color-bg-tomato)" active={pawnTile === 7}>
            <div className="flex items-center justify-center gap-2">
              <Trophy size={30} className="text-bg-mustard" fill="var(--color-bg-tomato)" />
              <h3 className="font-game text-2xl font-bold">FINISH!</h3>
            </div>
            <p className="font-game mb-4 text-[11px] font-bold uppercase tracking-widest text-bg-ink/40">
              Level terakhir: tinggalkan pesan kemenanganmu
            </p>

            {submittedData ? (
              <motion.div
                initial={{ scale: 0.7, opacity: 0, rotate: -3 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 16 }}
                className="rounded-2xl border-[3px] border-bg-ink bg-bg-cream p-5 text-center shadow-[4px_4px_0_0_var(--color-bg-ink)]"
              >
                <motion.div
                  animate={{ scale: [0, 1.3, 1], rotate: [0, 20, 0] }}
                  transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                  className="mx-auto w-fit"
                >
                  <CheckCircle2 size={40} className="text-bg-teal" />
                </motion.div>
                <p className="font-game mt-2 text-lg font-bold">🏆 Achievement Unlocked!</p>
                <p className="font-body text-xs font-bold text-bg-ink/60">
                  Terima kasih, {submittedData.guest_name}! Ucapanmu tercatat di papan skor.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSendRsvp} className="space-y-3 text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-game text-[10px] font-bold uppercase tracking-widest text-bg-ink/50">Nama Pemain</label>
                    <input
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="Nama kamu"
                      className="font-body w-full rounded-xl border-[3px] border-bg-ink bg-white p-3 text-xs font-bold outline-none placeholder:text-bg-ink/30 focus:bg-bg-cream"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-game text-[10px] font-bold uppercase tracking-widest text-bg-ink/50">Status</label>
                    <select
                      value={rsvpStatus}
                      onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                      className="font-body w-full rounded-xl border-[3px] border-bg-ink bg-white p-3 text-xs font-bold outline-none focus:bg-bg-cream"
                    >
                      <option value="hadir">🎮 Join Hadir!</option>
                      <option value="tidak_hadir">❌ Skip Dulu</option>
                      <option value="ragu">🎲 Masih Ragu</option>
                    </select>
                  </div>
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
                      <div className="space-y-1">
                        <label className="font-game text-[10px] font-bold uppercase tracking-widest text-bg-ink/50">Jumlah Tim (Tamu)</label>
                        <select
                          value={rsvpPax}
                          onChange={(e) => setRsvpPax(Number(e.target.value))}
                          className="font-body w-full rounded-xl border-[3px] border-bg-ink bg-white p-3 text-xs font-bold outline-none focus:bg-bg-cream"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>{n} Orang</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1">
                  <label className="font-game text-[10px] font-bold uppercase tracking-widest text-bg-ink/50">Pesan Kemenangan</label>
                  <textarea
                    required
                    maxLength={100}
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    placeholder="Tulis pesan untuk kedua pemain..."
                    className="font-body h-24 w-full resize-none rounded-xl border-[3px] border-bg-ink bg-white p-3 text-xs font-bold outline-none placeholder:text-bg-ink/30 focus:bg-bg-cream"
                  />
                  <div className="text-right text-[10px] font-bold text-bg-ink/40">{rsvpMessage.length}/100</div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmittingRsvp}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  className="font-game w-full rounded-xl border-[3px] border-bg-ink bg-bg-tomato py-3.5 text-sm font-bold text-white shadow-[4px_4px_0_0_var(--color-bg-ink)] transition-colors hover:bg-bg-teal disabled:opacity-60"
                >
                  {isSubmittingRsvp ? 'MENGIRIM…' : '🎯 SELESAIKAN MISI'}
                </motion.button>
              </form>
            )}
          </BoardTile>
        </div>

        {/* PAPAN SKOR: dinding ucapan ala leaderboard */}
        <div className="mt-16">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-0.5 w-10 bg-bg-ink/30" />
            <h3 className="font-game flex items-center gap-2 text-lg font-bold uppercase tracking-widest">
              <Trophy size={18} className="text-bg-mustard" fill="var(--color-bg-tomato)" /> Papan Skor
            </h3>
            <span className="h-0.5 w-10 bg-bg-ink/30" />
          </div>

          {(data?.rsvps || []).length === 0 ? (
            <p className="font-game text-center text-sm font-bold text-bg-ink/40">
              Belum ada pemain yang menyelesaikan misi. Jadilah yang pertama!
            </p>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2">
              {(data?.rsvps || []).map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 28, rotate: idx % 2 === 0 ? -1.5 : 1.5 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ type: 'spring', stiffness: 190, damping: 19, delay: Math.min(idx * 0.08, 0.6) }}
                  whileHover={{ rotate: idx % 2 === 0 ? 1 : -1, scale: 1.02 }}
                  className="mb-4 break-inside-avoid rounded-2xl border-[3px] border-bg-ink bg-white p-4 text-left shadow-[4px_4px_0_0_var(--color-bg-ink)]"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className="font-game flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-bg-ink text-[11px] font-bold text-white"
                      style={{ backgroundColor: idx === 0 ? '#FFD447' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--color-bg-teal)' }}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-game truncate text-sm font-bold">{item.guest_name}</span>
                    <span
                      className={`font-game ml-auto shrink-0 rounded-lg border-2 border-bg-ink px-1.5 py-0.5 text-[9px] font-bold uppercase text-white ${
                        item.status === 'hadir' ? 'bg-emerald-500' : item.status === 'tidak_hadir' ? 'bg-rose-500' : 'bg-bg-mustard text-bg-ink'
                      }`}
                    >
                      {item.status === 'hadir' ? 'Hadir' : item.status === 'tidak_hadir' ? 'Absen' : 'Ragu'}
                    </span>
                  </div>
                  <p className="font-body text-xs font-bold leading-relaxed text-bg-ink/70">"{item.message}"</p>
                  {item.reply && (
                    <div className="mt-2 rounded-xl border-2 border-dashed border-bg-teal bg-bg-cream p-2">
                      <span className="font-game text-[10px] font-bold uppercase tracking-widest text-bg-teal">↳ Balasan Mempelai</span>
                      <p className="font-body text-[11px] font-bold text-bg-ink/60">{item.reply}</p>
                    </div>
                  )}
                  <p className="font-game mt-2 text-right text-[9px] font-bold uppercase tracking-widest text-bg-ink/30">
                    {new Date(item.created_at || '').toLocaleDateString('id-ID')}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ─── FOOTER: TERIMA KASIH SUDAH BERMAIN ─────────────────── */}
      <footer className="relative z-10 pb-28 pt-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 17 }}
        >
          <p className="font-game text-xs font-bold uppercase tracking-[0.35em] text-bg-ink/50">Terima kasih sudah bermain</p>
          <p className="font-game mt-2 text-2xl font-bold">
            {groom} <span className="text-bg-tomato">&amp;</span> {bride}
          </p>
          <p className="font-game mt-1 text-[10px] font-bold uppercase tracking-widest text-bg-ink/40">
            serta keluarga besar kedua mempelai
          </p>
        </motion.div>
      </footer>

      {/* ─── FAB: DADU NAVIGASI + PIRINGAN MUSIK ────────────────── */}
      <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-center gap-3">
        <motion.button
          onClick={toggleAudio}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
          className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-bg-ink bg-bg-mustard text-bg-ink shadow-[4px_4px_0_0_var(--color-bg-ink)]"
          aria-label={isPlaying ? 'Matikan musik' : 'Nyalakan musik'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </motion.button>

        {/* Dadu lempar: navigasi petak berikutnya */}
        <motion.button
          onClick={rollDice}
          whileTap={{ scale: 0.85, rotate: 25 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ y: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-bg-ink bg-white text-bg-tomato shadow-[5px_5px_0_0_var(--color-bg-ink)]"
          aria-label="Lempar dadu untuk pindah petak"
        >
          <DiceFace value={diceValue} size={34} />
        </motion.button>
        <AnimatePresence>
          {diceHint && (
            <motion.span
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.8 }}
              className="font-game absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-xl border-2 border-bg-ink bg-bg-tomato px-3 py-1.5 text-[10px] font-bold uppercase text-white shadow-[3px_3px_0_0_var(--color-bg-ink)]"
            >
              → Menuju {['Start', 'Mempelai', 'Countdown', 'Acara', 'Galeri', 'Hadiah', 'Kutipan', 'Finish'][diceTarget]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Audio pemutar musik latar */}
      <audio ref={audioRef} src={audioUrl} loop preload="auto" />
    </div>
  );
}
