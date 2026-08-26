// ============================================================
// src/components/order/constants.ts
// ------------------------------------------------------------
// Konstanta, tipe, dan helper halaman /order: metode pembayaran,
// logo Midtrans, konfigurasi e-wallet & bank VA, util harga/form.
// Dipakai di  : pages/OrderPage, hooks/useOrderCheckout, components/order/*
// Keterikatan : -
// ============================================================

export type PaymentMethodType =
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

export type ExpandedCategory = "qris" | "ewallet" | "va" | "whatsapp";

export type MidtransMethod = Exclude<PaymentMethodType, "whatsapp">;

export interface OrderFormData {
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  whatsapp: string;
  email: string;
  template_slug: string;
}

export const MIDTRANS_LOGOS = {
  qris: "/logos/payment/qris.svg",
  dana: "/logos/payment/dana.svg",
  shopeepay: "/logos/payment/shopeepay.svg",
  spaylater: "/logos/payment/spaylater.svg",
  gopay: "/logos/payment/gopay.svg",
  gopaylater: "/logos/payment/gopaylater.svg",
  bca: "/logos/payment/bca.svg",
  mandiri: "/logos/payment/mandiri.svg",
  bni: "/logos/payment/bni.svg",
  bri: "/logos/payment/bri.svg",
  cimb: "/logos/payment/cimb.svg",
  seabank: "/logos/payment/seabank.svg",
  bsi: "/logos/payment/bsi.svg",
};

const EWALLET_METHODS = [
  "gopay",
  "shopeepay",
  "dana",
] as const satisfies readonly MidtransMethod[];

const VA_METHODS = [
  "bca_va",
  "echannel",
  "bni_va",
  "bri_va",
  "cimb_va",
  "seabank_va",
  "bsi_va",
] as const satisfies readonly MidtransMethod[];

export type EwalletMethod = (typeof EWALLET_METHODS)[number];
export type VaMethod = (typeof VA_METHODS)[number];

export const isEwalletMethod = (
  method: PaymentMethodType,
): method is EwalletMethod =>
  (EWALLET_METHODS as readonly string[]).includes(method);

export const isVaMethod = (method: PaymentMethodType): method is VaMethod =>
  (VA_METHODS as readonly string[]).includes(method);

interface EwalletOption {
  id: EwalletMethod;
  name: string;
  descKey: string;
  logoBoxClass: string;
  logos: { src: string; alt: string; className: string }[];
}

export const EWALLET_OPTIONS: readonly EwalletOption[] = [
  {
    id: "gopay",
    name: "GoPay / GoPay Later",
    descKey: "order.gopayDesc",
    logoBoxClass:
      "bg-white border border-stone-200/90 rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 flex items-center gap-1 shadow-xs shrink-0",
    logos: [
      {
        src: MIDTRANS_LOGOS.gopay,
        alt: "GoPay",
        className: "h-3.5 sm:h-4 w-auto object-contain",
      },
      {
        src: MIDTRANS_LOGOS.gopaylater,
        alt: "GoPayLater",
        className: "h-3.5 sm:h-4 w-auto object-contain",
      },
    ],
  },
  {
    id: "shopeepay",
    name: "ShopeePay / SPayLater",
    descKey: "order.shopeepayDesc",
    logoBoxClass:
      "bg-white border border-stone-200/90 rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 flex items-center gap-1 shadow-xs shrink-0",
    logos: [
      {
        src: MIDTRANS_LOGOS.shopeepay,
        alt: "ShopeePay",
        className: "h-3.5 sm:h-4.5 w-auto object-contain",
      },
      {
        src: MIDTRANS_LOGOS.spaylater,
        alt: "SPayLater",
        className: "h-3.5 sm:h-4 w-auto object-contain",
      },
    ],
  },
  {
    id: "dana",
    name: "Dana",
    descKey: "order.danaDesc",
    logoBoxClass:
      "bg-white border border-stone-200/90 rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 flex items-center shadow-xs shrink-0",
    logos: [
      {
        src: MIDTRANS_LOGOS.dana,
        alt: "Dana",
        className: "h-3.5 sm:h-4.5 w-auto object-contain",
      },
    ],
  },
];

interface VaBank {
  id: VaMethod;
  name: string;
  logo: string;
  h: string;
}

export const VA_BANKS: readonly VaBank[] = [
  {
    id: "bca_va",
    name: "BCA Virtual Account",
    logo: MIDTRANS_LOGOS.bca,
    h: "h-3",
  },
  {
    id: "echannel",
    name: "Mandiri Virtual Account",
    logo: MIDTRANS_LOGOS.mandiri,
    h: "h-3",
  },
  {
    id: "bni_va",
    name: "BNI Virtual Account",
    logo: MIDTRANS_LOGOS.bni,
    h: "h-2.5",
  },
  {
    id: "bri_va",
    name: "BRI Virtual Account",
    logo: MIDTRANS_LOGOS.bri,
    h: "h-3",
  },
  {
    id: "cimb_va",
    name: "CIMB Niaga VA",
    logo: MIDTRANS_LOGOS.cimb,
    h: "h-2.5",
  },
  {
    id: "seabank_va",
    name: "SeaBank Direct VA",
    logo: MIDTRANS_LOGOS.seabank,
    h: "h-3",
  },
  {
    id: "bsi_va",
    name: "BSI (Bank Syariah Indonesia)",
    logo: MIDTRANS_LOGOS.bsi,
    h: "h-3",
  },
];

export function getPaymentMethodFee(
  basePrice: number,
  method: PaymentMethodType,
): number {
  if (method === "qris") {
    return Math.ceil(basePrice * 0.007);
  }
  if (isEwalletMethod(method)) {
    return Math.ceil(basePrice * 0.015);
  }
  if (method === "whatsapp") {
    return 0;
  }
  return 4000; // Virtual Account Bank flat Rp 4.000
}

export const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const INPUT_CLASS =
  "w-full min-w-0 py-2.5 sm:py-3 pr-3.5 pl-11 rounded-xl border border-stone-200 bg-white focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition text-sm sm:text-base";

export const PAYMENT_SUMMARY_LABEL_KEYS: Record<PaymentMethodType, string> = {
  qris: "order.orderSummaryQris",
  gopay: "order.orderSummaryGopay",
  shopeepay: "order.orderSummaryShopeepay",
  dana: "order.orderSummaryDana",
  bca_va: "order.orderSummaryBcaVa",
  echannel: "order.orderSummaryMandiriVa",
  bni_va: "order.orderSummaryBniVa",
  bri_va: "order.orderSummaryBriVa",
  cimb_va: "order.orderSummaryCimbVa",
  seabank_va: "order.orderSummarySeabankVa",
  bsi_va: "order.orderSummaryBsiVa",
  whatsapp: "order.orderSummaryWa",
};

export const PAYMENT_BUTTON_LABEL_KEYS: Record<MidtransMethod, string> = {
  qris: "order.btnPayQris",
  gopay: "order.btnPayGopay",
  shopeepay: "order.btnPayShopeepay",
  dana: "order.btnPayDana",
  bca_va: "order.btnPayBca",
  echannel: "order.btnPayMandiri",
  bni_va: "order.btnPayBni",
  bri_va: "order.btnPayBri",
  cimb_va: "order.btnPayCimb",
  seabank_va: "order.btnPaySeabank",
  bsi_va: "order.btnPayBsi",
};
