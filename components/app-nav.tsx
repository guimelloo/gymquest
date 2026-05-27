"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  TrendingUp,
  Target,
  UserCircle,
  LogOut,
  Sword,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function AppNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { href: "/dashboard",  icon: LayoutDashboard, labelKey: "nav.home"     as const },
    { href: "/alimentos",  icon: UtensilsCrossed,  labelKey: "nav.food"     as const },
    { href: "/treino",     icon: Dumbbell,         labelKey: "nav.workout"  as const },
    { href: "/progresso",  icon: TrendingUp,       labelKey: "nav.progress" as const },
    { href: "/metas",      icon: Target,           labelKey: "nav.goals"    as const },
    { href: "/analise",    icon: Sparkles,         labelKey: "nav.analyze"  as const },
    { href: "/perfil",     icon: UserCircle,       labelKey: "nav.profile"  as const },
  ];

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <>
      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-card border-r border-border flex-col z-50">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sword className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">GymQuest</div>
              <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                {session?.user?.name}
              </div>
            </div>
          </Link>
        </div>

        {/* Links */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {/* ── Bottom nav mobile (PWA-friendly) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex justify-around px-1 pt-2 pb-2">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-1 rounded-xl transition-all duration-150 active:scale-90 min-w-[60px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  active ? "bg-primary/15" : "bg-transparent"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={cn(
                  "text-[11px] font-medium leading-none",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
