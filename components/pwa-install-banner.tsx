"use client";

import { useEffect, useState } from "react";
import { X, Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

type Platform = "android" | "ios" | "desktop" | null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "gymquest-pwa-banner-dismissed";

export function PWAInstallBanner() {
  const { t } = useLanguage();
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    const isAndroid = /Android/.test(ua);

    if (isIOS) {
      setPlatform("ios");
      setVisible(true);
    } else if (isAndroid) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    setShowIOSSteps(false);
  };

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") dismiss();
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="max-w-lg mx-auto bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {!showIOSSteps ? (
          <div className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Download className="w-6 h-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{t("pwa.install_title")}</p>
              <p className="text-xs text-muted-foreground">
                {platform === "ios" ? t("pwa.install_hint_ios") : t("pwa.install_hint")}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {platform === "ios" ? (
                <Button size="sm" className="text-xs h-8 gap-1" onClick={() => setShowIOSSteps(true)}>
                  <Share className="w-3.5 h-3.5" /> {t("pwa.how_to_install")}
                </Button>
              ) : (
                <Button size="sm" className="text-xs h-8 gap-1" onClick={installAndroid} disabled={!deferredPrompt}>
                  <Download className="w-3.5 h-3.5" /> {t("pwa.install_btn")}
                </Button>
              )}
              <button onClick={dismiss} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">{t("pwa.ios_guide_title")}</p>
              <button onClick={dismiss} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ol className="space-y-2.5 text-sm">
              <Step n={1}>
                {t("pwa.ios_step1_pre")}{" "}
                <span className="inline-flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded text-xs font-medium">
                  <Share className="w-3 h-3" /> {t("pwa.ios_share_btn")}
                </span>{" "}
                {t("pwa.ios_step1_post")}
              </Step>
              <Step n={2}>
                {t("pwa.ios_step2_pre")}{" "}
                <span className="inline-flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded text-xs font-medium">
                  <Plus className="w-3 h-3" /> {t("pwa.ios_add_btn")}
                </span>
              </Step>
              <Step n={3}>
                {t("pwa.ios_step3")}
              </Step>
            </ol>
            <p className="text-xs text-muted-foreground mt-3">{t("pwa.ios_note")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </span>
      <span className="text-muted-foreground leading-snug">{children}</span>
    </li>
  );
}
