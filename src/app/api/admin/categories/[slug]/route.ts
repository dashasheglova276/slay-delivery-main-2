export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryBySlug, updateCategory, deleteCategory } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
  return NextResponse.json({ category });
}

export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  const body = await request.json();
  try {
    const category = await updateCategory(params.slug, {
      name: body.name,
      emoji: body.emoji,
      image: body.image,
      active: body.active
    });
    return NextResponse.json({ category });
  } catch (error) {
    await logError("api/admin/categories/[slug] PATCH", error);
    return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { slug: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  try {
    await deleteCategory(params.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("api/admin/categories/[slug] DELETE", error);
    return NextResponse.json({ error: "Не удалось удалить категорию" }, { status: 400 });
  }
}
