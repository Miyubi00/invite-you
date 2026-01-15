import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Edit3, HeartHandshake, LogIn } from 'lucide-react';

// --- 1. SETUP HARGA CONSTANT ---
const PRICING = {
  Basic: 'Rp 25.000',
  Premium: 'Rp 85.000'
};

export default function Landing() {

  const templates = [
  {
    id: 1,
    slug: 'rustic-floral',
    name: 'Rustic Floral',
    image: '/1.png',
    category: 'Premium',
  },
  {
    id: 2,
    slug: 'modern-dark',
    name: 'Modern Dark',
    image: '/2.png',
    category: 'Basic',
  },
  {
    id: 3,
    slug: 'botanical-gold',
    name: 'Botanical Gold',
    image: '/3.png',
    category: 'Premium',
  },
  {
    id: 4,
    slug: 'monochrome',
    name: 'Monochrome',
    image: '/8.png',
    category: 'Basic',
  },
  {
    id: 5,
    slug: 'navy-gold',
    name: 'Navy Gold',
    image: '/4.png',
    category: 'Premium',
  },
  {
    id: 6,
    slug: 'bohaemin',
    name: 'Bohaemin',
    image: '/5.png',
    category: 'Premium',
  },
  {
    id: 7,
    slug: 'rustic-boho',
    name: 'Rustic Boho',
    image: '/6.png',
    category: 'Premium',
  },
  {
    id: 8,
    slug: 'elegant-pastel',
    name: 'Elegant Pastel',
    image: '/7.png',
    category: 'Basic',
  },

  // 🔽 NEW FROM FOLDER
  {
    id: 9,
    slug: 'japanese',
    name: 'Japanese',
    image: '/9.png',
    category: 'Premium',
  },
  {
    id: 10,
    slug: 'javanese',
    name: 'Javanese',
    image: '/10.png',
    category: 'Premium',
  },
  {
    id: 11,
    slug: 'lilac',
    name: 'Lilac',
    image: '/11.png',
    category: 'Basic',
  },
  {
    id: 12,
    slug: 'playful-pop',
    name: 'Playful Pop',
    image: '/12.png',
    category: 'Basic',
  },
  {
    id: 13,
    slug: 'static-canvas',
    name: 'Bubble Chat',
    image: '/13.png',
    category: 'Premium',
  },
  {
    id: 14,
    slug: 'iphone',
    name: 'Iphone',
    image: '/14.png',
    category: 'Premium',
  },
  {
    id: 15,
    slug: 'bit',
    name: '8bit Retro',
    image: '/16.png',
    category: 'Premium',
  },
  {
    id: 16,
    slug: 'comic',
    name: 'Comic',
    image: '/15.png',
    category: 'Premium',
  },
  {
    id: 17,
    slug: 'diary',
    name: 'Diary Book',
    image: '/17.png',
    category: 'Premium',
  },
];


  return (
    <div className="min-h-screen bg-[#FFD5AF] font-sans text-[#712E1E]">

      {/* --- HERO SECTION --- */}
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-16 text-center">

        {/* Heading: Ukuran font responsif (text-3xl di HP, text-6xl di PC) */}
        <h1 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 leading-tight text-[#712E1E] drop-shadow-sm">
          NikahYuk Menyediakan <br />
          <span className="text-[#E59A59]">Undangan Digital</span> Termurah
        </h1>

        <p className="text-[#712E1E] mb-8 md:mb-10 text-sm md:text-lg opacity-80 max-w-2xl mx-auto px-2">
          Bagikan momen bahagiamu dengan desain elegan, fitur lengkap, dan harga yang bersahabat.
        </p>

        {/* Search Bar (Responsive Width) */}
        <div className="w-full max-w-xl mx-auto mb-12 md:mb-20 relative group px-2">
          <input
            type="text"
            placeholder="Cari desain impianmu..."
            className="w-full py-3 md:py-4 pl-5 pr-12 rounded-full shadow-md bg-white outline-none text-[#712E1E] placeholder:text-[#888870] focus:ring-4 focus:ring-[#E59A59]/30 transition-all text-sm md:text-base"
          />
          <button className="absolute right-4 top-2 md:top-2 bg-[#E59A59] p-2 md:p-2.5 rounded-full text-white hover:bg-[#d48b4b] hover:scale-105 transition shadow-sm">
            <Search className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* --- GRID TEMPLATE (Responsive: 1 Kolom di HP, 3 di PC) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-md md:max-w-none mx-auto">
          {templates.map((template) => (
            <div key={template.id} className="bg-white p-4 md:p-5 rounded-[2rem] shadow-xl flex flex-col items-start transition-all hover:-translate-y-1 duration-300">

              {/* 1. Gambar Cover (Di Atas) */}
              <div className="w-full h-48 md:h-56 bg-gray-100 rounded-2xl mb-4 overflow-hidden relative shadow-inner">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>

              {/* 2. Nama & Harga (Bersebelahan) */}
              <div className="w-full flex justify-between items-center mb-4 px-1">
                <h3 className="text-[#712E1E] text-lg md:text-xl font-bold truncate pr-2">
                  {template.name}
                </h3>

                {/* Badge Dinamis Sesuai Kategori */}
                <div className={`flex flex-col items-end px-3 py-1 rounded-lg shadow-sm text-white text-xs md:text-sm font-medium
                  ${template.category === 'Premium' ? 'bg-[#712E1E]' : 'bg-[#888870]'}`}>
                  <span className="opacity-80 text-[10px] uppercase tracking-wide">{template.category}</span>
                  <span className="font-bold">{PRICING[template.category]}</span>
                </div>
              </div>

              {/* 3. Tombol Action (Full Width di Mobile) */}
              <div className="flex gap-3 w-full mt-auto">
                <Link
                  to={`/demo/${template.slug}`}
                  className="flex-1 py-2 md:py-3 rounded-xl border-2 border-[#E59A59] text-[#E59A59] font-bold text-sm md:text-base hover:bg-[#FFF0E0] transition flex justify-center items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Link>

                <Link
                  to={`/order?template=${template.slug}`}
                  className="flex-1 py-2 md:py-3 rounded-xl bg-[#E59A59] text-white font-bold text-sm md:text-base hover:bg-[#d48b4b] hover:shadow-lg transition flex justify-center items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Buat
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}