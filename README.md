# ⚔️ GymQuest — Fitness Gamificado

App de fitness gamificado com Next.js 14, Prisma e PostgreSQL (Neon).

## 🚀 Funcionalidades

- **Dashboard gamificado** — XP, níveis, streaks, conquistas
- **Medidas corporais** — Peso, gordura corporal, cintura + gráficos
- **Alimentação** — Busca Open Food Facts, registro de refeições, macros
- **Treino** — Planos personalizados, registro e histórico
- **Metas/Missões** — Metas com prazos e XP de recompensa
- **Sistema de conquistas** — 13 conquistas para desbloquear

## 🛠️ Setup

### 1. Banco (Neon — gratuito)
Crie em [neon.tech](https://neon.tech) e copie a connection string.

### 2. .env
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
AUTH_SECRET="gere com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Instalar
```bash
npm install
npx prisma db push
npm run dev
```

## ☁️ Deploy Vercel
1. Push para GitHub
2. Importe no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

As URLs do Neon: pooled → DATABASE_URL, direct → DIRECT_URL
