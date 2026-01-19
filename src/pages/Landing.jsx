import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MASTER_TEMPLATES } from '../lib/constants'; 
import { Search, Eye, Edit3 } from 'lucide-react';

export default function Landing() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = MASTER_TEMPLATES.filter(tpl =>
    tpl.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FFD5AF] font-sans text-[#712E1E] pb-20">

      {/* --- HERO SECTION --- */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 text-center">

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 leading-tight text-[#712E1E] drop-shadow-sm">
          invyta Menyediakan <br />
          <span className="text-[#E59A59]">Undangan Digital</span> Termurah
        </h1>

        <p className="text-[#712E1E] mb-8 md:mb-10 text-sm sm:text-base md:text-lg opacity-80 max-w-2xl mx-auto px-2">
          Bagikan momen bahagiamu dengan desain elegan, fitur lengkap, dan harga yang bersahabat.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-xl mx-auto mb-8 md:mb-20 relative group px-2 md:px-0">
          <input
            type="text"
            placeholder="Cari desain impianmu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 md:py-4 pl-5 pr-12 rounded-full shadow-md bg-white outline-none text-[#712E1E] placeholder:text-[#888870] focus:ring-4 focus:ring-[#E59A59]/30 transition-all text-sm md:text-base"
          />
          <button className="absolute right-2 top-2 bottom-2 bg-[#E59A59] aspect-square rounded-full text-white hover:bg-[#d48b4b] hover:scale-105 transition shadow-sm flex items-center justify-center">
            <Search className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* --- GRID TEMPLATE --- */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 mx-auto">
            {filteredTemplates.map((template) => (
              <div 
                key={template.id} 
                className="bg-white p-2.5 md:p-4 rounded-2xl md:rounded-[2rem] shadow-lg flex flex-col items-start transition-all hover:-translate-y-1 duration-300 h-full"
              >

                {/* 1. Gambar Cover */}
                <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl md:rounded-2xl mb-3 md:mb-4 overflow-hidden relative shadow-inner group">
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {/* Badge Kategori - Ukuran font disesuaikan mobile */}
                  <div
                    className={`
                      absolute top-2 left-2 md:top-3 md:left-3 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm
                      ${template.category === 'RSVP'
                        ? 'bg-[#712E1E] text-white'
                        : 'bg-[#FFF0E0] text-[#712E1E] border border-[#E6C6A8]'}
                    `}
                  >
                    {template.category}
                  </div>
                </div>

                {/* 2. Nama & Harga */}
                <div className="w-full flex flex-col items-start mb-2 md:mb-4 px-1 gap-0.5 md:gap-0">
                  <h3 className="text-[#712E1E] text-sm md:text-lg font-bold leading-tight line-clamp-2 text-left">
                    {template.name}
                  </h3>
                  
                  <span className="text-sm md:text-lg font-bold text-[#E59A59]">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(template.price)}
                  </span>
                </div>

                {/* 3. Tombol Action */}
                <div className="flex gap-2 md:gap-3 w-full mt-auto">
                  <Link
                    to={`/demo/${template.slug}`}
                    className="flex-1 py-1.5 md:py-2.5 rounded-lg md:rounded-xl border md:border-2 border-[#E59A59] text-[#E59A59] font-bold text-xs md:text-sm hover:bg-[#FFF0E0] transition flex justify-center items-center gap-1 md:gap-2"
                  >
                    <Eye className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden xs:inline">Preview</span>
                    {/* Di layar HP yg sangat kecil (iPhone SE), teks mungkin perlu disembunyikan atau diperkecil, tapi 'xs:inline' biasanya aman */}
                    <span className="inline xs:hidden">Lihat</span>
                  </Link>

                  <Link
                    to={`/order?template=${template.slug}`}
                    className="flex-1 py-1.5 md:py-2.5 rounded-lg md:rounded-xl bg-[#E59A59] text-white font-bold text-xs md:text-sm hover:bg-[#d48b4b] hover:shadow-lg transition flex justify-center items-center gap-1 md:gap-2"
                  >
                    <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                    Buat
                  </Link>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-50">
            <p className="text-xl font-bold">Tidak ada template yang cocok.</p>
            <p className="text-sm">Coba kata kunci lain.</p>
          </div>
        )}

      </div>
    </div>
  );
}