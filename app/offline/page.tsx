import { WifiOff } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <WifiOff className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Sem conexão</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Você está offline. Verifique sua conexão e tente novamente.
      </p>
      <ButtonLink href="/dashboard" variant="outline">
        Tentar novamente
      </ButtonLink>
    </div>
  );
}
