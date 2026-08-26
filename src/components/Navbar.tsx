// ============================================================
// src/components/Navbar.tsx
// ------------------------------------------------------------
// Navbar publik (tema coklat) untuk halaman marketing: link Home, Order, Login, Contact + state sesi admin.
// Dipakai di  : layouts/PublicLayout.tsx
// Keterikatan : react-router-dom (Link/useLocation), lucide-react
// ============================================================

import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartHandshake, LogIn, Home, CreditCard, UserCircle, LogOut, LayoutDashboard, Phone, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n';
import LanguageSwitcher from './shared/LanguageSwitcher';
import { ADMIN_PATH } from '../lib/adminPath';

type NavMode = 'default' | 'home' | 'logout' | 'admin';

interface NavConfig {
  title: string;
  icon: ReactNode;
  mode: NavMode;
}

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Cek apakah ini halaman Landing Page?
  const isLandingPage = path === '/';

  // Handler Logout
  const handleLogout = () => {
    if (window.confirm(t('nav.logoutConfirm'))) {
      sessionStorage.removeItem('active_order_id');
      sessionStorage.removeItem('order_pin');
      localStorage.removeItem('active_order_id');
      navigate('/');
    }
  };

  // --- LOGIKA PINTAR (CONFIG) ---
  let navConfig: NavConfig = {
    title: t('nav.brand'),
    icon: <HeartHandshake className="w-5 h-5 md:w-8 md:h-8" />,
    mode: 'default'
  };

  if (path === '/order') {
    navConfig = {
      title: t('nav.order'),
      icon: <CreditCard className="w-5 h-5 md:w-8 md:h-8" />,
      mode: 'home'
    };
  }
  else if (path === '/login') {
    navConfig = {
      title: t('login.title'),
      icon: <UserCircle className="w-5 h-5 md:w-8 md:h-8" />,
      mode: 'home'
    };
  }
  else if (path.startsWith('/dashboard')) {
    navConfig = {
      title: t('nav.dashboard'),
      icon: <LayoutDashboard className="w-5 h-5 md:w-8 md:h-8" />,
      mode: 'logout'
    };
  }
  else if (path === ADMIN_PATH) {
    navConfig = {
      title: t('nav.adminPanel'),
      icon: <ShieldCheck className="w-5 h-5 md:w-8 md:h-8 text-yellow-400" />,
      mode: 'admin'
    };
  }
  else if (path === '/contact') {
    navConfig = {
      title: t('nav.contact'),
      icon: <Phone className="w-5 h-5 md:w-8 md:h-8 text-[#FFD5AF]" />,
      mode: 'home'
    };
  }

  return (
    <nav className="bg-[#712E1E] w-full max-w-full px-3 sm:px-6 md:px-12 py-2.5 sm:py-3.5 flex justify-between items-center shadow-md sticky top-0 z-50 transition-all duration-300">

      {/* LOGO / JUDUL */}
      <div className="text-sm sm:text-lg md:text-xl font-black text-[#FFD5AF] tracking-tight truncate min-w-0 mr-2">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition min-w-0">
          {navConfig.icon}
          <span className="font-extrabold truncate">{navConfig.title}</span>
        </Link>
      </div>

      <div className="flex gap-1.5 sm:gap-2.5 items-center shrink-0">

        {/* Switcher Bahasa ID/EN */}
        <LanguageSwitcher variant="header" />

        {/* Kontak: icon-only di mobile (gaya tombol Login), teks muncul mulai layar kecil ke atas */}
        {isLandingPage && (
          <Link
            to="/contact"
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#F1E8DC] text-[#712E1E] text-xs sm:text-sm font-bold hover:bg-[#d48b4b] transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">{t('nav.contact')}</span>
          </Link>
        )}

        {/* --- TOMBOL DINAMIS --- */}

        {/* CASE 1: MODE HOME (Balik ke Depan) */}
        {navConfig.mode === 'home' && (
          <Link to="/" className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#E59A59] text-white text-xs sm:text-sm font-bold hover:bg-[#d48b4b] transition flex items-center gap-1.5 shadow-sm whitespace-nowrap">
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">{t('nav.home')}</span>
          </Link>
        )}

        {/* CASE 2: MODE LOGOUT (Khusus Dashboard) */}
        {navConfig.mode === 'logout' && (
          <button
            onClick={handleLogout}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-red-600 text-white text-xs sm:text-sm font-bold hover:bg-red-700 transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">{t('nav.logout')}</span>
          </button>
        )}

        {/* CASE 3: DEFAULT (Tombol Login) */}
        {navConfig.mode === 'default' && (
          <Link to="/login" className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#E59A59] text-white text-xs sm:text-sm font-bold hover:bg-[#d48b4b] transition flex items-center gap-1.5 shadow-sm whitespace-nowrap">
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">{t('nav.login')}</span>
          </Link>
        )}

        {navConfig.mode === 'admin' && (
          <span className="text-white text-[10px] sm:text-xs bg-red-600 px-2 py-1 rounded-xl font-bold animate-pulse">
            {t('nav.superuserMode')}
          </span>
        )}

      </div>
    </nav>
  );
}