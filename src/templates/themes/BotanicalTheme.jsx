import { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Clock, Copy, Music, Heart, ChevronDown, 
  Mail, Gift, Play, Calendar, Star, Moon, Sparkles, Navigation
} from 'lucide-react';

export default function CelestialTheme({ groom, bride, date, guestName, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- SAFE DATA HANDLING (Agar tidak error/hilang) ---
  // Kita buat default value jika data dari 'TemplateDemo' belum masuk
  const groomName = groom || "Groom";
  const brideName = bride || "Bride";
  
  // Ambil data orang tua dengan fallback string
  const groomParents = data?.groom_parents || "Putra dari Bpk. Fulan & Ibu Fulanah";
  const brideParents = data?.bride_parents || "Putri dari Bpk. Fulan & Ibu Fulanah";

  const defaultImages = {
    cover: "https://images.unsplash.com/photo-1532975461948-2619c362a266?w=800&auto=format&fit=crop",
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

  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
    // MAIN CONTAINER
    <div className="bg-[#0f172a] text-[#e2e8f0] min-h-screen relative overflow-x-hidden selection:bg-[#fbbf24] selection:text-[#0f172a]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Quicksand:wght@300;400;600;700&display=swap');
        
        /* Tambahkan fallback font agar teks tidak hilang jika loading lambat */
        .font-celestial { font-family: 'Great Vibes', cursive, serif; }
        .font-modern { font-family: 'Quicksand', sans-serif; }
        
        /* Glassmorphism */
        .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Animations */
        .animate-float-slow { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
      `}</style>

      {/* --- COVER MODAL (OPENING) --- */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 bg-[#020617] ${isOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
          <div className="relative z-10 text-center p-8 w-full max-w-md">
              <div className="w-40 h-40 mx-auto rounded-full border-2 border-[#fbbf24] p-2 mb-8 animate-spin-slow relative">
                   <div className="w-full h-full rounded-full overflow-hidden border border-[#fbbf24]/50">
                        <img src={photos.cover} className="w-full h-full object-cover" alt="Cover"/>
                   </div>
              </div>
              
              <h2 className="font-modern text-sm tracking-[0.4em] text-[#94a3b8] mb-4">THE WEDDING OF</h2>
              <h1 className="font-celestial text-6xl text-[#fbbf24] mb-8 drop-shadow-md">
                  {groomName} <span className="text-white text-3xl">&</span> {brideName}
              </h1>

              <div className="glass rounded-xl p-6 mb-8 mx-4">
                  <p className="font-modern text-xs text-gray-300 mb-2">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
                  <h3 className="font-modern text-xl font-bold text-white capitalize">{guestName || "Tamu Undangan"}</h3>
              </div>

              <button onClick={handleOpen} className="group relative bg-transparent border border-[#fbbf24] text-[#fbbf24] px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-[#fbbf24] hover:text-[#0f172a] transition-all duration-300">
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
             <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen">
                 <img src={photos.cover} className="w-full h-full object-cover blur-sm scale-110" alt="Bg"/>
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent z-10"></div>

             <div className="relative z-20 animate-float-slow">
                 <div className="flex justify-center items-center gap-4 mb-4 text-[#fbbf24]">
                    <Moon size={24} /> <Star size={16} className="mt-4" /> <Sparkles size={24} />
                 </div>
                 
                 <p className="font-modern tracking-[0.5em] text-xs text-[#cbd5e1] mb-2">SAVE THE DATE</p>
                 <h1 className="font-celestial text-7xl md:text-9xl text-[#fbbf24] mb-4 drop-shadow-lg leading-tight">
                    {groomName} <br/> <span className="text-white text-4xl">&</span> <br/> {brideName}
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

        {/* 3. COUPLE PROFILES (Fixed Name & Parents) */}
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
                    {/* Menggunakan variabel groomName yg sudah diamankan */}
                    <h2 className="font-celestial text-5xl text-[#fbbf24] mb-2">{groomName}</h2>
                    <p className="font-modern text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">Putra dari Pasangan</p>
                    <p className="font-modern text-sm text-gray-200">{groomParents}</p>
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
                    {/* Menggunakan variabel brideName yg sudah diamankan */}
                    <h2 className="font-celestial text-5xl text-[#fbbf24] mb-2">{brideName}</h2>
                    <p className="font-modern text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">Putri dari Pasangan</p>
                    <p className="font-modern text-sm text-gray-200">{brideParents}</p>
                </div>

            </div>
        </section>

        {/* 4. EVENTS */}
        <section className="py-24 px-4 relative overflow-hidden">
            <h2 className="text-center font-celestial text-5xl text-[#fbbf24] mb-12 drop-shadow-md">Wedding Events</h2>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 relative z-10">
                {/* Akad */}
                <div className="glass p-8 rounded-2xl text-center border-t-4 border-t-[#fbbf24]">
                    <div className="w-12 h-12 mx-auto bg-[#fbbf24]/10 rounded-full flex items-center justify-center text-[#fbbf24] mb-4">
                        <Star size={24} fill="#fbbf24" />
                    </div>
                    <h3 className="font-modern font-bold text-2xl text-white mb-6">Akad Nikah</h3>
                    <div className="space-y-4 font-modern text-sm text-gray-300">
                         <div className="flex items-center justify-center gap-2"><Calendar size={16} className="text-[#fbbf24]"/> {formattedDate}</div>
                         <div className="flex items-center justify-center gap-2"><Clock size={16} className="text-[#fbbf24]"/> {data?.akad_time}</div>
                         <div className="flex items-center justify-center gap-2 px-6"><MapPin size={16} className="text-[#fbbf24] shrink-0"/> {data?.venue_name}</div>
                    </div>
                </div>

                {/* Resepsi */}
                <div className="glass p-8 rounded-2xl text-center border-t-4 border-t-purple-500">
                     <div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 mb-4">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="font-modern font-bold text-2xl text-white mb-6">Resepsi</h3>
                    <div className="space-y-4 font-modern text-sm text-gray-300">
                         <div className="flex items-center justify-center gap-2"><Calendar size={16} className="text-purple-400"/> {formattedDate}</div>
                         <div className="flex items-center justify-center gap-2"><Clock size={16} className="text-purple-400"/> {data?.resepsi_time}</div>
                         <div className="flex items-center justify-center gap-2 px-6"><MapPin size={16} className="text-purple-400 shrink-0"/> {data?.venue_address}</div>
                         
                         <a href={data?.maps_link} target="_blank" className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-6 py-2 rounded-full transition">
                            <span className="flex items-center gap-2"><Navigation size={12}/> Open Map</span>
                         </a>
                    </div>
                </div>
            </div>
        </section>

        {/* 5. GALLERY */}
        {gallery.length > 0 && (
          <section className="py-16 px-4">
              <div className="text-center mb-10">
                  <h2 className="font-celestial text-5xl text-white">Our Gallery</h2>
              </div>
              <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {gallery.map((url, i) => (
                      <div key={i} className="relative group overflow-hidden rounded-lg">
                          <img src={url} alt="Gallery" className="w-full h-64 object-cover transform group-hover:scale-110 transition duration-700" />
                      </div>
                  ))}
              </div>
          </section>
        )}

        {/* 6. GIFT */}
        <section className="py-20 px-4">
            <div className="max-w-2xl mx-auto glass rounded-3xl p-8 md:p-12 text-center border border-white/5 relative">
                <Gift className="mx-auto text-[#fbbf24] mb-4" size={32}/>
                <h2 className="font-celestial text-4xl text-[#fbbf24] mb-6">Wedding Gift</h2>
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

        <footer className="py-12 text-center bg-[#020617] border-t border-white/5">
            <h2 className="font-celestial text-4xl text-white opacity-80 mb-4">{groomName} & {brideName}</h2>
            <p className="font-modern text-[10px] text-gray-500 tracking-[0.3em]">THANK YOU</p>
        </footer>

      </div>

      {/* AUDIO */}
      <button 
        onClick={toggleAudio}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center border border-[#fbbf24]/50 text-[#fbbf24] bg-[#0f172a]/80 backdrop-blur-md transition-all ${isPlaying ? 'animate-spin-slow' : ''}`}
      >
          {isPlaying ? <Music size={20}/> : <Play size={20} className="ml-1"/>}
      </button>

      <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3"} loop />
    
    </div>
  );
}

// Helper
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