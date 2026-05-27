// ============================================================
// Sistema de Gamificação
// ============================================================

export const XP_REWARDS = {
  LOG_PESO: 10,
  LOG_REFEICAO: 5,
  META_AGUA: 15,
  TREINO_COMPLETO: 25,
  STREAK_7_DIAS: 50,
  STREAK_30_DIAS: 150,
  META_CONCLUIDA: 200,
  ONBOARDING: 50,
  PRIMEIRO_TREINO: 100,
};

// XP necessário para cada nível
export function xpParaNivel(nivel: number): number {
  return Math.floor(100 * Math.pow(nivel, 1.8));
}

// XP total acumulado até o nível
export function xpTotalParaNivel(nivel: number): number {
  let total = 0;
  for (let i = 1; i < nivel; i++) {
    total += xpParaNivel(i);
  }
  return total;
}

// Calcula nível a partir do XP total
export function calcularNivel(xpTotal: number): {
  nivel: number;
  xpAtual: number;
  xpProximoNivel: number;
  progresso: number;
} {
  let nivel = 1;
  let xpAcumulado = 0;

  while (true) {
    const xpNecessario = xpParaNivel(nivel);
    if (xpAcumulado + xpNecessario > xpTotal) {
      return {
        nivel,
        xpAtual: xpTotal - xpAcumulado,
        xpProximoNivel: xpNecessario,
        progresso: ((xpTotal - xpAcumulado) / xpNecessario) * 100,
      };
    }
    xpAcumulado += xpNecessario;
    nivel++;
  }
}

// Título baseado no nível
export function getTitulo(nivel: number): string {
  if (nivel <= 5) return "Iniciante";
  if (nivel <= 10) return "Guerreiro";
  if (nivel <= 20) return "Atleta";
  if (nivel <= 30) return "Campeão";
  if (nivel <= 50) return "Mestre";
  return "Lenda";
}

// Cor do nível
export function getCorNivel(nivel: number): string {
  if (nivel <= 5) return "#9ca3af"; // cinza
  if (nivel <= 10) return "#22c55e"; // verde
  if (nivel <= 20) return "#3b82f6"; // azul
  if (nivel <= 30) return "#a855f7"; // roxo
  if (nivel <= 50) return "#f59e0b"; // ouro
  return "#ef4444"; // vermelho lendário
}

// Cor da raridade
export function getCorRaridade(raridade: string): string {
  const cores: Record<string, string> = {
    comum: "text-gray-400 border-gray-600",
    raro: "text-blue-400 border-blue-600",
    epico: "text-purple-400 border-purple-600",
    lendario: "text-yellow-400 border-yellow-600",
  };
  return cores[raridade] || cores.comum;
}

// Conquistas disponíveis
export const ACHIEVEMENTS = [
  {
    key: "primeiro_registro",
    name: "Primeiro Passo",
    description: "Registrou o primeiro peso",
    icon: "👟",
    xpReward: 50,
    rarity: "comum",
  },
  {
    key: "primeira_refeicao",
    name: "Nutrição Consciente",
    description: "Registrou a primeira refeição",
    icon: "🥗",
    xpReward: 50,
    rarity: "comum",
  },
  {
    key: "primeiro_treino",
    name: "Suor Garantido",
    description: "Completou o primeiro treino",
    icon: "💪",
    xpReward: 100,
    rarity: "comum",
  },
  {
    key: "meta_agua_7_dias",
    name: "Bem Hidratado",
    description: "Bateu a meta de água 7 dias seguidos",
    icon: "💧",
    xpReward: 150,
    rarity: "raro",
  },
  {
    key: "streak_7",
    name: "Semana Perfeita",
    description: "Manteve o check-in por 7 dias seguidos",
    icon: "🔥",
    xpReward: 200,
    rarity: "raro",
  },
  {
    key: "streak_30",
    name: "Mês Imbatível",
    description: "Manteve o check-in por 30 dias seguidos",
    icon: "⚡",
    xpReward: 500,
    rarity: "epico",
  },
  {
    key: "primeira_meta",
    name: "Objetivo Conquistado",
    description: "Concluiu a primeira meta",
    icon: "🏆",
    xpReward: 300,
    rarity: "raro",
  },
  {
    key: "10_treinos",
    name: "Dedicação",
    description: "Completou 10 treinos",
    icon: "🎯",
    xpReward: 200,
    rarity: "raro",
  },
  {
    key: "50_treinos",
    name: "Veterano",
    description: "Completou 50 treinos",
    icon: "🦁",
    xpReward: 500,
    rarity: "epico",
  },
  {
    key: "nivel_10",
    name: "Guerreiro Ascendente",
    description: "Atingiu o nível 10",
    icon: "⚔️",
    xpReward: 300,
    rarity: "raro",
  },
  {
    key: "nivel_20",
    name: "Atleta de Elite",
    description: "Atingiu o nível 20",
    icon: "🌟",
    xpReward: 600,
    rarity: "epico",
  },
  {
    key: "nivel_30",
    name: "Campeão da Academia",
    description: "Atingiu o nível 30",
    icon: "👑",
    xpReward: 1000,
    rarity: "lendario",
  },
];

// Mensagens motivacionais baseadas no progresso
export function getMensagemMotivacional(streak: number, nivel: number): string {
  if (streak === 0) return "Vamos começar hoje! 💪";
  if (streak < 3) return `${streak} dias seguidos! Continue assim! 🔥`;
  if (streak < 7) return `${streak} dias de consistência! Incrível! 🚀`;
  if (streak < 30) return `${streak} dias! Você é uma máquina! ⚡`;
  return `${streak} dias de lenda! Você é imparável! 👑`;
}

// Calcular dias restantes para uma meta
export function calcularDiasRestantes(deadline: Date): number {
  const hoje = new Date();
  const diff = deadline.getTime() - hoje.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Verificar se o usuário está "em dia" com uma meta
export function verificarRitmoMeta(
  diasRestantes: number,
  progressoPct: number
): "no_prazo" | "risco" | "atrasado" {
  if (progressoPct >= 100) return "no_prazo";

  // Calcular progresso esperado baseado no tempo
  // (simplificado - assume progresso linear)
  if (progressoPct >= 50 && diasRestantes > 7) return "no_prazo";
  if (progressoPct >= 25 && diasRestantes > 14) return "no_prazo";
  if (progressoPct < 10 && diasRestantes < 7) return "atrasado";
  return "risco";
}
