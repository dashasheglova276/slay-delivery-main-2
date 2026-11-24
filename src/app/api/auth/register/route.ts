export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { verifyTurnstile } from "@/lib/turnstile";
import { logError } from "@/lib/logger";

const PHONE_RE = /^\+?\d{10,15}$/;

export async function POST(request: NextRequest) {
  try {
    const { name, phone, password, acceptedTerms, turnstileToken } = await request.json();

    // --- Серверная валидация ---
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Укажите имя (минимум 2 символа)" }, { status: 400 });
    }

    const normalizedPhone = String(phone ?? "").trim();

    if (!PHONE_RE.test(normalizedPhone)) {
      return NextResponse.json({ error: "Введите корректный номер телефона" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Пароль должен быть не короче 6 символов" }, { status: 400 });
    }

    if (!acceptedTerms) {
      return NextResponse.json(
        {
          error:
            "Необходимо согласиться с пользовательским соглашением и политикой обработки данных",
        },
        { status: 400 }
      );
    }

    // В режиме разработки пропускаем CAPTCHA
    const captchaOk =
      process.env.NODE_ENV === "development"
        ? true
        : await verifyTurnstile(turnstileToken);

    if (!captchaOk) {
      return NextResponse.json(
        {
          error: "Проверка CAPTCHA не пройдена. Обновите страницу и попробуйте снова",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким телефоном уже зарегистрирован" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: normalizedPhone,
        passwordHash,
        role: "CUSTOMER",
        termsAcceptedAt: new Date(),
      },
    });

    const token = await createSession(user.id);

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

    return response;
  } catch (error) {
    await logError("api/auth/register", error);

    return NextResponse.json(
      { error: "Не удалось завершить регистрацию, попробуйте ещё раз" },
      { status: 500 }
    );
  }
}