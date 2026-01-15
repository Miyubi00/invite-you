import { useState, useRef, useEffect } from 'react';
import { 
  Heart, Music, Gift, MapPin, Calendar, Clock, 
  Smile, Cloud, Star, Copy, Play, Pause, Sun
} from 'lucide-react';

export default function PlayfulPastelTheme({ groom, bride, date, guestName, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- DATA ---
  const defaultImages = {
    // Menggunakan gambar yang cerah/fun
    cover: "https://images.unsplash.com/photo-1596919248744-2453479b1509?w=800&auto=format&fit=crop", 
    man: "https://images.unsplash.com/photo-1542596594-649edbc13630?w=400&auto=format&fit=crop",
    woman: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop",
  };

  const photos = {
    cover: data?.cover_photo || defaultImages.cover,
    groom: data?.groom_photo || defaultImages.man,
    bride: data?.bride_photo || defaultImages.woman,
  };

  const gallery = data?.gallery || [
     "https://images.unsplash.com/photo-1516054575922-f0b8ee4becf1?w=500&fit=crop",
     "https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=500&fit=crop",
     "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&fit=crop",
     "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&fit=crop"
  ];
  const banks = data?.banks || [];

  const formattedDate = new Date(date || new Date()).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

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
    // CONTAINER: Warna dasar Butter Yellow yang lembut
    <div className="bg-[#FFFBEB] text-[#4B5563] min-h-screen relative overflow-x-hidden font-sans selection:bg-[#FDBA74] selection:text-white">

      {/* --- STYLES & FONTS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;600&family=Patrick+Hand&display=swap');
        
        .font-blob { font-family: 'Fredoka', sans-serif; }
        .font-hand { font-family: 'Patrick Hand', cursive; }
        
        /* Pattern Background (Polkadot) */
        .bg-polka {
            background-image: radial-gradient(#FDBA74 2px, transparent 2px);
            background-size: 30px 30px;
        }

        /* Animations */
        @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
        }
        .animate-wiggle { animation: wiggle 2s ease-in-out infinite; }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }

        @keyframes pop {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop { animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

        /* Custom Shapes */
        .blob-shape { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        .blob-shape-2 { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
      `}</style>

      {/* --- FLOATING ELEMENTS (Clouds & Stars) --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <Cloud className="absolute top-10 left-10 text-blue-200 w-16 h-16 animate-float opacity-80" fill="#BFDBFE"/>
          <Cloud className="absolute top-40 right-10 text-blue-200 w-24 h-24 animate-float opacity-60" style={{animationDelay: '1s'}} fill="#BFDBFE"/>
          <Sun className="absolute top-5 right-5 text-yellow-400 w-12 h-12 animate-spin-slow" />
          <div className="absolute top-1/2 left-10 text-pink-300 animate-wiggle"><Heart fill="#F9A8D4" size={24}/></div>
          <div className="absolute bottom-20 right-20 text-purple-300 animate-bounce"><Star fill="#D8B4FE" size={30}/></div>
      </div>

      {/* --- OPENING MODAL (POP UP CARD) --- */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#818CF8] transition-transform duration-700 ease-in-out ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-polka opacity-20"></div>

          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[10px_10px_0px_rgba(0,0,0,0.1)] text-center relative max-w-sm w-full mx-4 border-4 border-[#C7D2FE] animate-pop">
              
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#FDBA74] rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce">
                  <Gift className="text-white w-10 h-10" />
              </div>

              <div className="mt-8">
                  <p className="font-hand text-xl text-[#F472B6] mb-2 font-bold transform -rotate-2">Hola! You're Invited!</p>
                  <h1 className="font-blob text-4xl text-[#4F46E5] leading-tight mb-6">
                      {groom} <br/> <span className="text-2xl text-[#FDBA74]">&</span> <br/> {bride}
                  </h1>
                  
                  <div className="bg-[#FEF3C7] p-4 rounded-2xl mb-8 transform rotate-1 border-2 border-dashed border-[#FCD34D]">
                      <p className="font-hand text-gray-500 mb-1">To our favorite person:</p>
                      <h3 className="font-blob text-xl text-[#D97706] truncate">{guestName || "Teman Baik"}</h3>
                  </div>

                  <button 
                      onClick={handleOpen}
                      className="w-full bg-[#F472B6] hover:bg-[#EC4899] text-white font-blob py-4 rounded-xl shadow-[0_6px_0_#BE185D] active:shadow-none active:translate-y-[6px] transition-all text-lg flex items-center justify-center gap-2"
                  >
                      <Smile size={24}/> Buka Undangan
                  </button>
              </div>
          </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className={`transition-opacity duration-1000 delay-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

        {/* 1. HERO SECTION (Wavy & Cute) */}
        <header className="pt-20 pb-32 px-6 text-center relative bg-white rounded-b-[4rem] shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#F472B6] via-[#FDBA74] to-[#818CF8]"></div>
            
            <div className="max-w-xl mx-auto relative z-10">
                <div className="inline-block bg-[#DEF7EC] text-[#059669] px-4 py-2 rounded-full font-blob text-sm mb-6 border-2 border-[#A7F3D0] transform -rotate-2">
                    ✨ We are getting married! ✨
                </div>
                
                <div className="flex justify-center items-center -space-x-4 mb-6">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#C7D2FE]">
                        <img src={photos.groom} className="w-full h-full object-cover" alt="Groom"/>
                    </div>
                    <div className="z-10 bg-white p-2 rounded-full shadow border-2 border-pink-100">
                        <Heart className="text-[#F472B6] fill-[#F472B6] w-8 h-8 animate-wiggle"/>
                    </div>
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#FBCFE8]">
                        <img src={photos.bride} className="w-full h-full object-cover" alt="Bride"/>
                    </div>
                </div>

                <h1 className="font-blob text-5xl md:text-7xl text-[#4B5563] mb-4">
                    {groom} <span className="text-[#F472B6]">&</span> {bride}
                </h1>
                
                <p className="font-hand text-xl text-gray-500 mb-8">{formattedDate}</p>

                {/* COUNTDOWN BUBBLES */}
                <div className="flex justify-center gap-3 md:gap-6">
                    <TimeBubble val={timeLeft.days} label="Hari" color="bg-[#FCA5A5]" />
                    <TimeBubble val={timeLeft.hours} label="Jam" color="bg-[#FDBA74]" />
                    <TimeBubble val={timeLeft.minutes} label="Menit" color="bg-[#86EFAC]" />
                    <TimeBubble val={timeLeft.seconds} label="Detik" color="bg-[#93C5FD]" />
                </div>
            </div>
        </header>

        {/* 2. LOVE STORY (Scrapbook Style) */}
        <section className="py-20 px-6 max-w-3xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="font-blob text-3xl text-[#818CF8] inline-block relative">
                    Our Love Story
                    <span className="absolute -bottom-2 left-0 w-full h-3 bg-[#FDE047] -z-10 opacity-50 rounded-full"></span>
                </h2>
                <p className="font-hand text-lg mt-4 text-gray-600">"{data?.quote || "From hello to I do, it's been a fun ride!"}"</p>
            </div>

            {/* Couple Profile Cards */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Groom Card */}
                <div className="bg-[#E0E7FF] p-6 rounded-[2rem] relative transform hover:scale-105 transition duration-300">
                    <div className="absolute -top-4 -left-4 bg-white px-3 py-1 rounded-lg border-2 border-[#E0E7FF] font-blob text-[#4338CA] text-xs shadow-sm">THE GROOM</div>
                    <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-[#C7D2FE] overflow-hidden mb-4">
                        <img src={photos.groom} className="w-full h-full object-cover" alt="Groom"/>
                    </div>
                    <h3 className="text-center font-blob text-2xl text-[#4338CA]">{groom}</h3>
                    <p className="text-center font-hand text-gray-500 mt-2">{data?.groom_parents}</p>
                    <div className="mt-4 flex justify-center">
                        <div className="bg-white p-2 rounded-full text-[#4338CA]"><Smile/></div>
                    </div>
                </div>

                {/* Bride Card */}
                <div className="bg-[#FCE7F3] p-6 rounded-[2rem] relative transform hover:scale-105 transition duration-300 md:mt-8">
                    <div className="absolute -top-4 -right-4 bg-white px-3 py-1 rounded-lg border-2 border-[#FCE7F3] font-blob text-[#DB2777] text-xs shadow-sm">THE BRIDE</div>
                    <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-[#FBCFE8] overflow-hidden mb-4">
                        <img src={photos.bride} className="w-full h-full object-cover" alt="Bride"/>
                    </div>
                    <h3 className="text-center font-blob text-2xl text-[#DB2777]">{bride}</h3>
                    <p className="text-center font-hand text-gray-500 mt-2">{data?.bride_parents}</p>
                    <div className="mt-4 flex justify-center">
                        <div className="bg-white p-2 rounded-full text-[#DB2777]"><Heart size={20} fill="#DB2777"/></div>
                    </div>
                </div>
            </div>
        </section>

        {/* 3. EVENTS (Tickets) */}
        <section className="py-20 px-4 bg-[#F0FDF4] relative overflow-hidden">
            {/* Background Doodles */}
            <div className="absolute top-0 left-0 w-full h-full bg-polka opacity-10"></div>
            
            <h2 className="font-blob text-4xl text-center text-[#15803D] mb-12 relative z-10">Save The Date! 📅</h2>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 relative z-10">
                {/* Akad Ticket */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col border-2 border-[#BBF7D0] relative group">
                    <div className="bg-[#BBF7D0] p-4 text-center border-b-2 border-dashed border-white">
                        <h3 className="font-blob text-xl text-[#166534]">Akad Nikah</h3>
                    </div>
                    <div className="p-6 text-center space-y-3">
                         <div className="flex items-center justify-center gap-2 text-[#15803D] font-bold bg-[#DCFCE7] py-2 rounded-lg">
                             <Clock size={18}/> {data?.akad_time}
                         </div>
                         <p className="font-hand text-lg">{data?.venue_name}</p>
                         <div className="w-full border-t-2 border-dashed border-gray-100 my-4"></div>
                         <MapPin className="mx-auto text-[#15803D] mb-2"/>
                         <p className="text-sm text-gray-500">{data?.venue_address}</p>
                    </div>
                    {/* Holes for ticket effect */}
                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#F0FDF4] rounded-full"></div>
                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#F0FDF4] rounded-full"></div>
                </div>

                {/* Resepsi Ticket */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col border-2 border-[#FBCFE8] relative group mt-4 md:mt-0">
                    <div className="bg-[#FBCFE8] p-4 text-center border-b-2 border-dashed border-white">
                        <h3 className="font-blob text-xl text-[#9D174D]">Resepsi Party</h3>
                    </div>
                    <div className="p-6 text-center space-y-3">
                         <div className="flex items-center justify-center gap-2 text-[#9D174D] font-bold bg-[#FCE7F3] py-2 rounded-lg">
                             <Clock size={18}/> {data?.resepsi_time}
                         </div>
                         <p className="font-hand text-lg">{data?.venue_name}</p>
                         <div className="w-full border-t-2 border-dashed border-gray-100 my-4"></div>
                         <MapPin className="mx-auto text-[#9D174D] mb-2"/>
                         <p className="text-sm text-gray-500">{data?.venue_address}</p>
                         
                         <a href={data?.maps_link} target="_blank" className="block mt-4 bg-[#9D174D] text-white py-2 rounded-lg font-blob text-sm hover:bg-[#831843] transition">
                             Google Maps 🚀
                         </a>
                    </div>
                    {/* Holes for ticket effect */}
                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#F0FDF4] rounded-full"></div>
                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#F0FDF4] rounded-full"></div>
                </div>
            </div>
        </section>

        {/* 4. GALLERY (Scattered Photos) */}
        {gallery.length > 0 && (
          <section className="py-24 px-4 bg-[#FFFBEB]">
             <div className="text-center mb-16">
                 <h2 className="font-blob text-4xl text-[#F59E0B]">Fun Moments 📸</h2>
             </div>
             
             <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-6">
                 {gallery.map((url, i) => {
                     // Random rotation for playful effect
                     const rotate = i % 2 === 0 ? 'rotate-2' : '-rotate-2';
                     const color = i % 2 === 0 ? 'bg-pink-100' : 'bg-blue-100';
                     return (
                         <div key={i} className={`relative p-3 bg-white shadow-xl rounded-xl ${rotate} hover:rotate-0 hover:scale-110 transition duration-300 w-40 md:w-60 h-auto`}>
                             {/* Tape Effect */}
                             <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#E5E7EB] opacity-60 transform -rotate-1"></div>
                             
                             <div className={`w-full aspect-square ${color} rounded-lg overflow-hidden mb-2`}>
                                 <img src={url} className="w-full h-full object-cover" alt="Moment"/>
                             </div>
                             <p className="text-center font-hand text-gray-400 text-sm">#HappyDay</p>
                         </div>
                     )
                 })}
             </div>
          </section>
        )}

        {/* 5. GIFT (Piggy Bank Style) */}
        <section className="py-20 px-6">
            <div className="max-w-md mx-auto bg-white rounded-[2.5rem] p-8 border-[3px] border-[#BFDBFE] shadow-[8px_8px_0px_#BFDBFE] text-center">
                <div className="inline-block bg-[#EFF6FF] p-4 rounded-full mb-6">
                    <Gift className="w-10 h-10 text-[#3B82F6] animate-wiggle"/>
                </div>
                <h2 className="font-blob text-3xl text-[#1E40AF] mb-4">Wedding Gift</h2>
                <p className="font-hand text-gray-500 mb-8">
                    Your presence is enough, but if you want to chip in for our future, we appreciate it! 💖
                </p>

                <div className="space-y-4">
                    {banks.map((bank, i) => (
                        <div key={i} className="bg-[#EFF6FF] p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                            <div className="text-left">
                                <span className="block font-blob text-[#1E40AF]">{bank.bank}</span>
                                <span className="text-xs text-gray-500">a.n {bank.name}</span>
                            </div>
                            <div className="flex items-center bg-white px-3 py-1 rounded-lg border border-blue-50">
                                <span className="font-mono text-[#3B82F6] font-bold mr-2">{bank.number}</span>
                                <button onClick={() => navigator.clipboard.writeText(bank.number)} className="text-gray-400 hover:text-blue-500">
                                    <Copy size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 text-center bg-[#FDBA74] relative mt-12">
            {/* Wavy Top */}
            <div className="absolute -top-10 left-0 w-full h-10 bg-[#FDBA74] rounded-t-[50%]"></div>
            
            <h2 className="font-blob text-3xl text-white mb-2">{groom} & {bride}</h2>
            <p className="font-hand text-white/80">Thank you for coming!</p>
            <div className="flex justify-center gap-2 mt-4 text-white">
                <Heart fill="white" size={16}/>
                <Heart fill="white" size={16}/>
                <Heart fill="white" size={16}/>
            </div>
        </footer>

      </div>

      {/* AUDIO FLOATING BUTTON (Bouncing Note) */}
      <button 
        onClick={toggleAudio}
        className="fixed bottom-6 right-6 z-40 bg-[#F472B6] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_4px_0_#BE185D] active:shadow-none active:translate-y-[4px] transition-all animate-bounce"
      >
        {isPlaying ? <Music size={24}/> : <Play size={24} className="ml-1"/>}
      </button>

      <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/05/17/audio_1615a96c4d.mp3"} loop />
    </div>
  );
}

// COMPONENT: BUBBLE COUNTDOWN
function TimeBubble({ val, label, color }) {
    return (
        <div className="flex flex-col items-center">
            <div className={`${color} w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-md border-2 border-white transform hover:scale-110 transition`}>
                <span className="font-blob text-xl md:text-2xl text-white drop-shadow-sm">{String(val).padStart(2,'0')}</span>
            </div>
            <span className="font-hand text-gray-400 text-sm mt-2">{label}</span>
        </div>
    )
}