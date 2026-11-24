export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateUserProfile } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Имя должно быть не короче 2 символов" }, { status: 400 });
  }

  try {
    await updateUserProfile(user.id, { name });
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("api/me/profile PATCH", error);
    return NextResponse.json({ error: "Не удалось сохранить изменения" }, { status: 500 });
  }
}
