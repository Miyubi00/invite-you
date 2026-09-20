// ============================================================
// src/components/order/OrderBackButton.tsx
// ------------------------------------------------------------
// Tombol "kembali ke alur sebelumnya" yang dipakai konsisten di
// seluruh wizard /order: pill putih ber-border lembut, ikon di dalam
// bulatan, target sentuh >=44px, plus state hover/focus yang jelas.
// Dipakai di  : pages/OrderPage (header + navigasi bawah step)
// Keterikatan : lucide-react (ArrowLeft)
// ============================================================

import { ArrowLeft } from "lucide-react";

interface OrderBackButtonProps {
  onClick: () => void;
  /** Label visual tombol. */
  label: string;
  /** Untuk aria-label & tooltip bila label visual lebih pendek dari konteksnya. */
  ariaLabel?: string;
  /** inline = selebar isi (header) · block = selebar container (navigasi bawah step). */
  variant?: "inline" | "block";
  className?: string;
}

export function OrderBackButton({
  onClick,
  label,
  ariaLabel,
  variant = "inline",
  className = "",
}: OrderBackButtonProps) {
  const accessibleName = ariaLabel ?? label;

  return (
    <button
      type="button"
      onClick={onClick}
      title={accessibleName}
      aria-label={accessibleName}
      className={`group inline-flex min-h-11 min-w-0 items-center gap-2 sm:gap-2.5 rounded-2xl border border-[#EBDFCE] bg-white px-2.5 sm:px-3.5 text-[#712E1E] font-bold shadow-sm transition-all duration-200 hover:border-[#E59A59] hover:bg-[#FDF7F0] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E59A59]/40 ${
        variant === "block" ? "w-full justify-center" : ""
      } ${className}`}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#F7EEE3] text-[#712E1E] transition-colors group-hover:bg-[#712E1E] group-hover:text-white">
        <ArrowLeft className="h-4 w-4" />
      </span>
      <span className="truncate text-xs sm:text-sm">{label}</span>
    </button>
  );
}
