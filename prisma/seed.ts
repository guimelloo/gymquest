import { PrismaClient } from "@prisma/client";
import { ACHIEVEMENTS } from "../lib/gamification";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding achievements...");

  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      update: {},
      create: ach,
    });
    console.log(`  ✅ ${ach.icon} ${ach.name}`);
  }

  console.log("✅ Seed completo!");
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
