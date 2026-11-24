"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useCartStore } from "@/context/cart-store";
import type { AdminOrder } from "@/types";
import { formatPrice, normalizeLegacyOrderAmount } from "@/lib/utils";

/**
 * Раньше брал последний заказ из локального useOrdersStore (только для этого
 * браузера). Теперь заказы общие для сайта/админки/курьера и хранятся в БД,
 * поэтому последний заказ клиента запрашивается через /api/me/orders —
 * тот же эндпоинт, что использует страница профиля.
 */
export default function RepeatOrder() {
  const addItem = useCartStore((s) => s.addItem);
  const [lastOrder, setLastOrder] = useState<AdminOrder | null>(null);

  useEffect(() => {
    fetch("/api/me/orders")
      .then((res) => res.json())
      .then((data) => setLastOrder(data.orders?.[0] ?? null));
  }, []);

  if (!lastOrder) return null;

  const previewNames = lastOrder.items.slice(0, 3).map((i) => i.name).join(", ");

  async function repeat() {
    if (!lastOrder) return;
    const res = await fetch(`/api/products?ids=${lastOrder.items.map((i) => i.productId).join(",")}`);
    const data = await res.json();
    const products: Record<string, { id: string }> = Object.fromEntries(
      (data.products ?? []).map((p: { id: string }) => [p.id, p])
    );
    lastOrder.items.forEach((item) => {
      const product = products[item.productId];
      if (product) {
        const typedProduct = product as Parameters<typeof addItem>[0];
        addItem(typedProduct, normalizeLegacyOrderAmount(typedProduct, item.quantity));
      }
    });
  }

  return (
    <section className="py-6">
      <div className="flex items-center justify-between gap-4 rounded-xl2 bg-smoke-50 p-4">
        <div className="min-w-0">
          <h3 className="font-display text-sm font-bold text-ink">Повторить прошлый заказ</h3>
          <p className="mt-0.5 truncate text-xs text-smoke-500">
            {previewNames}
            {lastOrder.items.length > 3 ? ` и ещё ${lastOrder.items.length - 3}` : ""} · {formatPrice(lastOrder.total)}
          </p>
        </div>
        <button
          onClick={repeat}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white active:scale-95"
        >
          <RotateCcw size={14} />
          Повторить
        </button>
      </div>
    </section>
  );
}
