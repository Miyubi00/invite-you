import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; 
import { MASTER_TEMPLATES } from '../lib/constants'; // Panggil kembali constants Anda
import { Search, Eye, Edit3, Loader2 } from 'lucide-react';

export default function Landing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // 1. Ambil data nama, harga, dan kategori dari Supabase
        const { data: dbTemplates, error } = await supabase
          .from('templates')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        
        if (dbTemplates) {
          // 2. Gabungkan data Database dengan Gambar dari constants.js
          const combinedData = dbTemplates.map((dbItem) => {
            // Cari template di constants.js yang slug-nya sama dengan di database
            const localTemplate = MASTER_TEMPLATES.find(t => t.slug === dbItem.slug);
            
            return {
              ...dbItem, // Masukkan harga, nama, kategori dari database
              // Jika ketemu di constants, pakai gambarnya. Jika tidak, pakai placeholder
              image: localTemplate ? localTemplate.image : "https://via.placeholder.com/400x300?text=No+Image" 
            };
          });

          setTemplates(combinedData);
        }
      } catch (error) {
        console.error('Gagal mengambil data template:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const filteredTemplates = templates
  .filter(tpl => tpl.is_active)
  .filter(tpl => tpl.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FFD5AF] font-sans text-[#712E1E] pb-20">

      {/* --- HERO SECTION --- */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 text-center">

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 leading-tight text-[#712E1E] drop-shadow-sm">
          LoVerse Menyediakan <br />
          <span className="text-[#E59A59]">Undangan Digital</span> Termurah
        </h1>

        <p className="text-[#712E1E] mb-8 md:mb-10 text-sm sm:text-base md:text-lg opacity-80 max-w-2xl mx-auto px-2">
          Bagikan momen bahagiamu dengan desain elegan, fitur lengkap, dan harga yang bersahabat.
        </p>

        {/* --- SEARCH BAR --- */}
        <div className="w-full max-w-xl mx-auto mb-10 md:mb-20 px-4 md:px-0">
          <div className="relative flex items-center w-full group">
            <Search className="absolute left-5 w-5 h-5 text-[#888870] hidden sm:block pointer-events-none" />
            
            <input
              type="text"
              placeholder="Cari desain impianmu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3.5 sm:py-4 pl-6 sm:pl-12 pr-14 sm:pr-16 rounded-full shadow-lg bg-white border border-[#E59A59]/20 outline-none text-[#712E1E] placeholder:text-[#888870] focus:border-[#E59A59] focus:ring-4 focus:ring-[#E59A59]/20 transition-all text-sm sm:text-base"
            />
            
            <button className="absolute right-1.5 sm:right-2 bg-[#E59A59] h-10 w-10 sm:h-12 sm:w-12 rounded-full text-white hover:bg-[#d48b4b] hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* --- TAMPILAN LOADING --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#E59A59]">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-bold animate-pulse">Memuat koleksi undangan...</p>
          </div>
        ) : (
          /* --- GRID TEMPLATE --- */
          <>
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 mx-auto">
                {filteredTemplates.map((template) => (
                  <div 
                    key={template.slug} 
                    className="bg-white p-2.5 md:p-4 rounded-2xl md:rounded-[2rem] shadow-lg flex flex-col items-start transition-all hover:-translate-y-1 duration-300 h-full"
                  >

                    {/* 1. Gambar Cover */}
                    <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl md:rounded-2xl mb-3 md:mb-4 overflow-hidden relative shadow-inner group">
                      <img
                        src={template.image}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
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
          </>
        )}

      </div>
    </div>
  );
}