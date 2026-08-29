// ============================================================
// src/templates/themes/LanternNightTheme.tsx
// ------------------------------------------------------------
// Tema Undangan: Lantern Night (Kategori: RSVP)
// Konsep       : Malam penuh lentera kertas — palet indigo gelap dengan
//                aksen amber bercahaya. Interaksi kartu sengaja dibuat
//                "berani gerak": klik lentera memicu percikan bara ke
//                atas, rel lentera bandul di hero mengayun sinkron,
//                kartu info terangkat + bercahaya saat dibuka,
//                frame galeri gantung berayun di lightbox shared-element,
//                dan RSVP sukses bisa "menerbangkan lentera langit".
// Warna        : palet MILIK TEMA sendiri (@theme src/index.css):
//                --color-ln-night #191033, --color-ln-deep #100A26,
//                --color-ln-glow #FFC15E, --color-ln-plum #8A4E7D,
//                --color-ln-mist #E8E6FF. Tidak memakai --color-brand-*.
// Dipakai di   : templates/Registry.ts (slug 'lantern-night')
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
  Flame,
  Heart,
  Loader2,
  MapPin,
  Pause,
  Play,
  Send,
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

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── PERCIKAN BARA (efek utama: percikan naik ke langit saat klik) ──
interface EmberPoint { id: number; x: number; y: number }

function useEmbers(): { embers: EmberPoint[]; spawnEmber: (x: number, y: number) => void } {
  const [embers, setEmbers] = useState<EmberPoint[]>([]);
  const spawnEmber = (x: number, y: number) => {
    const id = Date.now() + Math.random();
    setEmbers((prev) => [...prev.slice(-4), { id, x, y }]);
    window.setTimeout(() => setEmbers((prev) => prev.filter((b) => b.id !== id)), 1200);
  };
  return { embers, spawnEmber };
}

/** Percikan bara & kilau bintang kecil yang melayang naik dari titik klik. */
function EmberLayer({ embers }: { embers: EmberPoint[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[70]" aria-hidden="true">
      {embers.map((e) => (
        <span key={e.id} className="absolute" style={{ left: e.x, top: e.y }}>
          {[...Array(10)].map((_, i) => {
            const spread = (i - 4.5) * 16;
            const rise = -(46 + (i % 5) * 18);
            const isStar = i % 3 === 0;
            return (
              <motion.span
                key={i}
                className={`absolute block text-ln-glow ${isStar ? '' : 'rounded-full'}`}
                style={
                  isStar
                    ? { fontSize: 11, lineHeight: 1 }
                    : {
                        width: i % 2 === 0 ? 6 : 4,
                        height: i % 2 === 0 ? 6 : 4,
                        backgroundColor: i % 2 === 0 ? 'var(--color-ln-glow)' : 'var(--color-ln-plum)',
                        boxShadow: '0 0 8px 2px rgba(255,193,94,.45)',
                      }
                }
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: spread, y: rise, opacity: 0, scale: isStar ? 0.5 : 0.3 }}
                transition={{ duration: 1.05, ease: EASE_OUT }}
              >
                {isStar ? '✦' : null}
              </motion.span>
            );
          })}
        </span>
      ))}
    </div>
  );
}

export default function LanternNightTheme({
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
  const { embers, spawnEmber } = useEmbers();

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
  const [openLanternCard, setOpenLanternCard] = useState<string | null>(null);
  // Penunjuk berapa kali "lentera langit" diterbangkan di panel sukses RSVP
  const [lanternFlight, setLanternFlight] = useState(0);

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
    spawnEmber(e.clientX, e.clientY); // percikan bara di titik klik
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
      setLanternFlight(0); // reset supaya lentera langit bisa diterbangkan lagi
    } catch (err) {
      console.error('Gagal mengirim RSVP:', err);
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden bg-ln-night text-ln-mist selection:bg-ln-glow selection:text-ln-night"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% -10%, rgba(138,78,125,.35), transparent 55%), radial-gradient(ellipse at 85% 105%, rgba(89,217,201,.10), transparent 40%)',
      }}
    >
      {/* Font tema + kelas utilitas glow (scoped nama ln-*) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;600;800&display=swap');
        .font-lantern-serif { font-family: 'Cormorant Garamond', serif; }
        .font-lantern-body { font-family: 'Manrope', sans-serif; }
        .ln-glow-text { text-shadow: 0 0 18px rgba(255,193,94,.55); }
        .ln-glow-ring:hover { box-shadow: 0 0 34px 4px rgba(255,193,94,.35); }
      `}</style>

      <audio ref={audioRef} src={audioUrl} loop preload="auto" />
      <EmberLayer embers={embers} />

      {/* ─── LANGIT MALAM: bintang kedip + kunang-kunang naik ─── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        {[...Array(18)].map((_, i) => (
          <motion.span
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 23 + 5) % 100}%`,
              top: `${(i * 31 + 3) % 90}%`,
              width: 2,
              height: 2,
              opacity: 0.6,
            }}
            animate={{ opacity: [0.15, 0.9, 0.15], scale: [1, 1.4, 1] }}
            transition={{ duration: 2.4 + (i % 4), repeat: Infinity, delay: i * 0.28 }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={`fly-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${7 + i * 12}%`,
              width: 3 + (i % 2) * 3,
              height: 3 + (i % 2) * 3,
              backgroundColor: 'var(--color-ln-glow)',
              filter: 'blur(.5px)',
              boxShadow: '0 0 9px 3px rgba(255,193,94,.4)',
            }}
            animate={{ y: ['12vh', '-14vh'], x: [0, i % 2 ? 22 : -22, 0], opacity: [0.15, 0.9, 0.15] }}
            transition={{ duration: 7 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: i * 0.9 }}
          />
        ))}
      </div>

      {/* ─── AMPLOP PEMBUKA: malam gelap, satu lentera menyala ─── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="cover"
            className="fixed inset-0 z-50 flex items-center justify-center bg-ln-deep"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(14px)' }}
            transition={{ duration: 1.1, ease: EASE_OUT }}
          >
            {/* Cahaya lentera membesar pelan seperti sedang menyala */}
            <motion.div
              className="absolute w-[36rem] h-[36rem] rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,193,94,.22) 0%, rgba(255,193,94,.06) 45%, transparent 70%)',
              }}
              animate={{ scale: [0.85, 1.05, 0.95], opacity: [0.6, 0.9, 0.75] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative text-center px-8 max-w-md">
              <motion.p
                className="text-ln-mist/60 text-xs uppercase tracking-[0.4em]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7, ease: EASE_OUT }}
              >
                The Wedding Of
              </motion.p>

              <motion.h1
                className="font-lantern-serif font-semibold text-5xl sm:text-6xl mt-5 leading-tight ln-glow-text"
                initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.55, duration: 1, ease: EASE_OUT }}
              >
                {groom} <span className="text-ln-glow">&amp;</span> {bride}
              </motion.h1>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.05, duration: 0.9, ease: EASE_OUT }}
                className="h-px w-44 mx-auto my-7 bg-gradient-to-r from-transparent via-ln-glow to-transparent"
              />

              {/* Lentera utama yang digoyang angin — tali & badan
                  lentera disejajarkan tepat di satu poros (flex column) */}
              <motion.div
                className="inline-flex flex-col items-center origin-top"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Tali gantung */}
                <span className="block w-px h-10 bg-gradient-to-b from-transparent to-ln-mist/35" />
                {/* Gantungan lentera */}
                <span className="block w-8 h-1.5 rounded-full bg-ln-glow/80 shadow-[0_0_10px_rgba(255,193,94,.5)]" />
                <motion.button
                  onClick={(e) => {
                    open();
                    spawnEmber(e.clientX, e.clientY);
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Buka undangan — nyalakan lentera"
                  className="relative mt-0 flex cursor-pointer items-center justify-center"
                  style={{ width: 84, height: 112 }}
                >
                  {/* Kup lampu atas & bawah */}
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-2.5 rounded-t-md bg-[#8A5A2B]" />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-2.5 rounded-b-md bg-[#8A5A2B]" />
                  {/* Badan lentera (oval) */}
                  <span
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[84px] h-[96px]"
                    style={{
                      borderRadius: '50% / 46%',
                      background:
                        'radial-gradient(ellipse at 50% 38%, #FFF3D6 0%, #FFD68A 30%, var(--color-ln-glow) 60%, #C97B3D 100%)',
                      boxShadow:
                        '0 0 55px 16px rgba(255,193,94,.30), inset 0 -6px 14px rgba(160,84,30,.35)',
                    }}
                  />
                  {/* Rusuk lentera */}
                  {[38, 58, 78].map((w) => (
                    <span
                      key={w}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#B06A2E]/40 rounded-[50%]"
                      style={{ width: w, height: 88 }}
                    />
                  ))}
                  <Flame size={26} className="relative z-10 text-white/95" />
                </motion.button>
                <p className="mt-5 text-[11px] uppercase tracking-[0.3em] text-ln-mist/60">
                  Sentuh lentera untuk membuka
                </p>
              </motion.div>

              {guestName && (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.25, type: 'spring', stiffness: 220, damping: 18 }}
                  className="mt-6 inline-block bg-white/10 border border-ln-glow/40 rounded-xl px-6 py-2 backdrop-blur-sm"
                >
                  <p className="text-[10px] uppercase tracking-[0.3em] text-ln-mist/55">Untuk</p>
                  <p className="font-semibold">{guestName}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <main className="relative z-10">
          {/* ─── HERO: judul serif + rel lentera mengayun ─── */}
          <section className="pt-16 pb-10 px-5 text-center">
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.45em] text-ln-mist/55">A Night of Lanterns</p>
              <h2 className="font-lantern-serif text-4xl sm:text-6xl font-semibold mt-4 leading-tight">
                {groom} <span className="ln-glow-text text-ln-glow">&amp;</span> {bride}
              </h2>
              <p className="mt-3 text-sm text-ln-mist/60">{formattedDate}</p>
            </Reveal>

            {/* Rel lentera: tiap klik lentera melontarkan percikan bara ke atas */}
            <Reveal delay={0.15}>
              <div className="flex justify-center items-end gap-5 sm:gap-9 mt-10" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.button
                    key={i}
                    onClick={(e) => spawnEmber(e.clientX, e.clientY)}
                    aria-label={`Lentera ${i + 1}`}
                    whileHover={{ scale: 1.14 }}
                    whileTap={{ scale: 0.85 }}
                    className="origin-top cursor-pointer"
                    animate={{ rotate: i % 2 === 0 ? [-5, 5, -5] : [5, -5, 5] }}
                    transition={{ duration: 3.2 + i * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <span className="block w-px h-8 sm:h-12 bg-ln-mist/25 mx-auto" />
                    <LanternGlyph size={i === 2 ? 56 : 36} />
                  </motion.button>
                ))}
              </div>
            </Reveal>

            {/* Potret pasangan dalam bingkai gerbang bercahaya */}
            <Reveal delay={0.2} className="mt-11 flex justify-center">
              <motion.div
                className="max-w-xs w-full bg-ln-deep/70 border border-ln-glow/30 rounded-t-[9rem] rounded-b-3xl p-3 backdrop-blur-sm ln-glow-ring"
                initial={{ y: 26, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 110, damping: 16 }}
                whileHover={{ y: -6 }}
              >
                <img
                  src={photos.cover}
                  alt={`${groom} & ${bride}`}
                  draggable={false}
                  className="rounded-t-[8rem] rounded-b-2xl w-full aspect-[3/4] object-cover"
                />
                <p className="font-lantern-serif italic text-lg mt-3 mb-1 text-ln-glow/90">
                  Dua hati, satu cahaya
                </p>
              </motion.div>
            </Reveal>

            <Reveal delay={0.25}>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="mt-9 mx-auto w-fit text-ln-mist/40">
                <ChevronDown size={24} />
              </motion.div>
            </Reveal>
          </section>

          {/* ─── KUTIPAN ─── */}
          <section className="px-5 py-4">
            <Reveal>
              <figure className="max-w-md mx-auto bg-white/[0.06] border border-ln-glow/20 rounded-2xl p-6 text-center backdrop-blur-sm">
                <Flame size={18} className="mx-auto text-ln-glow" />
                <blockquote className="mt-3 font-lantern-serif italic text-[15px] leading-relaxed text-ln-mist/85">“{quote}”</blockquote>
                <figcaption className="mt-3 text-[10px] uppercase tracking-[0.35em] text-ln-mist/50">— {quoteSrc}</figcaption>
              </figure>
            </Reveal>
          </section>

          {/* ─── COUNTDOWN EMBER (angka naik seperti percik api) ─── */}
          <section className="px-5 py-10">
            <Reveal>
              <h3 className="font-lantern-serif text-2xl sm:text-3xl font-semibold text-center mb-7">Menuju Hari Bahagia</h3>
              <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                {(
                  [
                    ['Hari', timeLeft.days],
                    ['Jam', timeLeft.hours],
                    ['Menit', timeLeft.minutes],
                    ['Detik', timeLeft.seconds],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="bg-ln-deep/80 border border-ln-glow/25 rounded-2xl py-3 text-center overflow-hidden backdrop-blur-sm">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={value}
                        className="block font-extrabold text-2xl sm:text-3xl text-ln-glow ln-glow-text tabular-nums"
                        initial={{ y: '90%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '-90%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                      >
                        {String(value).padStart(2, '0')}
                      </motion.span>
                    </AnimatePresence>
                    <span className="block text-[10px] uppercase tracking-[0.3em] text-ln-mist/55 mt-1">{label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          {/* ─── MEMPELAI: dua kartu lentera gantung, klik → terangkat & percik ─── */}
          <section className="px-5 py-10">
            <Reveal>
              <h3 className="font-lantern-serif text-3xl font-semibold text-center mb-2">Dua Lentera Satu Cahaya</h3>
              <p className="text-center text-sm text-ln-mist/55 mb-8">Ketuk kartunya untuk mengangkatnya</p>
              <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {[
                  { role: 'Mempelai Pria', name: groom, img: photos.groom, parents: groomParents },
                  { role: 'Mempelai Wanita', name: bride, img: photos.bride, parents: brideParents },
                ].map((person) => (
                  <motion.div
                    key={person.role}
                    layout
                    onClick={(e) => spawnEmber(e.clientX, e.clientY)}
                    whileHover={{ y: -8 }}
                    whileTap={{ scale: 0.97 }}
                    className="cursor-pointer"
                  >
                    {/* tali gantung */}
                    <span className="block w-px h-10 bg-ln-mist/25 mx-auto" />
                    <div className="relative rounded-[1.75rem] overflow-hidden border border-ln-glow/30 shadow-2xl bg-ln-deep/70 backdrop-blur-sm">
                      <img src={person.img} alt={person.name} loading="lazy" className="w-full aspect-[4/5] object-cover" draggable={false} />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ln-night via-ln-night/70 to-transparent p-5 pt-14 text-left">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-ln-glow/80">{person.role}</p>
                        <p className="font-lantern-serif text-3xl font-semibold leading-tight">{person.name}</p>
                        <p className="mt-1.5 text-xs text-ln-mist/65">{person.parents}</p>
                      </div>
                      {/* nyala kecil di sudut kartu */}
                      <motion.span
                        className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--color-ln-glow)', boxShadow: '0 0 18px 5px rgba(255,193,94,.45)' }}
                        animate={{ opacity: [0.75, 1, 0.75], scale: [0.94, 1.06, 0.94] }}
                        transition={{ duration: 2.2, repeat: Infinity }}
                      >
                        <Flame size={13} className="text-white" />
                      </motion.span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </section>

          {/* ─── KARTU ACARA: lentera tag — dibuka = naik + cincin cahaya ─── */}
          <section className="px-5 py-10">
            <Reveal>
              <h3 className="font-lantern-serif text-3xl font-semibold text-center mb-8">Rangkaian Acara</h3>
              <div className="space-y-5 max-w-xl mx-auto">
                {[
                  {
                    id: 'akad',
                    title: 'Akad Nikah',
                    icon: <Heart size={18} />,
                    time: schedule.akadTime,
                    schedDate: schedule.akadDate,
                    desc: 'Prosesi ijab kabul — inti dari hari bahagia kami.',
                  },
                  {
                    id: 'resepsi',
                    title: 'Resepsi',
                    icon: <CalendarDays size={18} />,
                    time: schedule.resepsiTime,
                    schedDate: schedule.resepsiDate,
                    desc: 'Ramah tamah bersama keluarga besar — mari bertegur sapa.',
                  },
                ].map((ev) => {
                  const isOpenEv = openLanternCard === ev.id;
                  return (
                    <motion.div
                      key={ev.id}
                      layout
                      onClick={() => setOpenLanternCard(isOpenEv ? null : ev.id)}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                      className={`relative cursor-pointer rounded-3xl border backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
                        isOpenEv
                          ? 'border-ln-glow/70 bg-ln-deep/90'
                          : 'border-ln-mist/15 bg-white/[0.05] hover:border-ln-glow/40'
                      }`}
                      style={isOpenEv ? { boxShadow: '0 0 42px 6px rgba(255,193,94,.22)' } : undefined}
                    >
                      <div className="flex items-center gap-4 p-5">
                        <span
                          className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors duration-300 ${
                            isOpenEv ? 'text-white' : 'bg-ln-glow/20 text-ln-glow'
                          }`}
                          style={isOpenEv ? { background: 'var(--color-ln-glow)', boxShadow: '0 0 20px 5px rgba(255,193,94,.4)' } : undefined}
                        >
                          {ev.icon}
                        </span>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold text-lg leading-tight">{ev.title}</p>
                          <p className="text-xs text-ln-mist/60 truncate">
                            {formatDate(ev.schedDate || date, 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · {ev.time}
                          </p>
                        </div>
                        <motion.span animate={{ rotate: isOpenEv ? 180 : 0 }}>
                          <ChevronDown size={19} className="text-ln-mist/50" />
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
                            <div className="px-5 pb-5 pt-0 space-y-3 text-left">
                              <p className="text-sm text-ln-mist/75">{ev.desc}</p>
                              <a
                                href={venue.mapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-ln-glow hover:underline"
                              >
                                <MapPin size={15} /> Lihat lokasi di Google Maps
                              </a>
                              <p className="text-xs text-ln-mist/55 flex items-start gap-1.5">
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

          {/* ─── GALERI: frame gantung + lightbox shared-element berayun ─── */}
          <section className="px-5 py-10">
            <Reveal>
              <h3 className="font-lantern-serif text-3xl font-semibold text-center mb-8">Galeri Kenangan</h3>
              <div className="columns-2 sm:columns-3 gap-4 max-w-4xl mx-auto [column-fill:_balance]">
                {gallery.map((img, idx) => (
                  <motion.div key={`${img}-${idx}`} className="mb-5 break-inside-avoid" aria-hidden={false}>
                    {/* tali gantung tiap frame */}
                    <span className="block w-px h-7 bg-ln-mist/25 mx-auto" />
                    <motion.button
                      layoutId={`ln-photo-${idx}`}
                      onClick={(e) => {
                        setActiveImageIdx(idx);
                        spawnEmber(e.clientX, e.clientY);
                      }}
                      initial={{ opacity: 0, y: 44 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      whileHover={{ y: -6, rotate: idx % 2 === 0 ? -1.5 : 1.5 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ duration: 0.6, ease: EASE_OUT, delay: (idx % 3) * 0.09 }}
                      className={`block w-full p-2 pb-6 rounded-2xl border shadow-xl cursor-pointer bg-ln-deep/80 backdrop-blur-sm ${
                        idx % 2 === 0 ? 'rotate-[1.2deg]' : '-rotate-[1.2deg]'
                      } border-ln-glow/30 hover:border-ln-glow/70`}
                    >
                      <img src={img} alt={`Kenangan ${idx + 1}`} loading="lazy" draggable={false} className="w-full rounded-xl object-cover" />
                      <span className="block mt-2 text-[10px] uppercase tracking-[0.3em] text-ln-mist/45">
                        Kenangan {idx + 1}
                      </span>
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Lightbox: frame terbang dari grid lalu berayun pelan di pusat */}
              <AnimatePresence>
                {activeImage && (
                  <motion.div
                    key="lightbox"
                    className="fixed inset-0 z-50 bg-ln-night/95 backdrop-blur-sm flex items-center justify-center p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveImageIdx(null)}
                  >
                    <motion.figure
                      layoutId={`ln-photo-${activeImageIdx}`}
                      className="relative bg-ln-deep border border-ln-glow/40 rounded-2xl p-3 pb-9 shadow-2xl max-w-lg"
                      transition={{ type: 'spring', stiffness: 170, damping: 22 }}
                    >
                      {/* wrapper ayun agar tidak bentrok dengan layout animation */}
                      <motion.div
                        animate={{ rotate: [-1.4, 1.4, -1.4] }}
                        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ transformOrigin: 'top center' }}
                      >
                        <img
                          src={activeImage}
                          alt="Kenangan diperbesar"
                          draggable={false}
                          className="w-full max-h-[68vh] object-contain rounded-xl"
                        />
                      </motion.div>
                      <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.35em] text-ln-glow/80">
                        Kenangan {(activeImageIdx ?? 0) + 1}
                      </span>
                      <button
                        onClick={() => setActiveImageIdx(null)}
                        aria-label="Tutup foto"
                        className="absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer"
                        style={{ background: 'var(--color-ln-plum)', boxShadow: '0 0 16px 4px rgba(138,78,125,.55)' }}
                      >
                        <X size={15} />
                      </button>
                    </motion.figure>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          </section>

          {/* ─── AMPELOP DIGITAL: tag kayu bercahaya + percik bara saat salin ─── */}
          <section className="px-5 py-10">
            <Reveal>
              <h3 className="font-lantern-serif text-3xl font-semibold text-center mb-2">Tanda Kasih</h3>
              <p className="text-center text-sm text-ln-mist/55 mb-8">Ketuk nomor rekening untuk menyalin otomatis</p>
              <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
                {banks.length === 0 && (
                  <p className="col-span-full text-center text-sm text-ln-mist/40 italic">Informasi kado menyusul.</p>
                )}
                {banks.map((bank, idx) => (
                  <motion.div
                    key={`${bank.bank}-${bank.number}`}
                    variants={{
                      idle: {},
                      glow: {
                        scale: [1, 1.05, 1.01, 1],
                        boxShadow: [
                          '0 0 0px 0px rgba(255,193,94,0)',
                          '0 0 34px 6px rgba(255,193,94,.35)',
                          '0 0 14px 2px rgba(255,193,94,.18)',
                          '0 0 0px 0px rgba(255,193,94,0)',
                        ],
                        transition: { duration: 0.9, ease: 'easeInOut' },
                      },
                    }}
                    animate={copiedIndex === idx ? 'glow' : 'idle'}
                    onClick={(e) => handleCopyRekening(e, bank.number, bank.bank, idx)}
                    className="relative cursor-pointer select-none rounded-3xl border border-ln-glow/35 bg-ln-deep/80 backdrop-blur-sm p-6"
                  >
                    {/* lubang tali tag */}
                    <span className="absolute left-5 top-5 w-2.5 h-2.5 rounded-full border-2 border-ln-glow/60" />
                    <div className="flex items-start justify-between gap-3 pl-5">
                      <div className="min-w-0">
                        <p className="font-semibold flex items-center gap-2">
                          <Copy size={15} className="text-ln-glow shrink-0" /> {bank.bank}
                        </p>
                        <p className="mt-2 text-xl sm:text-2xl font-extrabold tracking-wider tabular-nums text-ln-glow ln-glow-text">
                          {bank.number}
                        </p>
                        <p className="mt-1 text-sm text-ln-mist/65 truncate">a.n. {bank.name}</p>
                      </div>
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white"
                        style={{ background: 'var(--color-ln-plum)' }}
                      >
                        {copiedIndex === idx ? <CheckCircle2 size={17} /> : <Copy size={15} />}
                      </span>
                    </div>
                    <AnimatePresence>
                      {copiedIndex === idx && (
                        <motion.p
                          key="copied"
                          initial={{ opacity: 0, y: 10, scale: 0.85 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-ln-glow"
                        >
                          Tersalin — terima kasih atas cahayanya
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </section>

          {/* ─── RSVP ─── */}
          <section className="px-5 py-10">
            <Reveal>
              <h3 className="font-lantern-serif text-3xl font-semibold text-center mb-7">Konfirmasi Kehadiran</h3>
              {rsvpSuccess ? (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                  className="max-w-md mx-auto bg-white/[0.06] border border-ln-glow/40 rounded-3xl p-8 text-center backdrop-blur-sm"
                >
                  <motion.span
                    className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-ln-glow)', boxShadow: '0 0 26px 7px rgba(255,193,94,.4)' }}
                    animate={{ scale: [0.6, 1.15, 1], rotate: [-14, 8, 0] }}
                    transition={{ duration: 0.7, ease: EASE_OUT }}
                  >
                    <CheckCircle2 size={30} className="text-white" />
                  </motion.span>
                  <p className="font-lantern-serif text-xl font-semibold mt-4">Terima kasih!</p>
                  <p className="text-sm text-ln-mist/65 mt-1">
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

                  {/* Lentera langit: klik untuk menerbangkannya ke atas lagi */}
                  <div className="relative h-36 mt-6 overflow-hidden">
                    <AnimatePresence>
                      <motion.div
                        key={lanternFlight}
                        className="absolute left-1/2 -translate-x-1/2 bottom-0 origin-top"
                        animate={{
                          rotate: [-4, 4, -3, 0],
                          y: [0, -20, -150],
                          x: [0, 16, 30],
                          scale: [1, 0.92, 0.72],
                          opacity: [1, 1, 0.85, 0],
                        }}
                        transition={{ duration: 3.4, ease: 'easeIn' }}
                      >
                        <LanternGlyph size={46} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setLanternFlight((f) => f + 1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold cursor-pointer bg-ln-glow text-ln-night"
                  >
                    Terbangkan Lentera
                  </motion.button>
                  <p className="mt-3 text-[11px] text-ln-mist/50 italic">Satu lentera = satu doa yang naik ke langit</p>
                </motion.div>
              ) : (

                <form
                  onSubmit={handleSendRsvp}
                  className="max-w-md mx-auto bg-white/[0.05] border border-ln-mist/15 rounded-3xl p-6 sm:p-7 backdrop-blur-sm space-y-5"
                >
                  <div className="grid grid-cols-3 gap-1 bg-ln-deep/70 rounded-full p-1 relative">
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
                            selected ? 'text-ln-night' : 'text-ln-mist/60'
                          }`}
                        >
                          {selected && (
                            <motion.span
                              layoutId="ln-rsvp-pill"
                              className="absolute inset-0 rounded-full bg-ln-glow"
                              style={{ boxShadow: '0 0 18px 4px rgba(255,193,94,.35)' }}
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {rsvpStatus !== 'tidak_hadir' && (
                    <label className="block text-left">
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-ln-mist/50">Jumlah Tamu</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={rsvpPax}
                        onChange={(e) => setRsvpPax(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-xl border border-ln-mist/15 bg-ln-deep/70 px-4 py-3 text-sm text-ln-mist focus:outline-none focus:ring-2 focus:ring-ln-glow/50"
                      />
                    </label>
                  )}

                  <label className="block text-left">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-ln-mist/50">Nama</span>
                    <input
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="Nama kamu"
                      className="mt-1.5 w-full rounded-xl border border-ln-mist/15 bg-ln-deep/70 px-4 py-3 text-sm text-ln-mist placeholder:text-ln-mist/30 focus:outline-none focus:ring-2 focus:ring-ln-glow/50"
                    />
                  </label>

                  <label className="block text-left">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-ln-mist/50">Ucapan &amp; Doa</span>
                    <textarea
                      rows={3}
                      value={rsvpMessage}
                      onChange={(e) => setRsvpMessage(e.target.value)}
                      placeholder="Titipkan doa terbaikmu…"
                      className="mt-1.5 w-full resize-none rounded-xl border border-ln-mist/15 bg-ln-deep/70 px-4 py-3 text-sm text-ln-mist placeholder:text-ln-mist/30 focus:outline-none focus:ring-2 focus:ring-ln-glow/50"
                    />
                  </label>

                  <motion.button
                    type="submit"
                    disabled={isSubmittingRsvp}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.93 }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-ln-glow text-ln-night font-bold disabled:opacity-60 cursor-pointer"
                    style={{ boxShadow: '0 0 24px 5px rgba(255,193,94,.28)' }}
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

              {/* Wall ucapan — lembar doa bergoyang masuk */}
              {wishesList.length > 0 && (
                <div className="max-w-md mx-auto mt-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ln-mist/45 mb-3 flex items-center gap-1.5">
                    <Users size={13} /> {wishesList.length} Doa Terkirim
                  </p>
                  <div className="max-h-72 space-y-3 pr-1 chat-scroll">
                    <AnimatePresence initial={false}>
                      {wishesList.map((wish, idx) => (
                        <motion.article
                          key={wish.id}
                          layout
                          initial={{ opacity: 0, y: -20, rotate: -4, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, rotate: idx % 2 === 0 ? 1 : -1, scale: 1 }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                          className={`rounded-xl p-4 border shadow-sm ${
                            idx % 2 === 0
                              ? 'bg-white/[0.92] text-ln-night border-white/20'
                              : 'bg-ln-deep/85 border-ln-glow/25'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-sm">{wish.guest_name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                wish.status === 'hadir' ? 'bg-ln-glow/25 text-current' : 'bg-black/10 opacity-60'
                              }`}
                            >
                              {wish.status === 'hadir'
                                ? `Hadir · ${wish.pax}`
                                : wish.status === 'ragu'
                                  ? 'Ragu'
                                  : 'Tidak Hadir'}
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed ${idx % 2 === 0 ? 'text-ln-night/80' : 'text-ln-mist/80'}`}>
                            {wish.message}
                          </p>
                        </motion.article>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </Reveal>
          </section>

          {/* ─── CLOSING ─── */}
          <footer className="pt-12 pb-9 px-5 text-center border-t border-ln-glow/15">
            <Reveal>
              <p className="font-lantern-serif italic text-base text-ln-mist/75 max-w-sm mx-auto leading-relaxed">
                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan
                memberikan doa restu kepada kami.
              </p>
              {/* Lentera penutup yang mengayun pelan di atas nama pasangan */}
              <div className="mt-9 mb-2 flex justify-center" aria-hidden="true">
                <motion.div className="origin-top" animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                  <span className="block w-px h-8 bg-ln-mist/25 mx-auto" />
                  <LanternGlyph size={34} />
                </motion.div>
              </div>
              <h4 className="font-lantern-serif text-3xl sm:text-4xl font-semibold mt-3 ln-glow-text">{groom} &amp; {bride}</h4>
              <p className="text-xs text-ln-mist/55 mt-1">Beserta Keluarga Besar</p>
              <p className="pt-8 text-[11px] text-ln-mist/35 tracking-wider">Lantern Night · LoVerse Digital Invitation</p>
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
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            aria-label={isPlaying ? 'Jeda musik' : 'Putar musik'}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer bg-ln-glow text-ln-night"
            style={{ boxShadow: '0 0 22px 6px rgba(255,193,94,.3)' }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Siluet lentera kertas murni CSS, dipakai ulang di rel hero & panel sukses. */
function LanternGlyph({ size = 40 }: { size?: number }) {
  return (
    <span className="relative inline-block align-top" style={{ width: size, height: size * 1.35 }} aria-hidden="true">
      {/* tudung atas */}
      <span
        className="absolute rounded-sm bg-ln-plum"
        style={{ left: size * 0.2, right: size * 0.2, top: 0, height: size * 0.12 }}
      />
      {/* badan bercahaya */}
      <span
        className="absolute inset-x-0 rounded-full flex items-center justify-center"
        style={{
          top: size * 0.08,
          bottom: size * 0.14,
          background: 'linear-gradient(180deg,#FFD68A 0%, var(--color-ln-glow) 55%, #C97B3D 100%)',
          boxShadow: '0 0 24px 8px rgba(255,193,94,.30)',
        }}
      >
        <span className="block w-1.5 h-1.5 rounded-full bg-white" style={{ boxShadow: '0 0 12px 5px rgba(255,255,255,.75)' }} />
      </span>
      {/* rumbai bawah */}
      <span
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1.5 rounded-b-full bg-ln-plum"
        style={{ height: size * 0.14 }}
      />
    </span>
  );
}

/** Scroll-reveal generik antar-section (versi lembut/naik + unblur). */
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
      initial={{ opacity: 0, y: 38, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
