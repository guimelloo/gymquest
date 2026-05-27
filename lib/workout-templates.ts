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

  // ─── 6. 5×5 Força — Intermediário (5×) ──────────────────────────────────────
  {
    id: "5x5-forca-5x",
    name: "5×5 Força — Intermediário",
    description: "Treino powerlifting-style 5 dias por semana. Foco em agachamento, supino e levantamento terra.",
    level: "Intermediário",
    daysPerWeek: 5,
    goal: "Força",
    days: [
      {
        dayOfWeek: 1, // Segunda — Squat / Bench / Row
        name: "Dia A — Agachamento + Supino",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre", sets: 5, reps: "5", restSecs: 180 },
          { name: "Supino Reto com Barra", sets: 5, reps: "5", restSecs: 180 },
          { name: "Remada Curvada com Barra", sets: 5, reps: "5", restSecs: 180 },
        ],
      },
      {
        dayOfWeek: 2, // Terça — Deadlift / OHP
        name: "Dia B — Terra + Desenvolvimento",
        muscleGroup: "costas",
        exercises: [
          { name: "Levantamento Terra", sets: 1, reps: "5", restSecs: 300 },
          { name: "Desenvolvimento com Barra", sets: 5, reps: "5", restSecs: 180 },
          { name: "Puxada Alta com Barra Pronada", sets: 3, reps: "8-10", restSecs: 120 },
        ],
      },
      {
        dayOfWeek: 3, // Quarta — Squat / Bench / Row
        name: "Dia A — Agachamento + Supino",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre", sets: 5, reps: "5", restSecs: 180 },
          { name: "Supino Reto com Barra", sets: 5, reps: "5", restSecs: 180 },
          { name: "Remada Curvada com Barra", sets: 5, reps: "5", restSecs: 180 },
        ],
      },
      {
        dayOfWeek: 4, // Quinta — Deadlift / OHP
        name: "Dia B — Terra + Desenvolvimento",
        muscleGroup: "costas",
        exercises: [
          { name: "Levantamento Terra", sets: 1, reps: "5", restSecs: 300 },
          { name: "Desenvolvimento com Barra", sets: 5, reps: "5", restSecs: 180 },
          { name: "Barra Fixa", sets: 3, reps: "máx", restSecs: 120 },
        ],
      },
      {
        dayOfWeek: 5, // Sexta — Squat / Bench / Row
        name: "Dia A — Agachamento + Supino",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre", sets: 5, reps: "5", restSecs: 180 },
          { name: "Supino Reto com Barra", sets: 5, reps: "5", restSecs: 180 },
          { name: "Remada Curvada com Barra", sets: 5, reps: "5", restSecs: 180 },
        ],
      },
    ],
  },

  // ─── 7. HIIT + Musculação — Iniciante/Intermediário (4×) ─────────────────
  {
    id: "hiit-musculacao-4x",
    name: "HIIT + Musculação — Iniciante/Intermediário",
    description: "Combina musculação e HIIT em 4 dias por semana para queima de gordura e ganho de massa.",
    level: "Iniciante",
    daysPerWeek: 4,
    goal: "Emagrecimento / Condicionamento",
    days: [
      {
        dayOfWeek: 1, // Segunda — Upper + HIIT
        name: "Upper Body + HIIT",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino com Halteres", sets: 3, reps: "12", restSecs: 60 },
          { name: "Remada com Halteres", sets: 3, reps: "12 cada", restSecs: 60 },
          { name: "Desenvolvimento com Halteres", sets: 3, reps: "12", restSecs: 60 },
          { name: "Burpee", sets: 4, reps: "30s", restSecs: 30, notes: "HIIT — máxima intensidade" },
          { name: "Mountain Climbers", sets: 4, reps: "30s", restSecs: 30, notes: "HIIT" },
        ],
      },
      {
        dayOfWeek: 2, // Terça — Lower + HIIT
        name: "Lower Body + HIIT",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento com Halteres", sets: 3, reps: "15", restSecs: 60 },
          { name: "Avanço com Halteres", sets: 3, reps: "12 cada", restSecs: 60 },
          { name: "Elevação Pélvica", sets: 3, reps: "15", restSecs: 60 },
          { name: "Jumping Squat", sets: 4, reps: "30s", restSecs: 30, notes: "HIIT" },
          { name: "Jump Lunge", sets: 4, reps: "30s", restSecs: 30, notes: "HIIT" },
        ],
      },
      {
        dayOfWeek: 4, // Quinta — Full Body + Core
        name: "Full Body + Core",
        muscleGroup: "geral",
        exercises: [
          { name: "Agachamento Livre", sets: 3, reps: "12", restSecs: 75 },
          { name: "Flexão de Braço", sets: 3, reps: "10-15", restSecs: 60 },
          { name: "Prancha", sets: 3, reps: "45s", restSecs: 45 },
          { name: "Abdominal Crunch", sets: 3, reps: "20", restSecs: 45 },
          { name: "High Knees", sets: 4, reps: "30s", restSecs: 30, notes: "HIIT" },
        ],
      },
      {
        dayOfWeek: 5, // Sexta — HIIT Cardio + Força
        name: "Cardio HIIT + Força",
        muscleGroup: "geral",
        exercises: [
          { name: "Agachamento com Salto", sets: 4, reps: "30s", restSecs: 30, notes: "HIIT" },
          { name: "Burpee", sets: 4, reps: "30s", restSecs: 30, notes: "HIIT" },
          { name: "Remada com Cabo", sets: 3, reps: "15", restSecs: 60 },
          { name: "Tríceps Corda", sets: 3, reps: "15", restSecs: 60 },
          { name: "Rosca Direta", sets: 3, reps: "12", restSecs: 60 },
        ],
      },
    ],
  },
];

export interface AthleteTemplate {
  id: string;
  athleteName: string;
  sport: string;
  description: string;
  quote: string;
  daysPerWeek: number;
  goal: string;
  days: TemplateDay[];
}

export const ATHLETE_TEMPLATES: AthleteTemplate[] = [
  // ─── Cristiano Ronaldo ────────────────────────────────────────────────────
  {
    id: "ronaldo",
    athleteName: "Cristiano Ronaldo",
    sport: "Futebol",
    description: "Treino inspirado na rotina do CR7 — foco em explosão, core e membros superiores.",
    quote: "Talent without working hard is nothing.",
    daysPerWeek: 5,
    goal: "Força Explosiva / Definição",
    days: [
      {
        dayOfWeek: 1,
        name: "Explosão — Membros Superiores",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino Reto com Barra", sets: 4, reps: "8", restSecs: 90 },
          { name: "Flexão Explosiva com Palma", sets: 4, reps: "8", restSecs: 90, notes: "Pliométrico" },
          { name: "Desenvolvimento com Halteres", sets: 3, reps: "10", restSecs: 75 },
          { name: "Elevação Lateral", sets: 4, reps: "15", restSecs: 60 },
          { name: "Tríceps Corda", sets: 3, reps: "12", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 2,
        name: "Core & Agilidade",
        muscleGroup: "geral",
        exercises: [
          { name: "Prancha", sets: 4, reps: "60s", restSecs: 60 },
          { name: "Abdominal Roda", sets: 4, reps: "12", restSecs: 60 },
          { name: "Russian Twist", sets: 3, reps: "20", restSecs: 45 },
          { name: "Prancha Lateral", sets: 3, reps: "45s cada", restSecs: 45 },
          { name: "Mountain Climbers", sets: 4, reps: "30s", restSecs: 30 },
        ],
      },
      {
        dayOfWeek: 3,
        name: "Pernas Explosivas",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento com Salto", sets: 5, reps: "8", restSecs: 90, notes: "Explosivo" },
          { name: "Leg Press 45°", sets: 4, reps: "10", restSecs: 90 },
          { name: "Avanço com Halteres", sets: 3, reps: "12 cada", restSecs: 75 },
          { name: "Elevação de Panturrilha", sets: 5, reps: "20", restSecs: 45 },
        ],
      },
      {
        dayOfWeek: 4,
        name: "Costas & Bíceps",
        muscleGroup: "costas",
        exercises: [
          { name: "Barra Fixa", sets: 5, reps: "máx", restSecs: 90 },
          { name: "Remada Curvada com Barra", sets: 4, reps: "8", restSecs: 90 },
          { name: "Rosca Direta com Barra", sets: 3, reps: "10", restSecs: 75 },
          { name: "Rosca Martelo", sets: 3, reps: "12 cada", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 5,
        name: "HIIT + Sprints",
        muscleGroup: "geral",
        exercises: [
          { name: "Burpee", sets: 5, reps: "30s", restSecs: 30, notes: "Máxima intensidade" },
          { name: "Sprint no Lugar", sets: 6, reps: "20s", restSecs: 40 },
          { name: "Box Jump", sets: 4, reps: "10", restSecs: 60 },
          { name: "Jumping Squat", sets: 4, reps: "15", restSecs: 45 },
        ],
      },
    ],
  },

  // ─── Arnold Schwarzenegger ───────────────────────────────────────────────
  {
    id: "arnold",
    athleteName: "Arnold Schwarzenegger",
    sport: "Fisiculturismo",
    description: "O clássico Golden Six + divisão 6 dias de Arnold, simplificado em 6 dias.",
    quote: "The mind is the limit. As long as the mind can envision the fact that you can do something, you can do it.",
    daysPerWeek: 6,
    goal: "Hipertrofia Máxima",
    days: [
      {
        dayOfWeek: 1,
        name: "Peito & Costas",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino Reto com Barra", sets: 5, reps: "6-10", restSecs: 120 },
          { name: "Supino Inclinado com Halteres", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Cross Over", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Remada Curvada com Barra", sets: 5, reps: "6-10", restSecs: 120 },
          { name: "Puxada Alta com Barra", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Serrote com Halter", sets: 3, reps: "12 cada", restSecs: 75 },
        ],
      },
      {
        dayOfWeek: 2,
        name: "Ombros & Braços",
        muscleGroup: "ombros",
        exercises: [
          { name: "Desenvolvimento com Barra", sets: 5, reps: "6-10", restSecs: 90 },
          { name: "Desenvolvimento Arnold", sets: 4, reps: "10-12", restSecs: 75 },
          { name: "Elevação Lateral", sets: 4, reps: "12-15", restSecs: 60 },
          { name: "Rosca Direta com Barra", sets: 5, reps: "6-10", restSecs: 75 },
          { name: "Tríceps Testa com Barra", sets: 5, reps: "8-10", restSecs: 75 },
          { name: "Rosca Concentrada", sets: 3, reps: "10-12 cada", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 3,
        name: "Pernas",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre", sets: 5, reps: "8-10", restSecs: 150 },
          { name: "Leg Press 45°", sets: 4, reps: "10-12", restSecs: 120 },
          { name: "Cadeira Extensora", sets: 4, reps: "12-15", restSecs: 90 },
          { name: "Stiff", sets: 4, reps: "10-12", restSecs: 90 },
          { name: "Panturrilha em Pé", sets: 6, reps: "15-20", restSecs: 45 },
        ],
      },
      {
        dayOfWeek: 4,
        name: "Peito & Costas (Vol. 2)",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino Reto com Barra", sets: 5, reps: "6-10", restSecs: 120 },
          { name: "Crucifixo com Halteres", sets: 4, reps: "10-12", restSecs: 75 },
          { name: "Barra Fixa", sets: 4, reps: "máx", restSecs: 90 },
          { name: "Remada T com Barra", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Puxada com Triângulo", sets: 3, reps: "12", restSecs: 75 },
        ],
      },
      {
        dayOfWeek: 5,
        name: "Ombros & Braços (Vol. 2)",
        muscleGroup: "ombros",
        exercises: [
          { name: "Desenvolvimento com Halteres", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Face Pull", sets: 3, reps: "15-20", restSecs: 60 },
          { name: "Rosca Alternada", sets: 4, reps: "10-12 cada", restSecs: 75 },
          { name: "Rosca Martelo", sets: 3, reps: "12 cada", restSecs: 60 },
          { name: "Tríceps Corda", sets: 4, reps: "12-15", restSecs: 60 },
          { name: "Tríceps Francês com Halteres", sets: 3, reps: "10-12", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 6,
        name: "Pernas (Vol. 2)",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre", sets: 5, reps: "8-10", restSecs: 150 },
          { name: "Hack Squat", sets: 3, reps: "10-12", restSecs: 90 },
          { name: "Elevação Pélvica com Barra", sets: 4, reps: "12", restSecs: 90 },
          { name: "Mesa Flexora", sets: 4, reps: "10-12", restSecs: 75 },
          { name: "Panturrilha Sentada", sets: 5, reps: "15-20", restSecs: 45 },
        ],
      },
    ],
  },

  // ─── Chris Hemsworth (Thor) ──────────────────────────────────────────────
  {
    id: "hemsworth-thor",
    athleteName: "Chris Hemsworth",
    sport: "Cinema / Funcional",
    description: "Treino funcional de corpo inteiro para o papel do Thor — força, resistência e volume.",
    quote: "I push my body to the limit and beyond. That's what separates you from everyone else.",
    daysPerWeek: 5,
    goal: "Força Funcional / Hipertrofia",
    days: [
      {
        dayOfWeek: 1,
        name: "Peito & Tríceps — Força",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino Reto com Barra", sets: 4, reps: "6-8", restSecs: 120 },
          { name: "Supino Inclinado com Halteres", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Flexão com Peso", sets: 3, reps: "máx", restSecs: 75 },
          { name: "Tríceps Corda", sets: 4, reps: "12-15", restSecs: 60 },
          { name: "Tríceps Francês com Halteres", sets: 3, reps: "10-12", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 2,
        name: "Costas & Bíceps",
        muscleGroup: "costas",
        exercises: [
          { name: "Barra Fixa com Peso", sets: 5, reps: "5-8", restSecs: 120 },
          { name: "Remada com Haltere", sets: 4, reps: "10 cada", restSecs: 90 },
          { name: "Levantamento Terra", sets: 3, reps: "6-8", restSecs: 150 },
          { name: "Rosca Direta com Barra", sets: 4, reps: "10", restSecs: 75 },
          { name: "Rosca Concentrada", sets: 3, reps: "12 cada", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 3,
        name: "Pernas — Explosão",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre", sets: 5, reps: "5-8", restSecs: 150 },
          { name: "Agachamento com Salto", sets: 4, reps: "10", restSecs: 90, notes: "Explosivo" },
          { name: "Leg Press 45°", sets: 4, reps: "10-12", restSecs: 90 },
          { name: "Avanço com Halteres em Caminhada", sets: 3, reps: "12 cada", restSecs: 75 },
          { name: "Panturrilha em Pé", sets: 5, reps: "20", restSecs: 45 },
        ],
      },
      {
        dayOfWeek: 4,
        name: "Ombros & Core",
        muscleGroup: "ombros",
        exercises: [
          { name: "Desenvolvimento com Barra", sets: 4, reps: "6-8", restSecs: 120 },
          { name: "Elevação Lateral", sets: 4, reps: "15", restSecs: 60 },
          { name: "Face Pull", sets: 3, reps: "20", restSecs: 60 },
          { name: "Prancha", sets: 4, reps: "60s", restSecs: 60 },
          { name: "Abdominal Roda", sets: 3, reps: "12", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 5,
        name: "Full Body Funcional",
        muscleGroup: "geral",
        exercises: [
          { name: "Clean & Press com Barra", sets: 4, reps: "6", restSecs: 120, notes: "Funcional" },
          { name: "Agachamento Goblet", sets: 3, reps: "15", restSecs: 75 },
          { name: "Remada com Kettlebell", sets: 3, reps: "12 cada", restSecs: 75 },
          { name: "Burpee com Barra", sets: 4, reps: "8", restSecs: 90, notes: "Intensidade alta" },
          { name: "Farmer's Walk", sets: 4, reps: "30m", restSecs: 90 },
        ],
      },
    ],
  },

  // ─── Gal Gadot (Wonder Woman) ─────────────────────────────────────────────
  {
    id: "gadot-wonder-woman",
    athleteName: "Gal Gadot",
    sport: "Cinema / Funcional",
    description: "Treino funcional com ginástica, cardio e musculação para o papel da Mulher-Maravilha.",
    quote: "I was always a tomboy, and I was always active. I love working out.",
    daysPerWeek: 4,
    goal: "Força Funcional / Tônus / Resistência",
    days: [
      {
        dayOfWeek: 1,
        name: "Full Body Funcional + Cardio",
        muscleGroup: "geral",
        exercises: [
          { name: "Agachamento Goblet", sets: 3, reps: "15", restSecs: 60 },
          { name: "Flexão de Braço", sets: 3, reps: "12", restSecs: 60 },
          { name: "Avanço com Halteres", sets: 3, reps: "12 cada", restSecs: 60 },
          { name: "Remada com Halter", sets: 3, reps: "12 cada", restSecs: 60 },
          { name: "Mountain Climbers", sets: 4, reps: "30s", restSecs: 30, notes: "Cardio" },
        ],
      },
      {
        dayOfWeek: 2,
        name: "Ginástica & Core",
        muscleGroup: "geral",
        exercises: [
          { name: "Prancha", sets: 4, reps: "45s", restSecs: 45 },
          { name: "L-Sit", sets: 3, reps: "20s", restSecs: 60, notes: "Ginástica" },
          { name: "Abdominal Roda", sets: 3, reps: "10", restSecs: 60 },
          { name: "Prancha Lateral", sets: 3, reps: "30s cada", restSecs: 45 },
          { name: "Elevação de Pernas Suspensa", sets: 3, reps: "12", restSecs: 60 },
          { name: "Superman", sets: 3, reps: "15", restSecs: 45, notes: "Lombar" },
        ],
      },
      {
        dayOfWeek: 4,
        name: "Pernas & Glúteos",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento com Halteres", sets: 4, reps: "15", restSecs: 60 },
          { name: "Elevação Pélvica (Hip Thrust)", sets: 4, reps: "15", restSecs: 60 },
          { name: "Agachamento Búlgaro", sets: 3, reps: "12 cada", restSecs: 75 },
          { name: "Stiff com Halteres", sets: 3, reps: "12", restSecs: 75 },
          { name: "Abdutora", sets: 3, reps: "20", restSecs: 45 },
          { name: "Elevação Pélvica Unilateral", sets: 3, reps: "12 cada", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 5,
        name: "Upper Body + HIIT",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino com Halteres", sets: 3, reps: "12", restSecs: 75 },
          { name: "Remada com Halteres", sets: 3, reps: "12 cada", restSecs: 75 },
          { name: "Elevação Lateral", sets: 3, reps: "15", restSecs: 60 },
          { name: "Rosca Alternada", sets: 3, reps: "12 cada", restSecs: 60 },
          { name: "Burpee", sets: 5, reps: "30s", restSecs: 30, notes: "HIIT finalizador" },
        ],
      },
    ],
  },
];

// ─── Bodybuilder / Fisiculturista Templates ───────────────────────────────────
// These extend AthleteTemplate; using the same interface.

export const BODYBUILDER_TEMPLATES: AthleteTemplate[] = [
  // ─── Gabriel Ganley ────────────────────────────────────────────────────────
  {
    id: "ganley",
    athleteName: "Gabriel Ganley",
    sport: "Fisiculturismo — Classic Physique",
    description: "Treino de hipertrofia clássica em 5 dias inspirado no IFBB Pro brasileiro. Alto volume, foco em proporção e simetria.",
    quote: "Consistência é a chave — nenhum dia é opcional.",
    daysPerWeek: 5,
    goal: "Hipertrofia / Estética Clássica",
    days: [
      {
        dayOfWeek: 1,
        name: "Peito + Tríceps",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino Reto com Barra", sets: 4, reps: "8-10", restSecs: 90, notes: "Foco em contração máxima" },
          { name: "Supino Inclinado com Halteres", sets: 4, reps: "10-12", restSecs: 75 },
          { name: "Crucifixo Inclinado com Halteres", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Cross Over no Cabo (de baixo)", sets: 3, reps: "15", restSecs: 60, notes: "Contração forte no pico" },
          { name: "Tríceps Corda", sets: 4, reps: "12-15", restSecs: 60 },
          { name: "Tríceps Francês com Halteres", sets: 3, reps: "12", restSecs: 60 },
          { name: "Mergulho em Banco", sets: 3, reps: "máx", restSecs: 60, notes: "Finalizador" },
        ],
      },
      {
        dayOfWeek: 2,
        name: "Costas + Bíceps",
        muscleGroup: "costas",
        exercises: [
          { name: "Barra Fixa com Pegada Aberta", sets: 4, reps: "8-10", restSecs: 90, notes: "Largura de costas" },
          { name: "Remada Curvada com Barra", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Puxada Alta Frontal com Barra", sets: 3, reps: "10-12", restSecs: 75 },
          { name: "Serrote com Halter", sets: 3, reps: "12 cada", restSecs: 75 },
          { name: "Remada Baixa com Triângulo", sets: 3, reps: "12", restSecs: 60 },
          { name: "Rosca Direta com Barra", sets: 4, reps: "10", restSecs: 75 },
          { name: "Rosca Martelo", sets: 3, reps: "12 cada", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 3,
        name: "Ombros + Trapézio",
        muscleGroup: "ombros",
        exercises: [
          { name: "Desenvolvimento com Halteres", sets: 4, reps: "10-12", restSecs: 90 },
          { name: "Elevação Lateral com Halteres", sets: 5, reps: "15-20", restSecs: 60, notes: "3 séries normais + 2 drop-set" },
          { name: "Elevação Frontal com Anilha", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Face Pull com Corda", sets: 4, reps: "20", restSecs: 45, notes: "Saúde dos ombros" },
          { name: "Encolhimento com Halteres", sets: 4, reps: "12-15", restSecs: 60, notes: "Trapézio" },
          { name: "Encolhimento com Barra por Trás", sets: 3, reps: "15", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 4,
        name: "Pernas — Quadríceps + Panturrilha",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre", sets: 5, reps: "8-12", restSecs: 120 },
          { name: "Leg Press 45°", sets: 4, reps: "12-15", restSecs: 90 },
          { name: "Extensora", sets: 4, reps: "15-20", restSecs: 60, notes: "Pré-exaustão ou finalizador" },
          { name: "Agachamento Hack na Máquina", sets: 3, reps: "12", restSecs: 90 },
          { name: "Panturrilha em Pé na Máquina", sets: 5, reps: "15-20", restSecs: 45 },
          { name: "Panturrilha Sentada", sets: 4, reps: "20-25", restSecs: 45 },
        ],
      },
      {
        dayOfWeek: 5,
        name: "Pernas — Posterior + Abdômen",
        muscleGroup: "pernas",
        exercises: [
          { name: "Levantamento Terra Romeno com Barra", sets: 4, reps: "10-12", restSecs: 90 },
          { name: "Mesa Flexora", sets: 4, reps: "12-15", restSecs: 75 },
          { name: "Elevação Pélvica com Barra (Hip Thrust)", sets: 4, reps: "12", restSecs: 75 },
          { name: "Flexora em Pé (Unilateral)", sets: 3, reps: "12 cada", restSecs: 60 },
          { name: "Prancha", sets: 3, reps: "60s", restSecs: 45 },
          { name: "Abdominal Supra no Cabo", sets: 4, reps: "20", restSecs: 45 },
          { name: "Elevação de Pernas Suspensa", sets: 3, reps: "15", restSecs: 60 },
        ],
      },
    ],
  },

  // ─── Renato Cariani ────────────────────────────────────────────────────────
  {
    id: "cariani",
    athleteName: "Renato Cariani",
    sport: "Fisiculturismo — Men's Physique",
    description: "Método Nota 10 — treino de detalhamento e proporção em 5 dias, alto volume e cadência controlada.",
    quote: "Não treine apenas para ter um corpo bonito — treine para ter saúde, disciplina e propósito.",
    daysPerWeek: 5,
    goal: "Hipertrofia / Definição / Saúde",
    days: [
      {
        dayOfWeek: 1,
        name: "Peito — Alto Volume",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino Reto com Barra", sets: 4, reps: "10-12", restSecs: 75 },
          { name: "Supino Inclinado com Halteres", sets: 4, reps: "10-12", restSecs: 75 },
          { name: "Supino Declinado com Halteres", sets: 3, reps: "12", restSecs: 60 },
          { name: "Crucifixo com Halteres", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Cross Over de Cima", sets: 3, reps: "15", restSecs: 45, notes: "Porção inferior do peitoral" },
          { name: "Flexão de Braço com Pegada Fechada", sets: 3, reps: "máx", restSecs: 60, notes: "Finalizador" },
        ],
      },
      {
        dayOfWeek: 2,
        name: "Costas — Largura & Espessura",
        muscleGroup: "costas",
        exercises: [
          { name: "Puxada Alta Frontal Pegada Larga", sets: 4, reps: "10-12", restSecs: 75 },
          { name: "Remada Curvada com Barra (Supinada)", sets: 4, reps: "10", restSecs: 90 },
          { name: "Barra Fixa Pronada", sets: 3, reps: "máx", restSecs: 90 },
          { name: "Remada Máquina (Chest Supported)", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Puxada Alta com Triângulo", sets: 3, reps: "12", restSecs: 60, notes: "Foco em latíssimo baixo" },
          { name: "Pull-over na Polia", sets: 3, reps: "15", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 3,
        name: "Ombros — Detalhamento",
        muscleGroup: "ombros",
        exercises: [
          { name: "Desenvolvimento com Barra na Frente", sets: 4, reps: "10", restSecs: 90 },
          { name: "Desenvolvimento com Halteres", sets: 3, reps: "12", restSecs: 75 },
          { name: "Elevação Lateral Sentado", sets: 5, reps: "15", restSecs: 60 },
          { name: "Elevação Lateral com Cabo (Cruzado)", sets: 3, reps: "15 cada", restSecs: 60 },
          { name: "Face Pull", sets: 4, reps: "20", restSecs: 45 },
          { name: "Elevação Frontal Alternada", sets: 3, reps: "12 cada", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 4,
        name: "Pernas — Completo",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre", sets: 5, reps: "10-12", restSecs: 120 },
          { name: "Leg Press 45°", sets: 4, reps: "15", restSecs: 90 },
          { name: "Extensora", sets: 4, reps: "15-20", restSecs: 60 },
          { name: "Mesa Flexora", sets: 4, reps: "12-15", restSecs: 75 },
          { name: "Stiff com Barra", sets: 3, reps: "12", restSecs: 75 },
          { name: "Panturrilha Leg Press", sets: 5, reps: "20", restSecs: 45 },
        ],
      },
      {
        dayOfWeek: 5,
        name: "Braços — Bíceps + Tríceps",
        muscleGroup: "bracos",
        exercises: [
          { name: "Rosca Direta com Barra", sets: 4, reps: "10", restSecs: 75 },
          { name: "Rosca Alternada com Halteres (Supinada)", sets: 4, reps: "12 cada", restSecs: 60 },
          { name: "Rosca Concentrada", sets: 3, reps: "12 cada", restSecs: 60, notes: "Pico do bíceps" },
          { name: "Tríceps Corda na Polia", sets: 4, reps: "15", restSecs: 60 },
          { name: "Tríceps Francês Deitado (Skull Crusher)", sets: 4, reps: "10-12", restSecs: 75 },
          { name: "Mergulho entre Bancos", sets: 3, reps: "15", restSecs: 60, notes: "Finalizador tríceps" },
          { name: "Rosca 21s com Barra", sets: 3, reps: "21", restSecs: 75, notes: "7 baixo + 7 cima + 7 completo" },
        ],
      },
    ],
  },

  // ─── Julio Balestrini ──────────────────────────────────────────────────────
  {
    id: "balestrini",
    athleteName: "Julio Balestrini",
    sport: "Fisiculturismo — Classic Physique IFBB",
    description: "Protocolo voltado para o físico clássico — V-taper, proporção e separação muscular. 5 dias por semana.",
    quote: "O físico clássico é a fusão entre força e arte.",
    daysPerWeek: 5,
    goal: "Proporção Clássica / V-Taper / Hipertrofia",
    days: [
      {
        dayOfWeek: 1,
        name: "Costas — Largura (V-Taper)",
        muscleGroup: "costas",
        exercises: [
          { name: "Puxada Alta Pegada Pronada Aberta", sets: 5, reps: "8-12", restSecs: 90, notes: "Foco absoluto em lat" },
          { name: "Barra Fixa Neutra", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Puxada com Triângulo (Cabo)", sets: 4, reps: "12", restSecs: 75 },
          { name: "Pull-over com Halter", sets: 4, reps: "12-15", restSecs: 60, notes: "Expansão de caixa torácica" },
          { name: "Remada Sentado no Cabo", sets: 3, reps: "15", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 2,
        name: "Peito + Ombros Frontais",
        muscleGroup: "peito",
        exercises: [
          { name: "Supino Reto com Barra", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Supino Inclinado com Barra", sets: 4, reps: "10", restSecs: 90 },
          { name: "Crucifixo Inclinado com Halteres", sets: 3, reps: "12-15", restSecs: 60 },
          { name: "Crossover de Cima para Baixo", sets: 3, reps: "15", restSecs: 60 },
          { name: "Desenvolvimento com Barra (Frente)", sets: 4, reps: "10", restSecs: 90, notes: "Ombros frontais" },
          { name: "Elevação Frontal com Anilha", sets: 3, reps: "15", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 3,
        name: "Pernas — Quadríceps & Panturrilha",
        muscleGroup: "pernas",
        exercises: [
          { name: "Agachamento Livre com Barra Alta", sets: 5, reps: "10", restSecs: 120 },
          { name: "Leg Press 45° (Posição Fechada)", sets: 4, reps: "12-15", restSecs: 90, notes: "Ênfase em vasto lateral" },
          { name: "Extensora Unilateral", sets: 3, reps: "15 cada", restSecs: 60, notes: "Separação e definição" },
          { name: "Afundo com Barra (Step)", sets: 3, reps: "12 cada", restSecs: 75 },
          { name: "Panturrilha em Pé (Máquina)", sets: 6, reps: "15", restSecs: 45 },
          { name: "Panturrilha no Leg Press", sets: 4, reps: "20", restSecs: 45 },
        ],
      },
      {
        dayOfWeek: 4,
        name: "Costas Espessura + Braços",
        muscleGroup: "costas",
        exercises: [
          { name: "Levantamento Terra", sets: 4, reps: "5-8", restSecs: 180, notes: "Base de espessura" },
          { name: "Remada Curvada com Barra", sets: 4, reps: "8-10", restSecs: 90 },
          { name: "Serrote com Halter", sets: 4, reps: "10 cada", restSecs: 75 },
          { name: "Rosca Direta com Barra", sets: 4, reps: "10", restSecs: 75 },
          { name: "Rosca Spider (no Banco Inclinado)", sets: 3, reps: "12", restSecs: 60, notes: "Pico máximo de bíceps" },
          { name: "Tríceps Testa com Barra EZ", sets: 4, reps: "10-12", restSecs: 75 },
          { name: "Tríceps Corda no Cabo", sets: 3, reps: "15", restSecs: 60 },
        ],
      },
      {
        dayOfWeek: 5,
        name: "Ombros Laterais + Posterior + Pernas Posterior",
        muscleGroup: "ombros",
        exercises: [
          { name: "Elevação Lateral em Pé", sets: 5, reps: "15-20", restSecs: 60, notes: "V-taper — deltoides laterais" },
          { name: "Elevação Lateral Deitado no Banco Inclinado", sets: 4, reps: "15", restSecs: 60 },
          { name: "Face Pull com Corda", sets: 4, reps: "20", restSecs: 45 },
          { name: "Stiff com Barra", sets: 4, reps: "10-12", restSecs: 90, notes: "Posterior de coxa" },
          { name: "Mesa Flexora", sets: 3, reps: "12-15", restSecs: 75 },
          { name: "Elevação Pélvica com Barra", sets: 3, reps: "15", restSecs: 75 },
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
