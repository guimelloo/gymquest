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
  photo: z.string().max(300000).optional(), // base64 compressed thumbnail ≤ ~225 KB
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "30");
  const withPhotos = searchParams.get("photos") === "true";

  const medidas = await prisma.bodyMeasurement.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: limit,
    // Only include photo field when explicitly requested (avoids heavy list payloads)
    select: withPhotos
      ? undefined
      : {
          id: true, date: true, weight: true,
          bodyFat: true, muscleMass: true,
          waist: true, chest: true, hips: true,
          notes: true,
          // photo intentionally omitted to avoid heavy list payloads
        },
  });

  // When withPhotos=false, re-add `photo: null` so the TypeScript interface
  // stays consistent on the client
  const result = withPhotos
    ? medidas
    : (medidas as Array<Record<string, unknown>>).map((m) => ({ ...m, photo: null }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const xpResult = await addXP(session.user.id, 10, "LOG_PESO");

    return NextResponse.json({ medida, xp: xpResult });
  } catch (error) {
    console.error("[medidas POST]", error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
