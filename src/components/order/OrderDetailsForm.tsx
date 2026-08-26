// ============================================================
// src/components/order/OrderDetailsForm.tsx
// ------------------------------------------------------------
// Step 01 (pilih desain/template) dan Step 02 (data mempelai, tanggal
// acara, email & WhatsApp) pada form pemesanan /order.
// Dipakai di  : pages/OrderPage
// Keterikatan : lib/constants, components/order/constants, SectionCard
// ============================================================

import type { ChangeEvent } from "react";
import { Calendar, Mail, Palette, User } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { MasterTemplate } from "../../lib/constants";
import { useTranslation } from "../../i18n";
import { INPUT_CLASS, type OrderFormData } from "./constants";
import { SectionCard } from "./SectionCard";

interface OrderDetailsFormProps {
  formData: OrderFormData;
  templateList: MasterTemplate[];
  todayStr: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onWhatsappChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTemplateChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export function OrderDetailsForm({
  formData,
  templateList,
  todayStr,
  onChange,
  onWhatsappChange,
  onTemplateChange,
}: OrderDetailsFormProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* 1. Pilih Desain */}
      <SectionCard step="01" title={t("order.step1Title")}>
        <div className="relative w-full min-w-0">
          <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
          <select
            name="template_slug"
            value={formData.template_slug}
            onChange={onTemplateChange}
            className={`${INPUT_CLASS} cursor-pointer text-xs sm:text-sm font-medium`}
          >
            {templateList.map((tOpt) => (
              <option key={tOpt.slug} value={tOpt.slug}>
                {tOpt.name} — {tOpt.category} (Rp{" "}
                {tOpt.price.toLocaleString("id-ID")})
              </option>
            ))}
          </select>
        </div>
        <p className="text-[11px] sm:text-xs text-stone-400 -mt-1">
          {t("order.step1Desc")}
        </p>
      </SectionCard>

      {/* 2. Data Mempelai, Acara & Kontak */}
      <SectionCard step="02" title={t("order.step2Title")}>
        <div className="space-y-3.5 sm:space-y-4 w-full min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
            <div className="min-w-0 w-full">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                {t("order.groomName")}
              </label>
              <div className="relative w-full min-w-0">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  required
                  name="groom_name"
                  value={formData.groom_name}
                  type="text"
                  placeholder={t("order.groomPlaceholder")}
                  onChange={onChange}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
            <div className="min-w-0 w-full">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                {t("order.brideName")}
              </label>
              <div className="relative w-full min-w-0">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  required
                  name="bride_name"
                  value={formData.bride_name}
                  type="text"
                  placeholder={t("order.bridePlaceholder")}
                  onChange={onChange}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          <div className="min-w-0 w-full">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
              {t("order.weddingDate")}
            </label>
            <div className="relative w-full min-w-0">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                required
                name="wedding_date"
                value={formData.wedding_date}
                type="date"
                min={todayStr}
                onChange={onChange}
                className={`${INPUT_CLASS} text-stone-600`}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200/70 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
            <div className="min-w-0 w-full">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                {t("order.email")}
              </label>
              <div className="relative w-full min-w-0">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  required
                  name="email"
                  type="email"
                  placeholder={t("order.emailPlaceholder")}
                  value={formData.email}
                  onChange={onChange}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="min-w-0 w-full">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                {t("order.whatsapp")}
              </label>
              <div className="relative w-full min-w-0">
                <FaWhatsapp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  required
                  name="whatsapp"
                  type="tel"
                  placeholder={t("order.whatsappPlaceholder")}
                  value={formData.whatsapp}
                  onChange={onWhatsappChange}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </>
  );
}
