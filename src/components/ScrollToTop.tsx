// ============================================================
// src/components/ScrollToTop.tsx
// ------------------------------------------------------------
// Reset posisi scroll ke atas setiap kali route berubah.
// Tanpa ini, browser mempertahankan offset scroll halaman
// sebelumnya (mis. klik "Pesan Tema" di bawah HomePage membuat
// OrderPage terbuka langsung di section bawah).
// Dipakai di  : App.tsx
// Keterikatan : react-router-dom (useLocation), react (useEffect)
// ============================================================

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, search]);

  return null;
}