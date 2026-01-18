import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, MapPin, Calendar, Clock, 
  Gift, Star, Zap, Heart, 
  CheckCircle2
} from 'lucide-react';

// --- 1. HELPER COMPONENTS (DI LUAR) ---

const Badge = ({ text, color = "bg-yellow-400", rotate = "rotate-12" }) => (
  <div className={`absolute z-20 ${color} border-2 border-black text-black font-black text-xs md:text-sm px-3 py-1 uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform ${rotate} animate-pulse`}>
    {text}
  </div>
);

const Marquee = ({ text }) => (
  <div className="bg-black text-white py-2 overflow-hidden border-y-2 border-black">
    <div className="animate-marquee whitespace-nowrap font-mono uppercase tracking-widest text-sm flex gap-8">
      {[...Array(10)].map((_, i) => (
        <span key={i} className="flex items-center gap-4">
          <Star size={12} className="text-yellow-400 fill-current" /> {text}
        </span>
      ))}
    </div>
  </div>
);

const SectionTitle = ({ title, subtitle, color = "text-black" }) => (
  <div className="mb-8 text-center relative">
      <h2 className={`font-display text-5xl md:text-7xl uppercase leading-[0.8] ${color} drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]`}>
          {title}
      </h2>
      {subtitle && (
          <div className="inline-block bg-white border-2 border-black px-4 py-1 mt-2 transform -rotate-2">
              <span className="font-serif font-bold text-lg italic text-black">{subtitle}</span>
          </div>
      )}
  </div>
);

// --- 2. SECTIONS (DI LUAR AGAR TIDAK GLITCH) ---

const CoverSection = ({ data, date, groom, bride, guestName }) => (
  <section className="min-h-screen relative flex flex-col border-b-4 border-black bg-[#FF3366]">
      <div className="bg-white border-b-4 border-black p-2 flex justify-between items-center px-4 font-mono text-xs md:text-sm font-bold">
          <span>VOL. 1</span>
          <span>EXCLUSIVE EDITION</span>
          <span>RP. PRICELESS</span>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col items-center pt-8">
          <h1 className="font-display text-[15vw] md:text-[12vw] leading-none text-white drop-shadow-[6px_6px_0px_black] z-10 text-center pointer-events-none">
              WEDDING<br/><span className="text-yellow-400">ISSUE</span>
          </h1>

          <div className="relative w-[90%] md:w-[60%] aspect-[3/4] md:aspect-square bg-gray-200 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] -mt-4 md:-mt-10 z-0">
              <img src={data?.cover_photo} className="w-full h-full object-cover grayscale contrast-125" alt="Cover" />
              <Badge text="JUST MARRIED!" color="bg-blue-400" rotate="-rotate-6" />
              <div className="absolute -bottom-6 -right-6 bg-yellow-400 border-2 border-black p-4 shadow-[4px_4px_0px_black] transform rotate-3">
                  <p className="font-display text-2xl md:text-4xl text-black leading-none">{new Date(date).getDate()}</p>
                  <p className="font-mono text-xs font-bold uppercase">{new Date(date).toLocaleString('default', { month: 'short' })}</p>
              </div>
          </div>

          <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 gap-4 p-6 mt-auto relative z-10">
              <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_black] transform -rotate-1">
                  <p className="font-bold bg-black text-white text-xs inline-block px-1">EXCLUSIVE</p>
                  <p className="font-display text-xl leading-tight mt-1">{groom} & {bride}</p>
              </div>
              <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_black] transform rotate-1">
                  <p className="font-bold bg-red-500 text-white text-xs inline-block px-1">LOCATION</p>
                  <p className="font-display text-xl leading-tight mt-1">See Full Map Inside!</p>
              </div>
              <div className="hidden md:block bg-white border-2 border-black p-3 shadow-[4px_4px_0px_black] transform -rotate-2">
                  <p className="font-bold bg-blue-500 text-white text-xs inline-block px-1">VIP GUEST</p>
                  <p className="font-display text-xl leading-tight mt-1">{guestName}</p>
              </div>
          </div>
      </div>
      <Marquee text="READ ALL ABOUT IT • THE LOVE STORY OF THE YEAR • DON'T MISS OUT •" />
  </section>
);

const StorySection = ({ data }) => (
  <section className="py-20 px-6 bg-[#FDFBF7] text-black border-b-4 border-black relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
          <SectionTitle title="Feature Story" subtitle="How it all began" />
          
          <div className="columns-1 md:columns-2 gap-8 text-justify font-serif text-lg leading-relaxed space-y-4">
              <p className="first-letter:text-7xl first-letter:font-display first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px] first-letter:text-red-500">
                  {data?.quote ? data.quote : "Every love story is beautiful, but ours is my favorite. It all started with a simple hello, and now we are here, ready to embark on a lifetime adventure together."}
              </p>
              <p>
                  We invite you to join us as we celebrate our love, laughter, and happily ever after. This isn't just a wedding; it's a festival of our journey.
              </p>
              <div className="w-full h-px bg-black my-4"></div>
              <p className="font-bold text-sm uppercase tracking-widest text-right">— {data?.quote_src || "The Couple"}</p>
          </div>
      </div>
      <Star className="absolute top-10 left-10 text-yellow-400 w-12 h-12 animate-spin-slow border-2 border-black rounded-full p-1" />
      <Zap className="absolute bottom-10 right-10 text-blue-500 w-16 h-16 transform -rotate-12" fill="currentColor"/>
  </section>
);

const ProfileSection = ({ data, groom, bride }) => (
  <section className="py-20 bg-blue-600 border-b-4 border-black">
      <div className="max-w-5xl mx-auto px-4">
          <SectionTitle title="Starring" subtitle="The Main Characters" color="text-white" />
          
          <div className="grid md:grid-cols-2 gap-12 mt-12">
              <div className="relative group">
                  <div className="absolute inset-0 bg-yellow-400 border-4 border-black transform translate-x-3 translate-y-3 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform"></div>
                  <div className="relative bg-white border-4 border-black p-4 flex flex-col">
                      <div className="aspect-[3/4] bg-gray-200 overflow-hidden border-2 border-black mb-4">
                          <img src={data?.groom_photo} alt="Groom" className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-500"/>
                      </div>
                      <h3 className="font-display text-4xl uppercase">{groom}</h3>
                      <p className="font-mono text-sm border-t-2 border-black pt-2 mt-2">Son of: {data?.groom_parents}</p>
                  </div>
              </div>

              <div className="relative group mt-8 md:mt-0">
                  <div className="absolute inset-0 bg-pink-500 border-4 border-black transform -translate-x-3 translate-y-3 group-hover:-translate-x-5 group-hover:translate-y-5 transition-transform"></div>
                  <div className="relative bg-white border-4 border-black p-4 flex flex-col">
                      <div className="aspect-[3/4] bg-gray-200 overflow-hidden border-2 border-black mb-4">
                          <img src={data?.bride_photo} alt="Bride" className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-500"/>
                      </div>
                      <h3 className="font-display text-4xl uppercase">{bride}</h3>
                      <p className="font-mono text-sm border-t-2 border-black pt-2 mt-2">Daughter of: {data?.bride_parents}</p>
                  </div>
              </div>
          </div>
      </div>
  </section>
);

const EventSection = ({ data }) => (
  <section className="py-20 px-4 bg-yellow-300 border-b-4 border-black bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <div className="max-w-3xl mx-auto bg-white border-4 border-black p-8 shadow-[12px_12px_0px_black] transform rotate-1">
          <h2 className="font-display text-5xl text-center mb-8 border-b-4 border-black pb-4 uppercase">Event Schedule</h2>
          
          <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="bg-black text-white font-mono text-xl p-4 w-full md:w-32 text-center font-bold transform -rotate-2">
                      AKAD
                  </div>
                  <div className="flex-1 border-2 border-black p-4 border-dashed relative">
                      <div className="absolute -top-3 -right-3 bg-red-500 border-2 border-black text-white text-xs font-bold px-2 py-1 transform rotate-12">DONT MISS</div>
                      <Clock size={24} className="mb-2"/>
                      <h3 className="font-display text-2xl">{data?.akad_time}</h3>
                      <p className="font-serif italic text-gray-600">The sacred vows.</p>
                  </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="bg-white border-2 border-black text-black font-mono text-xl p-4 w-full md:w-32 text-center font-bold transform rotate-2">
                      RESEPSI
                  </div>
                  <div className="flex-1 border-2 border-black p-4 border-dashed bg-black text-white">
                      <Calendar size={24} className="mb-2 text-yellow-400"/>
                      <h3 className="font-display text-2xl">{data?.resepsi_time}</h3>
                      <p className="font-serif italic text-gray-300">Party & Celebration.</p>
                  </div>
              </div>
          </div>
      </div>
  </section>
);

const CountdownSection = ({ timeLeft }) => (
  <section className="py-16 bg-black border-b-4 border-black text-white text-center">
      <h3 className="font-mono text-yellow-400 tracking-[0.5em] uppercase mb-8 animate-pulse">Time Remaining</h3>
      <div className="flex justify-center gap-2 md:gap-6">
          {['Days', 'Hours', 'Mins', 'Secs'].map((label, i) => {
              const val = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds][i];
              return (
                  <div key={label} className="flex flex-col items-center">
                      <div className="bg-white text-black font-display text-4xl md:text-7xl p-4 md:p-6 border-4 border-gray-600 rounded-lg min-w-[70px] md:min-w-[120px]">
                          {String(val).padStart(2, '0')}
                      </div>
                      <span className="font-mono text-xs md:text-sm mt-2 text-gray-400 uppercase">{label}</span>
                  </div>
              );
          })}
      </div>
  </section>
);

const LocationSection = ({ data }) => (
  <section className="py-20 px-6 bg-[#00CC99] border-b-4 border-black">
      <div className="max-w-4xl mx-auto">
          <div className="bg-white border-4 border-black p-2 shadow-[8px_8px_0px_black]">
              <div className="border-2 border-dashed border-black p-6 md:p-10 flex flex-col items-center text-center">
                  <div className="bg-black text-white px-4 py-1 font-bold text-xs uppercase mb-4 tracking-widest">Advertorial</div>
                  <MapPin size={48} className="mb-4 text-red-500 animate-bounce"/>
                  <h2 className="font-display text-4xl md:text-6xl mb-4">{data?.venue_name}</h2>
                  <p className="font-mono text-sm md:text-base max-w-lg mb-8">{data?.venue_address}</p>
                  
                  <a 
                      href={data?.maps_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-black text-white font-display text-xl px-8 py-3 hover:bg-yellow-400 hover:text-black border-2 border-black transition-colors shadow-[4px_4px_0px_white]"
                  >
                      GET DIRECTIONS
                  </a>
              </div>
          </div>
      </div>
  </section>
);

const RsvpSection = ({ onRsvpSubmit, submittedData, data }) => {
  const [formData, setFormData] = useState({ status: 'hadir', pax: 1, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      await onRsvpSubmit(formData);
      setIsSubmitting(false);
  };

  return (
      <section className="py-20 px-6 bg-[#FF3366] border-b-4 border-black">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
              {/* FORM */}
              <div>
                  <h2 className="font-display text-5xl text-white mb-6 drop-shadow-[4px_4px_0px_black]">RSVP NOW</h2>
                  <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_black]">
                      {submittedData ? (
                          <div className="text-center py-8">
                              <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4"/>
                              <h3 className="font-display text-2xl uppercase">Message Sent!</h3>
                              <p className="font-mono text-sm mt-2 mb-4">Thanks for writing to us.</p>
                              <div className="bg-gray-100 p-4 border-2 border-black text-left">
                                  <span className="bg-black text-white text-[10px] px-2 py-1 font-bold uppercase">Status</span>
                                  <p className="font-bold text-xl mt-1">{submittedData.status.toUpperCase()}</p>
                                  <p className="italic mt-2">"{submittedData.message}"</p>
                              </div>
                          </div>
                      ) : (
                          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
                              <div>
                                  <label className="font-bold text-xs uppercase block mb-1">Attendance</label>
                                  <div className="flex flex-wrap gap-2">
                                      {['hadir', 'ragu', 'tidak_hadir'].map(s => (
                                          <button 
                                              key={s}
                                              type="button"
                                              onClick={() => setFormData({...formData, status: s})}
                                              className={`flex-1 border-2 border-black py-2 px-1 text-xs font-bold uppercase transition hover:-translate-y-1 ${formData.status === s ? 'bg-yellow-400 shadow-[4px_4px_0px_black]' : 'bg-white'}`}
                                          >
                                              {s.replace('_', ' ')}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                              {formData.status === 'hadir' && (
                                  <div>
                                      <label className="font-bold text-xs uppercase block mb-1">Pax</label>
                                      <select 
                                          value={formData.pax}
                                          onChange={(e) => setFormData({...formData, pax: parseInt(e.target.value)})}
                                          className="w-full border-2 border-black p-2 bg-gray-50 outline-none focus:bg-yellow-50"
                                      >
                                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} People</option>)}
                                      </select>
                                  </div>
                              )}
                              <div>
                                  <label className="font-bold text-xs uppercase block mb-1">Message</label>
                                  <textarea 
                                      rows="3"
                                      value={formData.message}
                                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                                      className="w-full border-2 border-black p-2 bg-gray-50 outline-none focus:bg-yellow-50 resize-none"
                                      placeholder="Write something..."
                                  ></textarea>
                              </div>
                              <button 
                                  disabled={isSubmitting}
                                  className="w-full bg-black text-white font-display text-xl py-3 hover:bg-blue-600 transition shadow-[4px_4px_0px_gray] disabled:opacity-50"
                              >
                                  {isSubmitting ? 'SENDING...' : 'SUBMIT RESPONSE'}
                              </button>
                          </form>
                      )}
                  </div>
              </div>

              {/* COMMENTS LIST */}
              <div className="bg-[#FFF] border-4 border-black p-1">
                  <div className="bg-gray-100 border-2 border-black h-full p-4 overflow-y-auto max-h-[500px] custom-scroll">
                      <h3 className="font-display text-2xl mb-4 border-b-4 border-black pb-2">READERS SAYS</h3>
                      <div className="space-y-6">
                          {data?.rsvps?.map((rsvp) => (
                              <div key={rsvp.id} className="relative pl-4">
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-black"></div>
                                  <div className="flex justify-between items-baseline mb-1">
                                      <h4 className="font-bold font-mono text-sm uppercase bg-yellow-300 inline-block px-1">{rsvp.guest_name}</h4>
                                      <span className="text-[10px] font-mono text-gray-500">{new Date(rsvp.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <p className="font-serif italic text-lg leading-tight">"{rsvp.message}"</p>
                                  
                                  {/* REPLY */}
                                  {rsvp.reply && (
                                      <div className="mt-2 ml-4 p-2 bg-black text-white text-xs font-mono border-l-4 border-red-500">
                                          <span className="text-red-500 font-bold uppercase">Editor's Reply:</span> {rsvp.reply}
                                      </div>
                                  )}
                              </div>
                          ))}
                          {(!data?.rsvps || data.rsvps.length === 0) && <p className="text-center font-mono text-sm opacity-50">No comments yet. Be the first!</p>}
                      </div>
                  </div>
              </div>
          </div>
      </section>
  );
};

const GiftSection = ({ data }) => (
  <section className="py-16 bg-gray-100 border-b-4 border-black">
      <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-8">CLASSIFIEDS & GIFTS</h2>
          <div className="grid md:grid-cols-2 gap-4">
              {data?.banks?.map((bank, i) => (
                  <div key={i} className="bg-white border-2 border-black p-4 flex items-center justify-between shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_black] transition-all">
                      <div>
                          <p className="font-bold text-xs uppercase bg-black text-white inline-block px-1 mb-1">FOR TRANSFER</p>
                          <h4 className="font-display text-2xl">{bank.bank}</h4>
                          <p className="font-mono text-lg tracking-wider">{bank.number}</p>
                          <p className="text-xs font-bold text-gray-500 uppercase">A.N {bank.name}</p>
                      </div>
                      <button onClick={() => {navigator.clipboard.writeText(bank.number); alert('Copied!');}} className="bg-yellow-400 border-2 border-black p-2 hover:bg-yellow-300 active:translate-y-1 transition">
                          <span className="font-bold text-xs">COPY</span>
                      </button>
                  </div>
              ))}
          </div>
      </div>
  </section>
);

const GallerySection = ({ data }) => (
  <section className="py-20 px-4 bg-white border-b-4 border-black">
      <SectionTitle title="Exclusive Photos" subtitle="Captured Moments" />
      <div className="max-w-6xl mx-auto columns-2 md:columns-3 gap-4 space-y-4">
          {data?.gallery?.map((img, i) => (
              <div key={i} className="break-inside-avoid relative group">
                  <div className="border-4 border-black p-1 bg-white shadow-[6px_6px_0px_black] group-hover:shadow-[10px_10px_0px_rgba(255,0,255,1)] transition-all">
                      <img src={img} className="w-full h-auto grayscale group-hover:grayscale-0 transition duration-500" alt="Gallery"/>
                      <p className="font-mono text-[10px] text-right mt-1 uppercase">Fig. {i+1}</p>
                  </div>
              </div>
          ))}
      </div>
  </section>
);

const BackCover = ({ groom, bride, date }) => (
  <section className="min-h-screen flex flex-col justify-center items-center bg-black text-white text-center p-8 relative overflow-hidden">
      <div className="max-w-2xl z-10 border-4 border-white p-8 md:p-12 relative">
          <Heart size={64} className="mx-auto mb-6 text-red-500 animate-pulse fill-current"/>
          <h2 className="font-display text-6xl md:text-8xl mb-6">THE END</h2>
          <p className="font-serif italic text-2xl mb-8">"Thank you for being part of our story"</p>
          <div className="w-full h-1 bg-white my-8"></div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs uppercase tracking-widest">
              <span>{groom} & {bride}</span>
              <span>est. {new Date(date).getFullYear()}</span>
          </div>
          <div className="mt-12 bg-white text-black p-2 inline-block">
              <div className="h-12 w-48 bg-[url('https://upload.wikimedia.org/wikipedia/commons/5/5d/UPC-A-036000291452.png')] bg-cover"></div>
              <p className="text-[10px] text-center font-mono mt-1">PRICELESS</p>
          </div>
      </div>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
  </section>
);

// --- 3. MAIN COMPONENT ---

export default function RetroMagazineTheme({ 
  groom, 
  bride, 
  date, 
  guestName, 
  data, 
  onRsvpSubmit, 
  submittedData 
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);

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
    <div className="min-h-screen bg-gray-100 font-sans selection:bg-yellow-400 selection:text-black">
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Anton&family=Abril+Fatface&family=Courier+Prime:wght@400;700&display=swap');
            .font-display { font-family: 'Anton', sans-serif; }
            .font-serif { font-family: 'Abril Fatface', serif; }
            .font-mono { font-family: 'Courier Prime', monospace; }
            
            .custom-scroll::-webkit-scrollbar { width: 8px; }
            .custom-scroll::-webkit-scrollbar-track { background: #000; }
            .custom-scroll::-webkit-scrollbar-thumb { background: #fff; border: 2px solid #000; }
        `}</style>

        {/* Music Toggle */}
        <button 
            onClick={toggleAudio}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-black text-white border-2 border-white flex items-center justify-center shadow-[4px_4px_0px_rgba(255,255,255,1)] active:translate-y-1 hover:bg-blue-600 transition"
        >
            {isAudioPlaying ? <Pause size={24}/> : <Play size={24}/>}
        </button>

        {/* Sections (Rendered with Props) */}
        <CoverSection data={data} date={date} groom={groom} bride={bride} guestName={guestName} />
        <StorySection data={data} />
        <ProfileSection data={data} groom={groom} bride={bride} />
        <EventSection data={data} />
        <CountdownSection timeLeft={timeLeft} />
        <LocationSection data={data} />
        <RsvpSection onRsvpSubmit={onRsvpSubmit} submittedData={submittedData} data={data} />
        <GiftSection data={data} />
        <GallerySection data={data} />
        <BackCover groom={groom} bride={bride} date={date} />

        {/* Audio */}
        <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3"} loop />
    </div>
  );
}