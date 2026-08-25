import { useRef } from 'react';
import { Play, Pause, MapPin, Heart, Copy, Flower2, Calendar } from 'lucide-react';
import type { TemplateProps } from '../../types/template';
import { useCountdown } from '../../hooks/useCountdown';
import { formatDate, resolveBanks, resolveGallery, resolvePhotos, resolveVenue, resolveSchedule } from '../../utils/templateHelpers';
import { useOpenInvitation } from '../shared/useOpenInvitation';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

export default function RusticBohoTheme({ groom, bride, date, guestName, data }: TemplateProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUrl = data?.audio_url || '';
    const copyRek = useCopyToClipboard();

    ;

    const photos = resolvePhotos(data);;

    const gallery = resolveGallery(data);

    const formattedDate = formatDate(date, 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const schedule = resolveSchedule(data, date);
    const formattedAkadDate = schedule.akadDate ? formatDate(schedule.akadDate, 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : formattedDate;
    const formattedResepsiDate = schedule.resepsiDate ? formatDate(schedule.resepsiDate, 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : formattedDate;

    const timeLeft = useCountdown(date);

// Pola bersama (dedup 3.2): amplop + audio instan (delay 0).
const { isOpen, open, playing: isPlaying, toggle: toggleAudio } = useOpenInvitation(audioRef, 0);

    return (
        // Background texture kertas krem
        <div className="bg-[#f3f0e7] text-[#5c5552] min-h-screen font-serif relative overflow-x-hidden selection:bg-[#d4a373] selection:text-white">

            {/* Texture Overlay (Noise) */}
            <div className="fixed inset-0 opacity-40 pointer-events-none z-0" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}></div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        .font-hand { font-family: 'Dancing Script', cursive; }
        .font-body { font-family: 'Lora', serif; }
        
        .torn-paper-top {
          clip-path: polygon(0% 10px, 5% 0px, 10% 12px, 15% 0px, 20% 10px, 25% 0px, 30% 12px, 35% 2px, 40% 12px, 45% 0px, 50% 12px, 55% 0px, 60% 12px, 65% 0px, 70% 12px, 75% 0px, 80% 10px, 85% 0px, 90% 12px, 95% 0px, 100% 12px, 100% 100%, 0% 100%);
        }
        .torn-paper-bottom {
           clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 10px), 95% 100%, 90% calc(100% - 12px), 85% 100%, 80% calc(100% - 10px), 75% 100%, 70% calc(100% - 12px), 65% 100%, 60% calc(100% - 12px), 55% 100%, 50% calc(100% - 12px), 45% 100%, 40% calc(100% - 12px), 35% 100%, 30% calc(100% - 12px), 25% 100%, 20% calc(100% - 10px), 15% 100%, 10% calc(100% - 12px), 5% 100%, 0% calc(100% - 10px));
        }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>

            {/* --- COVER MODAL (Amplop Style) --- */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#5c5552]/90 backdrop-blur-sm transition-all duration-1000 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="bg-[#fdfbf7] w-full max-w-md mx-4 p-8 md:p-12 text-center shadow-2xl relative rounded-sm torn-paper-top torn-paper-bottom">
                    {/* Stamp decoration */}
                    <div className="absolute top-4 right-4 w-16 h-16 border-2 border-[#d4a373] rounded-full flex items-center justify-center opacity-50 rotate-12">
                        <span className="text-[10px] uppercase font-bold text-[#d4a373]">Save<br />Date</span>
                    </div>

                    <p className="font-body text-sm text-[#8a817c] tracking-widest uppercase mb-4">The Wedding Of</p>
                    <h1 className="font-hand text-5xl md:text-6xl text-[#d4a373] mb-6">{groom} & {bride}</h1>

                    <div className="my-8 border-t border-b border-[#d4a373]/30 py-4">
                        <p className="font-body italic text-[#5c5552]">Kepada Bapak/Ibu/Saudara/i:</p>
                        <h3 className="font-bold text-xl mt-2">{guestName || "Tamu Undangan"}</h3>
                    </div>

                    <button onClick={open} className="bg-[#a98467] text-white px-8 py-3 rounded-full font-body font-bold hover:bg-[#8d6e53] transition shadow-lg flex items-center gap-2 mx-auto">
                        <Flower2 size={18} /> Buka Undangan
                    </button>
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div className={`relative z-10 transition-all duration-1000 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>

                {/* HERO HEADER */}
                <header className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
                    <div className="absolute inset-0 z-[-1]">
                        <img src={photos.cover} className="w-full h-full object-cover opacity-80" alt="Background" />
                        <div className="absolute inset-0 bg-[#f3f0e7]/60"></div>
                    </div>

                    <div className="bg-[#fdfbf7]/80 backdrop-blur-sm p-8 md:p-14 shadow-xl border border-white/50 max-w-2xl w-full rotate-1 hover:rotate-0 transition duration-500 rounded-sm">
                        <p className="font-body text-[#8a817c] uppercase tracking-[0.3em] text-xs mb-4">We Are Getting Married</p>
                        <h1 className="font-hand text-6xl md:text-8xl text-[#d4a373] mb-4 leading-tight">{groom} <br /> <span className="text-4xl text-[#8a817c]">&</span> <br /> {bride}</h1>
                        <p className="font-body text-lg text-[#5c5552] font-bold mt-2">{formattedDate}</p>

                        {/* --- COUNTDOWN SECTION --- */}
                        <div className="flex justify-center gap-6 mt-8 border-t border-[#d4a373]/30 pt-6">
                            <div className="flex flex-col items-center">
                                <span className="font-hand text-3xl text-[#d4a373]">{timeLeft.days}</span>
                                <span className="text-[10px] uppercase tracking-widest text-[#8a817c] font-body mt-1">Hari</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-hand text-3xl text-[#d4a373]">{timeLeft.hours}</span>
                                <span className="text-[10px] uppercase tracking-widest text-[#8a817c] font-body mt-1">Jam</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-hand text-3xl text-[#d4a373]">{timeLeft.minutes}</span>
                                <span className="text-[10px] uppercase tracking-widest text-[#8a817c] font-body mt-1">Menit</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-hand text-3xl text-[#d4a373]">{timeLeft.seconds}</span>
                                <span className="text-[10px] uppercase tracking-widest text-[#8a817c] font-body mt-1">Detik</span>
                            </div>
                        </div>
                        {/* ------------------------- */}

                    </div>

                    <div className="absolute bottom-10 animate-bounce text-[#d4a373]">
                        <Flower2 size={32} />
                    </div>
                </header>

                {/* QUOTE */}
                <section className="py-20 px-6 text-center">
                    <div className="max-w-2xl mx-auto relative">
                        <span className="font-hand text-9xl text-[#e6ccb2] absolute -top-10 -left-4 opacity-30">"</span>
                        <p className="font-body text-xl md:text-2xl italic leading-relaxed text-[#6d6875]">
                            {data?.quote || "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya."}
                        </p>
                        <p className="mt-4 font-bold text-[#b5838d]">— {data?.quote_src || "QS. Ar-Rum: 21"}</p>
                    </div>
                </section>

                {/* COUPLE PROFILE (Polaroid Style) */}
                <section className="py-20 bg-[#e3d5ca]/30 torn-paper-top torn-paper-bottom px-4">
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">

                        {/* Groom */}
                        <div className="relative group">
                            {/* Tape effect */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#e6ccb2]/80 rotate-2 z-20 shadow-sm"></div>
                            <div className="bg-white p-4 pb-12 shadow-xl rotate-2 group-hover:rotate-0 transition duration-500 transform origin-top">
                                <div className="aspect-[3/4] overflow-hidden bg-gray-200 mb-4">
                                    <img src={photos.groom} className="w-full h-full object-cover" alt="Groom" />
                                </div>
                                <div className="text-center font-hand text-3xl text-[#d4a373]">{groom}</div>
                                <p className="text-center font-body text-xs mt-2 text-gray-500">Putra dari</p>
                                <div className="text-center font-body text-xs mt-2 text-gray-500">{data?.groom_parents}</div>
                            </div>
                        </div>

                        {/* Bride */}
                        <div className="relative group md:mt-12">
                            {/* Tape effect */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#e6ccb2]/80 -rotate-2 z-20 shadow-sm"></div>
                            <div className="bg-white p-4 pb-12 shadow-xl -rotate-2 group-hover:rotate-0 transition duration-500 transform origin-top">
                                <div className="aspect-[3/4] overflow-hidden bg-gray-200 mb-4">
                                    <img src={photos.bride} className="w-full h-full object-cover" alt="Bride" />
                                </div>
                                <div className="text-center font-hand text-3xl text-[#d4a373]">{bride}</div>
                                <p className="text-center font-body text-xs mt-2 text-gray-500">Putri dari</p>
                                <div className="text-center font-body text-xs mt-2 text-gray-500">{data?.bride_parents}</div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* EVENTS (Simple Paper) */}
                <section className="py-24 px-4">
                    <h2 className="text-center font-hand text-5xl text-[#d4a373] mb-12">Save The Date</h2>
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

                        {/* Akad */}
                        <div className="bg-[#fff] border-2 border-dashed border-[#d4a373] p-8 rounded-xl relative">
                            <div className="absolute -top-4 -left-4 bg-[#d4a373] text-white p-2 rounded-full shadow-lg"><Heart size={20} /></div>
                            <h3 className="font-body font-bold text-2xl mb-4 text-[#5c5552]">Akad Nikah</h3>
                            <div className="space-y-3 text-sm md:text-base font-body">
                                <div className="flex items-center gap-2"><Calendar className="text-[#d4a373]" /> {formattedAkadDate}</div>
                                <div className="flex items-center gap-2"><Play className="text-[#d4a373] w-4 h-4" /> {resolveSchedule(data).akadTime}</div>
                            </div>
                        </div>

                        {/* Resepsi */}
                        <div className="bg-[#a98467] text-white p-8 rounded-xl relative shadow-[10px_10px_0px_rgba(212,163,115,0.4)]">
                            <div className="absolute -top-4 -right-4 bg-white text-[#a98467] p-2 rounded-full shadow-lg"><Flower2 size={20} /></div>
                            <h3 className="font-body font-bold text-2xl mb-4">Resepsi</h3>
                            <div className="space-y-3 text-sm md:text-base font-body opacity-90">
                                <div className="flex items-center gap-2"><Calendar className="text-white" /> {formattedResepsiDate}</div>
                                <div className="flex items-center gap-2"><Play className="text-white w-4 h-4" /> {resolveSchedule(data).resepsiTime}</div>
                            </div>
                        </div>

                    </div>

                    {/* Venue (Terpisah) */}
                    <div className="max-w-md mx-auto mt-12">
                        <div className="bg-white border-2 border-dashed border-[#d4a373] p-8 rounded-xl relative text-center">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#d4a373] text-white p-2 rounded-full shadow-lg"><MapPin size={20} /></div>
                            <h3 className="font-body font-bold text-2xl mb-4 text-[#5c5552]">Lokasi</h3>
                            <div className="space-y-2 text-sm md:text-base font-body">
                                <div className="font-bold text-[#5c5552]">{resolveVenue(data).name}</div>
                                <div className="text-gray-500">{resolveVenue(data).address}</div>
                            </div>
                            <a href={resolveVenue(data).mapsLink} className="block mt-6 text-center bg-[#a98467] text-white py-2 rounded font-bold hover:bg-[#8b6d56] transition">Lokasi Google Maps</a>
                        </div>
                    </div>
                </section>

                {/* --- GALLERY (Scrapbook Style) --- */}
                {gallery.length > 0 && (
                    <section className="py-24 bg-[#fdfbf7] border-t border-[#e3d5ca] overflow-hidden">
                        <div className="text-center mb-16">
                            <h2 className="font-hand text-5xl text-[#d4a373]">Our Memories</h2>
                            <p className="font-body text-[#8a817c] italic mt-2">Captured moments of us</p>
                        </div>

                        {/* Scattered Grid */}
                        <div className="max-w-6xl mx-auto px-4 columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                            {gallery.map((url, i) => (
                                <div key={i} className="break-inside-avoid relative group" style={{ paddingTop: i % 2 === 0 ? '0' : '2rem' }}>
                                    {/* Random rotation for chaos vibe */}
                                    <div className={`bg-white p-3 shadow-md transition-transform duration-300 hover:scale-105 hover:z-20 relative ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0`}>
                                        {/* Pin Image */}
                                        <div className="absolute -top-3 left-1/2 w-4 h-4 rounded-full bg-red-400 shadow-sm z-10 border border-black/10"></div>

                                        <img src={url} alt="Memory" className="w-full h-auto object-cover filter sepia-[0.3] group-hover:sepia-0 transition duration-500" />
                                        <div className="mt-2 text-center font-hand text-gray-400 text-lg">#moment{i + 1}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* GIFT SECTION */}
                <section className="py-20 px-4 text-center">
                    <div className="max-w-lg mx-auto bg-white p-8 border border-[#e3d5ca] shadow-lg rounded-sm relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#fdfbf7] rounded-full flex items-center justify-center border border-[#e3d5ca]">
                            <Flower2 size={32} className="text-[#d4a373] animate-float" />
                        </div>
                        <h2 className="font-hand text-4xl text-[#5c5552] mt-8 mb-6">Wedding Gift</h2>
                        <div className="space-y-4">
                            {resolveBanks(data).map((bank, i) => (
                                <div key={i} className="bg-[#f9f7f2] p-4 rounded border border-[#ede0d4]">
                                    <p className="font-bold text-[#8d6e53]">{bank.bank}</p>
                                    <div className="flex items-center justify-center gap-2 my-1">
                                        <span className="font-mono text-lg text-[#5c5552]">{bank.number}</span>
                                        <button onClick={() => copyRek(bank.number)} className="text-[#a98467] hover:text-[#5c5552]"><Copy size={14} /></button>
                                    </div>
                                    <p className="text-xs text-gray-400 uppercase">a.n {bank.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="bg-[#5c5552] text-[#fdfbf7] py-8 text-center torn-paper-top mt-12">
                    <h2 className="font-hand text-3xl">{groom} & {bride}</h2>
                    <p className="font-body text-xs opacity-60 mt-2">Terima kasih atas doa restu Anda.</p>
                </footer>

            </div>

            {/* AUDIO PLAYER (Floating) */}
            <button onClick={toggleAudio} className="fixed bottom-6 right-6 bg-[#d4a373] text-white p-3 rounded-full shadow-lg hover:bg-[#b08968] transition z-50 animate-bounce-slow">
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
            </button>
            {audioUrl && <audio ref={audioRef} src={audioUrl} loop />}
        </div>
    );
}