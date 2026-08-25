// ============================================================
// src/components/customer/CustomerSidebar.tsx
// ------------------------------------------------------------
// Sidebar navigasi dashboard mempelai (drawer di mobile, kolom tetap di desktop): profil order + menu tab. Mengekspor tipe MenuItem.
// Dipakai di  : pages/CustomerDashboardPage.tsx
// Keterikatan : types/database (OrderRow), lucide-react
// ============================================================

// Sidebar navigasi Dashboard (drawer di mobile, kolom tetap di desktop).
// Tema coklat senada navbar; aksi global (Lihat/Keluar) ada di navbar.

import { LogOut, X, type LucideIcon } from "lucide-react";
import type { OrderRow } from "../../types/database";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge: number | null;
}

interface CustomerSidebarProps {
  order: OrderRow;
  menuItems: MenuItem[];
  activeTab: string;
  isOpen: boolean;
  onClose: () => void;
  onMenuClick: (id: string) => void;
  onLogout: () => void;
  isBasic: boolean;
}

export default function CustomerSidebar({
  order,
  menuItems,
  activeTab,
  isOpen,
  onClose,
  onMenuClick,
  onLogout,
  isBasic,
}: CustomerSidebarProps) {
  return (
    <aside
      className={`
        z-50 flex flex-col
        w-72 h-full
        bg-[#712E1E]
        border-r border-black/20
        transition-transform
        fixed inset-y-0 left-0 shrink-0 transform duration-300 ease-in-out
        lg:relative
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div
        className="
          p-6
          border-b border-white/10
          shrink-0
        "
      >
        {/* Profil order — satu-satunya tempat nama mempelai ditampilkan */}
        <div
          className="
            flex
            items-center justify-between gap-3
          "
        >
          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                text-[10px] font-bold tracking-wider text-[#FFD5AF]/60
                uppercase
              "
            >
              Dashboard Undangan
            </p>
            <h1
              className="
                mt-0.5
                text-lg font-bold text-white
                truncate
              "
            >
              {order.groom_name} & {order.bride_name}
            </h1>
          </div>
          <button
            onClick={onClose}
            className="
              p-1
              rounded-lg
              hover:bg-white/10
              lg:hidden
            "
          >
            <X
              size={20}
              className="
                text-[#FFD5AF]/80
              "
            />
          </button>
        </div>
      </div>

      {/* Menu Navigasi (scroll internal jika menu panjang) */}
      <nav
        className="
          flex-1 overflow-y-auto
          p-4 space-y-1.5
        "
      >
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuClick(item.id)}
            className={`
              flex
              w-full
              px-4 py-3
              text-sm
              rounded-xl
              transition-all
              items-center gap-3
              ${
              activeTab === item.id
              ? "bg-white/15 text-white font-semibold shadow-sm"
              : "text-[#FFD5AF]/70 font-medium hover:bg-white/5 hover:text-white"
              }
            `}
          >
            <item.icon size={18} />
            <span
              className="
                flex-1
                text-left
              "
            >
              {item.label}
            </span>
            {item.badge !== null && (
              <span
                className={`
                  px-2 py-0.5
                  text-[10px] font-bold
                  rounded-full
                  ${
                  activeTab === item.id
                  ? "bg-white text-[#712E1E]"
                  : "bg-white/20 text-[#FFD5AF]"
                  }
                `}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div
        className="
          p-4 space-y-3
          border-t border-white/10
          shrink-0
        "
      >
        {isBasic && (
          <div
            className="
              px-4 py-1.5
              text-[10px] text-[#FFD5AF]/60 font-bold tracking-wider text-center
              uppercase
            "
          >
            Paket Basic
          </div>
        )}
        <button
          onClick={onLogout}
          className="
            flex
            w-full
            px-4 py-2.5
            text-sm font-medium text-[#FFD5AF]/70
            rounded-xl
            transition-all
            items-center gap-2.5 hover:bg-red-500/15 hover:text-red-300
          "
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
