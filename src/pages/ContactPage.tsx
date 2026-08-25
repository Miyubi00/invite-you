import { Instagram, Phone } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#F1E8DC] font-sans text-[#712E1E] p-4 md:p-8 flex flex-col items-center pt-24 md:pt-32">
      {/* --- HEADER TITLE --- */}
      <div className="w-full max-w-2xl text-center space-y-2 mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#712E1E]">{t('contact.title')}</h1>
        <p className="opacity-80 text-sm md:text-base">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-6">

        {/* 1. KARTU INSTAGRAM */}
        <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center justify-between hover:scale-[1.02] transition duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-pink-100 p-3 rounded-full">
              <Instagram className="w-8 h-8 text-pink-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t('contact.instagramTitle')}</h3>
              <p className="text-sm opacity-70">{t('contact.instagramSubtitle')}</p>
            </div>
          </div>
          <a 
            href={contacts.instagram.link} 
            target="_blank" 
            rel="noreferrer"
            className="px-4 py-2 bg-pink-500 text-white rounded-xl font-bold text-sm hover:bg-pink-600 transition"
          >
            {t('contact.instagramFollow')}
          </a>
        </div>

        {/* 2. KARTU WHATSAPP UTAMA */}
        <div className="bg-[#712E1E] text-white rounded-2xl p-8 shadow-xl text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">{t('contact.whatsappMainTitle')}</h2>
            <p className="mb-6 opacity-90 text-sm md:text-base">{t('contact.whatsappMainDesc')}</p>
            
            <button 
                onClick={() => handleWA(contacts.whatsappMain.number, "Halo Admin, saya mau tanya tentang undangan digital...")}
                className="bg-[#E59A59] text-white w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 hover:bg-[#d48b4b] transition shadow-lg"
            >
                <FaWhatsapp className="w-6 h-6" />
                {t('contact.whatsappMainBtn', { name: contacts.whatsappMain.name })}
            </button>
          </div>
          {/* Hiasan background */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
        </div>

        {/* 3. LIST ADMIN LAINNYA */}
        <div>
          <h3 className="text-center font-bold mb-4 opacity-70 uppercase tracking-widest text-xs">{t('contact.otherAdminsTitle')}</h3>
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
                    <p className="text-xs opacity-60">{t(admin.labelKey)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer text */}
      <p className="mt-12 text-xs opacity-50 text-center pb-10">
        {t('contact.operatingHours')}
      </p>
    </div>
  );
}