import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const exercicioSchema = z.object({
  name: z.string().min(1),
  sets: z.number().min(1).max(100),
  reps: z.string().min(1),
  weight: z.number().optional(),
  restSecs: z.number().optional(),
  notes: z.string().optional(),
  order: z.number().optional(),
});

const diaTreinoSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  name: z.string().min(1),
  exercises: z.array(exercicioSchema),
});

const planSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  days: z.array(diaTreinoSchema),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const planos = await prisma.workoutPlan.findMany({
    where: { userId: session.user.id },
    include: {
      days: {
        include: { exercises: { orderBy: { order: "asc" } } },
        orderBy: { dayOfWeek: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(planos);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = planSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    // Desativar planos anteriores se esse for ativado
    const plano = await prisma.workoutPlan.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        description: parsed.data.description,
        isActive: true,
        days: {
          create: parsed.data.days.map((day) => ({
            dayOfWeek: day.dayOfWeek,
            name: day.name,
            exercises: {
              create: day.exercises.map((ex, idx) => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                restSecs: ex.restSecs,
                notes: ex.notes,
                order: ex.order ?? idx,
              })),
            },
          })),
        },
      },
      include: {
        days: {
          include: { exercises: { orderBy: { order: "asc" } } },
        },
      },
    });

    // Desativar outros planos
    await prisma.workoutPlan.updateMany({
      where: { userId: session.user.id, id: { not: plano.id } },
      data: { isActive: false },
    });

    return NextResponse.json(plano, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar plano" }, { status: 500 });
  }
}
