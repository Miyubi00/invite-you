import React from 'react';
import { Instagram, MessageCircle, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function Contact() {
  // Data Kontak (Ganti dengan nomor aslimu)
  const contacts = {
    instagram: {
      username: '@invyta.id',
      link: 'https://instagram.com/invyta.id'
    },
    whatsappMain: {
      name: 'Admin Utama (Sales)',
      number: '6281234567890', // Format: 628...
      label: 'Konsultasi & Order'
    },
    whatsappAdmins: [
      { name: 'Admin Support 1', number: '628987654321', label: 'Bantuan Teknis' },
      { name: 'Admin Support 2', number: '628555555555', label: 'Revisi Desain' },
    ]
  };

  const handleWA = (number, message) => {
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FFD5AF] font-sans text-[#712E1E] p-4 md:p-8 flex flex-col items-center pt-24 md:pt-32">
      {/* Note: pt-24 ditambahkan agar konten tidak tertutup Navbar jika Navbar-nya fixed, 
          atau sekadar memberi jarak napas yang pas dari atas */}

      {/* --- HEADER TITLE --- */}
      <div className="w-full max-w-2xl text-center space-y-2 mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#712E1E]">Hubungi Kami</h1>
        <p className="opacity-80 text-sm md:text-base">
          Punya pertanyaan atau butuh bantuan? Tim invyta siap membantu!
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-6">

        {/* 1. KARTU INSTAGRAM */}
        <div className="bg-white rounded-3xl p-6 shadow-xl flex items-center justify-between hover:scale-[1.02] transition duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-pink-100 p-3 rounded-full">
              <Instagram className="w-8 h-8 text-pink-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Instagram</h3>
              <p className="text-sm opacity-70">Portofolio & Testimoni</p>
            </div>
          </div>
          <a 
            href={contacts.instagram.link} 
            target="_blank" 
            rel="noreferrer"
            className="px-4 py-2 bg-pink-500 text-white rounded-xl font-bold text-sm hover:bg-pink-600 transition"
          >
            Follow
          </a>
        </div>

        {/* 2. KARTU WHATSAPP UTAMA */}
        <div className="bg-[#712E1E] text-white rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">WhatsApp Utama</h2>
            <p className="mb-6 opacity-90 text-sm md:text-base">Respon tercepat untuk pemesanan baru.</p>
            
            <button 
                onClick={() => handleWA(contacts.whatsappMain.number, "Halo Admin, saya mau tanya tentang undangan digital...")}
                className="bg-[#E59A59] text-white w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 hover:bg-[#d48b4b] transition shadow-lg"
            >
                <FaWhatsapp className="w-6 h-6" />
                Chat {contacts.whatsappMain.name}
            </button>
          </div>
          {/* Hiasan background */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
        </div>

        {/* 3. LIST ADMIN LAINNYA */}
        <div>
          <h3 className="text-center font-bold mb-4 opacity-70 uppercase tracking-widest text-xs">Admin Lainnya</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.whatsappAdmins.map((admin, idx) => (
              <button
                key={idx}
                onClick={() => handleWA(admin.number, "Halo Admin, saya butuh bantuan...")}
                className="bg-white p-4 rounded-2xl shadow-md flex items-center gap-3 hover:bg-green-50 transition border border-transparent hover:border-green-200 text-left"
              >
                <div className="bg-green-100 p-2.5 rounded-full text-green-600">
                  <FaWhatsapp className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-bold text-sm">{admin.name}</p>
                    <p className="text-xs opacity-60">{admin.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer text */}
      <p className="mt-12 text-xs opacity-50 text-center pb-10">
        Jam Operasional: Senin - Minggu (09.00 - 21.00 WIB)
      </p>
    </div>
  );
}