export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { reorderCategories } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  const body = await request.json();
  const slugs: string[] = Array.isArray(body.slugs) ? body.slugs : [];
  if (slugs.length === 0) {
    return NextResponse.json({ error: "Список slug'ов пуст" }, { status: 400 });
  }

  try {
    await reorderCategories(slugs);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("api/admin/categories/reorder POST", error);
    return NextResponse.json({ error: "Не удалось изменить порядок" }, { status: 400 });
  }
}
