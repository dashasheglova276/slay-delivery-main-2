"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, MapPin, Phone, MessageSquare, CreditCard, RefreshCw, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import type { AdminOrder } from "@/types";
import { CANCELLABLE_STATUSES } from "@/types";
import BackButton from "@/components/back-button";
import OrderSummary from "@/components/order-summary";
import OrderCourierContact from "@/components/order-courier-contact";
import OrderTracker from "@/components/order-tracker";
import StatusBadge from "@/components/status-badge";
import { formatPrice, formatCartAmount, getLineTotal } from "@/lib/utils";

const PAYMENT_LABELS: Record<string, string> = {
  online: "Оплата сразу онлайн",
  cash: "Оплата при получении",
  card: "СБП при получении"
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<AdminOrder | null | undefined>(undefined);
  // Раньше 401 (гость не вошёл) и 403/404 (заказ чужой/не найден) схлопывались
  // в один и тот же общий текст — гостю, открывшему ссылку на заказ, было
  // непонятно, что нужно просто войти. Теперь различаем эти случаи явно.
  const [notAuthenticated, setNotAuthenticated] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrder = useCallback((withSpinner: boolean) => {
    if (withSpinner) setRefreshing(true);
    return fetch(`/api/me/orders/${params.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          setNotAuthenticated(true);
          setOrder(null);
          return;
        }
        setNotAuthenticated(false);
        setOrder(data.order ?? null);
      })
      .finally(() => setRefreshing(false));
  }, [params.id]);

  useEffect(() => {
    loadOrder(false);
  }, [loadOrder]);

  // Автообновление статуса без F5. Один interval на весь жизненный цикл
  // страницы (создаётся один раз — loadOrder стабилен, т.к. зависит только
  // от params.id), сам себя останавливает, как только заказ дошёл до
  // финального статуса или стал недоступен (гость разлогинился/не найден).
  // Использует уже существующий loadOrder(false) — тот же путь, что и ручное
  // обновление, поэтому scroll и остальной UI (открытые модалки и т.п.) не трогает.
  const latestRef = useRef({ order, notAuthenticated });
  useEffect(() => {
    latestRef.current = { order, notAuthenticated };
  }, [order, notAuthenticated]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { order: current, notAuthenticated: guest } = latestRef.current;
      const isDone = !current || guest || current.status === "delivered" || current.status === "cancelled";
      if (isDone) {
        clearInterval(interval);
        return;
      }
      loadOrder(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [loadOrder]);

  async function cancelOrder() {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/me/orders/${order.id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setOrder(data.order);
    } finally {
      setCancelling(false);
    }
  }

  if (order === undefined) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-smoke-400">Загружаем заказ…</div>;
  }

  if (notAuthenticated) {
    const from = `/orders/${params.id}`;
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center px-6 text-center">
        <BackButton className="absolute left-4 top-4" fallbackHref="/profile" />
        <h1 className="font-display text-lg font-bold text-ink">Войдите, чтобы посмотреть заказ</h1>
        <p className="mt-1.5 text-sm text-smoke-500">
          Этот заказ привязан к аккаунту — войдите под тем же номером телефона, которым оформляли заказ.
        </p>
        <div className="mt-5 flex w-full flex-col gap-2">
          <Link
            href={`/account/login?from=${encodeURIComponent(from)}`}
            className="flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-bold text-white"
          >
            <LogIn size={16} />
            Войти
          </Link>
          <Link
            href={`/register?from=${encodeURIComponent(from)}`}
            className="flex items-center justify-center gap-2 rounded-full bg-smoke-100 py-3 text-sm font-bold text-ink"
          >
            <UserPlus size={16} />
            Создать аккаунт
          </Link>
        </div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <BackButton className="mb-4" fallbackHref="/profile" />
        <p className="text-sm text-smoke-500">
          Заказ не найден, или он принадлежит другому аккаунту. Проверьте, что вы вошли под тем же номером телефона.
        </p>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 pb-10 md:px-6">
      <BackButton className="mb-3" fallbackHref="/profile" />

      <div className="mb-5 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-bold">Заказ {order.id}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-smoke-400">
            {new Date(order.createdAt).toLocaleString("ru-RU", {
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>

        {/* Реального realtime/WebSocket пока нет — статус подтягивается при
            открытии страницы, а эта кнопка позволяет вручную обновить его,
            если курьер/админ изменили статус, пока экран уже был открыт. */}
        <button
          onClick={() => loadOrder(true)}
          aria-label="Обновить статус"
          disabled={refreshing}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-smoke-100 text-smoke-500 transition-colors active:bg-smoke-200"
        >
          <motion.span
            animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={refreshing ? { duration: 0.7, repeat: Infinity, ease: "linear" } : { duration: 0 }}
          >
            <RefreshCw size={16} />
          </motion.span>
        </button>
      </div>

      {!isCancelled ? (
        <div className="mb-6">
          <OrderTracker status={order.status} />
        </div>
      ) : (
        <div className="mb-6 rounded-xl2 border border-flash-200 bg-flash-50 px-4 py-3 text-sm font-semibold text-flash-600">
          Заказ отменён
        </div>
      )}

      <div className="mb-5 flex flex-col gap-2 rounded-xl2 border border-smoke-100 divide-y divide-smoke-100">
        {order.items.map((item) => {
          const saleUnit = { saleType: item.saleType ?? "piece", unit: item.unit ?? "шт", step: 1 } as const;
          return (
            <div key={item.productId} className="flex items-center gap-3 p-3 first:pt-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl2 bg-smoke-50">
                <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-ink">{item.name}</p>
                <p className="text-xs text-smoke-400">
                  {saleUnit.saleType === "weight" ? formatCartAmount(item.quantity, saleUnit) : `${item.quantity} × ${formatPrice(item.price)}`}
                  {saleUnit.saleType === "weight" && ` · ${formatPrice(getLineTotal(item.price, item.quantity, saleUnit))}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-xl2 border border-smoke-100 p-4">
        <div className="flex items-start gap-3 text-sm">
          <MapPin size={16} className="mt-0.5 shrink-0 text-smoke-400" />
          <span>{order.address}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone size={16} className="shrink-0 text-smoke-400" />
          <span>{order.customerPhone}</span>
        </div>
        {order.comment && (
          <div className="flex items-start gap-3 text-sm">
            <MessageSquare size={16} className="mt-0.5 shrink-0 text-smoke-400" />
            <span>{order.comment}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm">
          <CreditCard size={16} className="shrink-0 text-smoke-400" />
          <span>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
        </div>
      </div>

      <OrderCourierContact orderId={order.id} status={order.status} />
      <OrderSummary
        subtotal={order.subtotal}
        productDiscount={order.discount}
        promoDiscount={order.promoDiscount}
        deliveryFee={order.deliveryFee}
        total={order.total}
      />

      {CANCELLABLE_STATUSES.includes(order.status) && (
        <button
          onClick={cancelOrder}
          disabled={cancelling}
          className="mt-4 w-full rounded-full border border-flash-200 py-3 text-sm font-semibold text-flash-600 disabled:opacity-60"
        >
          {cancelling ? "Отменяем…" : "Отменить заказ"}
        </button>
      )}

      <Link
        href="/catalog"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-smoke-100 py-3 text-sm font-semibold text-ink"
      >
        <Check size={15} />
        Вернуться в магазин
      </Link>
    </div>
  );
}
