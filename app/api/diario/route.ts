import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { addXP, atualizarStreak } from "@/lib/xp-service";

const logSchema = z.object({
  date: z.string().optional(),
  waterMl: z.number().min(0).max(20000).optional(),
  mood: z.enum(["great", "good", "ok", "bad"]).optional(),
  notes: z.string().max(1000).optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const d = new Date();
  const localFallback = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const date = searchParams.get("date") || searchParams.get("today") || localFallback;
  const targetDate = new Date(date);
  targetDate.setHours(12, 0, 0, 0);

  const [log, user] = await Promise.all([
    prisma.dailyLog.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(date + "T00:00:00.000Z"),
          lt: new Date(date + "T23:59:59.999Z"),
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { waterGoal: true, streak: true },
    }),
  ]);

  return NextResponse.json({ log, waterGoal: user?.waterGoal || 2500, streak: user?.streak || 0 });
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

    const now = new Date();
    const localFallback2 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const dateStr = parsed.data.date || localFallback2;
    const dateObj = new Date(dateStr + "T12:00:00.000Z");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { waterGoal: true },
    });

    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(dateStr + "T00:00:00.000Z"),
          lt: new Date(dateStr + "T23:59:59.999Z"),
        },
      },
    });

    const updateData = {
      ...(parsed.data.waterMl !== undefined && { waterMl: parsed.data.waterMl }),
      ...(parsed.data.mood !== undefined && { mood: parsed.data.mood }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
    };

    let log;
    let xpResult = null;

    if (existingLog) {
      log = await prisma.dailyLog.update({
        where: { id: existingLog.id },
        data: updateData,
      });
    } else {
      log = await prisma.dailyLog.create({
        data: {
          userId: session.user.id,
          date: dateObj,
          ...updateData,
        },
      });

      // XP por check-in diário
      xpResult = await addXP(session.user.id, 5, "CHECK_IN");
      await atualizarStreak(session.user.id);
    }

    // Verificar meta de água
    if (
      parsed.data.waterMl !== undefined &&
      parsed.data.waterMl >= (user?.waterGoal || 2500)
    ) {
      xpResult = await addXP(session.user.id, 15, "META_AGUA");
    }

    return NextResponse.json({ log, xp: xpResult });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
