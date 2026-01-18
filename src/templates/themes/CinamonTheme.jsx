import { useState, useRef, useEffect } from 'react';
import { 
  Cloud, Heart, MapPin, Calendar, Gift, 
  Music, Play, Pause, Star, Sparkles, Copy, ArrowDown, Quote, MessageSquare, CheckCircle
} from 'lucide-react';

// Props 'submittedData' diterima dari InvitationRender
export default function SoftBlueTheme({ groom, bride, date, guestName, data, onRsvpSubmit, submittedData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Form State
  const [rsvpStatus, setRsvpStatus] = useState('hadir');
  const [rsvpPax, setRsvpPax] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // --- COUNTDOWN & EFFECT LAINNYA ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const photos = {
    cover: data?.cover_photo || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&fit=crop",
    groom: data?.groom_photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&fit=crop",
    bride: data?.bride_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop",
  };
  const gallery = data?.gallery || [];
  const banks = data?.banks || [];
  const quote = data?.quote || "Dan di antara tanda-tanda kekuasaan-Nya...";
  const quoteSrc = data?.quote_src || "QS. Ar-Rum: 21";
  const audioUrl = data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/10/25/audio_1086088e5d.mp3";
  const formattedDate = new Date(date || new Date()).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

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

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!onRsvpSubmit) return alert("Mode Demo");
      setIsSending(true);
      await onRsvpSubmit({ status: rsvpStatus, pax: parseInt(rsvpPax), message: rsvpMessage });
      setIsSending(false);
  };

  const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => { if(audioRef.current) audioRef.current.play().catch(()=>{}); setIsPlaying(true); }, 500);
  };
  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); } else { audioRef.current.play(); setIsPlaying(true); }
  };

  return (
    <div className="bg-gradient-to-b from-[#DFF1FF] to-[#EAF6FF] text-[#5D4037] min-h-screen relative overflow-x-hidden font-sans selection:bg-[#FFD1DC] selection:text-white">

      {/* STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;800&family=Nunito:wght@400;600;700&display=swap');
        .font-cute { font-family: 'Baloo 2', cursive; }
        .font-body { font-family: 'Nunito', sans-serif; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes twinkle { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .cloud-decor { position: absolute; background: white; border-radius: 999px; opacity: 0.6; filter: blur(8px); }
      `}</style>

      {/* BG DECOR */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="cloud-decor w-64 h-32 top-10 -left-10 animate-float"></div>
          <div className="cloud-decor w-80 h-40 bottom-20 -right-20 animate-float"></div>
          <Star className="absolute top-20 right-10 text-yellow-300 w-6 h-6 animate-twinkle opacity-80" fill="currentColor"/>
          <Star className="absolute bottom-40 left-10 text-[#FFD1DC] w-8 h-8 animate-twinkle delay-700 opacity-80" fill="currentColor"/>
      </div>

      {/* OPENING SCREEN */}
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#C7E7FF] transition-all duration-1000 ease-[cubic-bezier(0.7,0,0.3,1)] ${isOpen ? '-translate-y-full rounded-b-[100px]' : 'translate-y-0 rounded-none'}`}>
          <div className="bg-white p-8 rounded-[3rem] shadow-[0_10px_40px_rgba(199,231,255,0.8)] text-center max-w-sm w-full relative animate-float">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2"><Cloud size={48} className="text-white fill-white drop-shadow-md"/></div>
              <p className="font-body text-sm text-[#8D6E63] tracking-widest uppercase mb-4 mt-4">The Wedding Of</p>
              <h1 className="font-cute text-4xl md:text-5xl text-[#5D4037] mb-6 leading-tight">{groom} <br/> <span className="text-[#FFB7B2] text-3xl">&</span> <br/> {bride}</h1>
              <div className="bg-[#FFF4E6] rounded-2xl p-4 mb-8">
                  <p className="font-body text-xs text-[#8D6E63] mb-1">Dear Special Guest,</p>
                  <h3 className="font-cute text-xl text-[#5D4037]">{guestName || "Teman Baik"}</h3>
              </div>
              <button onClick={handleOpen} className="bg-[#81D4FA] text-white font-cute font-bold text-lg py-3 px-10 rounded-full shadow-lg hover:scale-105 hover:bg-[#4FC3F7] transition-all flex items-center justify-center gap-2 mx-auto">Open Invitation <Sparkles size={20}/></button>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={`transition-opacity duration-1000 delay-500 relative z-10 max-w-xl mx-auto px-4 py-8 space-y-12 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

        {/* 1. HERO & QUOTE */}
        <section className="text-center pt-8">
            <div className="relative inline-block mx-auto mb-6">
                <div className="absolute inset-0 bg-[#FFD1DC] rounded-[40px] rotate-3"></div>
                <img src={photos.cover} className="relative w-64 h-80 object-cover rounded-[40px] border-4 border-white shadow-lg -rotate-3" alt="Cover" />
                <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-full shadow-md animate-bounce"><Heart size={24} className="text-[#FF8A80] fill-[#FF8A80]"/></div>
            </div>
            <h2 className="font-cute text-2xl text-[#5D4037] mb-2">We Are Getting Married!</h2>
            
            {/* Quote Section */}
            <div className="mt-6 px-6 relative">
                <Quote size={24} className="text-[#BCAAA4] absolute -top-2 left-4 opacity-50"/>
                <p className="font-body text-[#8D6E63] text-sm italic leading-relaxed px-4">{quote}</p>
                <p className="font-cute text-xs text-[#5D4037] mt-2 font-bold">— {quoteSrc}</p>
            </div>

            <div className="mt-8 flex justify-center"><ArrowDown className="text-[#81D4FA] animate-bounce"/></div>
        </section>

        {/* 2. COUPLE */}
        <section className="bg-white/60 backdrop-blur-sm rounded-[3rem] p-8 shadow-sm">
            <h2 className="font-cute text-3xl text-center mb-8 text-[#5D4037]">The Couple</h2>
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full border-4 border-[#C7E7FF] overflow-hidden shrink-0"><img src={photos.groom} className="w-full h-full object-cover" /></div>
                    <div><h3 className="font-cute text-2xl text-[#5D4037]">{groom}</h3><p className="font-body text-xs text-[#8D6E63] mt-1">Putra Bpk/Ibu <br/> {data?.groom_parents}</p></div>
                </div>
                <div className="flex items-center gap-4 flex-row-reverse text-right">
                    <div className="w-24 h-24 rounded-full border-4 border-[#FFD1DC] overflow-hidden shrink-0"><img src={photos.bride} className="w-full h-full object-cover" /></div>
                    <div><h3 className="font-cute text-2xl text-[#5D4037]">{bride}</h3><p className="font-body text-xs text-[#8D6E63] mt-1">Putri Bpk/Ibu <br/> {data?.bride_parents}</p></div>
                </div>
            </div>
        </section>

        {/* 3. EVENT DETAILS */}
        <section>
            <div className="bg-[#FFF4E6] rounded-[2.5rem] p-8 shadow-sm border-2 border-white relative">
                <Cloud size={60} className="absolute -top-8 -left-4 text-white fill-white drop-shadow-sm opacity-80"/>
                <h2 className="font-cute text-3xl text-center mb-6">Save The Date</h2>
                <div className="flex justify-center mb-6"><span className="bg-[#FFE082] text-[#5D4037] px-4 py-2 rounded-full font-cute text-lg shadow-sm">{formattedDate}</span></div>
                
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                        <div className="bg-[#C7E7FF] p-2 rounded-full text-white"><Sparkles size={18}/></div>
                        <div><h3 className="font-cute text-lg">Akad Nikah</h3><p className="font-body text-sm text-[#8D6E63]">{data?.akad_time}</p></div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                        <div className="bg-[#FFCCBC] p-2 rounded-full text-white"><Sparkles size={18}/></div>
                        <div><h3 className="font-cute text-lg">Resepsi</h3><p className="font-body text-sm text-[#8D6E63]">{data?.resepsi_time}</p></div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="font-body text-sm text-[#8D6E63] mb-3">{data?.venue_name}</p>
                    <a href={data?.maps_link} target="_blank" className="inline-flex items-center gap-2 bg-[#81D4FA] text-white px-6 py-3 rounded-full font-cute shadow-md hover:bg-[#4FC3F7] transition"><MapPin size={18}/> Open Google Maps</a>
                </div>
            </div>
        </section>

        {/* 4. COUNTDOWN */}
        <section className="text-center">
            <h2 className="font-cute text-2xl mb-6 text-[#5D4037]">Counting Down ✨</h2>
            <div className="flex justify-center gap-3">
                <TimeBox val={timeLeft.days} label="Hari" color="bg-[#FFD1DC]" />
                <TimeBox val={timeLeft.hours} label="Jam" color="bg-[#FFF9C4]" />
                <TimeBox val={timeLeft.minutes} label="Mnt" color="bg-[#C7E7FF]" />
                <TimeBox val={timeLeft.seconds} label="Dtk" color="bg-[#E1BEE7]" />
            </div>
        </section>

        {/* --- 5. RSVP & UCAPAN --- */}
        <section className="bg-white rounded-[3rem] p-8 shadow-lg border-t-8 border-[#C7E7FF]">
            <h2 className="font-cute text-3xl text-center mb-6 flex items-center justify-center gap-2">
                <MessageSquare className="text-[#81D4FA]" size={28}/> Ucapan & Doa
            </h2>
            
            <div className="mb-8 border-b pb-8 border-gray-100">
                {/* --- LOGIC KUNCI FORM DI SINI --- */}
                {submittedData ? (
                    <div className="bg-[#F1F8E9] p-6 rounded-3xl border border-[#C5E1A5] text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-[#DCEDC8] rounded-full flex items-center justify-center mx-auto mb-4 text-[#558B2F]">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="font-cute text-xl text-[#33691E] mb-1">Terima Kasih!</h3>
                        <p className="font-body text-sm text-[#558B2F] mb-4">Anda sudah mengisi buku tamu.</p>
                        
                        <div className="bg-white/50 p-4 rounded-xl text-left text-sm space-y-2">
                            <div className="flex justify-between border-b border-[#DCEDC8] pb-2">
                                <span className="text-gray-500">Nama:</span>
                                <span className="font-bold text-[#33691E]">{submittedData.guest_name}</span>
                            </div>
                            <div className="flex justify-between border-b border-[#DCEDC8] pb-2">
                                <span className="text-gray-500">Kehadiran:</span>
                                <span className="font-bold text-[#33691E] capitalize">{submittedData.status.replace('_', ' ')}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block mb-1">Pesan Anda:</span>
                                <p className="italic text-[#33691E]">"{submittedData.message}"</p>
                            </div>
                        </div>
                        {/* TOMBOL EDIT DIHAPUS TOTAL SESUAI REQUEST */}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-cute text-sm text-[#5D4037] ml-2 block mb-1">Nama</label>
                                <input value={guestName} disabled className="w-full bg-gray-100 border-0 rounded-2xl p-3 text-sm text-gray-500 font-bold"/>
                            </div>
                            <div>
                                <label className="font-cute text-sm text-[#5D4037] ml-2 block mb-1">Kehadiran</label>
                                <select value={rsvpStatus} onChange={(e)=>setRsvpStatus(e.target.value)} className="w-full bg-[#F5F5F5] border-0 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-[#81D4FA] outline-none">
                                    <option value="hadir">Hadir</option>
                                    <option value="tidak_hadir">Maaf Tidak Bisa</option>
                                    <option value="ragu">Masih Ragu</option>
                                </select>
                            </div>
                        </div>
                        {rsvpStatus === 'hadir' && (
                            <div>
                                <label className="font-cute text-sm text-[#5D4037] ml-2 block mb-1">Jumlah (Pax)</label>
                                <select value={rsvpPax} onChange={(e)=>setRsvpPax(e.target.value)} className="w-full bg-[#F5F5F5] border-0 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-[#81D4FA] outline-none">
                                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Orang</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="font-cute text-sm text-[#5D4037] ml-2 block mb-1">Pesan untuk Mempelai</label>
                            <textarea required value={rsvpMessage} onChange={(e)=>setRsvpMessage(e.target.value)} className="w-full bg-[#F5F5F5] border-0 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#81D4FA] outline-none h-24 placeholder:text-gray-400" placeholder="Tulis doa restu..."></textarea>
                        </div>
                        <button disabled={isSending} className="w-full bg-[#81D4FA] text-white font-cute font-bold py-3 rounded-2xl shadow-md hover:bg-[#4FC3F7] transition disabled:opacity-50 transform hover:-translate-y-1">
                            {isSending ? 'Mengirim...' : 'Kirim Ucapan'}
                        </button>
                    </form>
                )}
            </div>

            {/* DAFTAR KOMENTAR (DISCORD STYLE) */}
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar mt-8">
                {(data?.rsvps || []).length === 0 ? (
                    <div className="text-center py-8 opacity-50">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300"/>
                        <p className="text-sm italic text-gray-400">Belum ada ucapan. Jadilah yang pertama!</p>
                    </div>
                ) : (
                    (data?.rsvps || []).map((item, idx) => (
                        <div key={idx} className="group animate-fade-in-up">
                            {/* KOMENTAR UTAMA */}
                            <div className="flex gap-4 items-start">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#81D4FA] to-[#29B6F6] flex items-center justify-center shrink-0 text-white font-bold font-cute text-sm shadow-md hover:scale-110 transition cursor-pointer">
                                    {item.guest_name.charAt(0).toUpperCase()}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-[#5D4037] text-sm hover:underline cursor-pointer">
                                            {item.guest_name}
                                        </span>
                                        
                                        {/* Badge Status */}
                                        <span className={`text-[10px] px-1.5 rounded text-white font-bold uppercase tracking-wider ${
                                            item.status === 'hadir' ? 'bg-[#66BB6A]' : 
                                            item.status === 'tidak_hadir' ? 'bg-[#EF5350]' : 'bg-[#FFCA28]'
                                        }`}>
                                            {item.status === 'hadir' ? 'Hadir' : item.status === 'tidak_hadir' ? 'Absen' : 'Ragu'}
                                        </span>

                                        <span className="text-[10px] text-gray-400 ml-auto">
                                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-body">
                                        {item.message}
                                    </p>
                                </div>
                            </div>

                            {/* BALASAN ADMIN (THREAD STYLE) */}
                            {item.reply && (
                                <div className="flex mt-1">
                                    {/* Garis Siku (Thread Line) */}
                                    <div className="w-10 flex justify-end mr-4">
                                        <div className="w-5 h-6 border-l-2 border-b-2 border-gray-300 rounded-bl-xl"></div>
                                    </div>

                                    <div className="flex-1 flex gap-3 items-start pt-2 opacity-90">
                                        {/* Avatar Admin (Kecil) */}
                                        <div className="w-6 h-6 rounded-full bg-[#FFAB91] flex items-center justify-center shrink-0 text-white shadow-sm mt-1">
                                            <Heart size={12} fill="white"/>
                                        </div>
                                        
                                        <div className="flex-1 bg-[#FFF3E0]/50 p-2 rounded-lg -mt-1 hover:bg-[#FFF3E0] transition border border-transparent hover:border-[#FFAB91]/30">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-bold text-[#D84315] text-xs flex items-center gap-1">
                                                    {groom} & {bride} <Sparkles size={10} className="text-yellow-500"/>
                                                </span>
                                                <span className="text-[9px] text-[#D84315]/60 bg-[#FFAB91]/20 px-1 rounded">OWNER</span>
                                            </div>
                                            <p className="text-[#5D4037] text-xs leading-relaxed">
                                                {item.reply}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>

        {/* 6. GIFT (GIFT BOX) */}
        <section className="bg-white rounded-[3rem] p-8 text-center shadow-lg relative mt-12">
            
            {/* Dekorasi Garis Atas (Rounded T disesuaikan manual karena overflow visible) */}
            <div className="absolute top-0 left-0 w-full h-4 bg-[#FFAB91] rounded-t-[3rem]"></div>
            
            {/* Icon Kado - Posisi Absolute di Tengah Garis */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#FFAB91] rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10">
                <Gift size={32} className="text-white"/>
            </div>
            
            {/* Wrapper Konten (Margin Top agar tidak tertutup Icon) */}
            <div className="mt-6">
                <h2 className="font-cute text-2xl mb-2">Wedding Gift</h2>
                <p className="font-body text-xs text-[#8D6E63] mb-6">
                    Your presence is the greatest gift. If you wish to send a token of love:
                </p>

                <div className="space-y-3">
                    {banks.map((bank, i) => (
                        <div key={i} className="bg-[#F5F5F5] rounded-2xl p-4 text-left flex justify-between items-center">
                            <div>
                                <p className="font-cute text-lg text-[#5D4037]">{bank.bank}</p>
                                <p className="font-body text-sm text-[#8D6E63]">{bank.number}</p>
                                <p className="font-body text-xs text-[#BCAAA4] uppercase">a.n {bank.name}</p>
                            </div>
                            <button onClick={() => navigator.clipboard.writeText(bank.number)} className="bg-[#FFCCBC] p-2 rounded-full text-white hover:bg-[#FFAB91] transition">
                                <Copy size={18}/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* 7. GALLERY */}
        {gallery.length > 0 && (
          <section>
              <h2 className="font-cute text-3xl text-center mb-8">Our Moments 📸</h2>
              <div className="grid grid-cols-2 gap-4 px-2">
                  {gallery.map((url, i) => (
                      <div key={i} className={`rounded-3xl overflow-hidden border-4 border-white shadow-md transform transition hover:scale-105 bg-white ${i%2===0 ? 'rotate-2' : '-rotate-2'}`}>
                          <img src={url} className="w-full h-40 object-cover" />
                      </div>
                  ))}
              </div>
          </section>
        )}

        {/* 8. CLOSING */}
        <footer className="text-center py-12 relative">
            <Cloud size={100} className="mx-auto text-white fill-white drop-shadow-sm opacity-60 mb-4 animate-pulse"/>
            <h2 className="font-cute text-3xl text-[#5D4037] relative z-10">{groom} & {bride}</h2>
            <p className="font-body text-sm text-[#8D6E63] relative z-10">Thank you for everything! ❤️</p>
        </footer>

      </div>

      {/* AUDIO BUTTON */}
      <button onClick={toggleAudio} className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#81D4FA] hover:scale-110 transition border-2 border-[#E1F5FE]">
          {isPlaying ? <Music size={20} className="animate-spin"/> : <Play size={20}/>}
      </button>
      <audio ref={audioRef} src={audioUrl} loop />
    </div>
  );
}

// SUB COMPONENT
function TimeBox({ val, label, color }) {
    return (
        <div className={`${color} w-16 h-20 rounded-2xl flex flex-col items-center justify-center shadow-sm transform hover:-translate-y-1 transition`}>
            <span className="font-cute text-2xl text-[#5D4037] leading-none">{val}</span>
            <span className="font-body text-[10px] text-[#8D6E63]">{label}</span>
        </div>
    )
}