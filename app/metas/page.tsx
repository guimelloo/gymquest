"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { calcularDiasRestantes, verificarRitmoMeta } from "@/lib/gamification";
import { calcularProgresso } from "@/lib/calculations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const TIPO_META = [
  { v: "bodyFat", l: "🔥 Reduzir gordura", u: "%" },
  { v: "weight", l: "⚖️ Emagrecer", u: "kg" },
  { v: "muscle", l: "💪 Ganhar massa", u: "%" },
  { v: "streak", l: "🔥 Sequência de dias", u: "dias" },
  { v: "workout", l: "🏋️ Número de treinos", u: "treinos" },
  { v: "water", l: "💧 Meta de hidratação", u: "ml" },
  { v: "custom", l: "✨ Meta personalizada", u: "" },
];

const STATUS_RITMO: Record<string, { label: string; color: string }> = {
  no_prazo: { label: "✅ No prazo", color: "text-green-400" },
  risco: { label: "⚠️ Em risco", color: "text-yellow-400" },
  atrasado: { label: "❌ Atrasado", color: "text-red-400" },
};

export default function MetasPage() {
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
    const t = TIPO_META.find((t) => t.v === tipo);
    setForm((f) => ({ ...f, type: tipo, unit: t?.u || "" }));
  };

  const criarMeta = async () => {
    if (!form.title || !form.targetValue) {
      toast.error("Título e valor alvo são obrigatórios");
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

      toast.success("🎯 Missão criada!");
      setMetas((m) => [data, ...m]);
      setModal(false);
      setForm({ type: "bodyFat", title: "", description: "", targetValue: "", startValue: "", unit: "%", deadline: "", xpReward: "200" });
    } catch {
      toast.error("Erro ao criar meta");
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

      // Verificar se meta foi atingida
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
        toast.success(`🏆 Meta "${updateModal.title}" concluída! +${updateModal.xpReward} XP`);
      } else {
        toast.success("✅ Progresso atualizado!");
      }

      setMetas((m) => m.map((meta) => (meta.id === data.id ? data : meta)));
      setUpdateModal(null);
      setNovoValor("");
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setSaving(false);
    }
  };

  const excluirMeta = async (id: string) => {
    await fetch(`/api/metas?id=${id}`, { method: "DELETE" });
    setMetas((m) => m.filter((meta) => meta.id !== id));
    toast.success("Meta removida");
  };

  const ativas = metas.filter((m) => m.status === "active");
  const concluidas = metas.filter((m) => m.status === "completed");

  if (loading) return <div className="p-6 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🎯 Missões</h1>
        <Button onClick={() => setModal(true)}>+ Nova Missão</Button>
      </div>

      <Tabs defaultValue="ativas">
        <TabsList>
          <TabsTrigger value="ativas">
            Ativas {ativas.length > 0 && <Badge className="ml-1 text-xs bg-primary/20 text-primary">{ativas.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="concluidas">
            Concluídas {concluidas.length > 0 && <Badge className="ml-1 text-xs">{concluidas.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativas" className="space-y-4 mt-4">
          {ativas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-2">🎯</div>
              <p>Nenhuma missão ativa</p>
              <p className="text-sm mt-1">Crie sua primeira missão!</p>
              <Button onClick={() => setModal(true)} className="mt-4">Criar Missão</Button>
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
              const ritmoInfo = STATUS_RITMO[ritmo];

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
                            <Badge variant="outline" className={`text-xs ${diasRestantes <= 7 ? "text-red-400 border-red-400/50" : ""}`}>
                              📅 {diasRestantes === 0 ? "Vence hoje" : `${diasRestantes} dias`}
                            </Badge>
                          )}
                          <span className={`text-xs font-medium ${ritmoInfo.color}`}>
                            {ritmoInfo.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-primary">{Math.round(progresso)}%</div>
                        <div className="text-xs text-yellow-400">+{meta.xpReward} XP</div>
                      </div>
                    </div>

                    <Progress value={progresso} className="h-2.5 mb-3" />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setUpdateModal(meta); setNovoValor(meta.currentValue?.toString() || ""); }}
                        className="flex-1 text-xs"
                      >
                        ✏️ Atualizar progresso
                      </Button>
                      <button
                        onClick={() => excluirMeta(meta.id)}
                        className="text-muted-foreground hover:text-destructive text-xs p-2"
                      >
                        🗑️
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
              <div className="text-4xl mb-2">🏆</div>
              <p>Nenhuma missão concluída ainda</p>
              <p className="text-sm mt-1">Continue trabalhando nas suas missões!</p>
            </div>
          ) : (
            concluidas.map((meta) => (
              <Card key={meta.id} className="border-green-500/20 bg-green-500/5">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span>🏆</span>
                        <span className="font-medium">{meta.title}</span>
                      </div>
                      {meta.completedAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Concluída em {format(new Date(meta.completedAt), "d MMM yyyy", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                      +{meta.xpReward} XP
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
            <DialogTitle>🎯 Nova Missão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de meta</Label>
              <div className="grid grid-cols-2 gap-2">
                {TIPO_META.map((t) => (
                  <button
                    key={t.v}
                    type="button"
                    onClick={() => handleTipoChange(t.v)}
                    className={`p-2 rounded-lg border text-xs font-medium transition-colors text-left ${
                      form.type === t.v
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
                placeholder="Ex: Chegar a 10% de gordura"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Valor inicial ({form.unit})</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Valor atual"
                  value={form.startValue}
                  onChange={(e) => setForm((f) => ({ ...f, startValue: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Meta ({form.unit})</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Valor alvo"
                  value={form.targetValue}
                  onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Prazo (opcional)</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Recompensa XP</Label>
                <Input
                  type="number"
                  value={form.xpReward}
                  onChange={(e) => setForm((f) => ({ ...f, xpReward: e.target.value }))}
                />
              </div>
            </div>

            <Button onClick={criarMeta} disabled={saving} className="w-full">
              {saving ? "Criando..." : "🎯 Criar Missão"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal atualizar progresso */}
      <Dialog open={!!updateModal} onOpenChange={() => setUpdateModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✏️ Atualizar Progresso</DialogTitle>
          </DialogHeader>
          {updateModal && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{updateModal.title}</p>
              <div className="space-y-2">
                <Label>Valor atual ({updateModal.unit})</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  placeholder="Valor atual"
                />
                <p className="text-xs text-muted-foreground">
                  Meta: {updateModal.targetValue}{updateModal.unit}
                </p>
              </div>
              <Button onClick={atualizarProgresso} disabled={saving} className="w-full">
                {saving ? "Salvando..." : "Salvar Progresso"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
