// ============================================================
// src/templates/themes/ClaymorphismTheme.tsx
// ------------------------------------------------------------
// Tema Undangan: Clay Puffy (Kategori: RSVP)
//
// Konsep desain: CLAYMORPHISM — semua permukaan terlihat seperti
// tanam liur/liat (clay) 3D yang lembut:
//   • Kartu "puffy" dengan clay shadow khas: bayangan luar besar
//     di kanan-bawah + kilau terang kiri-atas + inset gelap bawah.
//   • Tombol squash & stretch seperti mainan plastisin saat ditekan.
//   • Blob-blob clay warna candy melayang sebagai dekorasi latar.
//   • Lingkaran/oval domes ala figurine clay untuk foto & ikon.
// Palet (token --color-cl-*): lilac #EDE7FF, ungu tua #4A3F71,
//   bayangan #C3B6F2, periwinkle #8A6CFF, pink candy #FF8FA3,
//   kuning mentega #FFC94D, mint #A8E6CF, biru langit #9BD7FF.
// Dipakai di   : templates/Registry.ts (slug 'claymorphism')
// Keterikatan  : types/template, hooks/useCountdown,
//                utils/templateHelpers, shared/useOpenInvitation,
//                hooks/useCopyToClipboard, components/GlobalToast,
//                i18n, framer-motion.
// Catatan      : elemen <audio> dirender TANPA syarat di level root
//                (pelajaran dari revisi Neumorph) agar autoplay
//                tidak pernah gagal karena ref null.
// ============================================================

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Calendar, Clock, Heart, Gift, Copy, Check, CheckCircle2,
    Image as ImageIcon, Send, Play, Pause, Sparkles
} from 'lucide-react';

import type { RsvpStatus, TemplateProps } from '../../types/template';
import { useCountdown } from '../../hooks/useCountdown';
import { formatDate, resolveBanks, resolveGallery, resolvePhotos, resolveVenue, resolveSchedule } from '../../utils/templateHelpers';
import { useOpenInvitation } from '../shared/useOpenInvitation';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useToast } from '../../components/GlobalToast';
import { useTranslation } from '../../i18n';

// Tombol clay: squash saat ditekan (keyframe tekan-plastisin).
const clayTap = { scale: [1, 1.12, 0.86, 1], transition: { duration: 0.45 } };
const clayHover = { scale: 1.05, y: -3 };

// Kartu clay puffy: masuk dengan spring, terangkat pelan saat hover.
function ClayCard({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 150, damping: 16, delay }}
            whileHover={{ y: -4 }}
            className={`clay-card ${className}`}
        >
            {children}
        </motion.div>
    );
}

export default function ClaymorphismTheme({ groom, bride, date, guestName, data, onRsvpSubmit, submittedData }: TemplateProps) {
    // --- STATE ---
    const copyRek = useCopyToClipboard();
    const toast = useToast();
    const { t } = useTranslation();

    const [lightbox, setLightbox] = useState<string | null>(null);
    const [copiedBank, setCopiedBank] = useState<string | null>(null);
    const [giftTab, setGiftTab] = useState<'transfer' | 'alamat'>('transfer');

    // RSVP State
    const [rsvpStatus, setRsvpStatus] = useState<'hadir' | 'tidak_hadir' | 'ragu'>('hadir');
    const [rsvpPax, setRsvpPax] = useState<number>(1);
    const [rsvpMessage, setRsvpMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

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

    // --- OPENING LOGIC ---
    // Pola bersama (dedup 3.2): amplop + autoplay audio dalam satu hook.
    const { isOpen, open: openInvitation, playing: isPlaying, toggle: toggleAudio } =
        useOpenInvitation(audioRef, 800);

    const handleOpen = () => openInvitation();

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

    // Blob clay dekoratif — deterministik.
    const blobs = [
        { size: 220, top: '6%', left: '-70px', color: 'var(--color-cl-berry)', delay: 0 },
        { size: 160, top: '18%', right: '-50px', color: 'var(--color-cl-sky)', delay: 0.8 },
        { size: 130, top: '55%', left: '-40px', color: 'var(--color-cl-sun)', delay: 1.5 },
        { size: 190, top: '72%', right: '-60px', color: 'var(--color-cl-mint)', delay: 2.1 },
    ];

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-cl-bg font-sans text-cl-ink relative select-none">

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Nunito:wght@400;700&display=swap');
        .font-clay { font-family: 'Baloo 2', cursive; }
        .font-body { font-family: 'Nunito', sans-serif; }

        /* Kartu clay puffy: kilau atas + inset gelap bawah + bayangan besar */
        .clay-card {
            background: linear-gradient(145deg, #F6F1FF 0%, #E9E1FF 100%);
            border-radius: 40px;
            padding: 28px;
            box-shadow:
                16px 20px 40px var(--color-cl-shadow),
                -10px -10px 24px #FFFFFF,
                inset -6px -8px 16px rgba(195, 182, 242, 0.45),
                inset 6px 8px 14px rgba(255, 255, 255, 0.95);
        }
        /* Cekungan (pressed-in) untuk form & kolom */
        .clay-well {
            background: linear-gradient(145deg, #E7DDFF 0%, #EFE8FF 100%);
            border-radius: 22px;
            box-shadow:
                inset 6px 8px 14px rgba(195, 182, 242, 0.6),
                inset -5px -6px 12px rgba(255, 255, 255, 0.9);
        }
        /* Tombol clay menonjol; :active "tengelam" */
        .clay-btn {
            background: linear-gradient(145deg, #9D82FF, #7C5CF5);
            border-radius: 9999px;
            color: #fff;
            box-shadow:
                8px 10px 22px rgba(138, 108, 255, 0.45),
                -4px -4px 10px #FFFFFF,
                inset -3px -5px 8px rgba(60, 35, 160, 0.4),
                inset 3px 4px 8px rgba(255, 255, 255, 0.5);
        }
        .clay-btn:active {
            box-shadow:
                inset 5px 6px 12px rgba(60, 35, 160, 0.5),
                inset -3px -4px 8px rgba(255, 255, 255, 0.35);
        }
        /* Dome figurine clay (lingkaran foto) */
        .clay-dome {
            border-radius: 9999px;
            box-shadow:
                10px 12px 26px var(--color-cl-shadow),
                -6px -6px 14px #FFFFFF,
                inset -5px -7px 12px rgba(195, 182, 242, 0.5),
                inset 5px 6px 10px rgba(255, 255, 255, 0.9);
        }
        .chat-scroll::-webkit-scrollbar { width: 5px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #C3B6F2; border-radius: 10px; }
      `}</style>

            {/* Blob clay mengambang di latar */}
            {blobs.map((b, i) => (
                <motion.span
                    key={i}
                    className="pointer-events-none absolute rounded-full opacity-70"
                    style={{
                        width: b.size, height: b.size, top: b.top, left: b.left, right: b.right,
                        background: b.color,
                        boxShadow: 'inset -10px -12px 24px rgba(0,0,0,0.08), inset 10px 12px 24px rgba(255,255,255,0.75), 12px 16px 30px var(--color-cl-shadow)',
                    }}
                    animate={{ y: [0, -22, 0], scale: [1, 1.06, 1] }}
                    transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
                />
            ))}

            {/* --- AMPLOP PEMBUKA (clay) --- */}
            <motion.div
                initial={false}
                animate={isOpen ? { y: '-110%' } : { y: 0 }}
                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-cl-bg px-6"
            >
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.1 }}
                    className="clay-card relative w-full max-w-md text-center"
                >
                    {/* Bola clay kecil berputar pelan di atas kartu */}
                    <motion.div
                        className="clay-dome mx-auto -mt-16 flex h-24 w-24 items-center justify-center bg-gradient-to-br from-cl-berry to-[#FFB3C0]"
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Heart size={40} className="text-white" fill="white" />
                    </motion.div>

                    <p className="font-clay mt-5 text-xs font-bold uppercase tracking-[0.3em] text-cl-accent">The Wedding Of</p>
                    <h1 className="font-clay mt-2 text-4xl font-extrabold leading-tight text-cl-ink">
                        {groom} <span className="text-cl-berry">&amp;</span> {bride}
                    </h1>
                    <p className="font-body mt-3 text-sm font-bold text-cl-ink/60">
                        Kepada <span className="text-cl-accent">{guestName || 'Tamu Istimewa'}</span>,<br />
                        silakan buka undangan clay kami 💜
                    </p>
                    <p className="font-clay mt-1 text-xs font-bold text-cl-ink/40">{formattedDate}</p>

                    <motion.button
                        onClick={handleOpen}
                        whileHover={clayHover}
                        whileTap={clayTap}
                        className="clay-btn font-clay mt-6 inline-flex items-center gap-2 px-10 py-3.5 text-lg font-extrabold"
                    >
                        <Sparkles size={18} /> Buka Undangan
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* --- KONTEN UTAMA --- */}
            <AnimatePresence>
                {isOpen && (
                    <motion.main
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="relative z-10 mx-auto max-w-2xl space-y-14 px-5 pb-32 pt-14"
                    >
                        {/* FAB musik clay mengambang — pulse saat menyala, squash saat ditekan */}
                        <motion.button
                            type="button"
                            onClick={toggleAudio}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 16 }}
                            whileTap={clayTap}
                            whileHover={clayHover}
                            className="clay-dome fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center bg-cl-bg"
                            aria-label={isPlaying ? 'Matikan musik' : 'Nyalakan musik'}
                        >
                            {isPlaying ? (
                                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
                                    <Pause size={20} className="text-cl-pink" />
                                </motion.span>
                            ) : (
                                <Play size={20} className="text-cl-pink" />
                            )}
                        </motion.button>

                        {/* PEMBUKA */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 140, damping: 15, delay: 0.3 }}
                            className="clay-card text-center"
                        >
                            <p className="font-clay text-sm font-bold uppercase tracking-widest text-cl-accent">Undangan Pernikahan</p>
                            <h2 className="font-clay mt-2 text-2xl font-extrabold">{groom} &amp; {bride}</h2>
                            <p className="font-body mt-3 text-sm font-bold text-cl-ink/60">
                                Hai <span className="text-cl-berry">{guestName || 'Tamu Istimewa'}!</span> Kami mengundangmu
                                merayakan hari bahagia kami.
                            </p>
                        </motion.div>

                        {/* MEMPELAI — foto dalam dome clay */}
                        <div className="clay-card text-center">
                            <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
                                {[
                                    { name: groom, photo: photos.groom, parents: data?.groom_parents, label: 'Putra dari', dome: 'from-cl-sky to-[#7FC3F5]' },
                                    { name: bride, photo: photos.bride, parents: data?.bride_parents, label: 'Putri dari', dome: 'from-cl-berry to-[#FFB3C0]' },
                                ].map((p, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ type: 'spring', stiffness: 150, damping: 16, delay: i * 0.2 }}
                                        className="flex flex-col items-center"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.06, rotate: i === 0 ? -3 : 3 }}
                                            className={`clay-dome h-40 w-40 overflow-hidden bg-gradient-to-br ${p.dome} p-2.5`}
                                        >
                                            <img src={p.photo} alt={p.name} className="h-full w-full rounded-full object-cover" />
                                        </motion.div>
                                        <h3 className="font-clay mt-4 text-2xl font-extrabold">{p.name}</h3>
                                        <p className="font-body mt-1 text-xs font-bold text-cl-ink/50">
                                            {p.label}<br />{p.parents}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                            {/* Hati clay berdenyut di antara foto */}
                            <motion.div
                                className="clay-dome mx-auto -mt-6 flex h-14 w-14 items-center justify-center bg-gradient-to-br from-cl-accent to-[#6E4CF0] sm:absolute sm:left-1/2 sm:top-1/2 sm:-mt-7 sm:-ml-7"
                                animate={{ scale: [1, 1.22, 1] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <Heart size={22} className="text-white" fill="white" />
                            </motion.div>
                        </div>

                        {/* KUTIPAN */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ type: 'spring', stiffness: 140, damping: 16 }}
                            className="clay-card text-center"
                        >
                            <p className="font-clay text-lg italic leading-relaxed text-cl-ink/80">"{quote}"</p>
                            <p className="font-clay mt-4 text-xs font-bold uppercase tracking-widest text-cl-accent">— {quoteSrc}</p>
                        </motion.div>

                        {/* ACARA */}
                        <div className="grid gap-8 sm:grid-cols-2">
                            {[
                                { title: 'Akad Nikah', date: formattedAkadDate, time: schedule.akadTime, color: 'from-cl-sky to-[#7FC3F5]', icon: <Calendar size={26} className="text-white" /> },
                                { title: 'Resepsi', date: formattedResepsiDate, time: schedule.resepsiTime, color: 'from-cl-berry to-[#FFB3C0]', icon: <Sparkles size={26} className="text-white" /> },
                            ].map((ev, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 44 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ type: 'spring', stiffness: 150, damping: 16, delay: i * 0.15 }}
                                    className="clay-card text-center"
                                >
                                    <motion.div
                                        whileHover={{ rotate: [0, -10, 10, 0] }}
                                        transition={{ duration: 0.6 }}
                                        className={`clay-dome mx-auto flex h-16 w-16 items-center justify-center bg-gradient-to-br ${ev.color}`}
                                    >
                                        {ev.icon}
                                    </motion.div>
                                    <h3 className="font-clay mt-4 text-xl font-extrabold">{ev.title}</h3>
                                    <div className="clay-well mt-4 px-4 py-3">
                                        <p className="font-body text-xs font-bold text-cl-ink/60">{ev.date}</p>
                                        <p className="font-clay mt-1 flex items-center justify-center gap-1 text-sm font-extrabold text-cl-accent">
                                            <Clock size={14} /> {ev.time}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* LOKASI */}
                        <motion.div
                            initial={{ opacity: 0, y: 44 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ type: 'spring', stiffness: 150, damping: 16 }}
                            className="clay-card text-center"
                        >
                            <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                className="clay-dome mx-auto flex h-16 w-16 items-center justify-center bg-gradient-to-br from-cl-mint to-[#7FD4B8]"
                            >
                                <MapPin size={26} className="text-white" />
                            </motion.div>
                            <h3 className="font-clay mt-4 text-xl font-extrabold">Lokasi Acara</h3>
                            <p className="font-body mt-2 text-sm font-bold text-cl-ink/60">{resolveVenue(data).name}</p>
                            <motion.a
                                href={resolveVenue(data).mapsLink}
                                target="_blank"
                                rel="noreferrer"
                                whileHover={clayHover}
                                whileTap={clayTap}
                                className="clay-btn font-clay mt-4 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-extrabold"
                            >
                                <MapPin size={14} /> Buka Google Maps
                            </motion.a>
                        </motion.div>

                        {/* COUNTDOWN — bola clay per satuan */}
                        <motion.div
                            initial={{ opacity: 0, y: 44 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ type: 'spring', stiffness: 150, damping: 16 }}
                            className="clay-card text-center"
                        >
                            <h3 className="font-clay text-xl font-extrabold">Menghitung Hari Bahagia</h3>
                            <div className="mt-5 flex justify-center gap-4">
                                {[
                                    { val: timeLeft.days, label: 'Hari', color: 'from-cl-sun to-[#FFDD8A]' },
                                    { val: timeLeft.hours, label: 'Jam', color: 'from-cl-sky to-[#7FC3F5]' },
                                    { val: timeLeft.minutes, label: 'Mnt', color: 'from-cl-berry to-[#FFB3C0]' },
                                    { val: timeLeft.seconds, label: 'Dtk', color: 'from-cl-mint to-[#7FD4B8]' },
                                ].map((t2, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <motion.div
                                            key={t2.val}
                                            initial={{ scale: [1, 1.25, 0.92, 1], rotate: [0, i % 2 === 0 ? 6 : -6, 0] }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className={`clay-dome flex h-16 w-16 items-center justify-center bg-gradient-to-br ${t2.color}`}
                                        >
                                            <span className="font-clay text-xl font-extrabold text-white drop-shadow">{String(t2.val).padStart(2, '0')}</span>
                                        </motion.div>
                                        <span className="font-clay text-[10px] font-bold uppercase tracking-widest text-cl-ink/50">{t2.label}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* GALERI — bingkai clay puffy */}
                        <motion.div
                            initial={{ opacity: 0, y: 44 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ type: 'spring', stiffness: 150, damping: 16 }}
                            className="clay-card"
                        >
                            <h3 className="font-clay flex items-center justify-center gap-2 text-center text-xl font-extrabold">
                                <ImageIcon size={20} className="text-cl-accent" /> Momen Kami
                            </h3>
                            <div className="mt-5 grid grid-cols-2 gap-5">
                                {photos.gallery.slice(0, 4).map((url, i) => (
                                    <motion.button
                                        key={i}
                                        type="button"
                                        onClick={() => setLightbox(url)}
                                        whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? -2 : 2 }}
                                        whileTap={{ scale: 0.94 }}
                                        className="clay-dome aspect-square cursor-zoom-in overflow-hidden bg-cl-bg p-2"
                                        aria-label={`Lihat foto ${i + 1}`}
                                    >
                                        <img src={url} alt={`Momen ${i + 1}`} className="h-full w-full rounded-full object-cover" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                    {/* ── KADO ── */}
                    <ClayCard delay={0.15}>
                        <div className="mx-auto mb-4 flex w-fit items-center gap-3">
                            <motion.div
                                animate={{ rotate: [-6, 6, -6] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                className="clay-dome flex h-14 w-14 items-center justify-center bg-cl-pink text-white"
                            >
                                <Gift size={24} />
                            </motion.div>
                            <h3 className="font-clay text-2xl font-bold text-cl-ink">Wedding Gift</h3>
                        </div>
                        <p className="font-clay mx-auto mb-6 max-w-md text-sm font-semibold text-cl-ink/60">
                            Doa restu Anda adalah hadiah terindah. Namun jika ingin memberi tanda kasih, silakan
                            gunakan fitur berikut:
                        </p>

                        <div className="mx-auto flex max-w-md flex-wrap justify-center gap-3">
                            <motion.button
                                type="button"
                                onClick={() => setGiftTab('transfer')}
                                whileTap={{ scale: 0.92 }}
                                className={`clay-inset font-clay rounded-2xl px-6 py-3 text-sm font-bold transition-colors ${giftTab === 'transfer' ? 'bg-cl-pink text-white' : 'bg-cl-bg text-cl-ink/70'}`}
                            >
                                💳 Transfer Bank
                            </motion.button>
                            <motion.button
                                type="button"
                                onClick={() => setGiftTab('alamat')}
                                whileTap={{ scale: 0.92 }}
                                className={`clay-inset font-clay rounded-2xl px-6 py-3 text-sm font-bold transition-colors ${giftTab === 'alamat' ? 'bg-cl-teal text-white' : 'bg-cl-bg text-cl-ink/70'}`}
                            >
                                🎁 Kirim Hadiah
                            </motion.button>
                        </div>

                        <div className="mt-6">
                            <AnimatePresence mode="wait">
                                {giftTab === 'transfer' ? (
                                    <motion.div
                                        key="transfer"
                                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -16, scale: 0.96 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                        className="mx-auto max-w-md space-y-3"
                                    >
                                        {resolveBanks(data).map((bank, i) => (
                                            <div key={i} className="clay-inset flex items-center justify-between rounded-3xl bg-cl-bg p-4 text-left">
                                                <div>
                                                    <p className="font-clay text-xs font-bold uppercase tracking-widest text-cl-pink">{bank.bank}</p>
                                                    <p className="font-clay text-lg font-bold text-cl-ink">{bank.number}</p>
                                                    <p className="font-clay text-xs font-semibold text-cl-ink/50">a.n. {groom} &amp; {bride}</p>
                                                </div>
                                                <motion.button
                                                    type="button"
                                                    whileTap={clayTap}
                                                    whileHover={clayHover}
                                                    onClick={() => {
                                                        void copyRek(bank.number);
                                                        setCopiedBank(bank.number);
                                                        window.setTimeout(() => setCopiedBank(null), 2000);
                                                    }}
                                                    className="clay-dome flex h-11 w-11 items-center justify-center bg-cl-mint text-cl-ink"
                                                    aria-label={`Salin nomor ${bank.bank}`}
                                                >
                                                    {copiedBank === bank.number ? <Check size={16} /> : <Copy size={16} />}
                                                </motion.button>
                                            </div>
                                        ))}
                                        {/* Badge "Tersalin" muncul dari bawah seperti dart clay */}
                                        <AnimatePresence>
                                            {copiedBank && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -6, scale: 0.9 }}
                                                    transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                                                    className="clay-dome mx-auto w-fit bg-cl-teal px-5 py-2 font-clay text-[11px] font-bold uppercase tracking-widest text-white"
                                                >
                                                    Nomor tersalin! ✓
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="alamat"
                                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -16, scale: 0.96 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                        className="clay-inset mx-auto max-w-md rounded-3xl bg-cl-bg p-5 text-left"
                                    >
                                        <p className="font-clay text-xs font-bold uppercase tracking-widest text-cl-teal">Alamat Pengiriman</p>
                                        <p className="font-clay mt-2 text-sm font-semibold leading-relaxed text-cl-ink/70">
                                            {'Alamat akan diinformasikan oleh mempelai via WhatsApp 💜'}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </ClayCard>

                    {/* ── RSVP / UCAPAN ── */}
                    <ClayCard delay={0.1}>
                        <div className="mx-auto mb-5 flex w-fit items-center gap-3">
                            <motion.div
                                animate={{ scale: [1, 1.12, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="clay-dome flex h-14 w-14 items-center justify-center bg-cl-sun text-cl-ink"
                            >
                                <Send size={24} />
                            </motion.div>
                            <h3 className="font-clay text-2xl font-bold text-cl-ink">Ucapan &amp; RSVP</h3>
                        </div>

                        {submittedData ? (
                            <motion.div
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                                className="clay-inset mx-auto max-w-md rounded-3xl bg-cl-bg p-6 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.3, 1] }}
                                    transition={{ delay: 0.2, duration: 0.55, ease: 'easeOut' }}
                                    className="clay-dome mx-auto flex h-16 w-16 items-center justify-center bg-cl-mint text-cl-ink"
                                >
                                    <CheckCircle2 size={30} />
                                </motion.div>
                                <p className="font-clay mt-4 text-lg font-bold text-cl-ink">Terima kasih! 💕</p>
                                <p className="font-clay mt-1 text-sm font-semibold text-cl-ink/60">
                                    Ucapan dan doa Anda sudah terkirim ke mempelai.
                                </p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleRsvpSubmit} className="mx-auto max-w-md space-y-4 text-left">

                                <div>
                                    <label htmlFor="clay-status" className="font-clay mb-2 block text-xs font-bold uppercase tracking-widest text-cl-ink/50">Status Kehadiran</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['hadir', 'tidak_hadir', 'ragu'] as const).map((s) => (
                                            <motion.button
                                                key={s}
                                                type="button"
                                                onClick={() => setRsvpStatus(s)}
                                                whileTap={{ scale: 0.9 }}
                                                className={`clay-inset font-clay rounded-2xl py-3 text-xs font-bold transition-colors ${rsvpStatus === s
                                                    ? 'bg-cl-pink text-white'
                                                    : 'bg-cl-bg text-cl-ink/60'}`}
                                            >
                                                {s === 'hadir' ? '✅ Hadir' : s === 'tidak_hadir' ? '❌ Absen' : '🤔 Ragu'}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <AnimatePresence initial={false}>
                                    {rsvpStatus === 'hadir' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                            className="overflow-hidden"
                                        >
                                            <label htmlFor="clay-pax" className="font-clay mb-2 block text-xs font-bold uppercase tracking-widest text-cl-ink/50">Jumlah Tamu</label>
                                            <select
                                                id="clay-pax"
                                                value={rsvpPax}
                                                onChange={(e) => setRsvpPax(Number(e.target.value))}
                                                className="clay-inset font-clay w-full rounded-2xl bg-cl-bg px-4 py-3.5 text-sm font-bold text-cl-ink focus:outline-none"
                                            >
                                                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} Orang</option>)}
                                            </select>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div>
                                    <label htmlFor="clay-msg" className="font-clay mb-2 block text-xs font-bold uppercase tracking-widest text-cl-ink/50">Pesan &amp; Doa</label>
                                    <textarea
                                        id="clay-msg"
                                        required
                                        maxLength={100}
                                        value={rsvpMessage}
                                        onChange={(e) => setRsvpMessage(e.target.value)}
                                        placeholder="Tulis ucapan dan doa terbaikmu..."
                                        className="clay-inset font-clay h-28 w-full resize-none rounded-2xl bg-cl-bg px-4 py-3.5 text-sm font-semibold text-cl-ink placeholder:text-cl-ink/35 focus:outline-none"
                                    />
                                    <div className="font-clay mt-1 text-right text-[11px] font-bold text-cl-ink/40">{rsvpMessage.length}/100</div>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isSending}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.88 }}
                                    className="clay-dome font-clay w-full bg-cl-pink py-4 text-base font-bold text-white shadow-none disabled:opacity-60"
                                >
                                    {isSending ? 'Mengirim...' : '💌 Kirim Ucapan'}
                                </motion.button>
                            </form>
                        )}
                    </ClayCard>

                    {/* ── PENGATUP / FOOTER ── */}
                    <ClayCard delay={0.15}>
                        <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                            className="clay-dome mx-auto flex h-16 w-16 items-center justify-center bg-cl-pink text-white"
                        >
                            <Heart size={28} fill="currentColor" />
                        </motion.div>
                        <h3 className="font-clay mt-5 text-2xl font-bold text-cl-ink">
                            {groom} &amp; {bride}
                        </h3>
                        <p className="font-clay mx-auto mt-3 max-w-md text-sm font-semibold leading-relaxed text-cl-ink/60">
                            Merupakan suatu kebahagiaan dan kehormatan bagi kami, apabila Bapak/Ibu/Saudara/i
                            berkenan hadir dan memberikan doa restu kepada kami.
                        </p>
                        <p className="font-clay mt-5 text-xs font-bold uppercase tracking-[0.25em] text-cl-ink/40">
                            Wassalamu'alaikum Wr. Wb. · Dibuat dengan 💜 dan Claymorphism
                        </p>
                    </ClayCard>
                </motion.main>
                )}
            </AnimatePresence>

            {/* ── LIGHTBOX: foto membesar dari dompet clay ── */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightbox(null)}
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-cl-ink/40 p-8 backdrop-blur-sm"
                    >
                        <motion.div
                            layoutId="clay-lightbox"
                            className="clay-dome max-h-full overflow-hidden bg-cl-bg p-3"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img src={lightbox} alt="Galeri" className="max-h-[75vh] rounded-[2rem] object-contain" />
                        </motion.div>
                        <motion.button
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                            exit={{ opacity: 0 }}
                            onClick={() => setLightbox(null)}
                            className="clay-dome font-clay absolute bottom-10 bg-cl-pink px-8 py-3 text-xs font-bold uppercase tracking-widest text-white"
                        >
                            Tutup
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── AUDIO LATAR — selalu ter-mount agar audioRef valid ──
                Elemen audio TIDAK boleh kondisional (mis. {isPlaying && ...}):
                useOpenInvitation memutar musik via audioRef setelah amplop
                terbuka; kalau elemennya baru muncul saat isPlaying=true,
                ref masih null saat play() dipanggil → musik tak pernah bunyi. */}
            <audio ref={audioRef} src={audioUrl} loop preload="auto" />
        </div>
    );
}