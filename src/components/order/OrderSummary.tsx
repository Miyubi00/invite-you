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
  ArrowLeftRight,
  CalendarDays,
  CreditCard,
  Info,
  Mail,
  Pencil,
  ReceiptText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "../../i18n";
import type { MasterTemplate } from "../../lib/constants";
import {
  formatIDR,
  getPaymentMethodFee,
  MIDTRANS_LOGOS,
  PAYMENT_SUMMARY_LABEL_KEYS,
  VA_BANKS,
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
  onChangeMethod: () => void;
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
  onChangeMethod,
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

  const methodLogo = (() => {
    if (paymentMethod === "whatsapp" || !paymentMethod) return null;
    if (paymentMethod === "qris") return MIDTRANS_LOGOS.qris;
    if (paymentMethod === "gopay") return MIDTRANS_LOGOS.gopay;
    return VA_BANKS.find((b) => b.id === paymentMethod)?.logo ?? null;
  })();

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm sm:rounded-3xl">
      <div className="space-y-4 p-4 sm:p-5">
        {/* Kepala: thumbnail + nama + edit + subjudul + paket */}
        <div className="flex items-center gap-4">
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
            <h2 className="truncate text-lg font-black text-[#712E1E] sm:text-xl">
              {selectedTemplate.name}
            </h2>
            <p className="mt-1 truncate text-sm text-stone-500">
              {t("order.templateSubtitle")}
            </p>
            <span className="mt-1.5 inline-block rounded-full bg-[#F7EEE3] px-2.5 py-0.5 text-[11px] font-bold text-[#712E1E]">
              {t("order.packageLabel")} {selectedTemplate.category}
            </span>
          </div>
        </div>

        {/* Data pesanan & kontak */}
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-base font-black text-[#712E1E] sm:text-lg">
            <Users size={17} className="shrink-0" /> {t("order.dataContactTitle")}
          </p>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F7EEE3] px-3 py-1.5 text-xs font-bold text-[#712E1E] transition hover:bg-[#f3e2cd]"
          >
            <Pencil size={13} /> {t("order.confirmEdit")}
          </button>
        </div>
        <div className="space-y-2.5 border-t border-[#F3EBDF] pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-stone-500">
              <Users size={16} className="shrink-0" /> {t("order.coupleNameLabel")}
            </span>
            <span className="truncate text-right text-sm font-semibold text-stone-800 sm:text-base">
              {formData.groom_name} &amp; {formData.bride_name}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-stone-500">
              <CalendarDays size={16} className="shrink-0" /> {t("order.eventDateLabel")}
            </span>
            <span className="truncate text-right text-sm font-semibold text-stone-800 sm:text-base">
              {formatTanggal(formData.wedding_date)}
            </span>
          </div>
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

        {/* Metode pembayaran terpilih */}
        <div className="border-t border-[#F3EBDF] pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-base font-black text-[#712E1E] sm:text-lg">
              <CreditCard size={17} className="shrink-0" /> {t("order.methodSectionTitle")}
            </p>
            <button
              type="button"
              onClick={onChangeMethod}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F7EEE3] px-3 py-1.5 text-xs font-bold text-[#712E1E] transition hover:bg-[#f3e2cd]"
            >
              <ArrowLeftRight size={13} /> {t("order.changeMethod")}
            </button>
          </div>
          <div className="mt-2.5 flex items-center gap-3">
            {paymentMethod === "whatsapp" ? (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <FaWhatsapp size={22} className="text-[#25D366]" />
              </span>
            ) : methodLogo ? (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F7EEE3] px-1.5">
                <img src={methodLogo} alt={methodLabel} className="max-h-7 w-auto object-contain" />
              </span>
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F7EEE3]">
                <CreditCard size={20} className="text-[#712E1E]" />
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-stone-800 sm:text-base">
                {methodLabel}
              </span>
              <span className="block text-xs text-stone-500">
                {paymentMethod === "whatsapp" ? t("order.waDesc") : t("order.autoMethodDesc")}
              </span>
            </span>
          </div>
        </div>

        {/* Rincian pembayaran */}
        <div className="border-t border-[#F3EBDF] pt-4">
          <p className="flex items-center gap-2 text-base font-black text-[#712E1E] sm:text-lg">
            <ReceiptText size={17} className="shrink-0" /> {t("order.paymentDetails")}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-sm text-stone-500">{t("order.templatePrice")}</span>
            <span className="text-sm font-black text-stone-800 sm:text-base">
              {formatIDR(selectedTemplate.price)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-stone-500">
              {t("order.adminFee")}
              <Info size={13} className="shrink-0 text-stone-400" />
            </span>
            <span className="text-sm font-black text-stone-800 sm:text-base">
              {fee > 0 ? `+ ${formatIDR(fee)}` : formatIDR(0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-stone-400">
            {t("order.feeNotePpn")}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#faf3ea] px-4 py-3">
            <span className="text-sm font-black text-stone-700 sm:text-base">
              {t("order.totalPayment")}
            </span>
            <span className="text-xl font-black text-[#712E1E] sm:text-2xl">
              {formatIDR(total)}
            </span>
          </div>
        </div>

        {/* Jaminan keamanan */}
        <div className="flex items-center gap-3 rounded-2xl bg-[#faf6ef] px-4 py-3">
          <ShieldCheck size={26} className="shrink-0 text-[#B4693F]" />
          <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-stone-500 sm:text-xs">
            <strong className="text-stone-700">{t("order.secureTitle")}</strong>{' '}
            {t("order.secureDesc")}
          </p>
          <span className="shrink-0 text-sm font-black italic text-[#00AED6]">
            midtrans
          </span>
        </div>

        {/* Slot aksi: captcha + tombol bayar + kembali */}
        {actions ? <div className="space-y-2.5 border-t border-[#F3EBDF] pt-4">{actions}</div> : null}
      </div>
    </div>
  );
}
