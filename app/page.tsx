import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button-link";

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
          <div className="text-5xl">⚔️</div>
          <div>
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
          {[
            { icon: "📊", label: "IMC & Gordura Corporal" },
            { icon: "🥗", label: "Busca de Alimentos" },
            { icon: "💪", label: "Planos de Treino" },
            { icon: "🏆", label: "Sistema de Conquistas" },
          ].map((f) => (
            <div key={f.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-muted-foreground text-xs">{f.label}</div>
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
