// ============================================================
// src/components/order/OrderPaymentActions.tsx
// ------------------------------------------------------------
// Slot captcha wizard /order: widget Cloudflare Turnstile.
// Dipakai sebagai slot "actions" di dalam kartu OrderSummary.
// Keterikatan : react, ui/TurnstileWidget
// ============================================================

import type { RefObject } from "react";
import TurnstileWidget, {
  type TurnstileWidgetRef,
} from "../ui/TurnstileWidget";

interface OrderPaymentCaptchaProps {
  setCaptchaToken: (token: string | null) => void;
  turnstileRef: RefObject<TurnstileWidgetRef | null>;
}

/**
 * Verifikasi Cloudflare Turnstile - diletakkan di dalam kartu
 * ringkasan (slot actions OrderSummary), tepat di atas tombol kembali.
 */
export function OrderPaymentCaptcha({
  setCaptchaToken,
  turnstileRef,
}: OrderPaymentCaptchaProps) {
  return (
    <TurnstileWidget
      ref={turnstileRef}
      onSuccess={(token) => setCaptchaToken(token)}
      onExpire={() => setCaptchaToken(null)}
      onError={() => setCaptchaToken(null)}
    />
  );
}
