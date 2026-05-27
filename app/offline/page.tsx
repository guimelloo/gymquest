"use client";

import { WifiOff } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { useLanguage } from "@/lib/i18n/context";

export default function OfflinePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <WifiOff className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">{t("common.error")}</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {t("common.loading")}
      </p>
      <ButtonLink href="/dashboard" variant="outline">
        {t("common.back")}
      </ButtonLink>
    </div>
  );
}
