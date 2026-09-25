// ============================================================
// src/components/order/OrderSummary.tsx
// ------------------------------------------------------------
// Kartu konfirmasi /order langkah 3 (desain baru): thumbnail + nama
// tema + tombol Edit, baris kontak, kartu Rincian Pembayaran (metode
// tampil sebagai label, dipilih di langkah 2), dan slot "actions"
// (captcha + tombol bayar + kembali) dari pages/OrderPage.
// Dipakai di  : pages/OrderPage
// Keterikatan : react, lucide-react, react-icons, ./constants, i18n
// ============================================================

import type { ReactNode } from "react";
import {
  CalendarDays,
  CreditCard,
  Mail,
  Pencil,
  Users,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "../../i18n";
import type { MasterTemplate } from "../../lib/constants";
import {
  formatIDR,
  getPaymentMethodFee,
  PAYMENT_SUMMARY_LABEL_KEYS,
  type PaymentMethodType,
} from "./constants";

interface OrderSummaryProps {
  formData: {
    groom_name: string;
    bride_name: string;
    wedding_date: string;
    whatsapp: string;
    email: string;
  };
  selectedTemplate: MasterTemplate;
  selectedImage?: string;
  paymentMethod: PaymentMethodType | null;
  onEdit: () => void;
  /**
   * Slot aksi di bagian bawah kartu (langkah 3: captcha + tombol bayar
   * sesuai metode + tombol kembali) dari pages/OrderPage.
   */
  actions?: ReactNode;
}

function formatTanggal(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function OrderSummary({
  formData,
  selectedTemplate,
  selectedImage,
  paymentMethod,
  onEdit,
  actions,
}: OrderSummaryProps) {
  const { t } = useTranslation();
  const fee = paymentMethod
    ? getPaymentMethodFee(selectedTemplate.price, paymentMethod)
    : 0;
  const total = selectedTemplate.price + fee;
  const methodLabel = paymentMethod
    ? t(PAYMENT_SUMMARY_LABEL_KEYS[paymentMethod])
    : t("order.selectPaymentMethod");

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm sm:rounded-3xl">
      <div className="space-y-4 p-4 sm:p-5">
        {/* Kepala: thumbnail + nama + edit + mempelai + tanggal */}
        <div className="flex items-start gap-4">
          <div className="h-28 w-32 shrink-0 overflow-hidden rounded-2xl bg-[#FAF6EE] sm:h-32 sm:w-36">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={selectedTemplate.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="truncate text-lg font-black text-[#712E1E] sm:text-xl">
                {selectedTemplate.name}
              </h2>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F7EEE3] px-3 py-1.5 text-xs font-bold text-[#712E1E] transition hover:bg-[#f3e2cd]"
              >
                <Pencil size={13} /> {t("order.confirmEdit")}
              </button>
            </div>
            <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-stone-700 sm:text-base">
              <Users size={16} className="shrink-0 text-stone-500" />
              <span className="truncate">
                {formData.groom_name} &amp; {formData.bride_name}
              </span>
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-stone-700 sm:text-base">
              <CalendarDays size={16} className="shrink-0 text-stone-500" />
              {formatTanggal(formData.wedding_date)}
            </p>
          </div>
        </div>

        {/* Kontak */}
        <div className="space-y-2.5 border-t border-[#F3EBDF] pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-stone-500">
              <Mail size={16} className="shrink-0" /> {t("order.email")}
            </span>
            <span className="truncate text-right text-sm font-semibold text-stone-800 sm:text-base">
              {formData.email}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-stone-500">
              <FaWhatsapp size={16} className="shrink-0" /> {t("order.whatsapp")}
            </span>
            <span className="truncate text-right text-sm font-semibold text-stone-800 sm:text-base">
              +62{formData.whatsapp}
            </span>
          </div>
        </div>

        {/* Rincian pembayaran */}
        <div className="rounded-2xl bg-[#faf6ef] p-4 sm:p-5">
          <p className="text-base font-black text-[#712E1E] sm:text-lg">
            {t("order.paymentDetails")}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-stone-500">
              <CreditCard size={15} className="shrink-0" /> {methodLabel}
            </span>
            <span className="text-sm font-black text-stone-800 sm:text-base">
              {formatIDR(selectedTemplate.price)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-sm text-stone-500">{t("order.templatePrice")}</span>
            <span className="text-sm font-black text-stone-800 sm:text-base">
              {formatIDR(selectedTemplate.price)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-sm text-stone-500">{t("order.adminFee")}</span>
            <span className="text-sm font-black text-stone-800 sm:text-base">
              {fee > 0 ? `+ ${formatIDR(fee)}` : formatIDR(0)}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-stone-400">
            {t("order.feeNotePpn")}
          </p>
          <div className="my-3 border-t border-dashed border-[#E5D3B8]" />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-black uppercase tracking-wide text-stone-500 sm:text-base">
              {t("order.totalPayment")}
            </span>
            <span className="text-xl font-black text-[#712E1E] sm:text-2xl">
              {formatIDR(total)}
            </span>
          </div>
        </div>

        {/* Slot aksi: captcha + tombol bayar + kembali */}
        {actions ? <div className="space-y-2.5 border-t border-[#F3EBDF] pt-4">{actions}</div> : null}
      </div>
    </div>
  );
}
