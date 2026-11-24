export type GeocodeHit = { address: string; lat: number; lng: number };

const NOMINATIM = "https://nominatim.openstreetmap.org";
const USER_AGENT = "StarFoodDelivery/1.0 (delivery address picker)";
const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = { at: number; value: GeocodeHit[] };
const cache = new Map<string, CacheEntry>();

let lastNominatimAt = 0;
let nominatimQueue: Promise<unknown> = Promise.resolve();

function inDeliveryZone(lat: number, lng: number) {
  return lat >= 44.7 && lat <= 45.2 && lng >= 33.7 && lng <= 34.5;
}

function remember(key: string, value: GeocodeHit[]) {
  cache.set(key, { at: Date.now(), value });
  return value;
}

function recall(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function preferZone(hits: GeocodeHit[]) {
  const inside = hits.filter((hit) => inDeliveryZone(hit.lat, hit.lng));
  return inside.length > 0 ? inside : hits;
}

type Component = { kind?: string; name?: string };

function shortYandexAddress(components: Component[], fallback: string) {
  const byKind = (kind: string) => components.find((item) => item.kind === kind)?.name;
  const locality = byKind("locality") || byKind("area") || byKind("province");
  const street = byKind("street");
  const house = byKind("house");
  const parts = [locality, [street, house].filter(Boolean).join(", ")].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : fallback;
}

function shortNominatimAddress(address: Record<string, string> | undefined, fallback: string) {
  if (!address) return fallback;
  const city = address.city || address.town || address.village || address.municipality || "Симферополь";
  const street = address.road || address.pedestrian || address.residential || address.square || address.footway || address.suburb;
  const streetLine = [street, address.house_number].filter(Boolean).join(", ");
  const parts = [city, streetLine].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : fallback;
}

function metersBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = Math.PI / 180;
  const dLat = (bLat - aLat) * toRad;
  const dLng = (bLng - aLng) * toRad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * toRad) * Math.cos(bLat * toRad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function hasHouseNumber(address: string) {
  return /(?:^|[,\s])\d+[а-яa-z]?(?:\/\d+)?$/i.test(address.trim());
}

async function yandexLookup(geocode: string, limit: number, extra?: Record<string, string>): Promise<GeocodeHit[] | null> {
  const key = process.env.NEXT_PUBLIC_YANDEX_GEOCODER_API_KEY || process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  if (!key) return null;
  const url = new URL("https://geocode-maps.yandex.ru/1.x/");
  url.searchParams.set("apikey", key);
  url.searchParams.set("geocode", geocode);
  url.searchParams.set("format", "json");
  url.searchParams.set("results", String(limit));
  url.searchParams.set("lang", "ru_RU");
  for (const [name, value] of Object.entries(extra ?? {})) url.searchParams.set(name, value);
  if (!/^-?\d+(\.\d+)?\s*,\s*-?\d+/.test(geocode)) {
    url.searchParams.set("ll", "34.1024,44.9521");
    url.searchParams.set("spn", "0.45,0.35");
    url.searchParams.set("rspn", "1");
  }
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  const payload = await response.json();
  const members = payload?.response?.GeoObjectCollection?.featureMember ?? [];
  const hits: GeocodeHit[] = [];
  for (const member of members) {
    const geoObject = member?.GeoObject;
    const meta = geoObject?.metaDataProperty?.GeocoderMetaData;
    const pos = String(geoObject?.Point?.pos || "");
    const [lngText, latText] = pos.split(" ");
    const lat = Number(latText);
    const lng = Number(lngText);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const components: Component[] = meta?.Address?.Components ?? [];
    const fullText = String(meta?.text || geoObject?.name || "").trim();
    hits.push({
      address: shortYandexAddress(components, fullText || `${lat.toFixed(5)}, ${lng.toFixed(5)}`),
      lat,
      lng
    });
  }
  return hits;
}

function nominatim<T>(path: string): Promise<T> {
  const run = nominatimQueue.then(async () => {
    const wait = Math.max(0, 1100 - (Date.now() - lastNominatimAt));
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastNominatimAt = Date.now();
    const response = await fetch(`${NOMINATIM}${path}`, {
      cache: "no-store",
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "ru"
      }
    });
    if (!response.ok) throw new Error(`nominatim ${response.status}`);
    return response.json() as Promise<T>;
  });
  nominatimQueue = run.then(() => undefined, () => undefined);
  return run;
}

function fromNominatimItems(items: Array<{ lat?: string; lon?: string; display_name?: string; address?: Record<string, string> }>) {
  const hits: GeocodeHit[] = [];
  for (const item of items) {
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    hits.push({
      address: shortNominatimAddress(item.address, item.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`),
      lat,
      lng
    });
  }
  return preferZone(hits);
}

function nearestHouse(hits: GeocodeHit[], lat: number, lng: number, maxMeters: number) {
  const houses = hits
    .filter((hit) => hasHouseNumber(hit.address))
    .map((hit) => ({ hit, meters: metersBetween(lat, lng, hit.lat, hit.lng) }))
    .filter((item) => item.meters <= maxMeters)
    .sort((a, b) => a.meters - b.meters);
  return houses[0]?.hit ?? null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeHit | null> {
  const key = `r:${lat.toFixed(5)}:${lng.toFixed(5)}`;
  const cached = recall(key);
  if (cached) return cached[0] ?? null;

  const houses = await yandexLookup(`${lng},${lat}`, 8, { kind: "house" }).catch(() => null);
  const nearest = houses ? nearestHouse(houses, lat, lng, 220) : null;
  if (nearest) return remember(key, [nearest])[0];

  const yandex = await yandexLookup(`${lng},${lat}`, 1).catch(() => null);
  const precise = yandex ? nearestHouse(yandex, lat, lng, 80) : null;
  if (precise) return remember(key, [precise])[0];

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "jsonv2",
    addressdetails: "1",
    zoom: "18",
    "accept-language": "ru"
  });
  const item = await nominatim<{ lat?: string; lon?: string; display_name?: string; address?: Record<string, string> }>(`/reverse?${params}`).catch(() => null);
  const hits = item ? fromNominatimItems([item]) : [];
  const house = nearestHouse(hits, lat, lng, 180);
  if (house) return remember(key, [house])[0];
  if (yandex && yandex.length > 0) return remember(key, yandex)[0];
  return hits.length > 0 ? remember(key, hits)[0] : null;
}

function normalizeQuery(query: string) {
  const trimmed = query.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return /симферополь/i.test(trimmed) ? trimmed : `Симферополь, ${trimmed}`;
}

export async function searchGeocode(query: string, limit = 6): Promise<GeocodeHit[]> {
  const normalized = normalizeQuery(query);
  if (normalized.length < 2) return [];
  const key = `s:${limit}:${normalized.toLowerCase()}`;
  const cached = recall(key);
  if (cached) return cached;

  const yandex = await yandexLookup(normalized, limit).catch(() => null);
  if (yandex && yandex.length > 0) return remember(key, preferZone(yandex));

  const street = normalized.replace(/симферополь,?/ig, "").trim();
  const structured = new URLSearchParams({
    street,
    city: "Симферополь",
    format: "jsonv2",
    addressdetails: "1",
    limit: String(limit),
    "accept-language": "ru"
  });
  let items = await nominatim<any[]>(`/search?${structured}`).catch(() => []);
  if (!Array.isArray(items) || items.length === 0) {
    const free = new URLSearchParams({
      q: normalized,
      format: "jsonv2",
      addressdetails: "1",
      limit: String(limit),
      viewbox: "33.90,45.08,34.25,44.80",
      "accept-language": "ru"
    });
    items = await nominatim<any[]>(`/search?${free}`).catch(() => []);
  }
  const hits = fromNominatimItems(Array.isArray(items) ? items : []).slice(0, limit);
  return remember(key, hits);
}
