// ============================================================
// src/components/customer/CustomerNavbar.tsx
// ------------------------------------------------------------
// Navbar atas dashboard mempelai (desktop): brand + aksi global (lihat undangan, logout).
// Dipakai di  : pages/CustomerDashboardPage.tsx
// Keterikatan : types/database (OrderRow), lucide-react
// ============================================================

// Navbar atas Dashboard (desktop): brand + aksi global.
// Nama mempelai hanya ditampilkan di profil sidebar (tanpa duplikasi);
// logout ada di footer sidebar.

import { ExternalLink, Eye, HeartHandshake } from "lucide-react";
import type { OrderRow } from "../../types/database";

interface CustomerNavbarProps {
  order: OrderRow;
}

export default function CustomerNavbar({ order }: CustomerNavbarProps) {
  return (
    <header
      className="
        hidden
        px-6 py-3
        bg-[#712E1E]
        border-b border-black/20
        shrink-0 items-center justify-between
        lg:flex
      "
    >
      <div
        className="
          flex
          items-center gap-3
        "
      >
        <div
          className="
            p-2
            bg-white/10
            rounded-xl
          "
        >
          <HeartHandshake
            className="
              h-5 w-5
              text-[#FFD5AF]
            "
          />
        </div>
        <h1
          className="
            text-base font-bold text-white
          "
        >
          Dashboard
        </h1>
      </div>

      {/* Primary global action */}
      <a
        href={`/wedding/${order.slug}`}
        target="_blank"
        rel="noreferrer"
        className="
          flex
          px-3.5 py-2
          text-xs font-semibold text-white
          bg-white/15
          rounded-xl
          shadow-sm
          items-center gap-2 transition hover:bg-white/25
        "
      >
        <span>Lihat Undangan</span>
        <ExternalLink size={13} />
      </a>
    </header>
  );
}
