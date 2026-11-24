import { PrismaClient } from "@prisma/client";

/**
 * Единственная точка подключения к PostgreSQL для всего проекта.
 * В dev-режиме Next.js пересобирает модули при каждом изменении файла —
 * без глобального кэша это создавало бы новое подключение к БД на каждый
 * hot-reload. Паттерн ниже — стандартная рекомендация Prisma для Next.js.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
