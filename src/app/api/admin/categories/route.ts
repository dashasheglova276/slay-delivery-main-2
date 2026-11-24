export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, createCategory } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  const body = await request.json();
  if (!body.slug || !body.name || !body.emoji) {
    return NextResponse.json({ error: "Заполните slug, название и эмодзи" }, { status: 400 });
  }
  const slug = String(body.slug).trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "Slug может содержать только латинские буквы, цифры и дефис" },
      { status: 400 }
    );
  }

  try {
    const category = await createCategory({
      slug,
      name: String(body.name).trim(),
      emoji: String(body.emoji).trim(),
      image: body.image || null,
      active: body.active ?? true
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    await logError("api/admin/categories POST", error);
    return NextResponse.json({ error: "Категория с таким slug уже существует" }, { status: 409 });
  }
}
