// ============================================================
// src/hooks/useOrderCheckout.ts
// ------------------------------------------------------------
// Hook alur checkout halaman /order: validasi form, submit pending order
// via Edge Function create-order (Midtrans Snap) dan insert pending_orders
// untuk checkout manual WhatsApp.
// Dipakai di  : pages/OrderPage
// Keterikatan : lib/supabaseClient, lib/constants, components/GlobalToast,
//               components/order/constants
// ============================================================

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/GlobalToast";
import { useTranslation } from "../i18n";
import { ADMIN_WHATSAPP, type MasterTemplate } from "../lib/constants";
import {
  EMAIL_RE,
  type OrderFormData,
  type PaymentMethodType,
} from "../components/order/constants";

interface UseOrderCheckoutArgs {
  formData: OrderFormData;
  selectedTemplate: MasterTemplate;
  paymentMethod: PaymentMethodType;
  captchaToken: string | null;
  invalidateCaptcha: () => void;
}

export function useOrderCheckout({
  formData,
  selectedTemplate,
  paymentMethod,
  captchaToken,
  invalidateCaptcha,
}: UseOrderCheckoutArgs) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [loadingWA, setLoadingWA] = useState(false);
  const [loadingMidtrans, setLoadingMidtrans] = useState(false);

  const validateInputs = () => {
    if (!formData.groom_name.trim() || !formData.bride_name.trim()) {
      toast.warning(t("validation.coupleRequired"));
      return false;
    }
    if (!formData.wedding_date) {
      toast.warning(t("validation.weddingDateRequired"));
      return false;
    }
    if (!formData.email.trim() || !EMAIL_RE.test(formData.email.trim())) {
      toast.warning(t("validation.emailInvalid"));
      return false;
    }
    if (!formData.whatsapp.trim() || formData.whatsapp.length < 8) {
      toast.warning(t("validation.whatsappInvalid"));
      return false;
    }
    return true;
  };

  const handleMidtransCheckout = async () => {
    if (!validateInputs()) return;
    if (!captchaToken) {
      toast.warning(t("common.captchaRequired"));
      return;
    }

    setLoadingMidtrans(true);
    const finalWhatsapp = `+62${formData.whatsapp}`;

    try {
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
        let errMessage = t("toast.orderCreateFailed", {
          error: "Unknown error",
        });
        try {
          const ctx = (error as { context?: Response }).context;
          if (ctx && typeof ctx.json === "function") {
            const body = (await ctx.json()) as { error?: string };
            if (body?.error) errMessage = body.error;
          }
        } catch {
          /* fallback */
        }
        throw new Error(errMessage);
      }

      const payment = data as {
        success: boolean;
        order_id: string;
        token?: string;
        redirect_url?: string;
      };

      if (!payment || !payment.order_id) {
        throw new Error(
          t("toast.orderCreateFailed", { error: "Gagal membuat invoice" }),
        );
      }

      if (
        payment.token &&
        typeof window.snap !== "undefined" &&
        window.snap?.pay
      ) {
        window.snap.pay(payment.token, {
          onSuccess: function (result: { order_id?: string }) {
            toast.success(t("toast.paymentSuccessPinSent"));
            navigate(
              `/payment-status?order_id=${result.order_id || payment.order_id}`,
            );
          },
          onPending: function (result: { order_id?: string }) {
            toast.warning(t("toast.paymentWaiting"));
            navigate(
              `/payment-status?order_id=${result.order_id || payment.order_id}`,
            );
          },
          onError: function () {
            toast.error(t("toast.paymentFailedRetry"));
          },
          onClose: function () {
            toast.warning(t("toast.paymentPopupClosed"));
            navigate(`/payment-status?order_id=${payment.order_id}`);
          },
        });
      } else if (payment.redirect_url) {
        window.location.href = payment.redirect_url;
      } else {
        navigate(`/payment-status?order_id=${payment.order_id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : t("toast.systemError"));
      invalidateCaptcha();
    } finally {
      setLoadingMidtrans(false);
    }
  };

  const handleWhatsappCheckout = async () => {
    if (!validateInputs()) return;
    if (!captchaToken) {
      toast.warning(t("common.captchaRequired"));
      return;
    }

    setLoadingWA(true);

    try {
      const finalWhatsapp = `+62${formData.whatsapp}`;

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
      toast.error(
        t("toast.orderCreateFailed", {
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    } finally {
      setLoadingWA(false);
    }
  };

  return {
    loadingWA,
    loadingMidtrans,
    handleMidtransCheckout,
    handleWhatsappCheckout,
  };
}
