import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calcularNivel } from "@/lib/gamification";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  height: z.number().min(100).max(250).optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  waterGoal: z.number().min(500).max(10000).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      height: true,
      birthDate: true,
      gender: true,
      xp: true,
      level: true,
      streak: true,
      lastCheckIn: true,
      totalWorkouts: true,
      totalMeals: true,
      waterGoal: true,
      createdAt: true,
      achievements: {
        include: { achievement: true },
        orderBy: { earnedAt: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const levelInfo = calcularNivel(user.xp);

  return NextResponse.json({ ...user, levelInfo });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (data.birthDate) {
      data.birthDate = new Date(data.birthDate as string);
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
