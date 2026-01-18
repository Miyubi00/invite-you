import { useState, useRef, useEffect } from 'react';
import { 
  Heart, MapPin, Calendar, Clock, Gift, 
  Music, Play, Pause, Sparkles, Copy, Star, Check, Quote, MessageSquare, Send, CheckCircle2
} from 'lucide-react';

export default function KawaiiPinkTheme({ groom, bride, date, guestName, data, onRsvpSubmit, submittedData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- RSVP STATE ---
  const [rsvpStatus, setRsvpStatus] = useState('hadir');
  const [rsvpPax, setRsvpPax] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- DATA ---
  const photos = {
    cover: data?.cover_photo || "https://images.unsplash.com/photo-1522673607200-1645062cd958?w=800&fit=crop",
    groom: data?.groom_photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&fit=crop",
    bride: data?.bride_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop",
  };

  const gallery = data?.gallery || [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&fit=crop",
    "https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=500&fit=crop",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&fit=crop",
    "https://images.unsplash.com/photo-1511285560982-1356c11d4606?w=500&fit=crop"
  ];

  const banks = data?.banks || [];
  const quote = data?.quote || "Love is cute when it's new, but love is most beautiful when it lasts.";
  const quoteSrc = data?.quote_src || "Unknown";
  const audioUrl = data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3";

  const formattedDate = new Date(date || new Date()).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

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

  const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => {
          if(audioRef.current) audioRef.current.play().catch(()=>{});
          setIsPlaying(true);
      }, 500);
  };

  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onRsvpSubmit) return alert("Mode Demo: RSVP tidak disimpan.");
    setIsSending(true);
    await onRsvpSubmit({ status: rsvpStatus, pax: parseInt(rsvpPax), message: rsvpMessage });
    setIsSending(false);
  };

  return (
    // CONTAINER: Cream White & Cinnamon Text
    <div className="bg-[#FFF7FB] text-[#8D6E63] min-h-screen relative overflow-x-hidden font-sans selection:bg-[#FFB6D5] selection:text-white">

      {/* --- STYLES & ASSETS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;800&display=swap');
        
        .font-kawaii { font-family: 'Baloo 2', cursive; }
        .font-body { font-family: 'Nunito', sans-serif; }
        
        .bg-polka {
            background-image: radial-gradient(#FFD6E8 20%, transparent 20%), radial-gradient(#FFD6E8 20%, transparent 20%);
            background-color: #FFF7FB;
            background-position: 0 0, 10px 10px;
            background-size: 20px 20px;
            opacity: 0.6;
        }

        /* Animations */
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-float { animation: bounce-slow 3s ease-in-out infinite; }
        
        @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .animate-pop { animation: pop 1s ease-in-out infinite; }

        /* Custom Scrollbar */
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: #FFF0F5; }
        .chat-scroll::-webkit-scrollbar-thumb { background-color: #FFB6D5; border-radius: 20px; }
      `}</style>

      {/* --- BACKGROUND DECOR --- */}
      <div className="fixed inset-0 bg-polka pointer-events-none z-0"></div>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <Heart className="absolute top-10 left-10 text-[#FFB6D5] w-8 h-8 animate-float opacity-70" fill="currentColor"/>
          <Star className="absolute bottom-20 right-10 text-[#FACC15] w-6 h-6 animate-spin-slow opacity-70" fill="currentColor"/>
          <Heart className="absolute top-1/2 right-4 text-[#FFD6E8] w-12 h-12 animate-float delay-100 opacity-50" fill="currentColor"/>
      </div>

      {/* --- OPENING SCREEN --- */}
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#FFD6E8] transition-all duration-1000 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] ${isOpen ? '-translate-y-full rounded-b-[50px]' : 'translate-y-0 rounded-none'}`}>
          <div className="bg-white p-8 rounded-[40px] shadow-[0_10px_0_rgba(255,182,213,0.5)] text-center max-w-sm w-full relative border-4 border-white">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20"><KawaiiBow className="text-[#FF6F91] w-full drop-shadow-md"/></div>
              <div className="mt-8 mb-6"><div className="w-32 h-32 mx-auto rounded-full border-4 border-[#FFB6D5] p-1 bg-white overflow-hidden shadow-sm"><img src={photos.cover} className="w-full h-full object-cover rounded-full" /></div></div>
              <h1 className="font-kawaii text-3xl text-[#5D4037] mb-2 leading-none">{groom} <span className="text-[#FF6F91]">&</span> {bride}</h1>
              <p className="font-body text-[#8D6E63] text-sm bg-[#FFF7FB] inline-block px-4 py-1 rounded-full mb-8">We’re getting married! 💕</p>
              <div className="mb-8 border-t-2 border-dashed border-[#FFD6E8] pt-4"><p className="font-body text-xs text-[#FF6F91] font-bold mb-1">SPECIAL INVITATION FOR</p><h3 className="font-kawaii text-xl text-[#5D4037]">{guestName || "Lovely Guest"}</h3></div>
              <button onClick={handleOpen} className="w-full bg-[#FFB6D5] hover:bg-[#FF6F91] text-white font-kawaii font-bold text-lg py-3 rounded-2xl shadow-[0_4px_0_rgba(255,111,145,0.4)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"><Gift size={20} /> Open Invitation</button>
          </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className={`transition-opacity duration-1000 delay-500 relative z-10 max-w-md mx-auto px-4 py-8 space-y-10 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

        {/* 1. COUPLE SECTION */}
        <section className="bg-white/80 backdrop-blur-sm rounded-[30px] p-6 shadow-sm border-2 border-white text-center">
            <h2 className="font-kawaii text-3xl text-[#5D4037] mb-6">The Happy Couple</h2>
            
            <div className="space-y-8">
                {/* Groom */}
                <div>
                    {/* Wrapper khusus Gambar & Badge agar posisi akurat */}
                    <div className="relative inline-block">
                        <div className="w-24 h-24 mx-auto rounded-full border-[5px] border-[#C7E7FF] overflow-hidden shadow-sm">
                            <img src={photos.groom} className="w-full h-full object-cover" />
                        </div>
                        {/* Badge menempel pada wrapper gambar */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#C7E7FF] text-[#5D4037] px-3 py-0.5 rounded-full text-xs font-bold font-kawaii shadow-sm whitespace-nowrap">
                            GROOM
                        </div>
                    </div>
                    
                    {/* Teks Nama & Ortu (Diberi margin atas agar tidak ketabrak badge) */}
                    <h3 className="font-kawaii text-2xl text-[#5D4037] mt-5">{groom}</h3>
                    <p className="font-body text-xs text-[#8D6E63] mt-1 px-4">Putra dari {data?.groom_parents}</p>
                </div>

                {/* Heart Divider */}
                <div className="flex justify-center">
                    <Heart className="text-[#FF6F91] animate-pop fill-[#FF6F91]" size={24}/>
                </div>

                {/* Bride */}
                <div>
                    <div className="relative inline-block">
                        <div className="w-24 h-24 mx-auto rounded-full border-[5px] border-[#FFB6D5] overflow-hidden shadow-sm">
                            <img src={photos.bride} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#FFB6D5] text-white px-3 py-0.5 rounded-full text-xs font-bold font-kawaii shadow-sm whitespace-nowrap">
                            BRIDE
                        </div>
                    </div>
                    
                    <h3 className="font-kawaii text-2xl text-[#5D4037] mt-5">{bride}</h3>
                    <p className="font-body text-xs text-[#8D6E63] mt-1 px-4">Putri dari {data?.bride_parents}</p>
                </div>
            </div>
        </section>

        {/* 2. QUOTE (Bubble Style) */}
        <section className="px-2">
            <div className="bg-[#FFF9C4] p-6 rounded-[30px] rounded-tl-none relative shadow-sm border-2 border-white">
                <Quote className="text-[#FBC02D] w-8 h-8 mb-2 opacity-50"/>
                <p className="font-kawaii text-lg text-[#F57F17] leading-relaxed text-center italic">"{quote}"</p>
                <p className="font-body text-xs font-bold text-[#F9A825] text-right mt-3 uppercase">— {quoteSrc}</p>
                <div className="absolute -left-2 top-0 w-4 h-4 bg-[#FFF9C4] transform rotate-45 border-l-2 border-b-2 border-white"></div>
            </div>
        </section>

        {/* 3. EVENT DETAILS */}
        <section className="relative">
            <div className="absolute -top-4 -right-2 transform rotate-12"><KawaiiBow className="text-[#FFB6D5] w-12"/></div>
            <div className="bg-[#FFF4E6] rounded-[30px] p-6 shadow-sm border-2 border-white">
                <h2 className="font-kawaii text-2xl text-center text-[#5D4037] mb-6">Save The Date! 📅</h2>
                <div className="space-y-4">
                    {/* Akad */}
                    <div className="bg-white p-4 rounded-2xl flex items-center gap-3 shadow-[0_2px_0_#FFE0B2]">
                        <div className="bg-[#FFCCBC] w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"><Heart size={18} fill="white"/></div>
                        <div><h3 className="font-kawaii text-lg text-[#5D4037] leading-none">Ceremony</h3><p className="font-body text-xs text-[#8D6E63] mt-1 flex items-center gap-1"><Clock size={12}/> {formattedDate} • {data?.akad_time}</p></div>
                    </div>
                    {/* Resepsi */}
                    <div className="bg-white p-4 rounded-2xl flex items-center gap-3 shadow-[0_2px_0_#FFE0B2]">
                        <div className="bg-[#F8BBD0] w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"><Sparkles size={18} fill="white"/></div>
                        <div><h3 className="font-kawaii text-lg text-[#5D4037] leading-none">Reception</h3><p className="font-body text-xs text-[#8D6E63] mt-1 flex items-center gap-1"><Clock size={12}/> {formattedDate} • {data?.resepsi_time}</p></div>
                    </div>
                </div>
                {/* Location */}
                <div className="mt-6 bg-[#FFD6E8] p-4 rounded-[20px] rounded-tl-none text-center relative">
                    <p className="font-kawaii text-lg text-[#880E4F] mb-1">{data?.venue_name}</p>
                    <p className="font-body text-xs text-[#880E4F]/80 mb-3">{data?.venue_address}</p>
                    <a href={data?.maps_link} target="_blank" className="inline-block bg-white text-[#FF6F91] px-6 py-2 rounded-full font-kawaii text-sm font-bold shadow-sm hover:scale-105 transition">Open Map 📍</a>
                </div>
            </div>
        </section>

        {/* 4. COUNTDOWN */}
        <section className="text-center">
            <div className="bg-[#E1F5FE] inline-block px-6 py-2 rounded-full mb-6 border-2 border-white shadow-sm">
                <h2 className="font-kawaii text-xl text-[#0277BD]">Counting Down! ⏳</h2>
            </div>
            <div className="grid grid-cols-4 gap-2">
                <TimeBox val={timeLeft.days} label="Days" color="bg-[#FFCDD2] text-[#C62828]" />
                <TimeBox val={timeLeft.hours} label="Hrs" color="bg-[#FFF9C4] text-[#F9A825]" />
                <TimeBox val={timeLeft.minutes} label="Min" color="bg-[#C8E6C9] text-[#2E7D32]" />
                <TimeBox val={timeLeft.seconds} label="Sec" color="bg-[#E1BEE7] text-[#6A1B9A]" />
            </div>
        </section>

        {/* 5. GALLERY */}
        {gallery.length > 0 && (
          <section>
              <h2 className="font-kawaii text-2xl text-center text-[#5D4037] mb-6">Sweet Memories 📸</h2>
              <div className="grid grid-cols-2 gap-4">
                  {gallery.map((url, i) => (
                      <div key={i} className={`bg-white p-2 pb-6 shadow-md rounded-lg transform transition hover:scale-105 hover:z-10 ${i%2===0 ? 'rotate-2' : '-rotate-2'}`}>
                          <img src={url} className="w-full h-32 object-cover rounded-md bg-gray-100" />
                          <div className="mt-2 text-center"><Heart size={12} className="inline text-[#FFB6D5] fill-[#FFB6D5]"/></div>
                      </div>
                  ))}
              </div>
          </section>
        )}

        {/* 6. RSVP (Kawaii Chat Style) */}
        <section className="bg-white rounded-[30px] p-6 shadow-md border-b-4 border-[#FFCCBC]">
            <div className="flex items-center justify-center gap-2 mb-6 text-[#FF7043]">
                <MessageSquare size={24} fill="#FFCCBC" />
                <h2 className="font-kawaii text-2xl text-[#BF360C]">Kirim Ucapan</h2>
            </div>

            {submittedData ? (
                <div className="text-center bg-[#FBE9E7] p-6 rounded-2xl border-2 border-dashed border-[#FFAB91]">
                    <CheckCircle2 size={40} className="text-[#FF7043] mx-auto mb-2" />
                    <h3 className="font-kawaii text-xl text-[#D84315]">Arigatou! 💖</h3>
                    <p className="font-body text-xs text-[#A1887F] mb-4">Pesanmu sudah kami terima.</p>
                    <div className="bg-white p-3 rounded-xl text-left border border-[#FFCCBC]">
                        <p className="font-body text-xs text-[#5D4037] italic">"{submittedData.message}"</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <input value={guestName} disabled className="w-full bg-[#FFF3E0] text-[#5D4037] font-kawaii text-sm p-3 rounded-xl border-2 border-transparent focus:border-[#FFCCBC] outline-none text-center" />
                        <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value)} className="w-full bg-[#FFF3E0] text-[#5D4037] font-kawaii text-sm p-3 rounded-xl border-2 border-transparent focus:border-[#FFCCBC] outline-none text-center appearance-none">
                            <option value="hadir">Hadir (Yes!)</option>
                            <option value="tidak_hadir">Maaf (No..)</option>
                            <option value="ragu">Ragu (Hmm..)</option>
                        </select>
                    </div>
                    {rsvpStatus === 'hadir' && (
                        <select value={rsvpPax} onChange={(e) => setRsvpPax(e.target.value)} className="w-full bg-[#FFF3E0] text-[#5D4037] font-kawaii text-sm p-3 rounded-xl border-2 border-transparent focus:border-[#FFCCBC] outline-none text-center appearance-none">
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Orang</option>)}
                        </select>
                    )}
                    <textarea required value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} className="w-full bg-[#FFF3E0] text-[#5D4037] font-body text-sm p-4 rounded-xl border-2 border-transparent focus:border-[#FFCCBC] outline-none h-24 resize-none" placeholder="Tulis doa yang manis disini..." />
                    <button disabled={isSending} className="w-full bg-[#FF7043] hover:bg-[#F4511E] text-white font-kawaii font-bold py-3 rounded-xl shadow-[0_4px_0_#BF360C] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2">
                        {isSending ? 'Sending...' : <><Send size={18}/> Kirim Pesan</>}
                    </button>
                </form>
            )}

            {/* Kawaii Comments Feed */}
            <div className="mt-8 pt-4 border-t-2 border-dashed border-[#FFE0B2]">
                <p className="font-kawaii text-sm text-[#FF8A65] mb-3 text-center">💌 Pesan Teman-Teman</p>
                <div className="space-y-3 max-h-[250px] overflow-y-auto chat-scroll pr-1">
                    {(data?.rsvps || []).length === 0 ? (
                        <p className="text-center font-body text-xs text-[#BCAAA4] py-2">Belum ada pesan nih :(</p>
                    ) : (
                        (data?.rsvps || []).map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                                <div className="w-8 h-8 rounded-full bg-[#FFE0B2] flex items-center justify-center text-[#E65100] font-kawaii text-xs border border-white shadow-sm shrink-0">
                                    {item.guest_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 bg-[#FFF3E0] p-3 rounded-xl rounded-tl-none border border-[#FFE0B2] relative">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-kawaii text-xs text-[#E65100]">{item.guest_name}</span>
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold text-white ${item.status === 'hadir' ? 'bg-[#81C784]' : item.status === 'tidak_hadir' ? 'bg-[#E57373]' : 'bg-[#FFD54F]'}`}>
                                            {item.status === 'hadir' ? 'YES' : item.status === 'tidak_hadir' ? 'NO' : 'MAYBE'}
                                        </span>
                                    </div>
                                    <p className="font-body text-xs text-[#5D4037] leading-tight">{item.message}</p>
                                    {item.reply && (
                                        <div className="mt-2 pl-2 border-l-2 border-[#FFCCBC]">
                                            <p className="font-kawaii text-[10px] text-[#FF7043]">Reply:</p>
                                            <p className="font-body text-[10px] text-[#8D6E63]">{item.reply}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>

        {/* 7. GIFT SECTION */}
        <section className="bg-white rounded-[30px] p-6 shadow-md border-b-4 border-[#FFD6E8] text-center">
            <div className="w-16 h-16 bg-[#FFF9C4] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm"><Gift size={32} className="text-[#FBC02D]"/></div>
            <h2 className="font-kawaii text-2xl text-[#5D4037] mb-2">Wedding Gift</h2>
            <div className="space-y-3">
                {banks.map((bank, i) => (
                    <div key={i} className="bg-[#F3E5F5] rounded-xl p-3 flex justify-between items-center border border-white">
                        <div className="text-left"><p className="font-kawaii text-lg text-[#6A1B9A]">{bank.bank}</p><p className="font-body text-sm text-[#4A148C]">{bank.number}</p><p className="font-body text-[10px] text-[#8D6E63]">a.n {bank.name}</p></div>
                        <button onClick={() => navigator.clipboard.writeText(bank.number)} className="bg-white text-[#AB47BC] p-2 rounded-lg shadow-sm hover:bg-[#E1BEE7] transition"><Copy size={16}/></button>
                    </div>
                ))}
            </div>
        </section>

        {/* 8. CLOSING */}
        <footer className="text-center py-10 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"><Heart size={60} className="text-[#FFCDD2] fill-[#FFCDD2] animate-pop"/></div>
            <h2 className="font-kawaii text-2xl text-[#5D4037] mt-4">{groom} & {bride}</h2>
            <p className="font-body text-sm text-[#8D6E63]">Thank you so much! 🎀</p>
        </footer>

      </div>

      {/* AUDIO BUTTON */}
      <button onClick={toggleAudio} className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-[#FFB6D5] rounded-full shadow-[0_4px_0_#F06292] flex items-center justify-center text-white hover:scale-110 active:translate-y-[4px] active:shadow-none transition-all border-2 border-white">
          {isPlaying ? <Music size={20} className="animate-spin-slow"/> : <Play size={20}/>}
      </button>
      <audio ref={audioRef} src={audioUrl} loop />
    </div>
  );
}

// --- SUB COMPONENTS ---
function TimeBox({ val, label, color }) {
    return (
        <div className={`${color} rounded-2xl p-2 shadow-[0_3px_0_rgba(0,0,0,0.1)] flex flex-col items-center justify-center aspect-square`}>
            <span className="font-kawaii text-2xl leading-none">{val}</span>
            <span className="font-body text-[10px] opacity-80">{label}</span>
        </div>
    )
}

function KawaiiBow(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14Z" opacity="0.5"/>
            <path d="M12.5 8C14.5 5 18 5 19 7C20 9 17 11 15.5 11C18 11 21 12 20 14C19 16 15 15 13 13L16 18H14L12 14L10 18H8L11 13C9 15 5 16 4 14C3 12 6 11 8.5 11C7 11 4 9 5 7C6 5 9.5 5 11.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}