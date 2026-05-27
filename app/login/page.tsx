"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sword, LogIn } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { type Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const LANGS: { code: Lang; flag: string }[] = [
  { code: "pt", flag: "🇧🇷" },
  { code: "en", flag: "🇬🇧" },
  { code: "nl", flag: "🇳🇱" },
];

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t("login.error_credentials"));
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error(t("login.error_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
            <Sword className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">GymQuest</h1>
          <p className="text-muted-foreground text-sm">{t("login.tagline")}</p>
        </div>

        {/* Language quick-switch */}
        <div className="flex gap-2 justify-center mb-5">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={cn(
                "text-lg px-2 py-1 rounded-lg border transition-colors",
                lang === l.code
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              {l.flag}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("login.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-1.5" disabled={loading}>
                {loading
                  ? t("login.submitting")
                  : <><LogIn className="w-4 h-4" /> {t("login.submit")}</>}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {t("login.no_account")}{" "}
              <Link href="/registro" className="text-primary hover:underline font-medium">
                {t("login.create_account")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
