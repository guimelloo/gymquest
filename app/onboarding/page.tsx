"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Ruler, Scale, Target, Flame, Dumbbell, ChevronRight, Rocket } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const STEPS = [
    { id: 1, titleKey: "onboarding.step1_title" as const, subtitleKey: "onboarding.step1_sub" as const, Icon: Ruler },
    { id: 2, titleKey: "onboarding.step2_title" as const, subtitleKey: "onboarding.step2_sub" as const, Icon: Scale },
    { id: 3, titleKey: "onboarding.step3_title" as const, subtitleKey: "onboarding.step3_sub" as const, Icon: Target },
  ];

  const TIPOS_META = [
    { v: "bodyFat", lKey: "goals.type_fat"     as const, u: "%",      Icon: Flame },
    { v: "weight",  lKey: "goals.type_weight"  as const, u: "kg",     Icon: Scale },
    { v: "muscle",  lKey: "goals.type_muscle"  as const, u: "%",      Icon: Dumbbell },
    { v: "streak",  lKey: "goals.type_streak"  as const, u: "dias",   Icon: Flame },
  ];

  const [profile, setProfile] = useState({
    height: "",
    birthDate: "",
    gender: "male",
    waterGoal: "2500",
  });

  const [medidas, setMedidas] = useState({
    weight: "",
    bodyFat: "",
    waist: "",
  });

  const [meta, setMeta] = useState({
    type: "bodyFat" as "weight" | "bodyFat" | "muscle" | "streak" | "custom",
    title: "",
    targetValue: "",
    startValue: "",
    unit: "%",
    deadline: "",
    description: "",
  });

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: parseFloat(profile.height),
          birthDate: profile.birthDate,
          gender: profile.gender,
          waterGoal: parseInt(profile.waterGoal),
        }),
      });
      setStep(2);
    } catch {
      toast.error(t("onboarding.error_save"));
    } finally {
      setLoading(false);
    }
  };

  const handleMedidasSave = async () => {
    if (!medidas.weight) { toast.error(t("onboarding.error_weight")); return; }
    setLoading(true);
    try {
      await fetch("/api/medidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(medidas.weight),
          bodyFat: medidas.bodyFat ? parseFloat(medidas.bodyFat) : undefined,
          waist: medidas.waist ? parseFloat(medidas.waist) : undefined,
        }),
      });
      if (medidas.bodyFat) {
        setMeta((m) => ({ ...m, startValue: medidas.bodyFat }));
      }
      setStep(3);
    } catch {
      toast.error(t("onboarding.error_save"));
    } finally {
      setLoading(false);
    }
  };

  const handleMetaSave = async () => {
    if (!meta.title || !meta.targetValue) {
      router.push("/dashboard");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/metas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: meta.type,
          title: meta.title,
          description: meta.description,
          targetValue: parseFloat(meta.targetValue),
          startValue: medidas.bodyFat ? parseFloat(medidas.bodyFat) : parseFloat(medidas.weight || "0"),
          currentValue: medidas.bodyFat ? parseFloat(medidas.bodyFat) : parseFloat(medidas.weight || "0"),
          unit: meta.unit,
          deadline: meta.deadline || undefined,
          xpReward: 300,
        }),
      });
      toast.success(t("onboarding.mission_created"));
      router.push("/dashboard");
    } catch {
      toast.error(t("onboarding.error_save"));
    } finally {
      setLoading(false);
    }
  };

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.Icon;
  const progress = ((step - 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
            <StepIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t(currentStep.titleKey)}</h1>
          <p className="text-muted-foreground mt-1">{t(currentStep.subtitleKey)}</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{t("onboarding.step_of", { n: step, total: STEPS.length })}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardContent className="pt-6">
            {/* Passo 1: Dados físicos */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("onboarding.height")}</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 183"
                    value={profile.height}
                    onChange={(e) => setProfile((p) => ({ ...p, height: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("onboarding.birth_date")}</Label>
                  <Input
                    type="date"
                    value={profile.birthDate}
                    onChange={(e) => setProfile((p) => ({ ...p, birthDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("onboarding.sex")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: "male", lKey: "common.male" as const }, { v: "female", lKey: "common.female" as const }].map((g) => (
                      <button
                        key={g.v}
                        type="button"
                        onClick={() => setProfile((p) => ({ ...p, gender: g.v }))}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          profile.gender === g.v
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {t(g.lKey)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("onboarding.water_goal")}</Label>
                  <Input
                    type="number"
                    placeholder="2500"
                    value={profile.waterGoal}
                    onChange={(e) => setProfile((p) => ({ ...p, waterGoal: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">{t("onboarding.water_rec")}</p>
                </div>
                <Button onClick={handleProfileSave} disabled={loading} className="w-full gap-1.5">
                  {loading ? t("common.saving") : <><ChevronRight className="w-4 h-4" /> {t("common.continue")}</>}
                </Button>
                <button
                  onClick={() => setStep(2)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("common.skip_now")}
                </button>
              </div>
            )}

            {/* Passo 2: Medidas */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("onboarding.current_weight")}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 82.5"
                    value={medidas.weight}
                    onChange={(e) => setMedidas((m) => ({ ...m, weight: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("onboarding.body_fat")}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 13"
                    value={medidas.bodyFat}
                    onChange={(e) => setMedidas((m) => ({ ...m, bodyFat: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">{t("onboarding.body_fat_hint")}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t("onboarding.waist")}</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="Ex: 85"
                    value={medidas.waist}
                    onChange={(e) => setMedidas((m) => ({ ...m, waist: e.target.value }))}
                  />
                </div>
                <Button onClick={handleMedidasSave} disabled={loading} className="w-full gap-1.5">
                  {loading ? t("common.saving") : <><ChevronRight className="w-4 h-4" /> {t("common.continue")}</>}
                </Button>
              </div>
            )}

            {/* Passo 3: Meta */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("onboarding.goal_type")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIPOS_META.map((tp) => {
                      const TIcon = tp.Icon;
                      return (
                        <button
                          key={tp.v}
                          type="button"
                          onClick={() => setMeta((m) => ({ ...m, type: tp.v as typeof meta.type, unit: tp.u }))}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors text-left flex items-center gap-2 ${
                            meta.type === tp.v
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <TIcon className="w-4 h-4 shrink-0" />
                          {t(tp.lKey)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("onboarding.goal_name")}</Label>
                  <Input
                    placeholder={t("onboarding.goal_name_ph")}
                    value={meta.title}
                    onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t("onboarding.target_value")} ({meta.unit})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 10"
                      value={meta.targetValue}
                      onChange={(e) => setMeta((m) => ({ ...m, targetValue: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.deadline")} ({t("common.optional")})</Label>
                    <Input
                      type="date"
                      value={meta.deadline}
                      onChange={(e) => setMeta((m) => ({ ...m, deadline: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={handleMetaSave} disabled={loading} className="w-full gap-1.5">
                  {loading ? t("common.saving") : <><Rocket className="w-4 h-4" /> {t("onboarding.start_journey")}</>}
                </Button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("onboarding.skip_later")}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
