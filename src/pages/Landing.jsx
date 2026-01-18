import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MASTER_TEMPLATES } from '../lib/constants'; // Import Data Master
import { Search, Eye, Edit3, HeartHandshake, LogIn } from 'lucide-react';

export default function Landing() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter template berdasarkan pencarian
  const filteredTemplates = MASTER_TEMPLATES.filter(tpl =>
    tpl.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FFD5AF] font-sans text-[#712E1E] pb-20">

      {/* --- HERO SECTION --- */}
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-16 text-center">

        {/* Heading */}
        <h1 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 leading-tight text-[#712E1E] drop-shadow-sm">
          NikahYuk Menyediakan <br />
          <span className="text-[#E59A59]">Undangan Digital</span> Termurah
        </h1>

        <p className="text-[#712E1E] mb-8 md:mb-10 text-sm md:text-lg opacity-80 max-w-2xl mx-auto px-2">
          Bagikan momen bahagiamu dengan desain elegan, fitur lengkap, dan harga yang bersahabat.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-xl mx-auto mb-12 md:mb-20 relative group px-2">
          <input
            type="text"
            placeholder="Cari desain impianmu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 md:py-4 pl-5 pr-12 rounded-full shadow-md bg-white outline-none text-[#712E1E] placeholder:text-[#888870] focus:ring-4 focus:ring-[#E59A59]/30 transition-all text-sm md:text-base"
          />
          <button className="absolute right-4 top-2 md:top-2 bg-[#E59A59] p-2 md:p-2.5 rounded-full text-white hover:bg-[#d48b4b] hover:scale-105 transition shadow-sm">
            <Search className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* --- GRID TEMPLATE --- */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-md md:max-w-none mx-auto">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white p-4 md:p-5 rounded-[2rem] shadow-xl flex flex-col items-start transition-all hover:-translate-y-1 duration-300">

                {/* 1. Gambar Cover */}
                <div className="w-full h-48 md:h-56 bg-gray-100 rounded-2xl mb-4 overflow-hidden relative shadow-inner group">
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div
                    className={`
    absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm
    ${template.category === 'RSVP'
                        ? 'bg-[#712E1E] text-white'
                        : 'bg-[#FFF0E0] text-[#712E1E] border border-[#E6C6A8]'}
  `}
                  >
                    {template.category}
                  </div>
                </div>

                {/* 2. Nama & Harga */}
                <div className="w-full flex justify-between items-end mb-4 px-1">
                  <div>
                    <h3 className="text-[#712E1E] text-lg md:text-xl font-bold truncate pr-2 leading-tight">
                      {template.name}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-[#E59A59]">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(template.price)}
                    </span>
                  </div>
                </div>

                {/* 3. Tombol Action */}
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