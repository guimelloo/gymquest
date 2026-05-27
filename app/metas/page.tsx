"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";
import { calcularDiasRestantes, verificarRitmoMeta } from "@/lib/gamification";
import { calcularProgresso } from "@/lib/calculations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Target, Flame, Scale, Dumbbell, Droplets, Sparkles,
  Trophy, CheckCircle2, AlertTriangle, XCircle,
  CalendarDays, Pencil, Trash2, Plus, Zap,
} from "lucide-react";

interface Meta {
  id: string;
  type: string;
  title: string;
  description: string | null;
  targetValue: number | null;
  currentValue: number | null;
  startValue: number | null;
  unit: string | null;
  deadline: string | null;
  status: string;
  xpReward: number;
  createdAt: string;
  completedAt: string | null;
}

const TIPO_META = (t: any) => [
  { v: "bodyFat", l: t("goals.type_fat"),      u: "%",     Icon: Flame },
  { v: "weight",  l: t("goals.type_weight"),   u: "kg",    Icon: Scale },
  { v: "muscle",  l: t("goals.type_muscle"),   u: "%",     Icon: Dumbbell },
  { v: "streak",  l: t("goals.type_streak"),   u: "dias",  Icon: Flame },
  { v: "workout", l: t("goals.type_workout"),  u: "treinos",Icon: Dumbbell },
  { v: "water",   l: t("goals.type_water"),    u: "ml",    Icon: Droplets },
  { v: "custom",  l: t("goals.type_custom"),   u: "",      Icon: Sparkles },
];

const STATUS_RITMO = (t: any): Record<string, { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }> => ({
  no_prazo: { label: t("goals.on_track"),  color: "text-green-400",  Icon: CheckCircle2 },
  risco:    { label: t("goals.at_risk"),  color: "text-yellow-400", Icon: AlertTriangle },
  atrasado: { label: t("goals.late"),    color: "text-red-400",    Icon: XCircle },
});

export default function MetasPage() {
  const { t } = useLanguage();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [updateModal, setUpdateModal] = useState<Meta | null>(null);
  const [saving, setSaving] = useState(false);
  const [novoValor, setNovoValor] = useState("");

  const [form, setForm] = useState({
    type: "bodyFat",
    title: "",
    description: "",
    targetValue: "",
    startValue: "",
    unit: "%",
    deadline: "",
    xpReward: "200",
  });

  useEffect(() => {
    fetch("/api/metas")
      .then((r) => r.json())
      .then(setMetas)
      .finally(() => setLoading(false));
  }, []);

  const handleTipoChange = (tipo: string) => {
    const found = TIPO_META(t).find((item) => item.v === tipo);
    setForm((f) => ({ ...f, type: tipo, unit: found?.u || "" }));
  };

  const criarMeta = async () => {
    if (!form.title || !form.targetValue) {
      toast.error(t("goals.error_fields"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/metas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          title: form.title,
          description: form.description || undefined,
          targetValue: parseFloat(form.targetValue),
          startValue: form.startValue ? parseFloat(form.startValue) : undefined,
          currentValue: form.startValue ? parseFloat(form.startValue) : undefined,
          unit: form.unit || undefined,
          deadline: form.deadline || undefined,
          xpReward: parseInt(form.xpReward) || 200,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      toast.success(t("goals.created"));
      setMetas((m) => [data, ...m]);
      setModal(false);
      setForm({ type: "bodyFat", title: "", description: "", targetValue: "", startValue: "", unit: "%", deadline: "", xpReward: "200" });
    } catch {
      toast.error(t("goals.error_create"));
    } finally {
      setSaving(false);
    }
  };

  const atualizarProgresso = async () => {
    if (!updateModal || !novoValor) return;
    setSaving(true);
    try {
      const targetValue = updateModal.targetValue;
      const currentValue = parseFloat(novoValor);

      let newStatus = updateModal.status;
      if (targetValue !== null) {
        const isDecreasing = (updateModal.startValue || 0) > targetValue;
        if (isDecreasing && currentValue <= targetValue) newStatus = "completed";
        if (!isDecreasing && currentValue >= targetValue) newStatus = "completed";
      }

      const res = await fetch("/api/metas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: updateModal.id, currentValue, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      if (newStatus === "completed") {
        toast.success(t("goals.completed_msg", { title: updateModal.title, xp: updateModal.xpReward }));
      } else {
        toast.success(t("goals.updated"));
      }

      setMetas((m) => m.map((meta) => (meta.id === data.id ? data : meta)));
      setUpdateModal(null);
      setNovoValor("");
    } catch {
      toast.error(t("goals.error_update"));
    } finally {
      setSaving(false);
    }
  };

  const excluirMeta = async (id: string) => {
    await fetch(`/api/metas?id=${id}`, { method: "DELETE" });
    setMetas((m) => m.filter((meta) => meta.id !== id));
    toast.success(t("goals.removed"));
  };

  const ativas = metas.filter((m) => m.status === "active");
  const concluidas = metas.filter((m) => m.status === "completed");

  if (loading) return <div className="p-6 text-center text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          {t("goals.title")}
        </h1>
        <Button onClick={() => setModal(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> {t("goals.new_btn")}
        </Button>
      </div>

      <Tabs defaultValue="ativas">
        <TabsList>
          <TabsTrigger value="ativas">
            {t("goals.active_tab")} {ativas.length > 0 && <Badge className="ml-1 text-xs bg-primary/20 text-primary">{ativas.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="concluidas">
            {t("goals.done_tab")} {concluidas.length > 0 && <Badge className="ml-1 text-xs">{concluidas.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativas" className="space-y-4 mt-4">
          {ativas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t("goals.no_active")}</p>
              <p className="text-sm mt-1">{t("goals.no_active_hint")}</p>
              <Button onClick={() => setModal(true)} className="mt-4 gap-1.5">
                <Plus className="w-4 h-4" /> {t("goals.create_first")}
              </Button>
            </div>
          ) : (
            ativas.map((meta) => {
              const progresso = meta.startValue !== null && meta.targetValue !== null && meta.currentValue !== null
                ? calcularProgresso(meta.startValue, meta.currentValue, meta.targetValue)
                : 0;
              const diasRestantes = meta.deadline ? calcularDiasRestantes(new Date(meta.deadline)) : null;
              const ritmo = diasRestantes !== null
                ? verificarRitmoMeta(diasRestantes, progresso)
                : "no_prazo";
              const ritmoInfo = STATUS_RITMO(t)[ritmo];
              const RitmoIcon = ritmoInfo.Icon;

              return (
                <Card key={meta.id} className="border-border/50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{meta.title}</h3>
                        {meta.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{meta.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {meta.currentValue !== null ? `${meta.currentValue}${meta.unit}` : "—"} → {meta.targetValue}{meta.unit}
                          </Badge>
                          {diasRestantes !== null && (
                            <Badge variant="outline" className={`text-xs gap-1 ${diasRestantes <= 7 ? "text-red-400 border-red-400/50" : ""}`}>
                              <CalendarDays className="w-3 h-3" />
                              {diasRestantes === 0 ? t("goals.due_today") : t("goals.days_left", { n: diasRestantes })}
                            </Badge>
                          )}
                          <span className={`text-xs font-medium flex items-center gap-1 ${ritmoInfo.color}`}>
                            <RitmoIcon className="w-3 h-3" />
                            {ritmoInfo.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-primary">{Math.round(progresso)}%</div>
                        <div className="text-xs text-yellow-400 flex items-center justify-end gap-0.5">
                          <Zap className="w-3 h-3" />+{meta.xpReward}
                        </div>
                      </div>
                    </div>

                    <Progress value={progresso} className="h-2.5 mb-3" />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setUpdateModal(meta); setNovoValor(meta.currentValue?.toString() || ""); }}
                        className="flex-1 text-xs gap-1.5"
                      >
                        <Pencil className="w-3 h-3" /> {t("goals.update_title")}
                      </Button>
                      <button
                        onClick={() => excluirMeta(meta.id)}
                        className="text-muted-foreground hover:text-destructive p-2 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="concluidas" className="space-y-3 mt-4">
          {concluidas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t("goals.no_done")}</p>
              <p className="text-sm mt-1">{t("goals.no_done_hint")}</p>
            </div>
          ) : (
            concluidas.map((meta) => (
              <Card key={meta.id} className="border-green-500/20 bg-green-500/5">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium">{meta.title}</span>
                      </div>
                      {meta.completedAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t("goals.completed_on")} {format(new Date(meta.completedAt), "d MMM yyyy", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-0 text-xs gap-1">
                      <Zap className="w-3 h-3" />+{meta.xpReward} XP
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Modal criar meta */}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> {t("goals.new_btn")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("goals.type")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {TIPO_META(t).map((item) => {
                  const TIcon = item.Icon;
                  return (
                    <button
                      key={item.v}
                      type="button"
                      onClick={() => handleTipoChange(item.v)}
                      className={`p-2 rounded-lg border text-xs font-medium transition-colors text-left flex items-center gap-1.5 ${
                        form.type === item.v
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <TIcon className="w-3.5 h-3.5 shrink-0" />
                      {item.l}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("goals.mission_name")}</Label>
              <Input
                placeholder={t("onboarding.goal_name_ph")}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("goals.start")} ({form.unit})</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder={t("goals.current_value")}
                  value={form.startValue}
                  onChange={(e) => setForm((f) => ({ ...f, startValue: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("goals.target")} ({form.unit})</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder={t("goals.target")}
                  value={form.targetValue}
                  onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("goals.deadline")}</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("goals.xp_reward")}</Label>
                <Input
                  type="number"
                  value={form.xpReward}
                  onChange={(e) => setForm((f) => ({ ...f, xpReward: e.target.value }))}
                />
              </div>
            </div>

            <Button onClick={criarMeta} disabled={saving} className="w-full gap-1.5">
              {saving ? t("common.loading") : <><Target className="w-4 h-4" /> {t("goals.create_btn")}</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal atualizar progresso */}
      <Dialog open={!!updateModal} onOpenChange={() => setUpdateModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> {t("goals.update_title")}
            </DialogTitle>
          </DialogHeader>
          {updateModal && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{updateModal.title}</p>
              <div className="space-y-2">
                <Label>{t("goals.current_value")} ({updateModal.unit})</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  placeholder={t("goals.current_value")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("goals.target")}: {updateModal.targetValue}{updateModal.unit}
                </p>
              </div>
              <Button onClick={atualizarProgresso} disabled={saving} className="w-full">
                {saving ? t("common.saving") : t("goals.save_progress")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
