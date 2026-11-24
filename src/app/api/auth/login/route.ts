export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { logError } from "@/lib/logger";

/**
 * Единый вход по телефону+паролю для всех трёх ролей (ADMIN/COURIER/CUSTOMER).
 * Раньше клиентам вход был закрыт (у них не было пароля вовсе) — теперь после
 * регистрации (/api/auth/register) клиент логинится через этот же эндпоинт.
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "Введите телефон и пароль" }, { status: 400 });
    }
    // register() делает .trim() перед сохранением — здесь та же нормализация,
    // иначе случайный пробел (автозаполнение браузера, копипаст) даёт ложное
    // "неверный телефон или пароль" на корректных данных.
    const normalizedPhone = String(phone).trim();
    const user = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Неверный телефон или пароль" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Учётная запись деактивирована" }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Неверный телефон или пароль" }, { status: 401 });
    }

    const token = await createSession(user.id);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role }
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    await logError("api/auth/login", error);
    return NextResponse.json({ error: "Не удалось выполнить вход, попробуйте ещё раз" }, { status: 500 });
  }
}
