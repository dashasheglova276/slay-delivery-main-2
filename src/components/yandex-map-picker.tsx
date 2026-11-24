"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, AlertCircle, X } from "lucide-react";

declare global {
  interface Window {
    ymaps?: any;
  }
}

const DEFAULT_CENTER: [number, number] = [44.9521, 34.1024];
const SIMFEROPOL_BOUNDS: [[number, number], [number, number]] = [
  [44.80, 33.90],
  [45.08, 34.25]
];

function extractShortAddress(geoObject: any, fallbackText: string): string {
  const components: { kind: string; name: string }[] =
    geoObject?.metaDataProperty?.GeocoderMetaData?.Address?.Components ?? [];
  const byKind = (kind: string) => components.find((c) => c.kind === kind)?.name;
  const locality = byKind("locality") || byKind("area") || byKind("province");
  const street = byKind("street");
  const house = byKind("house");
  const parts = [locality, [street, house].filter(Boolean).join(", ")].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : fallbackText;
}

function suggestionLabel(item: any): string {
  return String(item?.displayName || item?.value || "").trim();
}

function inDeliveryZone(coords: [number, number]) {
  return coords[0] >= 44.70 && coords[0] <= 45.20 && coords[1] >= 33.70 && coords[1] <= 34.50;
}

function browserPosition(
  options: PositionOptions
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("no-geolocation"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export default function YandexMapPicker({
  onSelect,
  value,
  className
}: {
  onSelect: (data: { address: string; lat: number; lng: number }) => void;
  value?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<any>(null);
  const userAdjustedLocationRef = useRef(false);
  const geoRequestRef = useRef(0);
  const addressRequestRef = useRef(0);
  const suppressSuggestionsRef = useRef(false);
  const queryRef = useRef(value ?? "");
  const emittedAddressRef = useRef("");
  const onSelectRef = useRef(onSelect);
  const reverseTimerRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState(value ?? "");
  const [scriptError, setScriptError] = useState(false);
  const [geocodeError, setGeocodeError] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionBox, setSuggestionBox] = useState({ top: 0, left: 0, width: 0 });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);

  queryRef.current = query;
  onSelectRef.current = onSelect;

  const mapKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  const suggestKey = process.env.NEXT_PUBLIC_YANDEX_SUGGEST_API_KEY;

  function updateSuggestionBox() {
    const input = inputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    setSuggestionBox({ top: rect.bottom + 8, left: rect.left, width: rect.width });
  }

  useEffect(() => {
    const text = query.trim();
    const ymaps = window.ymaps;
    if (suppressSuggestionsRef.current) {
      suppressSuggestionsRef.current = false;
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    if (!ready || !ymaps || text.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      const request = /симферополь/i.test(text) ? text : `Симферополь, ${text}`;
      ymaps.suggest(request, { boundedBy: SIMFEROPOL_BOUNDS, results: 8 })
        .then((items: any[]) => {
          if (!active) return;
          const next = (items || []).filter((item) => suggestionLabel(item));
          setSuggestions(next);
          if (next.length > 0 && document.activeElement === inputRef.current) {
            updateSuggestionBox();
            setSuggestionsOpen(true);
          } else {
            setSuggestionsOpen(false);
          }
        })
        .catch(() => { if (active) setSuggestions([]); });
    }, 220);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, ready]);

  const applyResolvedAddress = useCallback((address: string, coords: [number, number]) => {
    emittedAddressRef.current = address;
    setGeocodeError(false);
    suppressSuggestionsRef.current = true;
    setQuery(address);
    onSelectRef.current({ address, lat: coords[0], lng: coords[1] });
  }, []);

  const getAddress = useCallback(async (coords: [number, number]) => {
    const requestId = ++addressRequestRef.current;
    const apply = (address: string) => {
      if (requestId !== addressRequestRef.current) return;
      applyResolvedAddress(address, coords);
    };
    const precise = (address: string) => /[0-9]|ул|улица|просп|пер\.|переулок|бульвар/i.test(address);
    let fallbackAddress = "";

    try {
      const ymaps = window.ymaps;
      if (ymaps?.geocode) {
        const response = await ymaps.geocode(coords, { results: 1, kind: "house" }).catch(() => ymaps.geocode(coords, { results: 1 }));
        if (requestId !== addressRequestRef.current) return;
        const geoObject = response?.geoObjects?.get?.(0);
        if (geoObject) {
          const meta = geoObject.properties.get("metaDataProperty")?.GeocoderMetaData
            ?? geoObject.properties.get("metaDataProperty.GeocoderMetaData");
          const fullText = meta?.text ?? geoObject.getAddressLine?.() ?? `${coords[0]}, ${coords[1]}`;
          const address = extractShortAddress({ metaDataProperty: { GeocoderMetaData: meta } }, fullText);
          if (precise(address)) {
            apply(address);
            return;
          }
          fallbackAddress = address;
        }
      }
    } catch {
      // Fall through to the HTTP geocoder.
    }

    try {
      const response = await fetch(`/api/geocode/reverse?lat=${encodeURIComponent(String(coords[0]))}&lng=${encodeURIComponent(String(coords[1]))}`, { cache: "no-store" });
      if (requestId !== addressRequestRef.current) return;
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.address) {
        apply(String(data.address));
        return;
      }
    } catch {
      // Keep the geocode error below.
    }

    if (requestId !== addressRequestRef.current) return;
    if (fallbackAddress) {
      apply(fallbackAddress);
      return;
    }
    setGeocodeError(true);
  }, [applyResolvedAddress]);

  const scheduleGetAddress = useCallback((coords: [number, number]) => {
    window.clearTimeout(reverseTimerRef.current);
    reverseTimerRef.current = window.setTimeout(() => { void getAddress(coords); }, 180);
  }, [getAddress]);

  useEffect(() => {
    if (value === undefined) return;
    if (value === queryRef.current || value === emittedAddressRef.current) return;
    if (document.activeElement === inputRef.current) return;
    setQuery(value);
    const ymaps = window.ymaps;
    const map = mapRef.current;
    const trimmed = value.trim();
    if (!ymaps || !map || !trimmed) return;
    ymaps.geocode(trimmed, { results: 1, boundedBy: SIMFEROPOL_BOUNDS })
      .then((res: any) => {
        const first = res.geoObjects.get(0);
        if (!first) return;
        const coords = first.geometry.getCoordinates() as [number, number];
        map.setCenter(coords, 17, { duration: 280 });
        void getAddress(coords);
      })
      .catch(() => setGeocodeError(true));
  }, [value, getAddress]);

  useEffect(() => {
    if (!mapKey) return;
    if (window.ymaps) {
      window.ymaps.ready(() => setReady(true));
      return;
    }
    const script = document.createElement("script");
    const suggestParam = suggestKey ? `&suggest_apikey=${suggestKey}` : "";
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${mapKey}${suggestParam}&lang=ru_RU`;
    script.async = true;
    script.onload = () => { window.ymaps.ready(() => setReady(true)); };
    script.onerror = () => setScriptError(true);
    document.head.appendChild(script);
  }, [mapKey, suggestKey]);

  const locateMe = useCallback(async () => {
    const map = mapRef.current;
    if (!map) {
      setLocationError(true);
      return;
    }
    const requestId = ++geoRequestRef.current;
    setLocating(true);
    setLocationError(false);

    const moveTo = (coords: [number, number], fromDevice = true) => {
      if (requestId !== geoRequestRef.current) return;
      if (fromDevice && !inDeliveryZone(coords)) {
        throw new Error("outside-zone");
      }
      map.setCenter(coords, 17, { duration: 450 });
      void getAddress(coords);
      setLocating(false);
      setLocationError(false);
    };

    try {
      const precise = await browserPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 });
      moveTo([precise.coords.latitude, precise.coords.longitude]);
      return;
    } catch {
      // iOS Simulator and HTTP pages often fail high-accuracy GPS.
    }

    try {
      const coarse = await browserPosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
      moveTo([coarse.coords.latitude, coarse.coords.longitude]);
      return;
    } catch {
      // Try Yandex IP / network location next.
    }

    try {
      const ymaps = window.ymaps;
      if (ymaps?.geolocation?.get) {
        const result = await ymaps.geolocation.get({ provider: "auto", autoReverseGeocode: false, timeout: 8000 });
        const position = result?.geoObjects?.position as [number, number] | undefined;
        if (position) {
          moveTo(position);
          return;
        }
      }
    } catch {
      // Fall back to the current map center so the address still fills in.
    }

    if (requestId !== geoRequestRef.current) return;
    const center = map.getCenter() as [number, number];
    void getAddress(center);
    setLocating(false);
    setLocationError(true);
  }, [getAddress]);

  function searchTypedAddress(rawQuery = inputRef.current?.value ?? query) {
    const ymaps = window.ymaps;
    const map = mapRef.current;
    const addressQuery = rawQuery.trim();
    if (!ymaps || !map || !addressQuery) return;
    userAdjustedLocationRef.current = true;
    setQuery(addressQuery);
    const normalizedQuery = /симферополь/i.test(addressQuery) ? addressQuery : `Симферополь, ${addressQuery}`;
    ymaps
      .geocode(normalizedQuery, { results: 1, boundedBy: SIMFEROPOL_BOUNDS })
      .then((res: any) => {
        const first = res.geoObjects.get(0);
        if (!first) {
          setGeocodeError(true);
          return;
        }
        const coords = first.geometry.getCoordinates() as [number, number];
        map.setCenter(coords, 17, { duration: 280 });
        void getAddress(coords);
      })
      .catch(() => setGeocodeError(true));
  }

  useEffect(() => {
    const viewport = containerRef.current;
    if (!ready || !viewport || mapRef.current) return;
    const ymaps = window.ymaps;
    const map = new ymaps.Map(viewport, {
      center: DEFAULT_CENTER,
      zoom: 16,
      controls: ["zoomControl"],
      behaviors: ["drag", "multiTouch", "dblClickZoom", "scrollZoom"]
    }, { yandexMapDisablePoiInteractivity: true });
    map.behaviors.enable("drag");
    map.behaviors.enable("multiTouch");
    map.controls.get("zoomControl")?.options.set({ size: "small", position: { right: 12, top: 120 } });
    mapRef.current = map;

    const reverseFromCenter = () => {
      userAdjustedLocationRef.current = true;
      const center = map.getCenter() as [number, number];
      scheduleGetAddress(center);
    };

    map.events.add("actionbegin", () => {
      userAdjustedLocationRef.current = true;
    });
    map.events.add("actionend", reverseFromCenter);
    map.events.add("boundschange", reverseFromCenter);
    map.events.add("mouseup", reverseFromCenter);

    viewport.addEventListener("touchend", reverseFromCenter, { passive: true });
    void locateMe();
    return () => {
      window.clearTimeout(reverseTimerRef.current);
      viewport.removeEventListener("touchend", reverseFromCenter);
      map.destroy();
      mapRef.current = null;
    };
  }, [ready, locateMe, scheduleGetAddress]);

  useEffect(() => {
    const onLocate = () => { void locateMe(); };
    window.addEventListener("starfood:locate-me", onLocate);
    return () => window.removeEventListener("starfood:locate-me", onLocate);
  }, [locateMe]);

  function chooseSuggestion(item: any) {
    const selected = suggestionLabel(item);
    if (!selected) return;
    const cityAddress = /симферополь/i.test(selected) ? selected : `Симферополь, ${selected}`;
    userAdjustedLocationRef.current = true;
    suppressSuggestionsRef.current = true;
    setSuggestionsOpen(false);
    setSuggestions([]);
    setQuery(cityAddress);
    searchTypedAddress(item.value || cityAddress);
  }

  if (!mapKey) {
    return (
      <div className="flex items-center gap-2 rounded-xl2 border border-smoke-200 bg-smoke-50 p-4 text-sm text-smoke-500">
        <AlertCircle size={16} className="shrink-0 text-smoke-400" />
        Карта временно недоступна: нет ключа Яндекс.Карт
      </div>
    );
  }

  if (scriptError) {
    return (
      <div className="flex items-center gap-2 rounded-xl2 border border-smoke-200 bg-smoke-50 p-4 text-sm text-smoke-500">
        <AlertCircle size={16} className="shrink-0 text-smoke-400" />
        Не удалось загрузить Яндекс.Карты. Проверьте соединение и обновите страницу.
      </div>
    );
  }

  const showSuggestions = suggestionsOpen && suggestions.length > 0;

  return (
    <div className={`map-picker-root ${className ?? ""}`.trim()}>
      <div className="map-picker-search">
        <MapPin size={16} className="map-picker-search-icon" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            userAdjustedLocationRef.current = true;
            setSuggestionsOpen(true);
            setGeocodeError(false);
            updateSuggestionBox();
          }}
          onFocus={() => {
            updateSuggestionBox();
            setSuggestionsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setSuggestionsOpen(false);
              searchTypedAddress();
            }
          }}
          onBlur={() => {
            window.setTimeout(() => setSuggestionsOpen(false), 180);
          }}
          placeholder="Улица и дом в Симферополе"
          required
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="map-address-clear"
            aria-label="Очистить адрес"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setSuggestionsOpen(false);
              setGeocodeError(false);
              inputRef.current?.focus();
            }}
          >
            <X size={19} />
          </button>
        )}
      </div>

      <div className="map-picker-surface">
        <div
          ref={containerRef}
          className="map-picker-viewport"
          onPointerDown={() => { userAdjustedLocationRef.current = true; }}
        />
      </div>

      {showSuggestions && typeof document !== "undefined" && createPortal(
        <div
          className="map-address-suggestions"
          role="listbox"
          aria-label="Адреса в Симферополе"
          style={{ top: suggestionBox.top, left: suggestionBox.left, width: suggestionBox.width }}
        >
          {suggestions.map((item, index) => (
            <button
              type="button"
              role="option"
              aria-selected="false"
              key={`${item.value}-${index}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => chooseSuggestion(item)}
            >
              <MapPin size={16} />
              <span>{item.displayName || item.value}</span>
            </button>
          ))}
        </div>,
        document.body
      )}

      {locationError ? (
        <p className="map-picker-status">Не удалось определить геоположение. Передвиньте карту — адрес подставится сам.</p>
      ) : geocodeError ? (
        <p className="map-picker-status">
          <AlertCircle size={13} />
          Не удалось определить адрес. Передвиньте карту или введите улицу и дом.
        </p>
      ) : locating ? (
        <p className="map-picker-status">Определяем ваше местоположение…</p>
      ) : (
        <p className="map-picker-status">Передвиньте карту — адрес подставится сам.</p>
      )}
    </div>
  );
}
