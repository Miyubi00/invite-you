import { useState, useRef, useEffect } from 'react';
import {
    Heart, Calendar, MapPin, Play, Pause, Gift,
    Copy, Music, Flower, ArrowDown, Share2
} from 'lucide-react';

export default function SakuraTheme({ groom, bride, date, guestName, data }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const audioUrl = data?.audio_url || '';


    // --- COUNTDOWN STATE ---
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // --- DATA ---
    const defaultImages = {
        cover: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&auto=format&fit=crop", // Sakura/Pink vibe
        man: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop",
        woman: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop",
    };

    const photos = {
        cover: data?.cover_photo || defaultImages.cover,
        groom: data?.groom_photo || defaultImages.man,
        bride: data?.bride_photo || defaultImages.woman,
    };

    const gallery = data?.gallery || [];
    const banks = data?.banks || [];

    const formattedDate = new Date(date || new Date()).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    // --- COUNTDOWN LOGIC ---
    useEffect(() => {
        const targetDateStr = new Date(date || new Date()).toISOString().split('T')[0];
        const targetTimeStr = (data?.akad_time || "08:00").split(' ')[0].substring(0, 5);
        const targetDateTime = new Date(`${targetDateStr}T${targetTimeStr}:00`);

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDateTime - now;
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else { clearInterval(interval); }
        }, 1000);
        return () => clearInterval(interval);
    }, [date, data?.akad_time]);

    // --- AUDIO ---
    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
            setIsPlaying(true);
        }
    };

    const openInvitation = () => {
        setIsOpen(true);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
            }
        }, 800);
    };

    return (
        // MAIN CONTAINER: Soft Pink
        <div className="bg-[#fff0f3] text-[#4a4a4a] min-h-screen relative overflow-x-hidden selection:bg-[#db2777] selection:text-white">

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;600&display=swap');
        
        .font-serif-mod { font-family: 'Bodoni Moda', serif; }
        .font-sans-mod { font-family: 'Montserrat', sans-serif; }
        
        /* Animasi Sakura Jatuh */
        @keyframes petal-fall {
            0% { opacity: 0; transform: translateY(-10vh) translateX(0px) rotate(0deg); }
            10% { opacity: 1; }
            100% { opacity: 0; transform: translateY(100vh) translateX(100px) rotate(360deg); }
        }
        .petal {
            position: fixed; top: -10%; z-index: 0;
            background: #ffccd5; opacity: 0;
            border-radius: 100% 0 100% 0;
            animation: petal-fall linear infinite;
        }
        
        /* Smooth Fade In */
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade { animation: fadeIn 1s ease-out forwards; }
      `}</style>

            {/* --- SAKURA PETALS BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="petal" style={{
                        left: `${Math.random() * 100}%`,
                        width: `${Math.random() * 10 + 10}px`,
                        height: `${Math.random() * 10 + 10}px`,
                        animationDuration: `${Math.random() * 5 + 8}s`,
                        animationDelay: `${Math.random() * 5}s`
                    }}></div>
                ))}
            </div>

            {/* --- OPENING MODAL (Pink Curtain) --- */}
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#fff0f3] to-[#ffe3e8] transition-transform duration-[1.5s] ease-in-out ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
                <div className="bg-white/60 backdrop-blur-md p-10 md:p-14 rounded-[3rem] shadow-xl text-center border border-white max-w-sm w-full relative overflow-hidden">
                    {/* Decorative Circle */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ffb3c1]/30 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#ffb3c1]/30 rounded-full blur-2xl"></div>

                    <div className="mb-6 animate-pulse">
                        <Flower className="w-10 h-10 mx-auto text-[#db2777]" strokeWidth={1.5} />
                    </div>

                    <p className="font-sans-mod text-xs tracking-[0.3em] uppercase mb-4 text-[#888]">The Wedding Of</p>
                    <h1 className="font-serif-mod text-5xl text-[#db2777] mb-8 italic">{groom} <br /><span className="text-3xl text-gray-400">&</span> {bride}</h1>

                    <div className="bg-white/80 p-4 rounded-xl mb-8 shadow-sm">
                        <p className="font-sans-mod text-[10px] tracking-widest text-gray-500 mb-2 uppercase">Kepada Bapak/Ibu/Saudara/i:</p>
                        <h3 className="font-serif-mod text-xl font-bold text-[#333]">{guestName || "Tamu Undangan"}</h3>
                    </div>

                    <button onClick={openInvitation} className="bg-[#db2777] text-white px-8 py-3 rounded-full font-sans-mod text-sm font-bold shadow-lg shadow-pink-300 hover:bg-[#be185d] transition-all hover:scale-105 flex items-center gap-2 mx-auto">
                        <Gift size={16} /> Buka Undangan
                    </button>
                </div>
            </div>

            {/* --- CONTENT WRAPPER --- */}
            <div className={`transition-opacity duration-1000 delay-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

                {/* 1. HERO HEADER */}
                <header className="min-h-screen relative flex flex-col justify-end pb-20 px-6 overflow-hidden">
                    {/* Background Image Parallax */}
                    <div className="absolute inset-0 z-0 opacity-90">
                        <img src={photos.cover} className="w-full h-full object-cover" alt="Cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#fff0f3] via-[#fff0f3]/60 to-transparent"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto w-full text-center md:text-left">
                        <div className="inline-block bg-white/50 backdrop-blur-sm px-4 py-1 rounded-full mb-4 border border-white">
                            <p className="font-sans-mod text-xs font-bold tracking-widest text-[#db2777]">SAVE THE DATE</p>
                        </div>
                        <h1 className="font-serif-mod text-7xl md:text-9xl text-[#831843] leading-none mb-4">
                            {groom} <span className="text-4xl text-gray-400 font-light italic">&</span> <br /> {bride}
                        </h1>
                        <p className="font-sans-mod text-gray-600 text-lg md:text-xl border-l-4 border-[#db2777] pl-4 md:ml-2 mt-4">
                            {formattedDate}
                        </p>
                        <div className="mt-12 flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 max-w-4xl mx-auto w-full">
                            <TimeBlock val={timeLeft.days} label="Days" />
                            <TimeBlock val={timeLeft.hours} label="Hours" />
                            <TimeBlock val={timeLeft.minutes} label="Mins" />
                            <TimeBlock val={timeLeft.seconds} label="Secs" />
                        </div>
                    </div>

                    {/* COUNTDOWN */}

                </header>

                {/* 2. QUOTE (Minimalist) */}
                <section className="py-24 px-6 bg-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-bl-full opacity-50 z-0"></div>
                    <div className="max-w-2xl mx-auto text-center relative z-10">
                        <Heart className="w-8 h-8 mx-auto text-[#db2777] mb-6 fill-pink-100" />
                        <p className="font-serif-mod text-xl md:text-2xl text-gray-700 italic leading-loose">
                            "{data?.quote || "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri."}"
                        </p>
                        <p className="mt-6 font-sans-mod font-bold text-xs tracking-[0.2em] text-[#db2777] uppercase">
                            — {data?.quote_src || "QS. Ar-Rum: 21"}
                        </p>
                    </div>
                </section>

                {/* 3. COUPLE (Asymmetrical Layout) */}
                <section className="py-20 px-4 overflow-hidden">
                    <div className="max-w-5xl mx-auto space-y-20">

                        {/* Groom Row */}
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="w-full md:w-1/2 relative group">
                                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl shadow-pink-100 relative z-10">
                                    <img src={photos.groom} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt="Groom" />
                                </div>
                                {/* Decorative Box */}
                                <div className="absolute -bottom-4 -left-4 w-full h-full border-2 border-[#db2777] rounded-[2rem] z-0"></div>
                            </div>
                            <div className="w-full md:w-1/2 text-center md:text-left">
                                <h2 className="font-serif-mod text-5xl text-[#831843] mb-2">{groom}</h2>
                                <p className="font-sans-mod text-sm text-[#db2777] font-bold tracking-widest mb-4">THE GROOM</p>
                                <p className="font-sans-mod text-gray-600 leading-relaxed mb-6">
                                    Putra tercinta dari pasangan <br />
                                    <span className="font-bold">{data?.groom_parents}</span>
                                </p>
                            </div>
                        </div>

                        {/* Bride Row */}
                        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
                            <div className="w-full md:w-1/2 relative group">
                                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl shadow-pink-100 relative z-10">
                                    <img src={photos.bride} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt="Bride" />
                                </div>
                                {/* Decorative Box */}
                                <div className="absolute -top-4 -right-4 w-full h-full border-2 border-[#db2777] rounded-[2rem] z-0"></div>
                            </div>
                            <div className="w-full md:w-1/2 text-center md:text-right">
                                <h2 className="font-serif-mod text-5xl text-[#831843] mb-2">{bride}</h2>
                                <p className="font-sans-mod text-sm text-[#db2777] font-bold tracking-widest mb-4">THE BRIDE</p>
                                <p className="font-sans-mod text-gray-600 leading-relaxed mb-6">
                                    Putri tercinta dari pasangan <br />
                                    <span className="font-bold">{data?.bride_parents}</span>
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* 4. EVENTS (Timeline Style - Fixed Mobile Layout) */}
                <section className="py-24 px-4 bg-white relative overflow-hidden">
                    {/* Dekorasi Background */}
                    <div className="absolute top-1/2 left-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl -z-10 opacity-60"></div>

                    <div className="max-w-4xl mx-auto relative">
                        <h2 className="text-center font-serif-mod text-4xl text-[#831843] mb-16">Wedding Itinerary</h2>

                        {/* GARIS VERTIKAL (Responsive Position) 
                    Mobile: left-6 (rata kiri)
                    Desktop: left-1/2 (tengah)
                */}
                        <div className="absolute left-6 md:left-1/2 top-24 bottom-0 w-px bg-gradient-to-b from-[#db2777] to-transparent"></div>

                        <div className="space-y-12">

                            {/* --- ITEM 1: AKAD NIKAH --- */}
                            <div className="relative flex flex-col md:flex-row items-start md:items-center w-full">

                                {/* TITIK (DOT) 
                           Mobile: left-6 (nempel garis kiri)
                           Desktop: left-1/2 (tengah)
                        */}
                                <div className="absolute left-6 md:left-1/2 w-4 h-4 -translate-x-1/2 bg-[#db2777] rounded-full z-20 ring-4 ring-white shadow-md mt-6 md:mt-0"></div>

                                {/* CONTENT KIRI (Desktop) / KANAN (Mobile) */}
                                <div className="w-full md:w-1/2 md:pr-12 pl-16 md:pl-0">
                                    <div className="bg-[#fff0f3] p-6 rounded-2xl rounded-tl-none border border-pink-100 shadow-sm relative hover:-translate-y-1 transition duration-300">
                                        {/* Arrow Pointer untuk Mobile */}
                                        <div className="absolute top-6 -left-2 w-4 h-4 bg-[#fff0f3] transform rotate-45 border-l border-b border-pink-100 block md:hidden"></div>
                                        {/* Arrow Pointer untuk Desktop */}
                                        <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#fff0f3] transform -translate-y-1/2 -rotate-45 border-r border-b border-pink-100 hidden md:block"></div>

                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-serif-mod text-xl md:text-2xl font-bold text-[#db2777]">Akad Nikah</h3>
                                            <span className="bg-white text-[#db2777] text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-pink-100">
                                                {data?.akad_time}
                                            </span>
                                        </div>

                                        <div className="text-sm text-gray-600 space-y-2">
                                            <p className="flex items-center gap-2"><Calendar size={14} className="text-[#db2777]" /> {formattedDate}</p>
                                            <p className="flex items-start gap-2">
                                                <MapPin
                                                    size={14}
                                                    className="text-[#831843] mt-1 shrink-0"
                                                />
                                                <span className="flex flex-col">
                                                    <span className="font-medium">
                                                        {data?.venue_name}
                                                    </span>
                                                    <span className="text-sm opacity-80">
                                                        {data?.venue_address}
                                                    </span>
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* SPACE KOSONG UNTUK DESKTOP (Agar seimbang) */}
                                <div className="hidden md:block w-1/2"></div>
                            </div>


                            {/* --- ITEM 2: RESEPSI --- */}
                            <div className="relative flex flex-col md:flex-row items-start md:items-center w-full">

                                {/* TITIK (DOT) */}
                                <div className="absolute left-6 md:left-1/2 w-4 h-4 -translate-x-1/2 bg-white border-[3px] border-[#831843] rounded-full z-20 shadow-md mt-6 md:mt-0"></div>

                                {/* SPACE KOSONG UNTUK DESKTOP */}
                                <div className="hidden md:block w-1/2"></div>

                                {/* CONTENT KANAN (Desktop) / KANAN (Mobile) */}
                                <div className="w-full md:w-1/2 md:pl-12 pl-16 md:pr-0">
                                    <div className="bg-white p-6 rounded-2xl rounded-tl-none md:rounded-tl-2xl md:rounded-tr-none border border-gray-200 shadow-lg shadow-pink-50 relative hover:-translate-y-1 transition duration-300">
                                        {/* Arrow Pointer untuk Mobile */}
                                        <div className="absolute top-6 -left-2 w-4 h-4 bg-white transform rotate-45 border-l border-b border-gray-200 block md:hidden"></div>
                                        {/* Arrow Pointer untuk Desktop */}
                                        <div className="absolute top-1/2 -left-2 w-4 h-4 bg-white transform -translate-y-1/2 rotate-45 border-l border-b border-gray-200 hidden md:block"></div>

                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-serif-mod text-xl md:text-2xl font-bold text-[#831843]">Resepsi</h3>
                                            <span className="bg-[#831843] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                                {data?.resepsi_time}
                                            </span>
                                        </div>

                                        <div className="text-sm text-gray-600 space-y-2">
                                            <p className="flex items-center gap-2"><Calendar size={14} className="text-[#831843]" /> {formattedDate}</p>
                                            <p className="flex items-start gap-2">
                                                <MapPin
                                                    size={14}
                                                    className="text-[#831843] mt-1 shrink-0"
                                                />
                                                <span className="flex flex-col">
                                                    <span className="font-medium">
                                                        {data?.venue_name}
                                                    </span>
                                                    <span className="text-sm opacity-80">
                                                        {data?.venue_address}
                                                    </span>
                                                </span>
                                            </p>
                                        </div>

                                        <a href={data?.maps_link} target="_blank" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#db2777] border-b border-[#db2777] pb-0.5 hover:text-[#831843] transition">
                                            LIHAT LOKASI <ArrowDown size={10} className="-rotate-90" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 5. GALLERY (Horizontal Scroll / Carousel Feel) */}
                {gallery.length > 0 && (
                    <section className="py-20 bg-[#fff0f3] overflow-hidden">
                        <div className="text-center mb-10">
                            <h2 className="font-serif-mod text-4xl text-[#831843]">Captured Moments</h2>
                        </div>

                        <div className="flex overflow-x-auto pb-8 gap-4 px-6 md:justify-center no-scrollbar snap-x">
                            {gallery.map((url, i) => (
                                <div key={i} className="flex-shrink-0 w-72 h-96 relative snap-center group">
                                    <div className="w-full h-full bg-white p-3 shadow-lg rounded-xl rotate-0 group-hover:-rotate-2 transition duration-300">
                                        <img src={url} className="w-full h-[85%] object-cover rounded-lg mb-2" alt="Moment" />
                                        <p className="font-serif-mod text-center text-gray-400 italic text-sm">#{groom}and{bride}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 6. GIFT */}
                <section className="py-24 px-4 bg-white">
                    <div className="max-w-2xl mx-auto text-center bg-gradient-to-b from-white to-[#fff0f3] p-10 rounded-[3rem] border border-pink-100 shadow-xl shadow-pink-50">
                        <Gift className="w-12 h-12 mx-auto text-[#db2777] mb-4" />
                        <h2 className="font-serif-mod text-3xl text-[#831843] mb-4">Wedding Gift</h2>
                        <p className="font-sans-mod text-sm text-gray-500 mb-8 max-w-md mx-auto">
                            Tanpa mengurangi rasa hormat, bagi Anda yang ingin memberikan tanda kasih, dapat melalui:
                        </p>

                        <div className="grid gap-4">
                            {banks.map((bank, i) => (
                                <div key={i} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="text-left">
                                        <span className="block font-bold text-[#db2777] text-sm">{bank.bank}</span>
                                        <span className="text-xs text-gray-400">a.n {bank.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-gray-700">{bank.number}</span>
                                        <button onClick={() => { navigator.clipboard.writeText(bank.number); alert("Copied!") }} className="p-2 bg-pink-50 rounded-full hover:bg-pink-100 text-[#db2777] transition">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="py-10 text-center bg-[#fff0f3]">
                    <h2 className="font-serif-mod text-2xl text-[#831843] opacity-60">{groom} & {bride}</h2>
                    <p className="font-sans-mod text-xs text-gray-400 mt-2">Terima kasih atas doa restu Anda.</p>
                </footer>

            </div>

            {/* AUDIO PLAYER */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={toggleAudio}
                    className={`w-12 h-12 rounded-full flex items-center justify-center bg-white text-[#db2777] shadow-lg border border-pink-100 transition-transform hover:scale-110 ${isPlaying ? 'animate-spin-slow' : ''}`}
                >
                    {isPlaying ? <Music size={20} /> : <Play size={20} className="ml-1" />}
                </button>
            </div>

            {audioUrl && <audio ref={audioRef} src={audioUrl} loop />}

        </div>
    );
}

// Simple Components
function TimeBlock({ val, label }) {
    return (
        <div className="text-center">
            <div className="font-serif-mod text-4xl md:text-5xl text-[#db2777] font-bold">
                {String(val).padStart(2, '0')}
            </div>
            <div className="font-sans-mod text-[10px] md:text-xs text-gray-400 tracking-widest uppercase mt-1">
                {label}
            </div>
        </div>
    )
}
