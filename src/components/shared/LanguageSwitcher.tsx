// ============================================================
// src/components/shared/LanguageSwitcher.tsx
// ------------------------------------------------------------
// Tombol switcher alih bahasa ID / EN dengan desain rounded-xl yang modern dan elegan.
// ============================================================

import { Globe } from "lucide-react";
import { useTranslation, type Language } from "../../i18n";

interface LanguageSwitcherProps {
  /** Gaya tema switcher: 'header' (terracotta navbar), 'light' (background putih/krem), atau 'minimal' */
  variant?: "header" | "light" | "minimal";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "header",
  className = "",
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useTranslation();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
  };

  if (variant === "header") {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-black/20 border border-white/15 backdrop-blur-sm shadow-inner transition ${className}`}
        role="group"
        aria-label="Pilih Bahasa / Select Language"
      >
        <button
          type="button"
          onClick={() => handleSelect("id")}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
            language === "id"
              ? "bg-[#E59A59] text-white shadow-sm"
              : "text-[#FFD5AF]/70 hover:text-white hover:bg-white/10"
          }`}
          title="Bahasa Indonesia"
        >
          ID
        </button>
        <button
          type="button"
          onClick={() => handleSelect("en")}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
            language === "en"
              ? "bg-[#E59A59] text-white shadow-sm"
              : "text-[#FFD5AF]/70 hover:text-white hover:bg-white/10"
          }`}
          title="English"
        >
          EN
        </button>
      </div>
    );
  }

  if (variant === "light") {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-[#FAF6EE] border border-[#EBDFCE] shadow-sm transition ${className}`}
        role="group"
        aria-label="Pilih Bahasa / Select Language"
      >
        <button
          type="button"
          onClick={() => handleSelect("id")}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
            language === "id"
              ? "bg-[#712E1E] text-white shadow-sm"
              : "text-stone-500 hover:text-stone-800 hover:bg-white"
          }`}
          title="Bahasa Indonesia"
        >
          ID
        </button>
        <button
          type="button"
          onClick={() => handleSelect("en")}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
            language === "en"
              ? "bg-[#712E1E] text-white shadow-sm"
              : "text-stone-500 hover:text-stone-800 hover:bg-white"
          }`}
          title="English"
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => handleSelect(language === "id" ? "en" : "id")}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-700 hover:bg-stone-50 shadow-sm transition active:scale-95 ${className}`}
      title={language === "id" ? "Ganti ke English" : "Switch to Bahasa Indonesia"}
    >
      <Globe size={14} className="text-[#E59A59]" />
      <span>{language === "id" ? "ID" : "EN"}</span>
    </button>
  );
}
