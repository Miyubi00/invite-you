import { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Calendar, Clock, Music, Heart, 
  Gift, Play, Pause, Navigation, Copy, Image as ImageIcon, Cloud 
} from 'lucide-react';

export default function SkyWorldDirectTheme({ groom, bride, date, guestName, data }) {
  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false); // State untuk Cover Depan
  const [offset, setOffset] = useState({ x: 0, y: 0 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const containerRef = useRef(null);
  const audioRef = useRef(null);

  // Data Default
  const photos = {
    groom: data?.groom_photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&fit=crop",
    bride: data?.bride_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop",
    gallery: data?.gallery || [
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&fit=crop",
        "https://images.unsplash.com/photo-1511285560982-1356c11d4606?w=300&fit=crop",
        "https://images.unsplash.com/photo-1522673607200-1645062cd958?w=300&fit=crop",
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=300&fit=crop"
    ]
  };

  const formattedDate = new Date(date || new Date()).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // --- LOGIC: OPENING ---
  const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => {
          if(audioRef.current) audioRef.current.play().catch(()=>{});
          setIsPlaying(true);
      }, 800);
  };

  // --- LOGIC: COUNTDOWN ---
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

  // --- LOGIC: DRAGGING ---
  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setStartPos({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault(); 

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const limit = 1200;
    
    let newX = clientX - startPos.x;
    let newY = clientY - startPos.y;

    setOffset({
      x: Math.max(Math.min(newX, limit), -limit),
      y: Math.max(Math.min(newY, limit), -limit)
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  // --- AUDIO ---
  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const recenter = () => setOffset({ x: 0, y: 0 });

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#CDEAFE] relative font-sans text-slate-600 select-none touch-none">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;700&family=Nunito:wght@400;700&display=swap');
        .font-cloud { font-family: 'Comfortaa', cursive; }
        .font-body { font-family: 'Nunito', sans-serif; }
        
        .cloud-card {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(12px);
            border-radius: 40px;
            box-shadow: 0 15px 35px rgba(100, 150, 255, 0.15), inset 0 0 20px rgba(255,255,255, 0.8);
            padding: 24px;
            text-align: center;
            border: 2px solid rgba(255,255,255,0.8);
        }

        .float-1 { animation: float 6s ease-in-out infinite; }
        .float-2 { animation: float 7s ease-in-out infinite; animation-delay: 1s; }
        .float-3 { animation: float 8s ease-in-out infinite; animation-delay: 2s; }
        
        @keyframes float { 
            0%, 100% { transform: translateY(0); } 
            50% { transform: translateY(-15px); } 
        }
      `}</style>

      {/* --- OPENING COVER SCREEN --- */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#CDEAFE] transition-transform duration-1000 ease-[cubic-bezier(0.7,0,0.3,1)] ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
          {/* Background Decor */}
          <div className="absolute top-20 left-20 opacity-60 blur-2xl bg-white w-72 h-72 rounded-full"></div>
          <div className="absolute bottom-20 right-20 opacity-60 blur-2xl bg-white w-80 h-80 rounded-full"></div>
          
          <div className="relative z-10 text-center px-6 max-w-md w-full">
              {/* Cloud Icon */}
              <div className="mx-auto bg-white/50 p-4 rounded-full w-24 h-24 flex items-center justify-center mb-6 shadow-lg animate-bounce">
                  <Cloud size={48} className="text-sky-500" fill="white"/>
              </div>

              <p className="font-cloud text-sm text-sky-600 tracking-widest uppercase mb-2">The Wedding Of</p>
              <h1 className="font-cloud text-4xl text-slate-700 font-bold mb-8 leading-tight">
                  {groom} <br/> <span className="text-sky-400 text-2xl">&</span> <br/> {bride}
              </h1>

              {/* Guest Card */}
              <div className="cloud-card mb-8 transform rotate-1 hover:rotate-0 transition duration-300">
                  <p className="font-body text-xs text-slate-400 uppercase tracking-widest mb-1">Special Invitation For:</p>
                  <h2 className="font-cloud text-xl text-slate-800 font-bold capitalize">{guestName || "Tamu Undangan"}</h2>
              </div>

              <button 
                  onClick={handleOpen}
                  className="bg-sky-500 text-white font-cloud font-bold py-3 px-10 rounded-full shadow-xl hover:bg-sky-600 hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                  Buka Undangan <Navigation size={16} className="rotate-45"/>
              </button>
          </div>
      </div>


      {/* --- BACKGROUND SKY --- */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#BAE6FD] via-[#E0F2FE] to-white z-0 pointer-events-none"></div>
      
      {/* Dekorasi Awan Latar */}
      <div className="absolute top-20 left-20 opacity-40 blur-xl bg-white w-64 h-32 rounded-full pointer-events-none"></div>
      <div className="absolute bottom-40 right-20 opacity-30 blur-2xl bg-white w-80 h-40 rounded-full pointer-events-none"></div>

      {/* --- KANVAS UTAMA (DRAGGABLE WORLD) --- */}
      <div 
        ref={containerRef}
        className={`absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out z-10 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
          {/* TITIK TENGAH (0,0) */}
          <div className="relative w-0 h-0">

              {/* 1. AWAN UTAMA (COUPLE) - TENGAH (LEBAR) */}
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[550px] max-w-[90vw] float-1 z-30">
                  <div className="cloud-card">
                      <p className="font-cloud text-xs text-sky-500 tracking-widest uppercase mb-4">The Wedding Of</p>
                      
                      {/* SPLIT LAYOUT */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          
                          {/* Groom */}
                          <div className="flex-1 flex flex-col items-center">
                              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md mb-2">
                                  <img src={photos.groom} className="w-full h-full object-cover" />
                              </div>
                              <h2 className="font-cloud text-xl text-slate-700 font-bold">{groom}</h2>
                              <p className="font-body text-[10px] text-slate-500 mt-1">
                                  Putra dari <br/> {data?.groom_parents}
                              </p>
                          </div>

                          {/* Center Love & Lines */}
                          <div className="flex items-center gap-2 px-2 opacity-60">
                              <div className="w-8 h-0.5 bg-sky-300 hidden md:block"></div>
                              <div className="bg-sky-100 p-2 rounded-full text-sky-500">
                                  <Heart size={20} fill="#0ea5e9" className="animate-pulse"/>
                              </div>
                              <div className="w-8 h-0.5 bg-sky-300 hidden md:block"></div>
                          </div>

                          {/* Bride */}
                          <div className="flex-1 flex flex-col items-center">
                              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md mb-2">
                                  <img src={photos.bride} className="w-full h-full object-cover" />
                              </div>
                              <h2 className="font-cloud text-xl text-slate-700 font-bold">{bride}</h2>
                              <p className="font-body text-[10px] text-slate-500 mt-1">
                                  Putri dari <br/> {data?.bride_parents}
                              </p>
                          </div>

                      </div>
                  </div>
              </div>

              {/* 2. AWAN GALLERY - ATAS TENGAH */}
              <div className="absolute top-[-420px] left-0 -translate-x-1/2 -translate-y-1/2 w-[340px] float-2">
                  <div className="cloud-card">
                      <div className="flex items-center justify-center gap-2 mb-3 text-sky-600">
                          <ImageIcon size={18}/>
                          <h3 className="font-cloud text-md font-bold">Our Gallery</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          {photos.gallery.slice(0, 4).map((url, i) => (
                              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                                  <img src={url} className="w-full h-full object-cover hover:scale-110 transition duration-500" />
                              </div>
                          ))}
                      </div>
                  </div>
                  {/* Tali ke bawah */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-[100px] border-l-2 border-dashed border-sky-300/50 pointer-events-none"></div>
              </div>

              {/* 3. AWAN ACARA (EVENT) - KIRI ATAS */}
              <div className="absolute top-[-250px] left-[-400px] -translate-x-1/2 -translate-y-1/2 w-[280px] float-3">
                  <div className="cloud-card">
                      <div className="bg-sky-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sky-600">
                          <Calendar size={20}/>
                      </div>
                      <h3 className="font-cloud text-lg text-slate-700 font-bold mb-1">Save The Date</h3>
                      <p className="font-body text-sm font-bold text-sky-600 mb-3">{formattedDate}</p>
                      
                      <div className="text-left bg-white/50 rounded-xl p-3 text-xs space-y-2">
                          <div className="flex justify-between">
                              <span>Akad</span>
                              <span className="font-bold">{data?.akad_time}</span>
                          </div>
                          <div className="border-t border-slate-200"></div>
                          <div className="flex justify-between">
                              <span>Resepsi</span>
                              <span className="font-bold">{data?.resepsi_time}</span>
                          </div>
                      </div>
                  </div>
                  <div className="absolute top-full right-0 w-20 h-[100px] border-r-2 border-dashed border-sky-300/50 rounded-br-full pointer-events-none"></div>
              </div>

              {/* 4. AWAN LOKASI (MAPS) - KANAN ATAS */}
              <div className="absolute top-[-250px] left-[400px] -translate-x-1/2 -translate-y-1/2 w-[260px] float-3">
                  <div className="cloud-card">
                      <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
                          <MapPin size={20}/>
                      </div>
                      <h3 className="font-cloud text-lg text-slate-700 font-bold">Location</h3>
                      <p className="font-body text-xs text-slate-500 mt-1 mb-3 line-clamp-2">
                          {data?.venue_name}
                      </p>
                      <a 
                        href={data?.maps_link} 
                        target="_blank"
                        onPointerDown={(e) => e.stopPropagation()} 
                        className="bg-green-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-md hover:bg-green-600 transition flex items-center justify-center gap-1 w-full"
                      >
                          <Navigation size={12}/> Open Google Maps
                      </a>
                  </div>
                  <div className="absolute top-full left-0 w-20 h-[100px] border-l-2 border-dashed border-sky-300/50 rounded-bl-full pointer-events-none"></div>
              </div>

              {/* 5. AWAN COUNTDOWN - KIRI BAWAH */}
              <div className="absolute top-[300px] left-[-350px] -translate-x-1/2 -translate-y-1/2 w-[320px] float-2">
                  <div className="cloud-card">
                      <div className="bg-pink-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-pink-500">
                          <Clock size={20}/>
                      </div>
                      <h3 className="font-cloud text-lg text-slate-700 font-bold mb-3">Counting Down</h3>
                      <div className="flex justify-center gap-2">
                          <TimeBox val={timeLeft.days} label="Hari" />
                          <TimeBox val={timeLeft.hours} label="Jam" />
                          <TimeBox val={timeLeft.minutes} label="Mnt" />
                          <TimeBox val={timeLeft.seconds} label="Dtk" />
                      </div>
                  </div>
                  <div className="absolute bottom-full right-0 w-20 h-[100px] border-r-2 border-dashed border-sky-300/50 rounded-tr-full pointer-events-none"></div>
              </div>

              {/* 6. AWAN GIFT - KANAN BAWAH */}
              <div className="absolute top-[300px] left-[350px] -translate-x-1/2 -translate-y-1/2 w-[280px] float-1">
                  <div className="cloud-card">
                      <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-500">
                          <Gift size={20}/>
                      </div>
                      <h3 className="font-cloud text-lg text-slate-700 font-bold mb-2">Wedding Gift</h3>
                      <div className="space-y-2">
                          {data?.banks?.map((bank, i) => (
                              <div key={i} className="bg-white p-2 rounded-lg border border-purple-100 text-left flex justify-between items-center shadow-sm">
                                  <div>
                                      <p className="font-bold text-xs text-purple-600">{bank.bank}</p>
                                      <p className="font-mono text-xs text-slate-600">{bank.number}</p>
                                  </div>
                                  <button 
                                    onPointerDown={(e) => { e.stopPropagation(); navigator.clipboard.writeText(bank.number); }}
                                    className="bg-purple-100 p-1.5 rounded-md text-purple-600 hover:bg-purple-200"
                                  >
                                      <Copy size={14}/>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="absolute bottom-full left-0 w-20 h-[100px] border-l-2 border-dashed border-sky-300/50 rounded-tl-full pointer-events-none"></div>
              </div>

          </div>
      </div>

      {/* --- UI CONTROLS --- */}
      
      {/* Hint Drag */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 pointer-events-none text-slate-400 text-center animate-pulse z-50 transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <p className="font-cloud text-xs tracking-widest bg-white/50 px-4 py-1 rounded-full backdrop-blur-sm shadow-sm">
              GESER LAYAR UNTUK MENJELAJAH ☁️
          </p>
      </div>

      {/* Recenter Button */}
      <button 
        onClick={recenter}
        className={`fixed bottom-10 right-6 bg-white p-3 rounded-full shadow-lg text-slate-600 hover:text-sky-500 z-50 transition-all duration-500 ${isOpen ? 'translate-y-0' : 'translate-y-20'}`}
        title="Kembali ke Tengah"
      >
          <Navigation size={20} className="rotate-45"/>
      </button>

      {/* Music Control */}
      <button 
        onClick={toggleAudio}
        className={`fixed top-6 right-6 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-sky-500 shadow-md hover:scale-110 transition z-50 duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      >
          {isPlaying ? <Pause size={18}/> : <Play size={18}/>}
      </button>

      <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/02/10/audio_fc8c84852c.mp3"} loop />
    </div>
  );
}

// Sub Component TimeBox
function TimeBox({ val, label }) {
    return (
        <div className="text-center bg-white rounded-lg p-2 min-w-[50px] shadow-sm">
            <span className="block font-bold text-lg text-sky-600">{String(val).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase text-slate-400">{label}</span>
        </div>
    )
}