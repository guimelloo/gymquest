import { prisma } from "@/lib/prisma";
import { calcularNivel, ACHIEVEMENTS } from "@/lib/gamification";

export interface XPResult {
  xpGanho: number;
  xpTotal: number;
  levelAnterior: number;
  levelAtual: number;
  levelUp: boolean;
  conquistasDesbloqueadas: string[];
}

export async function addXP(
  userId: string,
  xpAmount: number,
  motivo: string
): Promise<XPResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, totalWorkouts: true, streak: true },
  });

  if (!user) throw new Error("Usuário não encontrado");

  const nivelAnterior = user.level;
  const novoXP = user.xp + xpAmount;
  const { nivel: novoNivel } = calcularNivel(novoXP);

  await prisma.user.update({
    where: { id: userId },
    data: { xp: novoXP, level: novoNivel },
  });

  // Verificar conquistas por nível
  const conquistasDesbloqueadas: string[] = [];

  if (novoNivel >= 10 && nivelAnterior < 10) {
    await desbloquearConquista(userId, "nivel_10", conquistasDesbloqueadas);
  }
  if (novoNivel >= 20 && nivelAnterior < 20) {
    await desbloquearConquista(userId, "nivel_20", conquistasDesbloqueadas);
  }
  if (novoNivel >= 30 && nivelAnterior < 30) {
    await desbloquearConquista(userId, "nivel_30", conquistasDesbloqueadas);
  }

  // Verificar conquistas específicas
  if (motivo === "PRIMEIRO_TREINO") {
    await desbloquearConquista(userId, "primeiro_treino", conquistasDesbloqueadas);
  }
  if (motivo === "LOG_PESO") {
    const count = await prisma.bodyMeasurement.count({ where: { userId } });
    if (count === 1) {
      await desbloquearConquista(userId, "primeiro_registro", conquistasDesbloqueadas);
    }
  }
  if (motivo === "LOG_REFEICAO") {
    const count = await prisma.mealEntry.count({ where: { userId } });
    if (count === 1) {
      await desbloquearConquista(userId, "primeira_refeicao", conquistasDesbloqueadas);
    }
  }
  if (motivo === "TREINO_COMPLETO") {
    const count = await prisma.workoutLog.count({ where: { userId } });
    if (count === 1) {
      await desbloquearConquista(userId, "primeiro_treino", conquistasDesbloqueadas);
    }
    if (count === 10) {
      await desbloquearConquista(userId, "10_treinos", conquistasDesbloqueadas);
    }
    if (count === 50) {
      await desbloquearConquista(userId, "50_treinos", conquistasDesbloqueadas);
    }
  }

  return {
    xpGanho: xpAmount,
    xpTotal: novoXP,
    levelAnterior: nivelAnterior,
    levelAtual: novoNivel,
    levelUp: novoNivel > nivelAnterior,
    conquistasDesbloqueadas,
  };
}

async function desbloquearConquista(
  userId: string,
  key: string,
  lista: string[]
): Promise<void> {
  const achievement = await prisma.achievement.findUnique({ where: { key } });
  if (!achievement) return;

  const existente = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });

  if (existente) return;

  await prisma.userAchievement.create({
    data: { userId, achievementId: achievement.id },
  });

  // Adicionar XP da conquista
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: achievement.xpReward } },
  });

  lista.push(`${achievement.icon} ${achievement.name}`);
}

// Atualizar streak diário
export async function atualizarStreak(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastCheckIn: true },
  });

  if (!user) return 0;

  const hoje = new Date();
  const ultimoCheckIn = user.lastCheckIn;

  let novoStreak = user.streak;

  if (!ultimoCheckIn) {
    novoStreak = 1;
  } else {
    const diffDias = Math.floor(
      (hoje.getTime() - ultimoCheckIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDias === 0) return user.streak; // já fez check-in hoje
    if (diffDias === 1) novoStreak = user.streak + 1;
    else novoStreak = 1; // quebrou a sequência
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streak: novoStreak, lastCheckIn: hoje },
  });

  return novoStreak;
}
