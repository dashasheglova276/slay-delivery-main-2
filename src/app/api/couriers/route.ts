export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCouriers, createCourier } from "@/lib/data-service";
import { logError } from "@/lib/logger";

const PHONE_RE = /^\+?\d{10,15}$/;

/** GET /api/couriers?all=1 — ?all=1 включает уволенных (isActive=false) для страницы управления курьерами. */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
    }
    const includeInactive = new URL(request.url).searchParams.get("all") === "1";
    const couriers = await getCouriers({ includeInactive });
    return NextResponse.json({ couriers });
  } catch (error) {
    await logError("api/couriers GET", error);
    return NextResponse.json({ error: "Не удалось загрузить курьеров" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
    }

    const { name, phone, password } = await request.json();
    if (!name || String(name).trim().length < 2) {
      return NextResponse.json({ error: "Укажите имя курьера" }, { status: 400 });
    }
    if (!PHONE_RE.test(String(phone ?? "").trim())) {
      return NextResponse.json({ error: "Введите корректный номер телефона" }, { status: 400 });
    }
    if (!password || String(password).length < 6) {
      return NextResponse.json({ error: "Пароль должен быть не короче 6 символов" }, { status: 400 });
    }

    const courier = await createCourier({ name: name.trim(), phone: phone.trim(), password });
    return NextResponse.json({ courier }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Курьер с таким телефоном уже существует" }, { status: 409 });
    }
    await logError("api/couriers POST", error);
    return NextResponse.json({ error: "Не удалось создать курьера" }, { status: 500 });
  }
}
