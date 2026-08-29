// ============================================================
// src/templates/themes/RobloxTheme.tsx
// ------------------------------------------------------------
// Tema Undangan: Block Party (Kategori: RSVP)
// Konsep       : DUNIA ROBLOX — undangan tampil seperti lobi game
//                Roblox: player card bergaya username, avatar blocky
//                (noob) yang digambar murni dengan CSS, logo Roblox
//                & ikon Robux SVG inline, tombol merah "TAP TO SPAWN",
//                chat bubble untuk kutipan, dan tanggal acara sebagai
//                "game mode".
// Font         : Luckiest Guy (display — huruf tebal ala blok) +
//                Nunito (body). Di-import via <style> Google Fonts.
// Aset         : SVG/CSS inline semua (logo Roblox miring, heksagon
//                Robux, avatar blocky kepala kuning, blok melayang)
//                sehingga tidak bergantung hotlink eksternal.
// Warna        : abu terang #F2F4F8, ink #232527, merah Roblox
//                #E2231A, kuning #F5CD30, biru #00A2FF.
// Dipakai di   : templates/Registry.ts (slug 'roblox')
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
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* Logo Roblox — kotak miring berlubang kotak (SVG inline) */
function RobloxLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="Roblox">
      <path
        fillRule="evenodd"
        d="M24 0h76L76 100H0L24 0Zm26 32-7 36 36 7 7-36-36-7Z"
        fill="#232527"
      />
    </svg>
  );
}

/* Ikon Robux — heksagon dengan huruf R (SVG inline) */
function RobuxIcon({ size = 22, color = '#E2231A' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="Robux">
      <polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill={color} />
      <polygon points="50,16 81,33 81,67 50,84 19,67 19,33" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="4" />
      <text x="50" y="71" textAnchor="middle" fontFamily="'Luckiest Guy', sans-serif" fontSize="50" fill="#fff">R</text>
    </svg>
  );
}

/* Avatar blocky (noob) — digambar murni dengan div CSS */
function NoobAvatar({ shirt = '#00A2FF', flip = false, size = 120 }: { shirt?: string; flip?: boolean; size?: number }) {
  const S = (n: number) => `${size * n}px`;
  return (
    <div className="relative mx-auto" style={{ width: S(0.66), height: S(1.32), transform: flip ? 'scaleX(-1)' : undefined }}>
      {/* kepala */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-[18%] border-[3px] border-[#232527] bg-[#F5CD30] shadow-[4px_4px_0_0_#232527]" style={{ width: S(0.6), height: S(0.52) }}>
        <span className="absolute left-[20%] top-[36%] rounded-full bg-[#232527]" style={{ width: S(0.07), height: S(0.14) }} />
        <span className="absolute right-[20%] top-[36%] rounded-full bg-[#232527]" style={{ width: S(0.07), height: S(0.14) }} />
        <span className="absolute left-1/2 top-[64%] -translate-x-1/2 rounded-b-full border-b-[3px] border-[#232527]" style={{ width: S(0.3), height: S(0.1) }} />
      </div>
      {/* badan */}
      <div className="absolute left-1/2 rounded-[12%] border-[3px] border-[#232527] shadow-[4px_4px_0_0_#232527]" style={{ top: S(0.55), marginLeft: S(-0.28), width: S(0.56), height: S(0.42), backgroundColor: shirt }} />
      {/* lengan */}
      <div className="absolute left-0 rounded-[14%] border-[3px] border-[#232527] bg-[#F5CD30] shadow-[4px_4px_0_0_#232527]" style={{ top: S(0.57), width: S(0.14), height: S(0.36) }} />
      <div className="absolute right-0 rounded-[14%] border-[3px] border-[#232527] bg-[#F5CD30] shadow-[4px_4px_0_0_#232527]" style={{ top: S(0.57), width: S(0.14), height: S(0.36) }} />
      {/* kaki */}
      <div className="absolute rounded-[10%] border-[3px] border-[#232527] bg-[#4B5563] shadow-[4px_4px_0_0_#232527]" style={{ top: S(0.99), left: '18%', width: S(0.22), height: S(0.3) }} />
      <div className="absolute rounded-[10%] border-[3px] border-[#232527] bg-[#4B5563] shadow-[4px_4px_0_0_#232527]" style={{ top: S(0.99), right: '18%', width: S(0.22), height: S(0.3) }} />
    </div>
  );
}

export default function RobloxTheme({
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
  const quote = data?.quote || 'Blok demi blok kita tumpuk, sampai menjadi menara yang tak bisa roboh.';
  const quoteSrc = data?.quote_src || '— Player 1 & Player 2';
  const audioUrl = data?.audio_url || 'https://r2.loverse.my.id/defaults/audio/ee2e74c72c.mp3';

  const formattedDate = formatDate(date, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const akadClock = (schedule.akadTime || '08:00').split(' ')[0].substring(0, 5);
  const timeLeft = useCountdown(date, akadClock);
  const fmt = (v?: string) =>
    formatDate(v || date, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const akadDateText = fmt(schedule.akadDate);
  const resepsiDateText = fmt(schedule.resepsiDate);

  // ─── STATE RSVP & SALIN ─────────────────────────────────────
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(submittedData?.status || 'hadir');
  const [rsvpPax, setRsvpPax] = useState<number>(submittedData?.pax || 1);
  const [rsvpName, setRsvpName] = useState<string>(submittedData?.guest_name || guestName || '');
  const [rsvpMessage, setRsvpMessage] = useState<string>(submittedData?.message || '');
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(Boolean(submittedData));
  const [wishesList, setWishesList] = useState<RsvpRow[]>(() => data?.rsvps || []);

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
      console.error('[Roblox] RSVP fail', err);
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  return (
    <div className="rbx-body rbx-dots min-h-screen w-full overflow-x-hidden bg-[#F2F4F8] text-[#232527]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Nunito:wght@600;700;800;900&display=swap');
        .font-rbx { font-family: 'Luckiest Guy', cursive; letter-spacing: .02em; }
        .rbx-body { font-family: 'Nunito', sans-serif; }
        .rbx-dots { background-image: radial-gradient(rgba(35,37,39,.07) 2px, transparent 2px); background-size: 24px 24px; }
      `}</style>

      {/* ─── COVER: LOBI GAME ─────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="cover"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#232527] px-6 text-center"
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {/* Blok melayang ala partikel */}
            {[
              { l: '8%', t: '16%', c: '#E2231A', s: 26, r: -14 },
              { l: '84%', t: '12%', c: '#00A2FF', s: 20, r: 18 },
              { l: '12%', t: '78%', c: '#F5CD30', s: 22, r: 10 },
              { l: '82%', t: '72%', c: '#00B06F', s: 28, r: -8 },
            ].map((b, i) => (
              <motion.span
                key={i}
                className="absolute rounded-[4px]"
                style={{ left: b.l, top: b.t, width: b.s, height: b.s, backgroundColor: b.c }}
                animate={{ y: [0, -16, 0], rotate: [b.r, b.r + 12, b.r] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}

            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
              className="flex items-center gap-3"
            >
              <RobloxLogo size={56} />
              <span className="font-rbx text-2xl text-white">
                BLOCK<span className="text-[#E2231A]">PARTY</span>
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.4em] text-white/50"
            >
              The Wedding Quest
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
              className="font-rbx mt-3 text-5xl leading-tight text-white sm:text-6xl"
            >
              {groom} <span className="text-[#F5CD30]">&amp;</span> {bride}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-3 text-sm font-bold text-white/60"
            >
              {formattedDate}
            </motion.p>

            {guestName && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, type: 'spring', stiffness: 220, damping: 18 }}
                className="mt-7 rounded-xl border-2 border-white/15 bg-white/10 px-6 py-2.5 backdrop-blur"
              >
                <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/50">Selamat datang, Player</p>
                <p className="font-rbx text-lg text-white">{guestName}</p>
              </motion.div>
            )}

            <motion.button
              onClick={() => open()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94, y: 4 }}
              className="font-rbx mt-8 flex items-center gap-3 rounded-2xl bg-[#E2231A] px-10 py-4 text-xl text-white shadow-[0_8px_0_#8F1410]"
            >
              <RobuxIcon size={26} color="#fff" /> TAP TO SPAWN
            </motion.button>
            <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/40">
              Ketuk untuk masuk lobby
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <main className="relative z-10 mx-auto max-w-lg px-5 pb-16 pt-14">
          {/* ─── MEMPELAI: PLAYER CARD ────────────────────────── */}
          <Reveal className="text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border-2 border-[#232527] bg-[#F5CD30] px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.25em] shadow-[3px_3px_0_0_#232527]">
              <RobuxIcon size={14} /> Party Members
            </div>
            <h2 className="font-rbx text-3xl">Duo Kami</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { name: groom, tag: '@player1', shirt: '#00A2FF', flip: false, photo: photos.groom, hasPhoto: hasGroomPhoto, level: 42 },
              { name: bride, tag: '@player2', shirt: '#E2231A', flip: true, photo: photos.bride, hasPhoto: hasBridePhoto, level: 41 },
            ].map((p, i) => (
              <Reveal key={p.tag} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -6, rotate: i === 0 ? -1.5 : 1.5 }}
                  className="rounded-2xl border-[3px] border-[#232527] bg-white p-4 text-center shadow-[5px_5px_0_0_#232527]"
                >
                  {/* Avatar player: foto asli dalam bingkai kartu Roblox,
                      fallback ke karakter blocky bila foto belum diisi */}
                  <div
                    className="relative mx-auto w-[104px] overflow-hidden rounded-xl border-[3px] border-[#232527]"
                    style={{ height: 132, background: p.shirt, boxShadow: '4px 4px 0 0 #232527' }}
                  >
                    {p.hasPhoto && p.photo ? (
                      <>
                        <img
                          src={p.photo}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover object-top"
                        />
                        {/* Overlay blok tipis ala UI Roblox agar foto tetap terasa "in-game" */}
                        <span
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-1"
                          style={{ backgroundColor: p.shirt }}
                        />
                      </>
                    ) : (
                      <div className="flex h-full items-start justify-center pt-1">
                        <NoobAvatar shirt={p.shirt} flip={p.flip} size={96} />
                      </div>
                    )}
                    {/* Badge level di pojok */}
                    <span className="font-rbx absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#232527] bg-[#F5CD30] text-sm text-[#232527] shadow-[2px_2px_0_0_#232527]">
                      {p.level}
                    </span>
                  </div>
                  <p className="font-rbx mt-3 truncate text-lg leading-snug">{p.name}</p>
                  <p className="text-[11px] font-extrabold text-[#232527]/50">{p.tag}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* ─── COUNTDOWN: SERVER TIME ───────────────────────── */}
          <Reveal className="mt-14">
            <div className="rounded-2xl border-[3px] border-[#232527] bg-[#232527] p-5 text-center shadow-[6px_6px_0_0_#E2231A]">
              <p className="font-rbx text-lg text-[#F5CD30]">Server Launch In…</p>
              <div className="mt-4 flex justify-center gap-2.5">
                {[
                  { v: timeLeft.days, l: 'Hari', c: '#E2231A' },
                  { v: timeLeft.hours, l: 'Jam', c: '#00A2FF' },
                  { v: timeLeft.minutes, l: 'Mnt', c: '#00B06F' },
                  { v: timeLeft.seconds, l: 'Dtk', c: '#F5CD30' },
                ].map(({ v, l, c }) => (
                  <div key={l} className="w-16 rounded-xl border-2 border-white/20 bg-white/10 py-2.5">
                    <span className="font-rbx block text-2xl text-white">{String(v).padStart(2, '0')}</span>
                    <span className="block text-[9px] font-extrabold uppercase tracking-widest" style={{ color: c }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ─── ACARA: GAME MODE ─────────────────────────────── */}
          <Reveal className="mt-14 text-center">
            <h2 className="font-rbx text-3xl">Game Mode</h2>
            <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.25em] text-[#232527]/40">Dua misi utama</p>
          </Reveal>
          <div className="mt-6 space-y-4">
            {[
              { title: 'Akad Nikah', date: akadDateText, time: schedule.akadTime, c: '#E2231A', icon: CalendarDays },
              { title: 'Resepsi', date: resepsiDateText, time: schedule.resepsiTime, c: '#00A2FF', icon: PartyPopper },
            ].map((ev, i) => (
              <Reveal key={ev.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="flex items-center gap-4 rounded-2xl border-[3px] border-[#232527] bg-white p-4 shadow-[5px_5px_0_0_#232527]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#232527] text-white" style={{ backgroundColor: ev.c }}>
                    <ev.icon size={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-rbx text-lg leading-tight">{ev.title}</p>
                    <p className="text-xs font-extrabold text-[#232527]/60">{ev.date}</p>
                    <p className="inline-flex items-center gap-1 text-xs font-extrabold" style={{ color: ev.c }}>
                      <Clock3 size={12} /> {ev.time} WIB
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* ─── LOKASI ───────────────────────────────────────── */}
          <Reveal className="mt-10">
            <div className="rounded-2xl border-[3px] border-[#232527] bg-white p-6 text-center shadow-[6px_6px_0_0_#00B06F]">
              <MapPin size={26} className="mx-auto text-[#00B06F]" />
              <h3 className="font-rbx mt-2 text-xl">{venue.name}</h3>
              <p className="mt-1 text-xs font-bold text-[#232527]/60">{venue.address}</p>
              <motion.a
                href={venue.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.94 }}
                className="font-rbx mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00B06F] px-6 py-2.5 text-sm text-white shadow-[0_5px_0_#007A4D]"
              >
                <Navigation size={15} /> BUKA PETA
              </motion.a>
            </div>
          </Reveal>

{/* ─── GALERI: SCREENSHOT LOOT ─────────────────────────── */}
          <Reveal className="mt-14 text-center">
            <h2 className="font-rbx text-3xl">Gallery Loot</h2>
            <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.25em] text-[#232527]/40">
              Tangkapan layar misi kami
            </p>
          </Reveal>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {gallery.slice(0, 8).map((url, i) => (
              <Reveal key={url} delay={i * 0.05}>
                <motion.div
                  whileHover={{ scale: 1.04, rotate: i % 2 ? 1.5 : -1.5 }}
                  className="rounded-xl border-[3px] border-[#232527] bg-white p-2 shadow-[4px_4px_0_0_#232527]"
                >
                  <img src={url} alt={`Kenangan ${i + 1}`} loading="lazy" className="aspect-[4/5] w-full rounded-lg object-cover" />
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* ─── KUTIPAN: CHAT BUBBLE ─────────────────────────────── */}
          <Reveal className="mt-14">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative mx-auto max-w-sm rounded-2xl rounded-bl-sm border-[3px] border-[#232527] bg-white p-5 shadow-[6px_6px_0_0_#00A2FF]"
            >
              <MessageCircle size={18} className="absolute -left-2 -top-3 rounded-full bg-[#F2F4F8] text-[#E2231A]" />
              <p className="text-sm font-extrabold leading-relaxed text-[#232527]">"{quote}"</p>
              <p className="font-rbx mt-3 text-right text-sm text-[#00A2FF]">{quoteSrc}</p>
            </motion.div>
          </Reveal>

          {/* ─── HADIAH: ITEM DROP ────────────────────────────────── */}
          <Reveal className="mt-14 text-center">
            <h2 className="font-rbx text-3xl">Item Drop 🎁</h2>
            <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.25em] text-[#232527]/40">
              Kado &amp; tanda kasih untuk pengantin
            </p>
          </Reveal>
          <div className="mt-6 space-y-3">
            {banks.length === 0 ? (
              <Reveal>
                <p className="text-center text-sm font-extrabold text-[#232527]/50">Drop kado menyusul ya~</p>
              </Reveal>
            ) : (
              banks.map((bank, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between gap-3 rounded-2xl border-[3px] border-[#232527] bg-white p-3 shadow-[4px_4px_0_0_#232527]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#232527] bg-[#F5CD30]">
                        <Gift size={18} className="text-[#232527]" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#E2231A]">{bank.bank}</p>
                        <p className="break-all text-xs font-bold text-[#232527]/70">{bank.number}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => handleCopyRekening(e, bank.number, bank.bank, i)}
                      className="rounded-lg border-2 border-[#232527] bg-[#00A2FF] p-2 text-white shadow-[3px_3px_0_0_#232527]"
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
            <h2 className="font-rbx text-3xl">Join The Party</h2>
            <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.25em] text-[#232527]/40">
              Konfirmasi kehadiran &amp; kirim ucapan
            </p>
          </Reveal>

          <Reveal className="mt-6">
            <div className="rounded-2xl border-[3px] border-[#232527] bg-white p-5 shadow-[6px_6px_0_0_#00A2FF]">
              {rsvpSuccess ? (
                <div className="py-8 text-center">
                  <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#00B06F] text-white shadow-[4px_4px_0_0_#232527]">
                    <CheckCircle2 size={26} />
                  </span>
                  <p className="font-rbx text-2xl text-[#232527]">Quest Complete!</p>
                  <p className="mt-2 text-xs font-bold text-[#232527]/60">
                    Kehadiran dan ucapan kamu sudah terkirim. Sampai jumpa di pesta!
                  </p>
                  <button
                    onClick={() => setRsvpSuccess(false)}
                    className="mt-4 text-xs font-extrabold text-[#00A2FF] underline underline-offset-4"
                  >
                    Ubah jawaban
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendRsvp} className="space-y-4 text-left">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#232527]/50">
                      Username kamu
                    </label>
                    <input
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="Nama lengkap"
                      className="w-full rounded-xl border-[3px] border-[#232527] bg-[#F2F4F8] px-3.5 py-2.5 text-sm font-extrabold outline-none focus:border-[#E2231A]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#232527]/50">
                        Status
                      </label>
                      <select
                        value={rsvpStatus}
                        onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                        className="w-full rounded-xl border-[3px] border-[#232527] bg-[#F2F4F8] px-3.5 py-2.5 text-sm font-extrabold outline-none focus:border-[#E2231A]"
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
                          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#232527]/50">
                            Jumlah
                          </label>
                          <select
                            value={rsvpPax}
                            onChange={(e) => setRsvpPax(Number(e.target.value))}
                            className="w-full rounded-xl border-[3px] border-[#232527] bg-[#F2F4F8] px-3.5 py-2.5 text-sm font-extrabold outline-none focus:border-[#E2231A]"
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
                    <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#232527]/50">
                      Pesan singkat
                    </label>
                    <textarea
                      required
                      maxLength={160}
                      value={rsvpMessage}
                      onChange={(e) => setRsvpMessage(e.target.value)}
                      placeholder="Tulis doa &amp; ucapan buat kami..."
                      className="h-20 w-full resize-none rounded-xl border-[3px] border-[#232527] bg-[#F2F4F8] px-3.5 py-2.5 text-sm font-extrabold outline-none focus:border-[#E2231A]"
                    />
                    <div className="mt-1 text-right text-[10px] font-bold text-[#232527]/40">{rsvpMessage.length}/160</div>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isSubmittingRsvp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="font-rbx w-full rounded-2xl bg-[#E2231A] py-3.5 text-xl text-white shadow-[0_6px_0_#8F1410] disabled:opacity-60"
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

{/* ─── UCAPAN DARI PLAYER LAIN ──────────────────────────── */}
          <div className="mt-8 space-y-3">
            {wishesList.length === 0 ? (
              <Reveal>
                <p className="text-center text-xs font-bold text-[#232527]/40">
                  Belum ada ucapan — jadilah player pertama yang ngasih pesan!
                </p>
              </Reveal>
            ) : (
              wishesList.slice(0, 12).map((w) => (
                <Reveal key={w.id} className="text-left">
                  <div className="rounded-xl border-[3px] border-[#232527] bg-white p-3 shadow-[4px_4px_0_0_#232527]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-extrabold">{w.guest_name}</p>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider"
                        style={{
                          backgroundColor:
                            w.status === 'hadir' ? '#00B06F' : w.status === 'ragu' ? '#F5CD30' : '#E2231A',
                          color: w.status === 'ragu' ? '#232527' : '#fff',
                        }}
                      >
                        {w.status === 'hadir' ? 'Hadir' : w.status === 'ragu' ? 'Ragu' : 'Tidak Hadir'}
                      </span>
                    </div>
                    {w.message && <p className="mt-1.5 text-sm leading-relaxed text-[#232527]/75">{w.message}</p>}
                  </div>
                </Reveal>
              ))
            )}
          </div>

{/* ─── PENUTUP: QUEST COMPLETED ─────────────────────────── */}
          <Reveal className="mt-16 text-center">
            <div className="rounded-2xl border-[3px] border-[#232527] bg-[#232527] p-6 shadow-[6px_6px_0_0_#F5CD30]">
              <p className="font-rbx text-3xl text-[#F5CD30]">Quest Completed!</p>
              <p className="mt-3 text-sm font-bold text-white/70">
                Merupakan suatu kehormatan jika Bapak/Ibu/Saudara/i berkenan hadir
                merayakan kebahagiaan kami.
              </p>
              <h4 className="font-rbx mt-5 text-3xl text-white">
                {groom} <span className="text-[#E2231A]">&amp;</span> {bride}
              </h4>
              <p className="mt-1 text-xs font-extrabold text-white/50">Beserta keluarga besar</p>
            </div>
            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#232527]/40">
              Block Party Theme • LoVerse Digital Invitation
            </p>
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
          className="fixed bottom-16 right-3 z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-[#E2231A] text-white shadow-[0_4px_0_#8F1410]"
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
