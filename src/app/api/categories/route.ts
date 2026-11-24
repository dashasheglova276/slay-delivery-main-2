export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getCategories } from "@/lib/data-service";

/** Публичный список категорий — загружается динамически из БД. Скрытые (active=false)
 * категории на витрине не показываются, но остаются видны в админке. */
export async function GET() {
  const categories = await getCategories({ onlyActive: true });
  return NextResponse.json({ categories });
}
