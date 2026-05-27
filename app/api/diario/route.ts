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

/** Midnight UTC for a YYYY-MM-DD string — matches @db.Date storage */
function toDateUTC(dateStr: string) {
  return new Date(dateStr + "T00:00:00.000Z");
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const d = new Date();
  const localFallback = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const dateStr = searchParams.get("date") || searchParams.get("today") || localFallback;

  const [log, user] = await Promise.all([
    prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: toDateUTC(dateStr),
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
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = logSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const now = new Date();
    const localFallback = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const dateStr = parsed.data.date || localFallback;
    const dateUTC = toDateUTC(dateStr);

    const updateData: Record<string, unknown> = {};
    if (parsed.data.waterMl !== undefined) updateData.waterMl = parsed.data.waterMl;
    if (parsed.data.mood     !== undefined) updateData.mood    = parsed.data.mood;
    if (parsed.data.notes    !== undefined) updateData.notes   = parsed.data.notes;

    // Check if this is the first log for today (for XP award)
    const existingBefore = await prisma.dailyLog.findUnique({
      where: { userId_date: { userId: session.user.id, date: dateUTC } },
      select: { id: true },
    });

    // Upsert — atomically creates or updates, never violates the unique constraint
    const log = await prisma.dailyLog.upsert({
      where: { userId_date: { userId: session.user.id, date: dateUTC } },
      update: updateData,
      create: {
        userId: session.user.id,
        date: dateUTC,
        ...updateData,
      },
    });

    let xpResult = null;

    // XP for daily check-in only on first entry of the day
    if (!existingBefore) {
      xpResult = await addXP(session.user.id, 5, "CHECK_IN");
      await atualizarStreak(session.user.id);
    }

    // XP for reaching water goal
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { waterGoal: true },
    });
    if (
      parsed.data.waterMl !== undefined &&
      parsed.data.waterMl >= (user?.waterGoal || 2500) &&
      (existingBefore ? true : true) // always check
    ) {
      xpResult = await addXP(session.user.id, 15, "META_AGUA");
    }

    return NextResponse.json({ log, xp: xpResult });
  } catch (error) {
    console.error("[diario POST]", error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
