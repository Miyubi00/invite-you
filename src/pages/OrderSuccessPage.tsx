// ============================================================
// src/pages/OrderSuccessPage.tsx
// ------------------------------------------------------------
// Halaman /order/success - ringkasan langkah setelah order via WhatsApp: nomor admin, template pesan siap kirim, info tunggu aktivasi.
// Dipakai di  : App.tsx
// Keterikatan : lib/constants (ADMIN_WHATSAPP), lucide-react
// ============================================================

// Halaman terima kasih setelah order via WhatsApp: ringkasan langkah
// selanjutnya + tombol hubungi admin. Statis — tanpa fetch data.

import { Link } from 'react-router-dom';
import { CheckCircle2, Home, MessageSquare, Mail, ShieldCheck } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { ADMIN_WHATSAPP } from '../lib/constants';

const STEPS = [
  {
    icon: MessageSquare,
    title: 'Konfirmasi via WhatsApp',
    desc: 'Admin kami akan menghubungi Anda untuk verifikasi dan info pembayaran.',
  },
  {
    icon: ShieldCheck,
    title: 'Aktivasi Otomatis',
    desc: 'Setelah pembayaran disetujui admin, undangan langsung diaktifkan oleh sistem.',
  },
  {
    icon: Mail,
    title: 'PIN Dikirim ke Email',
    desc: 'PIN 6 digit dibuat otomatis dan dikirim ke email Anda untuk login dashboard.',
  },
];

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-[#F1E8DC] flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-lg text-center border border-[#EBDFCE] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#25D366]"></div>

        <div className="animate-fade-in-up">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-lg shadow-green-100">
            <CheckCircle2 className="w-14 h-14" />
          </div>

          <h1 className="text-3xl font-extrabold text-[#712E1E] mb-2">Pesanan Terkirim!</h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            Data pesanan Anda sudah kami terima.
            Lanjutkan percakapan di WhatsApp agar admin bisa segera membantu.
          </p>

          {/* Langkah selanjutnya */}
          <div className="space-y-3 text-left mb-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex items-start gap-3 bg-[#FAF6EE] border border-[#EBDFCE] rounded-xl p-4">
                <span className="w-8 h-8 shrink-0 rounded-lg bg-white border border-[#EBDFCE] text-[#B4693F] grid place-items-center text-xs font-black">
                  {i + 1}
                </span>
                <step.icon size={18} className="shrink-0 mt-0.5 text-[#B4693F]" />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#712E1E]">{step.title}</p>
                  <p className="text-xs text-stone-500 leading-relaxed mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Aksi */}
          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/${ADMIN_WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20bd5a] transition shadow-lg flex items-center justify-center gap-2"
            >
              <FaWhatsapp className="w-6 h-6" /> Hubungi Admin via WA
            </a>
            <Link
              to="/"
              className="w-full py-4 bg-white border border-stone-200 text-stone-500 rounded-xl font-bold hover:bg-stone-50 transition flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" /> Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
