"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { calcularNutrientes, type FoodItem } from "@/lib/food-api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TIPO_REFEICAO = [
  { v: "cafe", l: "☕ Café da manhã" },
  { v: "almoco", l: "🍽️ Almoço" },
  { v: "jantar", l: "🌙 Jantar" },
  { v: "lanche", l: "🍎 Lanche" },
];

interface MealEntry {
  id: string;
  foodName: string;
  mealType: string;
  quantity: number;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export default function AlimentosPage() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<FoodItem[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [refeicoes, setRefeicoes] = useState<MealEntry[]>([]);
  const [totais, setTotais] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Modal de adição
  const [modal, setModal] = useState<FoodItem | null>(null);
  const [quantidade, setQuantidade] = useState("100");
  const [tipoRefeicao, setTipoRefeicao] = useState("almoco");
  const [adicionando, setAdicionando] = useState(false);

  const carregarRefeicoes = useCallback(() => {
    fetch(`/api/refeicoes?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        setRefeicoes(d.refeicoes || []);
        setTotais(d.totais || { calories: 0, protein: 0, carbs: 0, fat: 0 });
      });
  }, [date]);

  useEffect(() => {
    carregarRefeicoes();
  }, [carregarRefeicoes]);

  useEffect(() => {
    if (!query.trim()) {
      setResultados([]);
      return;
    }
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await fetch(`/api/alimentos?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResultados(data.items || []);
      } finally {
        setBuscando(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

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
          date,
          mealType: tipoRefeicao,
          foodName: modal.name,
          foodId: modal.id,
          quantity: q,
          ...nutrientes,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      toast.success(`✅ ${modal.name} adicionado! +5 XP`);
      if (data.xp?.levelUp) toast.success(`🆙 Level Up! Nível ${data.xp.levelAtual}!`);

      setModal(null);
      setQuery("");
      setResultados([]);
      carregarRefeicoes();
    } catch {
      toast.error("Erro ao adicionar");
    } finally {
      setAdicionando(false);
    }
  };

  const removerRefeicao = async (id: string) => {
    await fetch(`/api/refeicoes?id=${id}`, { method: "DELETE" });
    carregarRefeicoes();
  };

  const nutrientesModal = modal ? calcularNutrientes(modal, parseFloat(quantidade) || 100) : null;

  const CALORIAS_META = 2000;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🥗 Alimentação</h1>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-40 text-sm"
        />
      </div>

      {/* Resumo do dia */}
      <Card className="border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Calorias do dia</span>
            <span className="font-bold text-primary">
              {Math.round(totais.calories)} <span className="text-muted-foreground font-normal">/ {CALORIAS_META} kcal</span>
            </span>
          </div>
          <Progress value={Math.min(100, (totais.calories / CALORIAS_META) * 100)} className="h-2 mb-4" />

          <div className="grid grid-cols-3 gap-3 text-center">
            <MacroCard label="Proteína" value={totais.protein} unit="g" color="text-blue-400" />
            <MacroCard label="Carboidratos" value={totais.carbs} unit="g" color="text-yellow-400" />
            <MacroCard label="Gorduras" value={totais.fat} unit="g" color="text-red-400" />
          </div>
        </CardContent>
      </Card>

      {/* Busca */}
      <div className="space-y-3">
        <div className="relative">
          <Input
            placeholder="🔍 Buscar alimento... (ex: frango, arroz, banana)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-10"
          />
          {buscando && (
            <div className="absolute right-3 top-2.5 text-muted-foreground text-sm animate-spin">⟳</div>
          )}
        </div>

        {resultados.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {resultados.map((item) => (
              <button
                key={item.id}
                onClick={() => { setModal(item); setQuantidade("100"); }}
                className="w-full text-left p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    {item.calories !== null ? (
                      <span className="text-sm font-bold text-primary">{Math.round(item.calories)} kcal</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">sem info</span>
                    )}
                    <p className="text-xs text-muted-foreground">por 100g</p>
                  </div>
                </div>
                {item.protein !== null && (
                  <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
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

      {/* Refeições do dia */}
      {refeicoes.length > 0 && (
        <div className="space-y-4">
          {TIPO_REFEICAO.map((tipo) => {
            const items = refeicoes.filter((r) => r.mealType === tipo.v);
            if (items.length === 0) return null;
            const calsTipo = items.reduce((a, r) => a + (r.calories || 0), 0);

            return (
              <div key={tipo.v}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">{tipo.l}</h3>
                  <span className="text-xs text-muted-foreground">{Math.round(calsTipo)} kcal</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <Card key={item.id} className="border-border/50">
                      <CardContent className="py-3 px-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.foodName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}g • {item.calories ? `${Math.round(item.calories)} kcal` : ""}
                            {item.protein ? ` • P: ${item.protein.toFixed(1)}g` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => removerRefeicao(item.id)}
                          className="text-muted-foreground hover:text-destructive text-xs p-1"
                        >
                          ✕
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {refeicoes.length === 0 && !query && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-2">🍽️</div>
          <p>Nenhuma refeição registrada hoje</p>
          <p className="text-sm mt-1">Busque um alimento acima para começar</p>
        </div>
      )}

      {/* Modal de adição */}
      <Dialog open={!!modal} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">{modal?.name}</DialogTitle>
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_REFEICAO.map((t) => (
                        <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {nutrientesModal && (
                <div className="bg-secondary/50 rounded-lg p-3 grid grid-cols-2 gap-2 text-sm">
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

              <Button onClick={adicionarRefeicao} disabled={adicionando} className="w-full">
                {adicionando ? "Adicionando..." : "Adicionar Refeição +5 XP"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MacroCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-2">
      <div className={`text-lg font-bold ${color}`}>{Math.round(value)}{unit}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
