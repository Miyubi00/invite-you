import React, { useState, useEffect, useRef } from 'react';
import { 
  Signal, Wifi, BatteryMedium, Heart, MapPin, Calendar, 
  Gift, MessageCircle, Image as ImageIcon, Search, 
  ArrowLeft, Play, Pause, Lock, CheckCircle2, User, Quote
} from 'lucide-react';

// --- SUB-COMPONENTS ---

const StatusBar = ({ time }) => (
  <div className="flex justify-between items-center px-6 py-3 text-white text-xs font-medium z-50 absolute top-0 left-0 w-full bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
    <div>{time}</div>
    <div className="flex gap-2 items-center">
      <Signal size={14} fill="currentColor" />
      <Wifi size={14} />
      <BatteryMedium size={14} />
    </div>
  </div>
);

const NavigationBar = ({ lightMode = false, onBack, onHome }) => (
  <div className={`absolute bottom-0 left-0 w-full h-16 flex justify-around items-center z-50 ${lightMode ? 'bg-[#F2F1F6]/90 backdrop-blur-md border-t border-gray-200' : 'bg-transparent'}`}>
      <button onClick={onBack} className="p-4 active:scale-75 transition-transform">
          <ArrowLeft size={20} className={lightMode ? "text-gray-600" : "text-white"} />
      </button>
      <button onClick={onHome} className="p-4 active:scale-75 transition-transform">
          <div className={`w-12 h-1.5 rounded-full ${lightMode ? "bg-gray-400" : "bg-white/80"}`}></div>
      </button>
      <button className="p-4 active:scale-75 transition-transform">
          <div className={`w-4 h-4 rounded-sm border-2 ${lightMode ? "border-gray-500" : "border-white/80"}`}></div>
      </button>
  </div>
);

const AppIcon = ({ icon: Icon, label, color, onClick }) => (
  <div 
      onClick={onClick}
      className="flex flex-col items-center gap-2 cursor-pointer active:scale-90 transition-transform duration-200 group"
  >
      <div className={`w-16 h-16 ${color} rounded-[24px] flex items-center justify-center shadow-md group-hover:shadow-xl transition-all border border-white/10`}>
          <Icon size={30} className="text-gray-900 opacity-80" />
      </div>
      <span className="text-white text-xs font-medium drop-shadow-md tracking-wide">{label}</span>
  </div>
);

// --- APP SECTIONS ---

const CoupleApp = ({ data, groom, bride }) => (
  <div className="min-h-full bg-[#FFF0F5] pb-24 pt-20 text-gray-800 animate-in fade-in slide-in-from-bottom-8 duration-300">
      <div className="px-6 space-y-8">
          <div className="bg-white p-6 rounded-[32px] shadow-sm text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">The Couple</h2>
              <p className="text-pink-500 text-sm font-medium uppercase tracking-widest">Love Story</p>
          </div>

          <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 bg-gray-200">
                  <img src={data?.groom_photo || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="Groom" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{groom}</h3>
              <p className="text-sm text-gray-500 mt-1">Putra dari Bpk/Ibu {data?.groom_parents}</p>
          </div>

          <div className="flex justify-center text-pink-400">
              <Heart size={32} fill="currentColor" className="animate-pulse" />
          </div>

          <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 bg-gray-200">
                  <img src={data?.bride_photo || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="Bride" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{bride}</h3>
              <p className="text-sm text-gray-500 mt-1">Putri dari Bpk/Ibu {data?.bride_parents}</p>
          </div>

          {data?.quote && (
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-pink-100 mt-8 relative">
                  <Quote className="absolute top-6 left-6 text-pink-200 w-8 h-8" />
                  <p className="text-lg font-serif italic text-gray-700 text-center mb-4 relative z-10 pt-4">"{data.quote}"</p>
                  <p className="text-xs font-bold text-center text-pink-500 uppercase tracking-widest">— {data.quote_src}</p>
              </div>
          )}
      </div>
  </div>
);

const EventApp = ({ data, weddingDateString }) => (
  <div className="min-h-full bg-[#F0F4FF] pb-24 pt-20 text-gray-800 animate-in fade-in slide-in-from-bottom-8 duration-300">
      <div className="px-4 space-y-4">
          <div className="bg-white p-6 rounded-[32px] shadow-sm text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Save The Date</h2>
              <p className="text-blue-500 font-medium">{weddingDateString}</p>
          </div>

          <div className="bg-white p-6 rounded-[28px] shadow-sm flex gap-4 items-start">
              <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><Lock size={24} /></div>
              <div>
                  <h3 className="font-bold text-lg text-gray-800">Akad Nikah</h3>
                  <p className="text-blue-600 font-medium mb-1">{data?.akad_time}</p>
                  <p className="text-sm text-gray-500">Momen sakral pengucapan janji suci.</p>
              </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] shadow-sm flex gap-4 items-start">
              <div className="bg-purple-100 p-3 rounded-2xl text-purple-600"><Gift size={24} /></div>
              <div>
                  <h3 className="font-bold text-lg text-gray-800">Resepsi</h3>
                  <p className="text-purple-600 font-medium mb-1">{data?.resepsi_time}</p>
                  <p className="text-sm text-gray-500">Perayaan kebahagiaan bersama tamu undangan.</p>
              </div>
          </div>

          <div className="bg-[#E3F2FD] p-6 rounded-[28px] mt-6">
              <div className="flex items-center gap-2 mb-4 text-blue-800">
                  <MapPin size={20} />
                  <span className="font-bold">Lokasi Acara</span>
              </div>
              <h4 className="font-bold text-xl text-gray-900 mb-2">{data?.venue_name}</h4>
              <p className="text-sm text-gray-600 mb-6">{data?.venue_address}</p>
              <a href={data?.maps_link} target="_blank" rel="noreferrer" className="block w-full py-3 bg-blue-600 text-white font-bold text-center rounded-xl hover:bg-blue-700 transition">Buka Google Maps</a>
          </div>
      </div>
  </div>
);

const GiftApp = ({ data }) => (
  <div className="min-h-full bg-[#F3E5F5] pb-24 pt-20 text-gray-800 animate-in fade-in slide-in-from-bottom-8 duration-300">
      <div className="px-4 space-y-4">
          <div className="bg-white p-6 rounded-[32px] shadow-sm text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Digital Envelope</h2>
              <p className="text-purple-500 font-medium">Send your love</p>
          </div>

          {data?.banks && data.banks.length > 0 ? (
              data.banks.map((bank, index) => (
                  <div key={index} className="bg-white p-6 rounded-[28px] shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-bl-[100px] -mr-4 -mt-4 z-0"></div>
                      <div className="relative z-10">
                          <p className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-1">{bank.bank}</p>
                          <p className="font-mono text-2xl text-gray-800 mb-1 font-bold">{bank.number}</p>
                          <p className="text-sm text-gray-600 mb-4">a.n {bank.name}</p>
                          <button 
                              onClick={() => {navigator.clipboard.writeText(bank.number); alert('Nomor rekening disalin!')}}
                              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold active:bg-purple-200 transition"
                          >
                              Copy Number
                          </button>
                      </div>
                  </div>
              ))
          ) : (
              <div className="text-center p-10 text-gray-500">Belum ada data rekening.</div>
          )}
      </div>
  </div>
);

const GalleryApp = ({ data }) => (
  <div className="min-h-full bg-[#FFF8E1] pb-24 pt-20 text-gray-800 animate-in fade-in slide-in-from-bottom-8 duration-300">
      <div className="px-4">
          <div className="bg-white p-6 rounded-[32px] shadow-sm text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Gallery</h2>
              <p className="text-yellow-600 font-medium">Our Memories</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
              {data?.gallery && data.gallery.length > 0 ? (
                  data.gallery.map((img, idx) => (
                      <div key={idx} className={`rounded-2xl overflow-hidden shadow-sm ${idx % 3 === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                          <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                      </div>
                  ))
              ) : (
                  <div className="col-span-2 text-center py-10 text-gray-500">Belum ada foto galeri.</div>
              )}
          </div>
      </div>
  </div>
);

const RsvpApp = ({ data, submittedData, onRsvpSubmit }) => {
  const [formData, setFormData] = useState({ status: 'hadir', pax: 1, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      await onRsvpSubmit(formData);
      setIsSubmitting(false);
  };

  return (
      <div className="min-h-full bg-[#E0F2F1] pb-24 pt-20 text-gray-800 animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="px-4">
              <div className="bg-white p-6 rounded-[32px] shadow-sm text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">RSVP & Wishes</h2>
                  <p className="text-teal-600 font-medium">Konfirmasi Kehadiran</p>
              </div>

              {/* Form Section */}
              <div className="bg-white p-6 rounded-[28px] shadow-sm mb-8">
                  {submittedData ? (
                      <div className="text-center py-6">
                          <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle2 size={32} />
                          </div>
                          <h3 className="font-bold text-xl text-gray-800 mb-2">Terima Kasih!</h3>
                          <p className="text-gray-500 text-sm">Data Anda telah tersimpan.</p>
                          <div className="mt-4 p-4 bg-gray-50 rounded-xl text-left border border-gray-100">
                              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Status</p>
                              <p className={`font-bold ${submittedData.status === 'hadir' ? 'text-green-600' : 'text-red-500'}`}>
                                  {submittedData.status === 'hadir' ? 'Akan Hadir' : submittedData.status === 'ragu' ? 'Masih Ragu' : 'Berhalangan'}
                              </p>
                              <p className="text-xs text-gray-400 uppercase font-bold mt-3 mb-1">Pesan Anda</p>
                              <p className="text-sm text-gray-700 italic">"{submittedData.message}"</p>
                              
                              {/* BALASAN RSVP */}
                              {submittedData.reply && (
                                  <div className="mt-3 pt-3 border-t border-gray-200 bg-teal-50/50 -mx-2 px-2 pb-2 rounded-b-lg">
                                      <p className="text-xs text-teal-600 font-bold mb-1 flex items-center gap-1">
                                          <MessageCircle size={10} /> Balasan Mempelai:
                                      </p>
                                      <p className="text-sm text-gray-800 italic">"{submittedData.reply}"</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Kehadiran</label>
                              <div className="grid grid-cols-3 gap-2">
                                  {['hadir', 'ragu', 'tidak_hadir'].map((opt) => (
                                      <button
                                          key={opt}
                                          type="button"
                                          onClick={() => setFormData({...formData, status: opt})}
                                          className={`py-2 rounded-xl text-xs font-bold border-2 transition ${
                                              formData.status === opt 
                                              ? 'border-teal-500 bg-teal-50 text-teal-700' 
                                              : 'border-gray-200 text-gray-500'
                                          }`}
                                      >
                                          {opt === 'hadir' ? 'Hadir' : opt === 'ragu' ? 'Ragu' : 'Maaf'}
                                      </button>
                                  ))}
                              </div>
                          </div>

                          {formData.status === 'hadir' && (
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Jumlah Orang</label>
                                  <select 
                                      value={formData.pax} 
                                      onChange={(e) => setFormData({...formData, pax: parseInt(e.target.value)})}
                                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 transition"
                                  >
                                      {[1,2,3,4,5].map(num => <option key={num} value={num}>{num} Orang</option>)}
                                  </select>
                              </div>
                          )}

                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Ucapan & Doa</label>
                              <textarea 
                                  rows="3"
                                  value={formData.message}
                                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                                  placeholder="Tulis ucapan selamat..."
                                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 transition resize-none"
                              ></textarea>
                          </div>

                          <button 
                              type="submit" 
                              disabled={isSubmitting}
                              className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-200 active:scale-95 transition disabled:opacity-50"
                          >
                              {isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
                          </button>
                      </form>
                  )}
              </div>

              {/* List Ucapan */}
              <div className="space-y-3">
                  <h3 className="font-bold text-gray-700 ml-2">Ucapan Terbaru</h3>
                  {data?.rsvps && data.rsvps.length > 0 ? (
                      data.rsvps.map((rsvp) => (
                          <div key={rsvp.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                              <div className="flex gap-3 items-center">
                                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold shrink-0">
                                      {rsvp.guest_name.charAt(0)}
                                  </div>
                                  <div>
                                      <p className="font-bold text-sm text-gray-800">{rsvp.guest_name}</p>
                                      <p className="text-[10px] text-gray-400">{new Date(rsvp.created_at).toLocaleDateString()}</p>
                                  </div>
                              </div>
                              <p className="text-sm text-gray-600 pl-[52px]">"{rsvp.message}"</p>
                              
                              {/* Balasan di List Publik */}
                              {rsvp.reply && (
                                  <div className="ml-[52px] bg-gray-50 p-2 rounded-lg border-l-2 border-teal-400">
                                      <p className="text-[10px] font-bold text-teal-600">Balasan:</p>
                                      <p className="text-xs text-gray-700">{rsvp.reply}</p>
                                  </div>
                              )}
                          </div>
                      ))
                  ) : (
                      <p className="text-center text-gray-400 text-sm">Belum ada ucapan.</p>
                  )}
              </div>
          </div>
      </div>
  );
};

// --- MAIN COMPONENT ---

export default function AndroidHomeTheme({ 
  groom, 
  bride, 
  date, 
  guestName, 
  data, 
  onRsvpSubmit, 
  submittedData 
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeApp, setActiveApp] = useState(null); // null = Home Screen
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  const weddingDate = new Date(date);
  const coverPhoto = data?.cover_photo || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&fit=crop"; 
  
  // Clock Effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const difference = weddingDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [date]);

  // Audio Auto Play
  useEffect(() => {
    if (audioRef.current && data?.audio_url) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.then(() => setIsAudioPlaying(true)).catch(() => setIsAudioPlaying(false));
        }
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

  const openApp = (appName) => {
    setActiveApp(appName);
    // FIX: Scroll container bukan window
    const container = document.getElementById('android-screen');
    if(container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setActiveApp(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212] font-sans p-0 md:p-8">
        
        {/* CSS INJECTION FOR SCROLLBAR REMOVAL */}
        <style>{`
            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .no-scrollbar {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            }
        `}</style>

        {/* PHONE CONTAINER */}
        <div className="w-full h-[100dvh] md:h-[850px] max-w-[420px] bg-black relative overflow-hidden shadow-2xl rounded-none md:rounded-[45px] border-[0px] md:border-[10px] border-[#202020] ring-1 ring-white/10">
            
            {/* DYNAMIC CONTENT AREA */}
            <div id="android-screen" className="w-full h-full bg-black overflow-y-auto no-scrollbar relative">
                
                {/* STATUS BAR (FIXED TOP INSIDE CONTAINER) */}
                <StatusBar time={currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />

                {/* APP SCREENS */}
                {activeApp === 'couple' && <CoupleApp data={data} groom={groom} bride={bride} />}
                {activeApp === 'event' && <EventApp data={data} weddingDateString={weddingDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />}
                {activeApp === 'gallery' && <GalleryApp data={data} />}
                {activeApp === 'gift' && <GiftApp data={data} />}
                {activeApp === 'rsvp' && <RsvpApp data={data} submittedData={submittedData} onRsvpSubmit={onRsvpSubmit} />}
                
                {/* HOME SCREEN */}
                {!activeApp && (
                    <div className="relative min-h-full text-white pt-16 pb-20 px-6 flex flex-col justify-between">
                        {/* Wallpaper */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center z-0 animate-in fade-in duration-1000"
                            style={{ 
                                backgroundImage: `url(${coverPhoto})`,
                                filter: 'brightness(0.6)'
                            }}
                        ></div>

                        {/* Top Widgets */}
                        <div className="relative z-10">
                            <div className="text-lg font-medium text-gray-200 uppercase tracking-widest mb-8">
                                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>

                            {/* Clock Widget */}
                            <div className="flex flex-col items-start drop-shadow-lg mb-8">
                                <div className="text-[5.5rem] leading-[0.85] font-bold text-[#E3E3E3]">
                                    {String(timeLeft.hours).padStart(2, '0')}
                                </div>
                                <div className="text-[5.5rem] leading-[0.85] font-bold text-[#C4D7FF]">
                                    {String(timeLeft.minutes).padStart(2, '0')}
                                </div>
                                <div className="flex gap-3 items-center mt-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-sm font-medium">{timeLeft.days} Days left</span>
                                </div>
                            </div>

                            {/* Guest Widget */}
                            <div className="bg-[#F2F1F6]/90 backdrop-blur-sm rounded-[24px] py-3 px-5 flex items-center gap-3 shadow-lg text-gray-600 mb-8 transform transition hover:scale-[1.02]">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">G</div>
                                <div className="flex-1 text-sm font-medium truncate">
                                    Hi, <span className="text-gray-900 font-bold">{guestName || "Guest"}</span>
                                </div>
                                <Search size={20} className="text-gray-400" />
                            </div>
                        </div>

                        {/* App Grid */}
                        <div className="relative z-10 grid grid-cols-4 gap-y-6 gap-x-2">
                            <AppIcon icon={Heart} label="Couple" color="bg-pink-200" onClick={() => openApp('couple')} />
                            <AppIcon icon={Calendar} label="Event" color="bg-blue-200" onClick={() => openApp('event')} />
                            <AppIcon icon={ImageIcon} label="Gallery" color="bg-yellow-200" onClick={() => openApp('gallery')} />
                            <AppIcon icon={Gift} label="Gift" color="bg-purple-200" onClick={() => openApp('gift')} />
                            <AppIcon icon={MessageCircle} label="RSVP" color="bg-teal-200" onClick={() => openApp('rsvp')} />
                            
                            {/* Audio Toggle */}
                            <div 
                                onClick={toggleAudio}
                                className="flex flex-col items-center gap-2 cursor-pointer active:scale-90 transition-transform duration-200 group"
                            >
                                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-md transition-all border border-white/10 ${isAudioPlaying ? 'bg-green-400' : 'bg-gray-800/80 backdrop-blur-md'}`}>
                                    {isAudioPlaying ? <Pause size={30} className="text-white" /> : <Play size={30} className="text-white" />}
                                </div>
                                <span className="text-white text-xs font-medium drop-shadow-md tracking-wide">Music</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* NAVIGATION BAR (FIXED BOTTOM INSIDE CONTAINER) */}
            <NavigationBar 
                lightMode={activeApp !== null} 
                onHome={goHome} 
                onBack={goHome}
            />

            {/* HIDDEN AUDIO PLAYER */}
            <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3"} loop />
        </div>
    </div>
  );
}