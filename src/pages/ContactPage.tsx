// ============================================================
// src/pages/ContactPage.tsx
// ------------------------------------------------------------
// Halaman /contact - Pusat bantuan pelanggan terpadu dengan
// AI Assistant instan 24/7, kontak WhatsApp langsung per divisi
// (Sales, Teknis, Desain), dan jam operasional real-time WIB.
// Dipakai di  : App.tsx
// Keterikatan : lucide-react, react-icons, i18n,
//               components/contact/AiAssistant, useCopyToClipboard
// ============================================================

import { useState, useEffect } from 'react';
import {
  CalendarCheck,
  ChevronRight,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Headset,
  Instagram,
  Sparkles,
  Zap,
  Bot,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useTranslation } from '../i18n';
import AiAssistant from '../components/contact/AiAssistant';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

interface WaAdmin {
  name: string;
  number: string;
  displayNumber: string;
  labelKey: 'contact.adminSales' | 'contact.adminTech' | 'contact.adminDesign';
  defaultMessage: string;
}

interface ContactData {
  instagram: { username: string; link: string };
  whatsappMain: {
    name: string;
    number: string;
    displayNumber: string;
    labelKey: 'contact.adminSales';
    defaultMessage: string;
  };
  whatsappAdmins: WaAdmin[];
}

/** Format & kalkulasi real-time zona waktu Jakarta (WIB / UTC+7) */
function getWibStatus() {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const currentDecimal = hour + minute / 60;
    const isOpen = currentDecimal >= 9 && currentDecimal < 21;
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} WIB`;
    return { isOpen, timeString };
  } catch {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    return {
      isOpen: hour >= 9 && hour < 21,
      timeString: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} WIB`,
    };
  }
}

/** Komponen Judul Section dengan Icon & Garis Pembatas Halus */
function SectionHeader({
  icon: Icon,
  label,
  desc,
}: {
  icon: LucideIcon;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white border border-[#EBDFCE] shadow-xs flex items-center justify-center text-[#B4693F]">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-extrabold text-[#712E1E] leading-tight">
          {label}
        </h2>
        <p className="text-xs text-stone-500 truncate">{desc}</p>
      </div>
      <div
        aria-hidden="true"
        className="hidden sm:block flex-1 h-px bg-gradient-to-r from-[#E3D5C0] to-transparent ml-2"
      />
    </div>
  );
}

export default function Contact() {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();

  // Status salin per nomor / username
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Status Jam Operasional WIB Real-time
  const [wibInfo, setWibInfo] = useState(() => getWibStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setWibInfo(getWibStatus());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const contacts: ContactData = {
    instagram: {
      username: '@loverse.id',
      link: 'https://instagram.com/loverse.id',
    },
    whatsappMain: {
      name: 'Admin Utama (Sales)',
      number: '6287777016398',
      displayNumber: '+62 877-7701-6398',
      labelKey: 'contact.adminSales',
      defaultMessage: 'Halo Admin LoVerse, saya mau konsultasi & tanya tentang undangan digital...',
    },
    whatsappAdmins: [
      {
        name: 'Admin Support 1',
        number: '6289639543075',
        displayNumber: '+62 896-3954-3075',
        labelKey: 'contact.adminTech',
        defaultMessage: 'Halo Tim Support LoVerse, saya butuh bantuan teknis / aktivasi undangan...',
      },
      {
        name: 'Admin Support 2',
        number: '6285179880092',
        displayNumber: '+62 851-7988-0092',
        labelKey: 'contact.adminDesign',
        defaultMessage: 'Halo Tim Desain LoVerse, saya butuh bantuan kustomisasi / revisi desain undangan...',
      },
    ],
  };

  const handleWA = (number: string, message: string) => {
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopy = (text: string, label: string, key: string) => {
    copyToClipboard(text, label);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F1E8DC] font-sans text-[#712E1E] relative overflow-x-hidden">
      {/* Background Ambience / Glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-28 w-80 h-80 sm:w-96 sm:h-96 bg-[#E59A59]/20 rounded-full blur-3xl" />
        <div className="absolute top-48 -right-32 w-80 h-80 sm:w-96 sm:h-96 bg-[#712E1E]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-[#E59A59]/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 pb-16 sm:pb-24">
        {/* ============================================================ */}
        {/* 1. HERO HEADER */}
        {/* ============================================================ */}
        <header className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xs px-4 py-1.5 rounded-full border border-[#EBDFCE] shadow-xs text-xs font-bold uppercase tracking-wider text-[#B4693F]">
            <Sparkles size={14} className="text-[#E59A59] animate-pulse" />
            {t('contact.badge')}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#712E1E] tracking-tight leading-tight">
            {t('contact.title')}
          </h1>

          <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
            {t('contact.subtitle')}
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#EBDFCE] shadow-xs text-xs font-semibold text-stone-700">
              <Zap size={14} className="text-[#E59A59] shrink-0" />
              {t('contact.trustFast')}
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#EBDFCE] shadow-xs text-xs font-semibold text-stone-700">
              <CalendarCheck size={14} className="text-emerald-600 shrink-0" />
              {t('contact.trustDaily')}
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#EBDFCE] shadow-xs text-xs font-semibold text-stone-700">
              <Bot size={14} className="text-[#B4693F] shrink-0" />
              {t('contact.ai.onlineChip')}
            </span>
          </div>
        </header>

        {/* ============================================================ */}
        {/* 2. MAIN 12-COLUMN GRID LAYOUT */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full min-w-0 max-w-full">
          {/* ============================================================ */}
          {/* KOLOM UTAMA (7 Kolom pada Desktop) */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 min-w-0 w-full">
            {/* --- SECTION 1: AI ASSISTANT --- */}
            <section className="space-y-3.5">
              <SectionHeader
                icon={Sparkles}
                label={t('contact.sectionAi')}
                desc={t('contact.sectionAiDesc')}
              />
              <AiAssistant waNumber={contacts.whatsappMain.number} />
            </section>

            {/* --- SECTION 2: TIM SUPPORT MANUSIA (WHATSAPP) --- */}
            <section className="space-y-3.5">
              <SectionHeader
                icon={Headset}
                label={t('contact.sectionHuman')}
                desc={t('contact.sectionHumanDesc')}
              />

              {/* Kartu WhatsApp Utama (Sales & Konsultasi) */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#712E1E] via-[#7A3620] to-[#4A1D12] text-white p-5 sm:p-7 shadow-lg shadow-[#712E1E]/15 border border-white/10">
                {/* Background Pattern Decorative Rings */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                  <div className="absolute -top-16 -right-16 w-52 h-52 bg-white/5 rounded-full" />
                  <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full border border-white/10" />
                  <div className="absolute -bottom-20 -left-12 w-56 h-56 bg-[#E59A59]/20 rounded-full blur-2xl" />
                </div>

                <div className="relative space-y-4">
                  {/* Top Row: Icon + Info */}
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <div className="shrink-0 p-3 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 shadow-inner">
                      <FaWhatsapp className="w-6 h-6 sm:w-7 sm:h-7 text-[#FFD5AF]" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {t('contact.onlineChip')}
                        </span>
                        <span className="text-[11px] font-semibold text-[#FFD5AF]/80 bg-white/10 px-2 py-0.5 rounded-full">
                          {t('contact.adminSales')}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                        {t('contact.whatsappMainTitle')}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                        {t('contact.whatsappMainDesc')}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      onClick={() =>
                        handleWA(
                          contacts.whatsappMain.number,
                          contacts.whatsappMain.defaultMessage,
                        )
                      }
                      className="flex-1 min-h-[46px] bg-[#E59A59] text-white px-5 py-3 rounded-xl font-bold text-sm flex justify-center items-center gap-2 hover:bg-[#d48b4b] hover:shadow-lg hover:shadow-[#E59A59]/30 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                    >
                      <FaWhatsapp className="w-5 h-5 shrink-0" />
                      <span>{t('contact.whatsappMainBtn', { name: contacts.whatsappMain.name })}</span>
                    </button>

                    <button
                      onClick={() =>
                        handleCopy(
                          contacts.whatsappMain.number,
                          'Nomor WhatsApp Utama',
                          'wa-main',
                        )
                      }
                      title="Salin nomor WhatsApp"
                      className="min-h-[46px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white/90 hover:text-white border border-white/15 text-xs font-semibold flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
                    >
                      {copiedKey === 'wa-main' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#FFD5AF]" />
                          <span className="font-mono">{contacts.whatsappMain.displayNumber}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-Admins Grid (2 Kolom di Tablet/Desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {contacts.whatsappAdmins.map((admin, idx) => (
                  <div
                    key={idx}
                    className="group bg-white p-4 rounded-2xl shadow-xs border border-[#EBDFCE] hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:border-emerald-600 group-hover:text-white transition-colors duration-200">
                        <FaWhatsapp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-[#712E1E] truncate">{admin.name}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold bg-[#F7EEE3] text-[#B4693F] px-2 py-0.5 rounded-full border border-[#EBDFCE] truncate max-w-full">
                          {t(admin.labelKey)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#EBDFCE]/60">
                      <button
                        onClick={() => handleWA(admin.number, admin.defaultMessage)}
                        className="flex-1 min-h-[38px] py-2 px-3 bg-[#FAF6EE] hover:bg-emerald-600 hover:text-white text-[#712E1E] text-xs font-bold rounded-xl border border-[#EBDFCE] hover:border-emerald-600 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                      >
                        <FaWhatsapp className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60 group-hover:opacity-100" />
                      </button>

                      <button
                        onClick={() =>
                          handleCopy(admin.number, `Nomor WhatsApp ${admin.name}`, `wa-${idx}`)
                        }
                        title={`Salin ${admin.displayNumber}`}
                        className="p-2 min-h-[38px] min-w-[38px] rounded-xl bg-[#FAF6EE] hover:bg-stone-200 text-stone-500 hover:text-stone-700 border border-[#EBDFCE] flex items-center justify-center transition cursor-pointer active:scale-[0.95]"
                      >
                        {copiedKey === `wa-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ============================================================ */}
          {/* SIDEBAR (5 Kolom pada Desktop, Sticky) */}
          {/* ============================================================ */}
          <aside className="lg:col-span-5 space-y-5 w-full min-w-0 max-w-full lg:sticky lg:top-24">
            {/* KARTU 1: JAM OPERASIONAL (REAL-TIME WIB) */}
            <div className="bg-white rounded-3xl border border-[#EBDFCE] shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 bg-[#F7EEE3] border border-[#EBDFCE] text-[#B4693F] p-2.5 rounded-2xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#712E1E] text-base leading-tight">
                      {t('contact.hoursTitle')}
                    </h3>
                    <p className="text-xs text-stone-500">Waktu Indonesia Barat (WIB)</p>
                  </div>
                </div>

                {/* Status Badge Live */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                    wibInfo.isOpen
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      wibInfo.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                    }`}
                  />
                  {wibInfo.isOpen ? t('contact.openNow') : t('contact.closedNow')}
                </span>
              </div>

              <div className="bg-[#FAF6EE] border border-[#EBDFCE] rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Waktu saat ini (Jakarta):</span>
                  <span className="font-bold text-[#712E1E] font-mono">{wibInfo.timeString}</span>
                </div>
                <div className="h-px bg-[#EBDFCE]" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">{t('contact.hoursDays')}</span>
                  <span className="font-bold text-[#712E1E]">{t('contact.hoursTime')}</span>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed flex items-center gap-1.5">
                <Info size={13} className="text-[#B4693F] shrink-0" />
                <span>Di luar jam operasional, AI Assistant tetap siap menjawab 24 jam.</span>
              </p>
            </div>

            {/* KARTU 2: INSTAGRAM RESMI */}
            <div className="bg-white rounded-3xl border border-[#EBDFCE] shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="shrink-0 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 text-white p-3 rounded-2xl shadow-sm">
                  <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-[#712E1E] text-base leading-tight">
                    {t('contact.instagramTitle')}
                  </h3>
                  <p className="text-xs text-stone-500 truncate">{t('contact.instagramSubtitle')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 bg-[#FAF6EE] border border-[#EBDFCE] rounded-2xl px-3.5 py-2.5 text-sm font-semibold">
                <div className="flex items-center gap-2 min-w-0">
                  <Instagram size={15} className="text-pink-500 shrink-0" />
                  <span className="truncate text-stone-800 font-medium">
                    {contacts.instagram.username}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleCopy(contacts.instagram.username, 'Username Instagram', 'ig')
                  }
                  title="Salin username"
                  className="p-1 text-stone-400 hover:text-stone-600 transition cursor-pointer"
                >
                  {copiedKey === 'ig' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <a
                href={contacts.instagram.link}
                target="_blank"
                rel="noreferrer"
                className="w-full min-h-[44px] bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white rounded-xl font-bold text-sm transition-all hover:opacity-95 hover:shadow-lg hover:shadow-pink-500/25 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>{t('contact.instagramFollow')}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
