"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Dumbbell, Plus, CheckCircle2, Clock, CalendarDays,
  ChevronDown, ChevronRight, Zap, ListChecks, History, Settings2,
  BarChart2, Weight, Sparkles, ChevronUp, Star,
} from "lucide-react";
import { MuscleBadge } from "@/components/muscle-badge";
import { ExerciseVideoButton } from "@/components/exercise-video-button";
import { getExerciseMuscles, MUSCLE_GROUPS, MUSCLE_LABELS, type MuscleGroup } from "@/lib/exercises-db";
import { WORKOUT_TEMPLATES, LEVEL_COLORS, type WorkoutTemplate } from "@/lib/workout-templates";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_SEMANA_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

interface ExercicioForm {
  name: string;
  sets: number;
  reps: string;
  weight: number | "";
  restSecs: number | "";
  notes: string;
}

interface DiaTreinoForm {
  dayOfWeek: number;
  name: string;
  muscleGroup: MuscleGroup;
  exercises: ExercicioForm[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  days: Array<{
    id: string;
    dayOfWeek: number;
    name: string;
    muscleGroup?: string;
    exercises: Array<{
      id: string;
      name: string;
      sets: number;
      reps: string;
      weight: number | null;
      restSecs: number | null;
      notes: string | null;
    }>;
  }>;
}

interface WorkoutLog {
  id: string;
  date: string;
  duration: number | null;
  xpEarned: number;
  plan: { name: string } | null;
}

function exerciceDefaultForm(): ExercicioForm {
  return { name: "", sets: 3, reps: "10-12", weight: "", restSecs: 60, notes: "" };
}

export default function TreinoPage() {
  const { t } = useLanguage();
  const [planos, setPlanos] = useState<WorkoutPlan[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  // Criação
  const [novoPlan, setNovoPlan] = useState({ name: "", description: "" });
  const [dias, setDias] = useState<DiaTreinoForm[]>([
    { dayOfWeek: 1, name: "Peito e Tríceps", muscleGroup: "peito", exercises: [exerciceDefaultForm()] },
  ]);
  const [salvandoPlano, setSalvandoPlano] = useState(false);

  // Log de treino
  const [logModal, setLogModal] = useState(false);
  const [logDuration, setLogDuration] = useState("60");
  const [logPlanId, setLogPlanId] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [registrando, setRegistrando] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/treinos").then((r) => r.json()),
      fetch("/api/treinos/log?limit=30").then((r) => r.json()),
    ]).then(([p, l]) => {
      const planosArr = Array.isArray(p) ? p : [];
      setPlanos(planosArr);
      setLogs(Array.isArray(l) ? l : []);
      const ativo = planosArr.find((pl: WorkoutPlan) => pl.isActive);
      if (ativo) {
        setLogPlanId(ativo.id);
        // Expandir dia de hoje por padrão
        const hojeIdx = new Date().getDay();
        const diaHoje = ativo.days.find((d: WorkoutPlan["days"][0]) => d.dayOfWeek === hojeIdx);
        if (diaHoje) setExpandedDays({ [diaHoje.id]: true });
      }
    }).finally(() => setLoading(false));
  }, []);

  // ── Helpers de formulário ──
  const addDia = () => {
    setDias((d) => [
      ...d,
      { dayOfWeek: d.length % 7, name: "", muscleGroup: "geral", exercises: [exerciceDefaultForm()] },
    ]);
  };

  const removeDia = (idx: number) => setDias((d) => d.filter((_, i) => i !== idx));

  const updateDia = (idx: number, field: keyof DiaTreinoForm, value: unknown) => {
    setDias((d) => {
      const n = [...d];
      n[idx] = { ...n[idx], [field]: value };
      return n;
    });
  };

  const addExercicio = (diaIdx: number) => {
    setDias((d) => {
      const n = [...d];
      n[diaIdx] = { ...n[diaIdx], exercises: [...n[diaIdx].exercises, exerciceDefaultForm()] };
      return n;
    });
  };

  const removeExercicio = (diaIdx: number, exIdx: number) => {
    setDias((d) => {
      const n = [...d];
      n[diaIdx] = { ...n[diaIdx], exercises: n[diaIdx].exercises.filter((_, i) => i !== exIdx) };
      return n;
    });
  };

  const updateExercicio = (diaIdx: number, exIdx: number, field: keyof ExercicioForm, value: unknown) => {
    setDias((d) => {
      const n = [...d];
      const exs = [...n[diaIdx].exercises];
      exs[exIdx] = { ...exs[exIdx], [field]: value };
      n[diaIdx] = { ...n[diaIdx], exercises: exs };
      return n;
    });
  };

  // ── Aplicar template predefinido ──
  const aplicarTemplate = (template: WorkoutTemplate) => {
    setNovoPlan({ name: template.name, description: template.description });
    setDias(
      template.days.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        name: d.name,
        muscleGroup: d.muscleGroup as MuscleGroup,
        exercises: d.exercises.map((e) => ({
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight ?? "",
          restSecs: e.restSecs ?? 60,
          notes: e.notes ?? "",
        })),
      }))
    );
  };

  // ── Salvar plano ──
  const salvarPlano = async () => {
    if (!novoPlan.name) { toast.error(t("workout.error_name")); return; }
    const diasValidos = dias.filter((d) => d.exercises.some((e) => e.name.trim()));
    if (diasValidos.length === 0) { toast.error(t("workout.error_exercise")); return; }

    setSalvandoPlano(true);
    try {
      const res = await fetch("/api/treinos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: novoPlan.name,
          description: novoPlan.description,
          days: diasValidos.map((d) => ({
            dayOfWeek: d.dayOfWeek,
            name: d.name || MUSCLE_LABELS[d.muscleGroup],
            muscleGroup: d.muscleGroup,
            exercises: d.exercises
              .filter((e) => e.name.trim())
              .map((e, i) => ({
                name: e.name,
                sets: e.sets,
                reps: e.reps,
                weight: e.weight !== "" ? Number(e.weight) : undefined,
                restSecs: e.restSecs !== "" ? Number(e.restSecs) : undefined,
                notes: e.notes || undefined,
                order: i,
              })),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      toast.success(t("workout.plan_saved"));
      setPlanos((p) => [data, ...p.map((pl) => ({ ...pl, isActive: false }))]);
      setNovoPlan({ name: "", description: "" });
      setDias([{ dayOfWeek: 1, name: "", muscleGroup: "peito", exercises: [exerciceDefaultForm()] }]);
    } catch { toast.error(t("workout.error_save")); }
    finally { setSalvandoPlano(false); }
  };

  // ── Registrar treino ──
  const registrarTreino = async () => {
    setRegistrando(true);
    try {
      const res = await fetch("/api/treinos/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: logPlanId || undefined,
          duration: parseInt(logDuration) || undefined,
          notes: logNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      toast.success(`${t("workout.registered")}! +${data.xp?.xpGanho ?? 25} XP`);
      if (data.xp?.levelUp) toast.success(t("workout.level_up", { n: data.xp.levelAtual }));
      data.xp?.conquistasDesbloqueadas?.forEach((c: string) => toast.success(`Conquista: ${c}`));

      setLogModal(false);
      setLogs((l) => [data.log, ...l]);
    } catch { toast.error(t("workout.error_log")); }
    finally { setRegistrando(false); }
  };

  const planoAtivo = planos.find((p) => p.isActive);

  const [abaAtiva, setAbaAtiva] = useState("criar");

  // Quando os planos carregam, ativa a aba correta
  useEffect(() => {
    if (!loading) setAbaAtiva(planos.some((p) => p.isActive) ? "plano" : "criar");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
  const hojeIdx = new Date().getDay();
  const treinoHoje = planoAtivo?.days.find((d) => d.dayOfWeek === hojeIdx);

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-10 bg-card rounded-xl w-48" />
        <div className="h-48 bg-card rounded-xl" />
      </div>
    );
  }

  const xpEstimado = 25 + Math.floor((parseInt(logDuration) || 30) / 10);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-primary" /> {t("workout.title")}
        </h1>
        <Button onClick={() => setLogModal(true)} size="sm" className="gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> {t("workout.done_btn")}
        </Button>
      </div>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="plano" className="gap-1 text-[11px] sm:text-sm">
            <ListChecks className="w-3.5 h-3.5" /> {t("workout.my_plan")}
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1 text-[11px] sm:text-sm">
            <Sparkles className="w-3.5 h-3.5" /> {t("workout.templates")}
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-1 text-[11px] sm:text-sm">
            <History className="w-3.5 h-3.5" /> {t("workout.history")}
          </TabsTrigger>
          <TabsTrigger value="criar" className="gap-1 text-[11px] sm:text-sm">
            <Settings2 className="w-3.5 h-3.5" /> {t("common.create")}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Plano atual ── */}
        <TabsContent value="plano" className="space-y-4 mt-4">
          {!planoAtivo ? (
            <div className="text-center py-16 text-muted-foreground">
              <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">{t("workout.no_plan")}</p>
              <p className="text-sm mt-1">{t("workout.no_plan_hint")}</p>
            </div>
          ) : (
            <>
              {/* Card do plano ativo */}
              <Card className="border-primary/20">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-bold text-base">{planoAtivo.name}</h2>
                      {planoAtivo.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{planoAtivo.description}</p>
                      )}
                    </div>
                    <Badge className="bg-primary/15 text-primary border-0 text-xs">{t("workout.active_badge")}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Treino de hoje em destaque */}
              {treinoHoje && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-primary">
                      {t("common.today")} — {treinoHoje.name}
                    </h3>
                  </div>
                  <Card className="border-primary/30">
                    <CardContent className="pt-4 pb-4">
                      <ExerciseDayView
                        exercises={treinoHoje.exercises}
                        muscleGroup={(treinoHoje.muscleGroup as MuscleGroup) || "geral"}
                      />
                      <Button onClick={() => setLogModal(true)} className="w-full mt-4 gap-2" size="sm">
                        <CheckCircle2 className="w-4 h-4" /> {t("workout.mark_done")}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Todos os dias da semana */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" /> {t("workout.full_week")}
                </h3>
                <div className="space-y-2">
                  {planoAtivo.days.map((dia) => {
                    const isHoje = dia.dayOfWeek === hojeIdx;
                    const isOpen = expandedDays[dia.id];
                    const muscles = dia.muscleGroup
                      ? (dia.muscleGroup.split(",") as MuscleGroup[])
                      : getExerciseMuscles(dia.name);

                    return (
                      <Card key={dia.id} className={cn("border-border/40", isHoje && "border-primary/30")}>
                        <button
                          className="w-full text-left"
                          onClick={() => setExpandedDays((e) => ({ ...e, [dia.id]: !e[dia.id] }))}
                        >
                          <CardContent className="py-3 px-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={cn(
                                "text-xs font-bold w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                                isHoje ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                              )}>
                                {DIAS_SEMANA[dia.dayOfWeek]}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{dia.name}</p>
                                <div className="flex gap-1 flex-wrap mt-0.5">
                                  {muscles.slice(0, 3).map((m) => (
                                    <MuscleBadge key={m} muscle={m as MuscleGroup} size="xs" />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="text-xs text-muted-foreground">{dia.exercises.length} ex.</span>
                              {isOpen
                                ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              }
                            </div>
                          </CardContent>
                        </button>

                        {isOpen && (
                          <div className="border-t border-border/40 px-4 pb-4 pt-3">
                            <ExerciseDayView
                              exercises={dia.exercises}
                              muscleGroup={(dia.muscleGroup as MuscleGroup) || "geral"}
                            />
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Tab: Templates ── */}
        <TabsContent value="templates" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            {t("workout.templates_hint")}
          </p>
          {WORKOUT_TEMPLATES.map((tmpl) => (
            <TemplateCard
              key={tmpl.id}
              template={tmpl}
              onApply={(t) => {
                aplicarTemplate(t);
                setAbaAtiva("criar");
              }}
            />
          ))}
        </TabsContent>

        {/* ── Tab: Histórico ── */}
        <TabsContent value="historico" className="mt-4">
          {logs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">{t("workout.history_empty")}</p>
              <p className="text-sm mt-1">{t("workout.history_empty_hint")}</p>
            </div>
          ) : (
            <>
              {/* Stats resumo */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <Card className="border-border/40">
                  <CardContent className="pt-3 pb-3 text-center">
                    <div className="text-xl font-bold text-primary">{logs.length}</div>
                    <div className="text-xs text-muted-foreground">{t("common.workouts")}</div>
                  </CardContent>
                </Card>
                <Card className="border-border/40">
                  <CardContent className="pt-3 pb-3 text-center">
                    <div className="text-xl font-bold text-yellow-400">
                      {logs.reduce((a, l) => a + l.xpEarned, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">{t("workout.stat_xp")}</div>
                  </CardContent>
                </Card>
                <Card className="border-border/40">
                  <CardContent className="pt-3 pb-3 text-center">
                    <div className="text-xl font-bold">
                      {Math.round(logs.reduce((a, l) => a + (l.duration || 0), 0) / (logs.filter((l) => l.duration).length || 1))}
                    </div>
                    <div className="text-xs text-muted-foreground">{t("workout.duration")}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                {logs.map((log) => (
                  <Card key={log.id} className="border-border/40">
                    <CardContent className="py-3 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Dumbbell className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{log.plan?.name || t("workout.free")}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              {format(new Date(log.date), "EEE, d MMM", { locale: ptBR })}
                            </span>
                            {log.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {log.duration} min
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/40 gap-1">
                        <Zap className="w-3 h-3" />+{log.xpEarned}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Tab: Criar Plano ── */}
        <TabsContent value="criar" className="space-y-4 mt-4">
          {/* Info do plano */}
          <Card className="border-border/40">
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1.5">
                <Label>{t("workout.plan_name")}</Label>
                <Input
                  placeholder={t("workout.plan_name_ph")}
                  value={novoPlan.name}
                  onChange={(e) => setNovoPlan((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("workout.plan_desc")}</Label>
                <Input
                  placeholder={t("workout.plan_desc_ph")}
                  value={novoPlan.description}
                  onChange={(e) => setNovoPlan((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dias de treino */}
          {dias.map((dia, diaIdx) => (
            <Card key={diaIdx} className="border-border/40">
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Dia da semana */}
                  <select
                    value={dia.dayOfWeek}
                    onChange={(e) => updateDia(diaIdx, "dayOfWeek", parseInt(e.target.value))}
                    className="bg-secondary border border-border rounded-lg px-2 py-1.5 text-sm"
                  >
                    {DIAS_SEMANA_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>

                  {/* Grupo muscular */}
                  <select
                    value={dia.muscleGroup}
                    onChange={(e) => updateDia(diaIdx, "muscleGroup", e.target.value as MuscleGroup)}
                    className="bg-secondary border border-border rounded-lg px-2 py-1.5 text-sm"
                  >
                    {MUSCLE_GROUPS.map((m) => (
                      <option key={m} value={m}>{MUSCLE_LABELS[m]}</option>
                    ))}
                  </select>

                  {/* Nome personalizado */}
                  <Input
                    placeholder={`Nome (ex: Peito e Tríceps)`}
                    value={dia.name}
                    onChange={(e) => updateDia(diaIdx, "name", e.target.value)}
                    className="flex-1 min-w-[160px] h-9 text-sm"
                  />

                  {dias.length > 1 && (
                    <button
                      onClick={() => removeDia(diaIdx)}
                      className="text-muted-foreground hover:text-destructive text-xs ml-auto"
                    >
                      {t("workout.remove_day")}
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                {/* Cabeçalho das colunas */}
                <div className="grid grid-cols-12 gap-1.5 text-xs text-muted-foreground px-0.5">
                  <span className="col-span-5">{t("workout.col_exercise")}</span>
                  <span className="col-span-2 text-center">{t("workout.col_sets")}</span>
                  <span className="col-span-2 text-center">{t("workout.col_reps")}</span>
                  <span className="col-span-2 text-center">{t("workout.col_kg")}</span>
                  <span className="col-span-1" />
                </div>

                {dia.exercises.map((ex, exIdx) => (
                  <div key={exIdx} className="grid grid-cols-12 gap-1.5 items-center">
                    <div className="col-span-5 relative">
                      <Input
                        placeholder={t("workout.col_exercise")}
                        value={ex.name}
                        onChange={(e) => updateExercicio(diaIdx, exIdx, "name", e.target.value)}
                        className="h-8 text-sm pr-8"
                      />
                      {ex.name && (
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                          <ExerciseVideoButton exerciseName={ex.name} variant="icon" />
                        </div>
                      )}
                    </div>
                    <Input
                      type="number" min={1} max={20}
                      value={ex.sets}
                      onChange={(e) => updateExercicio(diaIdx, exIdx, "sets", parseInt(e.target.value) || 1)}
                      className="col-span-2 h-8 text-sm text-center px-1"
                    />
                    <Input
                      placeholder="10-12"
                      value={ex.reps}
                      onChange={(e) => updateExercicio(diaIdx, exIdx, "reps", e.target.value)}
                      className="col-span-2 h-8 text-sm text-center px-1"
                    />
                    <Input
                      type="number" step={0.5}
                      placeholder="—"
                      value={ex.weight}
                      onChange={(e) => updateExercicio(diaIdx, exIdx, "weight", e.target.value === "" ? "" : parseFloat(e.target.value))}
                      className="col-span-2 h-8 text-sm text-center px-1"
                    />
                    <button
                      onClick={() => removeExercicio(diaIdx, exIdx)}
                      className="col-span-1 flex items-center justify-center text-muted-foreground hover:text-destructive"
                    >
                      <span className="text-xs">✕</span>
                    </button>
                  </div>
                ))}

                {/* Músculos detectados */}
                {dia.exercises.some((e) => e.name.trim()) && (
                  <div className="flex gap-1 flex-wrap pt-1">
                    {Array.from(
                      new Set(
                        dia.exercises
                          .filter((e) => e.name.trim())
                          .flatMap((e) => getExerciseMuscles(e.name))
                      )
                    ).map((m) => (
                      <MuscleBadge key={m} muscle={m} size="xs" />
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addExercicio(diaIdx)}
                  className="w-full text-xs gap-1 mt-1"
                >
                  <Plus className="w-3 h-3" /> {t("workout.add_exercise")}
                </Button>
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-2">
            <Button variant="outline" onClick={addDia} className="flex-1 gap-1.5">
              <Plus className="w-4 h-4" /> {t("workout.add_day")}
            </Button>
            <Button onClick={salvarPlano} disabled={salvandoPlano} className="flex-1 gap-1.5">
              {salvandoPlano ? t("common.saving") : (
                <><CheckCircle2 className="w-4 h-4" /> {t("workout.save_plan")}</>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Modal: Registrar treino ── */}
      <Dialog open={logModal} onOpenChange={setLogModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> {t("workout.log_title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {planos.length > 0 && (
              <div className="space-y-1.5">
                <Label>{t("workout.plan_label")}</Label>
                <select
                  value={logPlanId}
                  onChange={(e) => setLogPlanId(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">{t("workout.free")}</option>
                  {planos.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t("workout.duration")}</Label>
              <Input
                type="number"
                value={logDuration}
                onChange={(e) => setLogDuration(e.target.value)}
                placeholder="60"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("workout.obs")}</Label>
              <Input
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder={t("workout.obs")}
              />
            </div>

            {/* XP preview */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-muted-foreground">{t("workout.xp_earn")}</span>
              </div>
              <span className="text-xl font-bold text-yellow-400">+{xpEstimado}</span>
            </div>

            <Button onClick={registrarTreino} disabled={registrando} className="w-full gap-2">
              {registrando ? t("common.loading") : (
                <><CheckCircle2 className="w-4 h-4" /> {t("workout.confirm")}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Subcomponente: lista de exercícios de um dia ──
function ExerciseDayView({
  exercises,
  muscleGroup,
}: {
  exercises: WorkoutPlan["days"][0]["exercises"];
  muscleGroup: MuscleGroup;
}) {
  // Agrupar exercícios por músculo principal
  const grouped = exercises.reduce<Record<string, typeof exercises>>((acc, ex) => {
    const muscles = getExerciseMuscles(ex.name);
    const primary = muscles[0] ?? muscleGroup;
    if (!acc[primary]) acc[primary] = [];
    acc[primary].push(ex);
    return acc;
  }, {});

  const groups = Object.entries(grouped);

  return (
    <div className="space-y-4">
      {groups.map(([muscle, exs]) => (
        <div key={muscle}>
          {groups.length > 1 && (
            <div className="flex items-center gap-2 mb-2">
              <MuscleBadge muscle={muscle as MuscleGroup} size="xs" />
              <Separator className="flex-1" />
            </div>
          )}
          <div className="space-y-2">
            {exs.map((ex) => (
              <ExerciseRow key={ex.id} exercise={ex} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Linha de exercício ──
function ExerciseRow({ exercise }: { exercise: WorkoutPlan["days"][0]["exercises"][0] }) {
  const muscles = getExerciseMuscles(exercise.name);

  return (
    <div className="flex items-center gap-3 group">
      {/* Ícone do músculo */}
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />
      </div>

      {/* Info do exercício */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{exercise.name}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1">
            <ListChecks className="w-3 h-3" />
            {exercise.sets} × {exercise.reps}
          </span>
          {exercise.weight && (
            <span className="flex items-center gap-1">
              <Weight className="w-3 h-3" />
              {exercise.weight} kg
            </span>
          )}
          {exercise.restSecs && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {exercise.restSecs}s
            </span>
          )}
        </div>
        {exercise.notes && (
          <p className="text-xs text-muted-foreground italic mt-0.5 truncate">{exercise.notes}</p>
        )}
      </div>

      {/* Músculos detectados */}
      <div className="hidden sm:flex gap-1 flex-wrap max-w-[120px] justify-end">
        {muscles.slice(0, 2).map((m) => (
          <MuscleBadge key={m} muscle={m} size="xs" />
        ))}
      </div>

      {/* Botão de vídeo */}
      <ExerciseVideoButton exerciseName={exercise.name} variant="icon" />
    </div>
  );
}

// ── Card de template predefinido ──
function TemplateCard({
  template,
  onApply,
}: {
  template: WorkoutTemplate;
  onApply: (t: WorkoutTemplate) => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardContent className="pt-4 pb-3">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-sm">{template.name}</h3>
              <span className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
                LEVEL_COLORS[template.level]
              )}>
                {template.level}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{template.description}</p>
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {template.daysPerWeek} {t("common.per_week")}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {template.goal}
              </span>
            </div>
          </div>
        </div>

        {/* Dias (colapsável) */}
        {open && (
          <div className="mt-3 space-y-2 border-t border-border/40 pt-3">
            {template.days.map((dia) => (
              <div key={dia.dayOfWeek} className="bg-secondary/40 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-primary mb-1">{dia.name}</p>
                <ul className="space-y-0.5">
                  {dia.exercises.map((ex, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex justify-between">
                      <span className="truncate flex-1 mr-2">{ex.name}</span>
                      <span className="shrink-0 text-[10px]">{ex.sets}×{ex.reps}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            onClick={() => setOpen((v) => !v)}
          >
            {open
              ? <><ChevronUp className="w-3.5 h-3.5" /> {t("workout.template_hide")}</>
              : <><ChevronDown className="w-3.5 h-3.5" /> {t("workout.template_see")}</>}
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            onClick={() => {
              onApply(template);
              toast.success(t("workout.template_loaded", { name: template.name }));
            }}
          >
            <Sparkles className="w-3.5 h-3.5" /> {t("workout.template_use")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
