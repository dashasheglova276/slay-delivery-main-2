"use client";

import { Phone, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { AdminOrder, OrderStatus } from "@/types";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/types";
import StatusBadge from "@/components/status-badge";
import { formatPrice } from "@/lib/utils";
import OrderChatDialog from "@/components/order-chat-dialog";

export default function CourierOrderCard({
  order,
  onAdvance
}: {
  order: AdminOrder;
  onAdvance: (nextStatus: OrderStatus) => void;
}) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIndex >= 0 && currentIndex < ORDER_STATUS_FLOW.length - 1
    ? ORDER_STATUS_FLOW[currentIndex + 1]
    : null;
  const isFinal = order.status === "delivered" || order.status === "cancelled";

  return (
    <motion.div layout className="rounded-xl2 border border-smoke-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-sm font-bold">{order.id}</p>
        <StatusBadge status={order.status} />
      </div>

      <p className="mb-1.5 text-sm font-semibold text-ink">{order.customerName}</p>

      <div className="flex items-start gap-2 text-sm text-ink">
        <MapPin size={15} className="mt-0.5 shrink-0 text-smoke-400" />
        <span>{order.address}</span>
      </div>
      {order.comment && <p className="mt-1 pl-5 text-xs text-smoke-400">{order.comment}</p>}

      <div className="mt-3 flex items-center justify-between">
        <a href={`tel:${order.customerPhone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm text-lime-600">
          <Phone size={14} />
          {order.customerPhone}
        </a>
        <span className="text-sm font-bold">{formatPrice(order.total)}</span>
      </div>

      <div className="mt-3 border-t border-smoke-100 pt-3">
        <p className="mb-1.5 text-xs text-smoke-400">{order.items.length} товаров · {order.paymentMethod === "cash" ? "Оплата наличными" : order.paymentMethod === "card" ? "Оплата СБП при получении" : "Оплачено онлайн"}</p>
      </div>

      <OrderChatDialog orderId={order.id} audience="courier" className="courier-chat-trigger"/>

      {!isFinal && nextStatus && (
        <button
          onClick={() => onAdvance(nextStatus)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-ink py-2.5 text-sm font-bold text-white active:scale-[0.98]"
        >
          {ORDER_STATUS_LABELS[order.status]} → {ORDER_STATUS_LABELS[nextStatus]}
          <ChevronRight size={15} />
        </button>
      )}
    </motion.div>
  );
}
