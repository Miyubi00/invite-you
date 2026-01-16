import { useState, useRef, useEffect } from 'react';
import { 
  Terminal, MapPin, Calendar, Clock, CreditCard, 
  Copy, Music, Play, Pause, Power, Cpu, ShieldCheck 
} from 'lucide-react';

export default function CyberpunkTheme({ groom, bride, date, guestName, data }) {
  const [booted, setBooted] = useState(false); // Status Opening
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- DATA ---
  const photos = {
    cover: data?.cover_photo || "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&fit=crop", // Neon City vibes
    groom: data?.groom_photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&fit=crop",
    bride: data?.bride_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop",
  };

  const gallery = data?.gallery || [
    "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=500&fit=crop",
    "https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=500&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&fit=crop",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&fit=crop"
  ];

  const banks = data?.banks || [];

  const formattedDate = new Date(date || new Date()).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).replace(/\//g, '.'); // Format 24.08.2026

  // --- LOGIC ---
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

  const handleBoot = () => {
      setBooted(true);
      setTimeout(() => {
          if(audioRef.current) audioRef.current.play().catch(()=>{});
          setIsPlaying(true);
      }, 500);
  }

  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  return (
    <div className="bg-[#05070F] text-[#E0E0E0] min-h-screen relative overflow-x-hidden font-cyber selection:bg-[#00F5FF] selection:text-black">

      {/* --- CSS & ASSETS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');
        
        .font-cyber-head { font-family: 'Orbitron', sans-serif; }
        .font-cyber-body { font-family: 'Rajdhani', sans-serif; }
        
        /* Neon Colors Variables */
        :root {
            --neon-cyan: #00F5FF;
            --neon-pink: #FF2BD6;
            --neon-green: #22FF88;
        }

        /* Scanline Overlay */
        .scanlines {
            background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3));
            background-size: 100% 4px;
            position: fixed; inset: 0; z-index: 40; pointer-events: none;
        }

        /* Cyber Grid Background Animation */
        .cyber-grid {
            background-image: 
                linear-gradient(rgba(0, 245, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 245, 255, 0.1) 1px, transparent 1px);
            background-size: 40px 40px;
            background-position: center bottom;
            transform: perspective(500px) rotateX(60deg);
            position: absolute; bottom: -100px; left: -50%; right: -50%; height: 100vh;
            animation: moveGrid 20s linear infinite;
            z-index: 0;
            mask-image: linear-gradient(to top, black, transparent 80%);
        }
        @keyframes moveGrid {
            0% { background-position: 0 0; }
            100% { background-position: 0 1000px; }
        }

        /* Glitch Text Effect */
        .glitch {
            position: relative;
        }
        .glitch::before, .glitch::after {
            content: attr(data-text);
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        }
        .glitch::before {
            left: 2px; text-shadow: -1px 0 #FF2BD6; clip-path: inset(0 0 0 0);
            animation: glitch-anim-1 2s infinite linear alternate-reverse;
        }
        .glitch::after {
            left: -2px; text-shadow: -1px 0 #00F5FF; clip-path: inset(0 0 0 0);
            animation: glitch-anim-2 3s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim-1 {
            0% { clip-path: inset(20% 0 80% 0); }
            20% { clip-path: inset(60% 0 10% 0); }
            40% { clip-path: inset(40% 0 50% 0); }
            60% { clip-path: inset(80% 0 5% 0); }
            80% { clip-path: inset(10% 0 60% 0); }
            100% { clip-path: inset(30% 0 30% 0); }
        }
        @keyframes glitch-anim-2 {
            0% { clip-path: inset(10% 0 60% 0); }
            20% { clip-path: inset(30% 0 20% 0); }
            40% { clip-path: inset(70% 0 10% 0); }
            60% { clip-path: inset(50% 0 30% 0); }
            80% { clip-path: inset(20% 0 50% 0); }
            100% { clip-path: inset(90% 0 5% 0); }
        }

        /* Neon Box Shadow Utilities */
        .glow-cyan { box-shadow: 0 0 10px rgba(0, 245, 255, 0.5), inset 0 0 10px rgba(0, 245, 255, 0.2); }
        .glow-pink { box-shadow: 0 0 10px rgba(255, 43, 214, 0.5), inset 0 0 10px rgba(255, 43, 214, 0.2); }
        .text-glow { text-shadow: 0 0 10px rgba(0, 245, 255, 0.8); }
        
        /* Hologram Card */
        .holo-card {
            background: rgba(5, 7, 15, 0.6);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(0, 245, 255, 0.3);
            position: relative;
            overflow: hidden;
        }
        .holo-card::before {
            content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: skewX(-25deg);
            animation: shine 6s infinite;
        }
        @keyframes shine { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }

        /* Corner Brackets */
        .corner-brackets {
            position: relative;
        }
        .corner-brackets::before {
            content: ''; position: absolute; top: -2px; left: -2px; width: 10px; height: 10px;
            border-top: 2px solid #00F5FF; border-left: 2px solid #00F5FF;
        }
        .corner-brackets::after {
            content: ''; position: absolute; bottom: -2px; right: -2px; width: 10px; height: 10px;
            border-bottom: 2px solid #00F5FF; border-right: 2px solid #00F5FF;
        }
      `}</style>

      {/* --- OVERLAYS --- */}
      <div className="scanlines"></div>
      
      {/* --- BOOT SCREEN (OPENING) --- */}
      <div className={`fixed inset-0 z-50 bg-[#05070F] flex flex-col items-center justify-center transition-transform duration-700 ease-in-out ${booted ? '-translate-y-full' : 'translate-y-0'}`}>
          <div className="w-full max-w-md px-8">
              <div className="font-cyber-body text-[#00F5FF] text-sm mb-4 typing-effect">
                  <span className="mr-2">user@system:~$</span>
                  <span className="animate-pulse">init_wedding_protocol.exe</span>
              </div>
              
              <div className="border border-[#00F5FF] p-6 relative glow-cyan bg-black/80">
                  <div className="absolute top-0 left-0 w-2 h-2 bg-[#00F5FF]"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 bg-[#00F5FF]"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#00F5FF]"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#00F5FF]"></div>

                  <h1 className="font-cyber-head text-4xl text-white text-center mb-2 glitch" data-text="SYSTEM ONLINE">
                      SYSTEM ONLINE
                  </h1>
                  <p className="font-cyber-body text-center text-gray-400 text-lg uppercase tracking-[0.2em] mb-8">
                      Target: {guestName || "UNKNOWN_USER"}
                  </p>

                  <button 
                      onClick={handleBoot}
                      className="w-full bg-[#00F5FF] text-black font-cyber-head font-bold py-3 hover:bg-white hover:text-[#00F5FF] transition-all clip-path-polygon"
                      style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                  >
                      ENTER SYSTEM_
                  </button>
              </div>
          </div>
      </div>

      {/* --- MAIN SYSTEM --- */}
      <div className={`transition-opacity duration-1000 ${booted ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* BACKGROUND GRID */}
          <div className="fixed inset-0 cyber-grid pointer-events-none"></div>
          
          <div className="relative z-10 max-w-lg mx-auto pb-24">

              {/* 1. HERO (DATA STREAM) */}
              <header className="pt-12 px-6 mb-12 text-center">
                  <div className="inline-block border border-[#22FF88] px-3 py-1 rounded-sm text-[#22FF88] text-xs font-cyber-body tracking-widest mb-4 glow-green">
                      STATUS: MARRIED_SOON
                  </div>
                  <div className="relative mb-6">
                      <h1 className="font-cyber-head text-5xl md:text-6xl text-white glitch" data-text={`${groom} & ${bride}`}>
                          {groom} <br/> <span className="text-[#FF2BD6]">&</span> <br/> {bride}
                      </h1>
                  </div>
                  <p className="font-cyber-body text-[#00F5FF] text-xl tracking-[0.3em] border-y border-[#00F5FF]/30 py-2 inline-block">
                      {formattedDate}
                  </p>
              </header>

              {/* 2. COUNTDOWN (DIGITAL CLOCK) */}
              <section className="px-4 mb-16">
                  <div className="holo-card p-6 flex justify-between items-center text-center">
                      <TimeDigit val={timeLeft.days} label="DAYS" color="text-[#00F5FF]" />
                      <div className="text-2xl text-gray-600 font-cyber-head">:</div>
                      <TimeDigit val={timeLeft.hours} label="HRS" color="text-[#FF2BD6]" />
                      <div className="text-2xl text-gray-600 font-cyber-head">:</div>
                      <TimeDigit val={timeLeft.minutes} label="MIN" color="text-[#00F5FF]" />
                      <div className="text-2xl text-gray-600 font-cyber-head">:</div>
                      <TimeDigit val={timeLeft.seconds} label="SEC" color="text-[#FF2BD6]" />
                  </div>
              </section>

              {/* 3. COUPLE (HOLOGRAM CARDS) */}
              <section className="px-4 mb-16 space-y-8">
                  {/* Groom */}
                  <div className="holo-card p-1 corner-brackets group">
                      <div className="flex items-center gap-4 p-4">
                          <div className="w-24 h-24 border-2 border-[#00F5FF] relative overflow-hidden grayscale group-hover:grayscale-0 transition duration-500">
                              <img src={photos.groom} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-[#00F5FF] opacity-20 mix-blend-overlay"></div>
                          </div>
                          <div>
                              <h3 className="font-cyber-head text-2xl text-white">{groom}</h3>
                              <p className="font-cyber-body text-[#00F5FF] text-sm">ROLE: GROOM</p>
                              <div className="h-[1px] w-full bg-gray-700 my-2"></div>
                              <p className="font-cyber-body text-gray-400 text-xs">SON_OF: <br/>{data?.groom_parents}</p>
                          </div>
                      </div>
                  </div>

                  {/* Bride */}
                  <div className="holo-card p-1 corner-brackets group">
                      <div className="flex items-center gap-4 p-4 flex-row-reverse text-right">
                          <div className="w-24 h-24 border-2 border-[#FF2BD6] relative overflow-hidden grayscale group-hover:grayscale-0 transition duration-500">
                              <img src={photos.bride} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-[#FF2BD6] opacity-20 mix-blend-overlay"></div>
                          </div>
                          <div>
                              <h3 className="font-cyber-head text-2xl text-white">{bride}</h3>
                              <p className="font-cyber-body text-[#FF2BD6] text-sm">ROLE: BRIDE</p>
                              <div className="h-[1px] w-full bg-gray-700 my-2"></div>
                              <p className="font-cyber-body text-gray-400 text-xs">DAUGHTER_OF: <br/>{data?.bride_parents}</p>
                          </div>
                      </div>
                  </div>
              </section>

              {/* 4. EVENT INFO (DATA PANEL) */}
              <section className="px-4 mb-16">
                  <div className="border border-[#22FF88]/50 bg-black/80 p-6 relative">
                      <div className="absolute -top-3 left-4 bg-black px-2 text-[#22FF88] font-cyber-head text-sm border border-[#22FF88] flex items-center gap-2">
                          <Cpu size={14}/> MISSION DATA
                      </div>
                      
                      <div className="space-y-6 mt-2">
                          <div className="flex gap-4 items-start">
                              <Calendar className="text-[#22FF88] shrink-0" />
                              <div>
                                  <h4 className="font-cyber-head text-white text-lg">DATE_TIME</h4>
                                  <p className="font-cyber-body text-gray-300">{formattedDate}</p>
                                  <div className="flex gap-4 mt-1 text-xs text-[#22FF88]">
                                      <span>AKAD: {data?.akad_time}</span>
                                      <span>|</span>
                                      <span>PARTY: {data?.resepsi_time}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="flex gap-4 items-start">
                              <MapPin className="text-[#22FF88] shrink-0" />
                              <div>
                                  <h4 className="font-cyber-head text-white text-lg">COORDINATES</h4>
                                  <p className="font-cyber-body text-gray-300 text-sm mb-3">{data?.venue_name} <br/> {data?.venue_address}</p>
                                  <a href={data?.maps_link} target="_blank" className="inline-block bg-[#22FF88] text-black px-4 py-1 text-sm font-bold hover:bg-white transition skew-x-[-10deg]">
                                      INITIATE_GPS
                                  </a>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>

              {/* 5. GALLERY (NEON GRID) */}
              {gallery.length > 0 && (
                <section className="px-4 mb-16">
                    <h2 className="font-cyber-head text-2xl text-center mb-6 text-white text-glow">VISUAL_LOGS</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {gallery.map((url, i) => (
                            <div key={i} className={`relative group border border-gray-800 overflow-hidden ${i%3===0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                                <img src={url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition duration-300 group-hover:scale-110" />
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#00F5FF] transition-all duration-300"></div>
                                {/* Tech overlay corner */}
                                <div className="absolute bottom-0 right-0 bg-black/70 px-2 py-1 text-[10px] font-cyber-body text-[#00F5FF]">IMG_0{i+1}</div>
                            </div>
                        ))}
                    </div>
                </section>
              )}

              {/* 6. GIFT (DATA CHIP) */}
              <section className="px-4 mb-16">
                  <div className="bg-[#1a1a2e] border-l-4 border-[#FF2BD6] p-6 relative overflow-hidden shadow-[0_0_15px_rgba(255,43,214,0.2)]">
                      <div className="absolute top-0 right-0 p-2 opacity-20"><CreditCard size={64}/></div>
                      <h2 className="font-cyber-head text-xl text-[#FF2BD6] mb-4 flex items-center gap-2">
                          <CreditCard size={20}/> CREDIT_TRANSFER
                      </h2>
                      
                      <div className="space-y-4 relative z-10">
                          {banks.map((bank, i) => (
                              <div key={i} className="bg-black/50 border border-gray-700 p-4 flex justify-between items-center group hover:border-[#FF2BD6] transition">
                                  <div>
                                      <p className="text-xs text-gray-500 font-cyber-head">{bank.bank}</p>
                                      <p className="text-xl font-cyber-body tracking-widest text-white">{bank.number}</p>
                                      <p className="text-xs text-gray-400">USR: {bank.name}</p>
                                  </div>
                                  <button onClick={() => navigator.clipboard.writeText(bank.number)} className="text-[#FF2BD6] hover:text-white transition">
                                      <Copy size={20}/>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              </section>

              {/* 7. CLOSING */}
              <footer className="text-center py-12 border-t border-gray-900">
                  <ShieldCheck className="mx-auto text-[#00F5FF] mb-4" size={32}/>
                  <p className="font-cyber-body text-gray-500 text-sm tracking-widest">END_OF_LINE</p>
                  <h2 className="font-cyber-head text-2xl text-white mt-2">THANK YOU</h2>
              </footer>

          </div>

          {/* AUDIO BUTTON */}
          <button 
            onClick={toggleAudio}
            className="fixed bottom-8 right-8 z-50 bg-black border border-[#00F5FF] text-[#00F5FF] p-3 rounded-full hover:bg-[#00F5FF] hover:text-black transition shadow-[0_0_15px_#00F5FF]"
          >
              {isPlaying ? <Music size={20} className="animate-spin"/> : <Play size={20}/>}
          </button>

      </div>

      <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3"} loop />
    </div>
  );
}

// SUB COMPONENT
function TimeDigit({ val, label, color }) {
    return (
        <div className="flex flex-col items-center">
            <span className={`text-4xl md:text-5xl font-cyber-head ${color} text-shadow-glow`}>
                {String(val).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-gray-500 font-cyber-body tracking-widest mt-1">{label}</span>
        </div>
    )
}