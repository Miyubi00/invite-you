import { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Clock, Music, Play, Pause, ChevronDown, Heart } from 'lucide-react';

export default function JavaneseTheme({ groom, bride, date, guestName, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- DATA ---
  const defaultImages = {
    cover: "https://images.unsplash.com/photo-1519225421980-715cb0202128?w=800&auto=format&fit=crop", 
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

  // --- HANDLERS ---
  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => {
          if(audioRef.current) audioRef.current.play().catch(() => {});
          setIsPlaying(true);
      }, 800);
  };

  return (
    // CONTAINER: Warna Krem Gading (#FDFBF7)
    <div className="bg-[#FDFBF7] text-[#3E2723] min-h-screen relative overflow-x-hidden selection:bg-[#B8860B] selection:text-white">

      {/* --- CSS & FONTS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Noto+Serif+Javanese:wght@400;600&family=Playfair+Display:ital@0;1&display=swap');
        
        .font-jawa { font-family: 'Noto Serif Javanese', serif; }
        .font-classic { font-family: 'Playfair Display', serif; }
        .font-royal { font-family: 'Cinzel', serif; }
        
        /* Motif Batik Kawung Sederhana (CSS Pattern - Dijamin Muncul) */
        .bg-kawung {
            background-color: #FDFBF7;
            background-image: 
                radial-gradient(circle at 100% 150%, #FDFBF7 24%, #D4AF37 25%, #D4AF37 28%, #FDFBF7 29%, #FDFBF7 36%, #D4AF37 36%, #D4AF37 40%, transparent 40%, transparent),
                radial-gradient(circle at 0    150%, #FDFBF7 24%, #D4AF37 25%, #D4AF37 28%, #FDFBF7 29%, #FDFBF7 36%, #D4AF37 36%, #D4AF37 40%, transparent 40%, transparent),
                radial-gradient(circle at 50%  100%, #D4AF37 10%, #FDFBF7 11%, #FDFBF7 23%, #D4AF37 24%, #D4AF37 30%, #FDFBF7 31%, #FDFBF7 43%, #D4AF37 44%, #D4AF37 50%, #FDFBF7 51%, #FDFBF7 63%, #D4AF37 64%, #D4AF37 71%, transparent 71%, transparent),
                radial-gradient(circle at 100% 50%, #FDFBF7 5%, #D4AF37 6%, #D4AF37 15%, #FDFBF7 16%, #FDFBF7 20%, #D4AF37 21%, #D4AF37 30%, #FDFBF7 31%, #FDFBF7 43%, #D4AF37 44%, #D4AF37 50%, #FDFBF7 51%, #FDFBF7 63%, #D4AF37 64%, #D4AF37 71%, transparent 71%, transparent),
                radial-gradient(circle at 0    50%, #FDFBF7 5%, #D4AF37 6%, #D4AF37 15%, #FDFBF7 16%, #FDFBF7 20%, #D4AF37 21%, #D4AF37 30%, #FDFBF7 31%, #FDFBF7 43%, #D4AF37 44%, #D4AF37 50%, #FDFBF7 51%, #FDFBF7 63%, #D4AF37 64%, #D4AF37 71%, transparent 71%, transparent);
            background-size: 50px 50px;
            opacity: 0.05;
        }

        /* Texture Kertas */
        .texture-paper {
            background-image: url("https://www.transparenttextures.com/patterns/cream-paper.png");
            opacity: 0.8;
        }

        /* Gunungan Animation */
        @keyframes pulse-gold {
            0% { filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.3)); transform: scale(1); }
            50% { filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.6)); transform: scale(1.02); }
            100% { filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.3)); transform: scale(1); }
        }
        .animate-gunungan { animation: pulse-gold 4s ease-in-out infinite; }
      `}</style>

      {/* --- BACKGROUND LAYERS --- */}
      <div className="fixed inset-0 bg-kawung z-0 pointer-events-none"></div>
      <div className="fixed inset-0 texture-paper z-0 pointer-events-none mix-blend-multiply"></div>

      {/* --- OPENING COVER (MODAL) --- */}
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1C1917] text-[#D4AF37] transition-all duration-[1.5s] ease-in-out ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
          
          {/* Ornamen Sudut (CSS Pure) */}
          <div className="absolute top-4 left-4 w-24 h-24 border-t-2 border-l-2 border-[#D4AF37] opacity-60 rounded-tl-3xl"></div>
          <div className="absolute top-4 right-4 w-24 h-24 border-t-2 border-r-2 border-[#D4AF37] opacity-60 rounded-tr-3xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 border-b-2 border-l-2 border-[#D4AF37] opacity-60 rounded-bl-3xl"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 border-b-2 border-r-2 border-[#D4AF37] opacity-60 rounded-br-3xl"></div>

          <div className="relative z-10 text-center p-8 max-w-md w-full">
              {/* SVG Gunungan (Inline Fixed) */}
              <div className="mb-6 mx-auto w-32 h-40 text-[#D4AF37] animate-gunungan">
                <GununganIcon />
              </div>

              <p className="font-royal text-sm tracking-[0.3em] uppercase text-[#A8A29E] mb-6">Pahargyan Temanten</p>
              
              <h1 className="font-classic text-4xl md:text-5xl text-[#FDFBF7] mb-8 leading-tight">
                  {groom} <br/> <span className="text-2xl text-[#D4AF37] font-serif italic">&</span> <br/> {bride}
              </h1>
              
              <div className="border-t border-b border-[#D4AF37]/30 py-6 mb-8 mx-auto w-3/4">
                  <p className="font-jawa text-sm text-[#A8A29E] mb-2 italic">Katur Dhumateng:</p>
                  <h3 className="font-classic text-2xl text-[#D4AF37] capitalize">{guestName || "Tamu Kehormatan"}</h3>
              </div>

              <button 
                  onClick={handleOpen}
                  className="bg-[#D4AF37] hover:bg-[#997B28] text-[#1C1917] px-12 py-3 rounded-full font-royal font-bold tracking-widest transition-all duration-500 hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                  BUKA UNDANGAN
              </button>
          </div>
      </div>

      {/* --- CONTENT WRAPPER --- */}
      <div className={`transition-opacity duration-1000 delay-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

        {/* 1. HERO SECTION */}
        <header className="min-h-screen relative flex flex-col items-center justify-center text-center px-6 overflow-hidden border-b-4 border-[#D4AF37]">
            {/* Background Image Parallax */}
            <div className="absolute inset-0 z-[-1]">
                <div className="absolute inset-0 bg-[#291e1a] opacity-70 z-10 mix-blend-multiply"></div>
                <img src={photos.cover} className="w-full h-full object-cover grayscale-[20%] sepia-[30%]" alt="Cover"/>
            </div>

            <div className="relative z-20 text-[#FDFBF7] border-y-2 border-[#D4AF37]/50 p-8 md:p-12 backdrop-blur-[2px] max-w-3xl w-full">
                <p className="font-royal text-xs md:text-sm tracking-[0.4em] mb-4 uppercase text-[#D4AF37]">The Wedding Of</p>
                <h1 className="font-classic text-5xl md:text-7xl mb-6 drop-shadow-lg">{groom} <span className="text-3xl align-middle italic text-[#D4AF37]">&</span> {bride}</h1>
                <p className="font-jawa text-lg py-2">
                   {formattedDate}
                </p>

                {/* COUNTDOWN CLASSIC STYLE */}
                <div className="mt-10 flex flex-wrap justify-center gap-4 md:gap-8">
                    <CountdownBox value={timeLeft.days} label="Dinten" />
                    <CountdownBox value={timeLeft.hours} label="Jam" />
                    <CountdownBox value={timeLeft.minutes} label="Menit" />
                    <CountdownBox value={timeLeft.seconds} label="Detik" />
                </div>
            </div>

            <div className="absolute bottom-8 animate-bounce text-[#FDFBF7]/70">
                <ChevronDown size={32} strokeWidth={1} />
            </div>
        </header>

        {/* 2. SALAM PEMBUKA (Filosofis) */}
        <section className="py-24 px-6 text-center bg-[#FDFBF7] relative">
            <div className="max-w-3xl mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 text-[#3E2723] opacity-30">
                    <GununganIcon />
                </div>
                
                <h2 className="font-jawa text-2xl text-[#3E2723] mb-6 font-bold">Assalamu'alaikum Wr. Wb.</h2>
                
                <p className="font-classic text-xl md:text-2xl text-[#5D4037] italic leading-relaxed mb-8 px-4">
                    "Tansah angajab sih wilasa dalem Gusti Ingkang Murbeng Dumadi, mugi kersa paring berkah pangestu dhumateng dhaup suci punika."
                </p>
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="h-px w-12 bg-[#D4AF37]"></div>
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                    <div className="h-px w-12 bg-[#D4AF37]"></div>
                </div>
                <p className="font-jawa text-sm text-[#795548] leading-loose max-w-xl mx-auto">
                    Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan resepsi pernikahan putra-putri kami:
                </p>
            </div>
        </section>

        {/* 3. MEMPELAI (Gebyok Frame) */}
        <section className="py-20 px-4 bg-[#EBE5CE] border-y border-[#D4AF37]/30">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-16">
                
                {/* Groom */}
                <div className="text-center w-full max-w-sm">
                    <div className="relative p-2 border-2 border-[#8D6E63] rounded-t-full">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#EBE5CE] flex items-center justify-center border border-[#8D6E63] rounded-full z-20">
                             <span className="font-royal text-2xl text-[#3E2723]">P</span>
                         </div>
                         <div className="aspect-[3/4] rounded-t-full overflow-hidden grayscale hover:grayscale-0 transition duration-1000 border border-[#8D6E63]">
                             <img src={photos.groom} alt="Groom" className="w-full h-full object-cover"/>
                         </div>
                    </div>
                    <div className="mt-8">
                        <h2 className="font-classic text-3xl text-[#3E2723] font-bold">{groom}</h2>
                        <p className="font-royal text-xs text-[#556B2F] uppercase tracking-widest mt-2 font-bold">Mempelai Pria</p>
                        <p className="font-jawa text-sm text-[#5D4037] mt-3">{data?.groom_parents}</p>
                    </div>
                </div>

                {/* Separator Gunungan Kecil */}
                <div className="text-[#D4AF37] opacity-50 w-12 h-12 hidden md:block">
                    <GununganIcon />
                </div>

                {/* Bride */}
                <div className="text-center w-full max-w-sm">
                    <div className="relative p-2 border-2 border-[#8D6E63] rounded-t-full">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#EBE5CE] flex items-center justify-center border border-[#8D6E63] rounded-full z-20">
                             <span className="font-royal text-2xl text-[#3E2723]">W</span>
                         </div>
                         <div className="aspect-[3/4] rounded-t-full overflow-hidden grayscale hover:grayscale-0 transition duration-1000 border border-[#8D6E63]">
                             <img src={photos.bride} alt="Bride" className="w-full h-full object-cover"/>
                         </div>
                    </div>
                    <div className="mt-8">
                        <h2 className="font-classic text-3xl text-[#3E2723] font-bold">{bride}</h2>
                        <p className="font-royal text-xs text-[#556B2F] uppercase tracking-widest mt-2 font-bold">Mempelai Wanita</p>
                        <p className="font-jawa text-sm text-[#5D4037] mt-3">{data?.bride_parents}</p>
                    </div>
                </div>

            </div>
        </section>

        {/* 4. PROSESI (Timeline Adat) */}
        <section className="py-24 px-4 bg-[#2c241b] text-[#FDFBF7] relative overflow-hidden">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-kawung opacity-10"></div>
            
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-classic text-4xl text-[#D4AF37] mb-2">Reroncening Adicara</h2>
                    <p className="font-jawa text-xs tracking-[0.3em] text-[#A1887F] uppercase">Jadwal Prosesi Pernikahan</p>
                </div>

                <div className="relative">
                    {/* Garis Tengah */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#D4AF37] opacity-30 hidden md:block"></div>

                    <div className="space-y-12">
                        
                        {/* Akad */}
                        <div className="flex flex-col md:flex-row items-center gap-8 group">
                            <div className="w-full md:w-1/2 text-center md:text-right px-4">
                                <h3 className="font-jawa text-2xl text-[#D4AF37] mb-2">Ijab Qobul</h3>
                                <div className="text-[#D7CCC8] text-sm space-y-1">
                                    <p>{formattedDate}</p>
                                    <p className="font-bold">{data?.akad_time}</p>
                                </div>
                            </div>
                            
                            {/* Icon Center */}
                            <div className="relative z-10 w-12 h-12 bg-[#2c241b] border-2 border-[#D4AF37] rounded-full flex items-center justify-center shrink-0">
                                <div className="w-3 h-3 bg-[#D4AF37] rotate-45"></div>
                            </div>

                            <div className="w-full md:w-1/2 text-center md:text-left px-4">
                                <p className="text-[#D7CCC8] text-sm opacity-80">{data?.venue_name}</p>
                            </div>
                        </div>

                        {/* Resepsi */}
                        <div className="flex flex-col md:flex-row items-center gap-8 group">
                            <div className="w-full md:w-1/2 text-center md:text-right px-4 order-1 md:order-1">
                                <p className="text-[#D7CCC8] text-sm opacity-80">{data?.venue_address}</p>
                                <a href={data?.maps_link} target="_blank" className="inline-block mt-4 text-[10px] text-[#D4AF37] border-b border-[#D4AF37] pb-1 uppercase tracking-widest">
                                    Peta Lokasi
                                </a>
                            </div>
                            
                            {/* Icon Center */}
                            <div className="relative z-10 w-12 h-12 bg-[#D4AF37] border-2 border-[#2c241b] rounded-full flex items-center justify-center shrink-0 order-2">
                                <div className="w-3 h-3 bg-[#2c241b] rotate-45"></div>
                            </div>

                            <div className="w-full md:w-1/2 text-center md:text-left px-4 order-3">
                                <h3 className="font-jawa text-2xl text-[#D4AF37] mb-2">Pahargyan Ageng</h3>
                                <div className="text-[#D7CCC8] text-sm space-y-1">
                                    <p>{formattedDate}</p>
                                    <p className="font-bold">{data?.resepsi_time}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>

        {/* 5. GALLERY (Klasik Frame) */}
        {gallery.length > 0 && (
          <section className="py-24 px-6 bg-[#FDFBF7]">
              <div className="text-center mb-12">
                  <div className="w-10 h-10 mx-auto mb-4 text-[#D4AF37]">
                      <Heart size={40} strokeWidth={1}/>
                  </div>
                  <h2 className="font-classic text-3xl text-[#3E2723]">Candra Kirana</h2>
              </div>
              
              <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-[#8D6E63] outline outline-offset-4 outline-[#8D6E63]/30">
                  {gallery.map((url, i) => (
                      <div key={i} className={`overflow-hidden relative group ${i === 0 || i === 3 ? 'md:col-span-2' : ''}`}>
                          <img src={url} className="w-full h-64 object-cover sepia-[0.4] hover:sepia-0 transition duration-700" alt="Moment"/>
                      </div>
                  ))}
              </div>
          </section>
        )}

        {/* 6. GIFT (Angpao Style) */}
        <section className="py-20 px-6 bg-[#FDFBF7] border-t border-[#D4AF37]/20">
            <div className="max-w-2xl mx-auto text-center border-2 border-[#D4AF37] p-10 outline outline-offset-4 outline-[#D4AF37]/20">
                <h2 className="font-royal text-2xl text-[#3E2723] mb-2">Tali Asih</h2>
                <p className="font-jawa text-sm text-[#795548] mb-8">
                    Doa restu Anda merupakan karunia yang sangat berarti bagi kami.
                </p>
                <div className="grid gap-4">
                    {banks.map((bank, i) => (
                        <div key={i} className="flex flex-col md:flex-row justify-between items-center bg-[#2c241b] p-4 text-[#D4AF37]">
                             <span className="font-bold uppercase tracking-widest">{bank.bank}</span>
                             <div className="flex items-center gap-2">
                                 <span className="font-mono text-white">{bank.number}</span>
                                 <button onClick={() => navigator.clipboard.writeText(bank.number)} className="hover:text-white transition"><Music size={14}/></button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* 7. FOOTER */}
        <footer className="py-12 bg-[#1C1917] text-[#A8A29E] text-center border-t-4 border-[#D4AF37]">
             <div className="max-w-2xl mx-auto px-4">
                 <h2 className="font-classic text-3xl text-[#FDFBF7] mb-2">{groom} & {bride}</h2>
                 <p className="font-jawa text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] mb-8">Matur Nuwun</p>
                 <p className="text-xs opacity-40">Created with respect to tradition.</p>
             </div>
        </footer>

      </div>

      {/* AUDIO PLAYER */}
      <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full border border-[#D4AF37] flex items-center justify-center bg-[#1C1917] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1C1917] transition-all duration-500 shadow-lg ${isPlaying ? 'animate-spin-slow' : ''}`}
          >
              {isPlaying ? <Music size={18}/> : <Play size={18} className="ml-1"/>}
          </button>
      </div>
      
      <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3"} loop />
    </div>
  );
}

// --- SUB COMPONENTS ---

// 1. Countdown Box (Classic Style)
function CountdownBox({ value, label }) {
    return (
        <div className="flex flex-col items-center min-w-[70px]">
            <div className="text-3xl md:text-4xl font-classic text-[#D4AF37] mb-1">
                {String(value).padStart(2, '0')}
            </div>
            <div className="h-px w-full bg-[#D4AF37]/50 mb-1"></div>
            <span className="text-[10px] uppercase tracking-widest font-royal text-[#FDFBF7] opacity-80">{label}</span>
        </div>
    )
}

// 2. Gunungan Icon (SVG Inline - Pasti Muncul)
function GununganIcon() {
    return (
        <svg viewBox="0 0 100 140" fill="currentColor" className="w-full h-full">
            <path d="M50 0 
                     C 30 20, 10 60, 5 90 
                     Q 0 110, 10 120 
                     L 10 140 L 90 140 L 90 120 
                     Q 100 110, 95 90 
                     C 90 60, 70 20, 50 0 Z" />
            <path d="M50 20 
                     L 50 120 M 20 140 L 20 120 M 80 140 L 80 120" 
                     stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
        </svg>
    )
}