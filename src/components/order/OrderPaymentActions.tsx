// ============================================================
// src/components/order/OrderPaymentActions.tsx
// ------------------------------------------------------------
// Blok aksi bayar wizard /order langkah 3: widget Cloudflare Turnstile +
// tombol bayar utama. Dipakai sebagai slot "actions" di dalam kartu
// OrderSummary (di bawah rincian harga), jadi alur pandang user:
// rincian harga -> verifikasi captcha -> tombol bayar -> tombol kembali.
// Ukuran tombol bayar disamakan dengan tombol utama langkah 1 & 2.
// Dipakai di  : pages/OrderPage (lewat OrderSummary actions)
// Keterikatan : react, lucide-react, react-icons, ui/TurnstileWidget,
//               components/order/constants, i18n
// ============================================================

import { Zap } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { RefObject } from "react";
import TurnstileWidget, {
  type TurnstileWidgetRef,
} from "../ui/TurnstileWidget";
import { useTranslation } from "../../i18n";

/** Kelas dasar tombol bayar: tinggi, radius, & font sama dengan tombol footer wizard. */
const PAY_BUTTON_BASE =
  "w-full min-h-11 px-3 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E59A59]/40";

interface OrderPaymentCaptchaProps {
  setCaptchaToken: (token: string | null) => void;
  turnstileRef: RefObject<TurnstileWidgetRef | null>;
}

/**
 * Verifikasi Cloudflare Turnstile langkah 3 - diletakkan di dalam kartu
 * ringkasan (slot actions OrderSummary), tepat di atas tombol bayar.
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

interface OrderPayButtonProps {
  captchaToken: string | null;
  loadingWA: boolean;
  loadingMidtrans: boolean;
  onMidtransCheckout: () => void;
  onWhatsappCheckout: () => void;
}

/**
 * Dua tombol bayar berdampingan (tanpa pilih metode dulu):
 * 1) Otomatis — popup Midtrans Snap, kanal dipilih di dalam Snap.
 * 2) WhatsApp — transfer manual via admin.
 * Keduanya terkunci sampai captcha lolos.
 */
export function OrderPayButton({
  captchaToken,
  loadingWA,
  loadingMidtrans,
  onMidtransCheckout,
  onWhatsappCheckout,
}: OrderPayButtonProps) {
  const { t } = useTranslation();

  const autoDisabled = loadingMidtrans || !captchaToken;
  const waDisabled = loadingWA || !captchaToken;

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={onMidtransCheckout}
        disabled={autoDisabled}
        className={`${PAY_BUTTON_BASE} ${
          autoDisabled
            ? "bg-stone-300 text-stone-500 cursor-not-allowed"
            : "bg-[#712E1E] text-white hover:bg-[#8E3B27] active:scale-[0.99] shadow-lg shadow-[#712E1E]/25"
        }`}
      >
        {loadingMidtrans ? (
          t("order.payMidtransLoading")
        ) : (
          <>
            <Zap className="h-5 w-5 shrink-0" />
            <span className="truncate">{t("order.btnPayAuto")}</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onWhatsappCheckout}
        disabled={waDisabled}
        className={`${PAY_BUTTON_BASE} ${
          waDisabled
            ? "border-2 border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed"
            : "bg-[#25D366] text-white hover:bg-[#20bd5a] active:scale-[0.99] shadow-lg shadow-green-600/20"
        }`}
      >
        {loadingWA ? (
          t("order.payWhatsappLoading")
        ) : (
          <>
            <FaWhatsapp className="h-5 w-5 shrink-0" />
            <span className="truncate">{t("order.btnPayWa")}</span>
          </>
        )}
      </button>
    </div>
  );
}
