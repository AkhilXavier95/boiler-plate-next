// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log queries in development to reduce overhead in production
    log: process.env.NODE_ENV === "development" 
      ? ["query", "info", "warn", "error"]
      : ["warn", "error"]
  });

// Prisma connection pooling is configured via DATABASE_URL query parameters
// connection_limit=10&pool_timeout=20 are set in docker-compose.yml

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
