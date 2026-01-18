import { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Clock, Copy, Heart, ArrowDown, 
  Mail, Gift, Play, Pause, Calendar, Share2
} from 'lucide-react';

export default function ElegantResponsiveTheme({ groom, bride, date, guestName, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioUrl = data?.audio_url || '';


  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- DATA ---
  const defaultImages = {
    cover: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop",
    man: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop",
    woman: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop",
    couple: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop"
  };

  const photos = {
    cover: data?.cover_photo || defaultImages.cover,
    groom: data?.groom_photo || defaultImages.man,
    bride: data?.bride_photo || defaultImages.woman,
    header: data?.cover_photo || defaultImages.couple 
  };

  const gallery = data?.gallery || [];
  const banks = data?.banks || [];
  const quote = data?.quote || "Dan segala sesuatu Kami ciptakan berpasang-pasangan supaya kamu mengingat kebesaran Allah.";
  const quoteSource = data?.quote_src || "QS. Adz-Dzariyat: 49";
  
  const details = data || {
    venue_name: "Grand Ballroom Hotel",
    venue_address: "Jl. Sudirman No. 1, Jakarta Pusat, DKI Jakarta",
    maps_link: "#",
    akad_time: "08:00 WIB",
    resepsi_time: "11:00 WIB",
    groom_parents: "Bpk. Hendra & Ibu Susi",
    bride_parents: "Bpk. Joko & Ibu Tina"
  };

  const formattedDate = new Date(date || new Date()).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // --- LOGIC ---
  useEffect(() => {
    const targetDateStr = new Date(date || new Date()).toISOString().split('T')[0];
    const targetTimeStr = (details.akad_time || "08:00").split(' ')[0].substring(0, 5); 
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
  }, [date, details.akad_time]);

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

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Nomor rekening tersalin!'); };

  return (
    <div className="font-sans text-slate-800 bg-white min-h-screen relative overflow-x-hidden selection:bg-emerald-100">
      
      {/* GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Lato', sans-serif; }
        html { scroll-behavior: smooth; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeIn 1s ease-out forwards; }
        
        /* Hide scrollbar for cover text on mobile */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- COVER MODAL (RESPONSIVE SPLIT) --- */}
      <div className={`fixed inset-0 z-50 flex flex-col md:flex-row bg-white transition-transform duration-[1.2s] ease-in-out ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
        
        {/* Gambar Cover: 45% tinggi di HP, 50% lebar di Desktop */}
        <div className="h-[45vh] md:h-full w-full md:w-1/2 relative overflow-hidden bg-slate-200">
             <div className="absolute inset-0 bg-emerald-900/10 z-10"></div>
             <img src={photos.cover} className="w-full h-full object-cover" alt="Cover" />
        </div>

        {/* Text Cover: 55% tinggi di HP, 50% lebar di Desktop */}
        <div className="h-[55vh] md:h-full w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-6 md:p-12 text-center relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.1)]">
            <div className="w-full h-full flex flex-col items-center justify-center overflow-y-auto no-scrollbar">
                <p className="text-emerald-800 tracking-[0.2em] text-xs md:text-sm font-bold uppercase mb-4 animate-fade-up" style={{animationDelay: '0.1s'}}>The Wedding Of</p>
                
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-slate-900 leading-tight mb-6 animate-fade-up" style={{animationDelay: '0.2s'}}>
                    {groom} <br/> 
                    <span className="text-emerald-600 text-3xl md:text-4xl italic block my-2">&</span> 
                    {bride}
                </h1>
                
                <div className="w-12 md:w-16 h-1 bg-emerald-600 mx-auto mb-6 rounded-full animate-fade-up" style={{animationDelay: '0.3s'}}></div>

                <div className="space-y-2 mb-8 animate-fade-up" style={{animationDelay: '0.4s'}}>
                    <p className="text-slate-500 text-xs md:text-sm">Kepada Yth. Bapak/Ibu/Saudara/i</p>
                    <div className="bg-slate-50 px-6 py-3 rounded-lg border border-slate-100 inline-block min-w-[200px]">
                        <h3 className="text-lg md:text-xl font-bold text-slate-800 break-words">{guestName || "Tamu Undangan"}</h3>
                    </div>
                </div>

                <button 
                    onClick={openInvitation}
                    className="px-8 py-3 md:px-10 md:py-4 bg-emerald-800 text-white text-sm md:text-base hover:bg-emerald-900 transition-all duration-300 rounded shadow-lg hover:shadow-emerald-900/30 flex items-center gap-2 group animate-fade-up" style={{animationDelay: '0.5s'}}
                >
                    <Mail className="w-4 h-4 md:w-5 md:h-5 group-hover:animate-bounce" /> 
                    <span>BUKA UNDANGAN</span>
                </button>
            </div>
        </div>
      </div>


      {/* --- KONTEN UTAMA --- */}
      <div className={`${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 delay-500`}>

        {/* 1. HERO HEADER */}
        <header className="min-h-screen relative flex items-center justify-center overflow-hidden">
            {/* Background Image (Absolute to fix iOS bg-fixed issues) */}
            <div className="absolute inset-0 z-0">
                <img src={photos.header} alt="Header" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/50"></div>
            </div>
            
            <div className="relative z-10 text-center text-white px-4 md:px-6 py-20 w-full max-w-4xl mx-auto flex flex-col h-full justify-center">
                <p className="text-sm md:text-xl font-serif italic mb-4 text-emerald-200 animate-fade-up">We are getting married</p>
                <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl mb-6 font-bold drop-shadow-lg leading-tight animate-fade-up">{groom} & {bride}</h1>
                <p className="text-xs md:text-sm tracking-[0.3em] uppercase mb-10 border-y border-white/30 py-3 inline-block mx-auto px-6">{formattedDate}</p>
                
                {/* Responsive Countdown */}
                <div className="grid grid-cols-4 gap-2 md:gap-8 max-w-md md:max-w-lg mx-auto">
                    <TimeBox value={timeLeft.days} label="Hari" />
                    <TimeBox value={timeLeft.hours} label="Jam" />
                    <TimeBox value={timeLeft.minutes} label="Menit" />
                    <TimeBox value={timeLeft.seconds} label="Detik" />
                </div>
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center animate-bounce">
                <ArrowDown className="text-white opacity-70 w-6 h-6 md:w-8 md:h-8" />
            </div>
        </header>

        {/* 2. QUOTE */}
        <section className="py-16 md:py-24 px-6 bg-emerald-50/50 text-center">
            <div className="max-w-2xl mx-auto">
                <Heart className="w-8 h-8 md:w-10 md:h-10 text-emerald-600 mx-auto mb-6 fill-current opacity-20" />
                <p className="font-serif text-lg md:text-2xl text-emerald-900 leading-relaxed italic">
                    "{quote}"
                </p>
                <p className="mt-6 text-xs md:text-sm font-bold text-emerald-700 tracking-widest uppercase">— {quoteSource}</p>
            </div>
        </section>

        {/* 3. COUPLE PROFILE */}
        <section className="py-16 md:py-24 px-4 bg-white overflow-hidden">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
                    
                    {/* Groom */}
                    <div className="flex flex-col items-center text-center group w-full md:w-1/3">
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full p-1.5 md:p-2 border-2 border-dashed border-emerald-300 relative mb-6">
                             <img src={photos.groom} className="w-full h-full object-cover rounded-full shadow-xl" alt="Groom" />
                             <div className="absolute -bottom-2 -right-2 bg-emerald-800 text-white px-3 py-1 md:px-4 md:py-1 text-[10px] md:text-xs font-bold rounded-full shadow-md z-10">THE GROOM</div>
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl text-slate-800 mb-1">{groom}</h2>
                        <p className="text-emerald-600 text-xs font-bold tracking-wider mb-2">PUTRA TERCINTA</p>
                        <p className="text-slate-500 text-xs md:text-sm px-4">{details.groom_parents}</p>
                    </div>

                    <div className="text-emerald-200 font-serif text-4xl md:text-6xl italic opacity-50">&</div>

                    {/* Bride */}
                    <div className="flex flex-col items-center text-center group w-full md:w-1/3">
                         <div className="w-48 h-48 md:w-64 md:h-64 rounded-full p-1.5 md:p-2 border-2 border-dashed border-emerald-300 relative mb-6">
                             <img src={photos.bride} className="w-full h-full object-cover rounded-full shadow-xl" alt="Bride" />
                             <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white px-3 py-1 md:px-4 md:py-1 text-[10px] md:text-xs font-bold rounded-full shadow-md z-10">THE BRIDE</div>
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl text-slate-800 mb-1">{bride}</h2>
                        <p className="text-emerald-600 text-xs font-bold tracking-wider mb-2">PUTRI TERCINTA</p>
                        <p className="text-slate-500 text-xs md:text-sm px-4">{details.bride_parents}</p>
                    </div>

                </div>
            </div>
        </section>

        {/* 4. EVENT DETAILS */}
        <section className="py-16 md:py-24 bg-slate-900 text-white relative">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl md:text-5xl text-emerald-400 mb-3">Wedding Event</h2>
                    <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">Kami mengundang anda untuk menjadi saksi momen bahagia kami.</p>
                </div>

                {/* Grid Layout untuk Card: Mobile 1 kolom, Desktop 2 kolom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    
                    {/* Akad Card */}
                    <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-xl hover:bg-white/10 transition duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-2 md:p-3 bg-emerald-500 rounded-full text-white"><Heart className="w-5 h-5 md:w-6 md:h-6 fill-current"/></div>
                            <h3 className="font-serif text-2xl md:text-3xl">Akad Nikah</h3>
                        </div>
                        <div className="space-y-4 text-slate-300 text-sm md:text-base">
                            <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-emerald-500 shrink-0"/> <span className="font-bold text-white">{formattedDate}</span></div>
                            <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-emerald-500 shrink-0"/> <span>{details.akad_time}</span></div>
                            <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-emerald-500 mt-1 shrink-0"/> <span>{details.venue_name}<br/> <span className="text-xs opacity-70">{details.venue_address}</span></span></div>
                        </div>
                    </div>

                    {/* Resepsi Card */}
                    <div className="bg-gradient-to-br from-emerald-900 to-slate-900 border border-emerald-800 p-6 md:p-10 rounded-xl relative overflow-hidden shadow-2xl">
                         <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                         <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="p-2 md:p-3 bg-white text-emerald-900 rounded-full"><Share2 className="w-5 h-5 md:w-6 md:h-6"/></div>
                            <h3 className="font-serif text-2xl md:text-3xl text-white">Resepsi</h3>
                        </div>
                        <div className="space-y-4 text-emerald-100 relative z-10 text-sm md:text-base">
                            <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-emerald-400 shrink-0"/> <span className="font-bold text-white">{formattedDate}</span></div>
                            <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-emerald-400 shrink-0"/> <span>{details.resepsi_time}</span></div>
                            <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-emerald-400 mt-1 shrink-0"/> <span>{details.venue_name} <br/> <span className="text-xs opacity-70">{details.venue_address}</span></span></div>
                        </div>
                        
                        <div className="mt-8 relative z-10">
                             <a href={details.maps_link} target="_blank" className="block w-full text-center py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition text-sm tracking-wider">
                                VIEW LOCATION
                             </a>
                        </div>
                    </div>

                </div>
            </div>
        </section>

        {/* 5. GALLERY (Responsive Grid) */}
        {gallery.length > 0 && (
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="text-center mb-10">
                    <p className="text-emerald-600 font-bold tracking-widest uppercase mb-2 text-xs md:text-sm">Our Memories</p>
                    <h2 className="font-serif text-3xl md:text-4xl text-slate-800">Photo Gallery</h2>
                </div>
                
                {/* Mobile: 2 Kolom, Desktop: 4 Kolom */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 max-w-6xl mx-auto">
                    {gallery.map((url, idx) => (
                        <div key={idx} className={`relative group overflow-hidden rounded-lg aspect-square ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}>
                            <img src={url} alt="Gallery" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* 6. GIFT (Stacked Cards) */}
        <section className="py-16 md:py-24 px-4 bg-slate-50 border-t border-slate-200">
             <div className="max-w-3xl mx-auto text-center">
                 <h2 className="font-serif text-3xl md:text-4xl mb-4 text-slate-800">Wedding Gift</h2>
                 <p className="text-slate-600 mb-10 text-sm md:text-base leading-relaxed px-4">
                    Tanpa mengurangi rasa hormat, bagi Bapak/Ibu/Saudara/i yang ingin memberikan tanda kasih untuk kami, dapat melalui:
                 </p>

                 <div className="flex flex-col gap-6 items-center w-full px-2">
                    {banks.map((bank, idx) => (
                        <div key={idx} className="w-full max-w-sm bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-xl p-6 shadow-lg relative overflow-hidden group transform transition md:hover:-translate-y-2">
                             {/* Card Decor */}
                             <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
                             
                             <div className="flex justify-between items-start mb-6 relative z-10">
                                 <div className="text-xl md:text-2xl font-serif italic tracking-widest">{bank.bank}</div>
                                 <Gift className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                             </div>

                             <div className="text-left relative z-10">
                                 <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                                 <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                                     <span className="font-mono text-lg md:text-xl tracking-wider text-emerald-300 truncate">{bank.number}</span>
                                     <button onClick={() => copyToClipboard(bank.number)} className="p-2 bg-white/10 rounded hover:bg-white/20 transition shrink-0 ml-2">
                                        <Copy className="w-4 h-4" />
                                     </button>
                                 </div>
                                 <p className="mt-3 font-bold uppercase tracking-wide text-sm">{bank.name}</p>
                             </div>
                        </div>
                    ))}
                 </div>
             </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-white py-8 text-center border-t border-slate-100 pb-24 md:pb-8">
            <h2 className="font-serif text-xl md:text-2xl text-slate-800">{groom} & {bride}</h2>
            <p className="text-slate-400 text-[10px] md:text-xs mt-2">© 2024. Made with love.</p>
        </footer>

      </div>

      {/* FLOATING AUDIO (Posisi aman di mobile) */}
      <div className="fixed bottom-6 right-4 md:left-6 md:right-auto z-40">
        <button 
            onClick={() => toggleAudio()}
            className="bg-emerald-800 text-white p-3 md:p-4 rounded-full shadow-2xl hover:bg-emerald-700 transition-all border-2 border-white/20 animate-spin-slow"
        >
            {audioPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />}
        </button>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} loop />}
    
    </div>
  );
}

// --- SUB-COMPONENTS ---
function TimeBox({ value, label }) {
    return (
        <div className="flex flex-col items-center p-2 md:p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
            <span className="text-2xl md:text-5xl font-serif font-bold text-white mb-1 md:mb-2">{String(value).padStart(2, '0')}</span>
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-emerald-300 font-bold">{label}</span>
        </div>
    )
}

