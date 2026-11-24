import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/geocode";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Нужны координаты" }, { status: 400 });
  }

  try {
    const hit = await reverseGeocode(lat, lng);
    if (!hit) return NextResponse.json({ error: "Адрес не найден" }, { status: 404 });
    return NextResponse.json(hit);
  } catch {
    return NextResponse.json({ error: "Не удалось определить адрес" }, { status: 502 });
  }
}
