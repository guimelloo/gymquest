"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import Link from "next/link";
import {
  Scale, Flame, Dumbbell, Beef, Zap, Shield, Crown, Star,
  Trophy, Target, TrendingUp, TrendingDown, ChevronRight,
  UtensilsCrossed, BarChart2, CalendarDays,
} from "lucide-react";
import { calcularNivel, getTitulo, calcularDiasRestantes } from "@/lib/gamification";
import { calcularProgresso } from "@/lib/calculations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WaterTracker } from "@/components/water-tracker";
import { WeightMiniChart } from "@/components/weight-mini-chart";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";

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
    levelInfo: { nivel: number; xpAtual: number; xpProximoNivel: number; progresso: number };
  };
  ultimaMedida: { weight: number; bodyFat: number | null; date: string } | null;
  logHoje: { waterMl: number; mood: string | null } | null;
  totalCalorias: number;
  totalProteina: number;
  refeicoesCount: number;
  treinosRecentes: Array<{ id: string; date: string; duration: number | null; xpEarned: number; plan: { name: string } | null }>;
  metasAtivas: Array<{
    id: string; title: string; type: string;
    targetValue: number | null; currentValue: number | null; startValue: number | null;
    unit: string | null; deadline: string | null; status: string;
  }>;
  ultimosPesos: Array<{ weight: number; date: string }>;
}

function LevelIcon({ nivel }: { nivel: number }) {
  if (nivel >= 30) return <Crown className="w-6 h-6 text-yellow-400" />;
  if (nivel >= 20) return <Star className="w-6 h-6 text-purple-400" />;
  if (nivel >= 10) return <Shield className="w-6 h-6 text-blue-400" />;
  return <Shield className="w-6 h-6 text-gray-400" />;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Pass local date so the API uses the user's timezone, not UTC
    const d = new Date();
    const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    fetch(`/api/dashboard?today=${localToday}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error(t("dashboard.error_load")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return null;

  const { user, ultimaMedida, logHoje, totalCalorias, totalProteina, refeicoesCount, treinosRecentes, metasAtivas, ultimosPesos } = data;
  const { levelInfo } = user;

  const saudacao = () => {
    const h = new Date().getHours();
    if (h < 12) return t("dashboard.morning");
    if (h < 18) return t("dashboard.afternoon");
    return t("dashboard.evening");
  };

  const pesoAnterior = ultimosPesos.length >= 2 ? ultimosPesos[ultimosPesos.length - 2].weight : null;
  const pesoDiff = ultimaMedida && pesoAnterior ? ultimaMedida.weight - pesoAnterior : null;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">

      {/* ── Player Card ── */}
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-secondary/10">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <LevelIcon nivel={levelInfo.nivel} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{saudacao()},</p>
                <h1 className="text-lg font-bold leading-tight">{user.name}</h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <Badge variant="outline" className="text-xs text-primary border-primary/40 py-0">
                    Nível {levelInfo.nivel} · {getTitulo(levelInfo.nivel)}
                  </Badge>
                  {user.streak > 0 && (
                    <Badge variant="outline" className="text-xs text-orange-400 border-orange-400/40 py-0 gap-1">
                      <Flame className="w-3 h-3" />{user.streak} dias
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-muted-foreground">{t("dashboard.xp_total")}</div>
              <div className="font-bold text-primary text-xl leading-tight">{user.xp.toLocaleString()}</div>
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-0.5">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>{levelInfo.xpAtual}/{levelInfo.xpProximoNivel}</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" /> {t("dashboard.next_level")}
              </span>
              <span>{Math.round(levelInfo.progresso)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${levelInfo.progresso}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Scale className="w-4 h-4 text-primary" />}
          label={t("dashboard.current_weight")}
          value={ultimaMedida ? `${ultimaMedida.weight} kg` : "—"}
          trend={pesoDiff}
          trendUnit="kg"
        />
        <StatCard
          icon={<Flame className="w-4 h-4 text-orange-400" />}
          label={t("common.calories")}
          value={totalCalorias > 0 ? `${totalCalorias}` : "—"}
          sub={totalCalorias > 0 ? t("dashboard.kcal_today") : `${refeicoesCount} ${t("dashboard.meals")}`}
        />
        <StatCard
          icon={<Dumbbell className="w-4 h-4 text-blue-400" />}
          label={t("common.workouts")}
          value={user.totalWorkouts.toString()}
          sub={t("dashboard.total_workouts")}
        />
        <StatCard
          icon={<Beef className="w-4 h-4 text-rose-400" />}
          label={t("common.protein")}
          value={totalProteina > 0 ? `${totalProteina}g` : "—"}
          sub={t("dashboard.protein_today")}
        />
      </div>

      {/* ── Água + Gráfico ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WaterTracker
          waterMl={logHoje?.waterMl || 0}
          waterGoal={user.waterGoal}
          onUpdate={() => {}}
        />
        {ultimosPesos.length >= 2 && <WeightMiniChart data={ultimosPesos} />}
      </div>

      {/* ── Metas ativas ── */}
      {metasAtivas.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> {t("dashboard.active_missions")}
            </h2>
            <Link href="/metas" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              {t("common.see_all")} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {metasAtivas.map((meta) => {
              const progresso =
                meta.startValue !== null && meta.targetValue !== null && meta.currentValue !== null
                  ? calcularProgresso(meta.startValue, meta.currentValue, meta.targetValue)
                  : 0;
              const dias = meta.deadline ? calcularDiasRestantes(new Date(meta.deadline)) : null;

              return (
                <Card key={meta.id} className="border-border/40">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex justify-between items-start mb-2 gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{meta.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {meta.currentValue ?? "—"}{meta.unit} → {meta.targetValue}{meta.unit}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {dias !== null && (
                          <div className={`text-xs ${dias <= 7 ? "text-red-400" : "text-muted-foreground"}`}>
                            {dias === 0 ? t("common.today_excl") : `${dias}d`}
                          </div>
                        )}
                        <div className="text-sm font-bold text-primary">{Math.round(progresso)}%</div>
                      </div>
                    </div>
                    <Progress value={progresso} className="h-1.5" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Ações rápidas ── */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" /> {t("dashboard.quick_actions")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/progresso", Icon: Scale,          label: t("dashboard.action_weight") },
            { href: "/alimentos", Icon: UtensilsCrossed, label: t("dashboard.action_meal") },
            { href: "/treino",    Icon: Dumbbell,        label: t("dashboard.action_workout") },
            { href: "/metas",     Icon: Target,          label: t("dashboard.action_goal") },
          ].map(({ href, Icon, label }) => (
            <ButtonLink
              key={href}
              href={href}
              variant="outline"
              className="h-16 flex-col gap-1.5 text-xs justify-center"
            >
              <Icon className="w-5 h-5" />
              {label}
            </ButtonLink>
          ))}
        </div>
      </section>

      {/* ── Treinos recentes ── */}
      {treinosRecentes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-blue-400" /> {t("dashboard.recent_workouts")}
            </h2>
            <Link href="/treino" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              {t("common.see_all")} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {treinosRecentes.slice(0, 3).map((log) => (
              <Card key={log.id} className="border-border/40">
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{log.plan?.name || "Treino livre"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {format(new Date(log.date), "d MMM", { locale: ptBR })}
                      {log.duration ? ` · ${log.duration} min` : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/40 gap-1">
                    <Zap className="w-3 h-3" />+{log.xpEarned}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── Conquistas recentes ── */}
      {user.achievements.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" /> {t("dashboard.recent_achievements")}
            </h2>
            <Link href="/perfil" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              {t("common.see_all")} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-2 flex-wrap">
            {user.achievements.map((ua) => (
              <div
                key={ua.achievement.name}
                className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2"
              >
                <span className="text-lg">{ua.achievement.icon}</span>
                <div>
                  <p className="font-medium text-xs">{ua.achievement.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(ua.earnedAt), "d MMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, sub, trend, trendUnit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  trend?: number | null;
  trendUnit?: string;
}) {
  return (
    <Card className="border-border/40">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          {icon}
          {trend !== undefined && trend !== null && (
            <span className={`text-xs flex items-center gap-0.5 ${trend < 0 ? "text-green-400" : "text-red-400"}`}>
              {trend < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {Math.abs(trend).toFixed(1)}{trendUnit}
            </span>
          )}
        </div>
        <div className="text-xl font-bold text-foreground mt-1">{value}</div>
        <div className="text-xs text-muted-foreground">{sub || label}</div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 animate-pulse">
      <div className="h-36 bg-card rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-card rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-44 bg-card rounded-xl" />
        <div className="h-44 bg-card rounded-xl" />
      </div>
    </div>
  );
}
