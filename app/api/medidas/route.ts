import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { addXP } from "@/lib/xp-service";

const medidaSchema = z.object({
  weight: z.number().min(20).max(500),
  bodyFat: z.number().min(0).max(70).optional(),
  muscleMass: z.number().min(0).max(100).optional(),
  waist: z.number().min(30).max(250).optional(),
  chest: z.number().min(30).max(250).optional(),
  hips: z.number().min(30).max(250).optional(),
  notes: z.string().max(500).optional(),
  date: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "30");

  const medidas = await prisma.bodyMeasurement.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json(medidas);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = medidaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { date, ...data } = parsed.data;
    const medida = await prisma.bodyMeasurement.create({
      data: {
        userId: session.user.id,
        ...data,
        date: date ? new Date(date) : new Date(),
      },
    });

    // XP por registrar peso
    const xpResult = await addXP(session.user.id, 10, "LOG_PESO");

    return NextResponse.json({ medida, xp: xpResult });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
