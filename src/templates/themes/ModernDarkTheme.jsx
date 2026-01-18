import { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Clock, Copy, Music, Heart, ArrowDown, 
  Mail, Gift, Play, Pause, Calendar, Star, Gem
} from 'lucide-react';

export default function ModernDarkTheme({ groom, bride, date, guestName, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioUrl = data?.audio_url || '';

  
  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- DATA & ASSETS ---
  const defaultImages = {
    cover: "https://images.unsplash.com/photo-1532712938310-34cb3958d425?w=800&auto=format&fit=crop", 
    man: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop",
    woman: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop",
    couple: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop"
  };

  const photos = {
    cover: data?.cover_photo || defaultImages.cover,
    groom: data?.groom_photo || defaultImages.man,
    bride: data?.bride_photo || defaultImages.woman,
    header: data?.cover_photo || defaultImages.couple 
  };

  const gallery = data?.gallery || [];
  const banks = data?.banks || [];
  const quote = data?.quote || "And of His signs is that He created for you from yourselves mates that you may find tranquility in them.";
  const quoteSource = data?.quote_src || "QS. Ar-Rum: 21";
  
  // DATA ORANG TUA (Mengambil dari props data atau default)
  const details = {
    venue_name: data?.venue_name || "The Ritz-Carlton",
    venue_address: data?.venue_address || "Pacific Place, Jakarta",
    maps_link: data?.maps_link || "#",
    akad_time: data?.akad_time || "16:00 WIB",
    resepsi_time: data?.resepsi_time || "19:00 WIB",
    groom_parents: data?.groom_parents || "Bpk. Nama Ayah & Ibu Nama Ibu",
    bride_parents: data?.bride_parents || "Bpk. Nama Ayah & Ibu Nama Ibu"
  };

  const formattedDate = new Date(date || new Date()).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).toUpperCase();

  // --- ACTIONS ---
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

  const openInvitation = () => { setIsOpen(true); toggleAudio(true); };
  
  const toggleAudio = (play) => {
    if (audioRef.current) {
        if (play ?? !audioPlaying) {
            audioRef.current.play().catch(() => {});
            setAudioPlaying(true);
        } else {
            audioRef.current.pause();
            setAudioPlaying(false);
        }
    }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Copied to clipboard.'); };

  return (
    <div className="font-sans bg-[#0F0F0F] text-[#E5E5E5] min-h-screen relative overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">
      
      {/* FONTS INJECTION */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,700&family=Montserrat:wght@300;400;600&display=swap');
        
        .font-luxury { font-family: 'Bodoni Moda', serif; }
        .font-modern { font-family: 'Montserrat', sans-serif; }
        
        /* Custom Scrollbar for Gallery */
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        .animate-slide-up { animation: slideUp 1s ease-out forwards; }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .bg-grain {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* --- COVER DEPAN (GATE OPENING) --- */}
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#0F0F0F] transition-all duration-[1.5s] ease-[cubic-bezier(0.87,0,0.13,1)] ${isOpen ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
         
         <div className="absolute inset-0 bg-black/60 z-0"></div>
         <div className="absolute inset-0 z-[-1] bg-cover bg-center grayscale" style={{ backgroundImage: `url(${photos.cover})` }}></div>
         
         <div className="relative z-10 text-center border-y border-[#D4AF37] py-12 px-6 animate-slide-up bg-black/40 backdrop-blur-sm w-full max-w-md">
            <p className="text-xs tracking-[0.5em] uppercase text-[#D4AF37] mb-6 font-modern">The Wedding Celebration</p>
            <h1 className="font-luxury text-5xl md:text-7xl mb-4 leading-none text-white">
              {groom} <span className="text-[#D4AF37] block text-3xl my-2">&</span> {bride}
            </h1>
            <p className="text-xs font-modern text-gray-300 mt-6 tracking-widest">SPECIAL INVITATION FOR</p>
            <h3 className="text-xl font-luxury mt-2 capitalize text-white">{guestName || "Distinguished Guest"}</h3>
            
            <button onClick={openInvitation} className="mt-10 px-8 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-500 text-xs tracking-[0.3em] uppercase font-bold">
                Open Invitation
            </button>
         </div>
      </div>


      {/* --- KONTEN UTAMA --- */}
      <div className={`transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* 1. HERO SECTION (EDITORIAL STYLE) */}
        <header className="min-h-screen relative flex items-center justify-center overflow-hidden bg-grain">
           <div className="absolute inset-0 z-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${photos.header})` }}></div>
           <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-[#0F0F0F] z-10"></div>
           
           <div className="relative z-20 text-center w-full px-6">
              <div className="border-l border-[#D4AF37] pl-6 text-left max-w-lg mx-auto md:ml-20">
                  <p className="text-[#D4AF37] text-sm tracking-[0.4em] mb-2 font-modern">SAVE THE DATE</p>
                  <h1 className="font-luxury text-7xl md:text-9xl leading-[0.8] mb-6 text-white mix-blend-overlay opacity-90">
                    FOREVER<br/>BEGINS<br/>NOW.
                  </h1>
                  <p className="font-modern text-xl text-white tracking-widest border-t border-gray-700 pt-4 inline-block">
                    {formattedDate}
                  </p>
              </div>
           </div>

           {/* COUNTDOWN LINEAR */}
           <div className="absolute bottom-10 left-0 right-0 z-20">
              <div className="flex justify-center gap-8 md:gap-16 text-[#D4AF37] font-modern text-center">
                 <div className="flex flex-col"><span className="text-3xl font-luxury">{timeLeft.days}</span><span className="text-[10px] tracking-widest uppercase text-gray-500">Days</span></div>
                 <div className="flex flex-col"><span className="text-3xl font-luxury">{timeLeft.hours}</span><span className="text-[10px] tracking-widest uppercase text-gray-500">Hrs</span></div>
                 <div className="flex flex-col"><span className="text-3xl font-luxury">{timeLeft.minutes}</span><span className="text-[10px] tracking-widest uppercase text-gray-500">Mins</span></div>
                 <div className="flex flex-col"><span className="text-3xl font-luxury">{timeLeft.seconds}</span><span className="text-[10px] tracking-widest uppercase text-gray-500">Sec</span></div>
              </div>
           </div>
        </header>


        {/* 2. INTRO & COUPLE (REVISED LAYOUT) */}
        <section className="py-24 px-6 max-w-6xl mx-auto bg-grain">
           <div className="flex flex-col md:flex-row items-start gap-12">
              
              {/* Quote Text (Tetap di Kiri) */}
              <div className="md:w-1/3 pt-10 sticky top-10">
                 <Gem className="w-8 h-8 text-[#D4AF37] mb-6" />
                 <p className="font-luxury text-2xl md:text-3xl leading-snug text-gray-300 mb-6">
                   "{quote}"
                 </p>
                 <p className="text-[#D4AF37] text-xs tracking-widest font-modern uppercase">— {quoteSource}</p>
              </div>

              {/* Couple Photos (Perbaikan Layout) */}
              {/* Ubah gap-8 menjadi gap-16 agar lebih lega */}
              <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-16 relative">
                 
                 {/* Groom Card */}
                 <div className="relative group">
                    <div className="absolute -inset-2 border border-[#D4AF37] opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img src={photos.groom} className="w-full h-[450px] object-cover grayscale group-hover:grayscale-0 transition duration-700" alt="Groom" />
                    
                    {/* PERBAIKAN: Posisi Text Box dipindah ke KIRI (left-0) agar tidak tabrakan */}
                    <div className="bg-[#1A1A1A] p-6 absolute -bottom-10 left-0 md:-left-8 shadow-2xl border-r-2 border-[#D4AF37] max-w-[260px] text-left z-20">
                       <h3 className="font-luxury text-3xl mb-1">{groom}</h3>
                       <p className="text-[10px] text-[#D4AF37] font-modern tracking-widest uppercase mb-3">The Groom</p>
                       <div className="w-full h-px bg-white/10 mb-3"></div>
                       <p className="text-[10px] text-gray-500 font-modern uppercase tracking-wider mb-1">Putra dari Pasangan</p>
                       <p className="text-xs text-gray-300 font-modern leading-relaxed font-bold">
                           {details.groom_parents}
                       </p>
                    </div>
                 </div>

                 {/* Bride Card */}
                 <div className="relative group md:mt-24 mt-16">
                    <div className="absolute -inset-2 border border-[#D4AF37] opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img src={photos.bride} className="w-full h-[450px] object-cover grayscale group-hover:grayscale-0 transition duration-700" alt="Bride" />
                    
                    {/* PERBAIKAN: Posisi Text Box dipindah ke KANAN (right-0) agar tidak tabrakan */}
                    <div className="bg-[#1A1A1A] p-6 absolute -bottom-10 right-0 md:-right-8 shadow-2xl border-l-2 border-[#D4AF37] max-w-[260px] text-right z-20">
                       <h3 className="font-luxury text-3xl mb-1">{bride}</h3>
                       <p className="text-[10px] text-[#D4AF37] font-modern tracking-widest uppercase mb-3">The Bride</p>
                       <div className="w-full h-px bg-white/10 mb-3"></div>
                       <p className="text-[10px] text-gray-500 font-modern uppercase tracking-wider mb-1">Putri dari Pasangan</p>
                       <p className="text-xs text-gray-300 font-modern leading-relaxed font-bold">
                           {details.bride_parents}
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </section>


        {/* 3. EVENT DETAILS (VERTICAL TIMELINE) */}
        <section className="py-24 bg-[#0A0A0A] relative border-y border-gray-900 mt-12 md:mt-0">
           <div className="max-w-4xl mx-auto px-6 relative">
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-[#D4AF37] opacity-30"></div>
              
              <div className="text-center mb-16">
                 <h2 className="font-luxury text-5xl text-white mb-2">The Schedule</h2>
                 <p className="font-modern text-[#D4AF37] text-xs tracking-[0.3em] uppercase">Order of Events</p>
              </div>

              {/* Akad */}
              <div className="flex flex-col md:flex-row items-center mb-16 relative">
                 <div className="md:w-1/2 p-6 md:text-right md:pr-12 order-2 md:order-1">
                    <h3 className="font-luxury text-3xl text-[#D4AF37] mb-2">Holy Matrimony</h3>
                    <p className="text-xl text-white font-modern mb-1">{details.akad_time}</p>
                    <p className="text-sm text-gray-500">{details.venue_name}</p>
                 </div>
                 <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-[#D4AF37] rounded-full border-4 border-black z-10"></div>
                 <div className="md:w-1/2 p-6 md:pl-12 order-3 md:order-2 opacity-50">
                    <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                       The sacred moment where we vow our eternal love before God and our beloved family.
                    </p>
                 </div>
              </div>

              {/* Resepsi */}
              <div className="flex flex-col md:flex-row items-center relative">
                 <div className="md:w-1/2 p-6 md:text-right md:pr-12 order-2 md:order-1 opacity-50 hidden md:block">
                    <p className="text-sm text-gray-600 leading-relaxed max-w-xs ml-auto">
                       Join us for a night of celebration, dinner, and dancing as we start our journey together.
                    </p>
                 </div>
                 <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-[#D4AF37] rounded-full border-4 border-black z-10"></div>
                 <div className="md:w-1/2 p-6 md:pl-12 order-3 md:order-2">
                    <h3 className="font-luxury text-3xl text-[#D4AF37] mb-2">Wedding Reception</h3>
                    <p className="text-xl text-white font-modern mb-1">{details.resepsi_time}</p>
                    <p className="text-sm text-gray-500">{details.venue_name}</p>
                    <div className="mt-6">
                        <a href={details.maps_link} target="_blank" className="inline-flex items-center gap-2 text-xs border-b border-[#D4AF37] pb-1 hover:text-[#D4AF37] transition">
                            VIEW LOCATION <MapPin className="w-3 h-3" />
                        </a>
                    </div>
                 </div>
              </div>
           </div>
        </section>


        {/* 4. GALLERY (FILM STRIP) */}
        {gallery.length > 0 && (
          <section className="py-24 overflow-hidden">
             <div className="px-6 mb-10 flex justify-between items-end max-w-6xl mx-auto">
                <div>
                    <h2 className="font-luxury text-4xl mb-2">Visual Story</h2>
                    <p className="text-xs text-gray-500 font-modern tracking-widest uppercase">Captured Moments</p>
                </div>
                <div className="text-[#D4AF37] animate-bounce"><ArrowDown className="w-6 h-6 rotate-[-90deg]" /></div>
             </div>

             <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 pb-8 hide-scroll">
                {gallery.map((url, idx) => (
                   <div key={idx} className="snap-center shrink-0 w-[80vw] md:w-[400px] h-[500px] relative group">
                      <div className="absolute inset-0 border border-white/10 group-hover:border-[#D4AF37] transition duration-500 z-10 pointer-events-none"></div>
                      <img src={url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700 ease-in-out" alt="Gallery"/>
                      <div className="absolute bottom-4 left-4 text-xs font-modern text-white bg-black/50 px-2 py-1">
                          NO. {String(idx + 1).padStart(2, '0')}
                      </div>
                   </div>
                ))}
             </div>
          </section>
        )}


        {/* 5. GIFT & RSVP */}
        <section className="py-24 px-6 bg-[#0A0A0A]">
           <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-luxury text-4xl mb-12 text-[#D4AF37]">Wedding Gift</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                 {banks.map((bank, idx) => (
                    <div key={idx} className="bg-[#1A1A1A] p-8 border border-white/5 hover:border-[#D4AF37] transition duration-500 text-left relative group">
                        <div className="absolute top-4 right-4 text-[#D4AF37] opacity-20 group-hover:opacity-100 transition"><Gift className="w-5 h-5"/></div>
                        <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4">{bank.bank}</p>
                        <p className="font-luxury text-2xl mb-2 text-white tracking-wide">{bank.number}</p>
                        <p className="text-xs font-modern text-gray-400 mb-6 uppercase">A.N {bank.name}</p>
                        <button onClick={() => copyToClipboard(bank.number)} className="text-[#D4AF37] text-xs font-bold border border-[#D4AF37] px-4 py-2 hover:bg-[#D4AF37] hover:text-black transition uppercase">
                           Copy Number
                        </button>
                    </div>
                 ))}
              </div>
           </div>
        </section>


        {/* 6. FOOTER */}
        <footer className="py-12 border-t border-white/10 text-center">
            <h1 className="font-luxury text-3xl mb-4 text-gray-600">{groom} & {bride}</h1>
            <p className="text-[10px] font-modern text-gray-700 tracking-[0.2em] uppercase">
                The Wedding &copy; 2026
            </p>
        </footer>


        {/* 7. MUSIC CONTROL */}
        <button 
          onClick={() => toggleAudio()}
          className={`fixed bottom-8 right-8 z-40 bg-[#D4AF37] text-black p-3 rounded-none shadow-lg hover:bg-white transition-colors duration-300`}
        >
          {audioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current"/>}
        </button>
        
        {audioUrl && <audio ref={audioRef} src={audioUrl} loop />}
      </div>
    </div>
  );
}