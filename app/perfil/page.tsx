"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";
import { calcularNivel, getTitulo, getCorRaridade } from "@/lib/gamification";
import { calcularIMC, classificarIMC, calcularIdade } from "@/lib/calculations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Crown, Star, Shield, Flame, Zap, Trophy,
  UserCircle, Pencil, LogOut, Dumbbell,
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  height: number | null;
  birthDate: string | null;
  gender: string | null;
  xp: number;
  level: number;
  streak: number;
  totalWorkouts: number;
  waterGoal: number;
  createdAt: string;
  levelInfo: {
    nivel: number;
    xpAtual: number;
    xpProximoNivel: number;
    progresso: number;
  };
  achievements: Array<{
    earnedAt: string;
    achievement: {
      id: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
      xpReward: number;
    };
  }>;
}

function LevelIcon({ nivel }: { nivel: number }) {
  if (nivel >= 30) return <Crown className="w-8 h-8 text-yellow-400" />;
  if (nivel >= 20) return <Star className="w-8 h-8 text-purple-400" />;
  if (nivel >= 10) return <Shield className="w-8 h-8 text-blue-400" />;
  return <Shield className="w-8 h-8 text-gray-400" />;
}

const RARIDADE_INFO = (t: any): Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> => ({
  lendario: { label: t("profile.rarity_legendary"), Icon: Crown },
  epico:    { label: t("profile.rarity_epic"),     Icon: Star },
  raro:     { label: t("profile.rarity_rare"),     Icon: Shield },
  comum:    { label: t("profile.rarity_common"),   Icon: Trophy },
});

export default function PerfilPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    height: "",
    birthDate: "",
    gender: "male",
    waterGoal: "2500",
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          height: data.height?.toString() || "",
          birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
          gender: data.gender || "male",
          waterGoal: data.waterGoal?.toString() || "2500",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const salvarPerfil = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          height: form.height ? parseFloat(form.height) : undefined,
          birthDate: form.birthDate || undefined,
          gender: form.gender,
          waterGoal: parseInt(form.waterGoal) || 2500,
        }),
      });
      if (!res.ok) { toast.error(t("profile.error_save")); return; }

      toast.success(t("profile.saved"));
      setEditMode(false);

      const updated = await fetch("/api/user/profile").then((r) => r.json());
      setProfile(updated);
    } catch {
      toast.error(t("profile.error_save"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">{t("common.loading")}</div>;
  if (!profile) return null;

  const { levelInfo } = profile;
  const titulo = getTitulo(levelInfo.nivel);
  const idade = profile.birthDate ? calcularIdade(new Date(profile.birthDate)) : null;
  const membroDesde = format(new Date(profile.createdAt), "MMMM yyyy", { locale: ptBR });
  const raridades = ["lendario", "epico", "raro", "comum"];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <UserCircle className="w-6 h-6 text-primary" /> {t("profile.title")}
      </h1>

      {/* Player Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/20">
        <CardContent className="pt-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <LevelIcon nivel={levelInfo.nivel} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className="text-primary border-primary/50 text-xs">
                  {t("common.level")} {levelInfo.nivel} — {titulo}
                </Badge>
                {profile.streak > 0 && (
                  <Badge variant="outline" className="text-orange-400 border-orange-400/50 text-xs gap-1">
                    <Flame className="w-3 h-3" /> {profile.streak} {t("common.days")}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{profile.xp.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                <Zap className="w-3 h-3 text-yellow-400" /> {t("profile.xp_total")}
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{levelInfo.xpAtual} / {levelInfo.xpProximoNivel} {t("common.xp")}</span>
              <span>{t("profile.next_level", { n: levelInfo.nivel + 1 })}</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all"
                style={{ width: `${levelInfo.progresso}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold flex items-center justify-center gap-1">
                <Dumbbell className="w-4 h-4 text-blue-400" />
                {profile.totalWorkouts}
              </div>
              <div className="text-xs text-muted-foreground">{t("common.workouts")}</div>
            </div>
            <div className="text-center border-x border-border">
              <div className="text-lg font-bold flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-orange-400" />
                {profile.streak}
              </div>
              <div className="text-xs text-muted-foreground">{t("common.streak")}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                {profile.achievements.length}
              </div>
              <div className="text-xs text-muted-foreground">{t("profile.achievements_tab")}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="conquistas">
        <TabsList className="w-full">
          <TabsTrigger value="conquistas" className="flex-1 gap-1.5">
            <Trophy className="w-4 h-4" /> {t("profile.achievements_tab")}
          </TabsTrigger>
          <TabsTrigger value="dados" className="flex-1 gap-1.5">
            <UserCircle className="w-4 h-4" /> {t("profile.data_tab")}
          </TabsTrigger>
        </TabsList>

        {/* Conquistas */}
        <TabsContent value="conquistas" className="space-y-4 mt-4">
          {profile.achievements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t("profile.no_achievements")}</p>
              <p className="text-sm mt-1">{t("profile.no_achievements_hint")}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {t("profile.achievement_count", { n: profile.achievements.length, s: profile.achievements.length !== 1 ? "s" : "" })}
              </p>
              {raridades.map((raridade) => {
                const list = profile.achievements.filter((a) => a.achievement.rarity === raridade);
                if (list.length === 0) return null;
                const info = RARIDADE_INFO(t)[raridade];
                const RIcon = info?.Icon ?? Trophy;
                return (
                  <div key={raridade}>
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
                      <RIcon className="w-3.5 h-3.5" />
                      {info?.label ?? raridade}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {list.map((ua) => (
                        <Card key={ua.achievement.id} className={`border ${getCorRaridade(raridade)}`}>
                          <CardContent className="py-3 px-3 flex items-center gap-3">
                            <span className="text-2xl">{ua.achievement.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{ua.achievement.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{ua.achievement.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-yellow-400 flex items-center gap-0.5">
                                <Zap className="w-3 h-3" />+{ua.achievement.xpReward}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(ua.earnedAt), "d/MM", { locale: ptBR })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </TabsContent>

        {/* Dados pessoais */}
        <TabsContent value="dados" className="space-y-4 mt-4">
          {!editMode ? (
            <>
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <InfoRow label={t("common.name")}          value={profile.name} t={t} />
                  <InfoRow label={t("common.email")}         value={profile.email} t={t} />
                  {profile.height && <InfoRow label={t("profile.height")} value={`${profile.height} cm`} t={t} />}
                  {idade && <InfoRow label={t("profile.age")} value={`${idade}`} t={t} />}
                  {profile.gender && <InfoRow label={t("profile.sex")} value={profile.gender === "male" ? t("common.male") : t("common.female")} t={t} />}
                  <InfoRow label={t("profile.water_goal")}  value={`${profile.waterGoal} ml/dia`} t={t} />
                  <InfoRow label={t("profile.member_since")}  value={membroDesde} capitalize t={t} />
                </CardContent>
              </Card>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditMode(true)} className="flex-1 gap-1.5">
                  <Pencil className="w-4 h-4" /> {t("common.edit")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex-1 text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  <LogOut className="w-4 h-4" /> {t("profile.logout")}
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>{t("common.name")}</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.height")}</Label>
                  <Input type="number" value={form.height} onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.birth_date")}</Label>
                  <Input type="date" value={form.birthDate} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.sex")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: "male", l: t("common.male") }, { v: "female", l: t("common.female") }].map((g) => (
                      <button
                        key={g.v}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, gender: g.v }))}
                        className={`p-2 rounded-lg border text-sm transition-colors ${
                          form.gender === g.v ? "border-primary bg-primary/10 text-primary" : "border-border"
                        }`}
                      >
                        {g.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.water_goal")}</Label>
                  <Input type="number" value={form.waterGoal} onChange={(e) => setForm((f) => ({ ...f, waterGoal: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1">{t("common.cancel")}</Button>
                  <Button onClick={salvarPerfil} disabled={saving} className="flex-1">
                    {saving ? t("common.saving") : t("common.save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({ label, value, capitalize, t }: { label: string; value: string; capitalize?: boolean; t?: any }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${capitalize ? "capitalize" : ""}`}>{value}</span>
    </div>
  );
}
