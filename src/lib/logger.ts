import { prisma } from "@/lib/db";

/**
 * Единая точка логирования серверных ошибок. Пишет в консоль всегда,
 * а также best-effort сохраняет в таблицу ErrorLog для дальнейшего
 * разбора в Prisma Studio / аналитике. Никогда не бросает исключение
 * сама — вызов logError не должен уронить обработчик, в котором произошла
 * исходная ошибка.
 */
export async function logError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${context}]`, error);

  try {
    await prisma.errorLog.create({
      data: { message, context }
    });
  } catch {
    // Логирование не должно ронять запрос, даже если БД недоступна.
  }
}

/** Единый формат ответа об ошибке API — чтобы сообщения были предсказуемыми на фронте. */
export function apiError(message: string, status = 400) {
  return { error: message, status };
}
