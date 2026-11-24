"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore, cartTotals } from "@/context/cart-store";
import CartLineItem from "@/components/cart-line-item";
import PromoInput from "@/components/promo-input";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const promoDiscountPercent = useCartStore((s) => s.promoDiscountPercent);
  const totals = cartTotals(lines, promoDiscountPercent);

  if (lines.length === 0) {
    return (
      <div className="placeholder">
        <div className="placeholder-emoji"><ShoppingBag size={72} /></div>
        <h1 className="title-md">Корзина пуста</h1>
        <p className="subtitle">Добавьте товары из каталога</p>
        <Link href="/catalog" className="btn-primary">К покупкам →</Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="title-lg">Корзина</h1>
      <div className="cart-list">
        {lines.map((line) => <CartLineItem key={line.product.id} line={line} />)}
      </div>
      <div className="cart-logic-panel">
        <PromoInput />
        <div className="summary">
          <div><span className="meta">Итого</span><strong>{totals.total.toLocaleString("ru-RU")} ₽</strong></div>
          {totals.subtotal < totals.minimumOrderAmount ? (
            <Link href="/catalog" className="btn-primary">Добавьте ещё {formatPrice(totals.remainingToMinimum)} →</Link>
          ) : (
            <Link href="/checkout" className="btn-primary">Оформить заказ →</Link>
          )}
        </div>
      </div>
    </>
  );
}
