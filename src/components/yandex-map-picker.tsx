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

function suggestionLabel(item: Suggestion): string {
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

type Suggestion = { displayName?: string; value?: string; lat?: number; lng?: number };

export default function YandexMapPicker({
  onSelect,
  onClear,
  value,
  className
}: {
  onSelect: (data: { address: string; lat: number; lng: number }) => void;
  onClear?: () => void;
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
  const onClearRef = useRef(onClear);
  const reverseTimerRef = useRef(0);
  const ignoreReverseUntilRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState(value ?? "");
  const [scriptError, setScriptError] = useState(false);
  const [geocodeError, setGeocodeError] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionBox, setSuggestionBox] = useState({ top: 0, left: 0, width: 0 });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);

  queryRef.current = query;
  onSelectRef.current = onSelect;
  onClearRef.current = onClear;

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
    if (!ready || text.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      const request = /симферополь/i.test(text) ? text : `Симферополь, ${text}`;
      const show = (next: Suggestion[]) => {
        if (!active) return;
        setSuggestions(next);
        if (next.length > 0 && document.activeElement === inputRef.current) {
          updateSuggestionBox();
          setSuggestionsOpen(true);
        } else {
          setSuggestionsOpen(false);
        }
      };
      const fromServer = () => fetch(`/api/geocode/search?q=${encodeURIComponent(request)}`, { cache: "no-store" })
        .then((response) => response.ok ? response.json() : { results: [] })
        .then((data) => {
          const next = (data.results || []).map((item: { address: string; lat: number; lng: number }) => ({
            displayName: item.address,
            value: item.address,
            lat: item.lat,
            lng: item.lng
          }));
          show(next);
        })
        .catch(() => { if (active) setSuggestions([]); });
      if (!ymaps?.suggest) {
        void fromServer();
        return;
      }
      ymaps.suggest(request, { boundedBy: SIMFEROPOL_BOUNDS, results: 8 })
        .then((items: Suggestion[]) => {
          if (!active) return;
          const next = (items || []).filter((item) => suggestionLabel(item));
          if (next.length > 0) show(next);
          else void fromServer();
        })
        .catch(() => { if (active) void fromServer(); });
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

  const getAddress = useCallback(async (coords: [number, number], snapToHouse = false) => {
    const requestId = ++addressRequestRef.current;
    try {
      const response = await fetch(`/api/geocode/reverse?lat=${encodeURIComponent(String(coords[0]))}&lng=${encodeURIComponent(String(coords[1]))}`, { cache: "no-store" });
      if (requestId !== addressRequestRef.current) return;
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.address) {
        const resolved: [number, number] = [
          Number.isFinite(Number(data.lat)) ? Number(data.lat) : coords[0],
          Number.isFinite(Number(data.lng)) ? Number(data.lng) : coords[1]
        ];
        const moved = Math.abs(resolved[0] - coords[0]) > 0.00003 || Math.abs(resolved[1] - coords[1]) > 0.00003;
        if (snapToHouse && moved && mapRef.current) {
          ignoreReverseUntilRef.current = Date.now() + 500;
          mapRef.current.setCenter(resolved, 17, { duration: 280 });
        }
        applyResolvedAddress(String(data.address), snapToHouse ? resolved : coords);
        return;
      }
    } catch {
      if (requestId !== addressRequestRef.current) return;
    }
    if (requestId !== addressRequestRef.current) return;
    setGeocodeError(true);
  }, [applyResolvedAddress]);

  const panTo = useCallback((coords: [number, number]) => {
    const map = mapRef.current;
    if (!map) return;
    ignoreReverseUntilRef.current = Date.now() + 350;
    map.setCenter(coords, 17, { duration: 280 });
  }, []);

  const searchAddress = useCallback(async (rawQuery: string) => {
    const addressQuery = rawQuery.trim();
    const map = mapRef.current;
    if (!map || addressQuery.length < 2) return;
    const requestId = ++addressRequestRef.current;
    userAdjustedLocationRef.current = true;
    const normalizedQuery = /симферополь/i.test(addressQuery) ? addressQuery : `Симферополь, ${addressQuery}`;
    try {
      const response = await fetch(`/api/geocode/search?q=${encodeURIComponent(normalizedQuery)}`, { cache: "no-store" });
      if (requestId !== addressRequestRef.current) return;
      const data = await response.json().catch(() => ({}));
      const hit = data.results?.[0];
      if (!response.ok || !hit || !Number.isFinite(hit.lat) || !Number.isFinite(hit.lng)) {
        setGeocodeError(true);
        return;
      }
      const coords: [number, number] = [Number(hit.lat), Number(hit.lng)];
      panTo(coords);
      applyResolvedAddress(String(hit.address || normalizedQuery), coords);
    } catch {
      if (requestId === addressRequestRef.current) setGeocodeError(true);
    }
  }, [applyResolvedAddress, panTo]);

  const scheduleGetAddress = useCallback((coords: [number, number]) => {
    window.clearTimeout(reverseTimerRef.current);
    reverseTimerRef.current = window.setTimeout(() => { void getAddress(coords); }, 120);
  }, [getAddress]);

  useEffect(() => {
    if (value === undefined) return;
    if (value === queryRef.current || value === emittedAddressRef.current) return;
    if (document.activeElement === inputRef.current) return;
    setQuery(value);
    const trimmed = value.trim();
    if (!mapRef.current || !trimmed) return;
    void searchAddress(trimmed);
  }, [value, searchAddress]);

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
      panTo(coords);
      void getAddress(coords, true);
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
  }, [getAddress, panTo]);

  useEffect(() => {
    const viewport = containerRef.current;
    if (!ready || !viewport || mapRef.current) return;
    const ymaps = window.ymaps;
    const map = new ymaps.Map(viewport, {
      center: DEFAULT_CENTER,
      zoom: 16,
      controls: ["zoomControl"],
      behaviors: ["drag", "multiTouch", "dblClickZoom"]
    }, { yandexMapDisablePoiInteractivity: true });
    map.behaviors.enable("drag");
    map.behaviors.enable("multiTouch");
    map.controls.get("zoomControl")?.options.set({ size: "small", position: { right: 12, top: 120 } });
    mapRef.current = map;

    const reverseFromCenter = () => {
    if (Date.now() < ignoreReverseUntilRef.current) return;
      userAdjustedLocationRef.current = true;
      const center = map.getCenter() as [number, number];
      scheduleGetAddress(center);
    };

    map.events.add("actionbegin", () => {
      userAdjustedLocationRef.current = true;
    });
    map.events.add("actionend", reverseFromCenter);
    viewport.addEventListener("pointerup", reverseFromCenter);
    viewport.addEventListener("touchend", reverseFromCenter, { passive: true });
    if (!queryRef.current.trim()) void locateMe();
    return () => {
      window.clearTimeout(reverseTimerRef.current);
      viewport.removeEventListener("pointerup", reverseFromCenter);
      viewport.removeEventListener("touchend", reverseFromCenter);
      map.destroy();
      mapRef.current = null;
    };
  }, [ready, locateMe, scheduleGetAddress]);

  useEffect(() => {
    if (!ready) return;
    const text = query.trim();
    if (text.length < 5 || !/\d/.test(text) || text === emittedAddressRef.current) return;
    const timer = window.setTimeout(() => { void searchAddress(text); }, 650);
    return () => window.clearTimeout(timer);
  }, [query, ready, searchAddress]);

  useEffect(() => {
    const onLocate = () => { void locateMe(); };
    window.addEventListener("starfood:locate-me", onLocate);
    return () => window.removeEventListener("starfood:locate-me", onLocate);
  }, [locateMe]);

  function chooseSuggestion(item: Suggestion) {
    const selected = suggestionLabel(item);
    if (!selected) return;
    userAdjustedLocationRef.current = true;
    suppressSuggestionsRef.current = true;
    setSuggestionsOpen(false);
    setSuggestions([]);
    if (typeof item.lat === "number" && typeof item.lng === "number") {
      const coords: [number, number] = [item.lat, item.lng];
      panTo(coords);
      applyResolvedAddress(selected, coords);
      return;
    }
    const cityAddress = /симферополь/i.test(selected) ? selected : `Симферополь, ${selected}`;
    setQuery(cityAddress);
    void searchAddress(item.value || cityAddress);
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
              void searchAddress(inputRef.current?.value ?? query);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setSuggestionsOpen(false);
              const text = (inputRef.current?.value || "").trim();
              if (text.length >= 5 && text !== emittedAddressRef.current) void searchAddress(text);
            }, 180);
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
              emittedAddressRef.current = "";
              setQuery("");
              setSuggestions([]);
              setSuggestionsOpen(false);
              setGeocodeError(false);
              onClearRef.current?.();
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
        <p className="map-picker-status is-error">
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
