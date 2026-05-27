"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { calcularIMC, classificarIMC } from "@/lib/calculations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

interface Medida {
  id: string;
  date: string;
  weight: number;
  bodyFat: number | null;
  muscleMass: number | null;
  waist: number | null;
  chest: number | null;
  hips: number | null;
  notes: string | null;
}

interface UserProfile {
  height: number | null;
  gender: string | null;
}

export default function ProgressoPage() {
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ height: null, gender: null });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    weight: "",
    bodyFat: "",
    muscleMass: "",
    waist: "",
    chest: "",
    hips: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/medidas?limit=30").then((r) => r.json()),
      fetch("/api/user/profile").then((r) => r.json()),
    ]).then(([m, p]) => {
      setMedidas(Array.isArray(m) ? m : []);
      setProfile({ height: p.height, gender: p.gender });
    }).finally(() => setLoading(false));
  }, []);

  const salvarMedida = async () => {
    if (!form.weight) { toast.error("Informe o peso"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/medidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(form.weight),
          bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
          muscleMass: form.muscleMass ? parseFloat(form.muscleMass) : undefined,
          waist: form.waist ? parseFloat(form.waist) : undefined,
          chest: form.chest ? parseFloat(form.chest) : undefined,
          hips: form.hips ? parseFloat(form.hips) : undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      toast.success("✅ Medida registrada! +10 XP");
      if (data.xp?.levelUp) toast.success(`🆙 Level Up! Nível ${data.xp.levelAtual}!`);
      if (data.xp?.conquistasDesbloqueadas?.length > 0) {
        data.xp.conquistasDesbloqueadas.forEach((c: string) => toast.success(`🏆 ${c}`));
      }

      setModalOpen(false);
      setForm({ weight: "", bodyFat: "", muscleMass: "", waist: "", chest: "", hips: "", notes: "" });

      // Recarregar
      const m = await fetch("/api/medidas?limit=30").then((r) => r.json());
      setMedidas(Array.isArray(m) ? m : []);
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const ultimaMedida = medidas[0];
  const imc = ultimaMedida && profile.height
    ? calcularIMC(ultimaMedida.weight, profile.height)
    : null;
  const imcInfo = imc ? classificarIMC(imc) : null;

  // Dados para gráficos (ordem crescente)
  const chartData = [...medidas].reverse().map((m) => ({
    date: format(new Date(m.date), "dd/MM"),
    peso: m.weight,
    gordura: m.bodyFat,
    cintura: m.waist,
  }));

  if (loading) return <div className="p-6 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Progresso</h1>
        <Button onClick={() => setModalOpen(true)}>
          + Registrar
        </Button>
      </div>

      {/* Stats atuais */}
      {ultimaMedida && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="text-xl font-bold">{ultimaMedida.weight} kg</div>
              <div className="text-xs text-muted-foreground">Peso atual</div>
              {medidas.length >= 2 && (
                <div className={`text-xs mt-1 ${ultimaMedida.weight < medidas[1].weight ? "text-green-400" : "text-red-400"}`}>
                  {(ultimaMedida.weight - medidas[1].weight) > 0 ? "+" : ""}
                  {(ultimaMedida.weight - medidas[1].weight).toFixed(1)} kg
                </div>
              )}
            </CardContent>
          </Card>

          {imc && (
            <Card className="border-border/50">
              <CardContent className="pt-4 pb-4">
                <div className="text-xl font-bold">{imc.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">IMC</div>
                {imcInfo && <div className={`text-xs mt-1 ${imcInfo.color}`}>{imcInfo.label}</div>}
              </CardContent>
            </Card>
          )}

          {ultimaMedida.bodyFat && (
            <Card className="border-border/50">
              <CardContent className="pt-4 pb-4">
                <div className="text-xl font-bold">{ultimaMedida.bodyFat}%</div>
                <div className="text-xs text-muted-foreground">Gordura corporal</div>
                {medidas.length >= 2 && medidas[1].bodyFat && (
                  <div className={`text-xs mt-1 ${ultimaMedida.bodyFat < medidas[1].bodyFat ? "text-green-400" : "text-red-400"}`}>
                    {(ultimaMedida.bodyFat - medidas[1].bodyFat) > 0 ? "+" : ""}
                    {(ultimaMedida.bodyFat - medidas[1].bodyFat).toFixed(1)}%
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {ultimaMedida.waist && (
            <Card className="border-border/50">
              <CardContent className="pt-4 pb-4">
                <div className="text-xl font-bold">{ultimaMedida.waist} cm</div>
                <div className="text-xs text-muted-foreground">Cintura</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Gráficos */}
      {chartData.length >= 2 && (
        <Tabs defaultValue="peso">
          <TabsList>
            <TabsTrigger value="peso">Peso</TabsTrigger>
            <TabsTrigger value="gordura">Gordura</TabsTrigger>
            <TabsTrigger value="cintura">Cintura</TabsTrigger>
          </TabsList>

          <TabsContent value="peso">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">⚖️ Evolução do Peso</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(v) => [`${Number(v ?? 0).toFixed(1)} kg`, "Peso"]}
                    />
                    <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gordura">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">🔥 % de Gordura Corporal</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.some((d) => d.gordura) ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#6b7280" }} width={40} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, "Gordura"]}
                      />
                      <Line type="monotone" dataKey="gordura" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Registre o % de gordura para ver o gráfico
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cintura">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">📏 Medida da Cintura</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.some((d) => d.cintura) ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#6b7280" }} width={40} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        formatter={(v) => [`${Number(v ?? 0).toFixed(1)} cm`, "Cintura"]}
                      />
                      <Line type="monotone" dataKey="cintura" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Registre a medida da cintura para ver o gráfico
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Histórico */}
      <div>
        <h2 className="text-lg font-semibold mb-3">📋 Histórico</h2>
        {medidas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-2">📊</div>
            <p>Nenhuma medida registrada</p>
            <p className="text-sm mt-1">Clique em "Registrar" para começar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {medidas.map((m, idx) => (
              <Card key={m.id} className="border-border/50">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{m.weight} kg</span>
                        {idx > 0 && (
                          <span className={`text-xs ${m.weight < medidas[idx - 1].weight ? "text-green-400" : "text-red-400"}`}>
                            {(m.weight - medidas[idx - 1].weight) > 0 ? "+" : ""}
                            {(m.weight - medidas[idx - 1].weight).toFixed(1)} kg
                          </span>
                        )}
                        {idx === 0 && <Badge variant="outline" className="text-xs">Atual</Badge>}
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        {m.bodyFat && <span>Gordura: {m.bodyFat}%</span>}
                        {m.waist && <span>Cintura: {m.waist}cm</span>}
                        {m.muscleMass && <span>Massa: {m.muscleMass}%</span>}
                      </div>
                      {m.notes && <p className="text-xs text-muted-foreground mt-1 italic">{m.notes}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(m.date), "d MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📊 Registrar Medidas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Peso (kg) *</Label>
                <Input type="number" step="0.1" placeholder="82.5" value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Gordura (%)</Label>
                <Input type="number" step="0.1" placeholder="13" value={form.bodyFat}
                  onChange={(e) => setForm((f) => ({ ...f, bodyFat: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Massa muscular (%)</Label>
                <Input type="number" step="0.1" placeholder="40" value={form.muscleMass}
                  onChange={(e) => setForm((f) => ({ ...f, muscleMass: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Cintura (cm)</Label>
                <Input type="number" step="0.5" placeholder="85" value={form.waist}
                  onChange={(e) => setForm((f) => ({ ...f, waist: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Peitoral (cm)</Label>
                <Input type="number" step="0.5" placeholder="100" value={form.chest}
                  onChange={(e) => setForm((f) => ({ ...f, chest: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Quadril (cm)</Label>
                <Input type="number" step="0.5" placeholder="95" value={form.hips}
                  onChange={(e) => setForm((f) => ({ ...f, hips: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Input placeholder="Como está se sentindo?" value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <Button onClick={salvarMedida} disabled={saving} className="w-full">
              {saving ? "Salvando..." : "✅ Salvar +10 XP"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
