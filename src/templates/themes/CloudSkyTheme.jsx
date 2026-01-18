import { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Calendar, Clock, Music, Heart, 
  Gift, Play, Pause, Navigation, Copy, Image as ImageIcon, Cloud,
  Plus, Minus, RotateCcw, Quote, MessageSquare, Send, CheckCircle2, Sparkles
} from 'lucide-react';

export default function SkyWorldMapTheme({ groom, bride, date, guestName, data, onRsvpSubmit, submittedData }) {
  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // TRANSFORM STATE (ZOOM & PAN)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [pinchDist, setPinchDist] = useState(null);
  
  // RSVP State
  const [rsvpStatus, setRsvpStatus] = useState('hadir');
  const [rsvpPax, setRsvpPax] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Countdown
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const containerRef = useRef(null);
  const audioRef = useRef(null);

  // Constants
  const MIN_SCALE = 0.2;
  const MAX_SCALE = 3;

  // Data
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

  const quote = data?.quote || "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri...";
  const quoteSrc = data?.quote_src || "QS. Ar-Rum: 21";
  const audioUrl = data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/02/10/audio_fc8c84852c.mp3";

  // --- OPENING LOGIC ---
  const handleOpen = () => {
      setIsOpen(true);
      const initialScale = window.innerWidth < 768 ? 0.4 : 0.6; // Scale awal lebih kecil biar keliatan luas
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      setTransform({
          x: centerX, 
          y: centerY, 
          scale: initialScale
      });

      setTimeout(() => {
          if(audioRef.current) audioRef.current.play().catch(()=>{});
          setIsPlaying(true);
      }, 800);
  };

  // --- ENGINE: ZOOM TO POINT ---
  const zoomToPoint = (newScale, centerX, centerY) => {
      setTransform(prev => {
          const clampedScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
          const ratio = clampedScale / prev.scale;
          
          const newX = centerX - (centerX - prev.x) * ratio;
          const newY = centerY - (centerY - prev.y) * ratio;

          return { x: newX, y: newY, scale: clampedScale };
      });
  };

  // --- HANDLERS ---
  const handleWheel = (e) => {
      if (!isOpen) return;
      e.preventDefault(); 
      const scaleFactor = 1.1;
      const direction = e.deltaY < 0 ? 1 : -1;
      const newScale = direction > 0 ? transform.scale * scaleFactor : transform.scale / scaleFactor;
      zoomToPoint(newScale, e.clientX, e.clientY);
  };

  const handlePointerDown = (e) => {
      if (!isOpen) return;
      if (e.touches && e.touches.length === 2) {
          const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
          );
          setPinchDist(dist);
          setIsDragging(false); 
          return;
      }
      setIsDragging(true);
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setLastMouse({ x: clientX, y: clientY });
  };

  const handlePointerMove = (e) => {
      if (!isOpen) return;
      if (e.cancelable) e.preventDefault(); 

      if (e.touches && e.touches.length === 2 && pinchDist) {
          const newDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
          );
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          const distanceDelta = newDist - pinchDist;
          const zoomSensitivity = 0.005; 
          const newScale = transform.scale + (distanceDelta * zoomSensitivity);
          zoomToPoint(newScale, midX, midY);
          setPinchDist(newDist);
          return;
      }

      if (isDragging) {
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          const deltaX = clientX - lastMouse.x;
          const deltaY = clientY - lastMouse.y;
          setTransform(prev => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
          setLastMouse({ x: clientX, y: clientY });
      }
  };

  const handlePointerUp = () => {
      setIsDragging(false);
      setPinchDist(null);
  };

  const handleButtonZoom = (direction) => {
      const centerW = window.innerWidth / 2;
      const centerH = window.innerHeight / 2;
      const factor = 1.2;
      const newScale = direction === 'in' ? transform.scale * factor : transform.scale / factor;
      zoomToPoint(newScale, centerW, centerH);
  };

  const recenter = () => {
      const initialScale = window.innerWidth < 768 ? 0.4 : 0.6;
      setTransform({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          scale: initialScale
      });
  };

  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!onRsvpSubmit) return alert("Mode Demo: RSVP tidak disimpan.");
    setIsSending(true);
    await onRsvpSubmit({ status: rsvpStatus, pax: parseInt(rsvpPax), message: rsvpMessage });
    setIsSending(false);
  };

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
    
    const container = containerRef.current;
    if(container) {
        container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
        clearInterval(interval);
        if(container) container.removeEventListener('wheel', handleWheel);
    };
  }, [date, transform, isOpen]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#CDEAFE] relative font-sans text-slate-600 select-none touch-none">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;700&family=Nunito:wght@400;700&display=swap');
        .font-cloud { font-family: 'Comfortaa', cursive; }
        .font-body { font-family: 'Nunito', sans-serif; }
        
        .cloud-card {
            background: rgba(255, 255, 255, 0.90);
            backdrop-filter: blur(16px);
            border-radius: 40px;
            box-shadow: 0 20px 50px rgba(100, 150, 255, 0.15);
            padding: 24px;
            text-align: center;
            border: 2px solid rgba(255,255,255,0.8);
            transform: translateZ(0); 
            will-change: transform;
        }

        .float-1 { animation: float 6s ease-in-out infinite; }
        .float-2 { animation: float 7s ease-in-out infinite; animation-delay: 1s; }
        .float-3 { animation: float 8s ease-in-out infinite; animation-delay: 2s; }
        
        @keyframes float { 
            0%, 100% { transform: translateY(0); } 
            50% { transform: translateY(-10px); } 
        }

        /* Scrollbar Halus untuk Chat */
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* --- OPENING COVER SCREEN --- */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#CDEAFE] transition-transform duration-1000 ease-[cubic-bezier(0.7,0,0.3,1)] ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
          <div className="absolute top-20 left-20 opacity-60 blur-2xl bg-white w-72 h-72 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 opacity-60 blur-2xl bg-white w-80 h-80 rounded-full animate-pulse delay-700"></div>
          
          <div className="relative z-10 text-center px-6 max-w-md w-full">
              <div className="mx-auto bg-white/50 p-4 rounded-full w-24 h-24 flex items-center justify-center mb-6 shadow-lg animate-bounce">
                  <Cloud size={48} className="text-sky-500" fill="white"/>
              </div>
              <p className="font-cloud text-sm text-sky-600 tracking-widest uppercase mb-2">The Wedding Of</p>
              <h1 className="font-cloud text-4xl text-slate-700 font-bold mb-8 leading-tight">
                  {groom} <br/> <span className="text-sky-400 text-2xl">&</span> <br/> {bride}
              </h1>
              <button onClick={handleOpen} className="bg-sky-500 text-white font-cloud font-bold py-3 px-10 rounded-full shadow-xl hover:bg-sky-600 hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto active:scale-95">
                  Jelajahi Dunia Kita <Navigation size={16} className="rotate-45"/>
              </button>
          </div>
      </div>

      {/* --- WORLD CANVAS --- */}
      <div 
        ref={containerRef}
        className={`absolute inset-0 z-10 overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
          <div 
            style={{ 
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
                transformOrigin: '0 0',
                position: 'absolute', top: 0, left: 0
            }}
          >
              {/* === ISLANDS (Cards) === */}
              {/* POSISI DIATUR AGAR TIDAK RAPET (Spacious Layout) */}
              
              {/* 1. COUPLE (CENTER - Titik Nol) */}
              <div className="absolute top-0 left-0 w-[550px] -translate-x-1/2 -translate-y-1/2 float-1 z-30">
                  <div className="cloud-card">
                      <p className="font-cloud text-xs text-sky-500 tracking-widest uppercase mb-4">The Wedding Of</p>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="flex-1 flex flex-col items-center">
                              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-2">
                                  <img src={photos.groom} className="w-full h-full object-cover" />
                              </div>
                              <h2 className="font-cloud text-xl text-slate-700 font-bold">{groom}</h2>
                              <p className="font-body text-[10px] text-slate-500 mt-1 leading-tight">Putra Bpk/Ibu<br/>{data?.groom_parents}</p>
                          </div>
                          <Heart size={28} fill="#0ea5e9" className="text-sky-500 animate-pulse mx-4 opacity-60"/>
                          <div className="flex-1 flex flex-col items-center">
                              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-2">
                                  <img src={photos.bride} className="w-full h-full object-cover" />
                              </div>
                              <h2 className="font-cloud text-xl text-slate-700 font-bold">{bride}</h2>
                              <p className="font-body text-[10px] text-slate-500 mt-1 leading-tight">Putri Bpk/Ibu<br/>{data?.bride_parents}</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* 2. GALLERY (TOP - Jauh di atas) */}
              <div className="absolute top-[-500px] left-0 w-[360px] -translate-x-1/2 -translate-y-1/2 float-2">
                  <div className="cloud-card">
                      <div className="flex items-center justify-center gap-2 mb-3 text-sky-600">
                          <ImageIcon size={18}/>
                          <h3 className="font-cloud text-md font-bold">Our Memories</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          {photos.gallery.slice(0, 4).map((url, i) => (
                              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                                  <img src={url} className="w-full h-full object-cover hover:scale-110 transition duration-500" />
                              </div>
                          ))}
                      </div>
                  </div>
                  {/* Tali penghubung putus-putus */}
                  <div className="absolute top-full left-1/2 w-0.5 h-[200px] border-l-2 border-dashed border-sky-300/30"></div>
              </div>

              {/* 3. EVENT (TOP LEFT - Agak jauh) */}
              <div className="absolute top-[-350px] left-[-500px] w-[300px] -translate-x-1/2 -translate-y-1/2 float-3">
                  <div className="cloud-card">
                      <div className="bg-sky-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sky-600">
                          <Calendar size={20}/>
                      </div>
                      <h3 className="font-cloud text-lg text-slate-700 font-bold mb-1">Save The Date</h3>
                      <p className="font-body text-sm font-bold text-sky-600 mb-3">{formattedDate}</p>
                      <div className="text-left bg-white/50 rounded-xl p-3 text-xs space-y-2">
                          <div className="flex justify-between"><span>Akad</span><span className="font-bold">{data?.akad_time}</span></div>
                          <div className="border-t border-slate-200"></div>
                          <div className="flex justify-between"><span>Resepsi</span><span className="font-bold">{data?.resepsi_time}</span></div>
                      </div>
                  </div>
              </div>

              {/* 4. LOCATION (TOP RIGHT - Agak jauh) */}
              <div className="absolute top-[-350px] left-[500px] w-[300px] -translate-x-1/2 -translate-y-1/2 float-3">
                  <div className="cloud-card">
                      <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
                          <MapPin size={20}/>
                      </div>
                      <h3 className="font-cloud text-lg text-slate-700 font-bold">Location</h3>
                      <p className="font-body text-xs text-slate-500 mt-1 mb-3 line-clamp-2">{data?.venue_name}</p>
                      <a href={data?.maps_link} target="_blank" onPointerDown={(e) => e.stopPropagation()} className="bg-green-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-md hover:bg-green-600 transition flex items-center justify-center gap-1 w-full">
                          <Navigation size={12}/> Google Maps
                      </a>
                  </div>
              </div>

              {/* 5. COUNTDOWN (BOTTOM LEFT - Dilebarkan) */}
              <div className="absolute top-[400px] left-[-400px] w-[340px] -translate-x-1/2 -translate-y-1/2 float-2">
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
              </div>

              {/* 6. GIFT (BOTTOM RIGHT - Dilebarkan) */}
              <div className="absolute top-[400px] left-[400px] w-[300px] -translate-x-1/2 -translate-y-1/2 float-1">
                  <div className="cloud-card">
                      <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-500">
                          <Gift size={20}/>
                      </div>
                      <h3 className="font-cloud text-lg text-slate-700 font-bold mb-2">Gift</h3>
                      <div className="space-y-2">
                          {data?.banks?.map((bank, i) => (
                              <div key={i} className="bg-white p-2 rounded-lg border border-purple-100 text-left flex justify-between items-center shadow-sm">
                                  <div>
                                      <p className="font-bold text-xs text-purple-600">{bank.bank}</p>
                                      <p className="font-mono text-xs text-slate-600">{bank.number}</p>
                                  </div>
                                  <button onPointerDown={(e) => { e.stopPropagation(); navigator.clipboard.writeText(bank.number); }} className="bg-purple-100 p-1.5 rounded-md text-purple-600 hover:bg-purple-200">
                                      <Copy size={14}/>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* 7. QUOTE (BOTTOM CENTER - DITURUNKAN LAGI) */}
              <div className="absolute top-[600px] left-0 w-[420px] -translate-x-1/2 -translate-y-1/2 float-3">
                  <div className="cloud-card relative">
                      <Quote size={24} className="text-amber-300 absolute -top-3 left-4 fill-amber-100"/>
                      <p className="font-cloud text-sm text-slate-600 italic leading-relaxed px-4 pt-2">
                          "{quote}"
                      </p>
                      <p className="font-body text-xs font-bold text-sky-500 mt-3 tracking-widest uppercase">
                          — {quoteSrc}
                      </p>
                  </div>
                  {/* Tali Gantung Panjang */}
                  <div className="absolute bottom-full left-1/2 w-0.5 h-[200px] border-l-2 border-dashed border-sky-300/30"></div>
              </div>

              {/* 8. RSVP FORM ISLAND (FAR RIGHT) */}
              <div className="absolute top-[100px] left-[750px] w-[320px] -translate-x-1/2 -translate-y-1/2 float-2">
                  <div className="cloud-card" onPointerDown={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-center mb-4 text-sky-600">
                          <Send size={18}/>
                          <h3 className="font-cloud text-md font-bold">Kirim Ucapan</h3>
                      </div>

                      {submittedData ? (
                          <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2"/>
                              <p className="text-xs text-green-700 font-bold">Terima Kasih!</p>
                              <p className="text-[10px] text-green-600 mt-1">Ucapan Anda sudah terkirim.</p>
                          </div>
                      ) : (
                          <form onSubmit={handleRsvpSubmit} className="space-y-3 text-left">
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 ml-1">Status Kehadiran</label>
                                  <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value)} className="w-full text-xs p-3 rounded-xl border border-sky-100 focus:outline-none focus:border-sky-300 bg-sky-50/30 font-bold text-slate-600">
                                      <option value="hadir">Hadir</option>
                                      <option value="tidak_hadir">Maaf Tidak Bisa</option>
                                      <option value="ragu">Masih Ragu</option>
                                  </select>
                              </div>
                              
                              {rsvpStatus === 'hadir' && (
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 ml-1">Jumlah Tamu</label>
                                      <select value={rsvpPax} onChange={(e) => setRsvpPax(e.target.value)} className="w-full text-xs p-3 rounded-xl border border-sky-100 focus:outline-none focus:border-sky-300 bg-sky-50/30">
                                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Orang</option>)}
                                      </select>
                                  </div>
                              )}

                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 ml-1">Pesan & Doa</label>
                                  <textarea 
                                      required 
                                      value={rsvpMessage} 
                                      onChange={(e) => setRsvpMessage(e.target.value)} 
                                      placeholder="Tulis ucapan selamat..." 
                                      className="w-full text-xs p-3 rounded-xl border border-sky-100 focus:outline-none focus:border-sky-300 bg-sky-50/30 h-24 resize-none"
                                  />
                              </div>

                              <button disabled={isSending} className="w-full bg-sky-500 text-white text-xs font-bold py-3 rounded-xl hover:bg-sky-600 transition flex items-center justify-center gap-2 shadow-lg shadow-sky-200">
                                  {isSending ? 'Mengirim...' : <><Send size={14}/> Kirim Ucapan</>}
                              </button>
                          </form>
                      )}
                  </div>
              </div>

              {/* 9. LOVE NOTES ISLAND (FAR LEFT - CHAT BOARD) */}
              <div className="absolute top-[100px] left-[-750px] w-[350px] -translate-x-1/2 -translate-y-1/2 float-2">
                  <div className="cloud-card text-left p-0 overflow-hidden" onPointerDown={(e) => e.stopPropagation()}>
                      <div className="bg-sky-50/50 p-4 border-b border-sky-100 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sky-600">
                              <MessageSquare size={18}/>
                              <h3 className="font-cloud text-md font-bold">Love Notes</h3>
                          </div>
                          <span className="text-[10px] bg-white px-2 py-1 rounded-full text-sky-400 font-bold border border-sky-100">
                              {(data?.rsvps || []).length} Pesan
                          </span>
                      </div>
                      
                      {/* CHAT CONTAINER (DISCORD STYLE) */}
                      <div className="h-[350px] overflow-y-auto p-4 space-y-4 chat-scroll bg-white/40">
                          {(data?.rsvps || []).length === 0 ? (
                              <div className="text-center py-8 opacity-50">
                                  <p className="text-xs italic text-slate-400">Belum ada ucapan.</p>
                              </div>
                          ) : (
                              (data?.rsvps || []).map((item, idx) => (
                                  <div key={idx} className="group animate-fade-in-up">
                                      {/* PESAN TAMU */}
                                      <div className="flex gap-3 items-start">
                                          {/* Avatar */}
                                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-300 to-blue-400 flex items-center justify-center shrink-0 text-white font-bold font-cloud text-xs shadow-sm">
                                              {item.guest_name.charAt(0).toUpperCase()}
                                          </div>
                                          
                                          <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-0.5">
                                                  <span className="font-bold text-slate-700 text-xs truncate max-w-[100px]">{item.guest_name}</span>
                                                  <span className={`text-[8px] px-1.5 py-0.5 rounded text-white font-bold uppercase ${
                                                      item.status === 'hadir' ? 'bg-emerald-400' : 
                                                      item.status === 'tidak_hadir' ? 'bg-rose-400' : 'bg-amber-400'
                                                  }`}>
                                                      {item.status === 'hadir' ? 'Hadir' : item.status === 'tidak_hadir' ? 'Absen' : 'Ragu'}
                                                  </span>
                                                  <span className="text-[9px] text-slate-400 ml-auto">
                                                      {new Date(item.created_at).toLocaleDateString()}
                                                  </span>
                                              </div>
                                              <p className="text-slate-600 text-xs leading-relaxed">
                                                  {item.message}
                                              </p>
                                          </div>
                                      </div>

                                      {/* BALASAN ADMIN (THREAD STYLE) */}
                                      {item.reply && (
                                          <div className="flex mt-1 ml-1">
                                              <div className="w-6 flex justify-end mr-2">
                                                  <div className="w-3 h-4 border-l-2 border-b-2 border-slate-200 rounded-bl-lg"></div>
                                              </div>
                                              <div className="flex-1 flex gap-2 items-start pt-1">
                                                  <div className="w-5 h-5 rounded-full bg-pink-300 flex items-center justify-center shrink-0 text-white shadow-sm mt-0.5">
                                                      <Heart size={10} fill="white"/>
                                                  </div>
                                                  <div className="bg-white/60 p-2 rounded-lg border border-pink-100 flex-1">
                                                      <span className="text-[10px] font-bold text-pink-500 flex items-center gap-1 mb-0.5">
                                                          Mempelai <Sparkles size={8}/>
                                                      </span>
                                                      <p className="text-slate-600 text-[10px] leading-tight">{item.reply}</p>
                                                  </div>
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>

              {/* BACKGROUND CLOUDS (Hiasan Jauh) */}
              <div className="absolute top-[-500px] left-[-600px] opacity-40"><Cloud size={300} className="text-white fill-white blur-xl"/></div>
              <div className="absolute bottom-[-400px] right-[-500px] opacity-40"><Cloud size={400} className="text-white fill-white blur-2xl"/></div>

          </div>
      </div>

      {/* --- UI CONTROLS --- */}
      <div className={`fixed bottom-24 right-6 flex flex-col gap-3 z-50 transition-all duration-500 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
          <button onClick={() => handleButtonZoom('in')} className="bg-white p-3 rounded-full shadow-lg text-slate-600 hover:text-sky-500 active:scale-95 transition border border-sky-100">
              <Plus size={24}/>
          </button>
          <button onClick={() => handleButtonZoom('out')} className="bg-white p-3 rounded-full shadow-lg text-slate-600 hover:text-sky-500 active:scale-95 transition border border-sky-100">
              <Minus size={24}/>
          </button>
      </div>

      <div className={`fixed bottom-8 right-6 flex gap-3 z-50 transition-all duration-500 delay-100 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button onClick={recenter} className="bg-white p-3 rounded-full shadow-lg text-slate-600 hover:text-sky-500 active:scale-95 border border-sky-100" title="Reset View">
              <RotateCcw size={20}/>
          </button>
          <button onClick={toggleAudio} className="bg-sky-500 p-3 rounded-full shadow-lg text-white hover:bg-sky-600 active:scale-95 border border-sky-400">
              {isPlaying ? <Pause size={20}/> : <Play size={20}/>}
          </button>
      </div>

      <audio ref={audioRef} src={audioUrl} loop />
    </div>
  );
}

function TimeBox({ val, label }) {
    return (
        <div className="text-center bg-white rounded-lg p-2 min-w-[50px] shadow-sm">
            <span className="block font-bold text-lg text-sky-600">{String(val).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase text-slate-400">{label}</span>
        </div>
    )
}