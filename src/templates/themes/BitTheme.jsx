import { useState, useRef, useEffect } from 'react';
import { 
  Gamepad2, Heart, MapPin, Calendar, Gift, 
  Play, Pause, X, ChevronRight, Trophy, Image as ImageIcon 
} from 'lucide-react';

export default function EightBitTheme({ groom, bride, date, guestName, data }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const sfxRef = useRef(null); // Efek suara tombol

  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- ASSETS & DATA ---
  const photos = {
    groom: data?.groom_photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&fit=crop",
    bride: data?.bride_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop",
    cover: data?.cover_photo || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&fit=crop" // Retro vibes
  };

  const gallery = data?.gallery || [
    "https://images.unsplash.com/photo-1511285560982-1356c11d4606?w=500&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-1645062cd958?w=500&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&fit=crop",
    "https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=500&fit=crop"
  ];
  
  const banks = data?.banks || [];

  const formattedDate = new Date(date || new Date()).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
  }).toUpperCase();

  // --- LOGIC ---
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
      } else clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [date]);

  const startGame = () => {
    playSfx();
    setGameStarted(true);
    setTimeout(() => {
      if(audioRef.current) audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }, 1000);
  };

  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const playSfx = () => {
      if(sfxRef.current) {
          sfxRef.current.currentTime = 0;
          sfxRef.current.play().catch(() => {});
      }
  };

  const copyText = (text) => {
      playSfx();
      navigator.clipboard.writeText(text);
      alert("COINS ADDRESS COPIED!");
  }

  return (
    // MAIN CONTAINER: Dark Retro Console
    <div className="bg-[#0F172A] text-white min-h-screen relative overflow-x-hidden font-pixel selection:bg-[#22C55E] selection:text-black">

      {/* --- GLOBAL STYLES --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
        
        .font-pixel-head { font-family: 'Press Start 2P', cursive; }
        .font-pixel-body { font-family: 'VT323', monospace; font-size: 1.2rem; }
        
        /* CRT Scanline Effect */
        .scanlines {
            background: linear-gradient(
                to bottom,
                rgba(255,255,255,0),
                rgba(255,255,255,0) 50%,
                rgba(0,0,0,0.2) 50%,
                rgba(0,0,0,0.2)
            );
            background-size: 100% 4px;
            position: fixed; pointer-events: none; inset: 0; z-index: 50;
        }
        
        /* Pixel Border CSS Trick */
        .pixel-box {
            box-shadow: 
                -4px 0 0 0 white, 
                4px 0 0 0 white, 
                0 -4px 0 0 white, 
                0 4px 0 0 white;
            margin: 4px;
        }
        .pixel-box-green {
            box-shadow: -4px 0 0 0 #22C55E, 4px 0 0 0 #22C55E, 0 -4px 0 0 #22C55E, 0 4px 0 0 #22C55E;
        }
        .pixel-btn:active { transform: translateY(4px); }

        /* Animations */
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-blink { animation: blink 1s step-end infinite; }
        
        @keyframes slideIn { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-enter { animation: slideIn 0.8s steps(5) forwards; }
      `}</style>

      {/* CRT OVERLAY */}
      <div className="scanlines"></div>

      {/* --- START SCREEN (PRESS START) --- */}
      <div className={`fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center text-center transition-all duration-1000 ${gameStarted ? '-translate-y-full' : 'translate-y-0'}`}>
          <Gamepad2 size={64} className="text-[#22C55E] mb-6 animate-bounce" />
          
          <h1 className="font-pixel-head text-[#FACC15] text-2xl md:text-4xl leading-relaxed mb-4 px-4 text-shadow-pixel">
              WEDDING GAME<br/>
              <span className="text-white text-lg md:text-2xl">{groom} X {bride}</span>
          </h1>

          <div className="mt-8 border-4 border-white p-1">
              <div className="border-4 border-black bg-[#22C55E] text-black px-6 py-4 cursor-pointer hover:bg-[#86EFAC]" onClick={startGame}>
                  <p className="font-pixel-head text-sm md:text-lg animate-blink">▶ PRESS START</p>
              </div>
          </div>

          <div className="absolute bottom-10 text-center font-pixel-body text-gray-500">
              <p>PLAYER: {guestName || "GUEST"}</p>
              <p>© 2026 KONAMI CODE</p>
          </div>
      </div>

      {/* --- MAIN GAME CONTENT --- */}
      <div className={`max-w-2xl mx-auto p-4 pb-24 transition-opacity duration-1000 ${gameStarted ? 'opacity-100' : 'opacity-0'}`}>

        {/* 1. HUD / HEADER */}
        <header className="mb-10 text-center border-b-4 border-white pb-6 pt-4">
            <div className="flex justify-between items-center text-[#22C55E] font-pixel-head text-[10px] md:text-xs mb-4">
                <span>SCORE: 99999</span>
                <span>WORLD: 1-1</span>
                <span>TIME: ∞</span>
            </div>
            <h1 className="font-pixel-head text-xl md:text-3xl text-[#FACC15] mb-2 leading-loose">
                LEVEL: WEDDING
            </h1>
            <p className="font-pixel-body text-xl text-gray-300">MISSION: CELEBRATE LOVE</p>
        </header>

        {/* 2. CHARACTER SELECT (COUPLE) */}
        <section className="mb-12 animate-enter">
            <div className="bg-[#1E293B] border-4 border-white p-1 mb-2">
               <h2 className="bg-[#EF4444] text-white font-pixel-head text-xs p-2 text-center">CHOOSE CHARACTER</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mt-6">
                {/* Player 1 */}
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-700 mb-4 border-4 border-white relative pixel-box">
                        <img src={photos.groom} className="w-full h-full object-cover pixelated grayscale hover:grayscale-0 transition" />
                        <div className="absolute -top-3 -right-3 bg-[#FACC15] text-black text-[10px] px-1 font-pixel-head">P1</div>
                    </div>
                    <div className="bg-black border-2 border-white p-3 w-full text-center">
                        <h3 className="font-pixel-head text-[#22C55E] text-sm mb-2">{groom}</h3>
                        <div className="text-left font-pixel-body text-gray-300 text-sm space-y-1">
                            <p>CLASS: GROOM</p>
                            <p>HP: ██████</p>
                            <p>STR: ████░░</p>
                            <p className="text-[10px] text-gray-500 mt-1">SON OF: {data?.groom_parents}</p>
                        </div>
                    </div>
                </div>

                {/* Player 2 */}
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-700 mb-4 border-4 border-white relative pixel-box">
                        <img src={photos.bride} className="w-full h-full object-cover pixelated grayscale hover:grayscale-0 transition" />
                        <div className="absolute -top-3 -right-3 bg-[#EF4444] text-white text-[10px] px-1 font-pixel-head">P2</div>
                    </div>
                    <div className="bg-black border-2 border-white p-3 w-full text-center">
                        <h3 className="font-pixel-head text-[#EF4444] text-sm mb-2">{bride}</h3>
                        <div className="text-left font-pixel-body text-gray-300 text-sm space-y-1">
                            <p>CLASS: BRIDE</p>
                            <p>HP: ██████</p>
                            <p>INT: █████░</p>
                            <p className="text-[10px] text-gray-500 mt-1">DAUGHTER OF: {data?.bride_parents}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 3. COUNTDOWN (BOSS BATTLE) */}
        <section className="mb-12 text-center animate-enter" style={{animationDelay: '0.2s'}}>
            <div className="bg-black border-4 border-[#FACC15] p-6 pixel-box relative">
                <p className="font-pixel-head text-[#FACC15] text-xs mb-4 animate-blink">⚠ FINAL BOSS APPROACHING ⚠</p>
                <div className="grid grid-cols-4 gap-2 text-white">
                    <TimeBit val={timeLeft.days} label="DAYS" />
                    <TimeBit val={timeLeft.hours} label="HRS" />
                    <TimeBit val={timeLeft.minutes} label="MIN" />
                    <TimeBit val={timeLeft.seconds} label="SEC" />
                </div>
            </div>
        </section>

        {/* 4. MISSION DETAILS (EVENT) */}
        <section className="mb-12 animate-enter" style={{animationDelay: '0.4s'}}>
            <h2 className="font-pixel-head text-white text-center mb-6 text-sm flex items-center justify-center gap-2">
                <MapPin size={16}/> MISSION BRIEFING
            </h2>

            <div className="space-y-6">
                {/* Akad Box */}
                <div className="bg-[#1E293B] p-4 border-l-8 border-[#22C55E] relative">
                    <div className="font-pixel-head text-xs text-[#22C55E] mb-2">STAGE 1: AKAD NIKAH</div>
                    <div className="font-pixel-body text-xl">
                        <p>DATE: {formattedDate}</p>
                        <p>TIME: {data?.akad_time}</p>
                        <p className="text-gray-400 mt-2">LOC: {data?.venue_name}</p>
                    </div>
                </div>

                {/* Resepsi Box */}
                <div className="bg-[#1E293B] p-4 border-l-8 border-[#EF4444] relative">
                    <div className="font-pixel-head text-xs text-[#EF4444] mb-2">STAGE 2: RECEPTION</div>
                    <div className="font-pixel-body text-xl">
                        <p>DATE: {formattedDate}</p>
                        <p>TIME: {data?.resepsi_time}</p>
                        <p className="text-gray-400 mt-2">LOC: {data?.venue_address}</p>
                    </div>
                    
                    <a href={data?.maps_link} target="_blank" className="mt-4 block bg-white text-black font-pixel-head text-xs text-center py-3 border-b-4 border-gray-400 active:border-b-0 active:translate-y-1 hover:bg-gray-200 transition">
                        OPEN MAP SYSTEM
                    </a>
                </div>
            </div>
        </section>

        {/* 5. GALLERY (INVENTORY) */}
        {gallery.length > 0 && (
          <section className="mb-12 animate-enter" style={{animationDelay: '0.6s'}}>
              <h2 className="font-pixel-head text-white text-center mb-6 text-sm flex items-center justify-center gap-2">
                  <ImageIcon size={16}/> UNLOCKED MEMORIES
              </h2>
              <div className="grid grid-cols-2 gap-4">
                  {gallery.map((url, i) => (
                      <div key={i} className="border-4 border-white p-1 bg-black hover:scale-105 transition-transform">
                          <img src={url} className="w-full h-32 object-cover pixelated filter contrast-125" />
                      </div>
                  ))}
              </div>
          </section>
        )}

        {/* 6. GIFT (LOOT BOX) */}
        <section className="mb-12 text-center animate-enter" style={{animationDelay: '0.8s'}}>
            <div className="border-4 border-dashed border-[#FACC15] p-6 bg-[#0F172A] relative">
                <Trophy size={32} className="text-[#FACC15] mx-auto mb-4 animate-bounce" />
                <h2 className="font-pixel-head text-[#FACC15] text-sm mb-4">LOOT CHEST (GIFT)</h2>
                
                <div className="space-y-4">
                    {banks.map((bank, i) => (
                        <div key={i} className="bg-black p-4 border-2 border-white">
                            <p className="font-pixel-head text-xs text-[#22C55E] mb-2">{bank.bank}</p>
                            <p className="font-pixel-body text-2xl tracking-widest mb-2">{bank.number}</p>
                            <p className="font-pixel-body text-gray-400 text-sm">PLAYER: {bank.name}</p>
                            <button 
                                onClick={() => copyText(bank.number)}
                                className="mt-3 w-full bg-[#EF4444] text-white font-pixel-head text-[10px] py-2 hover:bg-red-600 pixel-btn"
                            >
                                COPY COINS ID
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* 7. FOOTER */}
        <footer className="text-center border-t-4 border-white pt-8 opacity-60">
            <p className="font-pixel-head text-xs text-[#22C55E] mb-2">GAME OVER</p>
            <p className="font-pixel-body text-sm">THANK YOU FOR PLAYING!</p>
            <p className="font-pixel-body text-xs mt-4 animate-pulse">INSERT COIN TO CONTINUE...</p>
        </footer>

      </div>

      {/* FLOATING CONTROLS */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
          {/* Back to Top */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 bg-white border-4 border-black shadow-[4px_4px_0_black] flex items-center justify-center hover:bg-gray-200 active:translate-y-1 active:shadow-none transition-all"
          >
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-black"></div>
          </button>

          {/* Audio Toggle */}
          <button 
            onClick={toggleAudio}
            className="w-12 h-12 bg-[#FACC15] border-4 border-black shadow-[4px_4px_0_black] flex items-center justify-center hover:bg-yellow-300 active:translate-y-1 active:shadow-none transition-all"
          >
             {isPlaying ? <Pause size={20} className="text-black fill-black"/> : <Play size={20} className="text-black fill-black"/>}
          </button>
      </div>

      {/* AUDIO & SFX */}
      <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3"} loop />
      <audio ref={sfxRef} src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c153e2.mp3" /> 
    </div>
  );
}

// SUB COMPONENT
function TimeBit({ val, label }) {
    return (
        <div>
            <div className="bg-[#1E293B] border-2 border-white p-2 mb-1">
                <span className="font-pixel-head text-sm md:text-xl">{String(val).padStart(2, '0')}</span>
            </div>
            <span className="font-pixel-head text-[8px] text-gray-400">{label}</span>
        </div>
    )
}