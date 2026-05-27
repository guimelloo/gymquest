import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { addXP } from "@/lib/xp-service";

const logSchema = z.object({
  planId: z.string().optional(),
  duration: z.number().min(1).max(600).optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "30");

  const logs = await prisma.workoutLog.findMany({
    where: { userId: session.user.id },
    include: { plan: { select: { name: true } } },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = logSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const xpEarned = 25 + Math.floor((parsed.data.duration || 30) / 10);

    const log = await prisma.workoutLog.create({
      data: {
        userId: session.user.id,
        planId: parsed.data.planId,
        duration: parsed.data.duration,
        notes: parsed.data.notes,
        xpEarned,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { totalWorkouts: { increment: 1 } },
    });

    const xpResult = await addXP(session.user.id, xpEarned, "TREINO_COMPLETO");

    return NextResponse.json({ log, xp: xpResult });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao registrar treino" }, { status: 500 });
  }
}
