"use client";

import { useLanguage } from "@/lib/i18n/context";
import { ButtonLink } from "@/components/ui/button-link";
import { Sword, BarChart2, UtensilsCrossed, Dumbbell, Trophy } from "lucide-react";

export function LandingHero() {
  const { t, ta } = useLanguage();

  const FEATURES = [
    { Icon: BarChart2, key: "progress.title" },
    { Icon: UtensilsCrossed, key: "nav.food" },
    { Icon: Dumbbell, key: "nav.workout" },
    { Icon: Trophy, key: "goals.title" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Sword className="w-8 h-8 text-primary" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-foreground">GymQuest</h1>
            <p className="text-muted-foreground text-sm">{t("landing.tagline")}</p>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
          {t("landing.hero_title")}{" "}
          <span className="text-primary">{t("landing.hero_highlight")}</span>
        </h2>

        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          {t("landing.description")}
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 text-sm">
          {FEATURES.map(({ Icon, key }) => (
            <div key={key} className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="flex justify-center mb-2">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-muted-foreground text-xs">{t(key as any)}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <ButtonLink href="/registro" size="lg" className="font-semibold justify-center">
            {t("landing.cta_primary")}
          </ButtonLink>
          <ButtonLink href="/login" variant="outline" size="lg" className="justify-center">
            {t("landing.cta_secondary")}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
