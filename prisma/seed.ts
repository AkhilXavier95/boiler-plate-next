import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password,
      role: "ADMIN"
    }
  });

  console.log("✅ Admin user seeded: admin@example.com / admin123");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
