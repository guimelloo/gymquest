"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/i18n/context";
import {
  Sparkles, RotateCcw, Info, Dumbbell, ChevronRight, AlertTriangle,
} from "lucide-react";

// ── Muscle group definitions ──────────────────────────────────────────────────
type MuscleKey = "chest" | "back" | "shoulders" | "biceps" | "triceps" | "legs" | "core" | "glutes";

interface MuscleData {
  key: MuscleKey;
  emoji: string;
  exercises: {
    pt: string[];
    en: string[];
    nl: string[];
  };
  // Antagonist pairs for balance tips
  antagonist?: MuscleKey;
}

const MUSCLES: MuscleData[] = [
  {
    key: "chest",
    emoji: "🫁",
    antagonist: "back",
    exercises: {
      pt: ["Supino Reto", "Supino Inclinado", "Crucifixo", "Cross Over", "Flexão de Braço"],
      en: ["Bench Press", "Incline Bench Press", "Dumbbell Flyes", "Cable Cross Over", "Push-Up"],
      nl: ["Bench Press", "Schuine Bankdrukken", "Vliegoefening", "Kabelkruising", "Opdrukken"],
    },
  },
  {
    key: "back",
    emoji: "🔙",
    antagonist: "chest",
    exercises: {
      pt: ["Barra Fixa", "Remada Curvada", "Puxada Alta", "Serrote com Halter", "Pull-over"],
      en: ["Pull-Up", "Bent-Over Row", "Lat Pull-Down", "Dumbbell Row", "Pull-Over"],
      nl: ["Optrekken", "Roeibeweging", "Lat Pull-Down", "Dumbbell Roeien", "Pull-Over"],
    },
  },
  {
    key: "shoulders",
    emoji: "🏋️",
    exercises: {
      pt: ["Desenvolvimento com Halteres", "Elevação Lateral", "Face Pull", "Elevação Frontal", "Arnold Press"],
      en: ["Dumbbell Press", "Lateral Raise", "Face Pull", "Front Raise", "Arnold Press"],
      nl: ["Dumbbell Press", "Zijwaartse hefbeweging", "Face Pull", "Frontale hefbeweging", "Arnold Press"],
    },
  },
  {
    key: "biceps",
    emoji: "💪",
    antagonist: "triceps",
    exercises: {
      pt: ["Rosca Direta", "Rosca Alternada", "Rosca Martelo", "Rosca Concentrada", "Rosca 21s"],
      en: ["Barbell Curl", "Alternating Curl", "Hammer Curl", "Concentration Curl", "21s Curl"],
      nl: ["Barbell Curl", "Afwisselende Curl", "Hamer Curl", "Concentratie Curl", "21s Curl"],
    },
  },
  {
    key: "triceps",
    emoji: "🦾",
    antagonist: "biceps",
    exercises: {
      pt: ["Tríceps Corda", "Tríceps Francês", "Mergulho", "Tríceps Testa", "Extensão no Cabo"],
      en: ["Rope Push-Down", "Skull Crusher", "Dips", "Overhead Extension", "Cable Extension"],
      nl: ["Touw Drukken", "Schedel Breker", "Dips", "Overhead Extensie", "Kabel Extensie"],
    },
  },
  {
    key: "legs",
    emoji: "🦵",
    exercises: {
      pt: ["Agachamento Livre", "Leg Press", "Extensora", "Mesa Flexora", "Stiff", "Avanço"],
      en: ["Squat", "Leg Press", "Leg Extension", "Leg Curl", "Romanian Deadlift", "Lunge"],
      nl: ["Kniebuiging", "Leg Press", "Beenstrекking", "Beenkrul", "Roemeense Deadlift", "Uitval"],
    },
  },
  {
    key: "core",
    emoji: "🧱",
    exercises: {
      pt: ["Prancha", "Abdominal Supra", "Roda Abdominal", "Russian Twist", "Elevação de Pernas", "Crunch no Cabo"],
      en: ["Plank", "Crunch", "Ab Wheel", "Russian Twist", "Leg Raise", "Cable Crunch"],
      nl: ["Plank", "Sit-up", "Ab Wiel", "Russische Draai", "Beenheffing", "Kabel Crunch"],
    },
  },
  {
    key: "glutes",
    emoji: "🍑",
    exercises: {
      pt: ["Hip Thrust", "Elevação Pélvica", "Agachamento Búlgaro", "Abdutora", "Stiff Unilateral", "Kick-back"],
      en: ["Hip Thrust", "Glute Bridge", "Bulgarian Split Squat", "Abductor", "Single-Leg RDL", "Kick-Back"],
      nl: ["Hip Thrust", "Bil Brug", "Bulgaarse Split Squat", "Abductor", "Eenbenige RDL", "Kick-Back"],
    },
  },
];

// ── Balance tip logic ─────────────────────────────────────────────────────────
function getBalanceTips(ratings: Record<MuscleKey, number>, lang: string): string[] {
  const tips: string[] = [];

  const pairs: [MuscleKey, MuscleKey, Record<string, string>][] = [
    ["chest", "back",     { pt: "Chest/Costas", en: "Chest/Back", nl: "Borst/Rug" }],
    ["biceps", "triceps", { pt: "Bíceps/Tríceps", en: "Biceps/Triceps", nl: "Biceps/Triceps" }],
  ];

  const tipTemplates: Record<string, Record<string, string>> = {
    pt: {
      dominant: "Você treina mais {a} que {b}. Aumente o volume de {b} para evitar desequilíbrios posturais.",
      balance:  "{a} e {b} estão bem equilibrados. Continue assim!",
    },
    en: {
      dominant: "You train {a} more than {b}. Increase {b} volume to avoid postural imbalances.",
      balance:  "{a} and {b} are well balanced. Keep it up!",
    },
    nl: {
      dominant: "U traint {a} meer dan {b}. Verhoog het volume van {b} om houdingsonevenwichtigheden te vermijden.",
      balance:  "{a} en {b} zijn goed in balans. Ga zo door!",
    },
  };

  const l = lang in tipTemplates ? lang : "pt";

  for (const [a, b, names] of pairs) {
    const diff = ratings[a] - ratings[b];
    const nameA = names[l] ?? names["pt"];
    const [namePartA, namePartB] = nameA.split("/");
    if (Math.abs(diff) >= 2) {
      const dom = diff > 0 ? namePartA : namePartB;
      const weak = diff > 0 ? namePartB : namePartA;
      tips.push(tipTemplates[l].dominant.replace("{a}", dom).replace("{b}", weak));
    } else {
      tips.push(tipTemplates[l].balance.replace("{a}", namePartA).replace("{b}", namePartB));
    }
  }

  return tips;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AnalisePage() {
  const { t, lang } = useLanguage();
  const [ratings, setRatings] = useState<Record<MuscleKey, number>>({
    chest: 3, back: 3, shoulders: 3, biceps: 3,
    triceps: 3, legs: 3, core: 3, glutes: 3,
  });
  const [result, setResult] = useState(false);

  const setRating = (key: MuscleKey, val: number) => {
    setRatings((r) => ({ ...r, [key]: val }));
    setResult(false);
  };

  const generate = () => setResult(true);
  const reset = () => { setRatings({ chest: 3, back: 3, shoulders: 3, biceps: 3, triceps: 3, legs: 3, core: 3, glutes: 3 }); setResult(false); };

  // Sort by priority (lowest rating first)
  const sorted = [...MUSCLES].sort((a, b) => ratings[a.key] - ratings[b.key]);
  const priority = sorted.filter((m) => ratings[m.key] <= 2);
  const medium   = sorted.filter((m) => ratings[m.key] === 3);
  const strong   = sorted.filter((m) => ratings[m.key] >= 4);
  const balanceTips = getBalanceTips(ratings, lang);

  const rateLabel = (v: number) => {
    const keys: Record<number, string> = { 1: "analyzer.rate_1", 2: "analyzer.rate_2", 3: "analyzer.rate_3", 4: "analyzer.rate_4", 5: "analyzer.rate_5" };
    return t(keys[v] as Parameters<typeof t>[0]);
  };

  const rateColor = (v: number) => {
    if (v <= 1) return "text-red-400 bg-red-400/10 border-red-400/30";
    if (v === 2) return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    if (v === 3) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    if (v === 4) return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    return "text-green-400 bg-green-400/10 border-green-400/30";
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t("analyzer.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("analyzer.subtitle")}</p>
        </div>
      </div>

      {/* Info */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-3 pb-3">
          <div className="flex gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{t("analyzer.intro")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Rating cards */}
      <div className="space-y-3">
        {MUSCLES.map((m) => {
          const val = ratings[m.key];
          const muscleLabel = t(`analyzer.muscle.${m.key}` as Parameters<typeof t>[0]);
          return (
            <Card key={m.key} className="border-border/50">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm flex items-center gap-2">
                    <span className="text-base">{m.emoji}</span>
                    {muscleLabel}
                  </span>
                  <Badge variant="outline" className={`text-xs ${rateColor(val)}`}>
                    {val} — {rateLabel(val)}
                  </Badge>
                </div>
                {/* 5-star rating row */}
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRating(m.key, n)}
                      className={`flex-1 h-7 rounded-md border text-xs font-bold transition-all ${
                        n <= val
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                {/* Progress bar */}
                <Progress value={val * 20} className="h-1 mt-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!result ? (
        <Button onClick={generate} className="w-full gap-2 h-12 text-base">
          <Sparkles className="w-5 h-5" /> {t("analyzer.generate_btn")}
        </Button>
      ) : (
        <>
          {/* ── Results ── */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> {t("analyzer.result_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Priority muscles */}
              {(priority.length > 0 || medium.length > 0) && (
                <div>
                  <h3 className="font-bold text-sm mb-1">{t("analyzer.priority_title")}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{t("analyzer.priority_sub")}</p>
                  <div className="space-y-4">
                    {[...priority, ...medium].slice(0, 4).map((m) => {
                      const muscleLabel = t(`analyzer.muscle.${m.key}` as Parameters<typeof t>[0]);
                      const exList = (m.exercises as Record<string, string[]>)[lang] ?? m.exercises.pt;
                      return (
                        <div key={m.key} className="border border-border/50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{m.emoji}</span>
                            <span className="font-semibold text-sm">{muscleLabel}</span>
                            <Badge variant="outline" className={`text-xs ml-auto ${rateColor(ratings[m.key])}`}>
                              {ratings[m.key]}/5
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 font-medium">{t("analyzer.exercises_for")}</p>
                          <div className="grid grid-cols-1 gap-1">
                            {exList.slice(0, 4).map((ex) => (
                              <div key={ex} className="flex items-center gap-2 text-xs">
                                <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                                <span>{ex}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Strong muscles */}
              {strong.length > 0 && (
                <div>
                  <h3 className="font-bold text-sm mb-1">{t("analyzer.strong_title")}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{t("analyzer.strong_sub")}</p>
                  <div className="flex flex-wrap gap-2">
                    {strong.map((m) => (
                      <Badge key={m.key} variant="outline" className="text-green-400 border-green-400/30 gap-1.5 text-xs py-1">
                        <span>{m.emoji}</span>
                        {t(`analyzer.muscle.${m.key}` as Parameters<typeof t>[0])}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Balance tips */}
              <div>
                <h3 className="font-bold text-sm mb-2">{t("analyzer.balance_tip")}</h3>
                <div className="space-y-2">
                  {balanceTips.map((tip, i) => (
                    <div key={i} className="flex gap-2 bg-secondary/40 rounded-lg p-2.5">
                      <Dumbbell className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{t("analyzer.disclaimer")}</p>
          </div>

          <Button variant="outline" onClick={reset} className="w-full gap-2">
            <RotateCcw className="w-4 h-4" /> {t("analyzer.new_analysis")}
          </Button>
        </>
      )}
    </div>
  );
}
