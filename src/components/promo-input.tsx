"use client";

import { useState } from "react";
import { Tag, X, Check } from "lucide-react";
import { useCartStore } from "@/context/cart-store";

export default function PromoInput() {
  const promoCode = useCartStore((s) => s.promoCode);
  const setPromo = useCartStore((s) => s.setPromo);
  const removePromo = useCartStore((s) => s.removePromo);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  if (promoCode) {
    return (
      <div className="flex items-center justify-between rounded-xl2 bg-lime-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-lime-700">
          <Check size={16} />
          Промокод {promoCode} применён
        </div>
        <button onClick={removePromo} aria-label="Убрать промокод" className="text-lime-700">
          <X size={16} />
        </button>
      </div>
    );
  }

  async function handleApply() {
    if (!value.trim()) return;
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Промокод не найден или недействителен");
        return;
      }
      setPromo(data.code, data.discountPercent);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-smoke-400" />
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            placeholder="Промокод"
            className="w-full rounded-xl2 bg-smoke-100 py-3 pl-10 pr-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={checking}
          className="shrink-0 rounded-xl2 bg-ink px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {checking ? "Проверка…" : "Применить"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-flash-600">{error}</p>}
    </div>
  );
}
