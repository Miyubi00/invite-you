import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, MapPin, Heart, Copy, Calendar, Music, ArrowDown, ExternalLink } from 'lucide-react';

export default function ElegantBotanicalTheme({ groom, bride, date, guestName, data }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const audioUrl = data?.audio_url || '';


    // --- DATA HANDLING ---
    const defaultImages = {
        cover: "https://images.unsplash.com/photo-1606103920295-97f88c0693a6?q=80&w=800&auto=format&fit=crop", // Green/Leafy
        man: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop",
        woman: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop",
    };

    const photos = {
        cover: data?.cover_photo || defaultImages.cover,
        groom: data?.groom_photo || defaultImages.man,
        bride: data?.bride_photo || defaultImages.woman,
    };

    const gallery = data?.gallery || [
        "https://images.unsplash.com/photo-1520854221256-17451cc330e7?w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1623771987514-6c71c496d004?w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1621621667797-e06afc217fb0?w=500&auto=format&fit=crop"
    ];

    const banks = data?.banks || [];

    const formattedDate = new Date(date || new Date()).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

   // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(date || new Date());
    const interval = setInterval(() => {
        const now = new Date();
        const diff = targetDate - now;
        
        if (diff > 0) {
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            });
        } else {
            clearInterval(interval);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

    // --- AUDIO LOGIC ---
    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.log("Audio autoplay blocked", e));
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        if (isOpen && audioRef.current) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    }, [isOpen]);

    return (
        // MAIN CONTAINER: Sage Green & Gold Palette
        <div className="bg-[#F0F4F1] text-[#1A3C34] min-h-screen relative overflow-x-hidden selection:bg-[#C5A059] selection:text-white">

            {/* --- FONTS & CSS --- */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        
        .font-heading { font-family: 'Playfair Display', serif; }
        .font-accent { font-family: 'Cinzel', serif; }
        .font-body { font-family: 'Lato', sans-serif; }
        
        /* Smooth Scroll */
        html { scroll-behavior: smooth; }

        /* Custom Animations */
        @keyframes fadeUp {
           from { opacity: 0; transform: translateY(30px); }
           to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 1.2s ease-out forwards; }
        
        .arch-mask {
            border-radius: 200px 200px 0 0;
        }
      `}</style>

            {/* --- OPENING COVER (MODAL) --- */}
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1A3C34] text-[#F0F4F1] transition-all duration-1000 ease-in-out ${isOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>

                {/* Background Image with Overlay */}
                <div className="absolute inset-0 opacity-30">
                    <img src={photos.cover} className="w-full h-full object-cover" alt="Cover" />
                </div>

                <div className="relative z-10 text-center p-8 max-w-md w-full border border-[#C5A059]/30 backdrop-blur-sm rounded-t-full pt-20 pb-10 bg-[#1A3C34]/40">
                    <div className="mb-6 animate-pulse">
                        <Heart className="w-8 h-8 mx-auto text-[#C5A059] fill-[#C5A059]" />
                    </div>

                    <p className="font-accent tracking-[0.3em] text-xs mb-4 text-[#C5A059]">The Wedding Celebration</p>
                    <h1 className="font-heading text-5xl md:text-6xl mb-6">{groom} <br /><span className="text-3xl italic">&</span><br /> {bride}</h1>

                    <div className="w-16 h-[1px] bg-[#C5A059] mx-auto mb-8"></div>

                    <div className="bg-[#F0F4F1]/10 p-6 rounded-lg backdrop-blur-md border border-white/10 mb-8">
                        <p className="font-body text-xs tracking-wider mb-2">KEPADA YTH:</p>
                        <h3 className="font-heading text-xl font-bold text-white capitalize">{guestName || "Tamu Undangan"}</h3>
                    </div>

                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-[#C5A059] hover:bg-[#b08d4b] text-white px-10 py-3 rounded-full font-body text-sm font-bold tracking-widest transition-all shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                    >
                        BUKA UNDANGAN
                    </button>
                </div>
            </div>

            {/* --- CONTENT WRAPPER --- */}
            <div className={`transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

                {/* 1. HERO SECTION (Full Height) */}
        <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src={photos.cover} className="w-full h-full object-cover" alt="Hero" />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A3C34] via-[#1A3C34]/40 to-transparent"></div>
            </div>

            <div className="relative z-10 text-[#F0F4F1] px-6 animate-fade-up mt-20">
                <p className="font-accent text-sm tracking-[0.4em] mb-4 text-[#C5A059]">WE ARE GETTING MARRIED</p>
                <h1 className="font-heading text-6xl md:text-8xl leading-tight drop-shadow-lg">
                    {groom} <span className="block text-4xl my-2 text-[#C5A059] font-serif italic">and</span> {bride}
                </h1>
                
                <div className="mt-8 border-y border-[#C5A059]/50 py-6 inline-block backdrop-blur-[2px] px-8">
                    <p className="font-body text-lg tracking-wide mb-4">
                        {formattedDate}
                    </p>

                    {/* --- COUNTDOWN ADDED HERE --- */}
                    <div className="flex gap-6 md:gap-10 justify-center">
                        <div className="flex flex-col items-center">
                            <span className="font-heading text-3xl md:text-4xl">{String(timeLeft.days).padStart(2, '0')}</span>
                            <span className="text-[10px] tracking-widest uppercase text-[#C5A059] font-body mt-1">Days</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-heading text-3xl md:text-4xl">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="text-[10px] tracking-widest uppercase text-[#C5A059] font-body mt-1">Hours</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-heading text-3xl md:text-4xl">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="text-[10px] tracking-widest uppercase text-[#C5A059] font-body mt-1">Mins</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-heading text-3xl md:text-4xl">{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <span className="text-[10px] tracking-widest uppercase text-[#C5A059] font-body mt-1">Secs</span>
                        </div>
                    </div>
                    {/* ---------------------------- */}
                </div>
            </div>

            <div className="absolute bottom-8 animate-bounce text-[#F0F4F1]">
                <ArrowDown size={24} className="opacity-70" />
            </div>
        </section>

                {/* 2. QUOTE (Clean & Minimal) */}
                <section className="py-20 px-6 bg-white text-center">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-[#C5A059] text-6xl font-heading mb-4">“</div>
                        <p className="font-heading text-xl md:text-2xl text-[#1A3C34] italic leading-relaxed">
                            {data?.quote || "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya."}
                        </p>
                        <div className="w-12 h-1 bg-[#C5A059] mx-auto mt-8 mb-4"></div>
                        <p className="font-body text-xs font-bold tracking-widest text-gray-500 uppercase">{data?.quote_src || "QS. AR-RUM: 21"}</p>
                    </div>
                </section>

                {/* 3. COUPLE (Arch Layout) */}
                <section className="py-24 px-4 bg-[#E3E9E4]">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-center font-accent text-3xl md:text-4xl text-[#1A3C34] mb-16 tracking-widest">THE COUPLE</h2>

                        <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24">

                            {/* Groom */}
                            <div className="text-center group w-full max-w-sm">
                                <div className="relative mb-6 overflow-hidden arch-mask shadow-2xl border-4 border-white transition-transform duration-500 hover:-translate-y-2">
                                    <div className="aspect-[3/4]">
                                        <img src={photos.groom} alt="Groom" className="w-full h-full object-cover hover:scale-110 transition duration-700" />
                                    </div>
                                </div>
                                <h3 className="font-heading text-3xl font-bold text-[#1A3C34]">{groom}</h3>
                                <p className="font-body text-sm text-[#C5A059] mt-2 font-bold uppercase">Putra dari</p>
                                <p className="font-body text-sm text-gray-600 mt-2 px-4 leading-relaxed">{data?.groom_parents}</p>
                            </div>

                            <div className="hidden md:block text-[#C5A059] font-heading text-6xl italic">&</div>

                            {/* Bride */}
                            <div className="text-center group w-full max-w-sm">
                                <div className="relative mb-6 overflow-hidden arch-mask shadow-2xl border-4 border-white transition-transform duration-500 hover:-translate-y-2">
                                    <div className="aspect-[3/4]">
                                        <img src={photos.bride} alt="Bride" className="w-full h-full object-cover hover:scale-110 transition duration-700" />
                                    </div>
                                </div>
                                <h3 className="font-heading text-3xl font-bold text-[#1A3C34]">{bride}</h3>
                                <p className="font-body text-sm text-[#C5A059] mt-2 font-bold uppercase">Putri dari</p>
                                <p className="font-body text-sm text-gray-600 mt-2 px-4 leading-relaxed">{data?.bride_parents}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. EVENTS (Cards with Gold Accents) */}
                <section className="py-24 px-4 bg-[#1A3C34] text-[#F0F4F1] relative">
                    {/* Decoration Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #C5A059 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                    <div className="max-w-4xl mx-auto relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="font-accent text-3xl md:text-4xl mb-4 tracking-widest text-[#C5A059]">SAVE THE DATE</h2>
                            <p className="font-heading italic text-xl">We hope you can join us in celebrating our love</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Akad Card */}
                            <div className="bg-[#F0F4F1] text-[#1A3C34] p-8 md:p-10 rounded-sm shadow-xl text-center border-t-8 border-[#C5A059]">
                                <h3 className="font-heading text-3xl font-bold mb-6">Akad Nikah</h3>
                                <div className="space-y-4 font-body text-sm md:text-base">
                                    <div className="flex flex-col items-center">
                                        <Calendar className="w-6 h-6 text-[#C5A059] mb-2" />
                                        <span className="font-bold uppercase tracking-wider">{formattedDate}</span>
                                    </div>
                                    <div className="w-full h-[1px] bg-gray-200"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-lg">{data?.akad_time}</span>
                                    </div>
                                    <div className="flex flex-col items-center text-gray-600 px-4">
                                        <MapPin className="w-5 h-5 mb-1 text-[#C5A059]" />
                                        <div className="flex flex-col">
                                            <span>{data?.venue_name}</span>
                                            <span className="text-sm opacity-80">
                                                {data?.venue_address}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Resepsi Card */}
                            <div className="bg-[#132c26] border border-[#C5A059]/30 text-[#F0F4F1] p-8 md:p-10 rounded-sm shadow-xl text-center relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#C5A059]/20 rounded-full blur-xl"></div>

                                <h3 className="font-heading text-3xl font-bold mb-6 text-[#C5A059]">Resepsi</h3>
                                <div className="space-y-4 font-body text-sm md:text-base">
                                    <div className="flex flex-col items-center">
                                        <Calendar className="w-6 h-6 text-[#C5A059] mb-2" />
                                        <span className="font-bold uppercase tracking-wider">{formattedDate}</span>
                                    </div>
                                    <div className="w-full h-[1px] bg-white/10"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-lg">{data?.resepsi_time}</span>
                                    </div>
                                    <div className="flex flex-col items-center text-gray-300 px-4">
                                        <MapPin className="w-5 h-5 mb-1 text-[#C5A059]" />
                                        <div className="flex flex-col">
                                            <span>{data?.venue_name}</span>
                                            <span className="text-sm opacity-80">
                                                {data?.venue_address}
                                            </span>
                                        </div>
                                    </div>

                                    <a href={data?.maps_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-6 text-[#C5A059] hover:text-white border border-[#C5A059] hover:bg-[#C5A059] px-6 py-2 rounded transition-all text-xs font-bold uppercase tracking-widest">
                                        <MapPin size={14} /> Google Maps
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. GALLERY (Modern Grid) */}
                <section className="py-24 px-4 bg-white">
                    <h2 className="text-center font-accent text-3xl text-[#1A3C34] mb-12 tracking-widest">OUR MOMENTS</h2>

                    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                        {gallery.map((img, i) => (
                            <div key={i} className={`group relative overflow-hidden rounded-lg shadow-md cursor-pointer ${i === 0 || i === 3 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                                <img
                                    src={img}
                                    alt={`Gallery ${i}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    style={{ minHeight: '200px' }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <Heart className="text-white fill-white animate-bounce" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. GIFT (Minimalist Accordion Style Box) */}
                <section className="py-24 px-6 bg-[#F0F4F1]">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-[#C5A059]/20">
                            <h2 className="font-heading text-3xl font-bold text-[#1A3C34] mb-4">Wedding Gift</h2>
                            <p className="font-body text-gray-500 text-sm mb-10 max-w-md mx-auto">
                                Tanpa mengurangi rasa hormat, bagi Anda yang ingin memberikan tanda kasih untuk kami, dapat melalui:
                            </p>

                            <div className="grid gap-6 md:grid-cols-2">
                                {banks.map((bank, i) => (
                                    <div key={i} className="group relative bg-[#F9FAFB] p-6 rounded-xl border border-gray-200 hover:border-[#C5A059] transition-all duration-300 text-left">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-bold text-lg text-[#1A3C34]">{bank.bank}</h4>
                                            <div className="p-2 bg-[#C5A059]/10 rounded-full text-[#C5A059]">
                                                <ExternalLink size={16} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-mono text-xl text-gray-700 tracking-wide">{bank.number}</p>
                                            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">a.n {bank.name}</p>
                                        </div>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(bank.number)}
                                            className="mt-4 text-xs font-bold text-[#C5A059] flex items-center gap-1 hover:underline"
                                        >
                                            <Copy size={12} /> SALIN NOMOR
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="bg-[#1A3C34] text-[#8faaa5] py-16 text-center">
                    <h2 className="font-heading text-4xl text-[#F0F4F1] mb-6">{groom} & {bride}</h2>
                    <p className="font-body text-xs tracking-[0.2em] uppercase mb-8">Thank you for your prayers</p>
                    <div className="flex justify-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-[#C5A059]"></div>
                        <div className="w-2 h-2 rounded-full bg-[#C5A059] opacity-50"></div>
                        <div className="w-2 h-2 rounded-full bg-[#C5A059] opacity-25"></div>
                    </div>
                </footer>

            </div>

            {/* FLOATING MUSIC PLAYER (Pill Shape) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <button
                    onClick={toggleAudio}
                    className="flex items-center gap-3 bg-[#1A3C34]/90 backdrop-blur-md text-[#F0F4F1] pl-4 pr-5 py-3 rounded-full shadow-2xl border border-[#C5A059]/30 hover:scale-105 transition-transform"
                >
                    <div className={`w-2 h-2 rounded-full bg-[#C5A059] ${isPlaying ? 'animate-pulse' : ''}`}></div>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    <span className="font-body text-xs font-bold tracking-widest">{isPlaying ? "PLAYING" : "PAUSED"}</span>
                </button>
            </div>

             {audioUrl && <audio ref={audioRef} src={audioUrl} loop />}
        </div>
    );
}