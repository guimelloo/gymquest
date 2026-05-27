"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import Link from "next/link";
import Image from "next/image";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  Scale, BarChart2, Ruler, TrendingUp, TrendingDown,
  ClipboardList, Plus, CheckCircle2, Dumbbell, Sparkles,
  ChevronRight, Camera, X, ImageIcon,
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
  photo: string | null;
}

interface UserProfile {
  height: number | null;
  gender: string | null;
}

// ── Compress image client-side before storing ─────────────────────────────────
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX_W = 720, MAX_H = 960;
      let w = img.width, h = img.height;
      if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
      if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H; }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ProgressoPage() {
  const { t } = useLanguage();
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ height: null, gender: null });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null); // lightbox
  const [showCharts, setShowCharts] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    weight: "", bodyFat: "", muscleMass: "",
    waist: "", chest: "", hips: "", notes: "",
  });

  const loadMedidas = useCallback(async () => {
    const [m, p] = await Promise.all([
      fetch("/api/medidas?limit=30&photos=true").then((r) => r.json()),
      fetch("/api/user/profile").then((r) => r.json()),
    ]);
    setMedidas(Array.isArray(m) ? m : []);
    setProfile({ height: p.height, gender: p.gender });
  }, []);

  useEffect(() => {
    loadMedidas().finally(() => setLoading(false));
  }, [loadMedidas]);

  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error(t("progress.invalid_photo")); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error(t("progress.photo_too_large")); return; }
    try {
      const compressed = await compressImage(file);
      setPhotoPreview(compressed);
    } catch {
      toast.error(t("progress.photo_error"));
    }
    e.target.value = "";
  };

  const salvarMedida = async () => {
    if (!form.weight) { toast.error(t("progress.error_weight")); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        weight: parseFloat(form.weight),
        ...(form.bodyFat   && { bodyFat:    parseFloat(form.bodyFat) }),
        ...(form.muscleMass && { muscleMass: parseFloat(form.muscleMass) }),
        ...(form.waist     && { waist:      parseFloat(form.waist) }),
        ...(form.chest     && { chest:      parseFloat(form.chest) }),
        ...(form.hips      && { hips:       parseFloat(form.hips) }),
        ...(form.notes     && { notes:      form.notes }),
        ...(photoPreview   && { photo:      photoPreview }),
      };

      const res = await fetch("/api/medidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      setPhotoPreview(null);
      await loadMedidas();
    } catch {
      toast.error(t("progress.error_save"));
    } finally {
      setSaving(false);
    }
  };

  const ultimaMedida = medidas[0];
  const imc = ultimaMedida && profile.height
    ? calcularIMC(ultimaMedida.weight, profile.height) : null;
  const imcInfo = imc ? classificarIMC(imc) : null;

  // Navy Method body fat estimate (waist + height only — simplified, no neck required)
  const navyFat = (() => {
    if (!ultimaMedida?.waist || !profile.height) return null;
    const val = 86.01 * Math.log10(ultimaMedida.waist) - 70.041 * Math.log10(profile.height) + 36.76;
    return Math.max(3, Math.min(60, Math.round(val * 10) / 10));
  })();
  const navyLean = navyFat && ultimaMedida
    ? Math.round((ultimaMedida.weight * (1 - navyFat / 100)) * 10) / 10 : null;

  // Chart data (oldest → newest)
  const chartData = [...medidas].reverse().map((m) => ({
    date: format(new Date(m.date), "dd/MM"),
    peso:    m.weight,
    gordura: m.bodyFat,
    cintura: m.waist,
    musculo: m.muscleMass,
  }));

  if (loading) return <div className="p-6 text-center text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-primary" /> {t("progress.title")}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant={showCharts ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCharts((v) => !v)}
            className="gap-1.5"
          >
            <BarChart2 className="w-4 h-4" />
            {t("progress.view_charts")}
          </Button>
          <Button onClick={() => setModalOpen(true)} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> {t("progress.new_btn")}
          </Button>
        </div>
      </div>

      {/* ── Current stats ── */}
      {ultimaMedida && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Scale className="w-4 h-4 text-primary" />} label={t("progress.weight")}>
            <span className="text-xl font-bold">{ultimaMedida.weight} kg</span>
            {medidas.length >= 2 && (() => {
              const diff = ultimaMedida.weight - medidas[1].weight;
              return <TrendBadge diff={diff} unit="kg" />;
            })()}
          </StatCard>

          {imc && (
            <StatCard icon={<BarChart2 className="w-4 h-4 text-blue-400" />} label={t("progress.bmi")}>
              <span className="text-xl font-bold">{imc.toFixed(1)}</span>
              {imcInfo && <span className={`text-xs mt-0.5 ${imcInfo.color}`}>{imcInfo.label}</span>}
            </StatCard>
          )}

          {ultimaMedida.bodyFat && (
            <StatCard icon={<TrendingDown className="w-4 h-4 text-orange-400" />} label={t("common.fat")}>
              <span className="text-xl font-bold">{ultimaMedida.bodyFat}%</span>
              {medidas.length >= 2 && medidas[1].bodyFat && (() => {
                const diff = ultimaMedida.bodyFat! - medidas[1].bodyFat!;
                return <TrendBadge diff={diff} unit="%" />;
              })()}
            </StatCard>
          )}

          {ultimaMedida.waist && (
            <StatCard icon={<Ruler className="w-4 h-4 text-purple-400" />} label={t("progress.waist")}>
              <span className="text-xl font-bold">{ultimaMedida.waist} cm</span>
            </StatCard>
          )}
        </div>
      )}

      {/* ── Analyzer CTA ── */}
      <Link href="/analise">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 hover:border-primary/40 transition-colors cursor-pointer">
          <CardContent className="py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t("progress.analyzer_cta")}</p>
                  <p className="text-xs text-muted-foreground">{t("progress.analyzer_cta_sub")}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* ── Body composition estimate (Navy Method) ── */}
      {navyFat !== null && navyLean !== null && (
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold">{t("progress.navy_title")}</span>
              <span className="text-xs text-muted-foreground ml-auto">{t("progress.navy_method")}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/40 rounded-lg p-3">
                <div className="text-xl font-bold text-orange-400">{navyFat}%</div>
                <div className="text-xs text-muted-foreground">{t("progress.navy_fat")}</div>
              </div>
              <div className="bg-secondary/40 rounded-lg p-3">
                <div className="text-xl font-bold text-blue-400">{navyLean} kg</div>
                <div className="text-xs text-muted-foreground">{t("progress.navy_lean")}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Charts ── */}
      {showCharts && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> {t("progress.charts_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {chartData.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">{t("progress.no_records")}</p>
                <p className="text-xs mt-1">{t("progress.charts_hint")}</p>
                <Button onClick={() => setModalOpen(true)} variant="outline" size="sm" className="mt-4 gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> {t("progress.new_btn")}
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="peso">
                <TabsList className="grid grid-cols-4 w-full mb-2">
                  <TabsTrigger value="peso">{t("common.weight")}</TabsTrigger>
                  <TabsTrigger value="gordura">{t("common.fat")}</TabsTrigger>
                  <TabsTrigger value="cintura">{t("progress.waist")}</TabsTrigger>
                  <TabsTrigger value="musculo">{t("progress.chart_muscle")}</TabsTrigger>
                </TabsList>

                {/* Weight + Fat combined */}
                <TabsContent value="peso">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Scale className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-medium">{t("progress.weight_chart")}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <YAxis yAxisId="peso" domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#6b7280" }} width={40} />
                      {chartData.some((d) => d.gordura) && (
                        <YAxis yAxisId="gordura" orientation="right" domain={[0, 50]} tick={{ fontSize: 11, fill: "#6b7280" }} width={32} />
                      )}
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line yAxisId="peso" type="monotone" dataKey="peso" name={t("common.weight")} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      {chartData.some((d) => d.gordura) && (
                        <Line yAxisId="gordura" type="monotone" dataKey="gordura" name={`% ${t("common.fat")}`} stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                  {chartData.length === 1 && <p className="text-xs text-center text-muted-foreground mt-2">{t("progress.charts_need_more")}</p>}
                </TabsContent>

                {/* Body Fat */}
                <TabsContent value="gordura">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingDown className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-sm font-medium">% {t("common.fat")}</span>
                  </div>
                  {chartData.some((d) => d.gordura) ? (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#6b7280" }} width={40} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, t("common.fat")]} />
                          <Line type="monotone" dataKey="gordura" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                        </LineChart>
                      </ResponsiveContainer>
                      {chartData.length === 1 && <p className="text-xs text-center text-muted-foreground mt-2">{t("progress.charts_need_more")}</p>}
                    </>
                  ) : (
                    <EmptyChart label={t("progress.charts_add_fat")} icon={<TrendingDown className="w-8 h-8 opacity-20 text-orange-400" />} />
                  )}
                </TabsContent>

                {/* Waist */}
                <TabsContent value="cintura">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Ruler className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-sm font-medium">{t("progress.waist")}</span>
                  </div>
                  {chartData.some((d) => d.cintura) ? (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#6b7280" }} width={40} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(v) => [`${Number(v ?? 0).toFixed(1)} cm`, t("progress.waist")]} />
                          <Line type="monotone" dataKey="cintura" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                        </LineChart>
                      </ResponsiveContainer>
                      {chartData.length === 1 && <p className="text-xs text-center text-muted-foreground mt-2">{t("progress.charts_need_more")}</p>}
                    </>
                  ) : (
                    <EmptyChart label={t("progress.charts_add_waist")} icon={<Ruler className="w-8 h-8 opacity-20 text-purple-400" />} />
                  )}
                </TabsContent>

                {/* Muscle */}
                <TabsContent value="musculo">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Dumbbell className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm font-medium">{t("progress.chart_muscle")}</span>
                  </div>
                  {chartData.some((d) => d.musculo) ? (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#6b7280" }} width={40} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, t("progress.chart_muscle")]} />
                          <Line type="monotone" dataKey="musculo" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                        </LineChart>
                      </ResponsiveContainer>
                      {chartData.length === 1 && <p className="text-xs text-center text-muted-foreground mt-2">{t("progress.charts_need_more")}</p>}
                    </>
                  ) : (
                    <EmptyChart label={t("progress.charts_add_muscle")} icon={<Dumbbell className="w-8 h-8 opacity-20 text-blue-400" />} />
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Photo gallery strip ── */}
      {medidas.some((m) => m.photo) && (
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-muted-foreground" /> {t("progress.photos_title")}
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {medidas.filter((m) => m.photo).map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedPhoto(m.photo!)}
                className="relative shrink-0 w-20 h-28 rounded-xl overflow-hidden border border-border hover:border-primary/60 transition-colors"
              >
                <Image src={m.photo!} alt="" fill className="object-cover" unoptimized />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                  <span className="text-[10px] text-white">{format(new Date(m.date), "d/MM")}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── History ── */}
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">{m.weight} kg</span>
                        {idx > 0 && (() => {
                          const diff = m.weight - medidas[idx - 1].weight;
                          return <TrendBadge diff={diff} unit="kg" small />;
                        })()}
                        {idx === 0 && <Badge variant="outline" className="text-xs">{t("common.today_excl")}</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                        {m.bodyFat  && <span>{t("common.fat")}: {m.bodyFat}%</span>}
                        {m.waist    && <span>{t("progress.waist")}: {m.waist}cm</span>}
                        {m.muscleMass && <span>{t("progress.muscle_mass")}: {m.muscleMass}%</span>}
                      </div>
                      {m.notes && <p className="text-xs text-muted-foreground mt-1 italic truncate">{m.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {m.photo && (
                        <button
                          onClick={() => setSelectedPhoto(m.photo!)}
                          className="relative w-10 h-14 rounded-lg overflow-hidden border border-border hover:border-primary/60"
                        >
                          <Image src={m.photo} alt="" fill className="object-cover" unoptimized />
                        </button>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(m.date), "d MMM yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Measurement Modal ── */}
      <Dialog open={modalOpen} onOpenChange={(o) => { setModalOpen(o); if (!o) setPhotoPreview(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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

            {/* Photo upload */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> {t("progress.add_photo")} <span className="text-muted-foreground text-xs">({t("common.optional")})</span>
              </Label>
              {photoPreview ? (
                <div className="relative w-full aspect-[3/4] max-w-[200px] mx-auto rounded-xl overflow-hidden border border-border">
                  <Image src={photoPreview} alt="" fill className="object-cover" unoptimized />
                  <button
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl py-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 transition-colors text-sm"
                >
                  <Camera className="w-6 h-6" />
                  {t("progress.photo_tap")}
                  <span className="text-xs">{t("progress.photo_hint")}</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
            </div>

            <div className="space-y-1.5">
              <Label>{t("common.notes")}</Label>
              <Input placeholder={t("progress.notes_placeholder")} value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>

            <Button onClick={salvarMedida} disabled={saving} className="w-full gap-1.5">
              {saving ? t("common.saving") : <><CheckCircle2 className="w-4 h-4" /> {t("progress.save_btn")}</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Lightbox ── */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="relative max-w-sm w-full max-h-[85vh] aspect-[3/4]" onClick={(e) => e.stopPropagation()}>
            <Image src={selectedPhoto} alt="" fill className="object-contain rounded-xl" unoptimized />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────
function StatCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">{icon}</div>
        <div className="flex flex-col gap-0.5">{children}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
}

function TrendBadge({ diff, unit, small }: { diff: number; unit: string; small?: boolean }) {
  const cls = diff < 0 ? "text-green-400" : "text-red-400";
  return (
    <span className={`flex items-center gap-0.5 ${cls} ${small ? "text-xs" : "text-sm"}`}>
      {diff < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
      {diff > 0 ? "+" : ""}{diff.toFixed(1)}{unit}
    </span>
  );
}

function EmptyChart({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="text-center py-10 text-muted-foreground text-sm flex flex-col items-center gap-2">
      {icon}
      {label}
    </div>
  );
}
