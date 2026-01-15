import { useState, useRef, useEffect } from 'react';
import { 
  Heart, Music, MapPin, Calendar, Clock, 
  Sparkles, Gift, Play, Pause, ChevronDown, CheckCircle2 
} from 'lucide-react';

export default function KoreanMinimalTheme({ groom, bride, date, guestName, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- DATA ---
  const defaultImages = {
    cover: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&auto=format&fit=crop", // Soft aesthetic
    man: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop",
    woman: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop",
  };

  const photos = {
    cover: data?.cover_photo || defaultImages.cover,
    groom: data?.groom_photo || defaultImages.man,
    bride: data?.bride_photo || defaultImages.woman,
  };

  const gallery = data?.gallery || [
    "https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=500&fit=crop",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&fit=crop",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&fit=crop"
  ];
  const banks = data?.banks || [];

  const dateObj = new Date(date || new Date());
  const formattedDate = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  
  // Logic untuk Kalender
  const dayOfMonth = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  // --- COUNTDOWN LOGIC ---
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

  // --- AUDIO & OPEN HANDLER ---
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
      }, 500);
  };

  return (
    // MAIN BG: Soft Beige Cream
    <div className="bg-[#FDFCF8] text-[#555] min-h-screen relative overflow-x-hidden selection:bg-[#EBE4F2] selection:text-[#555]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gamja+Flower&family=Gowun+Dodum&display=swap');
        
        .font-kr-hand { font-family: 'Gamja Flower', cursive; } /* Cute Hand */
        .font-kr-sans { font-family: 'Gowun Dodum', sans-serif; } /* Aesthetic Sans */
        
        /* Soft Sticker Effect */
        .sticker {
            filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.05));
            transition: transform 0.2s;
        }
        .sticker:hover { transform: scale(1.05) rotate(2deg); }

        /* Smooth Fade Up */
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-up { animation: fadeUp 1s ease-out forwards; }
        
        /* Floating Animation */
        @keyframes gentleFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        .animate-float-soft { animation: gentleFloat 4s ease-in-out infinite; }
      `}</style>

      {/* --- OPENING COVER (Clean Minimal Card) --- */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#FDFCF8] transition-transform duration-1000 ease-in-out ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
          <div className="relative w-full max-w-sm p-8 text-center">
              {/* Decorative Sticker */}
              <div className="absolute top-10 left-10 text-[#D1D5DB] animate-spin-slow">
                 <Sparkles size={24}/>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-[2rem] p-10 shadow-sm relative overflow-hidden">
                  <div className="w-full h-64 bg-[#EBE4F2] rounded-t-[1.5rem] rounded-b-[4rem] mb-8 overflow-hidden relative">
                      <img src={photos.cover} className="w-full h-full object-cover opacity-90" alt="Cover"/>
                  </div>
                  
                  <p className="font-kr-sans text-xs tracking-[0.2em] text-[#9CA3AF] mb-2 uppercase">Invitation</p>
                  <h1 className="font-kr-hand text-4xl text-[#4B5563] mb-4">{groom} <span className="text-[#C4B5FD]">&</span> {bride}</h1>
                  
                  <div className="my-6">
                      <p className="font-kr-sans text-[10px] text-[#9CA3AF] mb-1">DEAR</p>
                      <h3 className="font-kr-sans text-lg font-bold text-[#374151]">{guestName || "Guest"}</h3>
                  </div>

                  <button 
                      onClick={handleOpen}
                      className="w-full bg-[#EBE4F2] hover:bg-[#DDD6FE] text-[#6D28D9] font-kr-sans font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                      Open Invitation
                  </button>
              </div>
          </div>
      </div>

      {/* --- CONTENT WRAPPER --- */}
      <div className={`transition-opacity duration-1000 delay-300 max-w-md mx-auto bg-white min-h-screen shadow-2xl shadow-gray-50 border-x border-gray-50 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

        {/* 1. HERO (Playlist/Album Cover Style) */}
        <header className="p-6 pt-12 text-center relative">
            <div className="bg-[#EBE4F2]/30 p-8 rounded-[2.5rem] relative">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 shadow-sm">
                     <img src={photos.cover} className="w-full h-full object-cover" alt="Main"/>
                </div>
                
                <div className="flex justify-between items-end mb-2">
                    <div className="text-left">
                        <h1 className="font-kr-hand text-4xl text-[#374151]">{groom} & {bride}</h1>
                        <p className="font-kr-sans text-xs text-[#9CA3AF] mt-1 tracking-widest">WE ARE GETTING MARRIED</p>
                    </div>
                    <Heart className="text-[#FCA5A5] fill-[#FCA5A5] animate-bounce" size={24}/>
                </div>
                
                {/* Countdown Timer (Minimalist Pill Style) */}
                <div className="mt-6 bg-white/60 p-4 rounded-xl flex justify-between items-center gap-2 shadow-sm border border-white">
                    <CountdownItem val={timeLeft.days} label="Days" />
                    <div className="h-8 w-px bg-gray-200"></div>
                    <CountdownItem val={timeLeft.hours} label="Hours" />
                    <div className="h-8 w-px bg-gray-200"></div>
                    <CountdownItem val={timeLeft.minutes} label="Mins" />
                    <div className="h-8 w-px bg-gray-200"></div>
                    <CountdownItem val={timeLeft.seconds} label="Secs" />
                </div>

                {/* Fake Music Progress Bar */}
                <div className="mt-4 flex items-center gap-3 text-[#9CA3AF] text-[10px]">
                    <span>0:00</span>
                    <div className="flex-1 h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-[#C4B5FD]"></div>
                    </div>
                    <span>Forever</span>
                </div>
            </div>
            
            <div className="mt-8 flex justify-center animate-float-soft">
                <ChevronDown className="text-[#D1D5DB]" />
            </div>
        </header>

        {/* 2. QUOTE (Journal Note Style) */}
        <section className="px-6 py-10">
            <div className="bg-[#E1E8E5]/30 p-8 rounded-tr-[3rem] rounded-bl-[3rem] text-center relative">
                <div className="absolute -top-3 -left-2 w-8 h-8 bg-[#D1FAE5] rounded-full opacity-50"></div>
                <p className="font-kr-sans text-sm leading-loose text-gray-600">
                    "{data?.quote || "Every love story is beautiful, but ours is my favorite."}"
                </p>
                <div className="mt-4 w-10 h-1 bg-[#A7F3D0] mx-auto rounded-full"></div>
            </div>
        </section>

        {/* 3. CALENDAR (Simple Grid) */}
        <section className="px-6 py-8">
            <h2 className="font-kr-hand text-2xl mb-6 text-center text-[#374151]">Save The Date</h2>
            <div className="border border-[#E5E7EB] rounded-2xl p-6 text-center relative">
                <div className="flex justify-between items-end mb-6 border-b border-[#F3F4F6] pb-4">
                    <span className="font-kr-sans text-3xl font-bold text-[#374151]">{monthName}</span>
                    <span className="font-kr-sans text-sm text-[#9CA3AF]">2024</span>
                </div>
                
                {/* Visual Calendar Placeholder */}
                <div className="grid grid-cols-7 gap-2 text-xs font-kr-sans text-[#9CA3AF] mb-2">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-2 text-sm font-kr-sans text-[#4B5563]">
                    {/* Dummy days logic just for visual */}
                    <span className="opacity-30">29</span><span className="opacity-30">30</span>
                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                    <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span>
                    <span>12</span><span>13</span><span>14</span>
                    
                    {/* Selected Date Circle */}
                    <span className="relative z-10 font-bold text-white flex items-center justify-center">
                        <span className="absolute inset-0 bg-[#C4B5FD] rounded-full -z-10"></span>
                        {dayOfMonth}
                    </span>
                    
                    <span>16</span><span>17</span><span>18</span><span>19</span>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#4B5563]">
                   <Calendar size={16} className="text-[#C4B5FD]"/> 
                   <span>{formattedDate}</span>
                </div>
            </div>
        </section>

        {/* 4. COUPLE (Minimal Circles & Parents Data) */}
        <section className="px-6 py-10">
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12">
                
                {/* Groom */}
                <div className="text-center w-full">
                    <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border border-[#E5E7EB] p-1 mb-3">
                        <img src={photos.groom} className="w-full h-full object-cover rounded-full" alt="Groom"/>
                    </div>
                    <h3 className="font-kr-hand text-xl text-[#374151]">{groom}</h3>
                    <p className="text-[10px] text-[#9CA3AF] tracking-widest uppercase font-bold">The Groom</p>
                    {/* Parent Data */}
                    <div className="mt-2 text-xs text-[#6B7280] font-kr-sans leading-snug">
                        <p className="opacity-60 text-[10px]">Putra dari Pasangan</p>
                        <p>{data?.groom_parents}</p>
                    </div>
                </div>

                <span className="font-kr-hand text-xl text-[#D1D5DB]">&</span>

                {/* Bride */}
                <div className="text-center w-full">
                    <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border border-[#E5E7EB] p-1 mb-3">
                        <img src={photos.bride} className="w-full h-full object-cover rounded-full" alt="Bride"/>
                    </div>
                    <h3 className="font-kr-hand text-xl text-[#374151]">{bride}</h3>
                    <p className="text-[10px] text-[#9CA3AF] tracking-widest uppercase font-bold">The Bride</p>
                    {/* Parent Data */}
                    <div className="mt-2 text-xs text-[#6B7280] font-kr-sans leading-snug">
                        <p className="opacity-60 text-[10px]">Putri dari Pasangan</p>
                        <p>{data?.bride_parents}</p>
                    </div>
                </div>

            </div>
        </section>

        {/* 5. EVENT DETAILS (Cards) */}
        <section className="px-6 py-8 space-y-4">
             {/* Akad Card - Sage Green Accent */}
             <div className="bg-[#E1E8E5]/40 p-6 rounded-2xl flex items-start gap-4">
                 <div className="bg-white p-3 rounded-full text-[#10B981] shadow-sm">
                     <Heart size={18} fill="#10B981" className="opacity-50"/>
                 </div>
                 <div>
                     <h3 className="font-kr-sans font-bold text-[#374151] text-lg">Akad Nikah</h3>
                     <p className="font-kr-sans text-sm text-[#6B7280] mt-1 flex items-center gap-2">
                         <Clock size={14}/> {data?.akad_time}
                     </p>
                     <p className="font-kr-sans text-sm text-[#6B7280] mt-1 flex items-start gap-2">
                         <MapPin size={14} className="shrink-0 mt-0.5"/> {data?.venue_name}
                     </p>
                 </div>
             </div>

             {/* Resepsi Card - Lilac Accent */}
             <div className="bg-[#EBE4F2]/50 p-6 rounded-2xl flex items-start gap-4">
                 <div className="bg-white p-3 rounded-full text-[#8B5CF6] shadow-sm">
                     <Sparkles size={18} fill="#8B5CF6" className="opacity-50"/>
                 </div>
                 <div>
                     <h3 className="font-kr-sans font-bold text-[#374151] text-lg">Resepsi</h3>
                     <p className="font-kr-sans text-sm text-[#6B7280] mt-1 flex items-center gap-2">
                         <Clock size={14}/> {data?.resepsi_time}
                     </p>
                     <p className="font-kr-sans text-sm text-[#6B7280] mt-1 flex items-start gap-2">
                         <MapPin size={14} className="shrink-0 mt-0.5"/> {data?.venue_address}
                     </p>
                     <a href={data?.maps_link} target="_blank" className="inline-block mt-3 text-xs bg-white px-3 py-1.5 rounded-md border border-[#E5E7EB] text-[#4B5563]">
                         Google Maps
                     </a>
                 </div>
             </div>
        </section>

        {/* 6. GALLERY (Grid) */}
        {gallery.length > 0 && (
          <section className="px-6 py-10">
              <h2 className="font-kr-hand text-2xl mb-6 text-center text-[#374151]">Our Moments</h2>
              <div className="grid grid-cols-2 gap-3">
                  {gallery.map((url, i) => (
                      <div key={i} className={`rounded-xl overflow-hidden ${i === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'}`}>
                          <img src={url} className="w-full h-full object-cover hover:scale-105 transition duration-500" alt="Gallery"/>
                      </div>
                  ))}
              </div>
          </section>
        )}

        {/* 7. GIFT (Clean Box) */}
        <section className="px-6 py-10 bg-[#FAFAFA]">
            <div className="text-center">
                <Gift className="mx-auto text-[#D1D5DB] mb-4" size={28}/>
                <h2 className="font-kr-hand text-xl text-[#374151] mb-2">Send Love</h2>
                <p className="font-kr-sans text-xs text-[#9CA3AF] mb-6">Cashless gift transfer</p>
                
                <div className="space-y-3">
                    {banks.map((bank, i) => (
                        <div key={i} className="bg-white border border-[#E5E7EB] p-4 rounded-xl flex items-center justify-between">
                            <div className="text-left">
                                <span className="block font-bold text-xs text-[#374151]">{bank.bank}</span>
                                <span className="text-[10px] text-[#9CA3AF]">a.n {bank.name}</span>
                            </div>
                            <button 
                                onClick={() => navigator.clipboard.writeText(bank.number)}
                                className="flex items-center gap-2 text-xs bg-[#F3F4F6] px-3 py-2 rounded-lg text-[#4B5563]"
                            >
                                {bank.number} <CheckCircle2 size={12}/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 text-center bg-white border-t border-gray-50">
             <h2 className="font-kr-hand text-2xl text-[#374151]">{groom} & {bride}</h2>
             <p className="font-kr-sans text-[10px] text-[#D1D5DB] mt-2 tracking-[0.3em]">THANK YOU</p>
        </footer>

        {/* FLOATING MUSIC PLAYER (Mini Pill) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur border border-[#E5E7EB] px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full bg-[#10B981] ${isPlaying ? 'animate-pulse' : ''}`}></div>
             <span className="font-kr-sans text-xs text-[#4B5563] w-16 truncate">Wedding Song</span>
             <button onClick={toggleAudio} className="text-[#4B5563]">
                 {isPlaying ? <Pause size={14}/> : <Play size={14}/>}
             </button>
        </div>

        <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3"} loop />

      </div>
    </div>
  );
}

// --- HELPER COMPONENT (Countdown) ---
function CountdownItem({ val, label }) {
    return (
        <div className="flex flex-col items-center">
            <span className="font-kr-sans text-xl font-bold text-[#4B5563]">{String(val).padStart(2, '0')}</span>
            <span className="text-[8px] uppercase tracking-wider text-[#9CA3AF]">{label}</span>
        </div>
    )
}