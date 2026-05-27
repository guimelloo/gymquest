/**
 * Planos de treino predefinidos.
 * Cada template segue a mesma estrutura que o formulário de criação de plano.
 */

export interface TemplateExercise {
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  restSecs?: number;
  notes?: string;
}

export interface TemplateDay {
  dayOfWeek: number; // 0=Dom, 1=Seg … 6=Sáb
  name: string;
  muscleGroup: string;
  exercises: TemplateExercise[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  daysPerWeek: number;
  goal: string;
  days: TemplateDay[];
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  // ─── 1. Full Body Iniciante (3×) ───────────────────────────────────────────
  {
    id: "full-body-3x",
    name: "Full Body — Iniciante",
    description: "Treino de corpo inteiro 3x por semana. Ideal para quem está começando.",
    level: "Iniciante",
    daysPerWeek: 3,
    goal: "Condicionamento geral",
    days: [
      {
        dayOfWeek: 1, // Segunda
        name: "Full Body A",
        muscleGroup: "geral",
        exercises: [
          { name: "Agachamento Livre", sets: 3, reps: "10-12", restSecs: 90 },
          { name: "Supino Reto", sets: 3, reps: "10-12", restSecs: 90 },
          { name: "Remada Curvada", sets: 3, reps: "10-12", restSecs: 90 },
          { name: "Desenvolvimento com Halteres", sets: 3, reps: "12", restSecs: 60 },
          { name: "Abdominal Supra", sets: 3, reps: "15-20", restSecs: 45 },
        ],
      },
      {
        dayOfWeek: 3, // Quarta
        name: "Full Body B",
        muscleGroup: "geral",
        exercises: [
          { name: "Leg Press 45°", sets: 3, reps: "12-15", restSecs: 90 },
          { name: "Supino Inclinado com Halteres", sets: 3, reps: "10-12", restSecs: 90 },
          { name: "Puxada Alta com Triângulo", sets: 3, reps: "10-12", restSecs: 90 },
          { name: "Elevação Lateral", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Prancha", sets: 3, reps: "30-45s", restSecs: 45 },
        ],
      },
      {
        dayOfWeek: 5, // Sexta
        name: "Full Body C",
        muscleGroup: "geral",
        exercises: [
          { name: "Stiff", sets: 3, reps: "12", restSecs: 90 },
          { name: "Supino com Halteres", sets: 3, reps: "12", restSecs: 90 },
          { name: "Serrote com Halter", sets: 3, reps: "12 cada", restSecs: 60 },
          { name: "Desenvolvimento Arnold", sets: 3, reps: "12", restSecs: 60 },
          { name: "Abdominal Bicicleta", sets: 3, reps: "20", restSecs: 45 },
        ],
      },
    ],
  },

  // ─── 2. ABC — Intermediário (3×) ──────────────────────────────────────────
  {
    id: "abc-3x",
    name: "ABC — Intermediário",
    description: "Divisão clássica em 3 dias. Cada grupo muscular trabalhado 1× por semana.",
    level: "Intermediário",
    daysPerWeek: 3,
    goal: "Hipertrofia",
    days: [
      {
        dayOfWeek: 1, // Segunda — A
        name: "A — Peito e Tríceps",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino Reto com Barra", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Supino Inclinado com Halteres", sets: 3, reps: "10-12", restSecs: 75 },
          { name: "Crucifixo com Halteres", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Tríceps Corda", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Tríceps Testa com Barra", sets: 3, reps: "10-12", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 3, // Quarta — B
        name: "B — Costas e Bíceps",
        muscleGroup: "costas",
        exercises: [
          { name: "Puxada Alta com Barra", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Remada Curvada com Barra", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Serrote com Halter", sets: 3, reps: "12 cada", restSecs: 60 },
          { name: "Rosca Direta com Barra", sets: 3, reps: "10-12", restSecs: 60 },
          { name: "Rosca Martelo", sets: 3, reps: "12 cada", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 5, // Sexta — C
        name: "C — Pernas e Ombros",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre", sets: 4, reps: "8-10", restSecs: 120 },
          { name: "Leg Press 45°", sets: 3, reps: "12-15", restSecs: 90 },
          { name: "Cadeira Extensora", sets: 3, reps: "15", restSecs: 60 },
          { name: "Desenvolvimento com Barra", sets: 3, reps: "10-12", restSecs: 75 },
          { name: "Elevação Lateral", sets: 3, reps: "15", restSecs: 60 },
        ],
      },
    ],
  },

  // ─── 3. Push / Pull / Legs — Intermediário (3×) ───────────────────────────
  {
    id: "ppl-3x",
    name: "Push / Pull / Legs",
    description: "PPL clássico: empurrar, puxar e pernas. Muito popular para hipertrofia.",
    level: "Intermediário",
    daysPerWeek: 3,
    goal: "Hipertrofia",
    days: [
      {
        dayOfWeek: 1, // Segunda — Push
        name: "Push — Peito / Ombros / Tríceps",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino Reto com Barra", sets: 4, reps: "6-10", restSecs: 120 },
          { name: "Desenvolvimento com Halteres", sets: 3, reps: "10-12", restSecs: 90 },
          { name: "Supino Inclinado com Halteres", sets: 3, reps: "10-12", restSecs: 75 },
          { name: "Elevação Lateral", sets: 4, reps: "15-20", restSecs: 60 },
          { name: "Tríceps Corda", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Tríceps Francês", sets: 3, reps: "10-12", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 3, // Quarta — Pull
        name: "Pull — Costas / Bíceps",
        muscleGroup: "costas",
        exercises: [
          { name: "Puxada Alta com Barra Pronada", sets: 4, reps: "6-10", restSecs: 120 },
          { name: "Remada Curvada com Barra", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Rosca Direta com Barra", sets: 3, reps: "10-12", restSecs: 75 },
          { name: "Face Pull", sets: 3, reps: "15-20", restSecs: 60 },
          { name: "Rosca Martelo", sets: 3, reps: "12 cada", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 5, // Sexta — Legs
        name: "Legs — Pernas e Glúteos",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre", sets: 4, reps: "6-10", restSecs: 120 },
          { name: "Leg Press 45°", sets: 3, reps: "10-15", restSecs: 90 },
          { name: "Cadeira Extensora", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Mesa Flexora", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Panturrilha no Smith", sets: 4, reps: "15-20", restSecs: 45 },
        ],
      },
    ],
  },

  // ─── 4. ABCD — Avançado (4×) ──────────────────────────────────────────────
  {
    id: "abcd-4x",
    name: "ABCD — Avançado",
    description: "Divisão em 4 dias com alto volume. Ideal para quem treina há mais tempo.",
    level: "Avançado",
    daysPerWeek: 4,
    goal: "Hipertrofia / Força",
    days: [
      {
        dayOfWeek: 1, // Segunda — A
        name: "A — Peito",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino Reto com Barra", sets: 4, reps: "6-8", restSecs: 120 },
          { name: "Supino Inclinado com Halteres", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Crucifixo Inclinado", sets: 3, reps: "12-15", restSecs: 75 },
          { name: "Peck Deck (Voador)", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Cross Over", sets: 3, reps: "15", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 2, // Terça — B
        name: "B — Costas",
        muscleGroup: "costas",
        exercises: [
          { name: "Barra Fixa", sets: 4, reps: "6-10", restSecs: 120 },
          { name: "Remada Curvada com Barra", sets: 4, reps: "6-8", restSecs: 120 },
          { name: "Remada T com Barra", sets: 3, reps: "10-12", restSecs: 90 },
          { name: "Puxada Alta com Triângulo", sets: 3, reps: "12", restSecs: 75 },
          { name: "Serrote com Halter", sets: 3, reps: "12 cada", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 4, // Quinta — C
        name: "C — Pernas",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre", sets: 5, reps: "5-8", restSecs: 150 },
          { name: "Leg Press 45°", sets: 4, reps: "10-12", restSecs: 90 },
          { name: "Hack Squat", sets: 3, reps: "12", restSecs: 90 },
          { name: "Mesa Flexora", sets: 4, reps: "10-12", restSecs: 75 },
          { name: "Panturrilha no Smith", sets: 5, reps: "15-20", restSecs: 45 },
        ],
      },
      {
        dayOfWeek: 5, // Sexta — D
        name: "D — Ombros e Braços",
        muscleGroup: "ombros",
        exercises: [
          { name: "Desenvolvimento com Barra", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Elevação Lateral", sets: 4, reps: "15", restSecs: 60 },
          { name: "Face Pull", sets: 3, reps: "15-20", restSecs: 60 },
          { name: "Rosca Direta com Barra", sets: 3, reps: "10-12", restSecs: 75 },
          { name: "Rosca Martelo", sets: 3, reps: "12 cada", restSecs: 60 },
          { name: "Tríceps Corda", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Tríceps Francês com Halteres", sets: 3, reps: "12", restSecs: 60 },
        ],
      },
    ],
  },

  // ─── 5. Upper / Lower — Intermediário (4×) ────────────────────────────────
  {
    id: "upper-lower-4x",
    name: "Upper / Lower — 4 dias",
    description: "Superior 2× e Inferior 2× por semana. Ótimo equilíbrio de volume e frequência.",
    level: "Intermediário",
    daysPerWeek: 4,
    goal: "Força e Hipertrofia",
    days: [
      {
        dayOfWeek: 1, // Segunda — Upper A
        name: "Upper A — Foco em Força",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino Reto com Barra", sets: 4, reps: "4-6", restSecs: 150 },
          { name: "Remada Curvada com Barra", sets: 4, reps: "4-6", restSecs: 150 },
          { name: "Supino Inclinado com Halteres", sets: 3, reps: "8-10", restSecs: 90 },
          { name: "Puxada Alta", sets: 3, reps: "8-10", restSecs: 90 },
          { name: "Desenvolvimento com Halteres", sets: 3, reps: "10-12", restSecs: 75 },
        ],
      },
      {
        dayOfWeek: 2, // Terça — Lower A
        name: "Lower A — Foco em Quadríceps",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre", sets: 4, reps: "4-6", restSecs: 150 },
          { name: "Leg Press 45°", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Cadeira Extensora", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Mesa Flexora", sets: 3, reps: "10-12", restSecs: 60 },
          { name: "Panturrilha", sets: 4, reps: "15-20", restSecs: 45 },
        ],
      },
      {
        dayOfWeek: 4, // Quinta — Upper B
        name: "Upper B — Foco em Hipertrofia",
        muscleGroup: "costas",
        exercises: [
          { name: "Supino com Halteres", sets: 4, reps: "10-12", restSecs: 90 },
          { name: "Serrote com Halter", sets: 4, reps: "10-12 cada", restSecs: 75 },
          { name: "Elevação Lateral", sets: 4, reps: "15", restSecs: 60 },
          { name: "Rosca Direta", sets: 3, reps: "12", restSecs: 60 },
          { name: "Tríceps Corda", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Face Pull", sets: 3, reps: "15-20", restSecs: 45 },
        ],
      },
      {
        dayOfWeek: 5, // Sexta — Lower B
        name: "Lower B — Foco em Posteriores",
        muscleGroup: "pernas",
        exercises: [
          { name: "Stiff com Barra", sets: 4, reps: "6-8", restSecs: 120 },
          { name: "Agachamento Búlgaro", sets: 3, reps: "10 cada", restSecs: 90 },
          { name: "Mesa Flexora", sets: 4, reps: "10-12", restSecs: 75 },
          { name: "Elevação Pélvica (Hip Thrust)", sets: 4, reps: "12-15", restSecs: 75 },
          { name: "Panturrilha Sentada", sets: 4, reps: "15-20", restSecs: 45 },
        ],
      },
    ],
  },
];

export const LEVEL_COLORS: Record<WorkoutTemplate["level"], string> = {
  "Iniciante": "text-green-400 bg-green-400/10 border-green-400/30",
  "Intermediário": "text-blue-400 bg-blue-400/10 border-blue-400/30",
  "Avançado": "text-purple-400 bg-purple-400/10 border-purple-400/30",
};
