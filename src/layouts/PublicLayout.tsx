// ============================================================
// src/layouts/PublicLayout.tsx
// ------------------------------------------------------------
// Layout halaman publik (navbar coklat + konten) untuk Home, Order, Login, Payment Status, Contact.
// Dipakai di  : App.tsx
// Keterikatan : react-router-dom (Outlet), components/Navbar
// ============================================================

import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

// PUBLIC LAYOUT (Navbar + Konten)
// Dipakai untuk: Home, Order, Login, Admin.
// Halaman Dashboard TIDAK memakai layout ini (full screen + sidebar sendiri),
// jadi halaman app-like tidak membuat dokumen ikut scroll.
export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F1E8DC]"> {/* Background default */}
        <Outlet />
      </div>
    </>
  );
}
