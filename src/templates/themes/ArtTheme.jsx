import React, { useState, useEffect, useRef } from 'react';
import { 
  X, MapPin, Calendar, Clock, Heart,  
  MessageSquare, Gift, Play, Pause, ChevronRight, 
  CheckCircle2, Map, Send 
} from 'lucide-react';

// --- 1. SUB-COMPONENTS (DEFINISIKAN DI LUAR) ---

const AbstractCanvas = ({ type, groom, bride }) => {
  switch (type) {
    case 'cover':
      return (
        <div className="w-full h-full bg-[#E8DCC4] relative overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-[#8B4513]/10 blur-3xl animate-pulse"></div>
          <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-[#CD853F] rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute bottom-[10%] left-[20%] w-48 h-48 bg-[#DEB887] rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          {/* Kinetic Text Art */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
             <h1 className="font-serif text-4xl md:text-6xl text-[#3E2723] tracking-widest opacity-80 mix-blend-overlay writing-vertical-rl md:writing-horizontal-tb transform rotate-180 md:rotate-0">
                {groom?.split(' ')[0]} <br/> {bride?.split(' ')[0]}
             </h1>
          </div>
        </div>
      );
    case 'couple':
      return (
        <div className="w-full h-full bg-[#F5F5F5] relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1/2 h-full bg-[#D8BFD8] opacity-50 transform -skew-x-12"></div>
           <div className="absolute bottom-0 right-0 w-1/2 h-full bg-[#B0C4DE] opacity-50 transform -skew-x-12"></div>
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-[#708090] rounded-full opacity-30"></div>
              <div className="w-20 h-20 border-4 border-[#708090] rounded-full opacity-30 -ml-10"></div>
           </div>
        </div>
      );
    case 'event':
      return (
        <div className="w-full h-full bg-[#2F4F4F] relative overflow-hidden">
           {/* Abstract Clock/Calendar */}
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-[#DAA520] rounded-full opacity-40"></div>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-20 bg-[#DAA520] origin-bottom rotate-45 opacity-60"></div>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-0.5 bg-[#DAA520] origin-left -rotate-12 opacity-60"></div>
        </div>
      );
    case 'location':
      return (
        <div className="w-full h-full bg-[#FFF8DC] relative overflow-hidden">
           {/* Abstract Map Lines */}
           <svg className="absolute inset-0 w-full h-full opacity-30" stroke="#8B4513" strokeWidth="2">
              <path d="M0,50 Q50,0 100,50 T200,50 T300,50" fill="none" />
              <path d="M50,100 Q100,50 150,100 T250,100" fill="none" />
              <circle cx="150" cy="80" r="5" fill="#8B4513" />
           </svg>
        </div>
      );
    case 'gallery':
      return (
        <div className="w-full h-full bg-white relative overflow-hidden grid grid-cols-3 grid-rows-3 gap-1 p-4 opacity-50">
           {[...Array(9)].map((_,i) => (
              <div key={i} className={`bg-${['gray-300','gray-400','gray-200'][i%3]}`}></div>
           ))}
        </div>
      );
    case 'gift':
      return (
        <div className="w-full h-full bg-[#8FBC8F] relative flex items-center justify-center">
           <div className="w-24 h-24 border-4 border-white rotate-45 opacity-50"></div>
           <div className="absolute w-32 h-4 bg-white opacity-40"></div>
           <div className="absolute w-4 h-32 bg-white opacity-40"></div>
        </div>
      );
    case 'rsvp':
      return (
        <div className="w-full h-full bg-[#E6E6FA] relative overflow-hidden">
           <div className="absolute top-4 right-4 w-16 h-12 bg-white rounded-tr-xl rounded-bl-xl rounded-tl-xl opacity-60"></div>
           <div className="absolute bottom-10 left-10 w-20 h-16 bg-[#9370DB] rounded-tr-xl rounded-br-xl rounded-tl-xl opacity-40"></div>
        </div>
      );
    default: return <div className="bg-gray-200 w-full h-full"></div>;
  }
};

const RsvpContent = ({ onRsvpSubmit, submittedData, rsvps }) => {
  const [formData, setFormData] = useState({ status: 'hadir', pax: 1, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      await onRsvpSubmit(formData);
      setIsSubmitting(false);
  };

  return (
      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8 animate-in fade-in duration-500">
          {/* Form Side */}
          <div className="bg-[#F9F7F2] p-6 rounded-lg shadow-inner">
              <h3 className="font-serif text-2xl text-[#3E2723] mb-4 flex items-center gap-2"><MessageSquare size={20}/> RSVP</h3>
              
              {submittedData ? (
                  <div className="text-center py-10">
                      <CheckCircle2 size={48} className="mx-auto text-green-600 mb-4"/>
                      <p className="font-bold text-gray-800">Konfirmasi Terkirim</p>
                      <p className="text-sm text-gray-500 mt-2">Terima kasih atas ucapan dan doanya.</p>
                      <div className="mt-4 bg-white p-3 rounded text-left text-sm border border-gray-200">
                          <p className="font-bold text-xs text-gray-400 uppercase">Status</p>
                          <p className="mb-2">{submittedData.status === 'hadir' ? 'Hadir' : 'Tidak Hadir'}</p>
                          <p className="font-bold text-xs text-gray-400 uppercase">Pesan</p>
                          <p>"{submittedData.message}"</p>
                      </div>
                  </div>
              ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kehadiran</label>
                          <div className="flex gap-2">
                              {['hadir', 'ragu', 'tidak_hadir'].map(s => (
                                  <button 
                                      key={s} 
                                      type="button" 
                                      onClick={() => setFormData({...formData, status: s})}
                                      className={`flex-1 py-2 text-xs font-bold border ${formData.status === s ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'bg-white text-gray-500 border-gray-300'}`}
                                  >
                                      {s === 'hadir' ? 'Hadir' : s === 'ragu' ? 'Ragu' : 'Maaf'}
                                  </button>
                              ))}
                          </div>
                      </div>
                      {formData.status === 'hadir' && (
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jumlah Tamu</label>
                              <select 
                                  value={formData.pax} 
                                  onChange={(e) => setFormData({...formData, pax: parseInt(e.target.value)})}
                                  className="w-full p-2 bg-white border border-gray-300 outline-none focus:border-[#3E2723]"
                              >
                                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Orang</option>)}
                              </select>
                          </div>
                      )}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ucapan</label>
                          <textarea 
                              rows="3"
                              value={formData.message} 
                              onChange={(e) => setFormData({...formData, message: e.target.value})}
                              placeholder="Tulis doa restu..."
                              className="w-full p-2 bg-white border border-gray-300 outline-none focus:border-[#3E2723]"
                          ></textarea>
                      </div>
                      <button disabled={isSubmitting} className="w-full py-3 bg-[#3E2723] text-white font-bold text-sm hover:bg-[#281A16] transition flex items-center justify-center gap-2">
                          {isSubmitting ? 'Mengirim...' : <><Send size={14}/> KIRIM RSVP</>}
                      </button>
                  </form>
              )}
          </div>

          {/* List Side */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 max-h-[400px] overflow-y-auto custom-scroll">
                <h3 className="font-serif text-xl text-[#3E2723] mb-6">Wishes ({rsvps?.length || 0})</h3>
                <div className="space-y-2">
                    {rsvps?.length > 0 ? rsvps.map((rsvp) => (
                        <div key={rsvp.id} className="pb-4 relative group">
                            
                            {/* --- MESSAGE ITEM (DISCORD STYLE) --- */}
                            <div className="flex items-start gap-3 relative z-10">
                                {/* Avatar Tamu */}
                                <div className="w-9 h-9 rounded-full bg-[#E8DCC4] flex items-center justify-center text-[#3E2723] font-bold text-xs shrink-0 shadow-sm">
                                    {rsvp.guest_name.charAt(0).toUpperCase()}
                                </div>
                                
                                <div className="flex-1">
                                    {/* Header Name & Date */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold text-sm text-[#3E2723] hover:underline cursor-pointer">{rsvp.guest_name}</span>
                                        <span className="text-[10px] text-gray-400">{new Date(rsvp.created_at).toLocaleDateString()}</span>
                                    </div>
                                    
                                    {/* Message Text */}
                                    <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{rsvp.message}</p>
                                </div>
                            </div>

                            {/* --- REPLY THREAD (GARIS KONEKTOR) --- */}
                            {rsvp.reply && (
                                <div className="mt-1 pl-[1.1rem] flex gap-2 relative">
                                    {/* Garis L (Connector Line) */}
                                    <div className="absolute top-[-10px] left-[1.1rem] w-5 h-8 border-l-2 border-b-2 border-gray-200 rounded-bl-xl pointer-events-none"></div>

                                    {/* Avatar Mempelai (Kecil) */}
                                    <div className="w-5 h-5 rounded-full bg-[#8B7355] flex items-center justify-center text-white shrink-0 mt-3 relative z-10 ml-3">
                                        <Heart size={10} fill="currentColor" />
                                    </div>

                                    {/* Bubble Balasan */}
                                    <div className="mt-2 bg-[#F9F7F2] p-2 rounded-r-lg rounded-bl-lg border-l-2 border-[#8B7355] w-full">
                                        <p className="text-[10px] font-bold text-[#8B7355] mb-0.5 flex items-center gap-1">
                                            Mempelai <span className="bg-[#8B7355] text-white text-[8px] px-1 rounded-sm">ADMIN</span>
                                        </p>
                                        <p className="text-xs text-gray-600 italic">"{rsvp.reply}"</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 opacity-60">
                            <MessageSquare size={32} className="mb-2"/>
                            <p className="text-sm">Belum ada ucapan.</p>
                        </div>
                    )}
                </div>
            </div>
      </div>
  )
};

const ContentRenderer = ({ id, groom, bride, date, guestName, data, timeLeft, onRsvpSubmit, submittedData }) => {
  switch (id) {
    case 'cover':
      return (
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
           <div className="space-y-2">
              <p className="font-serif text-sm tracking-[0.3em] uppercase text-gray-500">The Wedding Of</p>
              <h1 className="font-serif text-5xl md:text-7xl text-[#3E2723]">{groom} <span className="font-light italic text-[#8B7355]">&</span> {bride}</h1>
           </div>
           
           <div className="flex justify-center gap-6 font-mono text-[#5D4037]">
              <div className="text-center"><span className="text-3xl block">{timeLeft.days}</span><span className="text-xs uppercase">Days</span></div>
              <div className="text-center"><span className="text-3xl block">{timeLeft.hours}</span><span className="text-xs uppercase">Hours</span></div>
              <div className="text-center"><span className="text-3xl block">{timeLeft.minutes}</span><span className="text-xs uppercase">Mins</span></div>
              <div className="text-center"><span className="text-3xl block animate-pulse">{timeLeft.seconds}</span><span className="text-xs uppercase">Secs</span></div>
           </div>

           <div className="border-t border-b border-[#D7CCC8] py-4">
              <p className="font-serif text-gray-500 italic">Dear Guest,</p>
              <h3 className="font-bold text-xl text-[#3E2723] mt-2">{guestName}</h3>
           </div>
        </div>
      );
    
    case 'couple':
      return (
        <div className="grid md:grid-cols-2 gap-8 items-center animate-in fade-in slide-in-from-bottom duration-500">
           <div className="text-center space-y-4">
              <div className="w-48 h-64 mx-auto bg-gray-200 border-8 border-white shadow-lg rotate-[-2deg]">
                 <img src={data?.groom_photo} alt="Groom" className="w-full h-full object-cover"/>
              </div>
              <h2 className="font-serif text-3xl text-[#3E2723]">{groom}</h2>
              <p className="text-sm text-gray-500 font-sans">Putra dari {data?.groom_parents}</p>
           </div>
           <div className="text-center space-y-4">
              <div className="w-48 h-64 mx-auto bg-gray-200 border-8 border-white shadow-lg rotate-[2deg]">
                 <img src={data?.bride_photo} alt="Bride" className="w-full h-full object-cover"/>
              </div>
              <h2 className="font-serif text-3xl text-[#3E2723]">{bride}</h2>
              <p className="text-sm text-gray-500 font-sans">Putri dari {data?.bride_parents}</p>
           </div>
           {data?.quote && (
              <div className="md:col-span-2 text-center mt-8 bg-[#F9F7F2] p-6 rounded-lg">
                 <p className="font-serif italic text-lg text-gray-700">"{data.quote}"</p>
                 <p className="text-xs font-bold mt-2 uppercase tracking-widest text-[#8B7355]">— {data.quote_src}</p>
              </div>
           )}
        </div>
      );

    case 'event':
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500 max-w-2xl mx-auto">
           <div className="text-center mb-8">
              <h2 className="font-serif text-4xl text-[#3E2723] mb-2">The Event</h2>
              <p className="text-gray-500">{new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
           </div>
           
           <div className="grid gap-6">
              <div className="bg-white p-6 border-l-4 border-[#2F4F4F] shadow-sm">
                 <div className="flex items-center gap-3 mb-2">
                    <Clock className="text-[#2F4F4F]"/>
                    <h3 className="font-serif text-xl font-bold">Akad Nikah</h3>
                 </div>
                 <p className="text-2xl font-light text-gray-800">{data?.akad_time}</p>
              </div>
              
              <div className="bg-white p-6 border-l-4 border-[#8B7355] shadow-sm">
                 <div className="flex items-center gap-3 mb-2">
                    <Calendar className="text-[#8B7355]"/>
                    <h3 className="font-serif text-xl font-bold">Resepsi</h3>
                 </div>
                 <p className="text-2xl font-light text-gray-800">{data?.resepsi_time}</p>
              </div>
           </div>
        </div>
      );

    case 'location':
      return (
        <div className="text-center space-y-6 animate-in zoom-in duration-500">
           <MapPin className="w-12 h-12 mx-auto text-[#8B4513] animate-bounce"/>
           <h2 className="font-serif text-3xl text-[#3E2723]">{data?.venue_name}</h2>
           <p className="text-gray-600 max-w-md mx-auto leading-relaxed">{data?.venue_address}</p>
           <a href={data?.maps_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#8B4513] text-white px-8 py-3 rounded-full hover:bg-[#6d360f] transition shadow-lg">
              <Map size={18}/> Open Maps
           </a>
        </div>
      );

    case 'gallery':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-700">
           {data?.gallery?.map((img, i) => (
              <div key={i} className={`overflow-hidden rounded-lg shadow-md cursor-pointer hover:opacity-90 transition ${i%3===0 ? 'col-span-2 row-span-2' : ''}`}>
                 <img src={img} className="w-full h-full object-cover" alt="Gallery"/>
              </div>
           ))}
        </div>
      );

    case 'gift':
      return (
        <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
           <div className="text-center">
              <Gift className="w-12 h-12 mx-auto text-[#8FBC8F] mb-4"/>
              <h2 className="font-serif text-3xl text-[#3E2723]">Wedding Gift</h2>
              <p className="text-gray-500 text-sm mt-2">Your blessing is our greatest gift.</p>
           </div>
           <div className="space-y-4">
              {data?.banks?.map((bank, i) => (
                 <div key={i} className="bg-white p-6 border border-gray-200 shadow-lg relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#8FBC8F]"></div>
                    <p className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2">{bank.bank}</p>
                    <p className="font-mono text-2xl text-gray-800 mb-1">{bank.number}</p>
                    <p className="text-sm text-gray-600 mb-4">a.n {bank.name}</p>
                    <button onClick={() => {navigator.clipboard.writeText(bank.number); alert('Copied!');}} className="text-[#8FBC8F] text-xs font-bold hover:underline">COPY NUMBER</button>
                 </div>
              ))}
           </div>
        </div>
      );

    case 'rsvp':
      return (
        <RsvpContent onRsvpSubmit={onRsvpSubmit} submittedData={submittedData} rsvps={data?.rsvps} />
      );

    default: return null;
  }
};

const ArtFrame = ({ id, type, title, subtitle, size = 'square', onClick, groom, bride }) => {
  const heightClass = size === 'tall' ? 'h-80 md:h-96' : size === 'wide' ? 'h-48 md:h-64' : 'h-64 md:h-80';
  
  return (
    <div 
      onClick={() => onClick(id)}
      className={`relative group cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:z-10 ${heightClass}`}
    >
      <div className="absolute inset-0 border-[12px] md:border-[16px] border-[#2A2A2A] shadow-2xl bg-white box-border z-10 flex flex-col">
          <div className="flex-1 relative overflow-hidden bg-gray-100">
              <AbstractCanvas type={type} groom={groom} bride={bride} />
              
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-500 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                  <span className="font-serif text-2xl tracking-widest">{title}</span>
                  <span className="text-xs uppercase tracking-widest mt-2 border-t border-white/50 pt-2">{subtitle}</span>
                  <div className="mt-4 px-4 py-1 border border-white rounded-full text-xs hover:bg-white hover:text-black transition">VIEW EXHIBIT</div>
              </div>
          </div>
      </div>

      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-32 h-12 bg-white shadow-md border border-gray-200 flex flex-col items-center justify-center p-1 z-0">
          <p className="font-bold text-[10px] text-gray-800 uppercase text-center leading-tight">{title}</p>
          <p className="text-[8px] text-gray-500 italic text-center">Collection 2026</p>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function ArtGalleryTheme({ 
  groom, 
  bride, 
  date, 
  guestName, 
  data, 
  onRsvpSubmit, 
  submittedData 
}) {
  const [activeFrame, setActiveFrame] = useState(null); 
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  // Audio Control
  useEffect(() => {
    if (audioRef.current && data?.audio_url) {
        audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(() => setIsAudioPlaying(false));
    }
  }, [data?.audio_url]);

  const toggleAudio = (e) => {
    e.stopPropagation();
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2D2D] font-sans selection:bg-[#D4AF37] selection:text-white pb-32">
        
        <style>{`
            .custom-scroll::-webkit-scrollbar { width: 4px; }
            .custom-scroll::-webkit-scrollbar-track { background: #f1f1f1; }
            .custom-scroll::-webkit-scrollbar-thumb { background: #ccc; }
        `}</style>

        {/* --- HEADER / AUDIO TOGGLE --- */}
        <div className="fixed top-6 right-6 z-40">
            <button onClick={toggleAudio} className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition border-2 border-white">
                {isAudioPlaying ? <Pause size={16}/> : <Play size={16}/>}
            </button>
        </div>

        {/* --- GALLERY WALL LAYOUT --- */}
        <div className="max-w-6xl mx-auto px-6 py-20">
            
            <div className="text-center mb-24 space-y-4">
                <p className="text-xs font-bold tracking-[0.5em] text-[#8B7355] uppercase">The Wedding Gallery</p>
                <h1 className="font-serif text-4xl md:text-6xl text-[#2A2A2A]">Exhibition of Love</h1>
                <div className="w-16 h-1 bg-[#2A2A2A] mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                
                <div className="md:col-span-2 lg:col-span-3 flex justify-center mb-10">
                    <div className="w-full max-w-2xl h-[500px]">
                        <ArtFrame 
                            id="cover" 
                            type="cover" 
                            title="The Beginning" 
                            subtitle="Save The Date" 
                            size="custom" 
                            onClick={setActiveFrame}
                            groom={groom}
                            bride={bride}
                        />
                    </div>
                </div>

                <ArtFrame id="couple" type="couple" title="The Couple" subtitle="Groom & Bride" size="tall" onClick={setActiveFrame} groom={groom} bride={bride} />
                <ArtFrame id="event" type="event" title="The Event" subtitle="Time & Place" onClick={setActiveFrame} />
                <ArtFrame id="location" type="location" title="Location" subtitle="Venue Map" size="wide" onClick={setActiveFrame} />

                <div className="lg:col-span-2">
                    <ArtFrame id="gallery" type="gallery" title="Memories" subtitle="Photo Gallery" size="wide" onClick={setActiveFrame} />
                </div>

                <ArtFrame id="gift" type="gift" title="Gift" subtitle="Digital Envelope" onClick={setActiveFrame} />

                <div className="md:col-span-2 lg:col-span-3 flex justify-center mt-10">
                    <div className="w-full max-w-md h-[300px]">
                        <ArtFrame id="rsvp" type="rsvp" title="RSVP" subtitle="Wishes & Attendance" onClick={setActiveFrame} />
                    </div>
                </div>

            </div>
        </div>

        {/* --- MODAL OVERLAY --- */}
        {activeFrame && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#FDFBF7]/90 backdrop-blur-md animate-in fade-in duration-300">
                <div className="relative w-full max-w-5xl max-h-full bg-white shadow-2xl border-[16px] border-[#2A2A2A] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
                    <button 
                        onClick={() => setActiveFrame(null)}
                        className="absolute top-4 right-4 z-50 bg-black/10 hover:bg-black text-black hover:text-white p-2 rounded-full transition"
                    >
                        <X size={24}/>
                    </button>

                    <div className="flex-1 overflow-y-auto custom-scroll p-8 md:p-16 bg-white relative">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
                        
                        <div className="relative z-10">
                            <ContentRenderer 
                                id={activeFrame} 
                                groom={groom}
                                bride={bride}
                                date={date}
                                guestName={guestName}
                                data={data}
                                timeLeft={timeLeft}
                                onRsvpSubmit={onRsvpSubmit}
                                submittedData={submittedData}
                            />
                        </div>
                    </div>

                    <div className="bg-[#2A2A2A] text-white p-4 flex justify-between items-center text-xs uppercase tracking-widest shrink-0">
                        <span>Exhibit: {activeFrame}</span>
                        <button onClick={() => setActiveFrame(null)} className="flex items-center gap-2 hover:text-[#D4AF37] transition">
                            Close Gallery <ChevronRight size={14}/>
                        </button>
                    </div>
                </div>
            </div>
        )}

        <footer className="text-center text-[#8B7355] text-xs pt-20 uppercase tracking-widest opacity-50">
            © 2026 Art Gallery Wedding • Curated with Love
        </footer>

        <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3"} loop />
    </div>
  );
}