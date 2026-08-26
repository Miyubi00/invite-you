// ============================================================
// src/lib/adminPath.ts
// ------------------------------------------------------------
// Path halaman admin, dapat diubah via env VITE_ADMIN_PATH untuk
// security by obscurity (mengurangi scanner bot otomatis).
// Catatan: JANGAN memasukkan path ini ke robots.txt.
// Dipakai di  : App.tsx, components/Navbar
// Keterikatan : env VITE_ADMIN_PATH
// ============================================================

export const ADMIN_PATH: string = import.meta.env.VITE_ADMIN_PATH || '/admin';
