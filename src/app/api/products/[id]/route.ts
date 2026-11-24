export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProductById, updateProduct, deleteProduct } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  const body = await request.json();
  if (body.images !== undefined && (!Array.isArray(body.images) || body.images.length < 3)) {
    return NextResponse.json({ error: "У товара должно быть минимум 3 фотографии" }, { status: 400 });
  }
  if (body.saleType === "weight" && body.step !== undefined) {
    const stepNum = Number(body.step);
    if (!Number.isFinite(stepNum) || stepNum < 1 || !Number.isInteger(stepNum)) {
      return NextResponse.json({ error: "Шаг весового товара должен быть целым числом граммов (не меньше 1)" }, { status: 400 });
    }
  }
  if (body.price !== undefined || body.oldPrice !== undefined) {
    const current = await getProductById(params.id);
    const price = body.price !== undefined ? Number(body.price) : current?.price ?? 0;
    const oldPrice = body.oldPrice !== undefined ? (body.oldPrice ? Number(body.oldPrice) : null) : current?.oldPrice ?? null;
    body.discountPercent = oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
  }

  try {
    const product = await updateProduct(params.id, body);
    return NextResponse.json({ product });
  } catch (error) {
    await logError("api/products/[id] PATCH", error);
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  try {
    await deleteProduct(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("api/products/[id] DELETE", error);
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }
}
