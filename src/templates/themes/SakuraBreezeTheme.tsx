// ============================================================
// src/templates/themes/SakuraBreezeTheme.tsx
// ------------------------------------------------------------
// Tema Undangan: Sakura Breeze (Kategori: RSVP)
//
// Klon "persis" dari CloudSkyTheme (peta dunia zoom & pan): struktur
// section, mesin drag/pinch/button-zoom/recenter, posisi 9 pulau,
// cover amplop, dan chat board dibuat identik. Perbedaannya hanya dua:
//   1. PALET — token taman sakura --color-sk-* (blossom/blush/deep/
//      rose/leaf/gold), font Quicksand+Nunito, ikon bunga menggantikan
//      awan.
//   2. MOTION — lapisan animasi framer-motion jauh lebih tebal:
//        • Hujan kelopak ambient sepanjang sesi (loop tak terbatas).
//        • Letupan 12 kelopak dari titik klik tiap kartu pulau.
//        • Pulau masuk satu-per-satu dengan spring stagger.
//        • Cover: nama mempelai pop per-huruf + blob bernapas.
//        • Countdown angka jelly keluar-masuk (AnimatePresence).
//        • Lightbox galeri transisi shared-element (layoutId).
//        • Semua tombol/kartu punya whileHover/whileTap spring.
// Palet: blossom #FFF0F5, blush #FFC9DC, deep #59223F,
//        rose #F25CA2, leaf #57B894, gold #E9B44C.
// Dipakai di   : templates/Registry.ts (slug 'sakura-breeze')
// Keterikatan  : types/template, hooks/useCountdown,
//                utils/templateHelpers, shared/useOpenInvitation,
//                hooks/useCopyToClipboard, components/GlobalToast,
//                i18n, framer-motion.
// ============================================================

import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
    MapPin, Calendar, Clock, Heart,
    Gift, Play, Pause, Navigation, Copy, Image as ImageIcon,
    Plus, Minus, RotateCcw, Quote, MessageSquare, Send, CheckCircle2, Flower2
} from 'lucide-react';

import type { RsvpStatus, TemplateProps } from '../../types/template';
import { useCountdown } from '../../hooks/useCountdown';
import { formatDate, resolveBanks, resolveGallery, resolvePhotos, resolveVenue, resolveSchedule } from '../../utils/templateHelpers';
import { useOpenInvitation } from '../shared/useOpenInvitation';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useToast } from '../../components/GlobalToast';
import { useTranslation } from '../../i18n';

// Varian gerak bersama: nama mempelai muncul huruf demi huruf.
const letterStagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.055, delayChildren: 0.45 } },
};
const letterPop: Variants = {
    hidden: { opacity: 0, y: 34, scale: 0.2, rotate: -14 },
    show: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 420, damping: 16 } },
};

// Satu partikel kelopak pada efek letupan klik.
type PetalParticle = {
    id: number;
    x: number;
    y: number;
    dx: number;
    dy: number;
    rot: number;
    size: number;
    color: string;
};
const PETAL_COLORS = ['#F25CA2', '#FFC9DC', '#E9B44C', '#57B894'];

// PRNG deterministik (mulberry32) — pengganti Math.random agar pemanggilan
// saat render tetap murni (aturan react-hooks/purity).
const makeRng = (seed: number) => () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export default function SakuraBreezeTheme({ groom, bride, date, data, onRsvpSubmit, submittedData }: TemplateProps) {
    // --- STATE ---
    const copyRek = useCopyToClipboard();
    const toast = useToast();
    const { t } = useTranslation();

    // TRANSFORM STATE (ZOOM & PAN) — identik CloudSkyTheme.
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

    // Interaction State
    const [isDragging, setIsDragging] = useState(false);
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
    const [pinchDist, setPinchDist] = useState<number | null>(null);

    // Lightbox galeri (tambahan motion: transisi shared-element).
    const [lightbox, setLightbox] = useState<string | null>(null);

    // Letupan kelopak saat kartu diklik.
    const [bursts, setBursts] = useState<PetalParticle[]>([]);
    const burstIdRef = useRef(0);

    // RSVP State
    const [rsvpStatus, setRsvpStatus] = useState<'hadir' | 'tidak_hadir' | 'ragu'>('hadir');
    const [rsvpPax, setRsvpPax] = useState<number>(1);
    const [rsvpMessage, setRsvpMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Constants
    const MIN_SCALE = 0.2;
    const MAX_SCALE = 3;

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

    const handleOpen = () => {
        openInvitation();
        const initialScale = window.innerWidth < 768 ? 0.4 : 0.6; // Scale awal lebih kecil biar keliatan luas
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        setTransform({
            x: centerX,
            y: centerY,
            scale: initialScale
        });
    };

    // --- ENGINE: ZOOM TO POINT ---
    const zoomToPoint = (newScale: number, centerX: number, centerY: number) => {
        setTransform(prev => {
            const clampedScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
            const ratio = clampedScale / prev.scale;

            const newX = centerX - (centerX - prev.x) * ratio;
            const newY = centerY - (centerY - prev.y) * ratio;

            return { x: newX, y: newY, scale: clampedScale };
        });
    };

    // Handler ini terpasang pada event mouse DAN touch (lihat JSX di bawah),
    // jadi tipenya union dan properti touch dicek dengan guard `'touches' in e`.
    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isOpen) return;
        if ('touches' in e && e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            setPinchDist(dist);
            setIsDragging(false);
            return;
        }
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setLastMouse({ x: clientX, y: clientY });
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isOpen) return;
        if (e.cancelable) e.preventDefault();

        if ('touches' in e && e.touches.length === 2 && pinchDist) {
            const newDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const distanceDelta = newDist - pinchDist;
            const zoomSensitivity = 0.005;
            const newScale = transform.scale + (distanceDelta * zoomSensitivity);
            zoomToPoint(newScale, midX, midY);
            setPinchDist(newDist);
            return;
        }

        if (isDragging) {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const deltaX = clientX - lastMouse.x;
            const deltaY = clientY - lastMouse.y;
            setTransform(prev => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
            setLastMouse({ x: clientX, y: clientY });
        }
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        setPinchDist(null);
    };

    const handleButtonZoom = (direction: 'in' | 'out') => {
        const centerW = window.innerWidth / 2;
        const centerH = window.innerHeight / 2;
        const factor = 1.2;
        const newScale = direction === 'in' ? transform.scale * factor : transform.scale / factor;
        zoomToPoint(newScale, centerW, centerH);
    };

    const recenter = () => {
        const initialScale = window.innerWidth < 768 ? 0.4 : 0.6;
        setTransform({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            scale: initialScale
        });
    };

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

    // --- MOTION HELPERS (lapisan animasi tambahan) ---

    // Letupan kelopak dari titik klik layar (viewport coordinate).
    const burstPetals = (clientX: number, clientY: number) => {
        const count = 12;
        const particles: PetalParticle[] = Array.from({ length: count }, (_, i) => {
            const angle = ((Math.PI * 2 * i) / count) + Math.random() * 0.5;
            const dist = 60 + Math.random() * 70;
            return {
                id: ++burstIdRef.current,
                x: clientX,
                y: clientY,
                dx: Math.cos(angle) * dist,
                dy: Math.sin(angle) * dist - 30, // condong ke atas agar terasa "terbang"
                rot: Math.random() * 360 - 180,
                size: 7 + Math.random() * 8,
                color: PETAL_COLORS[i % PETAL_COLORS.length],
            };
        });
        setBursts(prev => [...prev, ...particles]);
        window.setTimeout(() => {
            const ids = new Set(particles.map(p => p.id));
            setBursts(prev => prev.filter(p => !ids.has(p.id)));
        }, 1300);
    };

    // Kelopak hujan ambient — deterministik via PRNG ber-seed (murni).
    const rainPetals = useMemo(() => {
        const rng = makeRng(1707); // seed tetap agar stabil antar render
        return Array.from({ length: 16 }, (_, i) => ({
            id: i,
            left: rng() * 100,
            delay: rng() * 9,
            duration: 9 + rng() * 9,
            size: 7 + rng() * 10,
            sway: 18 + rng() * 42,
            color: PETAL_COLORS[i % 2], // selang rose & blush agar tidak ramai
        }));
    }, []);

    // Wadah entrada pulau: muncul satu-per-satu dengan spring.
    const islandIn = (index: number) => ({
        initial: { opacity: 0, scale: 0.55, y: 46 },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: { type: 'spring' as const, stiffness: 210, damping: 18, delay: isOpen ? 0.35 + index * 0.13 : index * 0.13 },
    });

    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-sk-blossom to-sk-blush relative font-sans text-sk-deep/70 select-none touch-none">

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&family=Nunito:wght@400;700&display=swap');
        .font-sakura { font-family: 'Quicksand', cursive; }
        .font-body { font-family: 'Nunito', sans-serif; }

        .sakura-card {
            background: rgba(255, 255, 255, 0.90);
            backdrop-filter: blur(16px);
            border-radius: 40px;
            box-shadow: 0 20px 50px rgba(242, 92, 162, 0.16);
            padding: 24px;
            text-align: center;
            border: 2px solid rgba(255,255,255,0.85);
            transform: translateZ(0);
            will-change: transform;
        }

        .float-1 { animation: float 6s ease-in-out infinite; }
        .float-2 { animation: float 7s ease-in-out infinite; animation-delay: 1s; }
        .float-3 { animation: float 8s ease-in-out infinite; animation-delay: 2s; }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        /* Scrollbar Halus untuk Chat */
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #F5BBD4; border-radius: 10px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>

            {/* --- HUJAN KELOPAK AMBIENT (layer paling depan, tak bisa diklik) --- */}
            <div className="fixed inset-0 z-[80] pointer-events-none overflow-hidden">
                {rainPetals.map(petal => (
                    <motion.span
                        key={petal.id}
                        className="absolute top-[-5vh] block rounded-full rounded-tl-none"
                        style={{
                            left: `${petal.left}%`,
                            width: petal.size,
                            height: petal.size * 0.78,
                            background: petal.color,
                            opacity: 0.75,
                        }}
                        initial={{ y: '-5vh' }}
                        animate={{
                            y: '108vh',
                            x: [0, petal.sway, -petal.sway, 0],
                            rotate: [0, 220, 420],
                        }}
                        transition={{
                            y: { duration: petal.duration, repeat: Infinity, ease: 'linear', delay: petal.delay },
                            x: { duration: petal.duration / 2.2, repeat: Infinity, ease: 'easeInOut', delay: petal.delay },
                            rotate: { duration: petal.duration, repeat: Infinity, ease: 'linear', delay: petal.delay },
                        }}
                    />
                ))}
            </div>

            {/* --- LETUPAN KELOPAK SAAT KARTU DIKLIK --- */}
            <div className="fixed inset-0 z-[85] pointer-events-none overflow-hidden">
                <AnimatePresence>
                    {bursts.map(p => (
                        <motion.span
                            key={p.id}
                            className="absolute left-0 top-0 block rounded-full rounded-tl-none"
                            style={{ width: p.size, height: p.size * 0.75, background: p.color }}
                            initial={{ x: p.x, y: p.y, scale: 1, opacity: 1, rotate: 0 }}
                            animate={{ x: p.x + p.dx, y: p.y + p.dy, scale: 0.15, opacity: 0, rotate: p.rot }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.05, ease: 'easeOut' }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* --- OPENING COVER SCREEN --- */}
            <motion.div
                initial={false}
                animate={isOpen ? { y: '-100%' } : { y: 0 }}
                transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-sk-blossom to-sk-blush"
            >
                {/* Blob pastel bernapas (menggantikan pulse awan putih) */}
                <motion.div
                    className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/70 blur-2xl"
                    animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.85, 0.55] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-sk-blush blur-2xl"
                    animate={{ scale: [1.12, 1, 1.12], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 4.1, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
                />

                <motion.div
                    variants={letterStagger}
                    initial="hidden"
                    animate="show"
                    className="relative z-10 text-center px-6 max-w-md w-full"
                >
                    <motion.div variants={letterPop} className="mx-auto bg-white/60 p-4 rounded-full w-24 h-24 flex items-center justify-center mb-6 shadow-lg">
                        <motion.div
                            animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Flower2 size={48} className="text-sk-rose" />
                        </motion.div>
                    </motion.div>
                    <motion.p variants={letterPop} className="font-sakura text-sm text-sk-rose tracking-widest uppercase mb-2">The Wedding Of</motion.p>
                    <h1 className="font-sakura text-4xl text-sk-deep font-bold mb-8 leading-tight">
                        {groom.split('').map((ch, i) => (
                            <motion.span key={`g-${i}`} variants={letterPop} className="inline-block">{ch === ' ' ? '\u00A0' : ch}</motion.span>
                        ))}
                        <br />
                        <motion.span variants={letterPop} className="text-sk-rose/70 text-2xl inline-block">&amp;</motion.span>
                        <br />
                        {bride.split('').map((ch, i) => (
                            <motion.span key={`b-${i}`} variants={letterPop} className="inline-block">{ch === ' ' ? '\u00A0' : ch}</motion.span>
                        ))}
                    </h1>
                    <motion.button
                        onClick={handleOpen}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        className="bg-sk-rose text-white font-sakura font-bold py-3 px-10 rounded-full shadow-xl hover:bg-sk-deep flex items-center justify-center gap-2 mx-auto active:scale-95 transition-colors"
                    >
                        Jelajahi Taman Kita <Navigation size={16} className="rotate-45" />
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* --- WORLD CANVAS --- */}
            <div
                ref={containerRef}
                className={`absolute inset-0 z-10 overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
            >
                <div
                    style={{
                        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
                        transformOrigin: '0 0',
                        position: 'absolute', top: 0, left: 0
                    }}
                >
                    {/* === ISLANDS (Cards) === */}
                    {/* POSISI DIATUR AGAR TIDAK RAPET (Spacious Layout) */}

                    {/* 1. COUPLE (CENTER - Titik Nol) */}
                    <div className="absolute top-0 left-0 w-[550px] -translate-x-1/2 -translate-y-1/2 float-1 z-30">
                        <motion.div
                            {...islandIn(0)}
                            whileHover={{ scale: 1.035 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={(e) => burstPetals(e.clientX, e.clientY)}
                            className="sakura-card cursor-pointer"
                        >
                            <p className="font-sakura text-xs text-sk-rose tracking-widest uppercase mb-4">The Wedding Of</p>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex-1 flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-2">
                                        <img src={photos.groom} className="w-full h-full object-cover" alt={groom} />
                                    </div>
                                    <h2 className="font-sakura text-xl text-sk-deep font-bold">{groom}</h2>
                                    <p className="font-body text-[10px] text-sk-deep/60 mt-1 leading-tight">Putra Bpk/Ibu<br />{data?.groom_parents}</p>
                                </div>
                                {/* Jantung berdenyut (menggantikan animate-pulse) */}
                                <motion.span
                                    animate={{ scale: [1, 1.32, 1] }}
                                    transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                                    className="mx-4 opacity-70"
                                >
                                    <Heart size={28} fill="#F25CA2" className="text-sk-rose" />
                                </motion.span>
                                <div className="flex-1 flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-2">
                                        <img src={photos.bride} className="w-full h-full object-cover" alt={bride} />
                                    </div>
                                    <h2 className="font-sakura text-xl text-sk-deep font-bold">{bride}</h2>
                                    <p className="font-body text-[10px] text-sk-deep/60 mt-1 leading-tight">Putri Bpk/Ibu<br />{data?.bride_parents}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* 2. GALLERY (TOP - Jauh di atas) */}
                    <div className="absolute top-[-500px] left-0 w-[360px] -translate-x-1/2 -translate-y-1/2 float-2">
                        <motion.div
                            {...islandIn(1)}
                            whileHover={{ scale: 1.04, rotate: -1 }}
                            onClick={(e) => burstPetals(e.clientX, e.clientY)}
                            className="sakura-card cursor-pointer"
                        >
                            <div className="flex items-center justify-center gap-2 mb-3 text-sk-rose">
                                <ImageIcon size={18} />
                                <h3 className="font-sakura text-md font-bold">Our Memories</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {photos.gallery.slice(0, 4).map((url, i) => (
                                    <motion.div
                                        key={i}
                                        layoutId={`sk-photo-${i}`}
                                        onClick={(e) => { e.stopPropagation(); setLightbox(url); }}
                                        whileHover={{ scale: 1.07 }}
                                        className="aspect-square rounded-xl overflow-hidden bg-sk-blossom shadow-sm cursor-zoom-in"
                                    >
                                        <img src={url} className="w-full h-full object-cover" alt={`Memory ${i + 1}`} />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                        {/* Tali penghubung putus-putus */}
                        <div className="absolute top-full left-1/2 w-0.5 h-[200px] border-l-2 border-dashed border-sk-rose/30"></div>
                    </div>

                    {/* 3. EVENT (TOP LEFT - Agak jauh) */}
                    <div className="absolute top-[-350px] left-[-500px] w-[300px] -translate-x-1/2 -translate-y-1/2 float-3">
                        <motion.div
                            {...islandIn(2)}
                            whileHover={{ scale: 1.05, rotate: 1 }}
                            onClick={(e) => burstPetals(e.clientX, e.clientY)}
                            className="sakura-card cursor-pointer"
                        >
                            <motion.div
                                animate={{ rotate: [0, -6, 6, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="bg-sk-rose/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sk-rose"
                            >
                                <Calendar size={20} />
                            </motion.div>
                            <h3 className="font-sakura text-lg text-sk-deep font-bold mb-1">Save The Date</h3>
                            <p className="font-body text-sm font-bold text-sk-rose mb-3">{formattedDate}</p>
                            <div className="text-left bg-white/60 rounded-xl p-3 text-xs space-y-3">
                                <div>
                                    <div className="font-bold text-sk-rose">Akad Nikah</div>
                                    <div className="text-sk-deep/50">{formattedAkadDate}</div>
                                    <div className="text-sk-deep font-bold">{schedule.akadTime}</div>
                                </div>
                                <div className="border-t border-sk-blush/50"></div>
                                <div>
                                    <div className="font-bold text-sk-gold">Resepsi</div>
                                    <div className="text-sk-deep/50">{formattedResepsiDate}</div>
                                    <div className="text-sk-deep font-bold">{schedule.resepsiTime}</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* 4. LOCATION (TOP RIGHT - Agak jauh) */}
                    <div className="absolute top-[-350px] left-[500px] w-[300px] -translate-x-1/2 -translate-y-1/2 float-3">
                        <motion.div
                            {...islandIn(3)}
                            whileHover={{ scale: 1.05, rotate: -1 }}
                            onClick={(e) => burstPetals(e.clientX, e.clientY)}
                            className="sakura-card cursor-pointer"
                        >
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                                className="bg-sk-leaf/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sk-leaf"
                            >
                                <MapPin size={20} />
                            </motion.div>
                            <h3 className="font-sakura text-lg text-sk-deep font-bold">Location</h3>
                            <p className="font-body text-xs text-sk-deep/60 mt-1 mb-3 line-clamp-2">{resolveVenue(data).name}</p>
                            <a href={resolveVenue(data).mapsLink} target="_blank" rel="noreferrer" onPointerDown={(e) => e.stopPropagation()} className="bg-sk-leaf text-white px-4 py-2 rounded-full text-xs font-bold shadow-md hover:bg-sk-deep flex items-center justify-center gap-1 w-full">
                                <Navigation size={12} /> Google Maps
                            </a>
                        </motion.div>
                    </div>

                    {/* 5. COUNTDOWN (BOTTOM LEFT - Dilebarkan) */}
                    <div className="absolute top-[400px] left-[-400px] w-[340px] -translate-x-1/2 -translate-y-1/2 float-2">
                        <motion.div
                            {...islandIn(4)}
                            whileHover={{ scale: 1.04 }}
                            onClick={(e) => burstPetals(e.clientX, e.clientY)}
                            className="sakura-card cursor-pointer"
                        >
                            <motion.div
                                animate={{ rotate: [0, 8, -8, 0] }}
                                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                                className="bg-sk-blush/50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sk-rose"
                            >
                                <Clock size={20} />
                            </motion.div>
                            <h3 className="font-sakura text-lg text-sk-deep font-bold mb-3">Counting Down</h3>
                            <div className="flex justify-center gap-2">
                                <JellyDigit val={timeLeft.days} label="Hari" />
                                <JellyDigit val={timeLeft.hours} label="Jam" />
                                <JellyDigit val={timeLeft.minutes} label="Mnt" />
                                <JellyDigit val={timeLeft.seconds} label="Dtk" />
                            </div>
                        </motion.div>
                    </div>

                    {/* 6. GIFT (BOTTOM RIGHT - Dilebarkan) */}
                    <div className="absolute top-[400px] left-[400px] w-[300px] -translate-x-1/2 -translate-y-1/2 float-1">
                        <motion.div
                            {...islandIn(5)}
                            whileHover={{ scale: 1.05 }}
                            onClick={(e) => burstPetals(e.clientX, e.clientY)}
                            className="sakura-card cursor-pointer"
                        >
                            <motion.div
                                animate={{ rotate: [-8, 8, -8] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                className="bg-sk-gold/15 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sk-gold"
                            >
                                <Gift size={20} />
                            </motion.div>
                            <h3 className="font-sakura text-lg text-sk-deep font-bold mb-2">Gift</h3>
                            <div className="space-y-2">
                                {resolveBanks(data).map((bank, i) => (
                                    <div key={i} className="bg-white p-2 rounded-lg border border-sk-gold/30 text-left flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="font-bold text-xs text-sk-gold">{bank.bank}</p>
                                            <p className="font-mono text-xs text-sk-deep/70">{bank.number}</p>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.8, rotate: [0, -12, 12, 0] }}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            onClick={() => void copyRek(bank.number)}
                                            className="bg-sk-gold/20 p-1.5 rounded-md text-sk-gold hover:bg-sk-gold/40"
                                            aria-label={`Salin nomor ${bank.bank}`}
                                        >
                                            <Copy size={14} />
                                        </motion.button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* 7. QUOTE (BOTTOM CENTER - DITURUNKAN LAGI) */}
                    <div className="absolute top-[600px] left-0 w-[420px] -translate-x-1/2 -translate-y-1/2 float-3">
                        <motion.div
                            {...islandIn(6)}
                            whileHover={{ scale: 1.03 }}
                            onClick={(e) => burstPetals(e.clientX, e.clientY)}
                            className="sakura-card relative cursor-pointer"
                        >
                            <motion.span
                                animate={{ rotate: [-10, 10, -10], y: [0, -4, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -top-3 left-4 inline-block"
                            >
                                <Quote size={24} className="text-sk-gold fill-sk-blush" />
                            </motion.span>
                            <p className="font-sakura text-sm text-sk-deep italic leading-relaxed px-4 pt-2">
                                "{quote}"
                            </p>
                            <p className="font-body text-xs font-bold text-sk-rose mt-3 tracking-widest uppercase">
                                — {quoteSrc}
                            </p>
                        </motion.div>
                        {/* Tali Gantung Panjang */}
                        <div className="absolute bottom-full left-1/2 w-0.5 h-[200px] border-l-2 border-dashed border-sk-rose/30"></div>
                    </div>

                    {/* 8. RSVP FORM ISLAND (FAR RIGHT) */}
                    <div className="absolute top-[100px] left-[750px] w-[320px] -translate-x-1/2 -translate-y-1/2 float-2">
                        <motion.div
                            {...islandIn(7)}
                            whileHover={{ scale: 1.02 }}
                            className="sakura-card"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-2 justify-center mb-4 text-sk-rose">
                                <Send size={18} />
                                <h3 className="font-sakura text-md font-bold">Kirim Ucapan</h3>
                            </div>

                            {submittedData ? (
                                <motion.div
                                    initial={{ scale: 0.6, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                    className="bg-sk-leaf/10 p-4 rounded-2xl border border-sk-leaf/30"
                                >
                                    <motion.div
                                        animate={{ scale: [0, 1.25, 1] }}
                                        transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
                                    >
                                        <CheckCircle2 className="w-8 h-8 text-sk-leaf mx-auto mb-2" />
                                    </motion.div>
                                    <p className="text-xs text-sk-deep font-bold">Terima Kasih!</p>
                                    <p className="text-[10px] text-sk-deep/60 mt-1">Ucapan Anda sudah terkirim.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleRsvpSubmit} className="space-y-3 text-left">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-sk-deep/40 ml-1">Status Kehadiran</label>
                                        <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)} className="w-full text-xs p-3 rounded-xl border border-sk-blush focus:outline-none focus:border-sk-rose bg-white/50 font-bold text-sk-deep/70">
                                            <option value="hadir">Hadir</option>
                                            <option value="tidak_hadir">Maaf Tidak Bisa</option>
                                            <option value="ragu">Masih Ragu</option>
                                        </select>
                                    </div>

                                    {rsvpStatus === 'hadir' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.35, ease: 'easeOut' }}
                                            className="space-y-1 overflow-hidden"
                                        >
                                            <label className="text-[10px] font-bold text-sk-deep/40 ml-1">Jumlah Tamu</label>
                                            <select value={rsvpPax} onChange={(e) => setRsvpPax(Number(e.target.value))} className="w-full text-xs p-3 rounded-xl border border-sk-blush focus:outline-none focus:border-sk-rose bg-white/50">
                                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Orang</option>)}
                                            </select>
                                        </motion.div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-sk-deep/40 ml-1">Pesan &amp; Doa</label>
                                        <textarea
                                            required
                                            maxLength={100}
                                            value={rsvpMessage}
                                            onChange={(e) => setRsvpMessage(e.target.value)}
                                            placeholder="Tulis ucapan selamat..."
                                            className="w-full text-xs p-3 rounded-xl border border-sk-blush focus:outline-none focus:border-sk-rose bg-white/50 h-24 resize-none"
                                        />

                                        {/* Indikator sisa karakter */}
                                        <div className="text-right text-[10px] text-sk-deep/40 mr-1">
                                            {rsvpMessage.length}/100
                                        </div>
                                    </div>

                                    <motion.button
                                        disabled={isSending}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.94 }}
                                        className="w-full bg-sk-rose text-white text-xs font-bold py-3 rounded-xl hover:bg-sk-deep flex items-center justify-center gap-2 shadow-lg shadow-sk-blush/60"
                                    >
                                        {isSending ? 'Mengirim...' : <><Send size={14} /> Kirim Ucapan</>}
                                    </motion.button>
                                </form>
                            )}
                        </motion.div>
                    </div>

                    {/* 9. LOVE NOTES ISLAND (FAR LEFT - CHAT BOARD) */}
                    <div className="absolute top-[100px] left-[-750px] w-[350px] -translate-x-1/2 -translate-y-1/2 float-2">
                        <motion.div
                            {...islandIn(8)}
                            whileHover={{ scale: 1.02 }}
                            className="sakura-card text-left p-0 overflow-hidden"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <div className="bg-sk-blossom/70 p-4 border-b border-sk-blush flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sk-rose">
                                    <MessageSquare size={18} />
                                    <h3 className="font-sakura text-md font-bold">Love Notes</h3>
                                </div>
                                <AnimatePresence mode="popLayout" initial={false}>
                                    <motion.span
                                        key={(data?.rsvps || []).length}
                                        initial={{ y: -10, opacity: 0, scale: 0.6 }}
                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                        exit={{ y: 10, opacity: 0, scale: 0.6 }}
                                        transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                                        className="text-[10px] bg-white px-2 py-1 rounded-full text-sk-rose font-bold border border-sk-blush"
                                    >
                                        {(data?.rsvps || []).length} Pesan
                                    </motion.span>
                                </AnimatePresence>
                            </div>

                            <div className="max-h-[320px] overflow-y-auto p-4 space-y-4 chat-scroll bg-white/40">
                                {(data?.rsvps || []).length === 0 ? (
                                    <div className="text-center py-8 opacity-50">
                                        <p className="text-xs italic text-sk-deep/50">Belum ada ucapan.</p>
                                    </div>
                                ) : (
                                    (data?.rsvps || []).map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -24 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ type: 'spring', stiffness: 220, damping: 20, delay: Math.min(idx * 0.12, 0.8) }}
                                            className="group"
                                        >
                                            {/* PESAN TAMU */}
                                            <div className="flex gap-3 items-start">
                                                {/* Avatar */}
                                                <motion.div
                                                    whileHover={{ scale: 1.15, rotate: -6 }}
                                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-sk-rose to-[#C76BCB] flex items-center justify-center shrink-0 text-white font-bold font-sakura text-xs shadow-sm"
                                                >
                                                    {item.guest_name.charAt(0).toUpperCase()}
                                                </motion.div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="font-bold text-sk-deep text-xs truncate max-w-[100px]">{item.guest_name}</span>
                                                        <span className={`text-[8px] px-1.5 py-0.5 rounded text-white font-bold uppercase ${item.status === 'hadir' ? 'bg-emerald-400' :
                                                                item.status === 'tidak_hadir' ? 'bg-rose-400' : 'bg-amber-400'
                                                            }`}>
                                                            {item.status === 'hadir' ? 'Hadir' : item.status === 'tidak_hadir' ? 'Absen' : 'Ragu'}
                                                        </span>
                                                        <span className="text-[9px] text-sk-deep/40 ml-auto">
                                                            {new Date(item.created_at || '').toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sk-deep/70 text-xs leading-relaxed">
                                                        {item.message}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* BALASAN ADMIN (THREAD STYLE) */}
                                            {item.reply && (
                                                <div className="flex mt-1 ml-1">
                                                    <div className="w-6 flex justify-end mr-2">
                                                        <div className="w-3 h-4 border-l-2 border-b-2 border-sk-blush rounded-bl-lg"></div>
                                                    </div>
                                                    <div className="flex-1 flex gap-2 items-start pt-1">
                                                        <div className="w-5 h-5 rounded-full bg-sk-blush flex items-center justify-center shrink-0 text-white shadow-sm mt-0.5">
                                                            <Heart size={10} fill="white" />
                                                        </div>
                                                        <div className="bg-white/70 p-2 rounded-lg border border-sk-blush flex-1">
                                                            <span className="text-[10px] font-bold text-sk-rose flex items-center gap-1 mb-0.5">
                                                                Mempelai
                                                            </span>
                                                            <p className="text-sk-deep/70 text-[10px] leading-tight">{item.reply}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* BACKGROUND BLOSSOMS (Hiasan Jauh — bergoyang pelan) */}
                    <motion.div
                        animate={{ rotate: [0, 10, 0], y: [0, -14, 0] }}
                        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-[-500px] left-[-600px] opacity-40"
                    >
                        <Flower2 size={300} className="text-white blur-xl" />
                    </motion.div>
                    <motion.div
                        animate={{ rotate: [0, -12, 0], y: [0, 12, 0] }}
                        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute bottom-[-400px] right-[-500px] opacity-40"
                    >
                        <Flower2 size={400} className="text-sk-blush blur-2xl" />
                    </motion.div>

                </div>
            </div>

            {/* --- UI CONTROLS --- */}
            <div className={`fixed bottom-24 right-6 flex flex-col gap-3 z-50 transition-all duration-500 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleButtonZoom('in')} className="bg-white p-3 rounded-full shadow-lg text-sk-deep/70 hover:text-sk-rose transition border border-sk-blush" aria-label="Perbesar">
                    <Plus size={24} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleButtonZoom('out')} className="bg-white p-3 rounded-full shadow-lg text-sk-deep/70 hover:text-sk-rose transition border border-sk-blush" aria-label="Perkecil">
                    <Minus size={24} />
                </motion.button>
            </div>

            <div className={`fixed bottom-8 right-6 flex gap-3 z-50 transition-all duration-500 delay-100 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <motion.button whileTap={{ rotate: -180 }} onClick={recenter} className="bg-white p-3 rounded-full shadow-lg text-sk-deep/70 hover:text-sk-rose transition border border-sk-blush" title="Reset View">
                    <RotateCcw size={20} />
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    animate={isPlaying ? { boxShadow: ['0 0 0 0 rgba(242,92,162,0.45)', '0 0 0 14px rgba(242,92,162,0)'] } : {}}
                    transition={isPlaying ? { duration: 1.6, repeat: Infinity, ease: 'easeOut' } : {}}
                    onClick={toggleAudio}
                    className="bg-sk-rose p-3 rounded-full shadow-lg text-white hover:bg-sk-deep active:scale-95 border border-sk-blush"
                    aria-label={isPlaying ? 'Jeda musik' : 'Putar musik'}
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </motion.button>
            </div>

            {/* --- LIGHTBOX (shared-element dari grid galeri) --- */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightbox(null)}
                        className="fixed inset-0 z-[120] bg-sk-deep/80 backdrop-blur-sm flex items-center justify-center p-8"
                    >
                        <motion.img
                            layoutId={`sk-photo-${photos.gallery.indexOf(lightbox)}`}
                            src={lightbox}
                            alt="Foto galeri diperbesar"
                            className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl border-4 border-white"
                        />
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                            className="absolute bottom-8 text-white/70 text-xs font-body"
                        >
                            Ketuk di mana saja untuk menutup
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            <audio ref={audioRef} src={audioUrl} loop />
        </div>
    );
}

// Angka countdown "jelly": bergoyang spring setiap nilainya berubah.
function JellyDigit({ val, label }: { val: number; label: string }) {
    return (
        <div className="text-center bg-white rounded-lg p-2 min-w-[50px] shadow-sm">
            <div className="overflow-hidden h-7">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                        key={val}
                        initial={{ y: -26, opacity: 0, scale: 0.6, rotateX: 90 }}
                        animate={{ y: 0, opacity: 1, scale: [1.25, 1], rotateX: 0 }}
                        exit={{ y: 26, opacity: 0, scale: 0.6 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                        className="block font-bold text-lg text-sk-rose"
                    >
                        {String(val).padStart(2, '0')}
                    </motion.span>
                </AnimatePresence>
            </div>
            <span className="text-[9px] uppercase text-sk-deep/40">{label}</span>
        </div>
    );
}
