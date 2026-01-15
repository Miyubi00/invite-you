// src/pages/TemplateDemo.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTemplateComponent } from '../templates/Registry'; // Pastikan path ini sesuai struktur folder Anda
import { ArrowLeft } from 'lucide-react';

export default function TemplateDemo() {
  const { slug } = useParams(); // Ambil slug dari URL (misal: 'modern-dark')

  // Ambil komponen template dari Registry
  const TemplateComponent = getTemplateComponent(slug);

  // Jika slug tidak ditemukan di registry
  if (!TemplateComponent) {
    return <div className="p-10 text-center">Template tidak ditemukan.</div>;
  }

  // Data Dummy untuk Preview
  const dummyData = {
    groom: "Romeo",
    bride: "Juliet",
    date: new Date(
      new Date().setMonth(new Date().getMonth() + 6)
    ).toISOString(),
    guestName: "Tamu Spesial",
    event_details: {
      // --- FOTO-FOTO (COVER & MEMPELAI) ---
      cover_photo: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Gambar Cover Utama
      groom_photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop", // Foto Pria
      bride_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop", // Foto Wanita

      // --- DETAIL ACARA ---
      venue_name: "Grand Ballroom Hotel",
      venue_address: "Jl. Jendral Sudirman No. 1, Jakarta",
      maps_link: "https://goo.gl/maps/example",
      akad_time: "08:00 WIB - 10:00 WIB",
      resepsi_time: "11:00 WIB - Selesai",
      groom_parents: "Bpk. Capulet & Ibu Capulet",
      bride_parents: "Bpk. Montague & Ibu Montague",

      // --- GALLERY ---
      gallery: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&fit=crop",
        "https://plus.unsplash.com/premium_photo-1663076211121-36754a46de8d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&fit=crop",
        "https://plus.unsplash.com/premium_photo-1690148812608-9942834931a1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      ],

      // --- BANK / GIFT ---
      banks: [
        { bank: "BCA", number: "1234567890", name: "Romeo" },
        { bank: "Mandiri", number: "0987654321", name: "Juliet" }
      ],

      // --- KUTIPAN ---
      quote: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri...",
      quote_source: "QS. Ar-Rum: 21",

      // --- AUDIO (Opsional) ---
      audio_url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3"
    }
  };

  return (
    <div className="relative">
      {/* Tombol Kembali Floating */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm transition shadow-lg text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>

      {/* Render Template yang Dipilih */}
      {/* Kita passing spread props untuk groom/bride/dll dan object 'data' untuk detail lainnya */}
      <TemplateComponent
        groom={dummyData.groom}
        bride={dummyData.bride}
        date={dummyData.date}
        guestName={dummyData.guestName}
        data={dummyData.event_details}
      />
    </div>
  );
}