// ============================================================
// src/pages/OrderPage.tsx
// ------------------------------------------------------------
// Halaman /order - form pemesanan multi-bagian: pilih template, isi data acara, submit membuat pending order via Edge Function create-order.
// Dipakai di  : App.tsx
// Keterikatan : lib/constants, lib/supabaseClient, ConfirmDialog, GlobalToast
// ============================================================

import { useState, useRef, useMemo, type ChangeEvent, type ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../components/GlobalToast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useTranslation } from "../i18n";
import TurnstileWidget, { type TurnstileWidgetRef } from "../components/ui/TurnstileWidget";
import {
  MASTER_TEMPLATES,
  TEMPLATE_OPTIONS,
  ADMIN_WHATSAPP,
} from "../lib/constants";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Mail,
  Palette,
  RotateCcw,
  User,
  QrCode,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Smartphone,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

type PaymentMethodType =
  | "qris"
  | "gopay"
  | "shopeepay"
  | "dana"
  | "bca_va"
  | "echannel"
  | "bni_va"
  | "bri_va"
  | "cimb_va"
  | "seabank_va"
  | "bsi_va"
  | "whatsapp";

const MIDTRANS_LOGOS = {
  qris: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/qris.svg",
  dana: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/dana.svg",
  shopeepay: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/shopeepay.svg",
  spaylater: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/shopeepay-later-page.svg",
  gopay: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/gopay_text.svg",
  gopaylater: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/gopaylater.svg",
  bca: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/bca.svg",
  mandiri: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/mandiri.svg",
  bni: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/bni.svg",
  bri: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/bri.svg",
  cimb: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/cimb.svg",
  seabank: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/seabank.svg",
  bsi: "https://snap-assets.sandbox.midtrans.com/snap-preferences/sandbox/v1/logos/bsi.svg",
};

const LogoPill = ({ src, alt, className = "h-4" }: { src: string; alt: string; className?: string }) => (
  <div className="bg-white border border-stone-200/90 rounded-md px-2 py-0.5 flex items-center justify-center shadow-xs shrink-0">
    <img src={src} alt={alt} className={`${className} object-contain max-w-[65px]`} />
  </div>
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT_CLASS =
  "pl-10 w-full p-3 rounded-xl border border-stone-200 bg-white focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition";

export default function OrderForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [loadingWA, setLoadingWA] = useState(false);
  const [loadingMidtrans, setLoadingMidtrans] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("qris");
  const [expandedCategory, setExpandedCategory] = useState<"qris" | "ewallet" | "va" | "whatsapp">("qris");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const urlSlug = searchParams.get("template");
  const defaultTemplate =
    TEMPLATE_OPTIONS.find((t) => t.slug === urlSlug) || TEMPLATE_OPTIONS[0];

  const initialFormState = {
    groom_name: "",
    bride_name: "",
    wedding_date: "",
    whatsapp: "",
    email: "",
    template_slug: defaultTemplate.slug,
  };

  const [formData, setFormData] = useState(initialFormState);
  const selectedTemplate =
    TEMPLATE_OPTIONS.find((t) => t.slug === formData.template_slug) ||
    defaultTemplate;
  const selectedImage = MASTER_TEMPLATES.find(
    (t) => t.slug === formData.template_slug,
  )?.image;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsappChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("0")) val = val.substring(1);
    if (val.startsWith("62")) val = val.substring(2);
    setFormData({ ...formData, whatsapp: val });
  };

  const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    setFormData({ ...formData, template_slug: slug });
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setCaptchaToken(null);
    turnstileRef.current?.reset();
    setShowConfirm(false);
    toast.success(t("order.toastResetSuccess"));
  };

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Fungsi Validasi agar tidak diulang-ulang
  const validateForm = () => {
    if (
      !formData.groom_name ||
      !formData.bride_name ||
      !formData.wedding_date
    ) {
      toast.error(t("order.validationErrorRequired"));
      return false;
    }
    if (formData.wedding_date < todayStr) {
      toast.error(t("order.validationErrorDatePast"));
      return false;
    }
    if (!formData.email || !EMAIL_RE.test(formData.email)) {
      toast.error(t("order.validationErrorEmail"));
      return false;
    }
    if (!formData.whatsapp || formData.whatsapp.length < 9) {
      toast.error(t("order.validationErrorWhatsapp"));
      return false;
    }
    if (!captchaToken) {
      toast.warning(t("common.captchaRequired"));
      return false;
    }
    return true;
  };

  // ==========================================
  // CHECKOUT VIA MIDTRANS (OTOMATIS)
  // PIN digenerate webhook saat pembayaran berhasil.
  // ==========================================
  const handleMidtransCheckout = async () => {
    if (!validateForm()) return;

    setLoadingMidtrans(true);

    try {
      if (typeof window.snap === "undefined" || !window.snap?.pay) {
        toast.error(t("toast.midtransUnavailable"));
        return;
      }

      const finalWhatsapp = `+62${formData.whatsapp}`;

      toast.warning(t("toast.orderCreateLoading"));

      const { data, error } = await supabase.functions.invoke("create-order", {
        body: {
          groom_name: formData.groom_name.trim(),
          bride_name: formData.bride_name.trim(),
          wedding_date: formData.wedding_date,
          whatsapp: finalWhatsapp,
          email: formData.email.trim().toLowerCase(),
          template_slug: formData.template_slug,
          payment_method: paymentMethod,
          captcha_token: captchaToken,
        },
      });

      if (error) {
        throw new Error(error?.message || "Gagal membuat pesanan pembayaran.");
      }

      if (!data?.snap_token || !data?.order_id) {
        throw new Error("Token pembayaran tidak diterima dari server.");
      }

      window.snap?.pay?.(data.snap_token, {
        onSuccess: function (result) {
          toast.success(t("toast.paymentSuccessPinSent"));
          navigate(
            `/payment-status?order_id=${result.order_id || data.order_id}`,
          );
        },
        onPending: function (result) {
          toast.warning(t("toast.paymentWaiting"));
          navigate(
            `/payment-status?order_id=${result.order_id || data.order_id}`,
          );
        },
        onError: function (result) {
          console.error("[OrderForm] Payment error:", result);
          toast.error(t("toast.paymentFailedRetry"));
        },
        onClose: function () {
          toast.warning(t("toast.paymentPopupClosed"));
          navigate(`/payment-status?order_id=${data.order_id}`);
        },
      });
    } catch (err) {
      console.error("[OrderForm] Midtrans checkout error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses pembayaran.";
      toast.error(msg);
    } finally {
      setLoadingMidtrans(false);
    }
  };

  // ==========================================
  // CHECKOUT VIA WHATSAPP (MANUAL — DIAKTIFKAN ADMIN)
  // PIN digenerate otomatis saat admin mengaktifkan pesanan.
  // ==========================================
  const handleWhatsappCheckout = async () => {
    if (!validateForm()) return;
    setLoadingWA(true);

    try {
      const finalWhatsapp = `+62${formData.whatsapp}`;

      // Insert ke tabel "pending_orders" (BUKAN orders) + email untuk pengiriman PIN
      const { error } = await supabase.from("pending_orders").insert([
        {
          groom_name: formData.groom_name,
          bride_name: formData.bride_name,
          wedding_date: formData.wedding_date,
          whatsapp: finalWhatsapp,
          email: formData.email.trim().toLowerCase(),
          template_slug: formData.template_slug,
        },
      ]);

      if (error) throw error;

      const message = `Halo Admin, saya ingin memesan Undangan Digital:
        *Data Mempelai:*
        Pria: ${formData.groom_name}
        Wanita: ${formData.bride_name}
        Tanggal: ${formData.wedding_date}
        Email: ${formData.email}
        *Order:*
        Template: ${selectedTemplate.name}
        Total Harga: Rp ${selectedTemplate.price.toLocaleString("id-ID")}
        Mohon info cara pembayarannya.`;

      const waUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
      toast.success(t("toast.openingWhatsapp"));

      window.open(waUrl, "_blank");
      setTimeout(() => navigate("/order/success"), 1200);
    } catch (err) {
      console.error(err);
      toast.error(t("toast.orderCreateFailed", { error: err instanceof Error ? err.message : String(err) }));
    } finally {
      setLoadingWA(false);
    }
  };

  const formatIDR = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-h-screen bg-[#F1E8DC] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* --- HEADER --- */}
        <div className="flex items-start justify-between gap-4 mb-8 md:mb-10">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-[#E59A59] transition"
            >
              <ArrowLeft size={13} /> {t("order.back")}
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#712E1E] mt-2">
              {t("order.title")}
            </h1>
            <p className="mt-1.5 text-sm md:text-base text-stone-500">
              {t("order.desc")}
            </p>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-red-500 transition px-3 py-2 rounded-xl hover:bg-red-50"
            title={t("order.resetForm")}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">{t("order.resetForm")}</span>
          </button>
        </div>

        {/* --- GRID UTAMA: FORM + SUMMARY --- */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">
          {/* ===== KOLOM KIRI: FORM ===== */}
          <div className="space-y-5 order-1">
            {/* 1. Pilih Desain */}
            <SectionCard step="01" title={t("order.step1Title")}>
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                <select
                  name="template_slug"
                  value={formData.template_slug}
                  onChange={handleTemplateChange}
                  className={`${INPUT_CLASS} cursor-pointer`}
                >
                  {TEMPLATE_OPTIONS.map((tOpt) => (
                    <option key={tOpt.slug} value={tOpt.slug}>
                      {tOpt.name} — {tOpt.category}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-stone-400 -mt-1">
                {t("order.step1Desc")}
              </p>
            </SectionCard>

            {/* 2. Data Mempelai, Acara & Kontak */}
            <SectionCard step="02" title={t("order.step2Title")}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                      {t("order.groomName")}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        required
                        name="groom_name"
                        value={formData.groom_name}
                        type="text"
                        placeholder={t("order.groomPlaceholder")}
                        onChange={handleChange}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                      {t("order.brideName")}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        required
                        name="bride_name"
                        value={formData.bride_name}
                        type="text"
                        placeholder={t("order.bridePlaceholder")}
                        onChange={handleChange}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                    {t("order.weddingDate")}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      required
                      name="wedding_date"
                      value={formData.wedding_date}
                      type="date"
                      min={todayStr}
                      onChange={handleChange}
                      className={`${INPUT_CLASS} text-stone-600`}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/70 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                      {t("order.email")}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        required
                        name="email"
                        type="email"
                        placeholder={t("order.emailPlaceholder")}
                        value={formData.email}
                        onChange={handleChange}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                      {t("order.whatsapp")}
                    </label>
                    <div className="relative">
                      <FaWhatsapp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        required
                        name="whatsapp"
                        type="tel"
                        placeholder={t("order.whatsappPlaceholder")}
                        value={formData.whatsapp}
                        onChange={handleWhatsappChange}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 3. Metode Pembayaran */}
            <SectionCard step="03" title={t("order.step3Title")}>
              <p className="text-xs text-stone-500 -mt-1 mb-3">
                {t("order.step3Desc")}
              </p>
              <div className="space-y-3">
                
                {/* 1. Other QRIS (Universal) */}
                <div
                  onClick={() => {
                    setPaymentMethod("qris");
                    setExpandedCategory("qris");
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    paymentMethod === "qris"
                      ? "border-[#712E1E] bg-[#FAF6EE] shadow-sm"
                      : "border-stone-200 bg-white hover:border-[#E59A59]/60 hover:bg-[#FAF6EE]/30"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${paymentMethod === "qris" ? "bg-[#712E1E] text-[#FFD5AF]" : "bg-stone-100 text-stone-600"}`}>
                      <QrCode size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#712E1E]">{t("order.methodQrisTitle")}</h4>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-[#E59A59]/20 text-[#B4693F] px-2 py-0.5 rounded-full">
                          {t("order.methodQrisBadge")}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 truncate sm:whitespace-normal">
                        {t("order.methodQrisSubtitle")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <LogoPill src={MIDTRANS_LOGOS.qris} alt="QRIS" className="h-5" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "qris" ? "border-[#712E1E] bg-[#712E1E]" : "border-stone-300"}`}>
                      {paymentMethod === "qris" && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* 2. E-Wallet / Dompet Digital (Dropdown) */}
                <div className={`rounded-2xl border-2 transition-all overflow-hidden ${
                  ["gopay", "shopeepay", "dana"].includes(paymentMethod) || expandedCategory === "ewallet"
                    ? "border-[#712E1E] bg-[#FAF6EE]/50 shadow-sm"
                    : "border-stone-200 bg-white"
                }`}>
                  <div
                    onClick={() => {
                      setExpandedCategory(expandedCategory === "ewallet" ? "qris" : "ewallet");
                      if (!["gopay", "shopeepay", "dana"].includes(paymentMethod)) {
                        setPaymentMethod("gopay");
                      }
                    }}
                    className="p-4 cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 ${["gopay", "shopeepay", "dana"].includes(paymentMethod) ? "bg-[#712E1E] text-[#FFD5AF]" : "bg-stone-100 text-stone-600"}`}>
                        <Smartphone size={22} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#712E1E]">{t("order.methodEwalletTitle")}</h4>
                        <p className="text-xs text-stone-500 truncate sm:whitespace-normal">{t("order.methodEwalletSubtitle")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:flex items-center gap-1.5">
                        <LogoPill src={MIDTRANS_LOGOS.gopay} alt="GoPay" className="h-3" />
                        <LogoPill src={MIDTRANS_LOGOS.shopeepay} alt="ShopeePay" className="h-3.5" />
                        <LogoPill src={MIDTRANS_LOGOS.dana} alt="Dana" className="h-3.5" />
                      </div>
                      <ChevronDown size={18} className={`text-stone-400 transition-transform ${expandedCategory === "ewallet" || ["gopay", "shopeepay", "dana"].includes(paymentMethod) ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {/* Sub-Pilihan E-Wallet */}
                  {(expandedCategory === "ewallet" || ["gopay", "shopeepay", "dana"].includes(paymentMethod)) && (
                    <div className="px-4 pb-4 pt-2 space-y-2 border-t border-stone-200/80 bg-white">
                      {/* GoPay */}
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("gopay");
                          setExpandedCategory("ewallet");
                        }}
                        className={`w-full p-3.5 rounded-xl border-2 text-left transition flex items-center justify-between gap-3 ${
                          paymentMethod === "gopay"
                            ? "border-[#712E1E] bg-[#FAF6EE] shadow-sm font-bold text-[#712E1E]"
                            : "border-stone-100 bg-stone-50/70 hover:bg-stone-100/80 text-stone-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-white border border-stone-200/90 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-xs shrink-0">
                            <img src={MIDTRANS_LOGOS.gopay} alt="GoPay" className="h-4 w-auto object-contain" />
                            <img src={MIDTRANS_LOGOS.gopaylater} alt="GoPayLater" className="h-4 w-auto object-contain" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-[#712E1E]">GoPay / GoPay Later</h5>
                            <p className="text-[11px] text-stone-500 font-normal">{t("order.gopayDesc")}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "gopay" ? "border-[#712E1E] bg-[#712E1E]" : "border-stone-300"}`}>
                          {paymentMethod === "gopay" && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>

                      {/* ShopeePay */}
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("shopeepay");
                          setExpandedCategory("ewallet");
                        }}
                        className={`w-full p-3.5 rounded-xl border-2 text-left transition flex items-center justify-between gap-3 ${
                          paymentMethod === "shopeepay"
                            ? "border-[#712E1E] bg-[#FAF6EE] shadow-sm font-bold text-[#712E1E]"
                            : "border-stone-100 bg-stone-50/70 hover:bg-stone-100/80 text-stone-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-white border border-stone-200/90 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-xs shrink-0">
                            <img src={MIDTRANS_LOGOS.shopeepay} alt="ShopeePay" className="h-4.5 w-auto object-contain" />
                            <img src={MIDTRANS_LOGOS.spaylater} alt="SPayLater" className="h-4 w-auto object-contain" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-[#712E1E]">ShopeePay / SPayLater</h5>
                            <p className="text-[11px] text-stone-500 font-normal">{t("order.shopeepayDesc")}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "shopeepay" ? "border-[#712E1E] bg-[#712E1E]" : "border-stone-300"}`}>
                          {paymentMethod === "shopeepay" && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>

                      {/* Dana */}
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("dana");
                          setExpandedCategory("ewallet");
                        }}
                        className={`w-full p-3.5 rounded-xl border-2 text-left transition flex items-center justify-between gap-3 ${
                          paymentMethod === "dana"
                            ? "border-[#712E1E] bg-[#FAF6EE] shadow-sm font-bold text-[#712E1E]"
                            : "border-stone-100 bg-stone-50/70 hover:bg-stone-100/80 text-stone-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-white border border-stone-200/90 rounded-lg px-2.5 py-1 flex items-center shadow-xs shrink-0">
                            <img src={MIDTRANS_LOGOS.dana} alt="Dana" className="h-4.5 w-auto object-contain" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-[#712E1E]">Dana</h5>
                            <p className="text-[11px] text-stone-500 font-normal">{t("order.danaDesc")}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "dana" ? "border-[#712E1E] bg-[#712E1E]" : "border-stone-300"}`}>
                          {paymentMethod === "dana" && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. ATM / Bank Transfer (Virtual Account) */}
                <div className={`rounded-2xl border-2 transition-all overflow-hidden ${
                  ["bca_va", "echannel", "bni_va", "bri_va", "cimb_va", "seabank_va", "bsi_va"].includes(paymentMethod) || expandedCategory === "va"
                    ? "border-[#712E1E] bg-[#FAF6EE]/50 shadow-sm"
                    : "border-stone-200 bg-white"
                }`}>
                  <div
                    onClick={() => {
                      setExpandedCategory(expandedCategory === "va" ? "qris" : "va");
                      if (!["bca_va", "echannel", "bni_va", "bri_va", "cimb_va", "seabank_va", "bsi_va"].includes(paymentMethod)) {
                        setPaymentMethod("bca_va");
                      }
                    }}
                    className="p-4 cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 ${["bca_va", "echannel", "bni_va", "bri_va", "cimb_va", "seabank_va", "bsi_va"].includes(paymentMethod) ? "bg-[#712E1E] text-[#FFD5AF]" : "bg-stone-100 text-stone-600"}`}>
                        <Building2 size={22} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#712E1E]">{t("order.methodVaTitle")}</h4>
                        <p className="text-xs text-stone-500 truncate sm:whitespace-normal">{t("order.methodVaSubtitle")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden md:flex items-center gap-1">
                        <LogoPill src={MIDTRANS_LOGOS.bca} alt="BCA" className="h-3" />
                        <LogoPill src={MIDTRANS_LOGOS.mandiri} alt="Mandiri" className="h-3" />
                        <LogoPill src={MIDTRANS_LOGOS.bni} alt="BNI" className="h-2.5" />
                        <LogoPill src={MIDTRANS_LOGOS.bri} alt="BRI" className="h-3" />
                        <LogoPill src={MIDTRANS_LOGOS.cimb} alt="CIMB" className="h-2.5" />
                        <div className="bg-stone-100 text-stone-600 text-[10px] font-bold rounded-md px-1.5 py-0.5 border border-stone-200">
                          +2
                        </div>
                      </div>
                      <ChevronDown size={18} className={`text-stone-400 transition-transform ${expandedCategory === "va" || ["bca_va", "echannel", "bni_va", "bri_va", "cimb_va", "seabank_va", "bsi_va"].includes(paymentMethod) ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {/* Sub-Pilihan Bank */}
                  {(expandedCategory === "va" || ["bca_va", "echannel", "bni_va", "bri_va", "cimb_va", "seabank_va", "bsi_va"].includes(paymentMethod)) && (
                    <div className="px-4 pb-4 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-stone-200/80 bg-white">
                      {[
                        { id: "bca_va", name: "BCA Virtual Account", logo: MIDTRANS_LOGOS.bca, h: "h-3.5" },
                        { id: "echannel", name: "Mandiri Virtual Account", logo: MIDTRANS_LOGOS.mandiri, h: "h-3.5" },
                        { id: "bni_va", name: "BNI Virtual Account", logo: MIDTRANS_LOGOS.bni, h: "h-3" },
                        { id: "bri_va", name: "BRI Virtual Account", logo: MIDTRANS_LOGOS.bri, h: "h-3.5" },
                        { id: "cimb_va", name: "CIMB Niaga VA", logo: MIDTRANS_LOGOS.cimb, h: "h-3" },
                        { id: "seabank_va", name: "SeaBank Direct VA", logo: MIDTRANS_LOGOS.seabank, h: "h-3.5" },
                        { id: "bsi_va", name: "BSI (Bank Syariah Indonesia)", logo: MIDTRANS_LOGOS.bsi, h: "h-3.5" },
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(bank.id as PaymentMethodType);
                            setExpandedCategory("va");
                          }}
                          className={`p-3 rounded-xl border-2 text-left transition flex items-center justify-between gap-2.5 ${
                            paymentMethod === bank.id
                              ? "border-[#712E1E] bg-[#FAF6EE] shadow-sm font-bold text-[#712E1E]"
                              : "border-stone-100 bg-stone-50/70 hover:bg-stone-100/80 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="bg-white border border-stone-200/80 rounded-md px-2 py-0.5 flex items-center justify-center shrink-0 shadow-xs min-w-[50px]">
                              <img src={bank.logo} alt={bank.name} className={`${bank.h} max-w-[45px] object-contain`} />
                            </div>
                            <span className="text-xs font-semibold">{bank.name}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === bank.id ? "border-[#712E1E] bg-[#712E1E]" : "border-stone-300"}`}>
                            {paymentMethod === bank.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. Transfer Manual WhatsApp */}
                <div
                  onClick={() => {
                    setPaymentMethod("whatsapp");
                    setExpandedCategory("whatsapp");
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    paymentMethod === "whatsapp"
                      ? "border-[#25D366] bg-green-50/60 shadow-sm"
                      : "border-stone-200 bg-white hover:border-[#25D366]/60 hover:bg-green-50/30"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${paymentMethod === "whatsapp" ? "bg-[#25D366] text-white" : "bg-stone-100 text-stone-600"}`}>
                      <FaWhatsapp size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#712E1E]">{t("order.methodWaTitle")}</h4>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                          {t("order.methodWaBadge")}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 truncate sm:whitespace-normal">{t("order.methodWaSubtitle")}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "whatsapp" ? "border-[#25D366] bg-[#25D366]" : "border-stone-300"}`}>
                    {paymentMethod === "whatsapp" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

              </div>
            </SectionCard>
          </div>

          {/* ===== KOLOM KANAN: RINGKASAN & PEMBAYARAN ===== */}
          <aside className="order-2 lg:sticky lg:top-6 space-y-4">
            <div className="bg-white rounded-2xl border border-[#EBDFCE] shadow-md overflow-hidden">
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
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm ${selectedTemplate.category === "RSVP"
                    ? "bg-[#712E1E] text-white"
                    : "bg-[#F7EEE3] text-[#712E1E] border border-[#EBDFCE]"
                    }`}
                >
                  {selectedTemplate.category}
                </span>
              </div>

              <div className="p-5 md:p-6 space-y-5">
                {/* Nama Tema */}
                <h2 className="font-extrabold text-lg text-[#712E1E] leading-tight">
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
                    value={
                      paymentMethod === "qris"
                        ? "QRIS Universal"
                        : paymentMethod === "gopay"
                        ? "GoPay"
                        : paymentMethod === "shopeepay"
                        ? "ShopeePay"
                        : paymentMethod === "dana"
                        ? "Dana"
                        : paymentMethod === "bca_va"
                        ? "BCA VA"
                        : paymentMethod === "echannel"
                        ? "Mandiri VA"
                        : paymentMethod === "bni_va"
                        ? "BNI VA"
                        : paymentMethod === "bri_va"
                        ? "BRI VA"
                        : paymentMethod === "cimb_va"
                        ? "CIMB Niaga VA"
                        : paymentMethod === "seabank_va"
                        ? "SeaBank VA"
                        : paymentMethod === "bsi_va"
                        ? "BSI VA"
                        : "WhatsApp CS"
                    }
                    muted={false}
                  />
                </div>

                {/* Total — baris informasi, bukan tombol */}
                <div className="flex justify-between items-center pt-4 border-t border-[#F3EBDF]">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    {t("order.totalPayment")}
                  </span>
                  <span className="text-lg font-extrabold text-[#712E1E]">
                    {formatIDR(selectedTemplate.price)}
                  </span>
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
                      onClick={handleWhatsappCheckout}
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
                          <FaWhatsapp className="w-5 h-5" /> {t("order.btnPayWa")}
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMidtransCheckout}
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
                          {paymentMethod.endsWith("_va") || paymentMethod === "echannel" ? (
                            <Building2 className="w-5 h-5" />
                          ) : paymentMethod === "qris" ? (
                            <QrCode className="w-5 h-5" />
                          ) : (
                            <Smartphone className="w-5 h-5" />
                          )}
                          <span>
                            {paymentMethod === "qris"
                              ? t("order.btnPayQris")
                              : paymentMethod === "gopay"
                              ? t("order.btnPayGopay")
                              : paymentMethod === "shopeepay"
                              ? t("order.btnPayShopeepay")
                              : paymentMethod === "dana"
                              ? t("order.btnPayDana")
                              : paymentMethod === "bca_va"
                              ? t("order.btnPayBca")
                              : paymentMethod === "echannel"
                              ? t("order.btnPayMandiri")
                              : paymentMethod === "bni_va"
                              ? t("order.btnPayBni")
                              : paymentMethod === "bri_va"
                              ? t("order.btnPayBri")
                              : paymentMethod === "cimb_va"
                              ? t("order.btnPayCimb")
                              : paymentMethod === "seabank_va"
                              ? t("order.btnPaySeabank")
                              : paymentMethod === "bsi_va"
                              ? t("order.btnPayBsi")
                              : t("order.btnPayVa")}
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title={t("order.resetDialogTitle")}
        message={t("order.resetDialogMsg")}
        isDanger={true}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleReset}
      />
    </div>
  );
}

/* ------------------------------ Sub-komponen ------------------------------ */

function SectionCard({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-[#EBDFCE] shadow-sm p-6 md:p-7 space-y-4">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 shrink-0 rounded-xl bg-[#F7EEE3] text-[#B4693F] grid place-items-center text-sm font-black tracking-tight">
          {step}
        </span>
        <h2 className="font-bold text-[#712E1E]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SummaryRow({
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
