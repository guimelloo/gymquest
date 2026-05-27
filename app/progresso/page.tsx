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
import { useLanguage } from "@/lib/i18n/context";
import { calcularIMC, classificarIMC } from "@/lib/calculations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Scale, BarChart2, Ruler, TrendingUp, TrendingDown,
  ClipboardList, Plus, CheckCircle2,
} from "lucide-react";

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
  const { t } = useLanguage();
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
    if (!form.weight) { toast.error(t("progress.error_weight")); return; }
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

      toast.success(t("progress.saved"));
      if (data.xp?.levelUp) toast.success(t("workout.level_up", { n: data.xp.levelAtual }));
      if (data.xp?.conquistasDesbloqueadas?.length > 0) {
        data.xp.conquistasDesbloqueadas.forEach((c: string) => toast.success(c));
      }

      setModalOpen(false);
      setForm({ weight: "", bodyFat: "", muscleMass: "", waist: "", chest: "", hips: "", notes: "" });

      const m = await fetch("/api/medidas?limit=30").then((r) => r.json());
      setMedidas(Array.isArray(m) ? m : []);
    } catch {
      toast.error(t("progress.error_save"));
    } finally {
      setSaving(false);
    }
  };

  const ultimaMedida = medidas[0];
  const imc = ultimaMedida && profile.height
    ? calcularIMC(ultimaMedida.weight, profile.height)
    : null;
  const imcInfo = imc ? classificarIMC(imc) : null;

  const chartData = [...medidas].reverse().map((m) => ({
    date: format(new Date(m.date), "dd/MM"),
    peso: m.weight,
    gordura: m.bodyFat,
    cintura: m.waist,
  }));

  if (loading) return <div className="p-6 text-center text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-primary" />
          Progresso
        </h1>
        <Button onClick={() => setModalOpen(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Registrar
        </Button>
      </div>

      {/* Stats atuais */}
      {ultimaMedida && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border/50">
            <CardContent className="pt-4 pb-4">
              <Scale className="w-4 h-4 text-primary mb-1" />
              <div className="text-xl font-bold">{ultimaMedida.weight} kg</div>
              <div className="text-xs text-muted-foreground">{t("progress.weight")}</div>
              {medidas.length >= 2 && (() => {
                const diff = ultimaMedida.weight - medidas[1].weight;
                return (
                  <div className={`text-xs mt-1 flex items-center gap-0.5 ${diff < 0 ? "text-green-400" : "text-red-400"}`}>
                    {diff < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {imc && (
            <Card className="border-border/50">
              <CardContent className="pt-4 pb-4">
                <BarChart2 className="w-4 h-4 text-blue-400 mb-1" />
                <div className="text-xl font-bold">{imc.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">{t("progress.bmi")}</div>
                {imcInfo && <div className={`text-xs mt-1 ${imcInfo.color}`}>{imcInfo.label}</div>}
              </CardContent>
            </Card>
          )}

          {ultimaMedida.bodyFat && (
            <Card className="border-border/50">
              <CardContent className="pt-4 pb-4">
                <TrendingDown className="w-4 h-4 text-orange-400 mb-1" />
                <div className="text-xl font-bold">{ultimaMedida.bodyFat}%</div>
                <div className="text-xs text-muted-foreground">{t("common.fat")}</div>
                {medidas.length >= 2 && medidas[1].bodyFat && (() => {
                  const diff = ultimaMedida.bodyFat! - medidas[1].bodyFat!;
                  return (
                    <div className={`text-xs mt-1 flex items-center gap-0.5 ${diff < 0 ? "text-green-400" : "text-red-400"}`}>
                      {diff < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {ultimaMedida.waist && (
            <Card className="border-border/50">
              <CardContent className="pt-4 pb-4">
                <Ruler className="w-4 h-4 text-purple-400 mb-1" />
                <div className="text-xl font-bold">{ultimaMedida.waist} cm</div>
                <div className="text-xs text-muted-foreground">{t("progress.waist")}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Gráficos */}
      {chartData.length >= 2 && (
        <Tabs defaultValue="peso">
          <TabsList>
            <TabsTrigger value="peso">{t("common.weight")}</TabsTrigger>
            <TabsTrigger value="gordura">{t("common.fat")}</TabsTrigger>
            <TabsTrigger value="cintura">{t("progress.waist")}</TabsTrigger>
          </TabsList>

          <TabsContent value="peso">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" /> {t("progress.weight_chart")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#6b7280" }} width={40} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(v) => [`${Number(v ?? 0).toFixed(1)} ${t("common.kg")}`, t("common.weight")]}
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
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-orange-400" /> % {t("common.fat")}
                </CardTitle>
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
                        formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, t("common.fat")]}
                      />
                      <Line type="monotone" dataKey="gordura" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {t("progress.no_records_hint")}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cintura">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-purple-400" /> {t("progress.waist")}
                </CardTitle>
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
                        formatter={(v) => [`${Number(v ?? 0).toFixed(1)} ${t("common.cm")}`, t("progress.waist")]}
                      />
                      <Line type="monotone" dataKey="cintura" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {t("progress.no_records_hint")}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Histórico */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-muted-foreground" /> {t("progress.history")}
        </h2>
        {medidas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t("progress.no_records")}</p>
            <p className="text-sm mt-1">{t("progress.no_records_hint")}</p>
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
                        {idx > 0 && (() => {
                          const diff = m.weight - medidas[idx - 1].weight;
                          return (
                            <span className={`text-xs flex items-center gap-0.5 ${diff < 0 ? "text-green-400" : "text-red-400"}`}>
                              {diff < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                              {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg
                            </span>
                          );
                        })()}
                        {idx === 0 && <Badge variant="outline" className="text-xs">{t("common.today_excl")}</Badge>}
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
            <DialogTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" /> {t("progress.modal_title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("progress.weight")} *</Label>
                <Input type="number" step="0.1" placeholder="82.5" value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("progress.body_fat")}</Label>
                <Input type="number" step="0.1" placeholder="13" value={form.bodyFat}
                  onChange={(e) => setForm((f) => ({ ...f, bodyFat: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("progress.muscle_mass")}</Label>
                <Input type="number" step="0.1" placeholder="40" value={form.muscleMass}
                  onChange={(e) => setForm((f) => ({ ...f, muscleMass: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("progress.waist")}</Label>
                <Input type="number" step="0.5" placeholder="85" value={form.waist}
                  onChange={(e) => setForm((f) => ({ ...f, waist: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("progress.chest")}</Label>
                <Input type="number" step="0.5" placeholder="100" value={form.chest}
                  onChange={(e) => setForm((f) => ({ ...f, chest: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("progress.hips")}</Label>
                <Input type="number" step="0.5" placeholder="95" value={form.hips}
                  onChange={(e) => setForm((f) => ({ ...f, hips: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("common.notes")}</Label>
              <Input placeholder="Como está se sentindo?" value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <Button onClick={salvarMedida} disabled={saving} className="w-full gap-1.5">
              {saving ? t("common.saving") : <><CheckCircle2 className="w-4 h-4" /> {t("progress.save_btn")}</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
