// ============================================================
// Banco de exercícios com vídeos e grupos musculares
// ============================================================

export type MuscleGroup =
  | "peito"
  | "costas"
  | "pernas"
  | "ombros"
  | "bíceps"
  | "tríceps"
  | "core"
  | "glúteos"
  | "cardio"
  | "geral";

export const MUSCLE_COLORS: Record<MuscleGroup, { bg: string; text: string; border: string }> = {
  peito:    { bg: "bg-rose-500/15",   text: "text-rose-400",    border: "border-rose-500/30" },
  costas:   { bg: "bg-blue-500/15",   text: "text-blue-400",    border: "border-blue-500/30" },
  pernas:   { bg: "bg-green-500/15",  text: "text-green-400",   border: "border-green-500/30" },
  ombros:   { bg: "bg-orange-500/15", text: "text-orange-400",  border: "border-orange-500/30" },
  bíceps:   { bg: "bg-purple-500/15", text: "text-purple-400",  border: "border-purple-500/30" },
  tríceps:  { bg: "bg-pink-500/15",   text: "text-pink-400",    border: "border-pink-500/30" },
  core:     { bg: "bg-yellow-500/15", text: "text-yellow-400",  border: "border-yellow-500/30" },
  glúteos:  { bg: "bg-teal-500/15",   text: "text-teal-400",    border: "border-teal-500/30" },
  cardio:   { bg: "bg-red-500/15",    text: "text-red-400",     border: "border-red-500/30" },
  geral:    { bg: "bg-gray-500/15",   text: "text-gray-400",    border: "border-gray-500/30" },
};

interface ExerciseInfo {
  muscles: MuscleGroup[];
  searchQuery: string; // query para YouTube
}

// Mapa de exercícios → músculos + query de vídeo
const EXERCISES_MAP: Record<string, ExerciseInfo> = {
  // PEITO
  "supino reto":           { muscles: ["peito", "tríceps", "ombros"], searchQuery: "supino reto execucao tecnica musculacao" },
  "supino inclinado":      { muscles: ["peito", "ombros"], searchQuery: "supino inclinado execucao tecnica musculacao" },
  "supino declinado":      { muscles: ["peito", "tríceps"], searchQuery: "supino declinado execucao tecnica musculacao" },
  "supino halteres":       { muscles: ["peito"], searchQuery: "supino halteres execucao musculacao" },
  "crucifixo":             { muscles: ["peito"], searchQuery: "crucifixo peito execucao musculacao" },
  "crossover":             { muscles: ["peito"], searchQuery: "crossover polia peito execucao musculacao" },
  "peck deck":             { muscles: ["peito"], searchQuery: "peck deck voador peito execucao" },
  "flexao":                { muscles: ["peito", "tríceps"], searchQuery: "flexao terra execucao musculacao" },
  "flexão":                { muscles: ["peito", "tríceps"], searchQuery: "flexao terra execucao musculacao" },
  "pullover":              { muscles: ["peito", "costas"], searchQuery: "pullover haltere execucao musculacao" },

  // COSTAS
  "remada curvada":        { muscles: ["costas"], searchQuery: "remada curvada barra execucao musculacao" },
  "remada baixa":          { muscles: ["costas"], searchQuery: "remada baixa polia execucao musculacao" },
  "remada unilateral":     { muscles: ["costas"], searchQuery: "remada unilateral haltere execucao musculacao" },
  "remada cavalinho":      { muscles: ["costas"], searchQuery: "remada cavalinho execucao musculacao" },
  "remada aberta":         { muscles: ["costas", "ombros"], searchQuery: "remada aberta execucao musculacao" },
  "puxada frente":         { muscles: ["costas", "bíceps"], searchQuery: "puxada frente costas execucao musculacao" },
  "puxada atrás":          { muscles: ["costas", "bíceps"], searchQuery: "puxada atras nuca execucao musculacao" },
  "puxada alta":           { muscles: ["costas", "bíceps"], searchQuery: "puxada alta polia execucao musculacao" },
  "levantamento terra":    { muscles: ["costas", "pernas", "glúteos"], searchQuery: "levantamento terra execucao tecnica musculacao" },
  "barra fixa":            { muscles: ["costas", "bíceps"], searchQuery: "barra fixa execucao tecnica musculacao" },
  "serrote":               { muscles: ["costas"], searchQuery: "serrote haltere costas execucao musculacao" },

  // PERNAS
  "agachamento":           { muscles: ["pernas", "glúteos"], searchQuery: "agachamento livre execucao tecnica musculacao" },
  "agachamento livre":     { muscles: ["pernas", "glúteos"], searchQuery: "agachamento livre barra execucao tecnica" },
  "leg press":             { muscles: ["pernas", "glúteos"], searchQuery: "leg press 45 execucao tecnica musculacao" },
  "extensao":              { muscles: ["pernas"], searchQuery: "extensao joelhos quadriceps execucao musculacao" },
  "extensão":              { muscles: ["pernas"], searchQuery: "extensao joelhos quadriceps execucao musculacao" },
  "flexao femoral":        { muscles: ["pernas"], searchQuery: "flexao femoral posterior coxa execucao musculacao" },
  "flexão femoral":        { muscles: ["pernas"], searchQuery: "flexao femoral posterior coxa execucao musculacao" },
  "cadeira extensora":     { muscles: ["pernas"], searchQuery: "cadeira extensora quadriceps execucao musculacao" },
  "mesa flexora":          { muscles: ["pernas"], searchQuery: "mesa flexora posterior coxa execucao musculacao" },
  "stiff":                 { muscles: ["pernas", "glúteos"], searchQuery: "stiff levantamento terra halteres execucao musculacao" },
  "afundo":                { muscles: ["pernas", "glúteos"], searchQuery: "afundo lunge execucao musculacao" },
  "agachamento sumo":      { muscles: ["pernas", "glúteos"], searchQuery: "agachamento sumo execucao musculacao" },
  "panturrilha":           { muscles: ["pernas"], searchQuery: "panturrilha gemeos execucao musculacao" },
  "cadeira adutora":       { muscles: ["pernas"], searchQuery: "cadeira adutora execucao musculacao" },
  "cadeira abdutora":      { muscles: ["pernas", "glúteos"], searchQuery: "cadeira abdutora execucao musculacao" },

  // OMBROS
  "desenvolvimento":       { muscles: ["ombros", "tríceps"], searchQuery: "desenvolvimento ombros execucao musculacao" },
  "desenvolvimento militar": { muscles: ["ombros", "tríceps"], searchQuery: "desenvolvimento militar barra execucao musculacao" },
  "elevação lateral":      { muscles: ["ombros"], searchQuery: "elevacao lateral ombros execucao musculacao" },
  "elevacao lateral":      { muscles: ["ombros"], searchQuery: "elevacao lateral ombros execucao musculacao" },
  "elevação frontal":      { muscles: ["ombros"], searchQuery: "elevacao frontal ombros execucao musculacao" },
  "elevacao frontal":      { muscles: ["ombros"], searchQuery: "elevacao frontal ombros execucao musculacao" },
  "remada alta":           { muscles: ["ombros", "costas"], searchQuery: "remada alta ombros execucao musculacao" },
  "face pull":             { muscles: ["ombros", "costas"], searchQuery: "face pull ombros execucao musculacao" },
  "arnold press":          { muscles: ["ombros"], searchQuery: "arnold press execucao musculacao" },

  // BÍCEPS
  "rosca direta":          { muscles: ["bíceps"], searchQuery: "rosca direta biceps execucao musculacao" },
  "rosca alternada":       { muscles: ["bíceps"], searchQuery: "rosca alternada halteres biceps execucao" },
  "rosca scott":           { muscles: ["bíceps"], searchQuery: "rosca scott biceps execucao musculacao" },
  "rosca concentrada":     { muscles: ["bíceps"], searchQuery: "rosca concentrada biceps execucao musculacao" },
  "rosca martelo":         { muscles: ["bíceps"], searchQuery: "rosca martelo hammer curl execucao musculacao" },
  "rosca 21":              { muscles: ["bíceps"], searchQuery: "rosca 21 biceps execucao musculacao" },
  "rosca inversa":         { muscles: ["bíceps"], searchQuery: "rosca inversa antebraco execucao musculacao" },

  // TRÍCEPS
  "triceps testa":         { muscles: ["tríceps"], searchQuery: "triceps testa barra execucao musculacao" },
  "tríceps testa":         { muscles: ["tríceps"], searchQuery: "triceps testa barra execucao musculacao" },
  "triceps corda":         { muscles: ["tríceps"], searchQuery: "triceps corda polia execucao musculacao" },
  "tríceps corda":         { muscles: ["tríceps"], searchQuery: "triceps corda polia execucao musculacao" },
  "triceps frances":       { muscles: ["tríceps"], searchQuery: "triceps frances execucao musculacao" },
  "tríceps francês":       { muscles: ["tríceps"], searchQuery: "triceps frances execucao musculacao" },
  "mergulho":              { muscles: ["tríceps", "peito"], searchQuery: "mergulho triceps execucao musculacao" },
  "triceps coice":         { muscles: ["tríceps"], searchQuery: "triceps coice haltere execucao musculacao" },
  "tríceps coice":         { muscles: ["tríceps"], searchQuery: "triceps coice haltere execucao musculacao" },
  "paralelas":             { muscles: ["tríceps", "peito"], searchQuery: "paralelas triceps execucao musculacao" },

  // CORE / ABDÔMEN
  "abdominal":             { muscles: ["core"], searchQuery: "abdominal crunch execucao musculacao" },
  "prancha":               { muscles: ["core"], searchQuery: "prancha abdominal execucao musculacao" },
  "plank":                 { muscles: ["core"], searchQuery: "plank prancha execucao musculacao" },
  "abdominal supra":       { muscles: ["core"], searchQuery: "abdominal supra execucao musculacao" },
  "elevacao pernas":       { muscles: ["core"], searchQuery: "elevacao pernas abdomen execucao musculacao" },
  "elevação pernas":       { muscles: ["core"], searchQuery: "elevacao pernas abdomen execucao musculacao" },
  "obliquo":               { muscles: ["core"], searchQuery: "obliquo abdominal execucao musculacao" },
  "oblíquo":               { muscles: ["core"], searchQuery: "obliquo abdominal execucao musculacao" },
  "russian twist":         { muscles: ["core"], searchQuery: "russian twist execucao musculacao" },

  // GLÚTEOS
  "hip thrust":            { muscles: ["glúteos", "pernas"], searchQuery: "hip thrust gluteo execucao musculacao" },
  "glúteo máquina":        { muscles: ["glúteos"], searchQuery: "gluteo maquina execucao musculacao" },
  "donkey kick":           { muscles: ["glúteos"], searchQuery: "donkey kick gluteo execucao musculacao" },
  "agachamento búlgaro":   { muscles: ["glúteos", "pernas"], searchQuery: "agachamento bulgaro execucao musculacao" },

  // CARDIO
  "esteira":               { muscles: ["cardio"], searchQuery: "treino esteira corrida academia" },
  "bicicleta":             { muscles: ["cardio"], searchQuery: "bicicleta ergometrica treino academia" },
  "eliptico":              { muscles: ["cardio"], searchQuery: "eliptico treino academia" },
  "elíptico":              { muscles: ["cardio"], searchQuery: "eliptico treino academia" },
  "hiit":                  { muscles: ["cardio"], searchQuery: "HIIT treino intervalado academia" },
  "corda":                 { muscles: ["cardio", "core"], searchQuery: "corda pular treino academia" },
  "burpee":                { muscles: ["cardio", "core"], searchQuery: "burpee execucao musculacao" },
};

// Buscar informações de um exercício pelo nome
export function getExerciseInfo(name: string): ExerciseInfo {
  const normalized = name.toLowerCase().trim();

  // Busca exata
  if (EXERCISES_MAP[normalized]) return EXERCISES_MAP[normalized];

  // Busca parcial
  for (const [key, info] of Object.entries(EXERCISES_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return info;
    }
  }

  // Fallback genérico
  return {
    muscles: ["geral"],
    searchQuery: `${name} como executar academia musculação`,
  };
}

// Gerar URL de busca no YouTube
export function getYouTubeSearchUrl(exerciseName: string): string {
  const info = getExerciseInfo(exerciseName);
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(info.searchQuery)}`;
}

// Obter grupos musculares de um exercício
export function getExerciseMuscles(name: string): MuscleGroup[] {
  return getExerciseInfo(name).muscles;
}

// Todos os grupos musculares disponíveis
export const MUSCLE_GROUPS: MuscleGroup[] = [
  "peito", "costas", "pernas", "ombros", "bíceps", "tríceps", "core", "glúteos", "cardio", "geral",
];

// Labels em português
export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  peito:    "Peito",
  costas:   "Costas",
  pernas:   "Pernas",
  ombros:   "Ombros",
  bíceps:   "Bíceps",
  tríceps:  "Tríceps",
  core:     "Core",
  glúteos:  "Glúteos",
  cardio:   "Cardio",
  geral:    "Geral",
};
