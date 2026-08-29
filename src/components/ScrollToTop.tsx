// ============================================================
// src/components/ScrollToTop.tsx
// ------------------------------------------------------------
// Reset posisi scroll ke atas saat navigasi BARU (klik link).
// Navigasi POP (tombol back/forward browser) sengaja dilewati
// agar posisi scroll halaman sebelumnya dipulihkan browser —
// jadi user yang kembali dari /order tetap mendarat di section
// galeri tema tempat terakhir dia berada.
// Dipakai di  : App.tsx
// Keterikatan : react-router-dom (useLocation, useNavigationType),
//               react (useEffect)
// ============================================================

import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // POP = back/forward → biarkan browser restore posisi scroll.
    if (navigationType === 'POP') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, search, navigationType]);

  return null;
}