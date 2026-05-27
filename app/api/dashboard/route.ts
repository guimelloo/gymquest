import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularNivel } from "@/lib/gamification";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Use client-supplied local date so timezone differences don't shift the day
  const { searchParams } = new URL(request.url);
  const today = searchParams.get("today") || new Date().toISOString().split("T")[0];

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
      // DailyLog uses @@unique([userId, date]) — exact match on the @db.Date midnight-UTC value
      prisma.dailyLog.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: new Date(today + "T00:00:00.000Z"),
          },
        },
      }),
      // MealEntry.date is @db.Date (stored at midnight UTC) — exact date match
      prisma.mealEntry.findMany({
        where: {
          userId: session.user.id,
          date: new Date(today + "T00:00:00.000Z"),
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
