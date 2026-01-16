import { useState, useRef, useEffect } from 'react';
import { 
  Cloud, Heart, MapPin, Calendar, Gift, 
  Music, Play, Pause, Star, Sparkles, Copy, ArrowDown 
} from 'lucide-react';

export default function SoftBlueTheme({ groom, bride, date, guestName, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- DATA ---
  const photos = {
    cover: data?.cover_photo || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&fit=crop",
    groom: data?.groom_photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&fit=crop",
    bride: data?.bride_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop",
  };

  const gallery = data?.gallery || [
    "https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=500&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-1645062cd958?w=500&fit=crop",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&fit=crop"
  ];

  const banks = data?.banks || [];

  const formattedDate = new Date(date || new Date()).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // --- LOGIC ---
  useEffect(() => {
    const target = new Date(date || new Date());
    const interval = setInterval(() => {
        const now = new Date();
        const diff = target - now;
        if (diff > 0) {
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            });
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [date]);

  const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => {
          if(audioRef.current) audioRef.current.play().catch(()=>{});
          setIsPlaying(true);
      }, 500);
  };

  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  return (
    // CONTAINER: Baby Blue Gradient & Cinnamon Text
    <div className="bg-gradient-to-b from-[#DFF1FF] to-[#EAF6FF] text-[#5D4037] min-h-screen relative overflow-x-hidden font-sans selection:bg-[#FFD1DC] selection:text-white">

      {/* --- STYLES --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;800&family=Nunito:wght@400;600;700&display=swap');
        
        .font-cute { font-family: 'Baloo 2', cursive; }
        .font-body { font-family: 'Nunito', sans-serif; }
        
        /* Floating Animation */
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-slow { animation: float 6s ease-in-out infinite; }
        
        /* Twinkle Stars */
        @keyframes twinkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.8); }
        }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }

        /* Cloud Shape Decor */
        .cloud-decor {
            position: absolute;
            background: white;
            border-radius: 999px;
            opacity: 0.6;
            filter: blur(8px);
        }
      `}</style>

      {/* --- BACKGROUND DECORATION --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="cloud-decor w-64 h-32 top-10 -left-10 animate-float-slow"></div>
          <div className="cloud-decor w-80 h-40 bottom-20 -right-20 animate-float"></div>
          <Star className="absolute top-20 right-10 text-yellow-300 w-6 h-6 animate-twinkle opacity-80" fill="currentColor"/>
          <Star className="absolute bottom-40 left-10 text-[#FFD1DC] w-8 h-8 animate-twinkle delay-700 opacity-80" fill="currentColor"/>
      </div>

      {/* --- OPENING SCREEN (CLOUD CARD) --- */}
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#C7E7FF] transition-all duration-1000 ease-[cubic-bezier(0.7,0,0.3,1)] ${isOpen ? '-translate-y-full rounded-b-[100px]' : 'translate-y-0 rounded-none'}`}>
          
          <div className="bg-white p-8 rounded-[3rem] shadow-[0_10px_40px_rgba(199,231,255,0.8)] text-center max-w-sm w-full relative animate-float">
              {/* Top Decor */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <Cloud size={48} className="text-white fill-white drop-shadow-md"/>
              </div>

              <p className="font-body text-sm text-[#8D6E63] tracking-widest uppercase mb-4 mt-4">The Wedding Of</p>
              <h1 className="font-cute text-4xl md:text-5xl text-[#5D4037] mb-6 leading-tight">
                  {groom} <br/> <span className="text-[#FFB7B2] text-3xl">&</span> <br/> {bride}
              </h1>

              <div className="bg-[#FFF4E6] rounded-2xl p-4 mb-8">
                  <p className="font-body text-xs text-[#8D6E63] mb-1">Dear Special Guest,</p>
                  <h3 className="font-cute text-xl text-[#5D4037]">{guestName || "Teman Baik"}</h3>
              </div>

              <button 
                  onClick={handleOpen}
                  className="bg-[#81D4FA] text-white font-cute font-bold text-lg py-3 px-10 rounded-full shadow-lg hover:scale-105 hover:bg-[#4FC3F7] transition-all flex items-center justify-center gap-2 mx-auto"
              >
                  Open Invitation <Sparkles size={20}/>
              </button>
          </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className={`transition-opacity duration-1000 delay-500 relative z-10 max-w-xl mx-auto px-4 py-8 space-y-12 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

        {/* 1. HERO SECTION */}
        <section className="text-center pt-8">
            <div className="relative inline-block mx-auto mb-6">
                <div className="absolute inset-0 bg-[#FFD1DC] rounded-[40px] rotate-3"></div>
                <img src={photos.cover} className="relative w-64 h-80 object-cover rounded-[40px] border-4 border-white shadow-lg -rotate-3" alt="Cover" />
                <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-full shadow-md animate-bounce">
                    <Heart size={24} className="text-[#FF8A80] fill-[#FF8A80]"/>
                </div>
            </div>
            
            <h2 className="font-cute text-2xl text-[#5D4037] mb-2">We Are Getting Married!</h2>
            <p className="font-body text-[#8D6E63] text-sm px-8 leading-relaxed">
                "Together is a beautiful place to be."
            </p>
            <div className="mt-4 flex justify-center">
                <ArrowDown className="text-[#81D4FA] animate-bounce"/>
            </div>
        </section>

        {/* 2. COUPLE (ROUNDED AVATARS) */}
        <section className="bg-white/60 backdrop-blur-sm rounded-[3rem] p-8 shadow-sm">
            <h2 className="font-cute text-3xl text-center mb-8 text-[#5D4037]">The Couple</h2>
            <div className="space-y-8">
                {/* Groom */}
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full border-4 border-[#C7E7FF] overflow-hidden shrink-0">
                        <img src={photos.groom} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-cute text-2xl text-[#5D4037]">{groom}</h3>
                        <p className="font-body text-xs text-[#8D6E63] mt-1">Putra Bpk/Ibu <br/> {data?.groom_parents}</p>
                    </div>
                </div>
                {/* Bride */}
                <div className="flex items-center gap-4 flex-row-reverse text-right">
                    <div className="w-24 h-24 rounded-full border-4 border-[#FFD1DC] overflow-hidden shrink-0">
                        <img src={photos.bride} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-cute text-2xl text-[#5D4037]">{bride}</h3>
                        <p className="font-body text-xs text-[#8D6E63] mt-1">Putri Bpk/Ibu <br/> {data?.bride_parents}</p>
                    </div>
                </div>
            </div>
        </section>

        {/* 3. EVENT DETAILS (CHECKLIST) */}
        <section>
            <div className="relative">
                <Cloud size={60} className="absolute -top-8 -left-4 text-white fill-white drop-shadow-sm opacity-80"/>
                <Cloud size={40} className="absolute -bottom-4 -right-2 text-white fill-white drop-shadow-sm opacity-80"/>
                
                <div className="bg-[#FFF4E6] rounded-[2.5rem] p-8 shadow-sm border-2 border-white">
                    <h2 className="font-cute text-3xl text-center mb-6">Save The Date</h2>
                    <div className="flex justify-center mb-6">
                        <span className="bg-[#FFE082] text-[#5D4037] px-4 py-2 rounded-full font-cute text-lg shadow-sm">
                            {formattedDate}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {/* Akad */}
                        <div className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                            <div className="bg-[#C7E7FF] p-2 rounded-full text-white">
                                <Sparkles size={18}/>
                            </div>
                            <div>
                                <h3 className="font-cute text-lg">Akad Nikah</h3>
                                <p className="font-body text-sm text-[#8D6E63]">{data?.akad_time}</p>
                            </div>
                        </div>
                        {/* Resepsi */}
                        <div className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                            <div className="bg-[#FFCCBC] p-2 rounded-full text-white">
                                <Sparkles size={18}/>
                            </div>
                            <div>
                                <h3 className="font-cute text-lg">Resepsi</h3>
                                <p className="font-body text-sm text-[#8D6E63]">{data?.resepsi_time}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location & Map */}
                    <div className="mt-6 text-center">
                        <p className="font-body text-sm text-[#8D6E63] mb-3">{data?.venue_name}</p>
                        <a href={data?.maps_link} target="_blank" className="inline-flex items-center gap-2 bg-[#81D4FA] text-white px-6 py-3 rounded-full font-cute shadow-md hover:bg-[#4FC3F7] transition">
                            <MapPin size={18}/> Open Google Maps
                        </a>
                    </div>
                </div>
            </div>
        </section>

        {/* 4. COUNTDOWN (PASTEL BOXES) */}
        <section className="text-center">
            <h2 className="font-cute text-2xl mb-6 text-[#5D4037]">Counting Down ✨</h2>
            <div className="flex justify-center gap-3">
                <TimeBox val={timeLeft.days} label="Hari" color="bg-[#FFD1DC]" />
                <TimeBox val={timeLeft.hours} label="Jam" color="bg-[#FFF9C4]" />
                <TimeBox val={timeLeft.minutes} label="Mnt" color="bg-[#C7E7FF]" />
                <TimeBox val={timeLeft.seconds} label="Dtk" color="bg-[#E1BEE7]" />
            </div>
        </section>

        {/* 5. GALLERY (STICKERS) */}
        {gallery.length > 0 && (
          <section>
              <h2 className="font-cute text-3xl text-center mb-8">Our Moments 📸</h2>
              <div className="grid grid-cols-2 gap-4 px-2">
                  {gallery.map((url, i) => (
                      <div key={i} className={`rounded-3xl overflow-hidden border-4 border-white shadow-md transform transition hover:scale-105 hover:z-10 bg-white ${i%2===0 ? 'rotate-2' : '-rotate-2'}`}>
                          <img src={url} className="w-full h-40 object-cover" />
                      </div>
                  ))}
              </div>
          </section>
        )}

        {/* 6. GIFT (GIFT BOX) */}
        <section className="bg-white rounded-[3rem] p-8 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-4 bg-[#FFAB91]"></div>
            <div className="w-16 h-16 bg-[#FFAB91] rounded-full flex items-center justify-center mx-auto mb-4 -mt-12 border-4 border-white shadow-sm">
                <Gift size={32} className="text-white"/>
            </div>
            
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
                        <button onClick={() => navigator.clipboard.writeText(bank.number)} className="bg-[#FFCCBC] p-2 rounded-full text-white hover:bg-[#FFAB91] transition">
                            <Copy size={18}/>
                        </button>
                    </div>
                ))}
            </div>
        </section>

        {/* 7. CLOSING */}
        <footer className="text-center py-12 relative">
            <Cloud size={100} className="mx-auto text-white fill-white drop-shadow-sm opacity-60 mb-4 animate-pulse"/>
            <h2 className="font-cute text-3xl text-[#5D4037] relative z-10">{groom} & {bride}</h2>
            <p className="font-body text-sm text-[#8D6E63] relative z-10">Thank you for everything! ❤️</p>
        </footer>

      </div>

      {/* AUDIO BUTTON */}
      <button 
        onClick={toggleAudio}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#81D4FA] hover:scale-110 transition border-2 border-[#E1F5FE]"
      >
          {isPlaying ? <Music size={20} className="animate-spin"/> : <Play size={20}/>}
      </button>

      <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/10/25/audio_1086088e5d.mp3"} loop />
    </div>
  );
}

// SUB COMPONENT
function TimeBox({ val, label, color }) {
    return (
        <div className={`${color} w-16 h-20 rounded-2xl flex flex-col items-center justify-center shadow-sm transform hover:-translate-y-1 transition`}>
            <span className="font-cute text-2xl text-[#5D4037] leading-none">{val}</span>
            <span className="font-body text-[10px] text-[#8D6E63]">{label}</span>
        </div>
    )
}