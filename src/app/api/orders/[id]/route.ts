export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrderById, updateOrderStatus, assignCourier, getOrderStatusHistory } from "@/lib/data-service";
import { logError } from "@/lib/logger";
import type { OrderStatus } from "@/types";

const VALID_STATUSES: OrderStatus[] = [
  "new",
  "accepted",
  "picked_up",
  "in_transit",
  "delivered",
  "cancelled"
];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await getOrderById(params.id);
    if (!order) return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });

    const includeHistory = new URL(request.url).searchParams.get("history") === "1";
    const history = includeHistory ? await getOrderStatusHistory(params.id) : undefined;

    return NextResponse.json({ order, history });
  } catch (error) {
    await logError("api/orders/[id] GET", error);
    return NextResponse.json({ error: "Не удалось загрузить заказ" }, { status: 500 });
  }
}

/**
 * PATCH /api/orders/:id
 * body: { status?: OrderStatus, courierId?: string | null }
 * - ADMIN может менять статус и назначать курьера.
 * - COURIER может менять только статус, и только для заказа, назначенного на него.
 * Каждая смена статуса фиксируется в OrderStatusHistory (см. data-service.ts).
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

    const body = await request.json();
    const existing = await getOrderById(params.id);
    if (!existing) return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });

    if (user.role === "COURIER") {
      if (existing.courierId !== user.id) {
        return NextResponse.json({ error: "Этот заказ не назначен на вас" }, { status: 403 });
      }
      if (body.courierId !== undefined) {
        return NextResponse.json({ error: "Курьер не может переназначать заказы" }, { status: 403 });
      }
    } else if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    let order = existing;

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
      }
      order = await updateOrderStatus(params.id, body.status as OrderStatus, user.id);
    }

    if (body.courierId !== undefined) {
      order = await assignCourier(params.id, body.courierId);
    }

    return NextResponse.json({ order });
  } catch (error) {
    await logError("api/orders/[id] PATCH", error);
    return NextResponse.json({ error: "Не удалось обновить заказ" }, { status: 500 });
  }
}
