"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/data/products";
import { useCartStore } from "@/context/cart-store";
import { useToastStore } from "@/context/toast-store";
import { formatPrice, formatWeight, formatCartAmount, getLineTotal, getStepAmount } from "@/lib/utils";
import { emojiFromSticker } from "@/lib/sticker";

export default function ProductCard({ product }: { product: Product }) {
  const quantity = useCartStore((s) => s.quantityOf(product.id));
  const addItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const toast = useToastStore((s) => s.show);
  const inStock = product.inStock !== false;
  const step = getStepAmount(product);
  const emoji = emojiFromSticker(product.image);
  const discount = product.discountPercent || (product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0);

  function add() {
    addItem(product);
    window.dispatchEvent(new CustomEvent("starfood:address-needed"));
    toast(`«${product.name}» в корзине`, "success");
  }

  return (
    <article className="product-tile">
      <div className={`product-photo${quantity > 0 ? " has-quantity" : ""}`}>
        <Link href={`/product/${product.id}`} className={`product-image-link${quantity > 0 ? " in-cart" : ""}`} aria-label={product.name}>
          {emoji ? (
            <span className="thumb-emoji">{emoji}</span>
          ) : (
            <Image src={product.image} alt={product.name} fill unoptimized sizes="(max-width:700px) 48vw, 220px" className="product-image" />
          )}
        </Link>
        {quantity > 0 && <span className="product-cart-quantity">{product.saleType === "weight" ? formatCartAmount(quantity, product) : quantity}</span>}
        {discount > 0 && <b className="sale-tag">−{discount}%</b>}
        {!inStock && <span className="stock-overlay">Нет в наличии</span>}
      </div>
      <Link href={`/product/${product.id}`} className="product-name">{product.name}</Link>
      <div className="product-unit">{product.saleType === "weight" ? `Цена за ${formatCartAmount(step, product)}` : formatWeight(product.weight, product.unit)}</div>
      <div className="product-action-row">
        {inStock ? quantity === 0 ? (
          <button
            type="button"
            className="product-add"
            onClick={add}
            aria-label={product.saleType === "weight" ? `Добавить ${formatCartAmount(step, product)} в корзину` : "Добавить в корзину"}
          >
            <span>{formatPrice(product.saleType === "weight" ? getLineTotal(product.price, step, product) : product.price)}</span><Plus size={20} />
          </button>
        ) : (
          <div className="product-stepper">
            <button type="button" onClick={() => setQuantity(product.id, quantity - step)} aria-label="Уменьшить количество"><Minus size={15} /></button>
            <b>{formatPrice(getLineTotal(product.price, quantity, product))}</b>
            <button type="button" onClick={() => addItem(product, step)} aria-label="Добавить ещё"><Plus size={15} /></button>
          </div>
        ) : (
          <div className="product-price">{formatPrice(product.price)} <small>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</small></div>
        )}
      </div>
    </article>
  );
}
