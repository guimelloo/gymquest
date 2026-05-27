"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import Link from "next/link";
import { calcularNivel, getTitulo, calcularDiasRestantes } from "@/lib/gamification";
import { calcularProgresso } from "@/lib/calculations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WaterTracker } from "@/components/water-tracker";
import { WeightMiniChart } from "@/components/weight-mini-chart";

interface DashboardData {
  user: {
    name: string;
    xp: number;
    level: number;
    streak: number;
    totalWorkouts: number;
    waterGoal: number;
    height: number | null;
    achievements: Array<{
      earnedAt: string;
      achievement: { name: string; icon: string; rarity: string };
    }>;
    levelInfo: {
      nivel: number;
      xpAtual: number;
      xpProximoNivel: number;
      progresso: number;
    };
  };
  ultimaMedida: { weight: number; bodyFat: number | null; date: string } | null;
  logHoje: { waterMl: number; mood: string | null } | null;
  totalCalorias: number;
  totalProteina: number;
  refeicoesCount: number;
  treinosRecentes: Array<{ id: string; date: string; duration: number | null; xpEarned: number; plan: { name: string } | null }>;
  metasAtivas: Array<{
    id: string;
    title: string;
    type: string;
    targetValue: number | null;
    currentValue: number | null;
    startValue: number | null;
    unit: string | null;
    deadline: string | null;
    status: string;
  }>;
  ultimosPesos: Array<{ weight: number; date: string }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return null;

  const { user, ultimaMedida, logHoje, totalCalorias, totalProteina, refeicoesCount, treinosRecentes, metasAtivas, ultimosPesos } = data;
  const { levelInfo } = user;
  const titulo = getTitulo(levelInfo.nivel);

  const saudacao = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header / Player Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl flex-shrink-0">
                {levelInfo.nivel >= 30 ? "👑" : levelInfo.nivel >= 20 ? "🌟" : levelInfo.nivel >= 10 ? "⚔️" : "🛡️"}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{saudacao()},</p>
                <h1 className="text-xl font-bold">{user.name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs text-primary border-primary/50">
                    Nível {levelInfo.nivel} • {titulo}
                  </Badge>
                  {user.streak > 0 && (
                    <Badge variant="outline" className="text-xs text-orange-400 border-orange-400/50">
                      🔥 {user.streak} dias
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="text-muted-foreground">XP Total</div>
              <div className="font-bold text-primary text-lg">{user.xp.toLocaleString()}</div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{levelInfo.xpAtual} / {levelInfo.xpProximoNivel} XP</span>
              <span>Nível {levelInfo.nivel + 1}</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000"
                style={{ width: `${levelInfo.progresso}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon="⚖️"
          label="Peso Atual"
          value={ultimaMedida ? `${ultimaMedida.weight} kg` : "—"}
          sub={ultimaMedida?.bodyFat ? `${ultimaMedida.bodyFat}% gordura` : undefined}
        />
        <StatCard
          icon="🔥"
          label="Calorias Hoje"
          value={totalCalorias > 0 ? `${totalCalorias} kcal` : "—"}
          sub={`${refeicoesCount} refeição${refeicoesCount !== 1 ? "ões" : ""}`}
        />
        <StatCard
          icon="💪"
          label="Treinos Total"
          value={user.totalWorkouts.toString()}
          sub="treinos completos"
        />
        <StatCard
          icon="🥇"
          label="Proteína Hoje"
          value={totalProteina > 0 ? `${totalProteina}g` : "—"}
          sub="proteína consumida"
        />
      </div>

      {/* Água e Peso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WaterTracker
          waterMl={logHoje?.waterMl || 0}
          waterGoal={user.waterGoal}
          onUpdate={(ml) => {
            fetch("/api/diario", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ waterMl: ml }),
            });
          }}
        />

        {ultimosPesos.length > 0 && (
          <WeightMiniChart data={ultimosPesos} />
        )}
      </div>

      {/* Metas Ativas */}
      {metasAtivas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">🎯 Missões Ativas</h2>
            <Link href="/metas" className="text-sm text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {metasAtivas.map((meta) => {
              const progresso = meta.startValue !== null && meta.targetValue !== null && meta.currentValue !== null
                ? calcularProgresso(meta.startValue, meta.currentValue, meta.targetValue)
                : 0;
              const diasRestantes = meta.deadline ? calcularDiasRestantes(new Date(meta.deadline)) : null;

              return (
                <Card key={meta.id} className="border-border/50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{meta.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {meta.currentValue !== null ? `${meta.currentValue}${meta.unit}` : "—"} → {meta.targetValue}{meta.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        {diasRestantes !== null && (
                          <Badge variant="outline" className={`text-xs ${diasRestantes <= 7 ? "text-red-400 border-red-400/50" : "text-muted-foreground"}`}>
                            {diasRestantes === 0 ? "Vence hoje!" : `${diasRestantes}d`}
                          </Badge>
                        )}
                        <div className="text-xs font-bold text-primary mt-1">{Math.round(progresso)}%</div>
                      </div>
                    </div>
                    <Progress value={progresso} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Ações rápidas */}
      <div>
        <h2 className="text-lg font-semibold mb-3">⚡ Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/progresso", icon: "⚖️", label: "Registrar Peso" },
            { href: "/alimentos", icon: "🥗", label: "Registrar Refeição" },
            { href: "/treino", icon: "💪", label: "Iniciar Treino" },
            { href: "/metas", icon: "🎯", label: "Nova Meta" },
          ].map((a) => (
            <ButtonLink key={a.href} href={a.href} variant="outline" className="h-16 flex-col gap-1 text-xs justify-center">
              <span className="text-xl">{a.icon}</span>
              {a.label}
            </ButtonLink>
          ))}
        </div>
      </div>

      {/* Treinos recentes */}
      {treinosRecentes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">🏋️ Treinos Recentes</h2>
            <Link href="/treino" className="text-sm text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {treinosRecentes.slice(0, 3).map((log) => (
              <Card key={log.id} className="border-border/50">
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{log.plan?.name || "Treino livre"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.date), "d MMM", { locale: ptBR })}
                      {log.duration ? ` • ${log.duration} min` : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/50">
                    +{log.xpEarned} XP
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Conquistas recentes */}
      {user.achievements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">🏆 Conquistas Recentes</h2>
            <Link href="/perfil" className="text-sm text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="flex gap-3 flex-wrap">
            {user.achievements.map((ua) => (
              <div key={ua.achievement.name} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-sm">
                <span className="text-xl">{ua.achievement.icon}</span>
                <div>
                  <p className="font-medium text-xs">{ua.achievement.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(ua.earnedAt), "d MMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <Card className="border-border/50 stat-card">
      <CardContent className="pt-4 pb-4">
        <div className="text-xl mb-1">{icon}</div>
        <div className="text-lg font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground/70 mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-32 bg-card rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-card rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 bg-card rounded-xl" />
        <div className="h-48 bg-card rounded-xl" />
      </div>
    </div>
  );
}
