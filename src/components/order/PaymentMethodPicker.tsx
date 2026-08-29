// ============================================================
// src/components/order/PaymentMethodPicker.tsx
// ------------------------------------------------------------
// Step 03 pemilihan metode pembayaran /order: QRIS, e-wallet (accordion
// GoPay/ShopeePay/Dana), Virtual Account bank (accordion), dan transfer
// manual via WhatsApp. Layout kartu vertikal: nama -> logo -> deskripsi,
// harga & indikator di sisi kanan.
// Dipakai di  : pages/OrderPage
// Keterikatan : lucide-react, react-icons, components/order/constants,
//               SectionCard
// ============================================================

import type { ReactNode } from "react";
import { Building2, ChevronDown, QrCode, Smartphone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "../../i18n";
import {
  EWALLET_OPTIONS,
  formatIDR,
  getPaymentMethodFee,
  isEwalletMethod,
  isVaMethod,
  MIDTRANS_LOGOS,
  VA_BANKS,
  type ExpandedCategory,
  type PaymentMethodType,
} from "./constants";
import { SectionCard } from "./SectionCard";

interface PaymentMethodPickerProps {
  basePrice: number;
  paymentMethod: PaymentMethodType | null;
  onSelect: (method: PaymentMethodType) => void;
  expandedCategory: ExpandedCategory | null;
  onExpand: (category: ExpandedCategory | null) => void;
}

const LogoPill = ({
  src,
  alt,
  className = "h-4",
}: {
  src: string;
  alt: string;
  className?: string;
}) => (
  <div className="bg-white border border-stone-200/90 rounded-md px-2 py-0.5 flex items-center justify-center shadow-xs shrink-0">
    <img
      src={src}
      alt={alt}
      className={`${className} object-contain max-w-[65px]`}
    />
  </div>
);

const RadioDot = ({
  selected,
  color = "brand",
  size = "md",
}: {
  selected: boolean;
  color?: "brand" | "whatsapp";
  size?: "md" | "sm";
}) => {
  const activeColor =
    color === "whatsapp"
      ? "border-[#25D366] bg-[#25D366]"
      : "border-[#712E1E] bg-[#712E1E]";
  const outerSize =
    size === "sm" ? "w-3.5 h-3.5 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5";
  const innerSize = size === "sm" ? "w-1.5 h-1.5" : "w-1.5 h-1.5 sm:w-2 sm:h-2";

  return (
    <div
      className={`${outerSize} rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? activeColor : "border-stone-300"}`}
    >
      {selected && <div className={`${innerSize} rounded-full bg-white`} />}
    </div>
  );
};

interface CategoryCardProps {
  className: string;
  onClick?: () => void;
  iconBoxClass: string;
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  logos?: ReactNode;
  description?: ReactNode;
  price: ReactNode;
  trailing?: ReactNode;
  radio?: ReactNode;
}

function CategoryCard({
  className,
  onClick,
  iconBoxClass,
  icon,
  title,
  badge,
  logos,
  description,
  price,
  trailing,
  radio,
}: CategoryCardProps) {
  return (
    <div onClick={onClick} className={`${className} flex items-start justify-between gap-3 min-w-0`}>
      <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0">
        <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${iconBoxClass}`}>
          {icon}
        </div>
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h4 className="text-xs sm:text-sm font-bold text-[#712E1E]">
              {title}
            </h4>
            {badge}
          </div>
          {logos ? (
            <div className="flex items-center gap-1.5 flex-wrap">{logos}</div>
          ) : null}
          {description ? (
            <p className="text-[11px] sm:text-xs text-stone-500">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2 pt-0.5">
        <span className="text-xs sm:text-sm font-black text-[#712E1E] whitespace-nowrap">
          {price}
        </span>
        {trailing}
        {radio}
      </div>
    </div>
  );
}

interface SubOptionButtonProps {
  className: string;
  onClick: () => void;
  title: string;
  logoNode: ReactNode;
  description?: ReactNode;
  price: ReactNode;
  radio: ReactNode;
}

function SubOptionButton({
  className,
  onClick,
  title,
  logoNode,
  description,
  price,
  radio,
}: SubOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} w-full flex items-start justify-between gap-2.5 text-left transition`}
    >
      <div className="min-w-0 space-y-1.5">
        <h5 className="text-xs font-bold text-[#712E1E]">{title}</h5>
        <div>{logoNode}</div>
        {description ? (
          <p className="text-[10px] sm:text-[11px] text-stone-500 font-normal">
            {description}
          </p>
        ) : null}
      </div>
      <div className="shrink-0 flex items-center gap-2 pt-0.5">
        <span className="font-bold text-[#712E1E] whitespace-nowrap">
          {price}
        </span>
        {radio}
      </div>
    </button>
  );
}

const CARD_ACTIVE = "border-[#712E1E] bg-[#FAF6EE] shadow-sm";
const CARD_INACTIVE =
  "border-stone-200 bg-white hover:border-[#E59A59]/60 hover:bg-[#FAF6EE]/30";
const ICON_ACTIVE = "bg-[#712E1E] text-[#FFD5AF]";
const ICON_INACTIVE = "bg-stone-100 text-stone-600";
const SUB_ACTIVE =
  "border-[#712E1E] bg-[#FAF6EE] shadow-sm font-bold text-[#712E1E]";
const SUB_INACTIVE =
  "border-stone-100 bg-stone-50/70 hover:bg-stone-100/80 text-stone-700";

export function PaymentMethodPicker({
  basePrice,
  paymentMethod,
  onSelect,
  expandedCategory,
  onExpand,
}: PaymentMethodPickerProps) {
  const { t } = useTranslation();

  const qrisTotal = formatIDR(basePrice + getPaymentMethodFee(basePrice, "qris"));
  const ewalletTotal = formatIDR(
    basePrice + getPaymentMethodFee(basePrice, "gopay"),
  );
  const vaTotal = formatIDR(basePrice + getPaymentMethodFee(basePrice, "bca_va"));
  const waTotal = formatIDR(basePrice);

  const isEwalletActive = isEwalletMethod(paymentMethod);
  const isVaActive = isVaMethod(paymentMethod);
  const ewalletOpen = isEwalletActive || expandedCategory === "ewallet";
  const vaOpen = isVaActive || expandedCategory === "va";

  return (
    <SectionCard step="03" title={t("order.step3Title")}>
      <p className="text-xs text-stone-500 -mt-1 mb-3">{t("order.step3Desc")}</p>
      <div className="space-y-3">
        {/* 1. Other QRIS (Universal) */}
        <CategoryCard
          onClick={() => {
            onSelect("qris");
            onExpand("qris");
          }}
          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
            paymentMethod === "qris" ? CARD_ACTIVE : CARD_INACTIVE
          }`}
          iconBoxClass={
            paymentMethod === "qris" ? ICON_ACTIVE : ICON_INACTIVE
          }
          icon={<QrCode size={20} className="sm:w-[22px] sm:h-[22px]" />}
          title={t("order.methodQrisTitle")}
          badge={
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-[#E59A59]/20 text-[#B4693F] px-1.5 sm:px-2 py-0.5 rounded-full">
              {t("order.feeQrisBadge")}
            </span>
          }
          logos={
            <LogoPill
              src={MIDTRANS_LOGOS.qris}
              alt="QRIS"
              className="h-4 sm:h-5"
            />
          }
          description={t("order.methodQrisSubtitle")}
          price={qrisTotal}
          radio={<RadioDot selected={paymentMethod === "qris"} />}
        />

        {/* 2. E-Wallet / Dompet Digital (Dropdown) */}
        <div
          className={`rounded-xl sm:rounded-2xl border-2 transition-all overflow-hidden ${
            ewalletOpen
              ? "border-[#712E1E] bg-[#FAF6EE]/50 shadow-sm"
              : "border-stone-200 bg-white"
          }`}
        >
          <CategoryCard
            onClick={() => {
              // Hanya membuka/tutup accordion — tidak meng-auto-pilih metode.
              onExpand(expandedCategory === "ewallet" ? null : "ewallet");
            }}
            className="p-3 sm:p-4 cursor-pointer"
            iconBoxClass={isEwalletActive ? ICON_ACTIVE : ICON_INACTIVE}
            icon={<Smartphone size={20} className="sm:w-[22px] sm:h-[22px]" />}
            title={t("order.methodEwalletTitle")}
            badge={
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-[#E59A59]/20 text-[#B4693F] px-1.5 sm:px-2 py-0.5 rounded-full">
                {t("order.feeEwalletBadge")}
              </span>
            }
            logos={
              <>
                <LogoPill src={MIDTRANS_LOGOS.gopay} alt="GoPay" className="h-3" />
                <LogoPill
                  src={MIDTRANS_LOGOS.shopeepay}
                  alt="ShopeePay"
                  className="h-3.5"
                />
                <LogoPill src={MIDTRANS_LOGOS.dana} alt="Dana" className="h-3.5" />
              </>
            }
            description={t("order.methodEwalletSubtitle")}
            price={ewalletTotal}
            trailing={
              <ChevronDown
                size={18}
                className={`text-stone-400 transition-transform ${ewalletOpen ? "rotate-180" : ""}`}
              />
            }
          />

          {/* Sub-Pilihan E-Wallet */}
          {ewalletOpen && (
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 space-y-2 border-t border-stone-200/80 bg-white">
              {EWALLET_OPTIONS.map((option) => (
                <SubOptionButton
                  key={option.id}
                  onClick={() => {
                    onSelect(option.id);
                    onExpand("ewallet");
                  }}
                  className={`p-2.5 sm:p-3.5 rounded-xl border-2 ${
                    paymentMethod === option.id ? SUB_ACTIVE : SUB_INACTIVE
                  }`}
                  title={option.name}
                  logoNode={
                    <div className={option.logoBoxClass}>
                      {option.logos.map((logo) => (
                        <img
                          key={logo.alt}
                          src={logo.src}
                          alt={logo.alt}
                          className={logo.className}
                        />
                      ))}
                    </div>
                  }
                  description={t(option.descKey)}
                  price={formatIDR(
                    basePrice + getPaymentMethodFee(basePrice, option.id),
                  )}
                  radio={<RadioDot selected={paymentMethod === option.id} />}
                />
              ))}
            </div>
          )}
        </div>

        {/* 3. ATM / Bank Transfer (Virtual Account) */}
        <div
          className={`rounded-xl sm:rounded-2xl border-2 transition-all overflow-hidden ${
            vaOpen
              ? "border-[#712E1E] bg-[#FAF6EE]/50 shadow-sm"
              : "border-stone-200 bg-white"
          }`}
        >
          <CategoryCard
            onClick={() => {
              // Hanya membuka/tutup accordion — tidak meng-auto-pilih metode.
              onExpand(expandedCategory === "va" ? null : "va");
            }}
            className="p-3 sm:p-4 cursor-pointer"
            iconBoxClass={isVaActive ? ICON_ACTIVE : ICON_INACTIVE}
            icon={<Building2 size={20} className="sm:w-[22px] sm:h-[22px]" />}
            title={t("order.methodVaTitle")}
            badge={
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-1.5 sm:px-2 py-0.5 rounded-full border border-stone-200">
                {t("order.feeVaBadge")}
              </span>
            }
            logos={
              <>
                <LogoPill src={MIDTRANS_LOGOS.bca} alt="BCA" className="h-3" />
                <LogoPill
                  src={MIDTRANS_LOGOS.mandiri}
                  alt="Mandiri"
                  className="h-3"
                />
                <LogoPill src={MIDTRANS_LOGOS.bni} alt="BNI" className="h-2.5" />
                <LogoPill src={MIDTRANS_LOGOS.bri} alt="BRI" className="h-3" />
                <LogoPill src={MIDTRANS_LOGOS.cimb} alt="CIMB" className="h-2.5" />
                <div className="bg-stone-100 text-stone-600 text-[10px] font-bold rounded-md px-1.5 py-0.5 border border-stone-200">
                  +2
                </div>
              </>
            }
            description={t("order.methodVaSubtitle")}
            price={vaTotal}
            trailing={
              <ChevronDown
                size={18}
                className={`text-stone-400 transition-transform ${vaOpen ? "rotate-180" : ""}`}
              />
            }
          />

          {/* Sub-Pilihan Bank */}
          {vaOpen && (
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-stone-200/80 bg-white">
              {VA_BANKS.map((bank) => (
                <SubOptionButton
                  key={bank.id}
                  onClick={() => {
                    onSelect(bank.id);
                    onExpand("va");
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl border-2 ${
                    paymentMethod === bank.id ? SUB_ACTIVE : SUB_INACTIVE
                  }`}
                  title={bank.name}
                  logoNode={
                    <div className="bg-white border border-stone-200/80 rounded-md px-1.5 py-0.5 flex items-center justify-center shrink-0 shadow-xs min-w-[45px] w-fit">
                      <img
                        src={bank.logo}
                        alt={bank.name}
                        className={`${bank.h} max-w-[40px] object-contain`}
                      />
                    </div>
                  }
                  price={formatIDR(
                    basePrice + getPaymentMethodFee(basePrice, bank.id),
                  )}
                  radio={
                    <RadioDot selected={paymentMethod === bank.id} size="sm" />
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* 4. Transfer Manual WhatsApp */}
        <CategoryCard
          onClick={() => {
            onSelect("whatsapp");
            onExpand("whatsapp");
          }}
          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
            paymentMethod === "whatsapp"
              ? "border-[#25D366] bg-green-50/60 shadow-sm"
              : "border-stone-200 bg-white hover:border-[#25D366]/60 hover:bg-green-50/30"
          }`}
          iconBoxClass={
            paymentMethod === "whatsapp"
              ? "bg-[#25D366] text-white"
              : ICON_INACTIVE
          }
          icon={<FaWhatsapp size={20} className="sm:w-[22px] sm:h-[22px]" />}
          title={t("order.methodWaTitle")}
          badge={
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 rounded-full">
              {t("order.feeFreeBadge")}
            </span>
          }
          description={t("order.methodWaSubtitle")}
          price={waTotal}
          radio={
            <RadioDot selected={paymentMethod === "whatsapp"} color="whatsapp" />
          }
        />
      </div>
    </SectionCard>
  );
}
