// ============================================================
// src/components/order/OrderSteps.tsx
// ------------------------------------------------------------
// Indikator progres 3 langkah di /order: 01 Template (terkunci dari
// katalog = selalu selesai), 02 Data, 03 Bayar. Murni informasi ΓÇö
// navigasi kembali ditangani tombol/footer di pages/OrderPage.
// Dipakai di  : pages/OrderPage
// Keterikatan : lucide-react, i18n
// ============================================================

import { Check } from "lucide-react";
import { useTranslation } from "../../i18n";

interface OrderStepsProps {
  current: 1 | 2 | 3;
}

export function OrderSteps({ current }: OrderStepsProps) {
  const { t } = useTranslation();

  const steps = [
    t("order.wizStep1"),
    t("order.wizStep2"),
    t("order.wizStep3"),
  ];

  return (
    <ol
      className="flex items-center gap-1.5 sm:gap-3 mb-5 sm:mb-8"
      aria-label="Progres pemesanan"
    >
      {steps.map((label, i) => {
        const stepNo = (i + 1) as 1 | 2 | 3;
        const isDone = stepNo < current;
        const isCurrent = stepNo === current;

        return (
          <li
            key={stepNo}
            className={`flex items-center gap-1.5 sm:gap-2 min-w-0 ${
              i < steps.length - 1 ? "flex-1" : ""
            }`}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span
              className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full grid place-items-center text-[10px] sm:text-xs font-black transition ${
                isDone
                  ? "bg-[#712E1E] text-white"
                  : isCurrent
                    ? "bg-white text-[#712E1E] border-2 border-[#712E1E]"
                    : "bg-white text-stone-300 border-2 border-stone-200"
              }`}
            >
              {isDone ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                `0${stepNo}`
              )}
            </span>
            <span
              className={`text-[10px] sm:text-xs font-bold leading-tight truncate ${
                isDone || isCurrent ? "text-[#712E1E]" : "text-stone-300"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 ? (
              <span
                className={`flex-1 h-0.5 rounded-full mx-0.5 ${
                  stepNo < current ? "bg-[#712E1E]" : "bg-stone-200"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

