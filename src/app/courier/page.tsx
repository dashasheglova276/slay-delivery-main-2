"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PackageCheck } from "lucide-react";
import CourierOrderCard from "@/components/courier/courier-order-card";
import type { OrderStatus, AdminOrder } from "@/types";
import { cn } from "@/lib/utils";

type TabValue = "active" | "delivered";

export default function CourierPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [tab, setTab] = useState<TabValue>("active");

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  async function refresh() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders ?? []);
  }

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  }

  // /api/orders для роли COURIER уже возвращает только назначенные на него заказы
  const active = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const finished = orders.filter((o) => o.status === "delivered");

  const list = tab === "active" ? active : finished;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-bold">Мои доставки</h1>
        <p className="text-sm text-smoke-500">{active.length} заказов в работе сегодня</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("active")}
          className={cn(
            "flex-1 rounded-full border px-4 py-2 text-sm font-semibold",
            tab === "active" ? "border-ink bg-ink text-white" : "border-smoke-200 text-smoke-600"
          )}
        >
          В работе ({active.length})
        </button>
        <button
          onClick={() => setTab("delivered")}
          className={cn(
            "flex-1 rounded-full border px-4 py-2 text-sm font-semibold",
            tab === "delivered" ? "border-ink bg-ink text-white" : "border-smoke-200 text-smoke-600"
          )}
        >
          Доставлено ({finished.length})
        </button>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl2 bg-white py-16 text-center">
          <PackageCheck className="h-8 w-8 text-smoke-300" />
          <p className="text-sm text-smoke-500">
            {tab === "active" ? "Нет активных заказов" : "Пока нет доставленных заказов"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {list.map((order) => (
              <CourierOrderCard
                key={order.id}
                order={order}
                onAdvance={(nextStatus: OrderStatus) => updateOrderStatus(order.id, nextStatus)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
