import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Cloud, Heart, MapPin, Calendar, Gift,
    Music, Play, Pause, Star, Sparkles, Copy, ArrowDown, Quote, MessageSquare, CheckCircle
} from 'lucide-react';

import type { RsvpStatus, TemplateProps } from '../../types/template';
import { useCountdown } from '../../hooks/useCountdown';
import { formatDate, resolveBanks, resolveGallery, resolvePhotos, resolveVenue, resolveSchedule } from '../../utils/templateHelpers';
import { useOpenInvitation } from '../shared/useOpenInvitation';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useToast } from '../../components/GlobalToast';
import { useTranslation } from '../../i18n';

// ── KARAKTER CINNAMOROLL (sumber: cinnamoroll.fandom.com) ──────────
// Semua gambar dirender dalam lingkaran putih (CharacterBadge) agar
// aset JPG/GIF non-transparan dari wiki tetap tampil bersih.
const CINNA_CREW = {
    cinnamoroll: 'https://static.wikia.nocookie.net/cinnamoroll/images/4/4e/Cinn.png/revision/latest?cb=20201015030428',
    mocha: 'https://static.wikia.nocookie.net/cinnamoroll/images/c/c7/Cinnamoroll-Mocha-cinnamoroll-2346053-360-129.gif/revision/latest?cb=20130617072959',
    chiffon: 'https://static.wikia.nocookie.net/cinnamoroll/images/f/f4/Chiffon-cinnamoroll-2346022-211-149.gif/revision/latest?cb=20130617073736',
    espresso: 'https://static.wikia.nocookie.net/cinnamoroll/images/8/8b/Espresso-cinnamoroll-2355272-234-208.jpg/revision/latest?cb=20140813071527',
    cappuccino: 'https://static.wikia.nocookie.net/cinnamoroll/images/a/a4/1172726161a3711050717b393091045l.jpg/revision/latest?cb=20130617073606',
} as const;

// Varian gerak masuk bagian (reveal saat scroll).
const sectionReveal = {
    initial: { opacity: 0, y: 42 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { type: 'spring', stiffness: 140, damping: 18 },
} as const;

// Props 'submittedData' diterima dari InvitationRender
export default function SoftBlueTheme({ groom, bride, date, guestName, data, onRsvpSubmit, submittedData }: TemplateProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const copyRek = useCopyToClipboard();
    const toast = useToast();
    const { t } = useTranslation();

    // Form State
    const [rsvpStatus, setRsvpStatus] = useState<'hadir' | 'tidak_hadir' | 'ragu'>('hadir');
    const [rsvpPax, setRsvpPax] = useState<number>(1);
    const [rsvpMessage, setRsvpMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const photos = resolvePhotos(data);
    const gallery = resolveGallery(data);
    const banks = resolveBanks(data);
    const quote = data?.quote || "Dan di antara tanda-tanda kekuasaan-Nya...";
    const quoteSrc = data?.quote_src || "QS. Ar-Rum: 21";
    const audioUrl = data?.audio_url || "https://r2.loverse.my.id/defaults/audio/ee2e74c72c.mp3";
    const formattedDate = formatDate(date, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const schedule = resolveSchedule(data, date);
    const formattedAkadDate = schedule.akadDate ? formatDate(schedule.akadDate, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : formattedDate;
    const formattedResepsiDate = schedule.resepsiDate ? formatDate(schedule.resepsiDate, 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : formattedDate;

    const timeLeft = useCountdown(date);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!onRsvpSubmit) {
            toast.warning(t('toast.demoRsvpWarning'));
            return;
        }
        setIsSending(true);
        await onRsvpSubmit({ status: rsvpStatus, pax: Number(rsvpPax), message: rsvpMessage });
        setIsSending(false);
    };

    // Pola bersama (dedup 3.2): amplop + autoplay audio dalam satu hook.
    const { isOpen, open: handleOpen, playing: isPlaying, toggle: toggleAudio } =
        useOpenInvitation(audioRef, 500);

    return (
        <div className="bg-gradient-to-b from-[#DFF1FF] to-[#EAF6FF] text-[#5D4037] min-h-screen relative overflow-x-hidden font-sans selection:bg-[#FFD1DC] selection:text-white">

            {/* STYLES */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;800&family=Nunito:wght@400;600;700&display=swap');
        .font-cute { font-family: 'Baloo 2', cursive; }
        .font-body { font-family: 'Nunito', sans-serif; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes twinkle { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .cloud-decor { position: absolute; background: white; border-radius: 999px; opacity: 0.6; filter: blur(8px); }
      `}</style>

            {/* BG DECOR */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="cloud-decor w-64 h-32 top-10 -left-10 animate-float"></div>
                <div className="cloud-decor w-80 h-40 bottom-20 -right-20 animate-float"></div>
                <Star className="absolute top-20 right-10 text-yellow-300 w-6 h-6 animate-twinkle opacity-80" fill="currentColor" />
                <Star className="absolute bottom-40 left-10 text-[#FFD1DC] w-8 h-8 animate-twinkle delay-700 opacity-80" fill="currentColor" />
            </div>

            {/* KARAKTER MELAYANG di tepi layar (setelah undangan dibuka) */}
            <div className={`pointer-events-none fixed inset-0 z-30 overflow-hidden transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                <motion.img
                    src={CINNA_CREW.cinnamoroll}
                    alt="Cinnamoroll"
                    className="absolute top-24 left-3 w-16 rounded-full border-4 border-white bg-white shadow-md"
                    animate={{ y: [0, -14, 0], rotate: [-6, 4, -6] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.img
                    src={CINNA_CREW.chiffon}
                    alt="Chiffon"
                    className="absolute top-1/2 right-2 w-14 rounded-full border-4 border-white bg-white shadow-md"
                    animate={{ y: [0, 12, 0], rotate: [8, -4, 8] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                />
                <motion.img
                    src={CINNA_CREW.espresso}
                    alt="Espresso"
                    className="absolute bottom-32 left-4 w-14 rounded-full border-4 border-white bg-white shadow-md"
                    animate={{ y: [0, -10, 0], rotate: [4, -8, 4] }}
                    transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
                />
            </div>

            {/* OPENING SCREEN */}
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#C7E7FF] transition-all duration-1000 ease-[cubic-bezier(0.7,0,0.3,1)] ${isOpen ? '-translate-y-full rounded-b-[100px]' : 'translate-y-0 rounded-none'}`}>
                <div className="bg-white p-8 rounded-[3rem] shadow-[0_10px_40px_rgba(199,231,255,0.8)] text-center max-w-sm w-full relative animate-float">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2"><Cloud size={48} className="text-white fill-white drop-shadow-md" /></div>

                    {/* Cinnamoroll menyapa dari atas kartu */}
                    <motion.img
                        src={CINNA_CREW.cinnamoroll}
                        alt="Cinnamoroll"
                        className="mx-auto -mt-2 mb-2 w-24 h-24 rounded-full border-4 border-[#C7E7FF] bg-white object-cover shadow-md"
                        animate={{ y: [0, -8, 0], rotate: [-4, 4, -4] }}
                        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    <p className="font-body text-sm text-[#8D6E63] tracking-widest uppercase mb-4">The Wedding Of</p>
                    <h1 className="font-cute text-4xl md:text-5xl text-[#5D4037] mb-6 leading-tight">{groom} <br /> <span className="text-[#FFB7B2] text-3xl">&</span> <br /> {bride}</h1>
                    <div className="bg-[#FFF4E6] rounded-2xl p-4 mb-8">
                        <p className="font-body text-xs text-[#8D6E63] mb-1">Dear Special Guest,</p>
                        <h3 className="font-cute text-xl text-[#5D4037]">{guestName || "Teman Baik"}</h3>
                    </div>
                    <button onClick={handleOpen} className="bg-[#81D4FA] text-white font-cute font-bold text-lg py-3 px-10 rounded-full shadow-lg hover:scale-105 hover:bg-[#4FC3F7] transition-all flex items-center justify-center gap-2 mx-auto">Open Invitation <Sparkles size={20} /></button>

                    {/* Barisan teman kecil di dasar kartu */}
                    <div className="mt-6 flex items-end justify-center gap-3">
                        {[
                            { src: CINNA_CREW.mocha, delay: 0 },
                            { src: CINNA_CREW.chiffon, delay: 0.5 },
                            { src: CINNA_CREW.cappuccino, delay: 1 },
                        ].map((c, i) => (
                            <motion.img
                                key={i}
                                src={c.src}
                                alt="Teman Cinnamoroll"
                                className="h-12 w-12 rounded-full border-2 border-[#C7E7FF] bg-white object-cover shadow-sm"
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className={`transition-opacity duration-1000 delay-500 relative z-10 max-w-xl mx-auto px-4 py-8 space-y-12 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

                {/* 1. HERO & QUOTE */}
                <section className="text-center pt-8">
                    <div className="relative inline-block mx-auto mb-6">
                        <div className="absolute inset-0 bg-[#FFD1DC] rounded-[40px] rotate-3"></div>
                        <img src={photos.cover} className="relative w-64 h-80 object-cover rounded-[40px] border-4 border-white shadow-lg -rotate-3" alt="Cover" />
                        <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-full shadow-md animate-bounce"><Heart size={24} className="text-[#FF8A80] fill-[#FF8A80]" /></div>
                    </div>
                    <h2 className="font-cute text-2xl text-[#5D4037] mb-2">We Are Getting Married!</h2>

                    {/* Quote Section */}
                    <div className="mt-6 px-6 relative">
                        <Quote size={24} className="text-[#BCAAA4] absolute -top-2 left-4 opacity-50" />
                        <p className="font-body text-[#8D6E63] text-sm italic leading-relaxed px-4">{quote}</p>
                        <p className="font-cute text-xs text-[#5D4037] mt-2 font-bold">— {quoteSrc}</p>
                    </div>

                    <div className="mt-8 flex justify-center"><ArrowDown className="text-[#81D4FA] animate-bounce" /></div>

                    {/* Parade karakter di bawah hero */}
                    <motion.div {...sectionReveal} className="mt-8 flex items-end justify-center gap-4">
                        {[
                            { src: CINNA_CREW.cinnamoroll, label: 'Cinnamoroll', size: 'w-20 h-20' },
                            { src: CINNA_CREW.mocha, label: 'Mocha', size: 'w-16 h-16' },
                            { src: CINNA_CREW.chiffon, label: 'Chiffon', size: 'w-16 h-16' },
                            { src: CINNA_CREW.espresso, label: 'Espresso', size: 'w-14 h-14' },
                            { src: CINNA_CREW.cappuccino, label: 'Cappuccino', size: 'w-14 h-14' },
                        ].map((c, i) => (
                            <motion.img
                                key={i}
                                src={c.src}
                                alt={c.label}
                                title={c.label}
                                className={`${c.size} rounded-full border-4 border-white bg-white object-cover shadow-md`}
                                animate={{ y: [0, -10, 0], rotate: [0, i % 2 === 0 ? 6 : -6, 0] }}
                                transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                            />
                        ))}
                    </motion.div>
                </section>

                {/* 2. COUPLE */}
                <section className="bg-white/60 backdrop-blur-sm rounded-[3rem] p-8 shadow-sm">
                    <h2 className="font-cute text-3xl text-center mb-8 text-[#5D4037]">The Couple</h2>
                    <div className="space-y-8">
                        <motion.div {...sectionReveal} className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <motion.img
                                    src={photos.groom}
                                    alt={groom}
                                    className="w-24 h-24 rounded-full border-4 border-[#C7E7FF] object-cover shadow-md"
                                    whileHover={{ scale: 1.08 }}
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                />
                                {/* Maskot kecil menempel di sudut foto */}
                                <motion.img
                                    src={CINNA_CREW.cinnamoroll}
                                    alt="Cinnamoroll"
                                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-2 border-white bg-white object-cover shadow"
                                    animate={{ rotate: [0, 10, 0] }}
                                    transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                                />
                            </div>
                            <div><h3 className="font-cute text-2xl text-[#5D4037]">{groom}</h3><p className="font-body text-xs text-[#8D6E63] mt-1">Putra Bpk/Ibu <br /> {data?.groom_parents}</p></div>
                        </motion.div>
                        <motion.div {...sectionReveal} className="flex items-center gap-4 flex-row-reverse text-right">
                            <div className="relative shrink-0">
                                <motion.img
                                    src={photos.bride}
                                    alt={bride}
                                    className="w-24 h-24 rounded-full border-4 border-[#FFD1DC] object-cover shadow-md"
                                    whileHover={{ scale: 1.08 }}
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                                />
                                {/* Maskot kecil menempel di sudut foto */}
                                <motion.img
                                    src={CINNA_CREW.mocha}
                                    alt="Mocha"
                                    className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full border-2 border-white bg-white object-cover shadow"
                                    animate={{ rotate: [0, -10, 0] }}
                                    transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                />
                            </div>
                            <div><h3 className="font-cute text-2xl text-[#5D4037]">{bride}</h3><p className="font-body text-xs text-[#8D6E63] mt-1">Putri Bpk/Ibu <br /> {data?.bride_parents}</p></div>
                        </motion.div>
                    </div>
                </section>

                {/* 3. EVENT DETAILS */}
                <section>
                    <div className="bg-[#FFF4E6] rounded-[2.5rem] p-8 shadow-sm border-2 border-white relative">
                        <Cloud size={60} className="absolute -top-8 -left-4 text-white fill-white drop-shadow-sm opacity-80" />
                        <motion.img
                            src={CINNA_CREW.chiffon}
                            alt="Chiffon"
                            className="absolute -top-10 right-2 w-16 h-16 rounded-full border-4 border-white bg-white object-cover shadow-md"
                            animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
                            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <h2 className="font-cute text-3xl text-center mb-6">Save The Date</h2>
                        <div className="flex justify-center mb-6"><span className="bg-[#FFE082] text-[#5D4037] px-4 py-2 rounded-full font-cute text-lg shadow-sm">{formattedDate}</span></div>

                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                                <div className="bg-[#C7E7FF] p-2 rounded-full text-white"><Sparkles size={18} /></div>
                                <div><h3 className="font-cute text-lg">Akad Nikah</h3><p className="font-body text-xs text-[#8D6E63]">{formattedAkadDate}</p><p className="font-body text-sm text-[#8D6E63]">{schedule.akadTime}</p></div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                                <div className="bg-[#FFCCBC] p-2 rounded-full text-white"><Sparkles size={18} /></div>
                                <div><h3 className="font-cute text-lg">Resepsi</h3><p className="font-body text-xs text-[#8D6E63]">{formattedResepsiDate}</p><p className="font-body text-sm text-[#8D6E63]">{schedule.resepsiTime}</p></div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="font-body text-sm text-[#8D6E63] mb-3">{resolveVenue(data).name}</p>
                            <a href={resolveVenue(data).mapsLink} target="_blank" className="inline-flex items-center gap-2 bg-[#81D4FA] text-white px-6 py-3 rounded-full font-cute shadow-md hover:bg-[#4FC3F7] transition"><MapPin size={18} /> Open Google Maps</a>
                        </div>
                    </div>
                </section>

                {/* 4. COUNTDOWN */}
                <motion.section {...sectionReveal} className="text-center relative">
                    <motion.img
                        src={CINNA_CREW.cinnamoroll}
                        alt="Cinnamoroll"
                        className="absolute -top-8 right-4 w-14 h-14 rounded-full border-4 border-white bg-white object-cover shadow-md"
                        animate={{ y: [0, -9, 0], rotate: [0, -8, 0] }}
                        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <h2 className="font-cute text-2xl mb-6 text-[#5D4037]">Counting Down ✨</h2>
                    <div className="flex justify-center gap-3">
                        <TimeBox val={timeLeft.days} label="Hari" color="bg-[#FFD1DC]" />
                        <TimeBox val={timeLeft.hours} label="Jam" color="bg-[#FFF9C4]" />
                        <TimeBox val={timeLeft.minutes} label="Mnt" color="bg-[#C7E7FF]" />
                        <TimeBox val={timeLeft.seconds} label="Dtk" color="bg-[#E1BEE7]" />
                    </div>
                </motion.section>

                {/* --- 5. RSVP & UCAPAN --- */}
                <section className="bg-white rounded-[3rem] p-8 shadow-lg border-t-8 border-[#C7E7FF]">
                    <h2 className="font-cute text-3xl text-center mb-6 flex items-center justify-center gap-2">
                        <MessageSquare className="text-[#81D4FA]" size={28} /> Ucapan & Doa
                    </h2>

                    <div className="mb-8 border-b pb-8 border-gray-100">
                        {/* --- LOGIC KUNCI FORM DI SINI --- */}
                        {submittedData ? (
                            <div className="bg-[#F1F8E9] p-6 rounded-3xl border border-[#C5E1A5] text-center animate-fade-in-up">
                                <div className="w-16 h-16 bg-[#DCEDC8] rounded-full flex items-center justify-center mx-auto mb-4 text-[#558B2F]">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="font-cute text-xl text-[#33691E] mb-1">Terima Kasih!</h3>
                                <p className="font-body text-sm text-[#558B2F] mb-4">Anda sudah mengisi buku tamu.</p>

                                <div className="bg-white/50 p-4 rounded-xl text-left text-sm space-y-2">
                                    <div className="flex justify-between border-b border-[#DCEDC8] pb-2">
                                        <span className="text-gray-500">Nama:</span>
                                        <span className="font-bold text-[#33691E]">{submittedData.guest_name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[#DCEDC8] pb-2">
                                        <span className="text-gray-500">Kehadiran:</span>
                                        <span className="font-bold text-[#33691E] capitalize">{submittedData.status.replace('_', ' ')}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block mb-1">Pesan Anda:</span>
                                        <p className="italic text-[#33691E]">"{submittedData.message}"</p>
                                    </div>
                                </div>
                                {/* TOMBOL EDIT DIHAPUS TOTAL SESUAI REQUEST */}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-cute text-sm text-[#5D4037] ml-2 block mb-1">Nama</label>
                                        <input value={guestName} disabled className="w-full bg-gray-100 border-0 rounded-2xl p-3 text-sm text-gray-500 font-bold" />
                                    </div>
                                    <div>
                                        <label className="font-cute text-sm text-[#5D4037] ml-2 block mb-1">Kehadiran</label>
                                        <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)} className="w-full bg-[#F5F5F5] border-0 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-[#81D4FA] outline-none">
                                            <option value="hadir">Hadir</option>
                                            <option value="tidak_hadir">Maaf Tidak Bisa</option>
                                            <option value="ragu">Masih Ragu</option>
                                        </select>
                                    </div>
                                </div>
                                {rsvpStatus === 'hadir' && (
                                    <div>
                                        <label className="font-cute text-sm text-[#5D4037] ml-2 block mb-1">Jumlah (Pax)</label>
                                        <select value={rsvpPax} onChange={(e) => setRsvpPax(Number(e.target.value))} className="w-full bg-[#F5F5F5] border-0 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-[#81D4FA] outline-none">
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Orang</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="font-cute text-sm text-[#5D4037] ml-2 block mb-1">
                                        Pesan untuk Mempelai
                                    </label>

                                    <textarea
                                        required
                                        maxLength={100}  // <-- Tambahkan properti ini
                                        value={rsvpMessage}
                                        onChange={(e) => setRsvpMessage(e.target.value)}
                                        className="w-full bg-[#F5F5F5] border-0 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#81D4FA] outline-none h-24 placeholder:text-gray-400"
                                        placeholder="Tulis doa restu..."
                                    ></textarea>

                                    {/* Opsional: Teks penghitung karakter di bawah textarea */}
                                    <div className="text-right text-xs text-gray-400 mt-1 mr-2">
                                        {rsvpMessage.length}/100
                                    </div>
                                </div>
                                <button disabled={isSending} className="w-full bg-[#81D4FA] text-white font-cute font-bold py-3 rounded-2xl shadow-md hover:bg-[#4FC3F7] transition disabled:opacity-50 transform hover:-translate-y-1">
                                    {isSending ? 'Mengirim...' : 'Kirim Ucapan'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* DAFTAR KOMENTAR (DISCORD STYLE) */}
                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar mt-8">
                        {(data?.rsvps || []).length === 0 ? (
                            <div className="text-center py-8 opacity-50">
                                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm italic text-gray-400">Belum ada ucapan. Jadilah yang pertama!</p>
                            </div>
                        ) : (
                            (data?.rsvps || []).map((item, idx) => (
                                <div key={idx} className="group animate-fade-in-up">
                                    {/* KOMENTAR UTAMA */}
                                    <div className="flex gap-4 items-start">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#81D4FA] to-[#29B6F6] flex items-center justify-center shrink-0 text-white font-bold font-cute text-sm shadow-md hover:scale-110 transition cursor-pointer">
                                            {item.guest_name.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-[#5D4037] text-sm hover:underline cursor-pointer">
                                                    {item.guest_name}
                                                </span>

                                                {/* Badge Status */}
                                                <span className={`text-[10px] px-1.5 rounded text-white font-bold uppercase tracking-wider ${item.status === 'hadir' ? 'bg-[#66BB6A]' :
                                                        item.status === 'tidak_hadir' ? 'bg-[#EF5350]' : 'bg-[#FFCA28]'
                                                    }`}>
                                                    {item.status === 'hadir' ? 'Hadir' : item.status === 'tidak_hadir' ? 'Absen' : 'Ragu'}
                                                </span>

                                                <span className="text-[10px] text-gray-400 ml-auto">
                                                    {new Date(item.created_at || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(item.created_at || '').toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-body">
                                                {item.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* BALASAN ADMIN (THREAD STYLE) */}
                                    {item.reply && (
                                        <div className="flex mt-1">
                                            {/* Garis Siku (Thread Line) */}
                                            <div className="w-10 flex justify-end mr-4">
                                                <div className="w-5 h-6 border-l-2 border-b-2 border-gray-300 rounded-bl-xl"></div>
                                            </div>

                                            <div className="flex-1 flex gap-3 items-start pt-2 opacity-90">
                                                {/* Avatar Admin (Kecil) */}
                                                <div className="w-6 h-6 rounded-full bg-[#FFAB91] flex items-center justify-center shrink-0 text-white shadow-sm mt-1">
                                                    <Heart size={12} fill="white" />
                                                </div>

                                                <div className="flex-1 bg-[#FFF3E0]/50 p-2 rounded-lg -mt-1 hover:bg-[#FFF3E0] transition border border-transparent hover:border-[#FFAB91]/30">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="font-bold text-[#D84315] text-xs flex items-center gap-1">
                                                            {groom} & {bride} <Sparkles size={10} className="text-yellow-500" />
                                                        </span>
                                                        <span className="text-[9px] text-[#D84315]/60 bg-[#FFAB91]/20 px-1 rounded">OWNER</span>
                                                    </div>
                                                    <p className="text-[#5D4037] text-xs leading-relaxed">
                                                        {item.reply}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* 6. GIFT (GIFT BOX) */}
                <section className="bg-white rounded-[3rem] p-8 text-center shadow-lg relative mt-12">

                    {/* Dekorasi Garis Atas (Rounded T disesuaikan manual karena overflow visible) */}
                    <div className="absolute top-0 left-0 w-full h-4 bg-[#FFAB91] rounded-t-[3rem]"></div>

                    {/* Icon Kado - Posisi Absolute di Tengah Garis */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#FFAB91] rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10">
                        <Gift size={32} className="text-white" />
                    </div>

                    {/* Cappuccino & Espresso berjaga di sisi kado */}
                    <motion.img
                        src={CINNA_CREW.cappuccino}
                        alt="Cappuccino"
                        className="absolute top-2 left-4 w-14 h-14 rounded-full border-4 border-white bg-white object-cover shadow-md"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.img
                        src={CINNA_CREW.espresso}
                        alt="Espresso"
                        className="absolute top-2 right-4 w-14 h-14 rounded-full border-4 border-white bg-white object-cover shadow-md"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
                    />

                    {/* Wrapper Konten (Margin Top agar tidak tertutup Icon) */}
                    <div className="mt-6">
                        <h2 className="font-cute text-2xl mb-2">Wedding Gift</h2>
                        <p className="font-body text-xs text-[#8D6E63] mb-6">
                            Your presence is the greatest gift. If you wish to send a token of love:
                        </p>

                        <div className="space-y-3">
                            {banks.map((bank, i) => (
                                <div key={i} className="bg-[#F5F5F5] rounded-2xl p-4 text-left flex justify-between items-center">
                                    <div>
                                        <p className="font-cute text-lg text-[#5D4037]">{bank.bank}</p>
                                        <p className="font-body text-sm text-[#8D6E63]">{bank.number}</p>
                                        <p className="font-body text-xs text-[#BCAAA4] uppercase">a.n {bank.name}</p>
                                    </div>
                                    <button onClick={() => copyRek(bank.number)} className="bg-[#FFCCBC] p-2 rounded-full text-white hover:bg-[#FFAB91] transition">
                                        <Copy size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. GALLERY */}
                {gallery.length > 0 && (
                    <section>
                        <h2 className="font-cute text-3xl text-center mb-8">Our Moments 📸</h2>
                        <div className="grid grid-cols-2 gap-4 px-2">
                            {gallery.map((url, i) => (
                                <div key={i} className={`rounded-3xl overflow-hidden border-4 border-white shadow-md transform transition hover:scale-105 bg-white ${i % 2 === 0 ? 'rotate-2' : '-rotate-2'}`}>
                                    <img src={url} className="w-full h-40 object-cover" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 8. CLOSING */}
                <footer className="text-center py-12 relative">
                    <Cloud size={100} className="mx-auto text-white fill-white drop-shadow-sm opacity-60 mb-4 animate-pulse" />
                    {/* Seluruh crew berbaris pamit */}
                    <div className="mb-6 flex items-end justify-center gap-3">
                        {[
                            { src: CINNA_CREW.cinnamoroll, size: 'w-16 h-16', delay: 0 },
                            { src: CINNA_CREW.mocha, size: 'w-14 h-14', delay: 0.4 },
                            { src: CINNA_CREW.chiffon, size: 'w-14 h-14', delay: 0.8 },
                            { src: CINNA_CREW.espresso, size: 'w-12 h-12', delay: 1.2 },
                            { src: CINNA_CREW.cappuccino, size: 'w-12 h-12', delay: 1.6 },
                        ].map((c, i) => (
                            <motion.img
                                key={i}
                                src={c.src}
                                alt="Karakter Cinnamoroll"
                                className={`${c.size} rounded-full border-4 border-white bg-white object-cover shadow-md`}
                                animate={{ y: [0, -12, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
                                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}
                            />
                        ))}
                    </div>
                    <h2 className="font-cute text-3xl text-[#5D4037] relative z-10">{groom} & {bride}</h2>
                    <p className="font-body text-sm text-[#8D6E63] relative z-10">Thank you for everything! ❤️</p>
                </footer>

            </div>

            {/* AUDIO BUTTON */}
            <button onClick={toggleAudio} className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#81D4FA] hover:scale-110 transition border-2 border-[#E1F5FE]">
                {isPlaying ? <Music size={20} className="animate-spin" /> : <Play size={20} />}
            </button>
            <audio ref={audioRef} src={audioUrl} loop />
        </div>
    );
}

// SUB COMPONENT
function TimeBox({ val, label, color }: { val: number; label: string; color: string }) {
    return (
        <div className={`${color} w-16 h-20 rounded-2xl flex flex-col items-center justify-center shadow-sm transform hover:-translate-y-1 transition`}>
            <span className="font-cute text-2xl text-[#5D4037] leading-none">{val}</span>
            <span className="font-body text-[10px] text-[#8D6E63]">{label}</span>
        </div>
    )
}