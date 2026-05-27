"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Dados Físicos", emoji: "📏", subtitle: "Para cálculos precisos de IMC e metabolismo" },
  { id: 2, title: "Medidas Iniciais", emoji: "⚖️", subtitle: "Seu ponto de partida na jornada" },
  { id: 3, title: "Meta Principal", emoji: "🎯", subtitle: "O que você quer conquistar?" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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
      toast.error("Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleMedidasSave = async () => {
    if (!medidas.weight) { toast.error("Informe seu peso"); return; }
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
      // Pré-preencher meta com valor inicial
      if (medidas.bodyFat) {
        setMeta((m) => ({ ...m, startValue: medidas.bodyFat, currentValue: medidas.bodyFat }));
      }
      setStep(3);
    } catch {
      toast.error("Erro ao salvar medidas");
    } finally {
      setLoading(false);
    }
  };

  const handleMetaSave = async () => {
    if (!meta.title || !meta.targetValue) {
      // Pular meta e ir pro dashboard
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
      toast.success("Missão criada! Vamos lá! 🚀");
      router.push("/dashboard");
    } catch {
      toast.error("Erro ao criar meta");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = STEPS[step - 1];
  const progress = ((step - 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{currentStep.emoji}</div>
          <h1 className="text-2xl font-bold">{currentStep.title}</h1>
          <p className="text-muted-foreground mt-1">{currentStep.subtitle}</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Passo {step} de {STEPS.length}</span>
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
                  <Label>Altura (cm)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 183"
                    value={profile.height}
                    onChange={(e) => setProfile((p) => ({ ...p, height: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de nascimento</Label>
                  <Input
                    type="date"
                    value={profile.birthDate}
                    onChange={(e) => setProfile((p) => ({ ...p, birthDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: "male", l: "🙋‍♂️ Masculino" }, { v: "female", l: "🙋‍♀️ Feminino" }].map((g) => (
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
                        {g.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Meta diária de água (ml)</Label>
                  <Input
                    type="number"
                    placeholder="2500"
                    value={profile.waterGoal}
                    onChange={(e) => setProfile((p) => ({ ...p, waterGoal: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Recomendado: 2000-3000 ml/dia</p>
                </div>
                <Button onClick={handleProfileSave} disabled={loading} className="w-full">
                  {loading ? "Salvando..." : "Continuar →"}
                </Button>
                <button
                  onClick={() => setStep(2)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  Pular por agora
                </button>
              </div>
            )}

            {/* Passo 2: Medidas */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Peso atual (kg) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 82.5"
                    value={medidas.weight}
                    onChange={(e) => setMedidas((m) => ({ ...m, weight: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>% de gordura corporal (opcional)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 13"
                    value={medidas.bodyFat}
                    onChange={(e) => setMedidas((m) => ({ ...m, bodyFat: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Se não souber, pode deixar em branco
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Cintura (cm, opcional)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="Ex: 85"
                    value={medidas.waist}
                    onChange={(e) => setMedidas((m) => ({ ...m, waist: e.target.value }))}
                  />
                </div>
                <Button onClick={handleMedidasSave} disabled={loading} className="w-full">
                  {loading ? "Salvando..." : "Continuar →"}
                </Button>
              </div>
            )}

            {/* Passo 3: Meta */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de meta</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: "bodyFat", l: "🔥 Reduzir gordura", u: "%" },
                      { v: "weight", l: "⚖️ Perder peso", u: "kg" },
                      { v: "muscle", l: "💪 Ganhar massa", u: "%" },
                      { v: "streak", l: "🔥 Manter sequência", u: "dias" },
                    ].map((t) => (
                      <button
                        key={t.v}
                        type="button"
                        onClick={() => setMeta((m) => ({ ...m, type: t.v as typeof meta.type, unit: t.u }))}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                          meta.type === t.v
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {t.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nome da missão</Label>
                  <Input
                    placeholder={`Ex: Chegar a 10% de gordura`}
                    value={meta.title}
                    onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Valor alvo ({meta.unit})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 10"
                      value={meta.targetValue}
                      onChange={(e) => setMeta((m) => ({ ...m, targetValue: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo (opcional)</Label>
                    <Input
                      type="date"
                      value={meta.deadline}
                      onChange={(e) => setMeta((m) => ({ ...m, deadline: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={handleMetaSave} disabled={loading} className="w-full">
                  {loading ? "Salvando..." : "Começar a Jornada! 🚀"}
                </Button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  Pular e configurar depois
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
