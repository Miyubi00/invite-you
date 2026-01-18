import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, MapPin, Calendar, Clock, 
  MessageSquare, Gift, ChevronRight, ChevronLeft, 
  CheckCircle2, Heart, Send, BookOpen
} from 'lucide-react';

// --- 1. SUB-COMPONENTS (DEFINISIKAN DI LUAR) ---

const BinderRings = () => (
  <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 z-50 flex flex-col justify-evenly items-center py-10 pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="relative w-full h-8 flex items-center justify-center">
         {/* Hole */}
         <div className="w-4 h-4 bg-[#2C2C2C] rounded-full absolute right-2 shadow-inner"></div>
         {/* Ring */}
         <div className="w-14 h-4 bg-gradient-to-b from-gray-300 via-white to-gray-400 rounded-full border border-gray-400 shadow-md absolute -left-4"></div>
      </div>
    ))}
  </div>
);

const PageCover = ({ groom, bride, date, guestName, onNext }) => (
  <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-[#8D6E63] text-[#FDFBF7] relative overflow-hidden select-none">
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: `url("https://www.transparenttextures.com/patterns/leather.png")`}}></div>
      <div className="relative z-10 border-4 border-[#FDFBF7] p-8 md:p-12 max-w-lg mx-auto pointer-events-none"> {/* pointer-events-none pada konten agar swipe lancar */}
          <p className="font-hand text-xl tracking-widest mb-4">THE WEDDING OF</p>
          <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight">{groom} <br/> <span className="font-hand text-4xl">&</span> <br/> {bride}</h1>
          <div className="w-full h-px bg-[#FDFBF7] my-6"></div>
          <p className="font-serif text-lg tracking-widest">{new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <div className="mt-12">
             <p className="text-xs uppercase tracking-widest opacity-80 mb-2">Special Invitation For:</p>
             <div className="bg-[#FDFBF7] text-[#5D4037] px-6 py-2 font-bold font-hand text-xl transform -rotate-2 shadow-lg inline-block">
                {guestName}
             </div>
          </div>
      </div>
      {/* Tombol interaktif harus pointer-events-auto */}
      <button onClick={onNext} className="mt-12 animate-bounce bg-[#FDFBF7] text-[#5D4037] px-8 py-3 rounded-full font-bold shadow-lg hover:bg-white transition flex items-center gap-2 mx-auto relative z-20 pointer-events-auto cursor-pointer">
         <BookOpen size={20}/> OPEN BOOK
      </button>
  </div>
);

const PageIndex = ({ onJump }) => (
  <div className="h-full p-8 md:p-12 flex flex-col justify-center bg-[#FFF8E1] select-none">
      <h2 className="font-serif text-4xl text-[#5D4037] mb-8 border-b-2 border-[#5D4037] pb-2 inline-block w-full">Table of Contents</h2>
      <ul className="space-y-4 font-hand text-xl text-[#3E2723]">
          {[
            { id: 2, label: '01. The Couple' },
            { id: 3, label: '02. Event Details' },
            { id: 4, label: '03. Location Map' },
            { id: 5, label: '04. Countdown' },
            { id: 6, label: '05. RSVP & Wishes' },
            { id: 7, label: '06. Gift' },
            { id: 8, label: '07. Gallery' },
          ].map(item => (
              <li key={item.id} onClick={() => onJump(item.id)} className="cursor-pointer hover:text-[#8D6E63] hover:translate-x-2 transition flex justify-between border-b border-dashed border-gray-300 pb-2">
                  <span>{item.label}</span>
                  <span>Pg. {item.id}</span>
              </li>
          ))}
      </ul>
      <p className="mt-auto text-center text-sm text-gray-400 italic">Swipe or Drag to turn pages</p>
  </div>
);

const PageCouple = ({ data, groom, bride }) => (
  <div className="h-full p-6 md:p-12 overflow-y-auto no-scrollbar bg-[#F5F5DC] select-none">
     <div className="text-center mb-8">
        <h2 className="font-hand text-3xl text-[#5D4037] bg-[#FFCCBC] inline-block px-4 py-1 transform -rotate-1 shadow-sm">The Happy Couple</h2>
     </div>
     <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-3 shadow-md transform rotate-1 transition hover:rotate-0 hover:z-10 hover:scale-105 duration-300 relative pointer-events-none md:pointer-events-auto">
           <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-[#E0E0E0] opacity-50 rotate-1"></div>
           <div className="aspect-[3/4] bg-gray-200 overflow-hidden mb-3">
              <img src={data?.groom_photo} className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-500" alt="Groom"/>
           </div>
           <h3 className="font-serif text-2xl text-center text-[#3E2723]">{groom}</h3>
           <p className="font-hand text-center text-gray-500 text-sm">Son of {data?.groom_parents}</p>
        </div>
        <div className="bg-white p-3 shadow-md transform -rotate-1 transition hover:rotate-0 hover:z-10 hover:scale-105 duration-300 relative pointer-events-none md:pointer-events-auto">
           <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-[#E0E0E0] opacity-50 -rotate-1"></div>
           <div className="aspect-[3/4] bg-gray-200 overflow-hidden mb-3">
              <img src={data?.bride_photo} className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-500" alt="Bride"/>
           </div>
           <h3 className="font-serif text-2xl text-center text-[#3E2723]">{bride}</h3>
           <p className="font-hand text-center text-gray-500 text-sm">Daughter of {data?.bride_parents}</p>
        </div>
     </div>
  </div>
);

const PageEvent = ({ data }) => (
  <div className="h-full p-8 md:p-12 bg-[#FFFDE7] select-none" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/notebook.png')"}}>
     <h2 className="font-serif text-4xl text-[#5D4037] mb-8 text-center underline decoration-wavy decoration-[#8D6E63]">Event Schedule</h2>
     <div className="space-y-8 font-hand text-[#3E2723]">
        <div className="flex gap-4 items-start">
           <div className="bg-[#8D6E63] text-white p-3 rounded-full shadow-md"><Clock size={24}/></div>
           <div className="flex-1 border-l-2 border-[#8D6E63] pl-4">
              <h3 className="text-2xl font-bold">Akad Nikah</h3>
              <p className="text-lg">{data?.akad_time}</p>
              <p className="text-sm opacity-70">Momen sakral janji suci.</p>
           </div>
        </div>
        <div className="flex gap-4 items-start">
           <div className="bg-[#5D4037] text-white p-3 rounded-full shadow-md"><Calendar size={24}/></div>
           <div className="flex-1 border-l-2 border-[#5D4037] pl-4">
              <h3 className="text-2xl font-bold">Resepsi</h3>
              <p className="text-lg">{data?.resepsi_time}</p>
              <p className="text-sm opacity-70">Ramah tamah & perayaan.</p>
           </div>
        </div>
     </div>
     {data?.quote && (
        <div className="mt-12 p-6 bg-[#FFF8E1] border border-dashed border-[#8D6E63] relative transform rotate-1">
           <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#8D6E63] opacity-30"></div>
           <p className="font-serif italic text-center">"{data.quote}"</p>
           <p className="text-center text-xs font-bold mt-2">— {data.quote_src}</p>
        </div>
     )}
  </div>
);

const PageLocation = ({ data }) => (
  <div className="h-full p-8 md:p-12 flex flex-col items-center justify-center bg-[#F5F5DC] select-none">
      <div className="bg-white p-2 shadow-lg border border-gray-200 transform -rotate-1 w-full max-w-md">
          <div className="w-full h-64 bg-[#E0F7FA] relative overflow-hidden border border-gray-300 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#8D6E63 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
              <MapPin size={48} className="text-[#D32F2F] animate-bounce drop-shadow-md"/>
          </div>
          <div className="p-4 text-center">
              <h3 className="font-serif text-2xl text-[#3E2723] mb-1">{data?.venue_name}</h3>
              <p className="font-hand text-sm text-gray-600 mb-4">{data?.venue_address}</p>
              <a href={data?.maps_link} target="_blank" rel="noreferrer" className="inline-block bg-[#5D4037] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-[#3E2723] transition shadow-md cursor-pointer pointer-events-auto relative z-20">
                  Open Google Maps
              </a>
          </div>
      </div>
  </div>
);

const PageCountdown = ({ timeLeft }) => (
  <div className="h-full flex flex-col justify-center items-center bg-[#FFF3E0] relative select-none">
      <h2 className="font-hand text-3xl text-[#E65100] mb-8 transform -rotate-2">Counting Down...</h2>
      <div className="grid grid-cols-2 gap-6">
          {['Days', 'Hours', 'Minutes', 'Seconds'].map((label, i) => {
              const val = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds][i];
              const colors = ['bg-[#FFCCBC]', 'bg-[#FFF9C4]', 'bg-[#C8E6C9]', 'bg-[#B3E5FC]'];
              const rotate = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3'];
              return (
                  <div key={label} className={`${colors[i]} w-32 h-32 shadow-lg flex flex-col items-center justify-center transform ${rotate[i]} transition hover:scale-110 duration-300`}>
                      <div className="w-24 h-4 bg-black/10 absolute -top-2 left-4"></div>
                      <span className="font-serif text-4xl font-bold text-[#3E2723]">{val}</span>
                      <span className="font-hand text-sm text-[#5D4037]">{label}</span>
                  </div>
              )
          })}
      </div>
  </div>
);

const PageRsvp = ({ data, submittedData, onRsvpSubmit }) => {
  const [formData, setFormData] = useState({ status: 'hadir', pax: 1, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stop propagation agar form bisa diklik tanpa trigger swipe
  const stopProp = (e) => e.stopPropagation();

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      await onRsvpSubmit(formData);
      setIsSubmitting(false);
  };

  return (
      <div className="h-full p-6 md:p-10 overflow-y-auto no-scrollbar bg-white" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/lined-paper.png')"}}>
          <h2 className="font-hand text-3xl text-[#3E2723] mb-6 text-center select-none">Guest Book</h2>
          
          {/* Container Form Interaktif */}
          <div 
            className="mb-8 border-2 border-dashed border-[#8D6E63] p-4 rounded-lg bg-[#FFECB3]/20 cursor-auto"
            onMouseDown={stopProp} // Penting: Biar bisa klik form di desktop
            onTouchStart={stopProp} // Penting: Biar bisa klik form di mobile
          >
              {submittedData ? (
                  <div className="text-center py-4">
                      <CheckCircle2 size={32} className="mx-auto text-green-600 mb-2"/>
                      <p className="font-bold font-hand text-lg">Thanks for signing!</p>
                      <div className="mt-2 text-left bg-white p-3 shadow-sm transform rotate-1">
                          <p className="font-bold text-xs uppercase text-gray-400">Your Note:</p>
                          <p className="font-hand text-gray-700">"{submittedData.message}"</p>
                          {submittedData.reply && (
                              <div className="mt-2 pl-4 flex gap-2 relative">
                                  <div className="absolute top-[-8px] left-2 w-4 h-6 border-l-2 border-b-2 border-gray-300 rounded-bl-xl"></div>
                                  <div className="mt-1 w-full bg-gray-50 p-2 rounded-r-lg rounded-bl-lg border-l-2 border-[#8D6E63]">
                                      <p className="text-[10px] font-bold text-[#8D6E63]">Admin Reply</p>
                                      <p className="text-sm font-hand italic text-gray-600">"{submittedData.reply}"</p>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              ) : (
                  <form onSubmit={handleSubmit} className="space-y-3 font-hand">
                      <div className="flex gap-2">
                          {['hadir', 'ragu', 'tidak_hadir'].map(s => (
                              <button key={s} type="button" onClick={() => setFormData({...formData, status: s})} className={`flex-1 py-1 border-b-2 ${formData.status === s ? 'border-[#3E2723] font-bold' : 'border-transparent opacity-50'}`}>
                                  {s === 'hadir' ? 'Will Come' : s === 'ragu' ? 'Maybe' : 'Sorry'}
                              </button>
                          ))}
                      </div>
                      {formData.status === 'hadir' && (
                          <select value={formData.pax} onChange={(e) => setFormData({...formData, pax: parseInt(e.target.value)})} className="w-full bg-transparent border-b border-gray-300 py-2 outline-none">
                              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Person</option>)}
                          </select>
                      )}
                      <textarea rows="2" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Write a note..." className="w-full bg-transparent border-b border-gray-300 py-2 outline-none resize-none"></textarea>
                      <button disabled={isSubmitting} className="w-full bg-[#5D4037] text-white py-2 rounded shadow-md font-sans text-sm font-bold hover:bg-[#3E2723] transition">
                          {isSubmitting ? 'Signing...' : 'Sign Guestbook'}
                      </button>
                  </form>
              )}
          </div>

          <div className="space-y-4 select-none">
              {data?.rsvps?.map((rsvp) => (
                  <div key={rsvp.id} className="relative pl-6 pb-2">
                      <div className="absolute left-0 top-1 w-3 h-3 bg-gray-300 rounded-full shadow-inner"></div>
                      <p className="font-hand font-bold text-[#3E2723] text-lg">{rsvp.guest_name}</p>
                      <p className="font-serif italic text-gray-600 text-sm">"{rsvp.message}"</p>
                      {rsvp.reply && (
                          <div className="mt-1 pl-2 flex gap-2 relative">
                              <div className="w-4 h-6 border-l-2 border-b-2 border-gray-300 rounded-bl-xl"></div>
                              <div className="flex-1 bg-[#FFF8E1] p-2 rounded-lg text-sm border border-[#FFE082]">
                                  <span className="font-bold text-[#FF6F00] text-xs block">Mempelai:</span>
                                  <span className="font-hand text-gray-700">"{rsvp.reply}"</span>
                              </div>
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>
  );
};

const PageGift = ({ data }) => {
  const stopProp = (e) => e.stopPropagation();
  return (
    <div className="h-full p-8 md:p-12 flex flex-col justify-center bg-[#EFEBE9] select-none">
        <div className="bg-white p-6 shadow-xl transform rotate-1 border border-gray-200">
            <div className="border-b-2 border-dashed border-gray-300 pb-4 mb-4 flex justify-between items-center">
                <h2 className="font-serif text-2xl font-bold text-[#3E2723]">INVOICE</h2>
                <Gift className="text-[#8D6E63]"/>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Wedding Gift Transfer</p>
            <div className="space-y-4">
                {data?.banks?.map((bank, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                        <div>
                            <p className="font-bold text-[#5D4037]">{bank.bank}</p>
                            <p className="font-mono text-sm">{bank.number}</p>
                            <p className="text-xs text-gray-500">{bank.name}</p>
                        </div>
                        <button 
                            onMouseDown={stopProp} // Biar tombol copy bisa diklik tanpa trigger swipe
                            onTouchStart={stopProp}
                            onClick={() => {navigator.clipboard.writeText(bank.number); alert('Copied!');}} 
                            className="text-xs font-bold text-[#8D6E63] hover:underline cursor-pointer"
                        >
                            COPY
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t-2 border-gray-800">
                <p className="font-hand text-center text-[#5D4037]">Thank you for your love!</p>
            </div>
        </div>
    </div>
  )
};

const PageGallery = ({ data }) => (
  <div className="h-full p-6 md:p-12 overflow-y-auto no-scrollbar bg-[#3E2723] select-none">
      <h2 className="font-serif text-3xl text-[#FDFBF7] text-center mb-8">Memories</h2>
      <div className="grid grid-cols-2 gap-4">
          {data?.gallery?.map((img, i) => (
              <div key={i} className={`bg-white p-2 pb-8 shadow-lg transform ${i%2===0 ? '-rotate-2' : 'rotate-2'} hover:rotate-0 hover:z-10 hover:scale-110 transition duration-300`}>
                  <div className="aspect-square bg-gray-200 overflow-hidden">
                      <img src={img} className="w-full h-full object-cover" alt="Gallery"/>
                  </div>
              </div>
          ))}
      </div>
  </div>
);

const PageClosing = ({ groom, bride, onBack }) => (
  <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-[#8D6E63] text-[#FDFBF7] select-none">
      <Heart size={48} className="mb-6 animate-pulse"/>
      <h2 className="font-hand text-4xl mb-4">Thank You</h2>
      <p className="font-serif max-w-md mx-auto leading-relaxed opacity-90">
          "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu."
      </p>
      <div className="mt-12 font-serif text-2xl font-bold">
          {groom} & {bride}
      </div>
      <button onClick={() => onBack(0)} className="mt-12 text-sm uppercase tracking-widest hover:underline opacity-70 cursor-pointer pointer-events-auto">
          Back to Cover
      </button>
  </div>
);

// --- MAIN COMPONENT ---

export default function BinderBookTheme({ 
  groom, 
  bride, 
  date, 
  guestName, 
  data, 
  onRsvpSubmit, 
  submittedData 
}) {
  const [page, setPage] = useState(0); 
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  
  // Refs for Swipe Logic (Touch + Mouse)
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const isDragging = useRef(false);

  const TOTAL_PAGES = 10; 

  // Audio Logic
  useEffect(() => {
    if (audioRef.current && data?.audio_url) {
        audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(() => setIsAudioPlaying(false));
    }
  }, [data?.audio_url]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play();
      setIsAudioPlaying(true);
    }
  };

  // Countdown Logic
  useEffect(() => {
    const targetDate = new Date(date);
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [date]);

  // Navigation Handlers
  const nextPage = () => {
    if (page < TOTAL_PAGES - 1) setPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (page > 0) setPage(prev => prev - 1);
  };

  const jumpToPage = (pageNum) => setPage(pageNum);

  // --- UNIVERSAL SWIPE LOGIC (TOUCH & MOUSE) ---
  const handleSwipeEnd = () => {
      if (!touchStart.current || !touchEnd.current) return;
      const distance = touchStart.current - touchEnd.current;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;
      
      if (isLeftSwipe) nextPage();
      if (isRightSwipe) prevPage();

      // Reset
      touchStart.current = null;
      touchEnd.current = null;
  };

  // Touch Handlers
  const onTouchStart = (e) => { touchEnd.current = null; touchStart.current = e.targetTouches[0].clientX; };
  const onTouchMove = (e) => { touchEnd.current = e.targetTouches[0].clientX; };
  
  // Mouse Handlers (Desktop Swipe)
  const onMouseDown = (e) => { isDragging.current = true; touchStart.current = e.clientX; };
  const onMouseMove = (e) => { if (!isDragging.current) return; touchEnd.current = e.clientX; };
  const onMouseUp = () => { if (isDragging.current) { handleSwipeEnd(); isDragging.current = false; } };
  const onMouseLeave = () => { if (isDragging.current) { isDragging.current = false; } };

  // Render Page Selection
  const renderPageContent = () => {
      switch(page) {
          case 0: return <PageCover groom={groom} bride={bride} date={date} guestName={guestName} onNext={nextPage} />;
          case 1: return <PageIndex onJump={jumpToPage} />;
          case 2: return <PageCouple data={data} groom={groom} bride={bride} />;
          case 3: return <PageEvent data={data} />;
          case 4: return <PageLocation data={data} />;
          case 5: return <PageCountdown timeLeft={timeLeft} />;
          case 6: return <PageRsvp data={data} submittedData={submittedData} onRsvpSubmit={onRsvpSubmit} />;
          case 7: return <PageGift data={data} />;
          case 8: return <PageGallery data={data} />;
          case 9: return <PageClosing groom={groom} bride={bride} onBack={jumpToPage} />;
          default: return null;
      }
  };

  return (
    <div className="min-h-screen bg-[#2C2C2C] flex items-center justify-center p-0 md:p-8 font-sans overflow-hidden">
        
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,700;1,400&family=Indie+Flower&display=swap');
            .font-serif { font-family: 'Crimson Text', serif; }
            .font-hand { font-family: 'Indie Flower', cursive; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            
            /* CSS agar teks tidak ter-block saat swipe desktop */
            .select-none { user-select: none; -webkit-user-select: none; }
        `}</style>

        {/* BINDER CONTAINER */}
        <div className="relative w-full max-w-4xl h-[100dvh] md:h-[85vh] bg-[#3E2723] rounded-none md:rounded-r-2xl md:rounded-l-lg shadow-2xl flex overflow-hidden perspective-[1500px]">
            
            {/* 1. LEFT BINDER SPINE */}
            <div className="w-12 md:w-16 bg-[#1a1a1a] h-full shadow-inner relative z-40 flex-shrink-0 border-r border-gray-700">
                <BinderRings />
            </div>

            {/* 2. PAGE CONTENT AREA (SWIPE ZONE) */}
            <div 
                className="flex-1 relative bg-[#FDFBF7] shadow-inner overflow-hidden cursor-grab active:cursor-grabbing"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={handleSwipeEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
            >
                {/* Current Page with Key for Re-render Animation */}
                <div key={page} className="w-full h-full absolute inset-0 origin-left animate-in fade-in slide-in-from-right duration-500">
                    {renderPageContent()}
                </div>

                {/* Page Number */}
                <div className="absolute bottom-4 right-6 text-xs text-gray-400 font-mono z-30 select-none">
                    Page {page + 1} of {TOTAL_PAGES}
                </div>
            </div>

            {/* 3. NAVIGATION BUTTONS (DESKTOP) */}
            <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 flex flex-col gap-4 hidden md:flex">
                <button 
                    onClick={nextPage} 
                    disabled={page === TOTAL_PAGES - 1}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full disabled:opacity-30 transition backdrop-blur-sm"
                >
                    <ChevronRight size={32}/>
                </button>
            </div>
            <div className="absolute top-1/2 -left-20 md:-left-24 transform -translate-y-1/2 flex flex-col gap-4 hidden md:flex">
                <button 
                    onClick={prevPage} 
                    disabled={page === 0}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full disabled:opacity-30 transition backdrop-blur-sm"
                >
                    <ChevronLeft size={32}/>
                </button>
            </div>

            {/* MUSIC TOGGLE */}
            <button 
                onClick={toggleAudio}
                className="absolute top-4 right-4 z-50 w-12 h-12 bg-[#FFCCBC] text-[#D84315] rounded-full flex items-center justify-center shadow-lg transform hover:rotate-12 transition border-2 border-white"
                title="Toggle Music"
            >
                {isAudioPlaying ? <Pause size={20}/> : <Play size={20}/>}
            </button>

        </div>

        <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3"} loop />
    </div>
  );
}