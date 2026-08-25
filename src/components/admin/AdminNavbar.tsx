// ============================================================
// src/components/admin/AdminNavbar.tsx
// ------------------------------------------------------------
// Navbar atas Admin Panel (desktop): brand panel + judul konten aktif.
// Dipakai di  : pages/AdminPanelPage.tsx
// Keterikatan : lucide-react
// ============================================================

// Navbar atas Admin Panel (desktop only): brand + email user.
// Aksi keluar ada di footer sidebar; di mobile keluar ada di header mobile.

import { ShieldCheck } from "lucide-react";
import { useTranslation } from "../../i18n";
import LanguageSwitcher from "../shared/LanguageSwitcher";

interface AdminNavbarProps {
  userEmail?: string;
}

export default function AdminNavbar({ userEmail }: AdminNavbarProps) {
  const { t } = useTranslation();

  return (
    <header className="hidden px-6 py-3 bg-[#712E1E] border-b border-black/20 shrink-0 items-center justify-between lg:flex">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-xl">
          <ShieldCheck className="h-5 w-5 text-[#FFD5AF]" />
        </div>
        <h1 className="text-base font-bold text-white">{t('admin.title')}</h1>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher variant="header" />
        {userEmail && (
          <span className="text-xs text-[#FFD5AF]/60" title={userEmail}>
            {userEmail}
          </span>
        )}
      </div>
    </header>
  );
}