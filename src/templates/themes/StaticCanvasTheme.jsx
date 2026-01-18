import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, MapPin, Calendar, 
  Gift, Music, Play, Pause, Send, Heart, User, CheckCircle2, MessageSquare
} from 'lucide-react';

export default function ChatBubbleTheme({ groom, bride, date, guestName, data, onRsvpSubmit, submittedData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null); 
  const [isTyping, setIsTyping] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioUrl = data?.audio_url || '';


  // RSVP Form State (Local)
  const [rsvpStep, setRsvpStep] = useState(0); // 0: Idle, 1: Form, 2: Done
  const [rsvpData, setRsvpData] = useState({ status: 'hadir', pax: 1, message: '' });
  const [isSending, setIsSending] = useState(false);

  // --- DATA ---
  const photos = {
    groom: data?.groom_photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&fit=crop",
    bride: data?.bride_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop",
    bg: data?.cover_photo || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&fit=crop"
  };

  const formattedDate = new Date(date || new Date()).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // --- DAFTAR PERTANYAAN (BUBBLES) ---
  const questions = [
    { id: 'date', text: "Kapan nikahnya? 📅", color: "bg-blue-600", position: "top-[10%] left-[5%]", anim: "animate-drift-1" },
    { id: 'location', text: "Lokasi dimana? 📍", color: "bg-emerald-600", position: "top-[20%] right-[5%]", anim: "animate-drift-2" },
    { id: 'couple', text: "Siapa pasangannya? 💑", color: "bg-rose-500", position: "bottom-[30%] left-[10%]", anim: "animate-drift-3" },
    { id: 'gift', text: "Kirim kado 🎁", color: "bg-violet-600", position: "bottom-[15%] right-[5%]", anim: "animate-drift-2" },
    { id: 'gallery', text: "Lihat foto dong 📸", color: "bg-amber-600", position: "top-[50%] left-[50%] -translate-x-1/2", anim: "animate-drift-1" },
    { id: 'rsvp', text: "RSVP & Ucapan 💌", color: "bg-pink-600", position: "bottom-[10%] left-[50%] -translate-x-1/2", anim: "animate-bounce-slow" },
  ];

  // --- LOGIC ---
  const handleBubbleClick = (id) => {
    setActiveChat(id);
    setIsTyping(true);
    setShowAnswer(false);
    setRsvpStep(0); // Reset RSVP form
    
    setTimeout(() => {
        setIsTyping(false);
        setShowAnswer(true);
    }, 1200);
  };

  const closeChat = () => {
      setActiveChat(null);
      setIsTyping(false);
      setShowAnswer(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
        if(audioRef.current) audioRef.current.play().catch(() => {});
        setIsPlaying(true);
    }, 800);
  };

  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  // RSVP Handler (Inside Chat)
  const handleSendRsvp = async () => {
      if(!onRsvpSubmit) return alert("Demo Mode");
      setIsSending(true);
      await onRsvpSubmit(rsvpData);
      setIsSending(false);
      setRsvpStep(2); // Show Success Message
  };

  return (
    <div className="bg-[#E5E5E5] min-h-screen relative overflow-hidden font-sans select-none">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        @keyframes drift1 { 0% { transform: translate(0, 0); } 50% { transform: translate(0, 40px); } 100% { transform: translate(0, 0); } }
        @keyframes drift2 { 0% { transform: translate(0, 0); } 50% { transform: translate(30px, -20px); } 100% { transform: translate(0, 0); } }
        @keyframes drift3 { 0% { transform: translate(0, 0); } 50% { transform: translate(-30px, 30px); } 100% { transform: translate(0, 0); } }

        .animate-drift-1 { animation: drift1 8s ease-in-out infinite; }
        .animate-drift-2 { animation: drift2 10s ease-in-out infinite; }
        .animate-drift-3 { animation: drift3 9s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce 3s infinite; }

        @keyframes popIn { 
            0% { opacity: 0; transform: scale(0.9); } 
            100% { opacity: 1; transform: scale(1); } 
        }
        .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes blink { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }
        .typing-dot span { animation: blink 1.4s infinite both; }
        .typing-dot span:nth-child(2) { animation-delay: .2s; }
        .typing-dot span:nth-child(3) { animation-delay: .4s; }
        
        /* Custom Scrollbar */
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}</style>

      {/* --- LOCK SCREEN --- */}
      <div className={`fixed inset-0 z-50 bg-gradient-to-br from-[#2c2e3e] to-[#4a3b45] backdrop-blur-md flex flex-col items-center justify-center text-white transition-transform duration-700 ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-[bounce_2s_infinite]">
              <MessageCircle size={48} className="text-rose-300" />
          </div>
          <p className="text-gray-300 text-sm mb-2 tracking-widest uppercase">Incoming Message</p>
          <h1 className="text-4xl font-bold mb-10 text-rose-100 drop-shadow-md">{groom} & {bride}</h1>
          <div onClick={handleOpen} className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl w-80 cursor-pointer hover:bg-white/20 transition border border-white/20 flex items-center gap-4 shadow-lg active:scale-95 transform duration-200">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-rose-300"><img src={photos.groom} className="w-full h-full object-cover"/></div>
              <div className="flex-1 text-left">
                  <div className="flex justify-between items-center mb-1"><span className="font-bold text-sm text-white">{groom}</span><span className="text-[10px] text-gray-300">Now</span></div>
                  <p className="text-xs text-gray-200">Mengundang Anda ke pernikahan kami... 💌</p>
              </div>
          </div>
          <p className="mt-8 text-xs text-gray-400 animate-pulse">Ketuk notifikasi di atas untuk membuka</p>
      </div>

      {/* --- MAIN SCREEN --- */}
      <div className={`relative w-full h-screen transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 z-0"><img src={photos.bg} className="w-full h-full object-cover opacity-30 filter blur-sm" alt="bg"/><div className="absolute inset-0 bg-[#E5E5E5]/80"></div></div>

          <div className="absolute top-0 left-0 w-full p-6 text-center z-10">
              <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Wedding Invitation</p>
              <h1 className="text-3xl font-bold text-gray-800">{groom} & {bride}</h1>
              <p className="text-gray-400 text-xs mt-2">Ketuk bubble untuk ngobrol 👇</p>
          </div>

          {questions.map((q, i) => (
              <button key={q.id} onClick={() => handleBubbleClick(q.id)} className={`absolute z-20 px-5 py-3 rounded-full shadow-lg text-white font-semibold text-sm transform transition hover:scale-110 active:scale-95 flex items-center gap-2 ${q.color} ${q.position} ${q.anim}`} style={{ animationDelay: `${i * 0.8}s` }}>{q.text}</button>
          ))}

          {/* --- CHAT POPUP (CENTERED BOX) --- */}
          {activeChat && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
                  <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-pop-in relative">
                      
                      {/* Header Chat */}
                      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-white shrink-0">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200"><img src={photos.bride} className="w-full h-full object-cover" alt="Avatar"/></div>
                              <div>
                                  <h3 className="font-bold text-sm text-gray-800">{bride} & {groom}</h3>
                                  <p className="text-xs text-green-500 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Online</p>
                              </div>
                          </div>
                          <button onClick={closeChat} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-500 transition"><X size={20}/></button>
                      </div>

                      {/* Chat Body (Scrollable) */}
                      <div className="p-4 overflow-y-auto bg-[#F0F2F5] flex-1 flex flex-col gap-4 chat-scroll">
                          
                          {/* User Question Bubble */}
                          <div className="self-end max-w-[85%]">
                              <div className={`p-3 rounded-2xl rounded-tr-none text-white text-sm shadow-sm ${questions.find(q => q.id === activeChat)?.color || 'bg-blue-500'}`}>{questions.find(q => q.id === activeChat)?.text}</div>
                              <span className="text-[10px] text-gray-400 float-right mt-1">Read</span>
                          </div>

                          {/* Bot Typing Indicator */}
                          {isTyping && (
                              <div className="self-start bg-white p-3 rounded-2xl rounded-tl-none shadow-sm w-16">
                                  <div className="typing-dot flex gap-1 justify-center"><span className="w-2 h-2 bg-gray-400 rounded-full"></span><span className="w-2 h-2 bg-gray-400 rounded-full"></span><span className="w-2 h-2 bg-gray-400 rounded-full"></span></div>
                              </div>
                          )}

                          {/* Bot Answer */}
                          {showAnswer && (
                              <div className="self-start max-w-[95%] w-full animate-fade-in-up space-y-1">
                                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-gray-800 text-sm border border-gray-100">
                                      <AnswerContent 
                                          id={activeChat} 
                                          data={data} 
                                          groom={groom} 
                                          bride={bride} 
                                          date={formattedDate}
                                          // RSVP Props
                                          submittedData={submittedData}
                                          rsvpStep={rsvpStep}
                                          setRsvpStep={setRsvpStep}
                                          rsvpData={rsvpData}
                                          setRsvpData={setRsvpData}
                                          handleSendRsvp={handleSendRsvp}
                                          isSending={isSending}
                                      />
                                  </div>
                                  <span className="text-[10px] text-gray-400 ml-2">Just now</span>
                              </div>
                          )}
                      </div>

                      {/* Fake Input Area */}
                      <div className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white shrink-0">
                          <div className="flex-1 bg-gray-100 h-10 rounded-full px-4 flex items-center text-gray-400 text-sm">Balas pesan...</div>
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white"><Send size={18} /></div>
                      </div>
                  </div>
              </div>
          )}

          <button onClick={toggleAudio} className="fixed top-6 right-6 z-40 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-green-600 hover:scale-110 transition">
              {isPlaying ? <Music size={18} className="animate-spin"/> : <Play size={18}/>}
          </button>
      </div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} loop />}
    </div>
  );
}

// --- DYNAMIC CONTENT RENDERER ---
function AnswerContent({ id, data, groom, bride, date, submittedData, rsvpStep, setRsvpStep, rsvpData, setRsvpData, handleSendRsvp, isSending }) {
    if (id === 'date') {
        return <div className="space-y-2"><p>Insya Allah acara kami akan dilaksanakan pada:</p><div className="font-bold text-blue-600 flex items-center gap-2 text-lg"><Calendar size={18}/> {date}</div><p>Akad pukul <strong>{data?.akad_time}</strong> dilanjutkan Resepsi pukul <strong>{data?.resepsi_time}</strong>. Jangan telat ya! 😉</p></div>;
    }
    if (id === 'location') {
        return <div className="space-y-3"><p>Acaranya bertempat di:</p><div className="bg-gray-50 p-3 rounded-lg border border-gray-200"><strong className="block text-gray-800">{data?.venue_name}</strong><span className="text-xs text-gray-500">{data?.venue_address}</span></div><a href={data?.maps_link} target="_blank" className="inline-flex items-center gap-1 text-blue-500 font-bold hover:underline"><MapPin size={14}/> Buka Google Maps</a></div>;
    }
    if (id === 'couple') {
        return <div className="text-center"><p className="mb-3">Mohon doa restunya untuk kami:</p><div className="flex justify-center gap-4 mb-2"><div><div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-1 overflow-hidden"><img src={data?.groom_photo} className="w-full h-full object-cover"/></div><p className="font-bold text-xs">{groom}</p></div><Heart className="text-red-500 mt-3 animate-pulse" size={20} fill="red"/><div><div className="w-12 h-12 bg-pink-100 rounded-full mx-auto mb-1 overflow-hidden"><img src={data?.bride_photo} className="w-full h-full object-cover"/></div><p className="font-bold text-xs">{bride}</p></div></div><p className="text-xs text-gray-500">Putra-putri bapak/ibu {data?.groom_parents} & {data?.bride_parents}</p></div>;
    }
    if (id === 'gift') {
        return <div><p className="mb-3">Wah, makasih banget lho! Kehadiranmu aja udah kado terindah buat kami. 🥰</p><p className="text-xs mb-2">Tapi kalau mau kirim tanda kasih, bisa kesini ya:</p><div className="space-y-2">{data?.banks.map((bank, i) => (<div key={i} className="bg-gray-50 p-2 rounded border border-gray-200 flex justify-between items-center"><div><span className="font-bold text-xs block">{bank.bank}</span><span className="text-xs text-gray-500">{bank.number}</span></div><button onClick={() => navigator.clipboard.writeText(bank.number)} className="text-blue-500 text-xs font-bold">Salin</button></div>))}</div></div>;
    }
    if (id === 'gallery') {
        return <div className="space-y-2"><p>Ini beberapa momen keseruan kami prewedding kemarin! 📸</p><div className="grid grid-cols-2 gap-2 mt-2">{data?.gallery.slice(0, 4).map((img, i) => (<img key={i} src={img} className="w-full h-24 object-cover rounded-lg" />))}</div></div>;
    }
    
    // --- RSVP LOGIC (CHAT FORM + COMMENTS FEED) ---
    if (id === 'rsvp') {
        return (
            <div className="space-y-4">
                {/* 1. Status Form / Konfirmasi */}
                {(submittedData || rsvpStep === 2) ? (
                    <div className="text-center bg-green-50 p-3 rounded-lg border border-green-100">
                        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2"/>
                        <p className="font-bold text-gray-800 text-sm">Konfirmasi Terkirim!</p>
                        <p className="text-xs text-gray-500">Terima kasih atas doanya.</p>
                        <div className="mt-2 text-left bg-white p-2 rounded border border-green-200 text-xs italic text-gray-600">
                            "{submittedData?.message || rsvpData.message}"
                        </div>
                    </div>
                ) : (
                    <div>
                        {rsvpStep === 0 && (
                            <div className="space-y-3">
                                <p>Halo! Apakah kamu berencana hadir di acara kami? 😊</p>
                                <div className="flex gap-2">
                                    <button onClick={() => { setRsvpData({...rsvpData, status: 'hadir'}); setRsvpStep(1); }} className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg font-bold text-xs hover:bg-blue-200 transition">Ya, Hadir! 🙋‍♂️</button>
                                    <button onClick={() => { setRsvpData({...rsvpData, status: 'tidak_hadir'}); setRsvpStep(1); }} className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold text-xs hover:bg-red-200 transition">Maaf, Tidak 🙅‍♂️</button>
                                </div>
                            </div>
                        )}

                        {rsvpStep === 1 && (
                            <div className="space-y-3 animate-fade-in-up">
                                <p>Baik, {rsvpData.status === 'hadir' ? 'kamu mau datang berapa orang?' : 'yah sayang sekali. Ada pesan untuk kami?'} 👇</p>
                                <div className="space-y-2">
                                    {rsvpData.status === 'hadir' && (
                                        <select 
                                            value={rsvpData.pax} 
                                            onChange={(e) => setRsvpData({...rsvpData, pax: e.target.value})}
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400"
                                        >
                                            <option value="1">Sendirian aja (1 Orang)</option>
                                            <option value="2">Berdua (2 Orang)</option>
                                            <option value="3">Bertiga (3 Orang)</option>
                                        </select>
                                    )}
                                    <textarea 
                                        value={rsvpData.message}
                                        onChange={(e) => setRsvpData({...rsvpData, message: e.target.value})}
                                        placeholder="Tulis ucapan selamat..."
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400 h-20 resize-none"
                                    ></textarea>
                                </div>
                                <button 
                                    onClick={handleSendRsvp} 
                                    disabled={isSending}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSending ? 'Mengirim...' : <><Send size={14}/> Kirim Jawaban</>}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. COMMENTS FEED (DAFTAR UCAPAN) */}
                <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1">
                        <MessageSquare size={12}/> UCAPAN TEMAN-TEMAN
                    </p>
                    
                    <div className="space-y-3 max-h-[180px] overflow-y-auto chat-scroll pr-1">
                        {(data?.rsvps || []).length === 0 ? (
                            <p className="text-center text-xs text-gray-400 italic py-2">Belum ada ucapan nih. Yuk jadi yang pertama!</p>
                        ) : (
                            (data?.rsvps || []).map((item, idx) => (
                                <div key={idx} className="bg-gray-50 p-2.5 rounded-lg text-xs border border-gray-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-blue-600 truncate max-w-[120px]">{item.guest_name}</span>
                                        <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase text-white ${item.status === 'hadir' ? 'bg-green-400' : item.status === 'tidak_hadir' ? 'bg-red-400' : 'bg-yellow-400'}`}>
                                            {item.status === 'hadir' ? 'Hadir' : item.status === 'tidak_hadir' ? 'Absen' : 'Ragu'}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 leading-snug">"{item.message}"</p>
                                    {item.reply && (
                                        <div className="mt-2 pl-2 border-l-2 border-pink-200">
                                            <p className="text-[10px] text-pink-500 font-bold">Mempelai:</p>
                                            <p className="text-gray-500 italic">{item.reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return <p>Halo! Ada yang bisa kami bantu? 😊</p>;
}