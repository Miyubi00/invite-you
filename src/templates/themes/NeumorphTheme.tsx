// ============================================================
// src/templates/themes/NeumorphTheme.tsx
// ------------------------------------------------------------
// Tema Undangan: Neumorph Soft UI (Kategori: RSVP)
//
// Konsep desain: NEUMORPHISM (Soft UI) — seluruh antarmuka seolah
// dicetak dari satu lempengan plastik lembut berwarna lavender-abu.
// Ciri khasnya:
//   • Bayangan ganda: terang kiri-atas (#FFFFFF) + gelap kanan-bawah.
//   • Dua state permukaan: RAISED (menonjol) dan INSET/PRESSED (cekung).
//   • Hampir tanpa garis tepi & warna keras — hierarki dibentuk
//     murni oleh cahaya dan bayangan.
//   • Aksen tunggal violet (#7C6FF0) + rose lembut sebagai kontras.
// Interaksi khas: tombol "benar-benar tertekan" saat diklik
// (raised → inset dengan translate + bayangan menghilang), foto
// duduk di "lubang" cekung, angka countdown di sumur cekung, dan
// kartu acara yang mengembang saat disentuh.
// Dipakai di   : templates/Registry.ts (slug 'neumorph')
// Keterikatan  : types/template, hooks/useCountdown,
//                utils/templateHelpers, shared/useOpenInvitation,
//                hooks/useCopyToClipboard, components/GlobalToast,
//                i18n, framer-motion.
// ============================================================

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Calendar, Clock, Heart,
    Gift, Play, Pause, Navigation, Copy, Image as ImageIcon,
    Quote, Send, CheckCircle2, Sparkles, Music
} from 'lucide-react';

import type { RsvpStatus, TemplateProps } from '../../types/template';
import { useCountdown } from '../../hooks/useCountdown';
import { formatDate, resolveBanks, resolveGallery, resolvePhotos, resolveVenue, resolveSchedule } from '../../utils/templateHelpers';
import { useOpenInvitation } from '../shared/useOpenInvitation';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useToast } from '../../components/GlobalToast';
import { useTranslation } from '../../i18n';

export default function NeumorphTheme({ groom, bride, date, data, onRsvpSubmit, submittedData }: TemplateProps) {
    const copyRek = useCopyToClipboard();
    const toast = useToast();
    const { t } = useTranslation();

    // RSVP State
    const [rsvpStatus, setRsvpStatus] = useState<'hadir' | 'tidak_hadir' | 'ragu'>('hadir');
    const [rsvpPax, setRsvpPax] = useState<number>(1);
    const [rsvpMessage, setRsvpMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Lightbox galeri
    const [lightbox, setLightbox] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Data
    const photos = {
        ...resolvePhotos(data),
        gallery: resolveGallery(data)
    };

    const formattedDate = formatDate(date, 'id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const schedule = resolveSchedule(data, date);
    const formattedAkadDate = schedule.akadDate ? formatDate(schedule.akadDate, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : formattedDate;
    const formattedResepsiDate = schedule.resepsiDate ? formatDate(schedule.resepsiDate, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : formattedDate;

    const quote = data?.quote || "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri...";
    const quoteSrc = data?.quote_src || "QS. Ar-Rum: 21";
    const audioUrl = data?.audio_url || "https://r2.loverse.my.id/defaults/audio/ee2e74c72c.mp3";

    // Pola bersama (dedup 3.2): amplop + autoplay audio dalam satu hook.
    const { isOpen, open: openInvitation, playing: isPlaying, toggle: toggleAudio } =
        useOpenInvitation(audioRef, 800);

    const handleRsvpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!onRsvpSubmit) {
            toast.warning(t('toast.demoRsvpWarning'));
            return;
        }
        setIsSending(true);
        await onRsvpSubmit({ status: rsvpStatus, pax: Number(rsvpPax), message: rsvpMessage });
        setIsSending(false);
    };

    const timeLeft = useCountdown(date);

    // Gerbang entrada section: melembut naik dari bawah (khas Soft UI,
    // tanpa rotasi/overshoot — semua gerakan halus dan "berat").
    const rise = (delay = 0) => ({
        initial: { opacity: 0, y: 44 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: { duration: 0.7, ease: 'easeOut' as const, delay },
    });

    return (
        <div className="min-h-screen w-full bg-nm-base font-sans text-nm-ink antialiased selection:bg-nm-accent/20">

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
        .font-soft { font-family: 'Poppins', sans-serif; }

        /* ── NEUMORPHIC PRIMITIVES ─────────────────────────────── */
        .neu-raised {
            background: linear-gradient(145deg, #F1F2FA, #D8DAEC);
            border-radius: 28px;
            box-shadow: 9px 9px 20px var(--color-nm-shadow),
                       -9px -9px 20px var(--color-nm-light);
        }
        .neu-inset {
            background: linear-gradient(145deg, #D8DAEC, #F1F2FA);
            border-radius: 28px;
            box-shadow: inset 6px 6px 14px var(--color-nm-shadow),
                        inset -6px -6px 14px var(--color-nm-light);
        }
        .neu-well {
            background: linear-gradient(145deg, #D3D5E9, #F3F4FB);
            border-radius: 9999px;
            box-shadow: inset 5px 5px 12px var(--color-nm-shadow),
                        inset -5px -5px 12px var(--color-nm-light);
        }
        .neu-flat {
            background: var(--color-nm-base);
            border-radius: 28px;
            box-shadow: 6px 6px 14px var(--color-nm-shadow),
                       -6px -6px 14px var(--color-nm-light);
        }
        .neu-input {
            background: linear-gradient(145deg, #D8DAEC, #F1F2FA);
            border-radius: 18px;
            box-shadow: inset 4px 4px 10px var(--color-nm-shadow),
                        inset -4px -4px 10px var(--color-nm-light);
            outline: none;
            transition: box-shadow .25s ease;
        }
        .neu-input:focus {
            box-shadow: inset 5px 5px 12px var(--color-nm-shadow),
                        inset -5px -5px 12px var(--color-nm-light),
                        0 0 0 3px rgba(124, 111, 240, 0.25);
        }
      `}</style>

            {/* ——— COVER: PANEL SOFT-UI OPAQUE ——— */}
            <motion.div
                initial={false}
                animate={isOpen ? { y: '-100%' } : { y: 0 }}
                transition={{ duration: 0.95, ease: [0.65, 0, 0.35, 1] }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-nm-base px-6"
            >
                {/* Lingkaran soft-shadow melayang sebagai ornamen */}
                {[
                    { top: '10%', left: '8%', size: 110, delay: 0 },
                    { top: '16%', right: '10%', size: 70, delay: 0.6 },
                    { bottom: '14%', left: '14%', size: 64, delay: 1.1 },
                    { bottom: '9%', right: '9%', size: 96, delay: 0.3 },
                ].map((orb, i) => (
                    <motion.div
                        key={i}
                        className="neu-flat absolute rounded-full"
                        style={{ top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom, width: orb.size, height: orb.size }}
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
                    />
                ))}

                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 36 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    className="neu-raised relative z-10 w-full max-w-md p-10 text-center"
                >
                    {/* Segel bulat inset dengan ikon kilau */}
                    <div className="neu-well mx-auto mb-7 flex h-24 w-24 items-center justify-center">
                        <motion.span
                            animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.08, 1] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Sparkles size={38} className="text-nm-accent" />
                        </motion.span>
                    </div>

                    <p className="font-soft text-[11px] font-semibold uppercase tracking-[0.35em] text-nm-accent">The Wedding Of</p>
                    <h1 className="font-soft mt-4 text-4xl font-bold leading-snug text-nm-ink">
                        {groom}
                        <span className="mx-3 inline-block text-nm-accent2">{'&'}</span>
                        {bride}
                    </h1>

                    {/* Panel tanggal cekung */}
                    <div className="neu-inset mt-6 px-5 py-3">
                        <p className="font-soft text-sm font-semibold text-nm-ink/70">{formattedDate}</p>
                    </div>

                    {/* Tombol utama: benar-benar "tertekan" saat diklik */}
                    <motion.button
                        onClick={openInvitation}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95, boxShadow: 'inset 5px 5px 12px rgba(60,50,140,0.45), inset -5px -5px 12px rgba(190,200,255,0.5)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        className="font-soft mt-8 rounded-full bg-nm-accent px-10 py-4 text-sm font-bold uppercase tracking-widest text-white"
                        style={{ boxShadow: '7px 7px 16px var(--color-nm-shadow), -7px -7px 16px rgba(255,255,255,0.9)' }}
                    >
                        Buka Undangan
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* ——— MAIN CONTENT (muncul setelah amplop terbuka) ——— */}
            {isOpen && (
                <main className="font-soft mx-auto max-w-2xl px-5 pb-28 pt-8">

                    {/* FAB musik mengambang — raised, pulse saat menyala */}
                    <motion.button
                        onClick={toggleAudio}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 18 }}
                        className="neu-raised fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full"
                        whileTap={{ scale: 0.88 }}
                        aria-label={isPlaying ? 'Matikan musik' : 'Nyalakan musik'}
                    >
                        {isPlaying ? (
                            <motion.span animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
                                <Pause size={20} className="text-nm-accent" />
                            </motion.span>
                        ) : (
                            <Play size={20} className="text-nm-accent" />
                        )}
                    </motion.button>

                    {/* ─── SECTION MEMPELAI: foto duduk di "lubang" cekung ─── */}
                    <motion.section {...rise(0)} className="neu-raised mb-10 p-8">
                        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-nm-accent">We Found Love</p>
                        <h2 className="mt-2 text-center text-2xl font-bold">{groom} {'&'} {bride}</h2>

                        <div className="mt-8 flex flex-col items-center justify-center gap-8 sm:flex-row">
                            {[{ name: groom, photo: photos.groom, parents: data?.groom_parents, label: 'Putra dari' },
                              { name: bride, photo: photos.bride, parents: data?.bride_parents, label: 'Putri dari' }].map((p, i) => (
                                <div key={i} className="flex flex-col items-center text-center">
                                    {/* Sumur cekung: foto di dalamnya sedikit "tenggelam" */}
                                    <motion.div
                                        whileHover={{ scale: 1.04 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                        className="neu-well p-3"
                                        style={{ borderRadius: '9999px' }}
                                    >
                                        <img
                                            src={p.photo}
                                            alt={p.name}
                                            className="h-32 w-32 rounded-full object-cover"
                                            style={{ boxShadow: '0 4px 10px rgba(74,69,104,0.25)' }}
                                        />
                                    </motion.div>
                                    <h3 className="mt-4 text-lg font-bold">{p.name}</h3>
                                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-nm-ink/45">{p.label}</p>
                                    <div className="neu-inset mt-2 px-4 py-1.5">
                                        <p className="text-xs font-medium text-nm-ink/75">{p.parents}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Hati kecil berdenyut di antara keduanya */}
                        <div className="mt-8 flex justify-center">
                            <motion.span
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <Heart size={22} className="text-nm-accent2" fill="var(--color-nm-accent2)" />
                            </motion.span>
                        </div>
                    </motion.section>

                    {/* ─── SECTION KUTIPAN: panel cekung penuh ─── */}
                    <motion.section {...rise(0.05)} className="neu-inset mb-10 px-8 py-9">
                        <Quote size={26} className="mx-auto mb-4 text-nm-accent" />
                        <p className="text-center text-sm font-medium italic leading-relaxed text-nm-ink/80">"{quote}"</p>
                        <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-nm-accent">— {quoteSrc}</p>
                    </motion.section>

                    {/* ─── SECTION ACARA: dua panel raised dengan chip cekung ─── */}
                    <motion.section {...rise(0)} className="mb-10">
                        <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-nm-accent">Save The Date</p>

                        <div className="grid gap-6 sm:grid-cols-2">
                            {[{ title: 'Akad Nikah', icon: Calendar, dateStr: formattedAkadDate, time: schedule.akadTime, accent: 'var(--color-nm-accent)' },
                              { title: 'Resepsi', icon: Sparkles, dateStr: formattedResepsiDate, time: schedule.resepsiTime, accent: 'var(--color-nm-accent2)' }].map((ev, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -6 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                    className="neu-raised flex flex-col items-center p-7 text-center"
                                >
                                    <div className="neu-well mb-4 flex h-14 w-14 items-center justify-center">
                                        <ev.icon size={24} style={{ color: ev.accent }} />
                                    </div>
                                    <h3 className="text-base font-bold">{ev.title}</h3>
                                    <div className="neu-inset mt-4 w-full px-3 py-2.5">
                                        <p className="text-xs font-semibold leading-relaxed text-nm-ink/75">{ev.dateStr}</p>
                                    </div>
                                    <div className="neu-inset mt-3 w-full px-3 py-2">
                                        <p className="flex items-center justify-center gap-1.5 text-sm font-bold" style={{ color: ev.accent }}>
                                            <Clock size={13} /> {ev.time}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Tombol lokasi */}
                        <motion.a
                            href={resolveVenue(data).mapsLink}
                            target="_blank"
                            rel="noreferrer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            className="neu-flat mt-6 flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-nm-accent"
                        >
                            <MapPin size={16} /> Lihat Lokasi di Google Maps
                        </motion.a>
                    </motion.section>

                    {/* ─── SECTION COUNTDOWN: angka di sumur cekung ─── */}
                    <motion.section {...rise(0.05)} className="neu-raised mb-10 p-8 text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-nm-accent">Counting Down</p>
                        <div className="mt-6 grid grid-cols-4 gap-3">
                            {[{ v: timeLeft.days, l: 'Hari' }, { v: timeLeft.hours, l: 'Jam' }, { v: timeLeft.minutes, l: 'Mnt' }, { v: timeLeft.seconds, l: 'Dtk' }].map((t2, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="neu-inset flex h-16 w-full items-center justify-center">
                                        <motion.span
                                            key={t2.v}
                                            initial={{ y: -10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ duration: 0.35, ease: 'easeOut' }}
                                            className="text-xl font-bold text-nm-ink"
                                        >
                                            {String(t2.v).padStart(2, '0')}
                                        </motion.span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-nm-ink/45">{t2.l}</span>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* ─── SECTION GALERI: foto di lubang cekung + lightbox ─── */}
                    <motion.section {...rise(0)} className="mb-10">
                        <p className="mb-6 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-nm-accent">
                            <ImageIcon size={14} /> Our Gallery
                        </p>
                        <div className="grid grid-cols-2 gap-5">
                            {photos.gallery.slice(0, 4).map((url, i) => (
                                <motion.button
                                    key={i}
                                    layoutId={`nm-photo-${i}`}
                                    onClick={() => setLightbox(url)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="neu-inset cursor-zoom-in p-2.5"
                                >
                                    <img src={url} alt={`Galeri ${i + 1}`} className="aspect-[4/5] w-full rounded-2xl object-cover" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.section>

                    {/* ─── SECTION KADO: tombol salin timbul ─── */}
                    <motion.section {...rise(0)} className="mb-10">
                        <p className="mb-6 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-nm-accent">
                            <Gift size={14} /> Wedding Gift
                        </p>
                        <div className="space-y-4">
                            {resolveBanks(data).map((bank, i) => (
                                <div key={i} className="neu-raised flex items-center justify-between px-6 py-4 text-left">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-nm-accent">{bank.bank}</p>
                                        <p className="mt-1 font-mono text-lg font-semibold tracking-wider text-nm-ink">{bank.number}</p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => void copyRek(bank.number)}
                                        className="neu-btn flex h-12 w-12 items-center justify-center text-nm-accent"
                                        aria-label={`Salin nomor ${bank.bank}`}
                                    >
                                        <Copy size={18} />
                                    </motion.button>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* ─── SECTION RSVP: input cekung khas Soft UI ─── */}
                    <motion.section {...rise(0)} className="mb-10">
                        <p className="mb-6 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-nm-accent">
                            <Send size={14} /> RSVP
                        </p>
                        {submittedData ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="neu-raised p-8 text-center"
                            >
                                <div className="neu-inset mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                                    <CheckCircle2 size={32} className="text-nm-accent" />
                                </div>
                                <p className="font-bold text-nm-ink">Terima kasih!</p>
                                <p className="mt-1 text-xs text-nm-ink/50">Konfirmasi kehadiranmu sudah kami terima.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleRsvpSubmit} className="neu-raised space-y-5 p-6 text-left">
                                <div>
                                    <label className="mb-2 ml-2 block text-[10px] font-bold uppercase tracking-widest text-nm-ink/45">Status Kehadiran</label>
                                    <select
                                        value={rsvpStatus}
                                        onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                                        className="neu-inset w-full appearance-none px-5 py-3.5 text-sm font-semibold text-nm-ink focus:outline-none focus:ring-2 focus:ring-nm-accent/40"
                                    >
                                        <option value="hadir">Hadir</option>
                                        <option value="tidak_hadir">Maaf, tidak bisa</option>
                                        <option value="ragu">Masih ragu</option>
                                    </select>
                                </div>

                                {rsvpStatus === 'hadir' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.4, ease: 'easeOut' }}
                                        className="overflow-hidden"
                                    >
                                        <label className="mb-2 ml-2 block text-[10px] font-bold uppercase tracking-widest text-nm-ink/45">Jumlah Tamu</label>
                                        <select
                                            value={rsvpPax}
                                            onChange={(e) => setRsvpPax(Number(e.target.value))}
                                            className="neu-inset w-full appearance-none px-5 py-3.5 text-sm font-semibold text-nm-ink focus:outline-none focus:ring-2 focus:ring-nm-accent/40"
                                        >
                                            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} orang</option>)}
                                        </select>
                                    </motion.div>
                                )}

                                <div>
                                    <label className="mb-2 ml-2 block text-[10px] font-bold uppercase tracking-widest text-nm-ink/45">Pesan &amp; Doa</label>
                                    <textarea
                                        required
                                        maxLength={100}
                                        value={rsvpMessage}
                                        onChange={(e) => setRsvpMessage(e.target.value)}
                                        placeholder="Tulis ucapan selamat..."
                                        className="neu-inset h-24 w-full resize-none px-5 py-3.5 text-sm text-nm-ink placeholder:text-nm-ink/30 focus:outline-none focus:ring-2 focus:ring-nm-accent/40"
                                    />
                                    <div className="mt-1 text-right text-[10px] text-nm-ink/40">{rsvpMessage.length}/100</div>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isSending}
                                    whileTap={{ scale: 0.96 }}
                                    className="neu-btn w-full py-4 text-sm font-bold uppercase tracking-widest text-nm-accent disabled:opacity-50"
                                >
                                    {isSending ? 'Mengirim...' : 'Kirim Ucapan'}
                                </motion.button>
                            </form>
                        )}
                    </motion.section>

                    {/* ─── KUTIPAN PENUTUP ─── */}
                    <motion.section {...rise(0)} className="mb-16 text-center">
                        <div className="neu-inset relative p-8">
                            <Quote size={26} className="mx-auto mb-4 text-nm-accent" />
                            <p className="text-sm italic leading-relaxed text-nm-ink/70">"{quote}"</p>
                            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-nm-ink/40">— {quoteSrc}</p>
                        </div>
                    </motion.section>

                    {/* ─── FOOTER ─── */}
                    <motion.footer {...rise(0)} className="pb-14 text-center">
                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full neu-raised">
                            <motion.span
                                animate={{ scale: [1, 1.18, 1] }}
                                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <Heart size={30} className="text-nm-accent" fill="var(--color-nm-accent)" />
                            </motion.span>
                        </div>
                        <p className="font-soft text-sm font-semibold text-nm-ink/70">{groom} &amp; {bride}</p>
                        <p className="mt-1 text-[11px] text-nm-ink/40">{formattedDate}</p>
                    </motion.footer>
                </main>
            )}

            {/* ─── LIGHTBOX: foto membesar dari lubang galeri ─── */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightbox(null)}
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-nm-deep/70 p-8 backdrop-blur-sm"
                    >
                        <motion.div
                            layoutId="nm-lightbox-frame"
                            className="neu-raised max-h-full overflow-hidden p-3"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img src={lightbox} alt="Galeri" className="max-h-[75vh] rounded-2xl object-contain" />
                        </motion.div>
                        <motion.button
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                            exit={{ opacity: 0 }}
                            onClick={() => setLightbox(null)}
                            className="neu-btn absolute bottom-10 px-8 py-3 text-xs font-bold uppercase tracking-widest text-nm-ink/70"
                        >
                            Tutup
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── AUDIO LATAR — selalu ter-mount agar audioRef valid ───
                Elemen ini TIDAK boleh kondisional (mis. {isPlaying && ...}):
                useOpenInvitation memutar musik via audioRef setelah amplop
                terbuka. Kalau elemennya baru muncul saat isPlaying=true,
                ref masih null saat play() dipanggil → musik tak pernah bunyi. */}
            <audio ref={audioRef} src={audioUrl} loop preload="auto" />
        </div>
    );
}
