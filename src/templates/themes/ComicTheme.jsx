import { useState, useRef, useEffect } from 'react';
import {
    Heart, MapPin, Calendar, Clock, Copy,
    Music, Play, Pause, ChevronDown, Zap, Send
} from 'lucide-react';

export default function ComicTheme({ groom, bride, date, guestName, data }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    // --- COUNTDOWN STATE ---
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // --- DATA ---
    const photos = {
        cover: data?.cover_photo || "https://images.unsplash.com/photo-1541250863847-10de39255f9d?w=800&fit=crop",
        groom: data?.groom_photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&fit=crop",
        bride: data?.bride_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop",
    };

    const gallery = data?.gallery || [
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&fit=crop",
        "https://images.unsplash.com/photo-1511285560982-1356c11d4606?w=500&fit=crop",
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&fit=crop",
        "https://images.unsplash.com/photo-1522673607200-1645062cd958?w=500&fit=crop"
    ];

    const banks = data?.banks || [];

    const formattedDate = new Date(date || new Date()).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    // --- COUNTDOWN LOGIC ---
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
            } else { clearInterval(interval); }
        }, 1000);
        return () => clearInterval(interval);
    }, [date]);

    // --- HANDLERS ---
    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play().catch(() => { }); setIsPlaying(true); }
    };

    const handleOpen = () => {
        setIsOpen(true);
        setTimeout(() => {
            if (audioRef.current) audioRef.current.play().catch(() => { });
            setIsPlaying(true);
        }, 500);
    };

    return (
        // CONTAINER: Off-White Paper Texture
        <div className="bg-[#F7F3E8] text-black min-h-screen relative overflow-x-hidden font-sans selection:bg-[#E63946] selection:text-white">

            {/* --- STYLES --- */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&family=Patrick+Hand&display=swap');
        
        .font-comic-head { font-family: 'Bangers', cursive; letter-spacing: 0.05em; }
        .font-comic-body { font-family: 'Comic Neue', cursive; }
        .font-hand { font-family: 'Patrick Hand', cursive; }
        
        /* Halftone Pattern */
        .bg-halftone {
            background-image: radial-gradient(#000 1px, transparent 1px);
            background-size: 8px 8px;
            opacity: 0.05;
        }
        
        /* Comic Box Styles */
        .comic-panel {
            background: white;
            border: 3px solid black;
            box-shadow: 6px 6px 0px black;
            position: relative;
            transition: transform 0.2s;
        }
        .comic-panel:hover { transform: scale(1.01) rotate(-0.5deg); }
        
        .comic-panel-dark {
            background: #1D3557;
            border: 3px solid black;
            box-shadow: 6px 6px 0px black;
            color: white;
        }

        /* Speech Bubbles */
        .speech-bubble {
            background: white;
            border: 2px solid black;
            border-radius: 50%;
            padding: 10px;
            position: relative;
            text-align: center;
            box-shadow: 3px 3px 0 rgba(0,0,0,0.2);
        }
        .speech-bubble::after {
            content: ''; position: absolute; bottom: -10px; left: 20%;
            border-width: 10px 10px 0; border-style: solid;
            border-color: black transparent; display: block; width: 0;
        }
        .speech-bubble-rect {
            background: white;
            border: 2px solid black;
            padding: 10px;
            position: relative;
            box-shadow: 4px 4px 0 black;
        }

        /* Caption Box */
        .caption-box {
            background: #F4D35E;
            border: 2px solid black;
            padding: 4px 12px;
            font-family: 'Bangers', cursive;
            text-transform: uppercase;
            display: inline-block;
            box-shadow: 3px 3px 0 black;
        }

        /* Animations */
        @keyframes pop { 50% { transform: scale(1.2); } }
        .animate-pop { animation: pop 0.3s ease-in-out; }
        @keyframes shake { 0%, 100% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } }
        .animate-shake { animation: shake 2s infinite ease-in-out; }
      `}</style>

            <div className="fixed inset-0 bg-halftone z-0 pointer-events-none"></div>

            {/* --- COMIC COVER (OPENING) --- */}
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-[#E63946] transition-transform duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
                <div className="bg-halftone absolute inset-0 opacity-20"></div>

                <div className="comic-panel max-w-sm w-full p-2 bg-white rotate-2">
                    <div className="border-b-2 border-black mb-2 flex justify-between px-2 bg-[#F4D35E]">
                        <span className="font-comic-head text-sm">ISSUE #1</span>
                        <span className="font-comic-head text-sm">LIMITED EDITION</span>
                    </div>

                    <div className="relative aspect-[4/5] border-2 border-black mb-4 overflow-hidden group">
                        <img src={photos.cover} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />

                        {/* Title Overlay */}
                        <div className="absolute top-4 left-0 w-full text-center">
                            <h1 className="font-comic-head text-6xl text-white text-stroke-black drop-shadow-[4px_4px_0_#000]">
                                THE WEDDING
                            </h1>
                        </div>

                        {/* Speech Bubble */}
                        <div className="absolute bottom-20 right-4 bg-white border-2 border-black rounded-[50%] px-6 py-4 shadow-[4px_4px_0_black] animate-bounce">
                            <p className="font-comic-body font-bold text-sm">YOU ARE<br />INVITED!</p>
                            <div className="absolute -bottom-3 right-4 w-4 h-4 bg-white border-r-2 border-b-2 border-black transform rotate-45"></div>
                        </div>
                    </div>

                    <div className="text-center p-4">
                        <h2 className="font-comic-head text-3xl mb-2">{groom} & {bride}</h2>
                        <div className="bg-black text-white inline-block px-4 py-1 font-comic-body font-bold transform -rotate-1">
                            {guestName || "SPECIAL GUEST"}
                        </div>
                    </div>

                    <button
                        onClick={handleOpen}
                        className="w-full bg-[#1D3557] text-white font-comic-head text-xl py-3 border-t-2 border-black hover:bg-[#457B9D] transition-colors flex items-center justify-center gap-2"
                    >
                        OPEN COMIC <Zap fill="yellow" className="text-yellow-400" />
                    </button>
                </div>
            </div>

            {/* --- CONTENT (COMIC STRIP LAYOUT) --- */}
            <div className={`transition-opacity duration-500 delay-300 relative z-10 max-w-2xl mx-auto p-4 space-y-8 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

                {/* PANEL 1: HERO */}
                <div className="comic-panel p-2">
                    <div className="absolute -top-3 -left-3 caption-box bg-[#E63946] text-white rotate-[-3deg]">
                        EPISODE 1: THE BEGINNING
                    </div>

                    <div className="grid grid-cols-1 border-2 border-black overflow-hidden relative">
                        <img src={photos.cover} className="w-full h-80 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                        <div className="absolute bottom-6 left-6 text-white">
                            <h1 className="font-comic-head text-5xl text-stroke-black drop-shadow-[3px_3px_0_black] mb-2">
                                {groom} <span className="text-[#F4D35E]">&</span> {bride}
                            </h1>
                            <div className="bg-white text-black px-3 py-1 font-comic-body font-bold border-2 border-black inline-block shadow-[3px_3px_0_black]">
                                {formattedDate}
                            </div>
                        </div>

                        {/* Sound Effect Text */}
                        <div className="absolute top-4 right-4 font-comic-head text-4xl text-[#F4D35E] text-stroke-black drop-shadow-[3px_3px_0_black] animate-pulse">
                            BOOM!
                        </div>
                    </div>
                </div>

                {/* PANEL 2: STORY & QUOTE */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="comic-panel p-4 flex items-center justify-center bg-[#F4D35E] rotate-1">
                        <div className="text-center">
                            <p className="font-hand text-lg font-bold leading-tight">
                                “{data?.quote || "Two hearts, one story. Ready to start the next chapter together!"}”
                            </p>
                            <span className="block mt-2 text-sm opacity-70">
                                — {data?.quote_source}
                            </span>
                        </div>

                    </div>
                    <div className="comic-panel p-0 overflow-hidden -rotate-1">
                        <img src={photos.cover} className="w-full h-full object-cover grayscale contrast-125" />
                        <div className="absolute bottom-0 left-0 bg-white border-t-2 border-r-2 border-black px-2 py-1 font-comic-head text-xs">
                            LOVE.JPG
                        </div>
                    </div>
                </div>

                {/* PANEL 3: THE CHARACTERS (COUPLE) */}
                <div className="comic-panel p-2 bg-white">
                    <div className="absolute -top-3 right-4 caption-box rotate-2">MEET THE CAST</div>

                    <div className="grid md:grid-cols-2 gap-2 mt-4">
                        {/* Groom */}
                        <div className="border-2 border-black p-2 relative group">
                            <div className="aspect-square border-2 border-black mb-2 overflow-hidden bg-blue-100">
                                <img src={photos.groom} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                            </div>
                            <h3 className="font-comic-head text-2xl text-[#1D3557]">{groom}</h3>
                            <div className="bg-[#E63946] text-white text-xs px-2 py-0.5 inline-block font-bold border border-black mb-2">GROOM</div>
                            <p className="font-comic-body text-sm leading-tight border-t-2 border-black border-dashed pt-2">
                                Son of:<br />{data?.groom_parents}
                            </p>
                        </div>

                        {/* Bride */}
                        <div className="border-2 border-black p-2 relative group">
                            <div className="aspect-square border-2 border-black mb-2 overflow-hidden bg-pink-100">
                                <img src={photos.bride} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                            </div>
                            <h3 className="font-comic-head text-2xl text-[#E63946]">{bride}</h3>
                            <div className="bg-[#F4D35E] text-black text-xs px-2 py-0.5 inline-block font-bold border border-black mb-2">BRIDE</div>
                            <p className="font-comic-body text-sm leading-tight border-t-2 border-black border-dashed pt-2">
                                Daughter of:<br />{data?.bride_parents}
                            </p>
                        </div>
                    </div>
                </div>

                {/* PANEL 4: THE PLOT (EVENTS) */}
                <div className="relative">
                    <div className="absolute -left-2 top-10 font-comic-head text-5xl text-[#E63946] text-stroke-black z-20 -rotate-12 drop-shadow-[3px_3px_0_white]">POW!</div>

                    <div className="comic-panel-dark p-6">
                        <h2 className="font-comic-head text-4xl text-[#F4D35E] text-center mb-6 text-stroke-black drop-shadow-[3px_3px_0_#E63946]">
                            MISSION: WEDDING
                        </h2>

                        <div className="space-y-6">
                            {/* Akad */}
                            <div className="bg-white text-black border-2 border-black p-4 relative shadow-[4px_4px_0_#F4D35E]">
                                <div className="absolute -top-3 -left-3 bg-black text-white px-2 py-1 font-comic-head text-sm rotate-[-5deg]">PART 1</div>
                                <h3 className="font-comic-head text-2xl">AKAD NIKAH</h3>
                                <div className="flex items-center gap-2 font-comic-body font-bold mt-1">
                                    <Clock size={16} /> {data?.akad_time}
                                </div>
                                <div className="mt-2 border-t-2 border-dashed border-gray-300 pt-2 text-sm font-hand">
                                    <div className="font-bold">
                                        {data?.venue_name}
                                    </div>
                                    <div className="opacity-80">
                                        {data?.venue_address}
                                    </div>
                                </div>
                            </div>

                            {/* Resepsi */}
                            <div className="bg-white text-black border-2 border-black p-4 relative shadow-[4px_4px_0_#E63946]">
                                <div className="absolute -top-3 -right-3 bg-black text-white px-2 py-1 font-comic-head text-sm rotate-[5deg]">PART 2</div>
                                <h3 className="font-comic-head text-2xl">RECEPTION PARTY</h3>
                                <div className="flex items-center gap-2 font-comic-body font-bold mt-1">
                                    <Clock size={16} /> {data?.resepsi_time}
                                </div>
                                <div className="mt-2 border-t-2 border-dashed border-gray-300 pt-2 text-sm font-hand">
                                    <div className="font-bold">
                                        {data?.venue_name}
                                    </div>
                                    <div className="opacity-80">
                                        {data?.venue_address}
                                    </div>
                                </div>

                                <a href={data?.maps_link} target="_blank" className="mt-4 block bg-[#1D3557] text-white text-center py-2 font-comic-head border-2 border-black shadow-[2px_2px_0_white] hover:translate-y-[2px] hover:shadow-none transition-all">
                                    GET DIRECTIONS <MapPin className="inline ml-1 w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PANEL 5: COUNTDOWN (SCOREBOARD) */}
                <div className="comic-panel p-4 bg-[#F4D35E]">
                    <div className="text-center font-comic-head text-2xl mb-4 border-b-4 border-black inline-block px-4">
                        COUNTDOWN TIMER
                    </div>
                    <div className="flex justify-center gap-2 md:gap-4">
                        <ScoreBox val={timeLeft.days} label="DAYS" />
                        <span className="font-comic-head text-4xl self-center">:</span>
                        <ScoreBox val={timeLeft.hours} label="HRS" />
                        <span className="font-comic-head text-4xl self-center">:</span>
                        <ScoreBox val={timeLeft.minutes} label="MIN" />
                        <span className="font-comic-head text-4xl self-center">:</span>
                        <ScoreBox val={timeLeft.seconds} label="SEC" />
                    </div>
                </div>

                {/* PANEL 6: GALLERY (POLAROIDS) */}
                {gallery.length > 0 && (
                    <div className="relative py-8">
                        <h2 className="font-comic-head text-4xl text-center mb-8 rotate-2 decoration-wavy underline decoration-[#E63946]">SNEAK PEEK</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {gallery.map((url, i) => (
                                <div key={i} className={`bg-white p-2 pb-8 shadow-md border border-gray-300 transform transition hover:scale-105 hover:z-10 ${i % 2 === 0 ? 'rotate-2' : '-rotate-2'}`}>
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#E63946]/30 -rotate-1"></div>
                                    <img src={url} className="w-full aspect-square object-cover border border-gray-200 grayscale hover:grayscale-0 transition duration-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PANEL 7: GIFT (BANK CARD) */}
                <div className="comic-panel p-6 bg-[#E9ECEF]">
                    <div className="absolute -top-4 left-4 font-comic-head text-6xl text-[#1D3557] opacity-20 rotate-[-10deg] pointer-events-none">$$$</div>
                    <h2 className="font-comic-head text-3xl text-center mb-6">WEDDING GIFT</h2>

                    <div className="space-y-4">
                        {banks.map((bank, i) => (
                            <div key={i} className="bg-white border-2 border-black p-4 relative shadow-[4px_4px_0_#1D3557]">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-comic-head text-xl">{bank.bank}</span>
                                    <Copy
                                        size={18}
                                        className="cursor-pointer hover:text-[#E63946]"
                                        onClick={() => navigator.clipboard.writeText(bank.number)}
                                    />
                                </div>
                                <div className="font-comic-body font-bold text-2xl tracking-widest text-[#1D3557] mb-1">
                                    {bank.number}
                                </div>
                                <div className="text-xs font-hand text-gray-500 uppercase">
                                    A/N {bank.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PANEL 8: CLOSING */}
                <div className="text-center py-10">
                    <h2 className="font-comic-head text-5xl text-black text-stroke-white drop-shadow-[3px_3px_0_black] mb-4">
                        THE END...
                    </h2>
                    <p className="font-hand text-xl bg-white border-2 border-black inline-block px-4 py-2 rotate-1 shadow-[4px_4px_0_#F4D35E]">
                        ...is just our beginning! ❤️
                    </p>
                    <div className="mt-8 text-xs font-comic-body font-bold">
                        SEE YOU THERE!
                    </div>
                </div>

            </div>

            {/* AUDIO CONTROL (COMIC BUTTON) */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={toggleAudio}
                    className={`w-14 h-14 bg-[#F4D35E] border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_black] hover:translate-y-[2px] hover:shadow-[2px_2px_0_black] transition-all ${isPlaying ? 'animate-shake' : ''}`}
                >
                    {isPlaying ? <Music size={24} /> : <Play size={24} className="ml-1" />}
                </button>
            </div>

            <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3"} loop />
        </div>
    );
}

// SUB COMPONENT: SCOREBOARD
function ScoreBox({ val, label }) {
    return (
        <div className="bg-black text-[#F4D35E] border-2 border-white p-2 min-w-[60px] text-center shadow-[3px_3px_0_gray]">
            <div className="font-comic-head text-3xl leading-none">{String(val).padStart(2, '0')}</div>
            <div className="text-[10px] font-comic-body font-bold text-white">{label}</div>
        </div>
    )
}