export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAddresses, createAddress } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

  const addresses = await getAddresses(user.id);
  return NextResponse.json({ addresses });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

  const body = await request.json();
  if (!body.address || typeof body.address !== "string" || !body.address.trim()) {
    return NextResponse.json({ error: "Укажите адрес" }, { status: 400 });
  }

  try {
    const address = await createAddress(user.id, {
      label: body.label?.trim() || "Адрес",
      address: body.address.trim(),
      entrance: body.entrance || null,
      floor: body.floor || null,
      apartment: body.apartment || null,
      comment: body.comment || null,
      lat: typeof body.lat === "number" ? body.lat : null,
      lng: typeof body.lng === "number" ? body.lng : null,
      isDefault: Boolean(body.isDefault)
    });
    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    await logError("api/me/addresses POST", error);
    return NextResponse.json({ error: "Не удалось сохранить адрес" }, { status: 500 });
  }
}
