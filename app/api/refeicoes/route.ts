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

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const refeicoes = await prisma.mealEntry.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: new Date(date + "T00:00:00.000Z"),
        lt: new Date(date + "T23:59:59.999Z"),
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Calcular totais
  const totais = refeicoes.reduce(
    (acc, r) => ({
      calories: acc.calories + (r.calories || 0),
      protein: acc.protein + (r.protein || 0),
      carbs: acc.carbs + (r.carbs || 0),
      fat: acc.fat + (r.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return NextResponse.json({ refeicoes, totais });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = refeicaoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { date, ...data } = parsed.data;
    const dateStr = date || new Date().toISOString().split("T")[0];

    const refeicao = await prisma.mealEntry.create({
      data: {
        userId: session.user.id,
        ...data,
        date: new Date(dateStr + "T12:00:00.000Z"),
      },
    });

    // Incrementar contador de refeições
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
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  await prisma.mealEntry.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
