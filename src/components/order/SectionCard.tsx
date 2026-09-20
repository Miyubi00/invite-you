// ============================================================
// src/components/order/SectionCard.tsx
// ------------------------------------------------------------
// Kartu section bernomor untuk form /order + baris ringkasan sidebar.
// SectionHeading diekspor terpisah supaya beberapa bagian bisa digabung
// ke dalam SATU kartu (lihat OrderDetailsForm: pilih desain + data acara).
// Dipakai di  : components/order/OrderDetailsForm, PaymentMethodPicker,
//               OrderSummary
// Keterikatan : -
// ============================================================

import type { ReactNode } from "react";

export function SectionHeading({
  step,
  title,
  className = "",
}: {
  /** Nomor badge — opsional; di wizard /order penomoran ikut tracker atas. */
  step?: string;
  title: string;
  /** Jarak bawah dari heading ke isinya, mis. "mb-3.5 sm:mb-4". */
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {step ? (
        <span className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-[#F7EEE3] text-[#B4693F] grid place-items-center text-xs sm:text-sm font-black tracking-tight">
          {step}
        </span>
      ) : null}
      <h2 className="font-extrabold text-sm sm:text-base text-[#712E1E]">
        {title}
      </h2>
    </div>
  );
}

export function SectionCard({
  step,
  title,
  children,
}: {
  /** Nomor badge — opsional; di wizard /order penomoran ikut tracker atas. */
  step?: string;
  /** Judul kartu — opsional bila kartu menampung beberapa heading sendiri. */
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl border border-[#EBDFCE] shadow-sm p-4 sm:p-6 md:p-7 space-y-3.5 sm:space-y-4">
      {title ? <SectionHeading step={step} title={title} /> : null}
      {children}
    </section>
  );
}

export function SummaryRow({
  label,
  value,
  muted = false,
  mono = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-stone-400 font-semibold shrink-0">{label}</span>
      <span
        className={`truncate font-medium ${muted ? "italic text-stone-300" : "text-stone-700"} ${mono ? "font-mono" : ""}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
