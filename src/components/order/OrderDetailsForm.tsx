// ============================================================
// src/components/order/OrderDetailsForm.tsx
// ------------------------------------------------------------
// Step 01 & 02 form pemesanan /order dalam SATU kartu: bagian "Pilih Desain"
// (template terkunci dari katalog — ganti via tombol kembali) dan bagian
// "Data Acara & Kontak" (mempelai, tanggal acara, email & WhatsApp) hanya
// dipisah garis tipis di dalam kartu yang sama.
// Dipakai di  : pages/OrderPage
// Keterikatan : lib/constants, components/order/constants, SectionCard
// ============================================================

import type { ChangeEvent } from "react";
import { ArrowLeft, Calendar, Mail, User } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { MasterTemplate } from "../../lib/constants";
import { useTranslation } from "../../i18n";
import { INPUT_CLASS, type OrderFormData } from "./constants";
import { SectionCard, SectionHeading } from "./SectionCard";

interface OrderDetailsFormProps {
  formData: OrderFormData;
  selectedTemplate: MasterTemplate;
  selectedImage?: string;
  todayStr: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onWhatsappChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeTemplate: () => void;
}

export function OrderDetailsForm({
  formData,
  selectedTemplate,
  selectedImage,
  todayStr,
  onChange,
  onWhatsappChange,
  onChangeTemplate,
}: OrderDetailsFormProps) {
  const { t } = useTranslation();

  return (
    /* Langkah 1 & 2 = SATU kartu: "Pilih Desain" dan "Data Acara & Kontak"
       dipisah garis tipis di dalam kartu yang sama, bukan dua kartu. */
    <SectionCard>
      {/* 1. Template terkunci (dipilih dari katalog) */}
      <SectionHeading title={t("order.step1Title")} />
      <div className="flex items-center gap-3 sm:gap-4">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={selectedTemplate.name}
            className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl object-cover border border-[#EBDFCE] shrink-0"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-extrabold text-[#712E1E] truncate">
            {selectedTemplate.name}
          </p>
          <p className="text-[11px] sm:text-xs text-stone-400 truncate">
            {selectedTemplate.category} • Rp{" "}
            {selectedTemplate.price.toLocaleString("id-ID")}
          </p>
          <button
            type="button"
            onClick={onChangeTemplate}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#E59A59] hover:text-[#d48b4b] transition"
          >
            <ArrowLeft size={12} /> {t("order.changeTemplate")}
          </button>
        </div>
      </div>
      <p className="text-[11px] sm:text-xs text-stone-400 -mt-1">
        {t("order.step1LockedDesc")}
      </p>

      {/* 2. Data Mempelai, Acara & Kontak - bagian kedua, masih kartu yang sama */}
      <div className="pt-4 sm:pt-5 border-t border-[#EBDFCE]">
        <SectionHeading
          title={t("order.step2Title")}
          className="mb-3.5 sm:mb-4"
        />
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
      </div>
    </SectionCard>
  );
}
