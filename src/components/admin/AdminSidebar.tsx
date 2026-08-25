// ============================================================
// src/components/admin/AdminSidebar.tsx
// ------------------------------------------------------------
// Sidebar navigasi Admin Panel (drawer di mobile, kolom tetap di desktop) + tombol keluar. Mengekspor tipe MenuItem.
// Dipakai di  : pages/AdminPanelPage.tsx
// Keterikatan : lucide-react; lib/supabaseClient (signOut)
// ============================================================

// Sidebar navigasi Admin Panel (drawer di mobile, kolom tetap di desktop).
// Mirip CustomerSidebar, namun khusus admin global (tidak ada order tunggal).
// Profil di bagian atas menampilkan nama panel; footer menampilkan email user + keluar.

import { LogOut, X, type LucideIcon } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge: number | null;
}

interface AdminSidebarProps {
  menuItems: MenuItem[];
  activeTab: string;
  isOpen: boolean;
  onClose: () => void;
  onMenuClick: (id: string) => void;
  onLogout: () => void;
  userEmail?: string;
}

export default function AdminSidebar({
  menuItems,
  activeTab,
  isOpen,
  onClose,
  onMenuClick,
  onLogout,
  userEmail,
}: AdminSidebarProps) {
  return (
    <aside
      className={`z-50 flex flex-col w-72 h-full bg-[#712E1E] border-r border-black/20 transition-transform fixed inset-y-0 left-0 shrink-0 transform duration-300 ease-in-out lg:relative ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      <div className="p-6 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-wider text-[#FFD5AF]/60 uppercase">
              Admin Panel
            </p>
            <h1 className="mt-0.5 text-lg font-bold text-white truncate">
              Kelola Undangan
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 lg:hidden"
          >
            <X size={20} className="text-[#FFD5AF]/80" />
          </button>
        </div>
      </div>

            {/* Menu Navigasi (scroll internal jika menu panjang) */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuClick(item.id)}
            className={`flex w-full px-4 py-3 text-sm rounded-xl transition-all items-center gap-3 ${
              activeTab === item.id
                ? "bg-white/15 text-white font-semibold shadow-sm"
                : "text-[#FFD5AF]/70 font-medium hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon size={18} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge !== null && (
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeTab === item.id
                    ? "bg-white text-[#712E1E]"
                    : "bg-white/20 text-[#FFD5AF]"
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

            {/* Footer: email user + tombol keluar */}
      <div className="p-4 space-y-3 border-t border-white/10 shrink-0">
        {userEmail && (
          <div
            className="text-[11px] font-medium text-[#FFD5AF]/70 truncate"
            title={userEmail}
          >
            {userEmail}
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex w-full px-4 py-2.5 text-sm font-medium text-[#FFD5AF]/70 rounded-xl transition-all items-center gap-2.5 hover:bg-red-500/15 hover:text-red-300"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}