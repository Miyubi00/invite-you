import React from 'react';
import { Link } from 'react-router-dom';
import { HeartCrack, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 relative overflow-hidden font-sans text-[#712E1E]">
      
      {/* --- BACKGROUND DECORATION (BLOBS) --- */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#FFD5AF] rounded-full opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#E59A59] rounded-full opacity-20 blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 text-center max-w-md w-full">
        
        {/* ICON */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-[#FFF0E0] rounded-full flex items-center justify-center border-2 border-[#E59A59] shadow-sm">
                <HeartCrack size={48} className="text-[#E59A59]" />
            </div>
            {/* Dekorasi kecil */}
            <span className="absolute top-0 right-0 text-2xl animate-bounce">?</span>
          </div>
        </div>

        {/* TEXT CONTENT */}
        <h1 className="text-6xl md:text-8xl font-extrabold text-[#712E1E] mb-2 tracking-tighter">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#8D6E63]">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-[#888870] mb-8 leading-relaxed">
          Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau link yang Anda tuju salah.
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-3">
          <Link 
            to="/" 
            className="w-full bg-[#712E1E] text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-[#5a2316] transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Kembali ke Beranda
          </Link>
          
          <button 
            onClick={() => window.history.back()} 
            className="w-full bg-white border-2 border-[#E59A59] text-[#E59A59] py-3.5 rounded-xl font-bold hover:bg-[#FFF0E0] transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Kembali ke Halaman Sebelumnya
          </button>
        </div>

        {/* FOOTER TEXT */}
        <p className="mt-12 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Wedory Platform.
        </p>
      </div>
    </div>
  );
}