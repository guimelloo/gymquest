import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { addXP } from "@/lib/xp-service";

const refeicaoSchema = z.object({
  date: z.string().optional(),
  mealType: z.enum(["cafe", "almoco", "jantar", "lanche"]),
  foodName: z.string().min(1),
  foodId: z.string().optional(),
  quantity: z.number().min(1).max(5000),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  fiber: z.number().optional(),
});

/** Parse "YYYY-MM-DD" as midnight UTC — avoids timezone drift */
function parseDateUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

/** Days in the ISO week (Mon–Sun) that contains `anyDateStr` */
function getWeekDays(anyDateStr: string): string[] {
  const base = parseDateUTC(anyDateStr);
  const dow = base.getUTCDay(); // 0=Sun
  const monday = new Date(base);
  monday.setUTCDate(base.getUTCDate() - (dow === 0 ? 6 : dow - 1));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);

  /* ── Weekly summary ──────────────────────────────────────── */
  const weekParam = searchParams.get("week");
  if (weekParam) {
    const days = getWeekDays(weekParam);

    const allMeals = await prisma.mealEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: parseDateUTC(days[0]),
          lte: new Date(parseDateUTC(days[6]).getTime() + 86399999),
        },
      },
      select: { date: true, calories: true, protein: true, carbs: true, fat: true },
    });

    const summary: Record<string, { calories: number; protein: number; carbs: number; fat: number; count: number }> = {};
    days.forEach((d) => { summary[d] = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }; });

    allMeals.forEach((meal) => {
      // @db.Date comes back as midnight UTC — slice gives YYYY-MM-DD
      const key = meal.date.toISOString().slice(0, 10);
      if (summary[key]) {
        summary[key].calories += meal.calories ?? 0;
        summary[key].protein  += meal.protein  ?? 0;
        summary[key].carbs    += meal.carbs     ?? 0;
        summary[key].fat      += meal.fat       ?? 0;
        summary[key].count++;
      }
    });

    return NextResponse.json({ summary, days });
  }

  /* ── Single day ──────────────────────────────────────────── */
  const dateStr = searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const dayStart = parseDateUTC(dateStr);
  const dayEnd   = new Date(dayStart.getTime() + 86399999); // +23:59:59.999

  const refeicoes = await prisma.mealEntry.findMany({
    where: {
      userId: session.user.id,
      date: { gte: dayStart, lte: dayEnd },
    },
    orderBy: { createdAt: "asc" },
  });

  const totais = refeicoes.reduce(
    (acc, r) => ({
      calories: acc.calories + (r.calories ?? 0),
      protein:  acc.protein  + (r.protein  ?? 0),
      carbs:    acc.carbs    + (r.carbs    ?? 0),
      fat:      acc.fat      + (r.fat      ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return NextResponse.json({ refeicoes, totais });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = refeicaoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { date: dateStr, ...data } = parsed.data;
    const localDate = dateStr ?? new Date().toISOString().slice(0, 10);

    // Store at midnight UTC so @db.Date matches our query format
    const dateValue = parseDateUTC(localDate);

    const refeicao = await prisma.mealEntry.create({
      data: { userId: session.user.id, ...data, date: dateValue },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { totalMeals: { increment: 1 } },
    });

    const xpResult = await addXP(session.user.id, 5, "LOG_REFEICAO");
    return NextResponse.json({ refeicao, xp: xpResult });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  await prisma.mealEntry.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
