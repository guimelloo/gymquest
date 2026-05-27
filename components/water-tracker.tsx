"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WaterTrackerProps {
  waterMl: number;
  waterGoal: number;
  onUpdate: (ml: number) => void;
}

const PORCOES = [200, 300, 500];

export function WaterTracker({ waterMl: initialMl, waterGoal, onUpdate }: WaterTrackerProps) {
  const [waterMl, setWaterMl] = useState(initialMl);
  const [saving, setSaving] = useState(false);

  const pct = Math.min(100, Math.round((waterMl / waterGoal) * 100));

  const addWater = async (ml: number) => {
    const novoTotal = Math.min(waterMl + ml, waterGoal * 2);
    setSaving(true);
    try {
      const res = await fetch("/api/diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waterMl: novoTotal }),
      });
      const data = await res.json();
      setWaterMl(novoTotal);
      onUpdate(novoTotal);

      if (novoTotal >= waterGoal && waterMl < waterGoal) {
        toast.success("🎉 Meta de água atingida! +15 XP");
      }
      if (data.xp?.levelUp) {
        toast.success(`🆙 Level Up! Você é nível ${data.xp.levelAtual}!`);
      }
    } catch {
      toast.error("Erro ao registrar água");
    } finally {
      setSaving(false);
    }
  };

  // Ícones de copo baseados no progresso
  const copos = Math.floor((waterMl / waterGoal) * 8);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          💧 Água Hoje
          <span className={`text-sm font-normal ${pct >= 100 ? "text-primary" : "text-muted-foreground"}`}>
            {pct}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual dos copos */}
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className={`text-xl transition-all ${i < copos ? "opacity-100" : "opacity-20"}`}>
              🥤
            </span>
          ))}
        </div>

        {/* Barra de progresso */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{waterMl} ml</span>
            <span>Meta: {waterGoal} ml</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-primary" : "bg-blue-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          {PORCOES.map((ml) => (
            <Button
              key={ml}
              variant="outline"
              size="sm"
              onClick={() => addWater(ml)}
              disabled={saving}
              className="flex-1 text-xs"
            >
              +{ml}ml
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
