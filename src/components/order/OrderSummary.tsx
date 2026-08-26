// ============================================================
// src/components/order/OrderSummary.tsx
// ------------------------------------------------------------
// Sidebar ringkasan pesanan /order: banner template, ringkasan live
// kontak & metode, rincian harga, Turnstile captcha, dan tombol bayar.
// Dipakai di  : pages/OrderPage
// Keterikatan : lucide-react, react-icons, ui/TurnstileWidget,
//               components/order/constants, SectionCard
// ============================================================

import { Building2, QrCode, Smartphone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { RefObject } from "react";
import TurnstileWidget, {
  type TurnstileWidgetRef,
} from "../ui/TurnstileWidget";
import { useTranslation } from "../../i18n";
import type { MasterTemplate } from "../../lib/constants";
import {
  formatIDR,
  getPaymentMethodFee,
  PAYMENT_BUTTON_LABEL_KEYS,
  PAYMENT_SUMMARY_LABEL_KEYS,
  type OrderFormData,
  type PaymentMethodType,
} from "./constants";
import { SummaryRow } from "./SectionCard";

interface OrderSummaryProps {
  formData: OrderFormData;
  selectedTemplate: MasterTemplate;
  selectedImage?: string;
  paymentMethod: PaymentMethodType;
  captchaToken: string | null;
  setCaptchaToken: (token: string | null) => void;
  turnstileRef: RefObject<TurnstileWidgetRef | null>;
  loadingWA: boolean;
  loadingMidtrans: boolean;
  onMidtransCheckout: () => void;
  onWhatsappCheckout: () => void;
}

export function OrderSummary({
  formData,
  selectedTemplate,
  selectedImage,
  paymentMethod,
  captchaToken,
  setCaptchaToken,
  turnstileRef,
  loadingWA,
  loadingMidtrans,
  onMidtransCheckout,
  onWhatsappCheckout,
}: OrderSummaryProps) {
  const { t } = useTranslation();

  const adminFee = getPaymentMethodFee(selectedTemplate.price, paymentMethod);
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
            value={t(PAYMENT_SUMMARY_LABEL_KEYS[paymentMethod])}
            muted={false}
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

        {/* Cloudflare Turnstile Captcha Widget */}
        <div className="pt-2">
          <TurnstileWidget
            ref={turnstileRef}
            onSuccess={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />
        </div>

        {/* Tombol Aksi Sesuai Metode Terpilih */}
        <div className="space-y-2.5 pt-1">
          {paymentMethod === "whatsapp" ? (
            <button
              type="button"
              onClick={onWhatsappCheckout}
              disabled={loadingWA || !captchaToken}
              className={`w-full py-3.5 rounded-xl font-bold text-base border-2 transition flex items-center justify-center gap-2 ${
                loadingWA || !captchaToken
                  ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                  : "bg-[#25D366] border-[#25D366] text-white hover:bg-[#20bd5a] active:scale-[0.99] shadow-md shadow-green-600/20"
              }`}
            >
              {loadingWA ? (
                t("order.payWhatsappLoading")
              ) : (
                <>
                  <FaWhatsapp className="w-5 h-5" />{" "}
                  {t("order.btnPayWa")}
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onMidtransCheckout}
              disabled={loadingMidtrans || !captchaToken}
              className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-md transition ${
                loadingMidtrans || !captchaToken
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                  : "bg-[#712E1E] text-white hover:bg-[#8E3B27] active:scale-[0.99]"
              }`}
            >
              {loadingMidtrans ? (
                t("order.payMidtransLoading")
              ) : (
                <>
                  {paymentMethod.endsWith("_va") ||
                  paymentMethod === "echannel" ? (
                    <Building2 className="w-5 h-5" />
                  ) : paymentMethod === "qris" ? (
                    <QrCode className="w-5 h-5" />
                  ) : (
                    <Smartphone className="w-5 h-5" />
                  )}
                  <span>{t(PAYMENT_BUTTON_LABEL_KEYS[paymentMethod])}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
