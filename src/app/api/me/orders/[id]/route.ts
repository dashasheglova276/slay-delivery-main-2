export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrderById } from "@/lib/data-service";
import { logError } from "@/lib/logger";

/**
 * GET /api/me/orders/:id
 * Разрешает клиенту открыть карточку СВОЕГО заказа (основа для будущего
 * экрана отслеживания) — переиспользует уже существующий getOrderById,
 * только добавляет проверку принадлежности заказа текущему пользователю.
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

  try {
    const order = await getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }
    if (order.customerPhone !== user.phone) {
      return NextResponse.json({ error: "Этот заказ принадлежит другому пользователю" }, { status: 403 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    await logError("api/me/orders/[id] GET", error);
    return NextResponse.json({ error: "Не удалось загрузить заказ" }, { status: 500 });
  }
}
