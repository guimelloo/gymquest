import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularNivel } from "@/lib/gamification";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  const [user, ultimaMedida, logHoje, refeicoesHoje, treinosRecentes, metasAtivas] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          xp: true,
          level: true,
          streak: true,
          totalWorkouts: true,
          waterGoal: true,
          height: true,
          achievements: {
            include: { achievement: true },
            orderBy: { earnedAt: "desc" },
            take: 3,
          },
        },
      }),
      prisma.bodyMeasurement.findFirst({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
      }),
      prisma.dailyLog.findFirst({
        where: {
          userId: session.user.id,
          date: {
            gte: new Date(today + "T00:00:00.000Z"),
            lt: new Date(today + "T23:59:59.999Z"),
          },
        },
      }),
      prisma.mealEntry.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: new Date(today + "T00:00:00.000Z"),
            lt: new Date(today + "T23:59:59.999Z"),
          },
        },
      }),
      prisma.workoutLog.findMany({
        where: { userId: session.user.id },
        include: { plan: { select: { name: true } } },
        orderBy: { date: "desc" },
        take: 5,
      }),
      prisma.goal.findMany({
        where: { userId: session.user.id, status: "active" },
        orderBy: { deadline: "asc" },
        take: 3,
      }),
    ]);

  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const levelInfo = calcularNivel(user.xp);

  const totalCalorias = refeicoesHoje.reduce((acc, r) => acc + (r.calories || 0), 0);
  const totalProteina = refeicoesHoje.reduce((acc, r) => acc + (r.protein || 0), 0);

  // Peso dos últimos 7 dias para mini-gráfico
  const ultimosPesos = await prisma.bodyMeasurement.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 7,
    select: { weight: true, date: true },
  });

  return NextResponse.json({
    user: { ...user, levelInfo },
    ultimaMedida,
    logHoje,
    totalCalorias: Math.round(totalCalorias),
    totalProteina: Math.round(totalProteina),
    refeicoesCount: refeicoesHoje.length,
    treinosRecentes,
    metasAtivas,
    ultimosPesos: ultimosPesos.reverse(),
  });
}
