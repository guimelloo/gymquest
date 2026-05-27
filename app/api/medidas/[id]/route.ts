import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  photo: z.string().max(300000).nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    // Verify ownership before updating
    const existing = await prisma.bodyMeasurement.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await prisma.bodyMeasurement.update({
      where: { id },
      data: { photo: parsed.data.photo },
    });

    return NextResponse.json({ medida: updated });
  } catch (error) {
    console.error("[medidas PATCH]", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.bodyMeasurement.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.bodyMeasurement.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
