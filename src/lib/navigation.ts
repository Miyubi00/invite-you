// ============================================================
// src/lib/navigation.ts
// ------------------------------------------------------------
// Helper navigasi bersama: kembali ke halaman sebelumnya bila
// ada riwayat (perilaku "back" — posisi scroll dipulihkan
// browser), fallback ke beranda bila dibuka langsung via URL.
// Dipakai di  : pages/OrderPage, pages/OrderSuccessPage,
//               components/Navbar
// Keterikatan : react-router-dom (NavigateFunction)
// ============================================================

import type { NavigateFunction } from 'react-router-dom';

export function goBackOrHome(navigate: NavigateFunction) {
  // React Router menyimpan idx sesi di history.state.
  // idx > 0 artinya ada halaman sebelumnya untuk di-back.
  const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
  if (idx > 0) {
    navigate(-1);
  } else {
    navigate('/', { replace: true });
  }
}