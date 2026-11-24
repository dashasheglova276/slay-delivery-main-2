"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Phone, CheckCircle2 } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { ORDER_STATUS_LABELS, type OrderStatus, type AdminOrder, type Courier, type OrderItem } from "@/types";
import { formatPrice, formatCartAmount, getLineTotal, cn } from "@/lib/utils";

const STATUS_FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "new", label: "Ожидают подтверждения" },
  { value: "accepted", label: "Подтверждены" },
  { value: "picked_up", label: "Забраны" },
  { value: "in_transit", label: "В пути" },
  { value: "delivered", label: "Доставлены" },
  { value: "cancelled", label: "Отменены" }
];

/** Локальный "день" заказа для группировки — без времени, в таймзоне браузера админа. */
function dayKey(iso: string) {
  return new Date(iso).toDateString();
}

function dayLabel(key: string) {
  const date = new Date(key);
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function itemQuantityLabel(item: OrderItem) {
  return item.saleType === "weight"
    ? formatCartAmount(item.quantity, { saleType: item.saleType, unit: item.unit ?? "кг", step: 500 })
    : `× ${item.quantity}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  // Раздельные вкладки: "Сегодня" — текущий день заказов, "История" — все предыдущие дни.
  const [dayView, setDayView] = useState<"today" | "history">("today");
  const [historyDay, setHistoryDay] = useState<string | null>(null);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000); // автообновление заказов каждые 5 секунд
    return () => clearInterval(interval);
  }, []);

  async function refresh() {
    const [ordersRes, couriersRes] = await Promise.all([fetch("/api/orders"), fetch("/api/couriers")]);
    const ordersData = await ordersRes.json();
    const couriersData = await couriersRes.json();
    setOrders(ordersData.orders ?? []);
    setCouriers(couriersData.couriers ?? []);
  }

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  }

  async function assignCourier(orderId: string, courierId: string | null) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, courierId } : o)));
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courierId })
    });
  }

  const todayKey = dayKey(new Date().toISOString());

  const byStatus = (list: AdminOrder[]) =>
    list
      .filter((o) => statusFilter === "all" || o.status === statusFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const todayOrders = useMemo(
    () => byStatus(orders.filter((o) => dayKey(o.createdAt) === todayKey)),
    [orders, statusFilter, todayKey]
  );

  const historyByDay = useMemo(() => {
    const groups = new Map<string, AdminOrder[]>();
    for (const order of byStatus(orders.filter((o) => dayKey(o.createdAt) !== todayKey))) {
      const key = dayKey(order.createdAt);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(order);
    }
    return Array.from(groups.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [orders, statusFilter, todayKey]);

  const visibleOrders =
    dayView === "today" ? todayOrders : historyDay ? historyByDay.find(([key]) => key === historyDay)?.[1] ?? [] : [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Заказы</h1>
        <p className="text-sm text-smoke-500">{orders.length} заказов всего</p>
      </div>

      <div className="flex gap-2 rounded-full bg-smoke-100 p-1 text-sm font-semibold">
        <button
          onClick={() => {
            setDayView("today");
            setHistoryDay(null);
          }}
          className={cn(
            "flex-1 rounded-full px-4 py-2 transition-colors",
            dayView === "today" ? "bg-ink text-white" : "text-smoke-600"
          )}
        >
          Сегодня ({todayOrders.length})
        </button>
        <button
          onClick={() => setDayView("history")}
          className={cn(
            "flex-1 rounded-full px-4 py-2 transition-colors",
            dayView === "history" ? "bg-ink text-white" : "text-smoke-600"
          )}
        >
          История ({orders.length - todayOrders.length})
        </button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold",
              statusFilter === f.value ? "border-ink bg-ink text-white" : "border-smoke-200 text-smoke-600"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {dayView === "history" && !historyDay && (
        <div className="flex flex-col gap-2">
          {historyByDay.length === 0 && <p className="py-6 text-center text-sm text-smoke-400">История пуста</p>}
          {historyByDay.map(([key, list]) => (
            <button
              key={key}
              onClick={() => setHistoryDay(key)}
              className="flex items-center justify-between rounded-xl2 border border-smoke-100 bg-white p-4 text-left hover:border-smoke-200"
            >
              <span className="text-sm font-semibold capitalize">{dayLabel(key)}</span>
              <span className="text-xs text-smoke-400">{list.length} заказов →</span>
            </button>
          ))}
        </div>
      )}

      {dayView === "history" && historyDay && (
        <button onClick={() => setHistoryDay(null)} className="self-start text-xs font-semibold text-smoke-500">
          ← Все дни истории
        </button>
      )}

      {(dayView === "today" || historyDay) && (
        <div className="flex flex-col gap-3">
          {visibleOrders.length === 0 && <p className="py-6 text-center text-sm text-smoke-400">Заказов нет</p>}
          {visibleOrders.map((order) => {
            const isOpen = expanded === order.id;
            const courier = couriers.find((c) => c.id === order.courierId);
            return (
              <div key={order.id} className="rounded-xl2 border border-smoke-100 bg-white">
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="flex w-full flex-wrap items-center gap-3 p-4 text-left"
                >
                  <div className="min-w-[140px]">
                    <p className="text-sm font-bold">{order.id}</p>
                    <p className="text-xs text-smoke-400">
                      {new Date(order.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="min-w-[160px] flex-1">
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="truncate text-xs text-smoke-400">{order.fulfillmentType === "pickup" ? "Самовывоз · " : "Доставка · "}{order.address}</p>
                  </div>
                  <div className="text-sm font-semibold">{formatPrice(order.total)}</div>
                  <StatusBadge status={order.status} />
                  <ChevronDown size={16} className={cn("text-smoke-400 transition-transform", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                  <div className="border-t border-smoke-100 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-xs font-semibold text-smoke-400">Товары</p>
                        <div className="flex flex-col gap-1.5">
                          {order.items.map((item) => (
                            <div key={item.productId} className="flex items-center justify-between text-sm">
                              <span className="text-smoke-600">
                                {item.name} {itemQuantityLabel(item)}
                              </span>
                              <span className="font-medium">
                                {formatPrice(getLineTotal(item.price, item.quantity, { saleType: item.saleType ?? "piece", unit: item.unit ?? "шт", step: 1 }))}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-sm text-smoke-500">
                          <Phone size={13} />
                          {order.customerPhone}
                        </div>
                        {order.comment && <p className="mt-1 text-xs text-smoke-400">Комментарий: {order.comment}</p>}

                        <div className="mt-3 flex flex-col gap-1 border-t border-dashed border-smoke-100 pt-2 text-xs text-smoke-500">
                          <div className="flex justify-between">
                            <span>Сумма товаров</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-lime-700">
                              <span>Скидка по товарам</span>
                              <span>−{formatPrice(order.discount)}</span>
                            </div>
                          )}
                          {order.promoDiscount > 0 && (
                            <div className="flex justify-between text-lime-700">
                              <span>Промокод {order.promoCode}</span>
                              <span>−{formatPrice(order.promoDiscount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Доставка</span>
                            <span>{order.deliveryFee === 0 ? "Бесплатно" : formatPrice(order.deliveryFee)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-ink">
                            <span>Итого</span>
                            <span>{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {/* Отдельная явная кнопка подтверждения — быстрее и понятнее,
                            чем искать нужный пункт в общем select ниже (который
                            остаётся для ручной корректировки статуса при необходимости). */}
                        {order.status === "new" && (
                          <button
                            onClick={() => updateOrderStatus(order.id, "accepted")}
                            className="flex items-center justify-center gap-2 rounded-full bg-lime-500 py-2.5 text-sm font-bold text-ink shadow-glowLime"
                          >
                            <CheckCircle2 size={16} />
                            Подтвердить заказ
                          </button>
                        )}

                        <div>
                          <p className="mb-1.5 text-xs font-semibold text-smoke-400">Статус заказа</p>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="w-full rounded-xl2 border border-smoke-200 px-3 py-2.5 text-sm"
                          >
                            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <p className="mb-1.5 text-xs font-semibold text-smoke-400">Курьер</p>
                          <select
                            value={order.courierId ?? ""}
                            onChange={(e) => assignCourier(order.id, e.target.value || null)}
                            className="w-full rounded-xl2 border border-smoke-200 px-3 py-2.5 text-sm"
                          >
                            <option value="">Не назначен</option>
                            {couriers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          {courier && <p className="mt-1 text-xs text-smoke-400">{courier.phone}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
