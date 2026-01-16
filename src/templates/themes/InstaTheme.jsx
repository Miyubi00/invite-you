import { useState, useRef, useEffect } from 'react';
import { 
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal, 
  Home, Search, PlusSquare, User, MapPin, Calendar, 
  ChevronLeft, ChevronRight, Grid, Music, Clock, Copy, CreditCard 
} from 'lucide-react';

export default function InstaTheme({ groom, bride, date, guestName, data }) {
  // --- STATE ---
  const [likes, setLikes] = useState({}); 
  const [showBigHeart, setShowBigHeart] = useState(null); 
  const [activeTab, setActiveTab] = useState('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [coupleSlide, setCoupleSlide] = useState(0); // 0 = Groom, 1 = Bride
  const audioRef = useRef(null);

  // --- REFS FOR SCROLLING ---
  const homeRef = useRef(null);
  const coupleRef = useRef(null); // Ref baru untuk Couple
  const eventRef = useRef(null);
  const galleryRef = useRef(null);
  const giftRef = useRef(null);

  // --- DATA ---
  const username = `${groom.toLowerCase()}_${bride.toLowerCase()}`;
  const location = data?.venue_name || "Wedding Venue";
  
  const photos = {
    profile: data?.cover_photo || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=150&fit=crop",
    feed1: data?.cover_photo || "https://images.unsplash.com/photo-1511285560982-1356c11d4606?w=800&fit=crop",
    // Foto Mempelai
    groom: data?.groom_photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&fit=crop",
    bride: data?.bride_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&fit=crop",
    
    gift_bg: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=800&fit=crop",
    gallery: data?.gallery || []
  };

  const formattedDate = new Date(date || new Date()).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  const banks = data?.banks || [];

  // --- LOGIC ---
  const handleLike = (id) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDoubleTap = (id) => {
    if (!likes[id]) {
      handleLike(id);
    }
    setShowBigHeart(id);
    setTimeout(() => setShowBigHeart(null), 1000);
  };

  const scrollToSection = (ref, tab) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleAudio = () => {
    if(!audioRef.current) return;
    if(isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  // --- COMPONENT: POST HEADER ---
  const PostHeader = ({ locationText }) => (
    <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                <img src={photos.profile} className="w-full h-full rounded-full object-cover border border-white" />
            </div>
            <div>
                <p className="text-sm font-semibold text-black leading-none">{username}</p>
                {locationText && <p className="text-xs text-gray-500 mt-0.5">{locationText}</p>}
            </div>
        </div>
        <MoreHorizontal size={20} className="text-gray-600"/>
    </div>
  );

  // --- COMPONENT: ACTION BAR ---
  const ActionBar = ({ id, liked }) => (
    <div className="px-3 pt-3 pb-2">
        <div className="flex justify-between items-center mb-2">
            <div className="flex gap-4">
                <button onClick={() => handleLike(id)} className="transition-transform active:scale-90">
                    <Heart size={24} className={liked ? "fill-red-500 text-red-500" : "text-black"} />
                </button>
                <MessageCircle size={24} className="text-black -rotate-90"/>
                <Send size={24} className="text-black"/>
            </div>
            <Bookmark size={24} className="text-black"/>
        </div>
        <p className="text-sm font-semibold text-black">{liked ? '1,235 likes' : '1,234 likes'}</p>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center">
      {/* MOBILE CONTAINER LIMIT */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative pb-16 font-sans">
        
        {/* --- TOP NAV --- */}
        <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center">
            <h1 className="font-bold text-xl tracking-tight" style={{fontFamily: 'Grand Hotel, cursive', fontSize: '28px'}}>
                Instagram
            </h1>
            <div className="flex gap-5">
                <div onClick={toggleAudio} className={`cursor-pointer ${isPlaying ? 'text-red-500' : 'text-black'}`}>
                    <Heart size={24} className={isPlaying ? "fill-red-500 animate-pulse" : ""} />
                </div>
                <div className="relative">
                    <MessageCircle size={24} className="-rotate-90" />
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">1</div>
                </div>
            </div>
        </nav>

        {/* --- STORIES (HIGHLIGHTS) --- */}
        <div className="px-4 py-4 border-b border-gray-100 overflow-x-auto no-scrollbar">
            <div className="flex gap-4">
                {[
                    { name: "Start", img: photos.profile, ref: homeRef },
                    { name: "Couple", img: photos.groom, ref: coupleRef },
                    { name: "Event", img: photos.feed1, ref: eventRef },
                    { name: "Gift", img: photos.gift_bg, ref: giftRef },
                ].map((story, i) => (
                    <div key={i} onClick={() => scrollToSection(story.ref, 'story')} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                        <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                                <img src={story.img} className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-700 truncate w-16 text-center">{story.name}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* --- FEED --- */}
        
        {/* POST 1: OPENING */}
        <div ref={homeRef} className="border-b border-gray-100 pb-2">
            <PostHeader locationText="Save The Date" />
            <div 
                className="relative aspect-[4/5] bg-gray-100 overflow-hidden cursor-pointer"
                onDoubleClick={() => handleDoubleTap('post1')}
            >
                <img src={photos.feed1} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showBigHeart === 'post1' ? 'opacity-100' : 'opacity-0'}`}>
                    <Heart size={100} className="text-white fill-white animate-ping" />
                </div>
            </div>
            <ActionBar id="post1" liked={likes['post1']} />
            <div className="px-3 pb-3">
                <p className="text-sm text-black">
                    <span className="font-semibold mr-2">{username}</span>
                    {groom} & {bride} are getting married! We invite you to celebrate our special day with us. ❤️💍
                </p>
                <p className="text-xs text-gray-400 mt-2 uppercase">Just Now</p>
            </div>
        </div>

        {/* POST 2: THE COUPLE (CAROUSEL SLIDE) */}
        <div ref={coupleRef} className="border-b border-gray-100 pb-2">
            <PostHeader locationText="The Happy Couple" />
            
            {/* Carousel Container */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden group" onDoubleClick={() => handleDoubleTap('post_couple')}>
                
                {/* Images */}
                <div className="absolute inset-0 transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${coupleSlide * 100}%)` }}>
                    <div className="absolute top-0 left-0 w-full h-full">
                        <img src={photos.groom} className="w-full h-full object-cover" />
                        {/* Tag Label */}
                        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <User size={12}/> The Groom
                        </div>
                    </div>
                    <div className="absolute top-0 left-full w-full h-full">
                        <img src={photos.bride} className="w-full h-full object-cover" />
                        {/* Tag Label */}
                        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <User size={12}/> The Bride
                        </div>
                    </div>
                </div>

                {/* Big Heart Animation */}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showBigHeart === 'post_couple' ? 'opacity-100' : 'opacity-0'}`}>
                    <Heart size={80} className="text-white fill-white animate-bounce" />
                </div>

                {/* Nav Buttons (Hidden by default, visible on logic or hover) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); setCoupleSlide(0); }}
                    className={`absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 p-1 rounded-full text-black shadow-md ${coupleSlide === 0 ? 'hidden' : 'block'}`}
                >
                    <ChevronLeft size={20}/>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setCoupleSlide(1); }}
                    className={`absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 p-1 rounded-full text-black shadow-md ${coupleSlide === 1 ? 'hidden' : 'block'}`}
                >
                    <ChevronRight size={20}/>
                </button>

                {/* Slide Indicators (Dots) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${coupleSlide === 0 ? 'bg-blue-500' : 'bg-white/70'}`}></div>
                    <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${coupleSlide === 1 ? 'bg-blue-500' : 'bg-white/70'}`}></div>
                </div>
            </div>

            <ActionBar id="post_couple" liked={likes['post_couple']} />
            
            {/* Caption with Parents Info */}
            <div className="px-3 pb-3">
                <p className="text-sm text-black mb-2">
                    <span className="font-semibold mr-2">{username}</span>
                    Meet the bride and groom! 💑
                </p>
                <div className="text-sm text-black space-y-2 border-l-2 border-gray-200 pl-3 ml-1">
                    <div>
                        <span className="font-bold block">🤵 {groom}</span>
                        <span className="text-gray-600 text-xs">Putra dari Bpk/Ibu {data?.groom_parents}</span>
                    </div>
                    <div>
                        <span className="font-bold block">👰 {bride}</span>
                        <span className="text-gray-600 text-xs">Putri dari Bpk/Ibu {data?.bride_parents}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* POST 3: EVENT INFO */}
        <div ref={eventRef} className="border-b border-gray-100 pb-2">
            <PostHeader locationText={location} />
            
            <div className="relative aspect-square bg-[#F8F8F8] flex flex-col items-center justify-center text-center p-8 border-y border-gray-100" onDoubleClick={() => handleDoubleTap('post2')}>
                <div className="border border-black p-6 w-full h-full flex flex-col items-center justify-center bg-white shadow-sm">
                    <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-4">The Wedding</p>
                    <h2 className="text-3xl font-serif mb-2">{formattedDate}</h2>
                    <div className="w-10 h-px bg-gray-300 my-4"></div>
                    
                    <div className="space-y-4 w-full">
                        <div className="flex items-center gap-3 text-left">
                            <div className="bg-gray-100 p-2 rounded-full"><Clock size={16}/></div>
                            <div>
                                <p className="text-xs font-bold">AKAD NIKAH</p>
                                <p className="text-xs text-gray-500">{data?.akad_time}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-left">
                            <div className="bg-gray-100 p-2 rounded-full"><Clock size={16}/></div>
                            <div>
                                <p className="text-xs font-bold">RECEPTION</p>
                                <p className="text-xs text-gray-500">{data?.resepsi_time}</p>
                            </div>
                        </div>
                    </div>

                    {/* Z-INDEX DITAMBAHKAN AGAR TOMBOL DI ATAS */}
                    <a 
                        href={data?.maps_link} 
                        target="_blank" 
                        rel="noreferrer"
                        // Stop propagation agar double click di parent tidak terganggu (opsional)
                        onDoubleClick={(e) => e.stopPropagation()} 
                        className="mt-6 bg-blue-500 text-white text-xs font-bold py-2 px-6 rounded-md hover:bg-blue-600 transition relative z-20 cursor-pointer"
                    >
                        View On Map
                    </a>
                </div>

                {/* PERBAIKAN: pointer-events-none DITAMBAHKAN */}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showBigHeart === 'post2' ? 'opacity-100' : 'opacity-0'}`}>
                    <Heart size={80} className="text-red-500 fill-red-500 animate-bounce" />
                </div>
            </div>

            <ActionBar id="post2" liked={likes['post2']} />
            
            <div className="px-3 pb-3">
                <p className="text-sm text-black">
                    <span className="font-semibold mr-2">{username}</span>
                    Save the date! <span className="text-blue-900">#WeddingDay</span>
                </p>
            </div>
        </div>

        {/* POST 4: GALLERY */}
        <div ref={galleryRef} className="border-b border-gray-100 pb-2">
            <PostHeader locationText="Captured Moments" />
            
            <div className="grid grid-cols-3 gap-0.5" onDoubleClick={() => handleDoubleTap('post3')}>
                {photos.gallery.slice(0, 6).map((url, i) => (
                    <div key={i} className="aspect-square relative group">
                        <img src={url} className="w-full h-full object-cover" />
                    </div>
                ))}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showBigHeart === 'post3' ? 'opacity-100' : 'opacity-0'}`}>
                    <Heart size={100} className="text-white fill-white shadow-lg animate-ping" />
                </div>
            </div>

            <ActionBar id="post3" liked={likes['post3']} />
            <div className="px-3 pb-3">
                <p className="text-sm text-black">
                    <span className="font-semibold mr-2">{username}</span>
                    Our journey so far... 📸
                </p>
            </div>
        </div>

        {/* POST 5: GIFT */}
        <div ref={giftRef} className="border-b border-gray-100 pb-20">
            <PostHeader locationText="Wedding Gift" />
            
            <div className="relative aspect-square bg-gray-50 flex items-center justify-center p-6" onDoubleClick={() => handleDoubleTap('post4')}>
                <img src={photos.gift_bg} className="absolute inset-0 w-full h-full object-cover opacity-20" />
                
                <div className="relative z-10 bg-white p-6 rounded-xl shadow-lg w-full max-w-xs border border-gray-200">
                    <div className="text-center mb-6">
                        <CreditCard className="w-10 h-10 mx-auto text-blue-500 mb-2" />
                        <h3 className="font-bold text-lg">Digital Envelope</h3>
                        <p className="text-xs text-gray-500">Your presence is the best gift, but if you wish to contribute:</p>
                    </div>

                    <div className="space-y-4">
                        {banks.map((bank, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="font-bold text-xs text-blue-600 uppercase mb-1">{bank.bank}</p>
                                <div className="flex justify-between items-center">
                                    <p className="font-mono text-sm font-semibold">{bank.number}</p>
                                    <button 
                                        onClick={() => {navigator.clipboard.writeText(bank.number); alert('Copied!')}}
                                        className="text-xs text-blue-500 font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <Copy size={12}/> Copy
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">a.n {bank.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${showBigHeart === 'post4' ? 'opacity-100' : 'opacity-0'}`}>
                    <Heart size={100} className="text-red-500 fill-red-500 animate-bounce" />
                </div>
            </div>

            <ActionBar id="post4" liked={likes['post4']} />
            <div className="px-3 pb-3">
                <p className="text-sm text-black">
                    <span className="font-semibold mr-2">{username}</span>
                    Thank you for your love and support! 🙏
                </p>
            </div>
        </div>


        {/* --- BOTTOM NAVIGATION (STICKY) --- */}
        <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
            <button onClick={() => scrollToSection(homeRef, 'home')}>
                <Home size={26} className={activeTab === 'home' ? "text-black fill-black" : "text-gray-500"} />
            </button>
            
            {/* Search now goes to Couple Profile */}
            <button onClick={() => scrollToSection(coupleRef, 'search')}>
                <Search size={26} className={activeTab === 'search' ? "text-black stroke-[3px]" : "text-gray-500"} />
            </button>
            
            <button onClick={() => scrollToSection(galleryRef, 'add')}>
                <PlusSquare size={26} className={activeTab === 'add' ? "text-black stroke-[2.5px]" : "text-gray-500"} />
            </button>
            
            <button onClick={() => scrollToSection(giftRef, 'heart')}>
                <Heart size={26} className={activeTab === 'heart' ? "text-black fill-black" : "text-gray-500"} />
            </button>
            
            <button onClick={() => scrollToSection(homeRef, 'profile')}>
                <div className={`w-6 h-6 rounded-full overflow-hidden border ${activeTab === 'profile' ? 'border-black border-2' : 'border-gray-300'}`}>
                    <img src={photos.profile} className="w-full h-full object-cover" />
                </div>
            </button>
        </div>

        <audio ref={audioRef} src={data?.audio_url || "https://cdn.pixabay.com/download/audio/2022/02/07/audio_1808fbf07a.mp3"} loop />

      </div>
    </div>
  );
}