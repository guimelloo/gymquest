// ============================================================
// Integração com Open Food Facts API
// ============================================================

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number | null;     // kcal por 100g
  protein: number | null;      // g por 100g
  carbs: number | null;        // g por 100g
  fat: number | null;          // g por 100g
  fiber: number | null;        // g por 100g
  imageUrl?: string;
}

// Buscar alimentos no Open Food Facts
export async function buscarAlimentos(query: string, pagina = 1): Promise<FoodItem[]> {
  if (!query.trim()) return [];

  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: "1",
      action: "process",
      json: "1",
      page_size: "20",
      page: pagina.toString(),
      fields: "id,product_name,brands,nutriments,image_small_url,categories",
      lc: "pt",
      cc: "br",
    });

    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?${params}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) throw new Error("Falha na busca");

    const data = await response.json();
    const products = data.products || [];

    return products
      .filter((p: Record<string, unknown>) => p.product_name && (p.product_name as string).trim())
      .map((p: Record<string, unknown>) => {
        const n = (p.nutriments || {}) as Record<string, number>;
        return {
          id: (p.id || p.code || "") as string,
          name: ((p.product_name || "") as string).trim(),
          brand: ((p.brands || "") as string).split(",")[0].trim() || undefined,
          calories: n["energy-kcal_100g"] || n["energy_100g"] ? n["energy-kcal_100g"] || (n["energy_100g"] / 4.184) : null,
          protein: n["proteins_100g"] ?? null,
          carbs: n["carbohydrates_100g"] ?? null,
          fat: n["fat_100g"] ?? null,
          fiber: n["fiber_100g"] ?? null,
          imageUrl: (p.image_small_url || "") as string || undefined,
        } as FoodItem;
      });
  } catch (error) {
    console.error("Erro ao buscar alimentos:", error);
    return [];
  }
}

// Buscar produto por código de barras
export async function buscarPorBarcode(barcode: string): Promise<FoodItem | null> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== 1) return null;

    const p = data.product;
    const n = p.nutriments || {};

    return {
      id: barcode,
      name: (p.product_name || p.product_name_pt || "").trim(),
      brand: (p.brands || "").split(",")[0].trim() || undefined,
      calories: n["energy-kcal_100g"] || null,
      protein: n["proteins_100g"] ?? null,
      carbs: n["carbohydrates_100g"] ?? null,
      fat: n["fat_100g"] ?? null,
      fiber: n["fiber_100g"] ?? null,
      imageUrl: p.image_small_url || undefined,
    };
  } catch {
    return null;
  }
}

// Calcular nutrientes para uma quantidade específica
export function calcularNutrientes(
  alimento: FoodItem,
  quantidadeG: number
): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
} {
  const fator = quantidadeG / 100;
  return {
    calories: Math.round((alimento.calories || 0) * fator),
    protein: Math.round((alimento.protein || 0) * fator * 10) / 10,
    carbs: Math.round((alimento.carbs || 0) * fator * 10) / 10,
    fat: Math.round((alimento.fat || 0) * fator * 10) / 10,
    fiber: Math.round((alimento.fiber || 0) * fator * 10) / 10,
  };
}

// Alimentos comuns brasileiros (fallback)
export const ALIMENTOS_COMUNS: FoodItem[] = [
  { id: "arroz-branco", name: "Arroz branco cozido", calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 1.6 },
  { id: "feijao-carioca", name: "Feijão carioca cozido", calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.4 },
  { id: "frango-grelhado", name: "Frango grelhado (peito)", calories: 163, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 },
  { id: "ovo-mexido", name: "Ovo mexido", calories: 148, protein: 10.0, carbs: 1.0, fat: 11.5, fiber: 0 },
  { id: "batata-doce", name: "Batata doce cozida", calories: 77, protein: 1.4, carbs: 18.0, fat: 0.1, fiber: 2.2 },
  { id: "banana", name: "Banana prata", calories: 98, protein: 1.3, carbs: 26.0, fat: 0.1, fiber: 2.0 },
  { id: "aveia", name: "Aveia em flocos", calories: 394, protein: 13.9, carbs: 66.6, fat: 8.5, fiber: 9.1 },
  { id: "whey-protein", name: "Whey protein", calories: 381, protein: 78.0, carbs: 7.0, fat: 5.0, fiber: 0 },
  { id: "pao-integral", name: "Pão integral", calories: 243, protein: 9.4, carbs: 44.0, fat: 3.7, fiber: 7.5 },
  { id: "leite-desnatado", name: "Leite desnatado", calories: 35, protein: 3.4, carbs: 5.0, fat: 0.1, fiber: 0 },
  { id: "iogurte-natural", name: "Iogurte natural integral", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.0, fiber: 0 },
  { id: "brocolis", name: "Brócolis cozido", calories: 35, protein: 2.9, carbs: 5.1, fat: 0.4, fiber: 3.3 },
  { id: "carne-bovina", name: "Carne bovina (patinho)", calories: 219, protein: 28.7, carbs: 0, fat: 11.2, fiber: 0 },
  { id: "atum-lata", name: "Atum em lata (água)", calories: 119, protein: 26.5, carbs: 0, fat: 1.0, fiber: 0 },
  { id: "amendoim", name: "Amendoim torrado", calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5 },
];
