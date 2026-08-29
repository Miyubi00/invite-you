// ============================================================
// src/pages/OrderPage.tsx
// ------------------------------------------------------------
// Halaman /order - form pemesanan multi-bagian: pilih template, isi data acara,
// pilih metode pembayaran, submit membuat pending order via Edge Function create-order.
// Dipakai di  : App.tsx
// Keterikatan : lib/constants, lib/supabaseClient, hooks/useOrderCheckout,
//               components/order/*, ConfirmDialog, GlobalToast
// ============================================================

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../components/GlobalToast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useTranslation } from "../i18n";
import type { TurnstileWidgetRef } from "../components/ui/TurnstileWidget";
import { MASTER_TEMPLATES, type MasterTemplate } from "../lib/constants";
import { goBackOrHome } from "../lib/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { OrderDetailsForm } from "../components/order/OrderDetailsForm";
import { PaymentMethodPicker } from "../components/order/PaymentMethodPicker";
import { OrderSummary } from "../components/order/OrderSummary";
import {
  type ExpandedCategory,
  type PaymentMethodType,
} from "../components/order/constants";
import { useOrderCheckout } from "../hooks/useOrderCheckout";

export default function OrderForm() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showConfirm, setShowConfirm] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("qris");
  const [expandedCategory, setExpandedCategory] =
    useState<ExpandedCategory>("qris");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const [templateList, setTemplateList] =
    useState<MasterTemplate[]>(MASTER_TEMPLATES);

  useEffect(() => {
    let isMounted = true;
    const fetchTemplates = async () => {
      try {
        const { data: dbTemplates, error } = await supabase
          .from("templates")
          .select("*")
          .order("name", { ascending: true });

        if (!error && dbTemplates && dbTemplates.length > 0 && isMounted) {
          const combined = dbTemplates.map((dbItem) => {
            const local = MASTER_TEMPLATES.find((t) => t.slug === dbItem.slug);
            return {
              id: dbItem.id ?? (local ? local.id : 0),
              slug: dbItem.slug,
              name: dbItem.name,
              category: dbItem.category,
              price: Number(dbItem.price),
              image: local
                ? local.image
                : "https://r2.loverse.my.id/themes/botanical-gold.webp",
            };
          });
          setTemplateList(combined);
        }
      } catch (err) {
        console.warn("Gagal memuat harga template dari database:", err);
      }
    };

    fetchTemplates();
    return () => {
      isMounted = false;
    };
  }, []);

  const urlSlug = searchParams.get("template");
  const defaultTemplate =
    templateList.find((t) => t.slug === urlSlug) ||
    MASTER_TEMPLATES.find((t) => t.slug === urlSlug) ||
    templateList[0] ||
    MASTER_TEMPLATES[0];

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
    templateList.find((t) => t.slug === formData.template_slug) ||
    defaultTemplate;
  const selectedImage =
    selectedTemplate?.image ||
    MASTER_TEMPLATES.find((t) => t.slug === formData.template_slug)?.image;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsappChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("0")) val = val.substring(1);
    setFormData({ ...formData, whatsapp: val });
  };

  const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, template_slug: e.target.value });
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setShowConfirm(false);
    toast.success(t("order.toastResetSuccess"));
  };

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const invalidateCaptcha = () => {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  };

  const {
    loadingWA,
    loadingMidtrans,
    handleMidtransCheckout,
    handleWhatsappCheckout,
  } = useOrderCheckout({
    formData,
    selectedTemplate,
    paymentMethod,
    captchaToken,
    invalidateCaptcha,
  });

  return (
    <div className="min-h-screen bg-[#F1E8DC] font-sans w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 md:py-12 min-w-0">
        {/* --- HEADER --- */}
        <div className="flex items-start justify-between gap-3 mb-5 sm:mb-8 md:mb-10 min-w-0">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => goBackOrHome(navigate)}
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-[#E59A59] transition"
            >
              <ArrowLeft size={13} /> {t("order.back")}
            </button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#712E1E] mt-1.5 sm:mt-2 truncate">
              {t("order.title")}
            </h1>
            <p className="mt-1 text-xs sm:text-sm md:text-base text-stone-500">
              {t("order.desc")}
            </p>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-red-500 transition px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-red-50"
            title={t("order.resetForm")}
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t("order.resetForm")}</span>
          </button>
        </div>

        {/* --- GRID UTAMA: FORM + SUMMARY --- */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-4 sm:gap-6 lg:gap-8 items-start w-full min-w-0 max-w-full">
          {/* ===== KOLOM KIRI: FORM ===== */}
          <div className="space-y-4 sm:space-y-5 order-1 w-full min-w-0 max-w-full">
            <OrderDetailsForm
              formData={formData}
              templateList={templateList}
              todayStr={todayStr}
              onChange={handleChange}
              onWhatsappChange={handleWhatsappChange}
              onTemplateChange={handleTemplateChange}
            />
            <PaymentMethodPicker
              basePrice={selectedTemplate.price}
              paymentMethod={paymentMethod}
              onSelect={setPaymentMethod}
              expandedCategory={expandedCategory}
              onExpand={setExpandedCategory}
            />
          </div>

          {/* ===== KOLOM KANAN: RINGKASAN & PEMBAYARAN ===== */}
          <aside className="order-2 lg:sticky lg:top-6 space-y-4">
            <OrderSummary
              formData={formData}
              selectedTemplate={selectedTemplate}
              selectedImage={selectedImage}
              paymentMethod={paymentMethod}
              captchaToken={captchaToken}
              setCaptchaToken={setCaptchaToken}
              turnstileRef={turnstileRef}
              loadingWA={loadingWA}
              loadingMidtrans={loadingMidtrans}
              onMidtransCheckout={handleMidtransCheckout}
              onWhatsappCheckout={handleWhatsappCheckout}
            />
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
