import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { addXP } from "@/lib/xp-service";

const metaSchema = z.object({
  type: z.enum(["weight", "bodyFat", "muscle", "streak", "water", "workout", "custom"]),
  title: z.string().min(1),
  description: z.string().optional(),
  targetValue: z.number().optional(),
  startValue: z.number().optional(),
  currentValue: z.number().optional(),
  unit: z.string().optional(),
  deadline: z.string().optional(),
  xpReward: z.number().min(50).max(1000).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const metas = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(metas);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = metaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { deadline, ...data } = parsed.data;
    const meta = await prisma.goal.create({
      data: {
        userId: session.user.id,
        ...data,
        deadline: deadline ? new Date(deadline) : undefined,
      },
    });

    return NextResponse.json(meta, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar meta" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, currentValue, status } = body;

    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    const meta = await prisma.goal.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!meta) return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (currentValue !== undefined) updateData.currentValue = currentValue;
    if (status) updateData.status = status;
    if (status === "completed") {
      updateData.completedAt = new Date();
      // XP pela conclusão da meta
      await addXP(session.user.id, meta.xpReward, "META_CONCLUIDA");
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar meta" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  await prisma.goal.deleteMany({ where: { id, userId: session.user.id } });

  return NextResponse.json({ success: true });
}
