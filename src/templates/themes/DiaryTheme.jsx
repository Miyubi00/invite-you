import { useState, useRef, useEffect } from 'react';
import {
  Heart, MapPin, Calendar, Check, Copy,
  Music, Play, Pause, PenTool, Star, ArrowDown
} from 'lucide-react';

export default function HandwrittenDiaryTheme({ groom, bride, date, guestName, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- DATA ---
  const photos = {
    cover: data?.cover_photo || "https://images.unsplash.com/photo-1516961642265-531546e84af2?w=800&fit=crop", // Paper/Book feel
    groom: data?.groom_photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&fit=crop",
    bride: data?.bride_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop",
  };

  const gallery = data?.gallery || [
    "https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=500&fit=crop",
    "https://images.unsplash.com/photo-1511285560982-1356c11d4606?w=500&fit=crop",
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
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      if (audioRef.current) audioRef.current.play().catch(() => { });
      setIsPlaying(true);
    }, 800);
  };

  return (
    // MAIN CONTAINER: Cream Paper Texture
    <div className="bg-[#FAF7F2] text-[#2B2B2B] min-h-screen relative overflow-x-hidden selection:bg-[#D4C4B7] selection:text-white">

      {/* --- STYLES & FONTS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Indie+Flower&family=Patrick+Hand&display=swap');
        
        .font-title { font-family: 'Caveat', cursive; }
        .font-body { font-family: 'Patrick Hand', cursive; }
        .font-doodle { font-family: 'Indie Flower', cursive; }
        
        /* Paper Grain Effect */
        .bg-paper {
            background-image: url("https://www.transparenttextures.com/patterns/cream-paper.png");
            opacity: 0.6;
        }

        /* Washi Tape Effect */
        .tape {
            background-color: rgba(255, 255, 255, 0.6);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            backdrop-filter: blur(2px);
            border-left: 1px dashed rgba(0,0,0,0.1);
            border-right: 1px dashed rgba(0,0,0,0.1);
            transform: rotate(-2deg);
        }

        /* Animations */
        @keyframes scribble {
            0% { stroke-dashoffset: 1000; }
            100% { stroke-dashoffset: 0; }
        }
        .animate-scribble {
            stroke-dasharray: 1000;
            animation: scribble 2s ease-out forwards;
        }

        @keyframes float-gentle {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(2deg); }
        }
        .animate-float { animation: float-gentle 4s ease-in-out infinite; }
      `}</style>

      {/* Texture Overlay */}
      <div className="fixed inset-0 bg-paper pointer-events-none z-0 mix-blend-multiply"></div>

      {/* --- COVER PAGE (DIARY COVER) --- */}
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#8B5E3C] transition-transform duration-1000 ease-[cubic-bezier(0.7,0,0.3,1)] ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="absolute inset-4 border-2 border-[#6d4c33] rounded-lg border-dashed opacity-50 pointer-events-none"></div>

        {/* Leather/Book Texture Effect */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay"></div>

        <div className="relative z-10 bg-[#FAF7F2] p-8 md:p-12 max-w-sm w-[90%] shadow-2xl rotate-1 transform transition-transform hover:rotate-0 duration-500">
          {/* Sticker/Label */}
          <div className="border-4 border-double border-[#2B2B2B] p-6 text-center">
            <p className="font-body text-[#6B7280] text-lg mb-2">The Wedding Diary of</p>
            <h1 className="font-title text-5xl md:text-6xl text-[#2B2B2B] mb-4 leading-tight">
              {groom} <br /> <span className="text-[#8B5E3C]">&</span> <br /> {bride}
            </h1>
            <p className="font-doodle text-xl text-[#6B7280]">{formattedDate}</p>
          </div>

          {/* Hand-drawn Button */}
          <button
            onClick={handleOpen}
            className="mt-8 mx-auto block group relative"
          >
            <div className="absolute inset-0 border-2 border-[#2B2B2B] rounded-full translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0 group-hover:translate-y-0 bg-[#E5E7EB]"></div>
            <div className="relative border-2 border-[#2B2B2B] bg-white px-8 py-3 rounded-full font-title text-2xl font-bold text-[#2B2B2B] group-active:translate-x-1 group-active:translate-y-1 transition-transform">
              Open Diary 📖
            </div>
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT (PAGES) --- */}
      <div className={`transition-opacity duration-1000 delay-500 max-w-2xl mx-auto relative z-10 px-6 py-12 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

        {/* 1. INTRO (NOTE) */}
        <section className="mb-24 relative">
          <div className="absolute -left-4 top-0 -rotate-12 opacity-80">
            <DoodleStar className="w-10 h-10 text-[#D4C4B7]" />
          </div>

          <div className="text-center space-y-6">
            <h2 className="font-title text-4xl text-[#2B2B2B]">Dear Friends & Family,</h2>
            <div className="font-body text-xl text-[#4B5563] leading-loose">
              <p>
                "We are writing this new chapter of our lives, and we want you to be part of the story."
              </p>
              <p className="mt-4">
                Please join us as we celebrate our love.
              </p>
            </div>
            <div className="w-32 h-1 bg-[#2B2B2B] mx-auto rounded-full opacity-10 rotate-1"></div>
          </div>
        </section>

        {/* 2. HERO (PHOTO PAGE) */}
        <section className="mb-24 text-center">
          <div className="relative inline-block rotate-2 p-3 bg-white shadow-lg border border-gray-200 pb-12">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 tape"></div>
            <img src={photos.cover} className="w-64 h-80 object-cover filter sepia-[0.2]" alt="Couple" />
            <p className="font-title text-3xl mt-4 text-[#2B2B2B]">Our Happy Beginning</p>
          </div>

          <div className="mt-12 flex justify-center">
            <ArrowDown className="animate-bounce text-[#8B5E3C]" />
          </div>
        </section>

        {/* 3. COUPLE (SCRAPBOOK ENTRIES) */}
        <section className="mb-24 space-y-16">
          <div className="text-center font-title text-4xl mb-8 underline decoration-wavy decoration-[#D4C4B7]">
            Meet The Couple
          </div>

          {/* Groom */}
          <div className="flex flex-col md:flex-row items-center gap-8 group">
            <div className="relative -rotate-2 group-hover:rotate-0 transition duration-500">
              <div className="absolute -top-3 -left-3 w-24 h-8 tape rotate-[-10deg]"></div>
              <div className="bg-white p-2 pb-10 shadow-md border border-gray-200">
                <img src={photos.groom} className="w-48 h-56 object-cover grayscale-[0.3]" alt="Groom" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-title text-4xl text-[#2B2B2B]">{groom}</h3>
              <p className="font-doodle text-lg text-[#8B5E3C] mt-1">The Groom</p>
              <div className="mt-4 font-body text-lg text-[#4B5563] border-l-2 border-[#2B2B2B] pl-4">
                <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Son of:</p>
                <p>{data?.groom_parents}</p>
              </div>
            </div>
          </div>

          {/* Bride */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 group">
            <div className="relative rotate-2 group-hover:rotate-0 transition duration-500">
              <div className="absolute -top-3 -right-3 w-24 h-8 tape rotate-[10deg]"></div>
              <div className="bg-white p-2 pb-10 shadow-md border border-gray-200">
                <img src={photos.bride} className="w-48 h-56 object-cover grayscale-[0.3]" alt="Bride" />
              </div>
            </div>
            <div className="text-center md:text-right">
              <h3 className="font-title text-4xl text-[#2B2B2B]">{bride}</h3>
              <p className="font-doodle text-lg text-[#8B5E3C] mt-1">The Bride</p>
              <div className="mt-4 font-body text-lg text-[#4B5563] border-r-2 md:border-r-2 md:border-l-0 border-l-2 border-[#2B2B2B] px-4">
                <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Daughter of:</p>
                <p>{data?.bride_parents}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. COUNTDOWN (HANDWRITTEN) */}
        <section className="mb-24 text-center">
          <h2 className="font-doodle text-2xl text-[#6B7280] mb-6">Counting the days...</h2>
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            <div className="flex flex-col items-center">
              <span className="font-title text-5xl md:text-6xl text-[#2B2B2B]">{timeLeft.days}</span>
              <span className="font-body text-sm uppercase tracking-widest">Days</span>
            </div>
            <span className="font-title text-4xl text-[#D4C4B7]">:</span>
            <div className="flex flex-col items-center">
              <span className="font-title text-5xl md:text-6xl text-[#2B2B2B]">{timeLeft.hours}</span>
              <span className="font-body text-sm uppercase tracking-widest">Hours</span>
            </div>
            <span className="font-title text-4xl text-[#D4C4B7]">:</span>
            <div className="flex flex-col items-center">
              <span className="font-title text-5xl md:text-6xl text-[#2B2B2B]">{timeLeft.minutes}</span>
              <span className="font-body text-sm uppercase tracking-widest">Mins</span>
            </div>
            <span className="font-title text-4xl text-[#D4C4B7]">:</span>
            <div className="flex flex-col items-center">
              <span className="font-title text-5xl md:text-6xl text-[#2B2B2B]">{timeLeft.seconds}</span>
              <span className="font-body text-sm uppercase tracking-widest">Sec</span>
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-2">
            <Heart className="w-4 h-4 text-red-300 animate-bounce" fill="#FCA5A5" />
            <Heart className="w-4 h-4 text-red-300 animate-bounce delay-100" fill="#FCA5A5" />
            <Heart className="w-4 h-4 text-red-300 animate-bounce delay-200" fill="#FCA5A5" />
          </div>
        </section>

        {/* 5. EVENT DETAILS (CHECKLIST) */}
        <section className="mb-24">
          <div className="border-2 border-[#2B2B2B] p-8 relative bg-white/50 transform -rotate-1 shadow-sm">
            {/* Pin Effect */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-400 border border-black shadow-sm z-10"></div>

            <h2 className="text-center font-title text-4xl mb-8">Save The Date!</h2>

            <div className="space-y-8">
              {/* Akad */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-[#D1FAE5] text-[#065F46] p-1 rounded-full border border-[#065F46]">
                  <Check size={20} />
                </div>
                <div>
                  <h3 className="font-title text-2xl font-bold">Akad Nikah</h3>
                  <p className="font-body text-lg">{formattedDate} • {data?.akad_time}</p>
                  <div className="mt-1 font-doodle text-sm text-gray-500">
                    <p className="font-bold text-gray-700">
                      {data?.venue_name}
                    </p>
                    <p className="opacity-80">
                      {data?.venue_address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resepsi */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-[#FCE7F3] text-[#831843] p-1 rounded-full border border-[#831843]">
                  <Check size={20} />
                </div>
                <div>
                  <h3 className="font-title text-2xl font-bold">Reception Party</h3>
                  <p className="font-body text-lg">{formattedDate} • {data?.resepsi_time}</p>
                  <div className="mt-1 font-doodle text-sm text-gray-500">
                    <p className="font-bold text-gray-700">
                      {data?.venue_name}
                    </p>
                    <p className="opacity-80">
                      {data?.venue_address}
                    </p>
                  </div>
                  <a href={data?.maps_link} target="_blank" className="inline-block mt-3 border-b border-[#2B2B2B] text-[#2B2B2B] font-body hover:text-[#8B5E3C] transition">
                    <MapPin className="inline w-4 h-4 mr-1" /> See Location on Map
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. GALLERY (POLAROID GRID) */}
        {gallery.length > 0 && (
          <section className="mb-24 text-center">
            <h2 className="font-title text-4xl mb-12">Captured Memories 📸</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
              {gallery.map((url, i) => (
                <div key={i} className={`bg-white p-3 pb-12 shadow-md border border-gray-200 transform hover:scale-105 transition duration-300 relative ${i % 2 === 0 ? 'rotate-2' : '-rotate-1'}`}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 tape opacity-80"></div>
                  <img src={url} className="w-full h-64 object-cover filter sepia-[0.1]" alt="Memory" />
                  <p className="absolute bottom-4 left-0 right-0 text-center font-doodle text-gray-400 text-sm">
                    moments #{i + 1}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. GIFT (NOTE STYLE) */}
        <section className="mb-24">
          <div className="bg-[#FEF3C7] p-8 shadow-md relative rotate-1 max-w-md mx-auto border border-[#FCD34D]">
            <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-[#FDE68A] border border-[#F59E0B]"></div>

            <h2 className="font-title text-3xl text-center mb-4 text-[#92400E]">Wedding Gift</h2>
            <p className="font-body text-center text-[#92400E] mb-6">
              "Your presence is the best gift. But if you wish to send a token of love, here it is:"
            </p>

            <div className="space-y-4">
              {banks.map((bank, i) => (
                <div key={i} className="border-b border-[#D97706]/30 pb-2">
                  <p className="font-bold font-title text-xl text-[#92400E]">{bank.bank}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-body text-lg text-[#78350F]">{bank.number}</span>
                    <button onClick={() => navigator.clipboard.writeText(bank.number)} className="text-[#92400E] hover:scale-110 transition">
                      <Copy size={18} />
                    </button>
                  </div>
                  <p className="font-doodle text-xs text-[#92400E]/70 uppercase">a.n {bank.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. CLOSING */}
        <footer className="text-center py-12 relative">
          <DoodleHeart className="w-16 h-16 mx-auto text-[#2B2B2B] opacity-20 mb-4 animate-pulse" />
          <h2 className="font-title text-4xl text-[#2B2B2B] mb-2">{groom} & {bride}</h2>
          <p className="font-doodle text-lg text-[#6B7280]">Thank you for being part of our story.</p>
        </footer>

      </div>

      {/* FLOATING MUSIC BUTTON (SKETCHY) */}
      <button
        onClick={toggleAudio}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 flex items-center justify-center bg-white border-2 border-[#2B2B2B] rounded-full shadow-[2px_2px_0_#2B2B2B] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#2B2B2B] transition-all"
      >
        {isPlaying ? <Music size={20} className="animate-spin-slow" /> : <Play size={20} className="ml-1" />}
      </button>

      <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/05/17/audio_1615a96c4d.mp3"} loop />
    </div>
  );
}

// --- DOODLE SVG COMPONENTS ---
function DoodleStar(props) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <path d="M50 0L61 35H98L68 57L79 91L50 70L21 91L32 57L2 35H39L50 0Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" style={{ strokeDasharray: "3 2" }} />
    </svg>
  )
}

function DoodleHeart(props) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <path d="M50 85 C10 50, 0 30, 20 15 C35 5, 50 30, 50 30 C50 30, 65 5, 80 15 C100 30, 90 50, 50 85 Z" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}