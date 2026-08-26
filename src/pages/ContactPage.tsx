// ============================================================
// src/pages/ContactPage.tsx
// ------------------------------------------------------------
// Halaman /contact - pusat bantuan: WhatsApp utama (kartu premium),
// admin support lainnya, Instagram, dan jam operasional dengan status
// buka/tutup otomatis. Dipakai di  : App.tsx
// Keterikatan : lucide-react, react-icons, i18n
// ============================================================

import { useMemo } from 'react';
import {
  CalendarCheck,
  ChevronRight,
  Clock,
  Instagram,
  Sparkles,
  Zap,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useTranslation } from '../i18n';

interface WaAdmin {
  name: string;
  number: string;
  labelKey: 'contact.adminSales' | 'contact.adminTech' | 'contact.adminDesign';
}

interface ContactData {
  instagram: { username: string; link: string };
  whatsappMain: { name: string; number: string; labelKey: 'contact.adminSales' };
  whatsappAdmins: WaAdmin[];
}

export default function Contact() {
  const { t } = useTranslation();

  const contacts: ContactData = {
    instagram: {
      username: '@loverse.id',
      link: 'https://instagram.com/loverse.id'
    },
    whatsappMain: {
      name: 'Admin Utama (Sales)',
      number: '6287777016398',
      labelKey: 'contact.adminSales'
    },
    whatsappAdmins: [
      { name: 'Admin Support 1', number: '6289639543075', labelKey: 'contact.adminTech' },
      { name: 'Admin Support 2', number: '6285179880092', labelKey: 'contact.adminDesign' },
    ]
  };

  const handleWA = (number: string, message: string) => {
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const isOpen = useMemo(() => {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    return hour >= 9 && hour < 21;
  }, []);

  return (
    <div className="min-h-screen bg-[#F1E8DC] font-sans text-[#712E1E] relative overflow-x-hidden">
      {/* Dekorasi latar */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 sm:w-96 sm:h-96 bg-[#E59A59]/20 rounded-full blur-3xl" />
        <div className="absolute top-48 -right-28 w-72 h-72 sm:w-96 sm:h-96 bg-[#712E1E]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#E59A59]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16">
        {/* --- HERO --- */}
        <header className="text-center max-w-2xl mx-auto mb-10 md:mb-14 space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-[#EBDFCE] shadow-xs text-[11px] md:text-xs font-bold uppercase tracking-widest text-[#B4693F]">
            <Sparkles size={13} className="text-[#E59A59]" />
            {t('contact.badge')}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
            {t('contact.title')}
          </h1>
          <p className="text-sm md:text-base text-stone-600 max-w-xl mx-auto">
            {t('contact.subtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1.5 text-xs font-semibold text-stone-600">
            <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-[#EBDFCE]/80">
              <Zap size={14} className="text-[#E59A59]" />
              {t('contact.trustFast')}
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-[#EBDFCE]/80">
              <CalendarCheck size={14} className="text-emerald-600" />
              {t('contact.trustDaily')}
            </span>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_340px] gap-5 lg:gap-8 items-start w-full min-w-0 max-w-full">
          {/* ===== KOLOM UTAMA ===== */}
          <div className="space-y-6 min-w-0 w-full max-w-full">

            {/* 1. KARTU WHATSAPP UTAMA */}
            <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#712E1E] via-[#7A3620] to-[#4A1D12] text-white p-6 sm:p-8 shadow-lg">
              {/* Hiasan background berlapis */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute -top-16 -right-16 w-52 h-52 bg-white/5 rounded-full" />
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full border border-white/10" />
                <div className="absolute -bottom-20 -left-12 w-56 h-56 bg-[#E59A59]/15 rounded-full blur-2xl" />
              </div>

              <div className="relative flex items-start gap-4">
                <div className="shrink-0 p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 shadow-inner">
                  <FaWhatsapp className="w-7 h-7 sm:w-8 sm:h-8 text-[#FFD5AF]" />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-400/15 border border-emerald-300/30 text-emerald-200 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t('contact.onlineChip')}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">
                    {t('contact.whatsappMainTitle')}
                  </h2>
                  <p className="text-sm opacity-90">{t('contact.whatsappMainDesc')}</p>
                </div>
              </div>

              <button
                onClick={() => handleWA(contacts.whatsappMain.number, "Halo Admin, saya mau tanya tentang undangan digital...")}
                className="relative mt-6 bg-[#E59A59] text-white w-full py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg flex justify-center items-center gap-2 hover:bg-[#d48b4b] active:scale-[0.98] transition shadow-lg"
              >
                <FaWhatsapp className="w-5 h-5 sm:w-6 sm:h-6" />
                {t('contact.whatsappMainBtn', { name: contacts.whatsappMain.name })}
              </button>
            </section>

            {/* 2. LIST ADMIN LAINNYA */}
            <section>
              <h3 className="font-bold uppercase tracking-widest text-xs text-stone-500 mb-3">
                {t('contact.otherAdminsTitle')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {contacts.whatsappAdmins.map((admin, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleWA(admin.number, "Halo Admin, saya butuh bantuan...")}
                    className="group bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3.5 hover:bg-green-50/60 hover:border-green-300 hover:shadow-md active:scale-[0.98] transition border border-[#EBDFCE] text-left min-h-[68px]"
                  >
                    <div className="shrink-0 bg-green-50 border border-green-100 p-2.5 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:border-green-600 group-hover:text-white transition">
                      <FaWhatsapp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{admin.name}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold bg-[#F7EEE3] text-[#B4693F] px-2 py-0.5 rounded-full border border-[#EBDFCE] truncate max-w-full">
                        {t(admin.labelKey)}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 text-stone-300 group-hover:text-green-600 group-hover:translate-x-0.5 transition" />
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* ===== SIDEBAR ===== */}
          <aside className="space-y-5 w-full max-w-full lg:sticky lg:top-20">

            {/* KARTU INSTAGRAM */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EBDFCE] shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3.5">
                <div className="shrink-0 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 text-white p-3 rounded-2xl shadow-sm">
                  <Instagram className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold">{t('contact.instagramTitle')}</h3>
                  <p className="text-xs text-stone-500 truncate">{t('contact.instagramSubtitle')}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 bg-[#FAF6EE] border border-[#EBDFCE] rounded-xl px-3.5 py-2.5 text-sm font-semibold">
                <Instagram size={14} className="text-pink-500 shrink-0" />
                <span className="truncate">{contacts.instagram.username}</span>
              </div>
              <a
                href={contacts.instagram.link}
                target="_blank"
                rel="noreferrer"
                className="mt-3 w-full py-2.5 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl font-bold text-sm transition hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Instagram className="w-4 h-4" />
                {t('contact.instagramFollow')}
              </a>
            </div>

            {/* KARTU JAM OPERASIONAL */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EBDFCE] shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3.5">
                <div className="shrink-0 bg-[#F7EEE3] border border-[#EBDFCE] text-[#B4693F] p-3 rounded-2xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold">{t('contact.hoursTitle')}</h3>
                  <p className="text-xs text-stone-500">WIB</p>
                </div>
              </div>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-stone-500">{t('contact.hoursDays')}</dt>
                  <dd className="font-bold whitespace-nowrap">{t('contact.hoursTime')}</dd>
                </div>
              </dl>
              <span
                className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                  isOpen
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-stone-100 text-stone-500 border-stone-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-stone-400'}`} />
                {isOpen ? t('contact.openNow') : t('contact.closedNow')}
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
