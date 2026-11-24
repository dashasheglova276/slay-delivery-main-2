export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cancelOwnOrder } from "@/lib/data-service";
import { logError } from "@/lib/logger";

/**
 * POST /api/me/orders/:id/cancel
 * Клиент может отменить свой заказ, только пока он не оплачен
 * (статус "new" или "accepted" — см. CANCELLABLE_STATUSES в src/types/index.ts).
 * После оплаты отмена самостоятельно недоступна.
 */
export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

  try {
    const order = await cancelOwnOrder(params.id, user.phone);
    return NextResponse.json({ order });
  } catch (error) {
    const code = (error as Error & { code?: string }).code;
    if (code === "NOT_FOUND") {
      return NextResponse.json({ error: (error as Error).message }, { status: 404 });
    }
    if (code === "FORBIDDEN") {
      return NextResponse.json({ error: (error as Error).message }, { status: 403 });
    }
    if (code === "NOT_CANCELLABLE") {
      return NextResponse.json({ error: (error as Error).message }, { status: 409 });
    }
    await logError("api/me/orders/[id]/cancel POST", error);
    return NextResponse.json({ error: "Не удалось отменить заказ" }, { status: 500 });
  }
}
