export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCollectionBySlug, updateCollection, deleteCollection } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const collection = await getCollectionBySlug(params.slug);
  if (!collection) return NextResponse.json({ error: "Подборка не найдена" }, { status: 404 });
  return NextResponse.json({ collection });
}

export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  const body = await request.json();
  try {
    const collection = await updateCollection(params.slug, {
      title: body.title,
      image: body.image !== undefined ? body.image || null : undefined,
      active: body.active,
      productIds: Array.isArray(body.productIds) ? body.productIds : undefined
    });
    return NextResponse.json({ collection });
  } catch (error) {
    await logError("api/admin/collections/[slug] PATCH", error);
    return NextResponse.json({ error: "Подборка не найдена" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { slug: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  try {
    await deleteCollection(params.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("api/admin/collections/[slug] DELETE", error);
    return NextResponse.json({ error: "Не удалось удалить подборку" }, { status: 400 });
  }
}
