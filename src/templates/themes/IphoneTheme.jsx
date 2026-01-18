import { useState, useRef, useEffect } from 'react';
import {
    MapPin, Calendar, Clock, Copy, Music, Heart,
    ChevronRight, Play, Pause, Gift, Navigation, Send, CheckCircle2,
    Quote, MessageSquare, Sparkles
} from 'lucide-react';

export default function IosGlassTheme({ groom, bride, date, guestName, data, onRsvpSubmit, submittedData }) {
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

    // --- DATA HANDLING ---
    const defaultImages = {
        cover: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop",
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
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&fit=crop",
        "https://images.unsplash.com/photo-1522673607200-1645062cd958?w=500&fit=crop"
    ];
    const banks = data?.banks || [];
    const quote = data?.quote || "Dan di antara tanda-tanda kekuasaan-Nya...";
    const quoteSrc = data?.quote_src || "QS. Ar-Rum: 21";
    const audioUrl = data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/02/07/audio_1808fbf07a.mp3";

    const formattedDate = new Date(date || new Date()).toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    // --- COUNTDOWN LOGIC ---
    useEffect(() => {
        const targetDateStr = new Date(date || new Date()).toISOString().split('T')[0];
        const targetTimeStr = (data?.akad_time || "08:00").split(' ')[0].substring(0, 5);
        const targetDateTime = new Date(`${targetDateStr}T${targetTimeStr}:00`);

        const interval = setInterval(() => {
            const now = new Date();
            const diff = targetDateTime - now;
            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60)
                });
            } else { clearInterval(interval); }
        }, 1000);
        return () => clearInterval(interval);
    }, [date, data?.akad_time]);

    // --- HANDLERS ---
    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(() => { });
            setIsPlaying(true);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        setTimeout(() => {
            if (audioRef.current) audioRef.current.play().catch(() => { });
            setIsPlaying(true);
        }, 500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!onRsvpSubmit) return alert("Mode Demo: RSVP tidak disimpan.");
        setIsSending(true);
        await onRsvpSubmit({ status: rsvpStatus, pax: parseInt(rsvpPax), message: rsvpMessage });
        setIsSending(false);
    };

    return (
        // MAIN CONTAINER: iOS Light Mode Base
        <div className="bg-[#F2F2F7] text-[#1C1C1E] min-h-screen relative overflow-x-hidden font-sans selection:bg-blue-500 selection:text-white">

            {/* --- GLOBAL STYLES --- */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .font-ios { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        
        /* Glassmorphism Classes */
        .glass-panel {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
        
        .glass-input {
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(0, 0, 0, 0.05);
            backdrop-filter: blur(10px);
        }
        .glass-input:focus {
            background: rgba(255, 255, 255, 0.8);
            border-color: #007AFF;
            outline: none;
        }

        /* Animated Blobs for Background */
        @keyframes moveBlob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: moveBlob 10s infinite alternate; }
        .delay-2000 { animation-delay: 2s; }
        .delay-4000 { animation-delay: 4s; }

        /* Smooth iOS Slide Up */
        @keyframes iosSlideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-ios-up { animation: iosSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

            {/* --- ANIMATED BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
                <div className="absolute top-0 right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob delay-4000"></div>
            </div>

            {/* --- OPENING SCREEN (MODAL) --- */}
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                <div className="absolute inset-0 bg-white/30 backdrop-blur-3xl z-[-1]"></div>
                <div className="w-full max-w-sm glass-panel p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-8 opacity-50"></div>
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden shadow-lg mb-6 border-4 border-white">
                        <img src={photos.cover} className="w-full h-full object-cover" alt="Avatar" />
                    </div>
                    <p className="text-gray-500 font-ios text-sm uppercase tracking-wider mb-2">The Wedding</p>
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 font-ios tracking-tight">{groom} & {bride}</h1>
                    <div className="bg-white/50 rounded-2xl p-4 mb-8">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Invited Guest</p>
                        <h3 className="text-lg font-semibold text-gray-800">{guestName || "Special Guest"}</h3>
                    </div>
                    <button onClick={handleOpen} className="w-full bg-[#007AFF] text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                        Open Invitation
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className={`transition-opacity duration-1000 delay-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

                {/* 1. HERO SECTION */}
                <section className="min-h-screen relative pt-12 px-6 flex flex-col items-center">
                    <div className="text-center mb-8">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{formattedDate}</p>
                    </div>
                    <div className="text-center mb-10 z-10">
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
                            {groom} <br /> <span className="text-gray-400 font-normal">&</span> {bride}
                        </h1>
                    </div>
                    <div className="w-full max-w-sm aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative border-[6px] border-white/40">
                        <img src={photos.cover} className="w-full h-full object-cover" alt="Cover" />
                        <div className="absolute bottom-4 left-4 right-4 glass-panel p-4 rounded-3xl flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Wedding Day</p>
                                <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
                            </div>
                            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                                <Heart size={18} fill="white" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. QUOTE (Widget Style) */}
                <section className="px-4 py-6 max-w-xl mx-auto">
                    <div className="glass-panel p-6 rounded-[2rem] text-center relative overflow-hidden">
                        <Quote size={40} className="text-blue-500/10 absolute top-4 left-4" />
                        <p className="text-gray-600 italic font-medium relative z-10 mb-4 px-4 leading-relaxed">
                            "{quote}"
                        </p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">— {quoteSrc}</p>
                    </div>
                </section>

                {/* 3. COUNTDOWN */}
                <section className="px-4 py-4 max-w-xl mx-auto">
                    <div className="glass-panel p-6 rounded-[2rem]">
                        <div className="flex justify-between text-center">
                            <CountdownUnit val={timeLeft.days} label="DAYS" />
                            <div className="w-px bg-gray-300/50 my-2"></div>
                            <CountdownUnit val={timeLeft.hours} label="HRS" />
                            <div className="w-px bg-gray-300/50 my-2"></div>
                            <CountdownUnit val={timeLeft.minutes} label="MIN" />
                            <div className="w-px bg-gray-300/50 my-2"></div>
                            <CountdownUnit val={timeLeft.seconds} label="SEC" />
                        </div>
                    </div>
                </section>

                {/* 4. COUPLE */}
                <section className="px-4 py-12 max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 rounded-[2.5rem] flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full p-1 border-2 border-blue-200 mb-4">
                                <img src={photos.groom} className="w-full h-full rounded-full object-cover" alt="Groom" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{groom}</h2>
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">The Groom</p>
                            <div className="w-full bg-white/40 rounded-2xl p-4">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Son of</p>
                                <p className="text-sm font-medium text-gray-700">{data?.groom_parents}</p>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-[2.5rem] flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full p-1 border-2 border-pink-200 mb-4">
                                <img src={photos.bride} className="w-full h-full rounded-full object-cover" alt="Bride" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{bride}</h2>
                            <p className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-4">The Bride</p>
                            <div className="w-full bg-white/40 rounded-2xl p-4">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Daughter of</p>
                                <p className="text-sm font-medium text-gray-700">{data?.bride_parents}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. EVENT DETAILS */}
                <section className="px-4 py-12">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h2 className="text-2xl font-bold text-center mb-6">Event Details</h2>
                        {/* Akad */}
                        <div className="glass-panel p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                            <div className="flex-1 pl-4">
                                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold uppercase mb-2">Ceremony</span>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Akad Nikah</h3>
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-4">
                                    <Clock size={16} /> {data?.akad_time}
                                </div>
                                <div className="flex items-start gap-2 text-gray-500 text-sm font-medium">
                                    <MapPin size={16} className="shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="text-gray-700 font-semibold">{data?.venue_name}</span>
                                        <span className="text-gray-500">{data?.venue_address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Resepsi */}
                        <div className="glass-panel p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
                            <div className="flex-1 pl-4">
                                <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-[10px] font-bold uppercase mb-2">Party</span>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Reception</h3>
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-4">
                                    <Clock size={16} /> {data?.resepsi_time}
                                </div>
                                <div className="flex items-start gap-2 text-gray-500 text-sm font-medium">
                                    <MapPin size={16} className="shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="text-gray-700 font-semibold">{data?.venue_name}</span>
                                        <span className="text-gray-500">{data?.venue_address}</span>
                                    </div>
                                </div>
                            </div>
                            <a href={data?.maps_link} target="_blank" className="bg-gray-100 hover:bg-gray-200 text-gray-900 p-4 rounded-2xl flex items-center justify-center transition-colors">
                                <Navigation size={24} className="text-[#007AFF]" />
                            </a>
                        </div>
                    </div>
                </section>

                {/* 6. RSVP (iOS Settings Group Style) */}
                <section className="px-4 py-12 max-w-xl mx-auto">
                    <div className="glass-panel rounded-[2rem] overflow-hidden">
                        <div className="bg-gray-50/50 p-4 border-b border-gray-200/50 flex items-center gap-2">
                            <MessageSquare size={18} className="text-[#007AFF]" />
                            <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Wishes & RSVP</span>
                        </div>

                        <div className="p-6">
                            {submittedData ? (
                                <div className="text-center py-4">
                                    <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Thank You!</h3>
                                    <p className="text-gray-500 text-sm mb-6">You have submitted your response.</p>
                                    
                                    <div className="bg-white/60 rounded-xl p-4 text-left border border-gray-200 text-sm space-y-2">
                                        <div className="flex justify-between"><span className="text-gray-400">Name</span><span className="font-semibold">{submittedData.guest_name}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Status</span><span className={`font-bold capitalize ${submittedData.status === 'hadir' ? 'text-green-600' : 'text-red-500'}`}>{submittedData.status}</span></div>
                                        <div className="border-t border-gray-200 pt-2 mt-2">
                                            <p className="text-gray-600 italic">"{submittedData.message}"</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase ml-2">Name</label>
                                        <input value={guestName} disabled className="w-full glass-input p-4 rounded-xl text-gray-500 font-medium cursor-not-allowed" />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase ml-2">Attendance</label>
                                            <div className="relative">
                                                <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value)} className="w-full glass-input p-4 rounded-xl appearance-none text-gray-800 font-medium">
                                                    <option value="hadir">Will Attend</option>
                                                    <option value="tidak_hadir">Cannot Attend</option>
                                                    <option value="ragu">Maybe</option>
                                                </select>
                                                <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
                                            </div>
                                        </div>
                                        {rsvpStatus === 'hadir' && (
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-400 uppercase ml-2">Pax</label>
                                                <div className="relative">
                                                    <select value={rsvpPax} onChange={(e) => setRsvpPax(e.target.value)} className="w-full glass-input p-4 rounded-xl appearance-none text-gray-800 font-medium">
                                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Person</option>)}
                                                    </select>
                                                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase ml-2">Message</label>
                                        <textarea required value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} className="w-full glass-input p-4 rounded-xl h-28 text-gray-800" placeholder="Best wishes for the couple..." />
                                    </div>

                                    <button disabled={isSending} className="w-full bg-[#007AFF] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition disabled:opacity-50">
                                        {isSending ? 'Sending...' : 'Send RSVP'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* COMMENTS LIST (Discord/iMessage Style) */}
                        <div className="bg-gray-50/80 p-4 max-h-[400px] overflow-y-auto border-t border-gray-200/50">
                            {(data?.rsvps || []).length === 0 ? (
                                <p className="text-center text-gray-400 text-xs py-4">No messages yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {(data?.rsvps || []).map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-start group">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                                                {item.guest_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-gray-900">{item.guest_name}</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{item.message}</p>
                                                
                                                {/* REPLY THREAD */}
                                                {item.reply && (
                                                    <div className="flex gap-2 mt-2 ml-1">
                                                        <div className="w-4 border-l-2 border-b-2 border-gray-300 rounded-bl-lg"></div>
                                                        <div className="flex-1 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                                                            <p className="text-[10px] font-bold text-[#007AFF] mb-0.5 flex items-center gap-1">
                                                                {groom} & {bride} <CheckCircle2 size={10}/>
                                                            </p>
                                                            <p className="text-xs text-gray-600">{item.reply}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 7. GALLERY */}
                {gallery.length > 0 && (
                    <section className="py-12 px-4">
                        <h2 className="text-2xl font-bold text-center mb-8">Memories</h2>
                        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
                            {gallery.map((url, i) => (
                                <div key={i} className={`relative rounded-3xl overflow-hidden shadow-sm group cursor-pointer hover:scale-[1.02] transition duration-500 ${i === 0 ? 'col-span-2 row-span-2' : ''} ${i === 3 ? 'col-span-2' : 'col-span-1'}`}>
                                    <img src={url} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 8. GIFT */}
                <section className="px-4 py-12 max-w-xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-8">Wedding Gift</h2>
                    <div className="space-y-4">
                        {banks.map((bank, i) => (
                            <div key={i} className="glass-panel p-6 rounded-3xl shadow-md relative bg-white/80">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-10 h-7 bg-gray-300 rounded overflow-hidden relative">
                                        <div className="absolute top-2 left-1 w-2 h-3 border border-gray-400 rounded-sm"></div>
                                    </div>
                                    <span className="font-bold text-lg text-gray-800 uppercase">{bank.bank}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-mono text-lg tracking-widest text-gray-800">{bank.number}</p>
                                    <button onClick={() => navigator.clipboard.writeText(bank.number)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><Copy size={16} /></button>
                                </div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">{bank.name}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="py-12 text-center">
                    <h2 className="text-xl font-bold text-gray-400 mb-2">{groom} & {bride}</h2>
                    <p className="text-[10px] text-gray-300 uppercase tracking-[0.3em]">Designed with Love</p>
                </footer>

            </div>

            {/* DYNAMIC ISLAND MUSIC PLAYER */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-ios-up">
                <div className="bg-black text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 min-w-[200px] justify-between backdrop-blur-md bg-opacity-90 transition-all hover:scale-105 cursor-pointer border border-white/10" onClick={toggleAudio}>
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}>
                            <Music size={14} className="text-gray-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold leading-tight">Wedding Song</span>
                            <span className="text-[10px] text-gray-400 leading-tight">Tap to play</span>
                        </div>
                    </div>
                    <div className="text-[#007AFF]">
                        {isPlaying ? <div className="flex gap-1 h-3 items-end"><div className="w-1 bg-[#007AFF] animate-bounce h-full"></div><div className="w-1 bg-[#007AFF] animate-bounce h-2/3"></div><div className="w-1 bg-[#007AFF] animate-bounce h-full"></div></div> : <Play size={20} fill="currentColor" />}
                    </div>
                </div>
            </div>

            <audio ref={audioRef} src={audioUrl} loop />
        </div>
    );
}

// Sub-Component
function CountdownUnit({ val, label }) {
    return (
        <div className="flex flex-col items-center w-16">
            <span className="text-3xl font-bold text-gray-900 tabular-nums leading-none mb-1">{String(val).padStart(2, '0')}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
    )
}