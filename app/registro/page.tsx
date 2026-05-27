"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sword, UserPlus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { type Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "pt", flag: "🇧🇷", label: "Português" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "nl", flag: "🇳🇱", label: "Nederlands" },
];

export default function RegistroPage() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error(t("register.error_mismatch"));
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          language: lang,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("register.error_generic"));
        return;
      }

      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        toast.success(t("register.welcome"));
        router.push("/onboarding");
      }
    } catch {
      toast.error(t("register.error_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
            <Sword className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">GymQuest</h1>
          <p className="text-muted-foreground text-sm">{t("register.tagline")}</p>
        </div>

        {/* Language selector */}
        <div className="mb-5">
          <p className="text-xs text-muted-foreground text-center mb-2">{t("lang.choose")}</p>
          <div className="flex gap-2 justify-center">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                  lang === l.code
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("register.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("common.name")}</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("common.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("common.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("register.password_min")}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">{t("register.confirm_password")}</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder={t("register.repeat_password")}
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-1.5" disabled={loading}>
                {loading
                  ? t("register.submitting")
                  : <><UserPlus className="w-4 h-4" /> {t("register.submit")}</>}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {t("register.has_account")}{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t("register.login")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
