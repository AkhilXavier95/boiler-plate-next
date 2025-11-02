import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Get DATABASE_URL with fallback for build time (prisma generate doesn't need real DB)
const databaseUrl = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  engine: "classic",
  datasource: {
    url: databaseUrl
  }
});
