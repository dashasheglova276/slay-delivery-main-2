import { formatPrice, MIN_ORDER_AMOUNT } from "@/lib/utils";

export default function OrderSummary({
  subtotal,
  productDiscount,
  promoDiscount,
  deliveryFee,
  total
}: {
  subtotal: number;
  productDiscount: number;
  promoDiscount: number;
  deliveryFee: number;
  total: number;
}) {
  const rows = [
    { label: "Стоимость товаров", value: formatPrice(subtotal + productDiscount) },
    ...(productDiscount > 0
      ? [{ label: "Скидка на товары", value: `−${formatPrice(productDiscount)}`, accent: true }]
      : []),
    ...(promoDiscount > 0
      ? [{ label: "Скидка по промокоду", value: `−${formatPrice(promoDiscount)}`, accent: true }]
      : []),
    {
      label: "Доставка",
      value: deliveryFee === 0 ? "Бесплатно" : formatPrice(deliveryFee),
      accent: deliveryFee === 0
    }
  ];

  return (
    <div className="flex flex-col gap-2 rounded-xl2 border border-smoke-100 p-4">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between text-sm">
          <span className="text-smoke-500">{row.label}</span>
          <span className={row.accent ? "font-semibold text-lime-600" : "text-ink"}>{row.value}</span>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between border-t border-smoke-100 pt-3 text-base font-bold">
        <span>Итого</span>
        <span>{formatPrice(total)}</span>
      </div>
      {deliveryFee > 0 && (
        <p className="text-xs text-smoke-400">
          Добавьте товаров на {formatPrice(1500 - subtotal)} для бесплатной доставки
        </p>
      )}
      {subtotal < MIN_ORDER_AMOUNT && (
        <p className="min-order-notice">Минимальный заказ — {formatPrice(MIN_ORDER_AMOUNT)}. Добавьте товаров ещё на {formatPrice(MIN_ORDER_AMOUNT - subtotal)}.</p>
      )}
    </div>
  );
}
