import { useState, useRef, useEffect } from 'react';
import { Play, Pause, MapPin, Gift, Copy, Star, Music, Image as ImageIcon } from 'lucide-react';

export default function LuxuryGoldTheme({ groom, bride, date, guestName, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- DATA IMAGES ---
  const photos = {
    cover: data?.cover_photo || "https://images.unsplash.com/photo-1511285560982-1356c11d4606?w=800&auto=format&fit=crop",
    groom: data?.groom_photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop",
    bride: data?.bride_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop",
  };

  // --- DATA GALLERY (Added) ---
  const gallery = data?.gallery || [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-1645062cd958?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520854221256-17451cc330e7?w=500&auto=format&fit=crop"
  ];
  
  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  // --- COUNTDOWN STATE & LOGIC ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
        } else {
            clearInterval(interval);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <div className="bg-[#0a0f1c] text-[#e2e8f0] min-h-screen font-sans overflow-x-hidden selection:bg-amber-900 selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Montserrat:wght@300;400;600&display=swap');
        .font-royal { font-family: 'Cinzel', serif; }
        .font-modern { font-family: 'Montserrat', sans-serif; }
        .text-gold {
          background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .border-gold { border-image: linear-gradient(to right, #bf953f, #fcf6ba, #aa771c) 1; }
        .gold-glow { box-shadow: 0 0 15px rgba(191, 149, 63, 0.3); }
        @keyframes twinkle { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .star { animation: twinkle 3s infinite ease-in-out; }
      `}</style>

      {/* --- COVER (Full Screen Dark) --- */}
      <div className={`fixed inset-0 z-50 bg-[#05080f] flex flex-col items-center justify-center transition-opacity duration-1000 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Background Decor */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="absolute top-10 left-10 text-amber-500/30 star"><Star size={24}/></div>
        <div className="absolute bottom-20 right-10 text-amber-500/30 star" style={{animationDelay: '1s'}}><Star size={32}/></div>

        <div className="relative z-10 text-center p-8 border border-amber-500/30 bg-[#0a0f1c]/80 backdrop-blur-sm max-w-sm w-full mx-4 rounded-t-[100px] rounded-b-[100px] shadow-[0_0_50px_rgba(191,149,63,0.1)]">
            <p className="font-modern text-xs tracking-[0.3em] text-amber-200 mb-6 uppercase">The Wedding Of</p>
            <h1 className="font-royal text-4xl md:text-5xl text-gold mb-6 leading-relaxed py-2">{groom} <br/> <span className="text-2xl text-amber-100">&</span> <br/> {bride}</h1>
            
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto my-6"></div>
            
            <p className="font-modern text-sm text-slate-400 mb-2">Dear Special Guest:</p>
            <h3 className="font-royal text-xl text-white mb-8">{guestName || "Guest"}</h3>
            
            <button onClick={() => { setIsOpen(true); toggleAudio(); }} className="px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-600 text-white font-modern text-sm tracking-widest uppercase rounded hover:scale-105 transition shadow-[0_0_20px_rgba(180,83,9,0.4)]">
                Open Invitation
            </button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className={`transition-all duration-1000 ${isOpen ? 'blur-0 scale-100' : 'blur-xl scale-95'}`}>
        
        {/* HERO SECTION */}
        <header className="relative h-screen flex items-center justify-center overflow-hidden">
             {/* Background Image & Gradient */}
             <div className="absolute inset-0">
                <img src={photos.cover} className="w-full h-full object-cover opacity-40" alt="Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/50 to-transparent"></div>
             </div>
             
             {/* Content */}
             <div className="relative z-10 text-center px-4 animate-[fadeIn_2s_ease-in]">
                <div className="border-x border-amber-500/30 px-6 py-10 md:px-12 md:py-16 backdrop-blur-[2px]">
                    <h1 className="font-royal text-5xl md:text-8xl text-gold drop-shadow-lg mb-4">
                        {groom} <span className="text-3xl align-middle text-amber-100">&</span> {bride}
                    </h1>
                    <p className="font-modern text-amber-200 tracking-[0.5em] text-xs md:text-sm uppercase mb-8">
                        {new Date(date).toDateString()}
                    </p>

                    {/* --- COUNTDOWN ADDED HERE --- */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 border-t border-amber-500/30 pt-8">
                        <div className="flex flex-col items-center">
                            <span className="font-royal text-3xl md:text-4xl text-amber-400">{String(timeLeft.days).padStart(2, '0')}</span>
                            <span className="text-[10px] md:text-xs uppercase tracking-widest text-amber-200/60 font-modern">Days</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-royal text-3xl md:text-4xl text-amber-400">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="text-[10px] md:text-xs uppercase tracking-widest text-amber-200/60 font-modern">Hours</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-royal text-3xl md:text-4xl text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="text-[10px] md:text-xs uppercase tracking-widest text-amber-200/60 font-modern">Mins</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-royal text-3xl md:text-4xl text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <span className="text-[10px] md:text-xs uppercase tracking-widest text-amber-200/60 font-modern">Secs</span>
                        </div>
                    </div>
                    {/* --------------------------- */}

                </div>
             </div>
             
             {/* Bottom Fade */}
             <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#0a0f1c] to-transparent"></div>
        </header>

        {/* QUOTE (Golden Border) */}
        <section className="py-20 px-6 text-center">
            <div className="max-w-2xl mx-auto border p-1 border-amber-600/30 rounded-lg">
                <div className="border border-amber-600/30 rounded-lg p-8 md:p-12 bg-[#0d1321]">
                    <Star className="w-6 h-6 text-amber-500 mx-auto mb-4 fill-current"/>
                    <p className="font-royal text-lg md:text-xl text-amber-100/90 leading-loose italic">"{data?.quote || "Love is not about looking at each other, but looking in the same direction."}"</p>
                    <p className="mt-4 text-xs font-modern text-amber-600 uppercase tracking-widest">{data?.quote_source}</p>
                </div>
            </div>
        </section>

        {/* COUPLE (Dark Cards) */}
        <section className="py-10 px-4">
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-4xl mx-auto">
                {/* Groom */}
                <div className="bg-[#111827] p-2 rounded-t-full shadow-2xl border border-amber-900/30 w-full max-w-sm">
                    <img src={photos.groom} className="w-full h-96 object-cover rounded-t-full rounded-b-3xl opacity-80 hover:opacity-100 transition duration-500" alt="Groom"/>
                    <div className="text-center p-6">
                        <h2 className="font-royal text-3xl text-gold mb-1">{groom}</h2>
                        <p className="font-modern text-xs text-slate-500">Putra dari</p>
                        <p className="font-modern text-xs text-slate-500">{data?.groom_parents}</p>
                    </div>
                </div>
                {/* Bride */}
                <div className="bg-[#111827] p-2 rounded-t-full shadow-2xl border border-amber-900/30 w-full max-w-sm">
                    <img src={photos.bride} className="w-full h-96 object-cover rounded-t-full rounded-b-3xl opacity-80 hover:opacity-100 transition duration-500" alt="Bride"/>
                    <div className="text-center p-6">
                        <h2 className="font-royal text-3xl text-gold mb-1">{bride}</h2>
                        <p className="font-modern text-xs text-slate-500">Putri dari</p>
                        <p className="font-modern text-xs text-slate-500">{data?.bride_parents}</p>
                    </div>
                </div>
            </div>
        </section>

        {/* EVENTS (Gold Timeline) */}
        <section className="py-24 relative overflow-hidden">
            <div className="absolute top-1/2 left-0 w-full h-px bg-amber-900/20"></div>
            
            <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row justify-center gap-10">
                {/* Card 1 */}
                <div className="bg-[#0f1623] border border-amber-500/20 p-8 rounded-none relative group hover:border-amber-500/50 transition duration-500 w-full md:w-1/3 text-center">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0f1c] px-4 text-amber-500 font-royal">CEREMONY</div>
                    <h3 className="text-2xl font-royal text-white mb-4 mt-2">Akad Nikah</h3>
                    <div className="space-y-3 font-modern text-sm text-slate-400">
                        <p className="text-amber-200">{data?.akad_time}</p>
                        <p>{data?.venue_name}</p>
                        <p className="text-xs opacity-60">{data?.venue_address}</p>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-gradient-to-b from-amber-900/20 to-[#0f1623] border border-amber-500/40 p-10 rounded-none relative group w-full md:w-1/3 text-center transform md:-translate-y-6 shadow-[0_0_30px_rgba(180,83,9,0.1)]">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0f1c] px-4 text-amber-400 font-royal tracking-widest border border-amber-500/30">RECEPTION</div>
                    <h3 className="text-3xl font-royal text-white mb-4 mt-2">Resepsi</h3>
                    <div className="space-y-3 font-modern text-sm text-slate-300">
                        <p className="text-amber-200 text-lg">{data?.resepsi_time}</p>
                        <p>{data?.venue_name}</p>
                        <p className="text-xs opacity-60">{data?.venue_address}</p>
                        <a href={data?.maps_link} className="inline-flex items-center gap-2 text-amber-600 text-xs mt-2 hover:text-amber-400"><MapPin size={12}/> View Map</a>
                    </div>
                </div>
            </div>
        </section>

        {/* --- GALLERY SECTION (BARU DITAMBAHKAN) --- */}
        {gallery.length > 0 && (
          <section className="py-20 px-4 bg-[#080c17] relative border-t border-amber-900/20">
             <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                   <div className="flex items-center justify-center gap-3 text-amber-600 mb-2">
                      <div className="w-8 h-px bg-amber-600"></div>
                      <ImageIcon size={16} />
                      <div className="w-8 h-px bg-amber-600"></div>
                   </div>
                   <h2 className="font-royal text-3xl md:text-4xl text-amber-100">Captured Moments</h2>
                </div>
                
                {/* Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {gallery.map((url, i) => (
                      <div key={i} className={`relative group overflow-hidden border border-amber-900/30 rounded-sm aspect-square ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                         <img 
                           src={url} 
                           alt={`Moment ${i}`} 
                           className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition duration-700 ease-in-out" 
                         />
                         {/* Golden Frame Overlay Effect */}
                         <div className="absolute inset-2 border border-amber-500/0 group-hover:border-amber-500/30 transition duration-500 pointer-events-none"></div>
                      </div>
                   ))}
                </div>
             </div>
          </section>
        )}

        {/* GIFT (Dark Credit Card) */}
        <section className="py-20 px-6 bg-[#0a0f1c] border-t border-amber-900/20">
             <div className="text-center mb-12">
                 <h2 className="font-royal text-3xl text-amber-100">Wedding Gift</h2>
             </div>
             <div className="flex flex-wrap justify-center gap-6">
                 {data?.banks.map((bank, i) => (
                     <div key={i} className="w-80 h-48 rounded-xl bg-gradient-to-br from-slate-800 to-black border border-slate-700 relative overflow-hidden group shadow-lg">
                         <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition"></div>
                         <div className="p-6 h-full flex flex-col justify-between relative z-10">
                             <div className="flex justify-between items-start">
                                 <Gift className="text-amber-500"/>
                                 <span className="font-royal text-xl italic text-slate-300">{bank.bank}</span>
                             </div>
                             <div>
                                 <div className="flex items-center gap-3 mb-1">
                                    <span className="font-mono text-xl text-white tracking-widest shadow-black drop-shadow-md">{bank.number}</span>
                                    <button onClick={() => navigator.clipboard.writeText(bank.number)} className="text-amber-600 hover:text-amber-400"><Copy size={14}/></button>
                                 </div>
                                 <span className="text-xs font-modern uppercase text-slate-500 tracking-wider">{bank.name}</span>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
        </section>

        {/* FOOTER */}
        <footer className="py-10 text-center border-t border-slate-900">
             <h2 className="font-royal text-2xl text-slate-700">{groom} & {bride}</h2>
        </footer>
      </div>

      {/* AUDIO CONTROL */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button onClick={toggleAudio} className="bg-amber-600/20 backdrop-blur-md border border-amber-500/50 text-amber-400 p-3 rounded-full hover:bg-amber-600 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(217,119,6,0.5)]">
             {isPlaying ? <Music className="animate-pulse" size={20}/> : <Play size={20} className="ml-1"/>}
          </button>
      </div>
      <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3" loop />
    </div>
  );
}