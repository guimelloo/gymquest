// ============================================================
// Cálculos de saúde e fitness
// ============================================================

export function calcularIMC(peso: number, alturaCm: number): number {
  const alturaM = alturaCm / 100;
  return peso / (alturaM * alturaM);
}

export function classificarIMC(imc: number): {
  label: string;
  color: string;
} {
  if (imc < 18.5) return { label: "Abaixo do peso", color: "text-blue-400" };
  if (imc < 25) return { label: "Peso normal", color: "text-green-400" };
  if (imc < 30) return { label: "Sobrepeso", color: "text-yellow-400" };
  if (imc < 35) return { label: "Obesidade I", color: "text-orange-400" };
  if (imc < 40) return { label: "Obesidade II", color: "text-red-400" };
  return { label: "Obesidade III", color: "text-red-600" };
}

// Fórmula de Katch-McArdle para TMB
export function calcularTMB(
  peso: number,
  alturaCm: number,
  idade: number,
  genero: string
): number {
  if (genero === "male") {
    // Mifflin-St Jeor
    return 10 * peso + 6.25 * alturaCm - 5 * idade + 5;
  } else {
    return 10 * peso + 6.25 * alturaCm - 5 * idade - 161;
  }
}

export function calcularGET(
  tmb: number,
  nivelAtividade: string
): number {
  const fatores: Record<string, number> = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    muito_intenso: 1.9,
  };
  return tmb * (fatores[nivelAtividade] || 1.55);
}

// Fórmula de Jackson-Pollock para gordura corporal
// Usando medidas de cintura para estimativa simplificada (U.S. Navy)
export function estimarGorduraCorporal(
  peso: number,
  alturaCm: number,
  cintura: number,
  quadril: number | null,
  pescoco: number | null,
  genero: string
): number | null {
  if (!cintura || !pescoco) return null;

  if (genero === "male") {
    // Homens: log10(cintura - pescoço) - log10(altura)
    const gordura =
      495 /
        (1.0324 -
          0.19077 * Math.log10(cintura - (pescoco || 0)) +
          0.15456 * Math.log10(alturaCm)) -
      450;
    return Math.max(0, Math.min(gordura, 60));
  } else {
    if (!quadril) return null;
    const gordura =
      495 /
        (1.29579 -
          0.35004 * Math.log10(cintura + (quadril || 0) - (pescoco || 0)) +
          0.221 * Math.log10(alturaCm)) -
      450;
    return Math.max(0, Math.min(gordura, 60));
  }
}

export function calcularIdade(birthDate: Date): number {
  const hoje = new Date();
  let idade = hoje.getFullYear() - birthDate.getFullYear();
  const mes = hoje.getMonth() - birthDate.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < birthDate.getDate())) {
    idade--;
  }
  return idade;
}

// Macros recomendados baseados no objetivo
export function calcularMacros(
  calories: number,
  objetivo: "perda_peso" | "manutencao" | "ganho_massa"
): { proteina: number; carbs: number; gordura: number } {
  const distribuicao = {
    perda_peso: { proteina: 0.35, carbs: 0.35, gordura: 0.3 },
    manutencao: { proteina: 0.3, carbs: 0.4, gordura: 0.3 },
    ganho_massa: { proteina: 0.3, carbs: 0.45, gordura: 0.25 },
  };

  const dist = distribuicao[objetivo];
  return {
    proteina: Math.round((calories * dist.proteina) / 4), // 4 kcal/g
    carbs: Math.round((calories * dist.carbs) / 4),
    gordura: Math.round((calories * dist.gordura) / 9), // 9 kcal/g
  };
}

// Progresso em porcentagem para metas
export function calcularProgresso(
  inicio: number,
  atual: number,
  meta: number
): number {
  const totalDiff = Math.abs(meta - inicio);
  if (totalDiff === 0) return 100;
  const progressoDiff = Math.abs(atual - inicio);
  const progresso = (progressoDiff / totalDiff) * 100;
  return Math.min(100, Math.max(0, progresso));
}

// Calcular calorias queimadas estimadas por tipo de exercício
export function estimarCaloriasQueimadas(
  pesoKg: number,
  duracaoMin: number,
  tipo: string
): number {
  const mets: Record<string, number> = {
    musculacao: 5.0,
    corrida: 9.8,
    caminhada: 3.5,
    ciclismo: 7.5,
    natacao: 8.0,
    hiit: 10.0,
    yoga: 3.0,
    funcional: 6.5,
  };
  const met = mets[tipo] || 5.0;
  // Calorias = MET × peso(kg) × tempo(h)
  return Math.round((met * pesoKg * duracaoMin) / 60);
}
