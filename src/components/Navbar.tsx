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
  else if (path === '/admin') {
    navConfig = {
      title: t('nav.adminPanel'),
      icon: <ShieldCheck className="w-5 h-5 md:w-8 md:h-8 text-yellow-400" />,
      mode: 'admin'
    };
  }
  else if (path === '/contact') {
    navConfig = {
      title: t('nav.contact'),
      icon: <Phone className="w-5 h-5 md:w-8 md:h-8 text-yellow-400" />,
      mode: 'home'
    };
  }

  return (
    <nav className="bg-[#712E1E] px-4 md:px-12 py-3 md:py-4 flex justify-between items-center shadow-lg sticky top-0 z-50 transition-all duration-300">

      {/* LOGO / JUDUL */}
      <div className="text-lg md:text-2xl font-bold text-[#FFD5AF] tracking-wide truncate mr-2">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
          {navConfig.icon}
          <span>{navConfig.title}</span>
        </Link>
      </div>

      <div className="flex gap-2 md:gap-3 items-center">

        {/* Switcher Bahasa ID/EN */}
        <LanguageSwitcher variant="header" />

        {isLandingPage && (
          <Link
            to="/contact"
            className="px-3 md:px-5 py-2 rounded-xl bg-[#F1E8DC] text-[#712E1E] text-xs md:text-base font-medium hover:bg-white transition flex items-center gap-1 md:gap-2 whitespace-nowrap"
          >
            <Phone className="w-3 h-3 md:w-4 md:h-4" />
            <span>{t('nav.contact')}</span>
          </Link>
        )}

        {/* --- TOMBOL DINAMIS --- */}

        {/* CASE 1: MODE HOME (Balik ke Depan) */}
        {navConfig.mode === 'home' && (
          <Link to="/" className="px-3 md:px-5 py-2 rounded-xl bg-[#E59A59] text-white text-xs md:text-base font-medium hover:bg-[#d48b4b] transition flex items-center gap-1 md:gap-2 shadow-md whitespace-nowrap">
            <Home className="w-3 h-3 md:w-4 md:h-4" />
            <span>{t('nav.home')}</span>
          </Link>
        )}

        {/* CASE 2: MODE LOGOUT (Khusus Dashboard) */}
        {navConfig.mode === 'logout' && (
          <button
            onClick={handleLogout}
            className="px-3 md:px-5 py-2 rounded-xl bg-red-600 text-white text-xs md:text-base font-medium hover:bg-red-700 transition flex items-center gap-1 md:gap-2 shadow-md whitespace-nowrap"
          >
            <LogOut className="w-3 h-3 md:w-4 md:h-4" />
            <span>{t('nav.logout')}</span>
          </button>
        )}

        {/* CASE 3: DEFAULT (Tombol Login) */}
        {navConfig.mode === 'default' && (
          <Link to="/login" className="px-3 md:px-5 py-2 rounded-xl bg-[#E59A59] text-white text-xs md:text-base font-medium hover:bg-[#d48b4b] transition flex items-center gap-1 md:gap-2 shadow-md whitespace-nowrap">
            <LogIn className="w-3 h-3 md:w-4 md:h-4" />
            <span>{t('nav.login')}</span>
          </Link>
        )}

        {navConfig.mode === 'admin' && (
          <span className="text-white text-xs bg-red-600 px-3 py-1 rounded-xl font-bold animate-pulse">
            {t('nav.superuserMode')}
          </span>
        )}

      </div>
    </nav>
  );
}