export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateCourier } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
    }

    const body = await request.json();
    if (body.password && String(body.password).length < 6) {
      return NextResponse.json({ error: "Пароль должен быть не короче 6 символов" }, { status: 400 });
    }

    const courier = await updateCourier(params.id, {
      name: body.name,
      phone: body.phone,
      password: body.password,
      isActive: body.isActive
    });
    return NextResponse.json({ courier });
  } catch (error) {
    await logError("api/couriers/[id] PATCH", error);
    return NextResponse.json({ error: "Не удалось обновить курьера" }, { status: 500 });
  }
}
