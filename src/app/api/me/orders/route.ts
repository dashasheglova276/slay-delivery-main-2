export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForCustomerPhone } from "@/lib/data-service";

/**
 * История заказов авторизованного пользователя. Раньше бралась по отдельной
 * legacy-cookie с телефоном последнего гостевого заказа — из-за этого у
 * реально залогиненных пользователей вкладка "Заказы" в профиле часто была
 * пустой, даже если заказы были. Теперь используем телефон из настоящей
 * сессии (см. src/lib/auth.ts).
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ orders: [] });

  const orders = await getOrdersForCustomerPhone(user.phone);
  return NextResponse.json({ orders });
}
