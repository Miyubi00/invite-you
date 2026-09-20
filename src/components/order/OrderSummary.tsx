// ============================================================
// src/components/order/OrderSummary.tsx
// ------------------------------------------------------------
// Kartu ringkasan pesanan /order: banner template, ringkasan live
// kontak & metode, rincian harga, dan slot "actions" opsional di bagian
// bawah kartu. Di langkah 3 slot ini diisi verifikasi captcha + tombol
// bayar + tombol kembali (components/order/OrderPaymentActions) supaya
// seluruh elemen langkah 3 menyatu dalam satu kartu, urut atas-bawah.
// Dipakai di  : pages/OrderPage
// Keterikatan : react, components/order/constants, SectionCard
// ============================================================

import type { ReactNode } from "react";
import { useTranslation } from "../../i18n";
import type { MasterTemplate } from "../../lib/constants";
import {
  formatIDR,
  getPaymentMethodFee,
  PAYMENT_SUMMARY_LABEL_KEYS,
  type OrderFormData,
  type PaymentMethodType,
} from "./constants";
import { SummaryRow } from "./SectionCard";

interface OrderSummaryProps {
  formData: OrderFormData;
  selectedTemplate: MasterTemplate;
  selectedImage?: string;
  paymentMethod: PaymentMethodType | null;
  /**
   * Slot aksi di bagian bawah kartu (langkah 3: captcha + tombol bayar &
   * kembali). Dibiarkan kosong di pemakaian lain supaya kartu tetap murni
   * ringkasan.
   */
  actions?: ReactNode;
}

export function OrderSummary({
  formData,
  selectedTemplate,
  selectedImage,
  paymentMethod,
  actions,
}: OrderSummaryProps) {
  const { t } = useTranslation();

  const adminFee = paymentMethod
    ? getPaymentMethodFee(selectedTemplate.price, paymentMethod)
    : 0;
  const total = selectedTemplate.price + adminFee;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EBDFCE] shadow-md overflow-hidden">
      {/* Banner tema */}
      <div className="relative aspect-[16/9] bg-[#FAF6EE] group">
        {selectedImage && (
          <img
            src={selectedImage}
            alt={selectedTemplate.name}
            className="w-full h-full object-cover"
          />
        )}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm ${
            selectedTemplate.category === "RSVP"
              ? "bg-[#712E1E] text-white"
              : "bg-[#F7EEE3] text-[#712E1E] border border-[#EBDFCE]"
          }`}
        >
          {selectedTemplate.category}
        </span>
      </div>

      <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
        {/* Nama Tema */}
        <h2 className="font-black text-base sm:text-lg text-[#712E1E] leading-tight">
          {selectedTemplate.name}
        </h2>

        {/* Ringkasan live */}
        <div className="space-y-2.5 pt-4 border-t border-[#F3EBDF]">
          <SummaryRow
            label={t("paymentStatus.sumCouple")}
            value={
              formData.groom_name || formData.bride_name
                ? `${formData.groom_name} & ${formData.bride_name}`
                : t("order.notFilled")
            }
            muted={!formData.groom_name && !formData.bride_name}
          />
          <SummaryRow
            label={t("order.weddingDate")}
            value={formData.wedding_date || t("order.notFilled")}
            muted={!formData.wedding_date}
            mono
          />
          <SummaryRow
            label={t("order.email")}
            value={formData.email || t("order.notFilled")}
            muted={!formData.email}
            mono
          />
          <SummaryRow
            label={t("order.whatsapp")}
            value={
              formData.whatsapp
                ? `+62${formData.whatsapp}`
                : t("order.notFilled")
            }
            muted={!formData.whatsapp}
            mono
          />
          <SummaryRow
            label={t("order.methodSummaryLabel")}
            value={
              paymentMethod
                ? t(PAYMENT_SUMMARY_LABEL_KEYS[paymentMethod])
                : t("order.selectPaymentMethod")
            }
            muted={!paymentMethod}
          />
        </div>

        {/* Rincian Harga & Total Bayar */}
        <div className="space-y-2 pt-4 border-t border-[#F3EBDF]">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-500 font-semibold">
              {t("order.templatePrice")}
            </span>
            <span className="font-bold text-stone-700">
              {formatIDR(selectedTemplate.price)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-500 font-semibold">
              {t("order.adminFee")}
            </span>
            <span
              className={`font-bold ${adminFee > 0 ? "text-[#B4693F]" : "text-green-600"}`}
            >
              {adminFee > 0
                ? `+ ${formatIDR(adminFee)}`
                : t("order.freeOfCharge")}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-[#F3EBDF]">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {t("order.totalPayment")}
            </span>
            <span className="text-lg font-extrabold text-[#712E1E]">
              {formatIDR(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Slot aksi di dalam kartu: captcha -> tombol bayar -> tombol kembali. */}
      {actions ? (
        <div className="border-t border-[#F3EBDF] p-4 sm:p-5 md:p-6 pt-3 sm:pt-4 space-y-2.5">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
