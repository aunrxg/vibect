export * from "@prisma/client";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["warn", "error"],
  });
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
