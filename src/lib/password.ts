import bcrypt from "bcryptjs";

/**
 * Хэширование паролей через bcrypt (bcryptjs — чистый JS, без нативной
 * компиляции, что важно для деплоя на разные платформы). 12 раундов —
 * стандартный баланс безопасности/скорости для production.
 */
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, stored);
  } catch {
    return false;
  }
}
