import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Component = { kind?: string; name?: string };

function extractShortAddress(components: Component[], fallback: string): string {
  const byKind = (kind: string) => components.find((item) => item.kind === kind)?.name;
  const locality = byKind("locality") || byKind("area") || byKind("province");
  const street = byKind("street");
  const house = byKind("house");
  const parts = [locality, [street, house].filter(Boolean).join(", ")].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : fallback;
}

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  const key = process.env.NEXT_PUBLIC_YANDEX_GEOCODER_API_KEY || process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Нужны координаты" }, { status: 400 });
  }
  if (!key) {
    return NextResponse.json({ error: "Нет ключа Яндекс.Карт" }, { status: 503 });
  }

  const url = new URL("https://geocode-maps.yandex.ru/1.x/");
  url.searchParams.set("apikey", key);
  url.searchParams.set("geocode", `${lng},${lat}`);
  url.searchParams.set("format", "json");
  url.searchParams.set("results", "1");
  url.searchParams.set("lang", "ru_RU");

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json({ error: "Не удалось определить адрес" }, { status: 502 });
  }

  const payload = await response.json();
  const geoObject = payload?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
  const meta = geoObject?.metaDataProperty?.GeocoderMetaData;
  const components: Component[] = meta?.Address?.Components ?? [];
  const fullText = String(meta?.text || geoObject?.name || "").trim();
  if (!fullText && components.length === 0) {
    return NextResponse.json({ error: "Адрес не найден" }, { status: 404 });
  }

  return NextResponse.json({
    address: extractShortAddress(components, fullText || `${lat}, ${lng}`),
    lat,
    lng
  });
}
