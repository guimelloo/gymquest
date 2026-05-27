"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import translations, { type Lang, type TranslationKey } from "./translations";

interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** Raw array values (e.g. day-of-week lists) */
  ta: (key: TranslationKey) => string[];
}

const LanguageContext = createContext<LanguageCtx | null>(null);

const STORAGE_KEY = "gymquest-lang";
const VALID_LANGS: Lang[] = ["pt", "en", "nl"];

function isLang(v: unknown): v is Lang {
  return typeof v === "string" && VALID_LANGS.includes(v as Lang);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
    // Persist to DB for authenticated users (fire-and-forget)
    fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: l }),
    }).catch(() => {/* unauthenticated (register page) – ignore */});
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const dict = translations[lang] as Record<string, unknown>;
      const raw = dict[key];
      const value = (typeof raw === "string" ? raw : String(key));

      if (!vars) return value;
      return Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
        value
      );
    },
    [lang]
  );

  const ta = useCallback(
    (key: TranslationKey): string[] => {
      const dict = translations[lang] as Record<string, unknown>;
      const raw = dict[key];
      return Array.isArray(raw) ? (raw as string[]) : [];
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, ta }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
