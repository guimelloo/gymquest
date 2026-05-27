"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { calcularNutrientes, type FoodItem } from "@/lib/food-api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  UtensilsCrossed, Coffee, Moon, Apple, Search, Loader2,
  Plus, X, Beef, Wheat, Droplets, Flame,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

/* ─── helpers ─────────────────────────────────────────────────── */

/** Returns today's date as "YYYY-MM-DD" in local time (no UTC drift) */
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Returns the 7 days of the ISO week (Mon → Sun) that contains dateStr */
function weekOf(dateStr: string): string[] {
  const [y, m, d] = dateStr.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  const dow = base.getUTCDay();
  const monday = new Date(base);
  monday.setUTCDate(base.getUTCDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setUTCDate(monday.getUTCDate() + i);
    return day.toISOString().slice(0, 10);
  });
}

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// Meal types – labels are resolved dynamically via t() in the render
const TIPO_REFEICAO_DEF = [
  { v: "cafe",   lKey: "food.breakfast" as const, Icon: Coffee },
  { v: "almoco", lKey: "food.lunch"     as const, Icon: UtensilsCrossed },
  { v: "jantar", lKey: "food.dinner"   as const, Icon: Moon },
  { v: "lanche", lKey: "food.snack"    as const, Icon: Apple },
] as const;

const CALORIAS_META = 2000;

interface MealEntry {
  id: string; foodName: string; mealType: string;
  quantity: number; calories: number | null; protein: number | null;
  carbs: number | null; fat: number | null;
}

type WeekSummary = Record<string, { calories: number; protein: number; carbs: number; fat: number; count: number }>;

/* ─── Component ──────────────────────────────────────────────── */

export default function AlimentosPage() {
  const today = localToday();
  const { t, ta } = useLanguage();

  const [selectedDate, setSelectedDate] = useState(today);
  const [weekDays, setWeekDays]         = useState<string[]>(() => weekOf(today));
  const [weekSummary, setWeekSummary]   = useState<WeekSummary>({});

  const [refeicoes, setRefeicoes] = useState<MealEntry[]>([]);
  const [totais, setTotais]       = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading]     = useState(true);

  // Search
  const [query, setQuery]             = useState("");
  const [resultados, setResultados]   = useState<FoodItem[]>([]);
  const [buscando, setBuscando]       = useState(false);

  // Modal
  const [modal, setModal]             = useState<FoodItem | null>(null);
  const [quantidade, setQuantidade]   = useState("100");
  const [tipoRefeicao, setTipoRefeicao] = useState("almoco");
  const [adicionando, setAdicionando] = useState(false);

  /* ── Fetch week summary ──────────────────────────────────── */
  const carregarSemana = useCallback(async (refDay: string) => {
    const days = weekOf(refDay);
    setWeekDays(days);
    try {
      const res = await fetch(`/api/refeicoes?week=${refDay}`);
      if (!res.ok) return;
      const data = await res.json();
      setWeekSummary(data.summary ?? {});
    } catch { /* silent */ }
  }, []);

  /* ── Fetch single day ────────────────────────────────────── */
  const carregarDia = useCallback(async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/refeicoes?date=${dateStr}`);
      if (!res.ok) return;
      const data = await res.json();
      setRefeicoes(data.refeicoes ?? []);
      setTotais(data.totais ?? { calories: 0, protein: 0, carbs: 0, fat: 0 });
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    carregarSemana(today);
    carregarDia(today);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When selected date changes
  useEffect(() => {
    carregarDia(selectedDate);
    // If the selected date is outside current week strip, recenter
    if (!weekDays.includes(selectedDate)) {
      carregarSemana(selectedDate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  /* ── Food search ─────────────────────────────────────────── */
  useEffect(() => {
    if (!query.trim()) { setResultados([]); return; }
    const t = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await fetch(`/api/alimentos?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResultados(data.items ?? []);
      } finally { setBuscando(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [query]);

  /* ── Add food ────────────────────────────────────────────── */
  const adicionarRefeicao = async () => {
    if (!modal) return;
    setAdicionando(true);
    const q = parseFloat(quantidade) || 100;
    const nutrientes = calcularNutrientes(modal, q);
    try {
      const res = await fetch("/api/refeicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          mealType: tipoRefeicao,
          foodName: modal.name,
          foodId: modal.id,
          quantity: q,
          ...nutrientes,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao adicionar"); return; }

      toast.success(`${modal.name} adicionado! +5 XP`);
      if (data.xp?.levelUp) toast.success(`Level Up! Nível ${data.xp.levelAtual}!`);

      setModal(null);
      setQuery("");
      setResultados([]);

      // Refresh both day and week totals
      await carregarDia(selectedDate);
      carregarSemana(selectedDate);
    } catch {
      toast.error("Erro ao adicionar");
    } finally {
      setAdicionando(false);
    }
  };

  /* ── Remove food ─────────────────────────────────────────── */
  const removerRefeicao = async (id: string) => {
    await fetch(`/api/refeicoes?id=${id}`, { method: "DELETE" });
    await carregarDia(selectedDate);
    carregarSemana(selectedDate);
  };

  const nutrientesModal = modal
    ? calcularNutrientes(modal, parseFloat(quantidade) || 100)
    : null;

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="max-w-3xl mx-auto pb-4">

      {/* ── Week strip ──────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-4 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {weekDays.map((day, i) => {
            const isToday   = day === today;
            const isSelected = day === selectedDate;
            const summary   = weekSummary[day];
            const kcal      = summary ? Math.round(summary.calories) : 0;
            const hasFood   = (summary?.count ?? 0) > 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={[
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 min-w-[52px] transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isToday
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-secondary",
                ].join(" ")}
              >
                <span className="text-[11px] font-medium">{DIAS_SEMANA[i]}</span>
                <span className="text-base font-bold leading-none">
                  {parseInt(day.split("-")[2])}
                </span>
                <span className={[
                  "text-[10px] leading-none",
                  isSelected ? "text-primary-foreground/80" : hasFood ? "text-primary" : "text-muted-foreground/50",
                ].join(" ")}>
                  {hasFood ? `${kcal}` : "·"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected day label */}
        <p className="text-xs text-muted-foreground mt-2 px-0.5">
          {selectedDate === today
            ? "Hoje"
            : format(new Date(selectedDate + "T12:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div className="p-4 space-y-5">

        {/* ── Macro summary ──────────────────────────────────── */}
        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" /> Calorias do dia
              </span>
              <span className="font-bold text-primary">
                {Math.round(totais.calories)}{" "}
                <span className="text-muted-foreground font-normal text-sm">/ {CALORIAS_META} kcal</span>
              </span>
            </div>
            <Progress value={Math.min(100, (totais.calories / CALORIAS_META) * 100)} className="h-2 mb-4" />
            <div className="grid grid-cols-3 gap-3 text-center">
              <MacroCard label="Proteína"     value={totais.protein} unit="g" color="text-blue-400"   Icon={Beef} />
              <MacroCard label="Carboidratos" value={totais.carbs}   unit="g" color="text-yellow-400" Icon={Wheat} />
              <MacroCard label="Gorduras"     value={totais.fat}     unit="g" color="text-red-400"    Icon={Droplets} />
            </div>
          </CardContent>
        </Card>

        {/* ── Search ─────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alimento... (ex: frango, arroz, banana)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-10"
            />
            {buscando && (
              <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>

          {resultados.length > 0 && (
            <div className="space-y-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-card">
              {resultados.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setModal(item); setQuantidade("100"); }}
                  className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border/50 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      {item.calories !== null
                        ? <span className="text-sm font-bold text-primary">{Math.round(item.calories)} kcal</span>
                        : <span className="text-xs text-muted-foreground">sem info</span>}
                      <p className="text-xs text-muted-foreground">por 100g</p>
                    </div>
                  </div>
                  {item.protein !== null && (
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span>P: {item.protein?.toFixed(1)}g</span>
                      <span>C: {item.carbs?.toFixed(1)}g</span>
                      <span>G: {item.fat?.toFixed(1)}g</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Meals list ─────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : refeicoes.length > 0 ? (
          <div className="space-y-4">
            {TIPO_REFEICAO_DEF.map((tipo) => {
              const items = refeicoes.filter((r) => r.mealType === tipo.v);
              if (items.length === 0) return null;
              const calsTipo = items.reduce((a, r) => a + (r.calories ?? 0), 0);

              return (
                <div key={tipo.v}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                      <tipo.Icon className="w-3.5 h-3.5" />
                      {t(tipo.lKey)}
                    </h3>
                    <span className="text-xs text-muted-foreground">{Math.round(calsTipo)} kcal</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <Card key={item.id} className="border-border/50">
                        <CardContent className="py-3 px-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{item.foodName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity}g
                              {item.calories ? ` · ${Math.round(item.calories)} kcal` : ""}
                              {item.protein  ? ` · P: ${item.protein.toFixed(1)}g` : ""}
                            </p>
                          </div>
                          <button
                            onClick={() => removerRefeicao(item.id)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !query && (
            <div className="text-center py-10 text-muted-foreground">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm">Nenhuma refeição registrada</p>
              <p className="text-xs mt-1 opacity-70">Busque um alimento acima para adicionar</p>
            </div>
          )
        )}

      </div>

      {/* ── Add food modal ──────────────────────────────────── */}
      <Dialog open={!!modal} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base truncate">{modal?.name}</DialogTitle>
          </DialogHeader>
          {modal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Quantidade (g)</Label>
                  <Input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Refeição</Label>
                  <Select value={tipoRefeicao} onValueChange={(v) => setTipoRefeicao(v ?? tipoRefeicao)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIPO_REFEICAO_DEF.map((mealType) => (
                        <SelectItem key={mealType.v} value={mealType.v}>{t(mealType.lKey)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {nutrientesModal && (
                <div className="bg-secondary/50 rounded-xl p-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Calorias</span>
                    <span className="font-bold text-primary">{nutrientesModal.calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proteína</span>
                    <span>{nutrientesModal.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carboidratos</span>
                    <span>{nutrientesModal.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gordura</span>
                    <span>{nutrientesModal.fat}g</span>
                  </div>
                </div>
              )}

              <Button onClick={adicionarRefeicao} disabled={adicionando} className="w-full gap-2">
                {adicionando
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Adicionando...</>
                  : <><Plus className="w-4 h-4" /> Adicionar Refeição +5 XP</>}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── MacroCard ──────────────────────────────────────────────── */
function MacroCard({ label, value, unit, color, Icon }: {
  label: string; value: number; unit: string; color: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-secondary/50 rounded-xl p-2.5">
      <div className={`text-lg font-bold ${color} flex items-center justify-center gap-1`}>
        <Icon className="w-4 h-4" />
        {Math.round(value)}{unit}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
