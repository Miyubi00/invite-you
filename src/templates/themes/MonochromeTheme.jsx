import { useState, useRef, useEffect } from 'react';
import { Play, Pause, ArrowRight, MapPin, Calendar, Copy, Instagram, Aperture } from 'lucide-react';

export default function MonoEditorialTheme({ groom, bride, date, guestName, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
  // Images Handling
  const defaultImages = {
    cover: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop",
    man: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop",
    woman: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop",
  };

  const photos = {
    cover: data?.cover_photo || defaultImages.cover,
    groom: data?.groom_photo || defaultImages.man,
    bride: data?.bride_photo || defaultImages.woman,
  };

  // --- DATA GALLERY (Added) ---
  const gallery = data?.gallery || [
     "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1511285560982-1356c11d4606?w=500&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1522673607200-1645062cd958?w=500&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1520854221256-17451cc330e7?w=500&auto=format&fit=crop"
  ];

  const formattedDate = new Date(date || new Date()).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

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

  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  return (
    <div className="bg-white text-black min-h-screen font-sans selection:bg-black selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;1,6..96,400&family=Inter:wght@300;400;600&display=swap');
        .font-display { font-family: 'Bodoni Moda', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* --- COVER OVERLAY --- */}
      <div className={`fixed inset-0 z-50 bg-white transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="h-full flex flex-col relative">
            {/* Top Image */}
            <div className="h-[60%] w-full relative overflow-hidden">
                <img src={photos.cover} className="w-full h-full object-cover grayscale" alt="Cover"/>
                <div className="absolute inset-0 bg-black/10"></div>
            </div>
            {/* Bottom Content */}
            <div className="h-[40%] flex flex-col justify-between p-8 border-t-2 border-black">
                <div>
                    <p className="font-body text-xs tracking-[0.3em] uppercase mb-2">The Wedding</p>
                    <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">{groom} <br/> <span className="italic font-light">&</span> {bride}</h1>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="font-body text-sm font-bold">DEAR: {guestName || "GUEST"}</p>
                    </div>
                    <button onClick={() => { setIsOpen(true); toggleAudio(); }} className="bg-black text-white rounded-full px-8 py-4 font-bold tracking-widest hover:bg-gray-800 transition flex items-center gap-2">
                        OPEN <ArrowRight size={16}/>
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="relative">
        
        {/* HERO */}
        <section className="min-h-screen flex flex-col pt-10 px-4 md:px-12 pb-12 border-b-2 border-black">
            <div className="flex-1 flex flex-col justify-center items-center text-center">
                <p className="font-body text-sm md:text-base tracking-[0.5em] mb-6">SAVE THE DATE</p>
                <h2 className="font-display text-[12vw] leading-[0.8] tracking-tighter uppercase">{formattedDate}</h2>
                <div className="mt-12 flex gap-4 md:gap-12">
                   <div className="text-center"><span className="block font-display text-4xl">{timeLeft.days}</span><span className="text-xs font-bold uppercase">Days</span></div>
                   <div className="text-center"><span className="block font-display text-4xl">{timeLeft.hours}</span><span className="text-xs font-bold uppercase">Hours</span></div>
                   <div className="text-center"><span className="block font-display text-4xl">{timeLeft.minutes}</span><span className="text-xs font-bold uppercase">Mins</span></div>
                   <div className="text-center"><span className="block font-display text-4xl">{timeLeft.seconds}</span><span className="text-xs font-bold uppercase">Sec</span></div>
                </div>
            </div>
            <div className="w-full h-64 md:h-96 mt-10 relative overflow-hidden border-2 border-black">
                <img src={photos.cover} className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700" alt="Hero"/>
            </div>
        </section>

        {/* COUPLE (Split Layout) */}
        <section className="grid grid-cols-1 md:grid-cols-2 border-b-2 border-black">
            <div className="p-8 md:p-16 border-b-2 md:border-b-0 md:border-r-2 border-black flex flex-col justify-center items-center text-center">
                <div className="w-48 h-64 border border-black p-2 mb-6 rotate-2 hover:rotate-0 transition">
                    <img src={photos.groom} className="w-full h-full object-cover grayscale" alt="Groom"/>
                </div>
                <h3 className="font-display text-4xl mb-2">{groom}</h3>
                <p className="font-body text-xs text-gray-500 max-w-xs">Putra dari</p>
                <p className="font-body text-xs text-gray-500 max-w-xs">{data?.groom_parents}</p>
            </div>
            <div className="p-8 md:p-16 flex flex-col justify-center items-center text-center">
                <div className="w-48 h-64 border border-black p-2 mb-6 -rotate-2 hover:rotate-0 transition">
                    <img src={photos.bride} className="w-full h-full object-cover grayscale" alt="Bride"/>
                </div>
                <h3 className="font-display text-4xl mb-2">{bride}</h3>
                <p className="font-body text-xs text-gray-500 max-w-xs">Putri dari</p>
                <p className="font-body text-xs text-gray-500 max-w-xs">{data?.bride_parents}</p>
            </div>
        </section>

        {/* EVENTS (Ticket Style) */}
        <section className="py-20 px-4 md:px-12 bg-gray-50 border-b-2 border-black">
            <h2 className="font-display text-5xl md:text-6xl text-center mb-16 uppercase italic">The Events</h2>
            
            <div className="flex flex-col md:flex-row gap-8 justify-center">
                {/* Akad */}
                <div className="bg-white border-2 border-black p-0 w-full md:w-96 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    <div className="bg-black text-white p-4 text-center font-bold tracking-widest uppercase">Akad Nikah</div>
                    <div className="p-8 text-center space-y-4">
                        <div className="flex justify-center items-center gap-2"><Calendar size={16}/> <span>{formattedDate}</span></div>
                        <div className="flex justify-center items-center gap-2"><Play size={16} className="rotate-90"/> <span>{data?.akad_time}</span></div>
                        <div className="flex justify-center items-start gap-2 pt-2 border-t border-gray-200 mt-4"><MapPin size={16} className="mt-1"/> <span className="text-sm">{data?.venue_name}</span></div>
                    </div>
                </div>

                {/* Resepsi */}
                <div className="bg-black text-white border-2 border-black p-0 w-full md:w-96 relative shadow-[8px_8px_0px_0px_rgba(100,100,100,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    <div className="bg-white text-black border-b-2 border-black p-4 text-center font-bold tracking-widest uppercase">Resepsi</div>
                    <div className="p-8 text-center space-y-4">
                        <div className="flex justify-center items-center gap-2"><Calendar size={16}/> <span>{formattedDate}</span></div>
                        <div className="flex justify-center items-center gap-2"><Play size={16} className="rotate-90"/> <span>{data?.resepsi_time}</span></div>
                        <div className="flex justify-center items-start gap-2 pt-2 border-t border-gray-700 mt-4"><MapPin size={16} className="mt-1"/> <span className="text-sm">{data?.venue_address}</span></div>
                    </div>
                </div>
            </div>
            
            <div className="text-center mt-12">
                <a href={data?.maps_link} className="inline-block border-b-2 border-black pb-1 hover:pb-2 transition-all font-bold text-lg">GET DIRECTIONS</a>
            </div>
        </section>

        {/* --- GALLERY SECTION (BARU DITAMBAHKAN) --- */}
        {gallery.length > 0 && (
          <section className="border-b-2 border-black">
             {/* Header Section */}
             <div className="py-12 px-6 border-b-2 border-black flex justify-between items-end">
                <h2 className="font-display text-4xl md:text-6xl uppercase leading-none">Visual <br/> <span className="italic">Diary</span></h2>
                <Aperture size={32} className="animate-spin-slow"/>
             </div>

             {/* Newspaper Grid Layout */}
             <div className="grid grid-cols-2 md:grid-cols-4 bg-black">
                {gallery.map((url, i) => (
                   <div key={i} className={`relative group overflow-hidden border-r-2 border-b-2 border-white/0 md:border-white/0 bg-white aspect-[3/4] ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                      <img 
                         src={url} 
                         alt={`Gallery ${i}`} 
                         className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" 
                      />
                      {/* Black border overlay to mimic printing grid */}
                      <div className="absolute inset-0 border border-black pointer-events-none"></div>
                   </div>
                ))}
             </div>
          </section>
        )}

        {/* BANK & GIFT (Minimalist) */}
        <section className="py-20 px-4 text-center">
            <p className="font-body text-sm tracking-widest mb-6">WEDDING GIFT</p>
            <div className="max-w-md mx-auto space-y-4">
                {data?.banks.map((bank, i) => (
                    <div key={i} className="border border-black p-6 flex justify-between items-center hover:bg-black hover:text-white transition group">
                        <div className="text-left">
                            <span className="font-bold text-xl block font-display">{bank.bank}</span>
                            <span className="text-sm opacity-70">{bank.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                             <span className="font-mono text-lg">{bank.number}</span>
                             <button onClick={() => navigator.clipboard.writeText(bank.number)}><Copy size={18} className="group-hover:text-gray-300"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      </main>

      {/* FLOATING CONTROLS */}
      <button onClick={toggleAudio} className="fixed bottom-6 right-6 z-40 bg-black text-white w-12 h-12 flex items-center justify-center border-2 border-white rounded-full hover:bg-white hover:text-black hover:border-black transition">
         {isPlaying ? <Pause size={16}/> : <Play size={16} className="ml-1"/>}
      </button>
      <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_243544c06f.mp3" loop />
    </div>
  );
}