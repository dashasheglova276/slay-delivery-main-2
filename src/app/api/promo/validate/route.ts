export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validatePromoCode } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) return NextResponse.json({ error: "Введите промокод" }, { status: 400 });

    const user = await getCurrentUser();
    const result = await validatePromoCode(code, user?.role === "CUSTOMER" ? user.id : undefined);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ discountPercent: result.discountPercent, code: code.trim().toUpperCase() });
  } catch (error) {
    await logError("api/promo/validate", error);
    return NextResponse.json({ error: "Не удалось проверить промокод" }, { status: 500 });
  }
}
