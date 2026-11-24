export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAnalytics } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
    }
    const analytics = await getAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    await logError("api/admin/analytics", error);
    return NextResponse.json({ error: "Не удалось загрузить аналитику" }, { status: 500 });
  }
}
