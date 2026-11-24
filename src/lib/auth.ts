import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

export { hashPassword, verifyPassword } from "@/lib/password";

export const SESSION_COOKIE = "slay_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 дней

/** Создаёт запись сессии в БД и возвращает непрозрачный токен для cookie. */
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS)
    }
  });
  return token;
}

export async function destroySessionByToken(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export interface SessionUser {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string | null;
  role: Role;
  isActive: boolean;
}

/** Читает cookie текущего запроса и возвращает пользователя, если сессия валидна. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }

  // Уволенный курьер / деактивированный пользователь теряет доступ сразу,
  // даже если у него есть непросроченная cookie сессии.
  if (!session.user.isActive) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    phone: session.user.phone,
    avatarUrl: session.user.avatarUrl,
    role: session.user.role,
    isActive: session.user.isActive
  };
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000
  };
}
