// ============================================================
// src/i18n/LanguageContext.tsx
// ------------------------------------------------------------
// Language context, provider, and useTranslation hook for application-wide multi-language (ID/EN) support.
// ============================================================

/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { id, type TranslationDictionary } from "./locales/id";
import { en } from "./locales/en";

export type Language = "id" | "en";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  dictionary: TranslationDictionary;
}

const STORAGE_KEY = "app_language";

const dictionaries: Record<Language, TranslationDictionary> = {
  id,
  en,
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match;
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "id" || stored === "en") return stored;
    } catch {
      /* ignore */
    }
    return "id"; // Default Bahasa Indonesia
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "id" ? "en" : "id");
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const dictionary = useMemo(() => dictionaries[language] || dictionaries.id, [language]);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const currentDict = dictionaries[language] as unknown as Record<string, unknown>;
      let value = getNestedValue(currentDict, path);

      // Fallback to Indonesian if missing in English
      if (value === undefined) {
        const fallbackDict = dictionaries.id as unknown as Record<string, unknown>;
        value = getNestedValue(fallbackDict, path);
      }

      if (value === undefined) {
        return path;
      }

      return interpolate(value, params);
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      dictionary,
    }),
    [language, setLanguage, toggleLanguage, t, dictionary]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}

export const useLanguage = useTranslation;
