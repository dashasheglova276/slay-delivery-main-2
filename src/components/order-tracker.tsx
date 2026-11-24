"use client";

import { Bike, ClipboardCheck, CircleCheck, PackageOpen, ShoppingBasket } from "lucide-react";
import { ORDER_STATUS_FLOW, type OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { status: "new", icon: ClipboardCheck, label: "Заказ принят", hint: "Мы уже видим ваш заказ" },
  { status: "accepted", icon: ShoppingBasket, label: "Собираем покупки", hint: "Комплектуем корзину" },
  { status: "picked_up", icon: PackageOpen, label: "Заказ собран", hint: "Всё готово к передаче" },
  { status: "in_transit", icon: Bike, label: "Курьер в пути", hint: "Едет по вашему адресу" },
  { status: "delivered", icon: CircleCheck, label: "Доставлено", hint: "Можно проверять заказ" }
] as const;

export default function OrderTracker({ status }: { status: OrderStatus }) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <section className="order-progress-glass" aria-label="Этапы заказа">
      {STEPS.map((step, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
        const Icon = step.icon;
        return (
          <div key={step.status} className={cn("order-progress-step", `is-${state}`)}>
            <div className="order-progress-rail">
              <div className={cn("order-progress-icon", `is-${state}`)} aria-hidden="true">
                <Icon size={28} strokeWidth={2.05} />
              </div>
              {index < STEPS.length - 1 && <span className={cn("order-progress-line", index < currentIndex && "is-done")} />}
            </div>
            <div className="order-progress-copy">
              <p className={cn("order-progress-label", `is-${state}`)}>{step.label}</p>
              <span className={cn("order-progress-hint", `is-${state}`)}>{step.hint}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
