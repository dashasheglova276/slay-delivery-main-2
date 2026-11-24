import { NextRequest, NextResponse } from "next/server";
import { searchGeocode } from "@/lib/geocode";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (query.length < 2) {
    return NextResponse.json({ error: "Введите адрес" }, { status: 400 });
  }

  try {
    const results = await searchGeocode(query);
    if (results.length === 0) return NextResponse.json({ error: "Адрес не найден" }, { status: 404 });
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Не удалось найти адрес" }, { status: 502 });
  }
}
