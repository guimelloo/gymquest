import { NextResponse } from "next/server";
import { buscarAlimentos, ALIMENTOS_COMUNS } from "@/lib/food-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const pagina = parseInt(searchParams.get("page") || "1");

  if (!query.trim()) {
    return NextResponse.json({ items: ALIMENTOS_COMUNS });
  }

  // Primeiro verificar alimentos locais
  const locais = ALIMENTOS_COMUNS.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase())
  );

  // Buscar na API externa
  const externos = await buscarAlimentos(query, pagina);

  // Combinar: locais primeiro, depois externos
  const todos = [
    ...locais,
    ...externos.filter((e) => !locais.some((l) => l.name === e.name)),
  ];

  return NextResponse.json({ items: todos });
}
