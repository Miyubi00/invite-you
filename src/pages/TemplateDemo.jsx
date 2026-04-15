import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTemplateComponent } from '../templates/Registry'; 
import { ArrowLeft } from 'lucide-react';

export default function TemplateDemo() {
  const { slug } = useParams(); 

  // Ambil komponen template dari Registry berdasarkan slug URL
  const TemplateComponent = getTemplateComponent(slug);

  if (!TemplateComponent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <p className="text-xl mb-4">Template <span className="font-bold text-gray-800">"{slug}"</span> tidak ditemukan.</p>
        <Link to="/" className="text-blue-500 underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  // --- DATA DUMMY PREVIEW (Sesuai Request) ---
  const dummyData = {
    groom: "Romeo",
    bride: "Juliet",
    // Set tanggal 6 bulan dari sekarang
    date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
    guestName: "Tamu Spesial",
    
    // Data JSON event_details lengkap
    event_details: {
      // --- VIDEO & FOTO ---
      // (PENTING: Saya tambahkan video_url agar template Cinematic jalan)
      video_url: "https://video-previews.elements.envatousercontent.com/8a64ff3b-7e94-47b7-8e2e-30dae1f5c957/watermarked_preview/watermarked_preview.mp4",
      cover_photo: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1470&auto=format&fit=crop",
      groom_photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop",
      bride_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop",

      // --- DETAIL ACARA ---
      venue_name: "Grand Ballroom Hotel Indonesia",
      venue_address: "Jl. Jendral Sudirman No. 1, Jakarta Pusat, DKI Jakarta",
      maps_link: "https://goo.gl/maps/example",
      akad_time: "08:00 WIB - 10:00 WIB",
      resepsi_time: "11:00 WIB - Selesai",
      groom_parents: "Bpk. Capulet & Ibu Capulet",
      bride_parents: "Bpk. Montague & Ibu Montague",

      // --- GALLERY ---
      gallery: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&fit=crop",
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&fit=crop",
        "https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=500&fit=crop",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      ],

      // --- BANK ---
      banks: [
        { bank: "BCA", number: "1234567890", name: "Romeo" },
        { bank: "Mandiri", number: "0987654321", name: "Juliet" }
      ],

      // --- KUTIPAN & MUSIK ---
      quote: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya.",
      quote_src: "QS. Ar-Rum: 21",
      audio_url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_1086088e5d.mp3",

      // --- DUMMY RSVPS (CHAT) ---
      rsvps: [
        {
            id: 1,
            guest_name: "Budi Santoso",
            status: "hadir",
            message: "Selamat menempuh hidup baru bro Romeo! Semoga samawa yaaa 🥳",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            reply: "Aamiin, makasih banyak bro Budi! Ditunggu kehadirannya!"
        },
        {
            id: 2,
            guest_name: "Siti Aminah",
            status: "tidak_hadir",
            message: "Maaf ya Juliet belum bisa hadir karena ada dinas luar kota. Happy Wedding! ❤️",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 jam lalu
            reply: null
        },
        {
            id: 3,
            guest_name: "Dedi Corbuzier",
            status: "ragu",
            message: "Wah selamat! Cek jadwal dulu ya, semoga bisa mampir.",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 hari lalu
            reply: null
        }
      ]
    }
  };

  return (
    <div className="relative">
      {/* Tombol Kembali Floating */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm transition shadow-lg text-sm font-medium border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>

      {/* Render Template */}
      <TemplateComponent
        groom={dummyData.groom}
        bride={dummyData.bride}
        date={dummyData.date}
        guestName={dummyData.guestName}
        
        // Pass 'demo' ID agar RSVP bisa dirender tapi tidak kirim ke DB beneran
        orderId="demo" 
        
        data={dummyData.event_details}
      />
    </div>
  );
}