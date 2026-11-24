export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCollections, createCollection } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function GET() {
  // Админка должна видеть и скрытые подборки — этот роут не фильтрует active.
  const collections = await getCollections();
  return NextResponse.json({ collections });
}

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return base || "collection";
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: 'Поле "title" обязательно' }, { status: 400 });
  }
  const productIds = Array.isArray(body.productIds) ? body.productIds : [];
  if (productIds.length === 0) {
    return NextResponse.json({ error: "Добавьте хотя бы один товар в подборку" }, { status: 400 });
  }

  const slug = body.slug ? String(body.slug).trim().toLowerCase() : slugify(body.title);

  try {
    const collection = await createCollection({
      slug,
      title: body.title,
      image: body.image || null,
      active: body.active ?? true,
      productIds
    });
    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    await logError("api/admin/collections POST", error);
    return NextResponse.json({ error: "Подборка с таким slug уже существует" }, { status: 409 });
  }
}
