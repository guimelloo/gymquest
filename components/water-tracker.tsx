"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";

interface WaterTrackerProps {
  waterMl: number;
  waterGoal: number;
  onUpdate: (ml: number) => void;
}

const PORCOES = [200, 300, 500];

export function WaterTracker({ waterMl: initialMl, waterGoal, onUpdate }: WaterTrackerProps) {
  const [waterMl, setWaterMl] = useState(initialMl);

  // Sync when prop updates (e.g. dashboard reloads and gets persisted value)
  useEffect(() => {
    setWaterMl(initialMl);
  }, [initialMl]);
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

  const pct = Math.min(100, Math.round((waterMl / waterGoal) * 100));
  const copos = Math.floor((waterMl / waterGoal) * 8);

  const addWater = async (ml: number) => {
    const novoTotal = Math.min(waterMl + ml, waterGoal * 2);
    setSaving(true);
    try {
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const res = await fetch("/api/diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waterMl: novoTotal, date: today }),
      });
      const data = await res.json();
      setWaterMl(novoTotal);
      onUpdate(novoTotal);

      if (novoTotal >= waterGoal && waterMl < waterGoal) {
        toast.success(t("water.goal_reached"));
      }
      if (data.xp?.levelUp) {
        toast.success(t("water.level_up", { n: data.xp.levelAtual }));
      }
    } catch {
      toast.error(t("water.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            {t("water.title")}
          </span>
          <span className={`text-xs font-medium ${pct >= 100 ? "text-primary" : "text-muted-foreground"}`}>
            {pct}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Copos visuais */}
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <Droplets
              key={i}
              className={`w-5 h-5 transition-all ${
                i < copos ? "text-blue-400 fill-blue-400/30" : "text-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        {/* Barra */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{waterMl} ml</span>
            <span>{t("water.goal_label")} {waterGoal} ml</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pct >= 100 ? "bg-primary" : "bg-blue-500"
              }`}
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
              className="flex-1 text-xs gap-1"
            >
              <Plus className="w-3 h-3" />
              {ml}ml
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
