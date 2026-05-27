"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface Exercicio {
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  restSecs?: number;
  notes?: string;
}

interface DiaTreino {
  dayOfWeek: number;
  name: string;
  exercises: Exercicio[];
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
    exercises: Array<{
      id: string;
      name: string;
      sets: number;
      reps: string;
      weight: number | null;
      restSecs: number | null;
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

export default function TreinoPage() {
  const [planos, setPlanos] = useState<WorkoutPlan[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Criação de plano
  const [criando, setCriando] = useState(false);
  const [novoPlan, setNovoPlan] = useState({ name: "", description: "" });
  const [dias, setDias] = useState<DiaTreino[]>([{ dayOfWeek: 1, name: "Peito e Tríceps", exercises: [] }]);

  // Log de treino
  const [logModal, setLogModal] = useState(false);
  const [logDuration, setLogDuration] = useState("60");
  const [logPlanId, setLogPlanId] = useState<string>("");
  const [logNotes, setLogNotes] = useState("");
  const [registrando, setRegistrando] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/treinos").then((r) => r.json()),
      fetch("/api/treinos/log?limit=20").then((r) => r.json()),
    ]).then(([p, l]) => {
      setPlanos(Array.isArray(p) ? p : []);
      setLogs(Array.isArray(l) ? l : []);
      if (Array.isArray(p) && p.length > 0) {
        const ativo = p.find((pl: WorkoutPlan) => pl.isActive);
        if (ativo) setLogPlanId(ativo.id);
      }
    }).finally(() => setLoading(false));
  }, []);

  const adicionarDia = () => {
    setDias((d) => [...d, { dayOfWeek: d.length, name: "Novo dia", exercises: [] }]);
  };

  const adicionarExercicio = (diaIdx: number) => {
    setDias((d) => {
      const novos = [...d];
      novos[diaIdx] = {
        ...novos[diaIdx],
        exercises: [...novos[diaIdx].exercises, { name: "", sets: 3, reps: "10-12" }],
      };
      return novos;
    });
  };

  const updateExercicio = (diaIdx: number, exIdx: number, field: string, value: string | number) => {
    setDias((d) => {
      const novos = [...d];
      const exs = [...novos[diaIdx].exercises];
      exs[exIdx] = { ...exs[exIdx], [field]: value };
      novos[diaIdx] = { ...novos[diaIdx], exercises: exs };
      return novos;
    });
  };

  const removerExercicio = (diaIdx: number, exIdx: number) => {
    setDias((d) => {
      const novos = [...d];
      novos[diaIdx] = {
        ...novos[diaIdx],
        exercises: novos[diaIdx].exercises.filter((_, i) => i !== exIdx),
      };
      return novos;
    });
  };

  const salvarPlano = async () => {
    if (!novoPlan.name) { toast.error("Nome do plano é obrigatório"); return; }
    const diasValidos = dias.filter((d) => d.exercises.some((e) => e.name));
    if (diasValidos.length === 0) { toast.error("Adicione pelo menos um exercício"); return; }

    setCriando(true);
    try {
      const res = await fetch("/api/treinos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: novoPlan.name,
          description: novoPlan.description,
          days: diasValidos.map((d) => ({
            ...d,
            exercises: d.exercises.filter((e) => e.name),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      toast.success("✅ Plano de treino criado!");
      setPlanos((p) => [data, ...p.map((pl) => ({ ...pl, isActive: false }))]);
      setNovoPlan({ name: "", description: "" });
      setDias([{ dayOfWeek: 1, name: "", exercises: [] }]);
    } catch {
      toast.error("Erro ao criar plano");
    } finally {
      setCriando(false);
    }
  };

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

      toast.success(`💪 Treino registrado! +${data.xp?.xpGanho || 25} XP`);
      if (data.xp?.levelUp) toast.success(`🆙 Level Up! Nível ${data.xp.levelAtual}!`);
      if (data.xp?.conquistasDesbloqueadas?.length > 0) {
        data.xp.conquistasDesbloqueadas.forEach((c: string) => toast.success(`🏆 Conquista: ${c}`));
      }

      setLogModal(false);
      setLogs((l) => [data.log, ...l]);
    } catch {
      toast.error("Erro ao registrar");
    } finally {
      setRegistrando(false);
    }
  };

  const planoAtivo = planos.find((p) => p.isActive);
  const hojeIdx = new Date().getDay();
  const treinoHoje = planoAtivo?.days.find((d) => d.dayOfWeek === hojeIdx);

  if (loading) return <div className="p-6 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">💪 Treino</h1>
        <Button onClick={() => setLogModal(true)} size="sm">
          ✅ Treino feito!
        </Button>
      </div>

      <Tabs defaultValue={planoAtivo ? "plano" : "criar"}>
        <TabsList className="w-full">
          <TabsTrigger value="plano" className="flex-1">Meu Plano</TabsTrigger>
          <TabsTrigger value="historico" className="flex-1">Histórico</TabsTrigger>
          <TabsTrigger value="criar" className="flex-1">Criar Plano</TabsTrigger>
        </TabsList>

        {/* Tab: Plano atual */}
        <TabsContent value="plano" className="space-y-4">
          {!planoAtivo ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-2">📋</div>
              <p>Nenhum plano de treino ativo</p>
              <p className="text-sm mt-1">Crie um plano na aba "Criar Plano"</p>
            </div>
          ) : (
            <>
              <Card className="border-primary/20">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-bold">{planoAtivo.name}</h2>
                      {planoAtivo.description && (
                        <p className="text-sm text-muted-foreground">{planoAtivo.description}</p>
                      )}
                    </div>
                    <Badge className="bg-primary/20 text-primary border-0">Ativo</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Treino de hoje */}
              {treinoHoje && (
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2">
                    ⚡ Hoje — {treinoHoje.name}
                  </h3>
                  <Card className="border-primary/30">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {treinoHoje.exercises.map((ex) => (
                          <div key={ex.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                            <div>
                              <p className="font-medium text-sm">{ex.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {ex.sets} séries × {ex.reps} reps
                                {ex.weight ? ` • ${ex.weight} kg` : ""}
                              </p>
                            </div>
                            {ex.restSecs && (
                              <span className="text-xs text-muted-foreground">{ex.restSecs}s</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button onClick={() => setLogModal(true)} className="w-full mt-4" size="sm">
                        ✅ Marcar como feito!
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Todos os dias */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Semana completa</h3>
                {planoAtivo.days.map((dia) => (
                  <Card key={dia.id} className={`border-border/50 ${dia.dayOfWeek === hojeIdx ? "border-primary/30" : ""}`}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">{DIAS_SEMANA[dia.dayOfWeek]}</span>
                          <span className="text-sm text-muted-foreground ml-2">— {dia.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{dia.exercises.length} exercícios</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Tab: Histórico */}
        <TabsContent value="historico" className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-2">📈</div>
              <p>Nenhum treino registrado</p>
            </div>
          ) : (
            logs.map((log) => (
              <Card key={log.id} className="border-border/50">
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{log.plan?.name || "Treino livre"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.date), "EEEE, d MMM", { locale: ptBR })}
                      {log.duration ? ` • ${log.duration} min` : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/50">
                    +{log.xpEarned} XP
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab: Criar plano */}
        <TabsContent value="criar" className="space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label>Nome do plano</Label>
                <Input
                  placeholder="Ex: Hipertrofia 4x por semana"
                  value={novoPlan.name}
                  onChange={(e) => setNovoPlan((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  placeholder="Ex: Foco em hipertrofia com 4 dias de treino"
                  value={novoPlan.description}
                  onChange={(e) => setNovoPlan((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {dias.map((dia, diaIdx) => (
            <Card key={diaIdx} className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <select
                    value={dia.dayOfWeek}
                    onChange={(e) => setDias((d) => { const n = [...d]; n[diaIdx] = { ...n[diaIdx], dayOfWeek: parseInt(e.target.value) }; return n; })}
                    className="bg-secondary border border-border rounded-md px-2 py-1 text-sm"
                  >
                    {DIAS_SEMANA.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                  <Input
                    placeholder="Nome do dia (ex: Peito e Tríceps)"
                    value={dia.name}
                    onChange={(e) => setDias((d) => { const n = [...d]; n[diaIdx] = { ...n[diaIdx], name: e.target.value }; return n; })}
                    className="flex-1 h-8 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {dia.exercises.map((ex, exIdx) => (
                  <div key={exIdx} className="grid grid-cols-12 gap-1.5 items-center">
                    <Input
                      placeholder="Exercício"
                      value={ex.name}
                      onChange={(e) => updateExercicio(diaIdx, exIdx, "name", e.target.value)}
                      className="col-span-4 h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Séries"
                      value={ex.sets}
                      onChange={(e) => updateExercicio(diaIdx, exIdx, "sets", parseInt(e.target.value) || 1)}
                      className="col-span-2 h-8 text-sm text-center"
                    />
                    <Input
                      placeholder="Reps"
                      value={ex.reps}
                      onChange={(e) => updateExercicio(diaIdx, exIdx, "reps", e.target.value)}
                      className="col-span-2 h-8 text-sm text-center"
                    />
                    <Input
                      type="number"
                      placeholder="kg"
                      value={ex.weight || ""}
                      onChange={(e) => updateExercicio(diaIdx, exIdx, "weight", parseFloat(e.target.value) || 0)}
                      className="col-span-3 h-8 text-sm text-center"
                    />
                    <button
                      onClick={() => removerExercicio(diaIdx, exIdx)}
                      className="col-span-1 text-muted-foreground hover:text-destructive text-xs"
                    >✕</button>
                  </div>
                ))}
                <div className="text-xs text-muted-foreground grid grid-cols-12 gap-1.5 pl-0">
                  <span className="col-span-4">Nome</span>
                  <span className="col-span-2 text-center">Séries</span>
                  <span className="col-span-2 text-center">Reps</span>
                  <span className="col-span-3 text-center">Peso (kg)</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => adicionarExercicio(diaIdx)} className="w-full text-xs">
                  + Adicionar exercício
                </Button>
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-2">
            <Button variant="outline" onClick={adicionarDia} className="flex-1">
              + Adicionar dia
            </Button>
            <Button onClick={salvarPlano} disabled={criando} className="flex-1">
              {criando ? "Salvando..." : "💾 Salvar Plano"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal registro de treino */}
      <Dialog open={logModal} onOpenChange={setLogModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ Registrar Treino</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {planos.length > 0 && (
              <div className="space-y-2">
                <Label>Plano (opcional)</Label>
                <select
                  value={logPlanId}
                  onChange={(e) => setLogPlanId(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Treino livre</option>
                  {planos.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Duração (minutos)</Label>
              <Input
                type="number"
                value={logDuration}
                onChange={(e) => setLogDuration(e.target.value)}
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Input
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Como foi o treino?"
              />
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-sm text-center">
              <p className="text-muted-foreground">XP estimado</p>
              <p className="text-xl font-bold text-yellow-400">
                +{25 + Math.floor((parseInt(logDuration) || 30) / 10)} XP
              </p>
            </div>
            <Button onClick={registrarTreino} disabled={registrando} className="w-full">
              {registrando ? "Registrando..." : "💪 Treino Registrado!"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
