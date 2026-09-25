// ============================================================
// src/components/order/OrderSummary.tsx
// ------------------------------------------------------------
// Kartu konfirmasi /order langkah 2 (desain baru): thumbnail + nama
// tema + tombol Edit, baris kontak, kartu Rincian Pembayaran, pilih
// metode (Otomatis / WhatsApp), dan slot "actions" (captcha + tombol
// Lanjut + kembali) dari pages/OrderPage.
// Dipakai di  : pages/OrderPage
// Keterikatan : react, lucide-react, react-icons, ./constants, i18n
// ============================================================

import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  HelpCircle,
  Info,
  Mail,
  Pencil,
  Users,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "../../i18n";
import type { MasterTemplate } from "../../lib/constants";
import { formatIDR } from "./constants";

export type ConfirmPayMethod = "automatic" | "whatsapp";

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
  paymentMethod: ConfirmPayMethod;
  onSelectMethod: (method: ConfirmPayMethod) => void;
  onEdit: () => void;
  onContinue: () => void;
  continueLoading: boolean;
  /**
   * Slot captcha tepat di atas tombol Lanjut Pembayaran.
   */
  captcha?: ReactNode;
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
        selected ? "border-[#712E1E]" : "border-stone-300"
      }`}
    >
      {selected ? <span className="h-3 w-3 rounded-full bg-[#712E1E]" /> : null}
    </span>
  );
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
  onSelectMethod,
  onEdit,
  onContinue,
  continueLoading,
  captcha,
}: OrderSummaryProps) {
  const { t } = useTranslation();
  const total = selectedTemplate.price;
  const isAuto = paymentMethod === "automatic";

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
            <span className="text-sm text-stone-500">{t("order.templatePrice")}</span>
            <span className="text-sm font-black text-stone-800 sm:text-base">
              {formatIDR(selectedTemplate.price)}
            </span>
          </div>
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

        {/* Pilih metode */}
        <div>
          <p className="text-base font-black text-[#712E1E] sm:text-lg">
            {t("order.chooseMethod")}
          </p>
          <p className="mt-0.5 text-xs text-stone-500 sm:text-sm">
            {t("order.chooseMethodDesc")}
          </p>

          <div className="mt-3 space-y-3">
            <button
              type="button"
              onClick={() => onSelectMethod("automatic")}
              className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition sm:p-4 ${
                isAuto
                  ? "border-[#712E1E] bg-[#fffdf8]"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <span className="pt-0.5">
                <RadioDot selected={isAuto} />
              </span>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F7EEE3]">
                <CreditCard size={22} className="text-[#712E1E]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-stone-800 sm:text-base">
                  {t("order.autoTitle")}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-stone-500 sm:text-[13px]">
                  {t("order.autoDesc")}
                </span>
                <span className="mt-2 flex items-center gap-1.5 rounded-lg bg-[#FFF7E6] px-2.5 py-1.5 text-[11px] font-bold text-[#B4693F] sm:text-xs">
                  <Info size={14} className="shrink-0" />
                  <span className="flex-1">{t("order.autoFeeNote")}</span>
                  <HelpCircle size={15} className="shrink-0 text-[#712E1E]" />
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectMethod("whatsapp")}
              className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition sm:p-4 ${
                !isAuto
                  ? "border-[#25D366] bg-green-50/50"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <span className="pt-0.5">
                <RadioDot selected={!isAuto} />
              </span>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <FaWhatsapp size={24} className="text-[#25D366]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-stone-800 sm:text-base">
                  {t("order.waTitle")}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-stone-500 sm:text-[13px]">
                  {t("order.waDesc")}
                </span>
                <span className="mt-2 flex items-center gap-1.5 rounded-lg bg-[#E6F6EC] px-2.5 py-1.5 text-[11px] font-bold text-green-700 sm:text-xs">
                  <BadgeCheck size={14} className="shrink-0" />
                  {t("order.waFreeNote")}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Verifikasi + Lanjut pembayaran */}
        {captcha ? <div>{captcha}</div> : null}
        <button
          type="button"
          onClick={onContinue}
          disabled={continueLoading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#712E1E] py-3.5 text-base font-black text-white shadow-lg transition hover:bg-[#8E3B27] active:scale-[0.99] disabled:opacity-60 sm:py-4 sm:text-lg"
        >
          {continueLoading ? t("order.payMidtransLoading") : t("order.btnContinuePay")}
          {!continueLoading ? <ArrowRight size={20} /> : null}
        </button>
      </div>
    </div>
  );
}
