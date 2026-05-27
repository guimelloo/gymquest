"use client";

/**
 * Invisible component that syncs the user's saved language from the database
 * to the LanguageContext (and localStorage) on first mount, when authenticated.
 */
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/context";
import { type Lang } from "@/lib/i18n/translations";

const VALID: Lang[] = ["pt", "en", "nl"];

export function LangSyncer() {
  const { status } = useSession();
  const { setLang } = useLanguage();

  useEffect(() => {
    if (status !== "authenticated") return;

    // Only sync once per session (localStorage already has it after first sync)
    const alreadySynced = sessionStorage.getItem("lang-synced");
    if (alreadySynced) return;

    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        const lang = data?.language as Lang;
        if (VALID.includes(lang)) {
          setLang(lang);
        }
        sessionStorage.setItem("lang-synced", "1");
      })
      .catch(() => { /* silently ignore */ });
  }, [status, setLang]);

  return null;
}
