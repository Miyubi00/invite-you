import { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Clock, Copy, Music, Heart, Instagram, ChevronDown, 
  Mail, Gift, Play, Calendar, Star, Moon, Sparkles, Navigation
} from 'lucide-react';

export default function CelestialTheme({ groom, bride, date, guestName, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- DATA HANDLING ---
  const defaultImages = {
    cover: "https://images.unsplash.com/photo-1532975461948-2619c362a266?w=800&auto=format&fit=crop", // Galaxy/Starry
    man: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop",
    woman: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop",
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

  // --- AUDIO CONTROL ---
  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
      setIsPlaying(true);
    }
  };

  const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => {
          if(audioRef.current) {
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
      }, 500);
  };

  return (
    // MAIN CONTAINER: Dark Theme
    <div className="bg-[#0f172a] text-[#e2e8f0] min-h-screen relative overflow-x-hidden selection:bg-[#fbbf24] selection:text-[#0f172a]">

      {/* --- GLOBAL STYLES & ANIMATIONS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Quicksand:wght@300;400;600;700&display=swap');
        
        .font-celestial { font-family: 'Great Vibes', cursive; }
        .font-modern { font-family: 'Quicksand', sans-serif; }
        
        /* Star Background Animation */
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
        }
        .star {
            position: absolute; background: white; border-radius: 50%;
            animation: twinkle infinite ease-in-out;
        }
        
        /* Meteor Animation */
        @keyframes meteor {
            0% { transform: rotate(215deg) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: rotate(215deg) translateX(-500px); opacity: 0; }
        }
        .meteor {
            position: absolute; top: 50%; left: 50%;
            width: 4px; height: 4px; background: #fff;
            box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1), 0 0 0 8px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 1);
            border-radius: 50%;
            animation: meteor 4s linear infinite;
            opacity: 0;
        }
        .meteor::before {
            content: ''; position: absolute; top: 50%; transform: translateY(-50%);
            width: 200px; height: 1px;
            background: linear-gradient(90deg, #fff, transparent);
        }

        /* Glassmorphism Utility */
        .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .animate-float-slow { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
      `}</style>

      {/* --- DYNAMIC BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-[#020617] via-[#1e1b4b] to-[#0f172a]">
         {/* Generating random stars using inline styles for randomness */}
         {[...Array(30)].map((_, i) => (
             <div key={i} className="star" style={{
                 top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                 width: `${Math.random() * 3}px`, height: `${Math.random() * 3}px`,
                 animationDuration: `${Math.random() * 3 + 2}s`, animationDelay: `${Math.random() * 5}s`
             }}></div>
         ))}
         {/* Meteors */}
         <div className="meteor" style={{ top: '20%', left: '80%', animationDelay: '0s' }}></div>
         <div className="meteor" style={{ top: '60%', left: '90%', animationDelay: '2.5s' }}></div>
      </div>

      {/* --- COVER MODAL (OPENING) --- */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 bg-[#020617] ${isOpen ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
          <div className="relative z-10 text-center p-8 w-full max-w-md">
              <div className="w-40 h-40 mx-auto rounded-full border-2 border-[#fbbf24] p-2 mb-8 animate-spin-slow relative">
                   <div className="w-full h-full rounded-full overflow-hidden border border-[#fbbf24]/50">
                        <img src={photos.cover} className="w-full h-full object-cover" alt="Cover"/>
                   </div>
                   <div className="absolute -top-4 -right-2 text-[#fbbf24] animate-bounce"><Sparkles size={30} fill="#fbbf24"/></div>
              </div>
              
              <h2 className="font-modern text-sm tracking-[0.4em] text-[#94a3b8] mb-4">THE WEDDING OF</h2>
              <h1 className="font-celestial text-6xl text-[#fbbf24] mb-8 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                  {groom} <span className="text-white text-3xl">&</span> {bride}
              </h1>

              <div className="glass rounded-xl p-6 mb-8 mx-4">
                  <p className="font-modern text-xs text-gray-300 mb-2">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
                  <h3 className="font-modern text-xl font-bold text-white capitalize">{guestName || "Tamu Undangan"}</h3>
              </div>

              <button onClick={handleOpen} className="group relative bg-transparent border border-[#fbbf24] text-[#fbbf24] px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-[#fbbf24] hover:text-[#0f172a] transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                  <span className="flex items-center gap-2">
                      <Mail size={16}/> Buka Undangan
                  </span>
              </button>
          </div>
      </div>

      {/* --- CONTENT WRAPPER --- */}
      <div className={`transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

        {/* 1. HERO HEADER */}
        <header className="min-h-screen relative flex flex-col items-center justify-center text-center px-4 overflow-hidden">
             {/* Gradient Overlay */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent z-10"></div>
             
             {/* Main Hero Image as Background with parallax feel */}
             <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen">
                 <img src={photos.cover} className="w-full h-full object-cover blur-sm scale-110" alt="Space"/>
             </div>

             <div className="relative z-20 animate-float-slow">
                 <div className="flex justify-center items-center gap-4 mb-4 text-[#fbbf24]">
                    <Moon size={24} />
                    <Star size={16} className="mt-4" />
                    <Sparkles size={24} />
                 </div>
                 
                 <p className="font-modern tracking-[0.5em] text-xs text-[#cbd5e1] mb-2">SAVE THE DATE</p>
                 <h1 className="font-celestial text-7xl md:text-9xl bg-clip-text text-transparent bg-gradient-to-r from-[#fbbf24] via-[#fcd34d] to-[#fbbf24] mb-4 drop-shadow-lg leading-tight">
                    {groom} <br/> & <br/> {bride}
                 </h1>
                 <p className="font-modern text-lg font-bold text-white border-y border-white/20 py-2 inline-block px-10 glass rounded-full mt-4">
                    {formattedDate}
                 </p>
             </div>

             {/* COUNTDOWN */}
             <div className="relative z-20 mt-12 grid grid-cols-4 gap-3 md:gap-6 text-center">
                 <TimeBox val={timeLeft.days} label="Hari" />
                 <TimeBox val={timeLeft.hours} label="Jam" />
                 <TimeBox val={timeLeft.minutes} label="Menit" />
                 <TimeBox val={timeLeft.seconds} label="Detik" />
             </div>

             <div className="absolute bottom-8 z-20 animate-bounce text-white/50">
                 <ChevronDown size={32}/>
             </div>
        </header>

        {/* 2. QUOTE SECTION */}
        <section className="py-20 px-6 relative z-10">
            <div className="max-w-3xl mx-auto glass rounded-[2rem] p-10 text-center relative border-t border-[#fbbf24]/30">
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0f172a] p-3 rounded-full border border-[#fbbf24]/50">
                     <Heart fill="#fbbf24" className="text-[#fbbf24]" size={24}/>
                 </div>
                 <p className="font-modern text-lg md:text-xl leading-relaxed italic text-gray-300 mt-4">
                     "{data?.quote || "Dan segala sesuatu Kami ciptakan berpasang-pasangan supaya kamu mengingat kebesaran Allah."}"
                 </p>
                 <p className="mt-6 font-bold text-[#fbbf24] tracking-widest text-xs uppercase">— {data?.quote_source || "Maha Suci Allah"}</p>
            </div>
        </section>

        {/* 3. COUPLE PROFILES */}
        <section className="py-10 px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 md:gap-8 items-center">
                
                {/* Groom */}
                <div className="text-center group">
                    <div className="relative w-64 h-64 mx-auto mb-6">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-[#fbbf24] rounded-full blur-[30px] opacity-20 group-hover:opacity-40 transition duration-700"></div>
                        <div className="relative w-full h-full rounded-full border-[3px] border-[#fbbf24]/30 p-2">
                             <img src={photos.groom} alt="Groom" className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition duration-500" />
                        </div>
                    </div>
                    <h2 className="font-celestial text-5xl text-[#fbbf24] mb-2">{groom}</h2>
                    <p className="font-modern text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">Putra dari Pasangan</p>
                    <p className="font-modern text-sm text-gray-200">{data?.groom_parents}</p>
                    <div className="mt-4 flex justify-center gap-3">
                         <a href="#" className="p-2 glass rounded-full hover:bg-[#fbbf24] hover:text-black transition"><Instagram size={18}/></a>
                    </div>
                </div>

                {/* Bride */}
                <div className="text-center group">
                    <div className="relative w-64 h-64 mx-auto mb-6">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-[#fbbf24] rounded-full blur-[30px] opacity-20 group-hover:opacity-40 transition duration-700"></div>
                        <div className="relative w-full h-full rounded-full border-[3px] border-[#fbbf24]/30 p-2">
                             <img src={photos.bride} alt="Bride" className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition duration-500" />
                        </div>
                    </div>
                    <h2 className="font-celestial text-5xl text-[#fbbf24] mb-2">{bride}</h2>
                    <p className="font-modern text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">Putri dari Pasangan</p>
                    <p className="font-modern text-sm text-gray-200">{data?.bride_parents}</p>
                    <div className="mt-4 flex justify-center gap-3">
                         <a href="#" className="p-2 glass rounded-full hover:bg-[#fbbf24] hover:text-black transition"><Instagram size={18}/></a>
                    </div>
                </div>

            </div>
        </section>

        {/* 4. EVENTS (Glass Cards) */}
        <section className="py-24 px-4 relative overflow-hidden">
            {/* Background Nebulas */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>

            <h2 className="text-center font-celestial text-5xl text-[#fbbf24] mb-12 drop-shadow-md">Wedding Events</h2>
            
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 relative z-10">
                {/* Akad */}
                <div className="glass p-8 rounded-2xl text-center border-t-4 border-t-[#fbbf24] hover:scale-[1.02] transition duration-300">
                    <div className="w-12 h-12 mx-auto bg-[#fbbf24]/10 rounded-full flex items-center justify-center text-[#fbbf24] mb-4">
                        <Star size={24} fill="#fbbf24" />
                    </div>
                    <h3 className="font-modern font-bold text-2xl text-white mb-6">Akad Nikah</h3>
                    <div className="space-y-4 font-modern text-sm text-gray-300">
                         <div className="flex items-center justify-center gap-2">
                             <Calendar size={16} className="text-[#fbbf24]"/> {formattedDate}
                         </div>
                         <div className="flex items-center justify-center gap-2">
                             <Clock size={16} className="text-[#fbbf24]"/> {data?.akad_time}
                         </div>
                         <div className="flex items-center justify-center gap-2 px-6">
                             <MapPin size={16} className="text-[#fbbf24] shrink-0"/> {data?.venue_name}
                         </div>
                    </div>
                </div>

                {/* Resepsi */}
                <div className="glass p-8 rounded-2xl text-center border-t-4 border-t-purple-500 hover:scale-[1.02] transition duration-300">
                     <div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 mb-4">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="font-modern font-bold text-2xl text-white mb-6">Resepsi</h3>
                    <div className="space-y-4 font-modern text-sm text-gray-300">
                         <div className="flex items-center justify-center gap-2">
                             <Calendar size={16} className="text-purple-400"/> {formattedDate}
                         </div>
                         <div className="flex items-center justify-center gap-2">
                             <Clock size={16} className="text-purple-400"/> {data?.resepsi_time}
                         </div>
                         <div className="flex items-center justify-center gap-2 px-6">
                             <MapPin size={16} className="text-purple-400 shrink-0"/> {data?.venue_address}
                         </div>
                         
                         <a href={data?.maps_link} target="_blank" className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-6 py-2 rounded-full transition shadow-lg shadow-purple-900/50">
                            <span className="flex items-center gap-2"><Navigation size={12}/> Open Map</span>
                         </a>
                    </div>
                </div>
            </div>
        </section>

        {/* 5. GALLERY (Glowing Grid) */}
        {gallery.length > 0 && (
          <section className="py-16 px-4">
              <div className="text-center mb-10">
                  <h2 className="font-celestial text-5xl text-white">Our Gallery</h2>
                  <p className="font-modern text-xs text-gray-400 tracking-widest mt-2">CAPTURED MEMORIES</p>
              </div>
              <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {gallery.map((url, i) => (
                      <div key={i} className="relative group overflow-hidden rounded-lg">
                          <img src={url} alt="Gallery" className="w-full h-64 object-cover transform group-hover:scale-110 transition duration-700 opacity-80 group-hover:opacity-100" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center border-4 border-[#fbbf24]/0 group-hover:border-[#fbbf24]/50">
                              <Heart className="text-[#fbbf24] fill-[#fbbf24] animate-bounce"/>
                          </div>
                      </div>
                  ))}
              </div>
          </section>
        )}

        {/* 6. GIFT SECTION */}
        <section className="py-20 px-4">
            <div className="max-w-2xl mx-auto glass rounded-3xl p-8 md:p-12 text-center border border-white/5 relative shadow-[0_0_50px_rgba(251,191,36,0.1)]">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#0f172a] rounded-full border border-[#fbbf24] flex items-center justify-center">
                    <Gift className="text-[#fbbf24]" size={20}/>
                </div>
                
                <h2 className="font-celestial text-4xl text-[#fbbf24] mb-6 mt-4">Wedding Gift</h2>
                <p className="font-modern text-sm text-gray-400 mb-8 px-4">
                    Kehadiran dan doa restu Anda adalah kado terindah bagi kami. Namun, jika Anda ingin memberikan tanda kasih, kami menyediakan dompet digital.
                </p>

                <div className="grid gap-4">
                    {banks.map((bank, i) => (
                        <div key={i} className="bg-[#0f172a]/80 p-4 rounded-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                             <div className="text-left">
                                 <p className="font-bold text-[#fbbf24] text-sm uppercase">{bank.bank}</p>
                                 <p className="font-modern text-xs text-gray-400">a.n {bank.name}</p>
                             </div>
                             <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                 <span className="font-mono text-white tracking-widest">{bank.number}</span>
                                 <button onClick={() => {navigator.clipboard.writeText(bank.number); alert("Tersalin!")}} className="text-[#fbbf24] hover:text-white transition">
                                     <Copy size={16}/>
                                 </button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 text-center bg-[#020617] relative z-10 border-t border-white/5">
            <h2 className="font-celestial text-4xl text-white opacity-80 mb-4">{groom} & {bride}</h2>
            <p className="font-modern text-[10px] text-gray-500 tracking-[0.3em]">THANK YOU FOR YOUR LOVE & PRAYERS</p>
        </footer>

      </div>

      {/* AUDIO FLOATING BUTTON */}
      <button 
        onClick={toggleAudio}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center border border-[#fbbf24]/50 text-[#fbbf24] bg-[#0f172a]/80 backdrop-blur-md shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all ${isPlaying ? 'animate-spin-slow' : ''}`}
      >
          {isPlaying ? <Music size={20}/> : <Play size={20} className="ml-1"/>}
      </button>

      <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3"} loop />
    
    </div>
  );
}

// Helper Components
function TimeBox({ val, label }) {
    return (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl glass flex items-center justify-center text-2xl md:text-3xl font-bold text-[#fbbf24] shadow-lg border-t border-white/20">
                {String(val).padStart(2, '0')}
            </div>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 mt-2 font-modern font-bold">{label}</span>
        </div>
    );
}