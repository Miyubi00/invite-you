import { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Clock, Copy, Music, Heart, Instagram, ChevronDown, 
  MailOpen, Gift, Play, CalendarDays
} from 'lucide-react';

export default function RusticTheme({ groom, bride, date, guestName, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- DATA ---
  const defaultImages = {
    cover: "https://images.unsplash.com/photo-1511285560982-1356c11d4606?w=800&auto=format&fit=crop",
    man: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop",
    woman: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop",
    couple: "https://images.unsplash.com/photo-1623838428588-4e3a479907eb?w=800&auto=format&fit=crop"
  };

  const photos = {
    cover: data?.cover_photo || defaultImages.cover,
    groom: data?.groom_photo || defaultImages.man,
    bride: data?.bride_photo || defaultImages.woman,
    header: data?.cover_photo || defaultImages.couple 
  };

  const gallery = data?.gallery || [];
  const banks = data?.banks || [];
  const quote = data?.quote || "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya.";
  const quoteSource = data?.quote_source || "QS. Ar-Rum: 21";
  
  const details = data || {
    venue_name: "Grand Garden Venue",
    venue_address: "Jl. Bunga Melati No. 12, Bandung",
    maps_link: "#",
    akad_time: "08:00 WIB",
    resepsi_time: "11:00 WIB",
    groom_parents: "Bpk. Hendra & Ibu Susi",
    bride_parents: "Bpk. Joko & Ibu Tina"
  };

  const formattedDate = new Date(date || new Date()).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // --- COUNTDOWN LOGIC ---
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

  // --- ACTIONS ---
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
    <div className="font-serif text-[#5D534A] bg-[#F7F5F2] min-h-screen relative overflow-x-hidden">
      
      {/* GLOBAL STYLES & FONTS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        .font-script { font-family: 'Dancing Script', cursive; }
        .font-serif { font-family: 'Lora', serif; }
        
        /* Animasi Daun Jatuh (Soft) */
        @keyframes falling {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .leaf {
          position: absolute; top: -20px; width: 15px; height: 15px;
          background: #A8BCA1; border-radius: 50% 0 50% 0;
          animation: falling 12s linear infinite; opacity: 0; z-index: 0;
        }
        .leaf:nth-child(1) { left: 15%; animation-duration: 10s; background: #C5D1C0; }
        .leaf:nth-child(2) { left: 40%; animation-duration: 14s; animation-delay: 2s; background: #D6C0B3; }
        .leaf:nth-child(3) { left: 85%; animation-duration: 9s; animation-delay: 1s; background: #A8BCA1; }

        /* Animasi Elemen Dekorasi (Swaying) */
        .animate-sway { animation: sway 4s ease-in-out infinite alternate; transform-origin: bottom center; }
        @keyframes sway { from { transform: rotate(-5deg); } to { transform: rotate(5deg); } }
        
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden"><div className="leaf"></div><div className="leaf"></div><div className="leaf"></div></div>

      {/* --- COVER DEPAN (SOFT OVERLAY) --- */}
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center text-center p-6 transition-transform duration-[1.2s] ease-in-out bg-[#2c2c2c] ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="absolute inset-0 opacity-40 z-0" style={{ backgroundImage: `url(${photos.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        
        {/* Kartu Cover */}
        <div className="relative bg-[#F9F7F5] p-10 rounded-[4rem] shadow-2xl max-w-sm w-full border-[8px] border-double border-[#E3DDD5] z-10 animate-fade-in-up">
          <p className="text-xs tracking-[0.3em] uppercase mb-6 text-[#8C8075] font-bold">The Wedding of</p>
          
          <div className="font-script text-5xl text-[#712E1E] mb-6 leading-tight">
            {groom} <br/> <span className="text-3xl text-[#A8BCA1]">&</span> <br/> {bride}
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4C3B7] to-transparent my-6"></div>

          <div className="mb-8">
            <p className="text-xs text-[#8C8075] mb-2 font-bold tracking-widest uppercase">Kepada Yth.</p>
            <div className="bg-white py-3 px-6 rounded-xl border border-[#E3DDD5] inline-block shadow-sm">
                 <h3 className="text-xl font-serif font-bold text-[#5D534A] capitalize">{guestName || "Tamu Spesial"}</h3>
            </div>
          </div>

          {/* PERBAIKAN: Tombol sekarang pakai warna hex langsung agar tidak putih */}
          <button onClick={openInvitation} className="group relative px-8 py-3 rounded-full bg-[#712E1E] text-white font-medium shadow-lg hover:bg-[#5a2418] hover:scale-105 transition-all duration-300">
            <span className="flex items-center gap-2">
              <MailOpen className="w-4 h-4" /> Buka Undangan
            </span>
          </button>
        </div>
      </div>


      {/* --- KONTEN UTAMA --- */}
      <div className={`transition-opacity duration-1000 delay-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* 1. HERO SECTION (SIMPLE & CLEAN) */}
        <header className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden py-20">
          <div className="absolute inset-0 bg-[#3d332e]/30 z-10"></div>
          <div className="absolute inset-0 z-0 animate-pulse-slow" style={{ backgroundImage: `url(${photos.header})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          
          <div className="relative z-20 text-center text-white p-6 max-w-4xl mt-16">
            <p className="text-xs md:text-sm tracking-[0.4em] uppercase mb-6 font-bold opacity-90">We Are Getting Married</p>
            <h1 className="font-script text-6xl md:text-8xl mb-8 drop-shadow-md">{groom} <span className="text-[#E3DDD5]">&</span> {bride}</h1>
            
            <div className="inline-flex items-center gap-3 border border-white/40 py-2 px-8 backdrop-blur-sm bg-white/10 rounded-full mb-12">
               <CalendarDays className="w-4 h-4" />
               <p className="text-lg tracking-widest">{formattedDate}</p>
            </div>

            {/* COUNTDOWN (SOFT STYLE) */}
            <div className="animate-fade-in-up">
                <div className="flex gap-4 justify-center text-[#F9F7F5]">
                    <CountdownCircle value={timeLeft.days} label="Hari" />
                    <CountdownCircle value={timeLeft.hours} label="Jam" />
                    <CountdownCircle value={timeLeft.minutes} label="Menit" />
                    <CountdownCircle value={timeLeft.seconds} label="Detik" />
                </div>
            </div>

            <div className="mt-20 animate-bounce">
               <ChevronDown className="w-8 h-8 mx-auto opacity-80" />
            </div>
          </div>
          
          {/* Wave Separator */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
            <svg className="relative block w-[calc(100%+1.3px)] h-[50px]" fill="#F7F5F2" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>
        </header>


        {/* 2. QUOTE & SALAM */}
        <section className="py-20 px-6 text-center max-w-3xl mx-auto relative">
          <DecorFlower className="mx-auto mb-6 w-12 h-12 text-[#D4C3B7] opacity-60 animate-sway origin-bottom" />
          
          <h2 className="font-serif text-2xl text-[#712E1E] mb-6 font-bold">Assalamualaikum Wr. Wb.</h2>
          <p className="text-[#5D534A] mb-10 leading-relaxed">
            Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.
          </p>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E3DDD5] relative">
             <p className="font-serif italic text-[#5D534A] text-lg mb-4 leading-loose">"{quote}"</p>
             <div className="w-10 h-px bg-[#A8BCA1] mx-auto mb-2"></div>
             <p className="font-bold text-xs tracking-widest uppercase text-[#712E1E]">{quoteSource}</p>
          </div>
        </section>


        {/* 3. MEMPELAI (ARCH SHAPE - CLEAN) */}
        <section className="py-10 px-4">
           <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 relative">
             <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-[#E3DDD5]"></div>

             {/* Groom */}
             <div className="text-center group">
                <div className="relative w-64 h-80 mx-auto mb-6">
                   <div className="absolute inset-0 border-[1px] border-[#712E1E] rounded-t-full rounded-b-[3rem] translate-x-3 translate-y-3 opacity-30"></div>
                   <div className="absolute inset-0 bg-[#E3DDD5] rounded-t-full rounded-b-[3rem] overflow-hidden shadow-md">
                      <img src={photos.groom} alt="Groom" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                   </div>
                </div>
                <h2 className="font-script text-5xl text-[#712E1E] mb-2">{groom}</h2>
                <p className="text-sm font-bold text-[#8C8075] tracking-widest mb-1">PUTRA TERCINTA</p>
                <p className="text-sm text-[#5D534A]">{details.groom_parents}</p>
             </div>

             {/* Bride */}
             <div className="text-center group mt-8 md:mt-0">
                <div className="relative w-64 h-80 mx-auto mb-6">
                   <div className="absolute inset-0 border-[1px] border-[#712E1E] rounded-t-full rounded-b-[3rem] translate-x-3 translate-y-3 opacity-30"></div>
                   <div className="absolute inset-0 bg-[#E3DDD5] rounded-t-full rounded-b-[3rem] overflow-hidden shadow-md">
                      <img src={photos.bride} alt="Bride" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                   </div>
                </div>
                <h2 className="font-script text-5xl text-[#712E1E] mb-2">{bride}</h2>
                <p className="text-sm font-bold text-[#8C8075] tracking-widest mb-1">PUTRI TERCINTA</p>
                <p className="text-sm text-[#5D534A]">{details.bride_parents}</p>
             </div>
           </div>
        </section>


        {/* 4. DETAIL ACARA (SOFT CARDS) */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-lg overflow-hidden border border-[#F0EBE5] relative p-10 md:p-16 text-center">
               <DecorBranch className="absolute top-0 right-0 w-32 text-[#A8BCA1] opacity-20 pointer-events-none" />
               <DecorBranch className="absolute bottom-0 left-0 w-32 text-[#A8BCA1] opacity-20 pointer-events-none transform rotate-180" />

               <h2 className="font-serif text-4xl text-[#712E1E] mb-10 font-bold">Save The Date</h2>

               <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-12">
                  {/* Akad */}
                  <div className="bg-[#F9F7F5] p-8 rounded-[2rem] border border-[#E3DDD5] w-full max-w-sm hover:-translate-y-1 transition duration-300">
                     <div className="w-12 h-12 bg-[#A8BCA1]/20 text-[#712E1E] rounded-full flex items-center justify-center mx-auto mb-4">
                        <RingsIcon className="w-6 h-6" />
                     </div>
                     <h3 className="font-bold text-xl mb-2 text-[#5D534A]">Akad Nikah</h3>
                     <div className="flex items-center justify-center gap-2 text-[#8C8075] mb-4 text-sm font-bold">
                        <Clock className="w-4 h-4" /> <span>{details.akad_time}</span>
                     </div>
                     <p className="text-sm text-[#5D534A] opacity-80">{details.venue_name}</p>
                  </div>

                  {/* Resepsi - PERBAIKAN WARNA BACKGROUND CARD RESEPSI */}
                  <div className="bg-[#712E1E] p-8 rounded-[2rem] border border-[#712E1E] w-full max-w-sm text-white shadow-lg hover:-translate-y-1 transition duration-300 relative overflow-hidden">
                     <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full"></div>
                     <div className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <ToastIcon className="w-6 h-6" />
                     </div>
                     <h3 className="font-bold text-xl mb-2">Resepsi</h3>
                     <div className="flex items-center justify-center gap-2 text-white/90 mb-4 text-sm font-bold">
                        <Clock className="w-4 h-4" /> <span>{details.resepsi_time}</span>
                     </div>
                     <p className="text-sm text-white/90 opacity-80">{details.venue_name}</p>
                  </div>
               </div>

               <div className="flex flex-col items-center gap-4 relative z-10">
                  <p className="text-[#8C8075] max-w-md mx-auto text-sm">{details.venue_address}</p>
                  <a href={details.maps_link} target="_blank" className="inline-flex items-center gap-2 bg-[#5D534A] text-white px-8 py-3 rounded-full hover:bg-[#3E3730] transition shadow-md text-sm font-medium">
                     <MapPin className="w-4 h-4" /> Lihat Google Maps
                  </a>
               </div>
          </div>
        </section>


        {/* 5. GALERI FOTO (MASONRY CLEAN) */}
        {gallery.length > 0 && (
          <section className="py-16 px-4 bg-[#F7F5F2]">
             <div className="text-center mb-10">
               <h2 className="font-script text-5xl text-[#712E1E]">Our Moments</h2>
               <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
                  <div className="h-px w-8 bg-[#712E1E]"></div>
                  <Heart className="w-4 h-4 text-[#712E1E] fill-current" />
                  <div className="h-px w-8 bg-[#712E1E]"></div>
               </div>
             </div>
             
             <div className="columns-2 md:columns-3 gap-4 max-w-5xl mx-auto space-y-4 px-2">
                {gallery.map((url, idx) => (
                  <div key={idx} className="break-inside-avoid rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition hover:scale-[1.02] bg-white p-2">
                     <img src={url} alt="Gallery" className="w-full h-auto object-cover rounded-lg" />
                  </div>
                ))}
             </div>
          </section>
        )}


        {/* 6. GIFT & FOOTER */}
        <section className="py-20 px-6 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] text-center relative border-t border-[#F0EBE5]">
          <h2 className="font-serif text-3xl text-[#712E1E] mb-4 font-bold">Wedding Gift</h2>
          <p className="text-sm text-[#8C8075] mb-10 max-w-md mx-auto leading-relaxed">
            Doa restu Anda adalah hadiah terbaik bagi kami. Namun jika memberi adalah ungkapan tanda kasih Anda, kami menerima kado secara cashless.
          </p>

          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto mb-16">
            {banks.map((bank, idx) => (
              <div key={idx} className="bg-[#F9F7F5] p-6 rounded-2xl w-full max-w-xs shadow-sm border border-[#E3DDD5] relative group hover:-translate-y-1 transition duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Gift className="w-16 h-16 text-[#712E1E]" /></div>
                <div className="text-left relative z-10">
                   <p className="font-bold text-[#712E1E] text-lg mb-4 tracking-widest uppercase">{bank.bank}</p>
                   <div className="flex items-center justify-between bg-white p-3 rounded-lg mb-2 border border-[#E3DDD5]">
                      <span className="font-mono text-lg text-[#5D534A] tracking-wider font-bold">{bank.number}</span>
                      <button onClick={() => copyToClipboard(bank.number)} className="p-1 hover:bg-gray-100 rounded transition"><Copy className="w-4 h-4 text-[#712E1E]"/></button>
                   </div>
                   <p className="text-xs text-[#8C8075] uppercase font-bold tracking-wide pl-1">a.n {bank.name}</p>
                </div>
              </div>
            ))}
          </div>

          <footer className="pt-10 border-t border-[#F0EBE5]">
             <h1 className="font-script text-4xl text-[#D4C3B7] mb-4">{groom} & {bride}</h1>
             <p className="text-xs text-[#8C8075] font-bold tracking-widest">Created with <Heart className="w-3 h-3 inline text-red-300 fill-current"/> by NikahYuk</p>
          </footer>
        </section>


        {/* 7. FLOATING MUSIC CONTROL */}
        <button 
          onClick={() => toggleAudio()}
          className={`fixed bottom-6 right-6 z-40 bg-white p-3 rounded-full shadow-lg border border-[#D4C3B7] text-[#712E1E] hover:scale-110 transition-all duration-300 ${audioPlaying ? 'animate-spin-slow' : ''}`}
        >
          {audioPlaying ? <Music className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current pl-1"/>}
        </button>
        
        <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_243544c06f.mp3?filename=wedding-cinematic-11166.mp3" loop />

      </div>
    </div>
  );
}

// --- KOMPONEN PENDUKUNG (SOFT) ---

function CountdownCircle({ value, label }) {
    return (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center text-xl md:text-2xl font-bold">
                {String(value).padStart(2, '0')}
            </div>
            <span className="text-[10px] md:text-xs mt-2 uppercase tracking-widest opacity-80">{label}</span>
        </div>
    )
}

// Icon Kustom
function RingsIcon(props) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}><circle cx="8" cy="12" r="6"/><circle cx="16" cy="12" r="6"/><path d="M12 8L12 4"/><path d="M10 6L14 6"/></svg>;
}
function ToastIcon(props) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}><path d="M8 21h8"/><path d="M12 21v-8"/><path d="M6 4h12"/><path d="M6 4C6 4 7 13 12 13C17 13 18 4 18 4"/></svg>;
}
// Dekorasi Bunga Simpel
function DecorFlower(props) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" {...props}><path d="M12 2L14.5 9H22L16 14.5L18.5 22L12 17.5L5.5 22L8 14.5L2 9H9.5L12 2Z" /></svg>;
}
// Dekorasi Ranting
function DecorBranch(props) {
    return <svg viewBox="0 0 100 200" fill="currentColor" {...props}><path d="M50 200C60 150 20 100 0 50C-20 0 20 -20 50 0C80 -20 120 0 100 50C80 100 40 150 50 200Z" opacity="0.5"/><circle cx="100" cy="50" r="8" opacity="0.8"/></svg>;
}