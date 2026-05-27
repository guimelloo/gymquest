import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button-link";
import { Sword, BarChart2, UtensilsCrossed, Dumbbell, Trophy } from "lucide-react";

const FEATURES = [
  { Icon: BarChart2,      label: "IMC & Gordura Corporal" },
  { Icon: UtensilsCrossed, label: "Busca de Alimentos" },
  { Icon: Dumbbell,       label: "Planos de Treino" },
  { Icon: Trophy,         label: "Sistema de Conquistas" },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Sword className="w-8 h-8 text-primary" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-foreground">GymQuest</h1>
            <p className="text-muted-foreground text-sm">Seu Fitness Gamificado</p>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
          Transforme seu treino em uma{" "}
          <span className="text-primary">jornada épica</span>
        </h2>

        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Registre seu progresso, defina metas, monitore alimentação e treinos.
          Ganhe XP, suba de nível e desbloqueie conquistas enquanto atinge seus objetivos fitness.
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 text-sm">
          {FEATURES.map(({ Icon, label }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="flex justify-center mb-2">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-muted-foreground text-xs">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <ButtonLink href="/registro" size="lg" className="font-semibold justify-center">
            Começar Gratuitamente
          </ButtonLink>
          <ButtonLink href="/login" variant="outline" size="lg" className="justify-center">
            Já tenho conta
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
