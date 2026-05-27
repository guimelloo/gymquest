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

// Alimentos comuns brasileiros (fallback — banco local com 90+ alimentos)
export const ALIMENTOS_COMUNS: FoodItem[] = [
  // ── Cereais / Grãos ─────────────────────────────────────────────────────
  { id: "arroz-branco", name: "Arroz branco cozido", calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 1.6 },
  { id: "arroz-integral", name: "Arroz integral cozido", calories: 124, protein: 2.6, carbs: 26.8, fat: 1.0, fiber: 1.8 },
  { id: "aveia", name: "Aveia em flocos", calories: 394, protein: 13.9, carbs: 66.6, fat: 8.5, fiber: 9.1 },
  { id: "macarrao-cozido", name: "Macarrão cozido", calories: 131, protein: 4.3, carbs: 27.0, fat: 0.5, fiber: 1.2 },
  { id: "macarrao-integral", name: "Macarrão integral cozido", calories: 124, protein: 5.3, carbs: 25.5, fat: 0.8, fiber: 3.2 },
  { id: "granola", name: "Granola tradicional", calories: 429, protein: 9.6, carbs: 65.4, fat: 14.5, fiber: 5.6 },
  { id: "quinoa-cozida", name: "Quinoa cozida", calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8 },
  { id: "cuscuz", name: "Cuscuz de milho cozido", calories: 110, protein: 2.5, carbs: 23.2, fat: 0.4, fiber: 1.8 },

  // ── Pães / Farináceos ────────────────────────────────────────────────────
  { id: "pao-integral", name: "Pão integral", calories: 243, protein: 9.4, carbs: 44.0, fat: 3.7, fiber: 7.5 },
  { id: "pao-frances", name: "Pão francês", calories: 300, protein: 9.4, carbs: 58.6, fat: 2.8, fiber: 2.3 },
  { id: "pao-de-queijo", name: "Pão de queijo", calories: 295, protein: 8.0, carbs: 40.0, fat: 11.0, fiber: 0.4 },
  { id: "tapioca", name: "Tapioca com goma", calories: 93, protein: 0.3, carbs: 22.5, fat: 0.1, fiber: 0 },
  { id: "biscoito-integral", name: "Biscoito de arroz integral", calories: 373, protein: 8.0, carbs: 77.0, fat: 3.5, fiber: 4.2 },

  // ── Leguminosas ──────────────────────────────────────────────────────────
  { id: "feijao-carioca", name: "Feijão carioca cozido", calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.4 },
  { id: "feijao-preto", name: "Feijão preto cozido", calories: 77, protein: 5.0, carbs: 14.0, fat: 0.5, fiber: 8.7 },
  { id: "lentilha", name: "Lentilha cozida", calories: 116, protein: 9.0, carbs: 20.0, fat: 0.4, fiber: 7.9 },
  { id: "grao-de-bico", name: "Grão-de-bico cozido", calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6 },
  { id: "ervilha-cozida", name: "Ervilha cozida", calories: 84, protein: 5.4, carbs: 15.6, fat: 0.4, fiber: 5.5 },

  // ── Carnes / Proteínas animais ────────────────────────────────────────────
  { id: "frango-grelhado", name: "Frango grelhado (peito)", calories: 163, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 },
  { id: "frango-coxas", name: "Frango (coxa) grelhado", calories: 181, protein: 24.3, carbs: 0, fat: 9.4, fiber: 0 },
  { id: "carne-bovina", name: "Carne bovina (patinho)", calories: 219, protein: 28.7, carbs: 0, fat: 11.2, fiber: 0 },
  { id: "carne-acem", name: "Carne bovina (acém) cozida", calories: 243, protein: 27.0, carbs: 0, fat: 15.0, fiber: 0 },
  { id: "file-tilapia", name: "Filé de tilápia grelhado", calories: 96, protein: 20.1, carbs: 0, fat: 1.7, fiber: 0 },
  { id: "salmao-grelhado", name: "Salmão grelhado", calories: 206, protein: 28.2, carbs: 0, fat: 10.1, fiber: 0 },
  { id: "atum-lata", name: "Atum em lata (água)", calories: 119, protein: 26.5, carbs: 0, fat: 1.0, fiber: 0 },
  { id: "sardinha-lata", name: "Sardinha em lata (óleo)", calories: 208, protein: 24.6, carbs: 0, fat: 11.5, fiber: 0 },
  { id: "ovo-inteiro", name: "Ovo inteiro cozido", calories: 147, protein: 12.6, carbs: 1.1, fat: 10.0, fiber: 0 },
  { id: "ovo-mexido", name: "Ovo mexido", calories: 148, protein: 10.0, carbs: 1.0, fat: 11.5, fiber: 0 },
  { id: "clara-ovo", name: "Clara de ovo", calories: 52, protein: 11.1, carbs: 0.7, fat: 0.2, fiber: 0 },
  { id: "presunto", name: "Presunto", calories: 109, protein: 15.0, carbs: 2.0, fat: 4.8, fiber: 0 },
  { id: "peito-peru", name: "Peito de peru defumado", calories: 96, protein: 18.5, carbs: 1.5, fat: 1.5, fiber: 0 },

  // ── Laticínios ───────────────────────────────────────────────────────────
  { id: "leite-integral", name: "Leite integral", calories: 61, protein: 3.2, carbs: 4.7, fat: 3.3, fiber: 0 },
  { id: "leite-desnatado", name: "Leite desnatado", calories: 35, protein: 3.4, carbs: 5.0, fat: 0.1, fiber: 0 },
  { id: "iogurte-natural", name: "Iogurte natural integral", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.0, fiber: 0 },
  { id: "iogurte-grego", name: "Iogurte grego natural (0%)", calories: 57, protein: 9.0, carbs: 4.5, fat: 0.3, fiber: 0 },
  { id: "queijo-cottage", name: "Queijo cottage", calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0 },
  { id: "queijo-mussarela", name: "Queijo mussarela", calories: 250, protein: 18.0, carbs: 2.0, fat: 19.0, fiber: 0 },
  { id: "queijo-ricota", name: "Ricota", calories: 110, protein: 8.0, carbs: 4.0, fat: 7.0, fiber: 0 },
  { id: "requeijao", name: "Requeijão cremoso", calories: 213, protein: 7.0, carbs: 2.0, fat: 20.0, fiber: 0 },
  { id: "manteiga", name: "Manteiga", calories: 748, protein: 0.5, carbs: 0.1, fat: 82.7, fiber: 0 },
  { id: "creme-de-leite", name: "Creme de leite", calories: 217, protein: 2.4, carbs: 3.4, fat: 22.5, fiber: 0 },

  // ── Suplementos ─────────────────────────────────────────────────────────
  { id: "whey-protein", name: "Whey protein", calories: 381, protein: 78.0, carbs: 7.0, fat: 5.0, fiber: 0 },
  { id: "caseina", name: "Caseína (proteína de leite)", calories: 370, protein: 76.0, carbs: 8.0, fat: 4.0, fiber: 0 },
  { id: "proteina-vegetal", name: "Proteína vegetal (ervilha)", calories: 360, protein: 80.0, carbs: 5.0, fat: 3.0, fiber: 2.0 },
  { id: "creatina", name: "Creatina monoidratada", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  { id: "bcaa", name: "BCAA em pó", calories: 50, protein: 12.0, carbs: 0, fat: 0, fiber: 0 },

  // ── Tubérculos / Raízes ──────────────────────────────────────────────────
  { id: "batata-doce", name: "Batata doce cozida", calories: 77, protein: 1.4, carbs: 18.0, fat: 0.1, fiber: 2.2 },
  { id: "batata-inglesa", name: "Batata inglesa cozida", calories: 66, protein: 1.8, carbs: 15.1, fat: 0.1, fiber: 1.8 },
  { id: "aipim-cozido", name: "Mandioca / Aipim cozido", calories: 125, protein: 1.0, carbs: 30.1, fat: 0.3, fiber: 1.9 },
  { id: "inhame-cozido", name: "Inhame cozido", calories: 116, protein: 1.5, carbs: 27.5, fat: 0.1, fiber: 4.1 },

  // ── Legumes / Verduras ───────────────────────────────────────────────────
  { id: "brocolis", name: "Brócolis cozido", calories: 35, protein: 2.9, carbs: 5.1, fat: 0.4, fiber: 3.3 },
  { id: "espinafre", name: "Espinafre refogado", calories: 27, protein: 3.4, carbs: 2.1, fat: 0.5, fiber: 2.4 },
  { id: "couve", name: "Couve refogada", calories: 36, protein: 2.5, carbs: 4.4, fat: 0.9, fiber: 2.0 },
  { id: "cenoura-cozida", name: "Cenoura cozida", calories: 35, protein: 0.9, carbs: 8.0, fat: 0.1, fiber: 3.2 },
  { id: "tomate", name: "Tomate cru", calories: 15, protein: 1.0, carbs: 3.2, fat: 0.2, fiber: 1.0 },
  { id: "pepino", name: "Pepino cru", calories: 13, protein: 0.7, carbs: 2.2, fat: 0.1, fiber: 0.6 },
  { id: "alface", name: "Alface crua", calories: 13, protein: 1.3, carbs: 2.1, fat: 0.2, fiber: 1.7 },
  { id: "abobrinha", name: "Abobrinha refogada", calories: 27, protein: 1.9, carbs: 3.4, fat: 0.5, fiber: 1.8 },
  { id: "berinjela", name: "Berinjela cozida", calories: 24, protein: 0.8, carbs: 5.2, fat: 0.2, fiber: 2.5 },
  { id: "chuchu", name: "Chuchu cozido", calories: 22, protein: 0.9, carbs: 4.5, fat: 0.1, fiber: 1.7 },

  // ── Frutas ───────────────────────────────────────────────────────────────
  { id: "banana", name: "Banana prata", calories: 98, protein: 1.3, carbs: 26.0, fat: 0.1, fiber: 2.0 },
  { id: "banana-nanica", name: "Banana nanica", calories: 88, protein: 1.2, carbs: 23.0, fat: 0.1, fiber: 1.9 },
  { id: "maca", name: "Maçã com casca", calories: 56, protein: 0.3, carbs: 14.7, fat: 0.1, fiber: 1.5 },
  { id: "laranja", name: "Laranja pera", calories: 37, protein: 1.0, carbs: 8.9, fat: 0.1, fiber: 0.8 },
  { id: "manga", name: "Manga tommy", calories: 64, protein: 0.7, carbs: 16.9, fat: 0.1, fiber: 1.6 },
  { id: "abacaxi", name: "Abacaxi", calories: 48, protein: 0.9, carbs: 12.3, fat: 0.1, fiber: 1.0 },
  { id: "morango", name: "Morango", calories: 30, protein: 0.8, carbs: 7.0, fat: 0.3, fiber: 2.0 },
  { id: "uva", name: "Uva italiana", calories: 69, protein: 0.9, carbs: 17.8, fat: 0.1, fiber: 0.9 },
  { id: "melancia", name: "Melancia", calories: 30, protein: 0.6, carbs: 7.5, fat: 0.2, fiber: 0.4 },
  { id: "mamao", name: "Mamão formosa", calories: 40, protein: 0.5, carbs: 10.4, fat: 0.1, fiber: 1.8 },
  { id: "abacate", name: "Abacate", calories: 160, protein: 2.0, carbs: 8.5, fat: 14.6, fiber: 6.7 },
  { id: "acai", name: "Açaí (polpa 100%)", calories: 58, protein: 1.5, carbs: 6.5, fat: 3.6, fiber: 3.1 },

  // ── Oleaginosas / Gorduras boas ──────────────────────────────────────────
  { id: "amendoim", name: "Amendoim torrado", calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5 },
  { id: "pasta-amendoim", name: "Pasta de amendoim integral", calories: 598, protein: 24.0, carbs: 18.0, fat: 50.0, fiber: 7.0 },
  { id: "castanha-para", name: "Castanha-do-Pará", calories: 656, protein: 14.3, carbs: 12.3, fat: 65.5, fiber: 7.5 },
  { id: "castanha-caju", name: "Castanha de caju torrada", calories: 574, protein: 15.3, carbs: 29.1, fat: 45.7, fiber: 3.3 },
  { id: "amendoa", name: "Amêndoa torrada", calories: 600, protein: 21.1, carbs: 19.7, fat: 51.6, fiber: 12.2 },
  { id: "nozes", name: "Nozes", calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7 },
  { id: "azeite", name: "Azeite de oliva extra virgem", calories: 884, protein: 0, carbs: 0, fat: 100.0, fiber: 0 },
  { id: "oleo-coco", name: "Óleo de coco", calories: 862, protein: 0, carbs: 0, fat: 100.0, fiber: 0 },

  // ── Preparações comuns ───────────────────────────────────────────────────
  { id: "arroz-feijao", name: "Arroz + feijão (100g cada)", calories: 204, protein: 7.3, carbs: 41.7, fat: 0.7, fiber: 10.0 },
  { id: "frango-legumes", name: "Frango com legumes refogados", calories: 145, protein: 25.0, carbs: 5.5, fat: 3.2, fiber: 1.5 },
  { id: "omelete-2-ovos", name: "Omelete (2 ovos, sem recheio)", calories: 196, protein: 14.0, carbs: 2.0, fat: 14.0, fiber: 0 },
  { id: "vitamina-banana", name: "Vitamina de banana (200ml)", calories: 175, protein: 5.4, carbs: 31.0, fat: 3.4, fiber: 1.4 },
  { id: "salada-verde", name: "Salada verde simples", calories: 15, protein: 1.2, carbs: 2.5, fat: 0.2, fiber: 1.5 },
];
