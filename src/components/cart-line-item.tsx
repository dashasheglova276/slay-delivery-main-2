"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { CartLine } from "@/context/cart-store";
import { useCartStore } from "@/context/cart-store";
import { formatPrice, formatWeight, formatCartAmount, getLineTotal, getStepAmount } from "@/lib/utils";
import QuantityStepper from "@/components/quantity-stepper";
import { emojiForCategory } from "@/lib/sticker";

export default function CartLineItem({ line }: { line: CartLine }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { product, quantity } = line;
  const isWeighted = product.saleType === "weight";
  const step = getStepAmount(product);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-3 py-4"
    >
      <Link href={`/product/${product.id}`} className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl2 bg-smoke-50">
        {product.image ? <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" /> : <span aria-hidden="true" className="text-3xl">{emojiForCategory(product.categorySlug)}</span>}
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/product/${product.id}`} className="line-clamp-1 text-sm font-medium text-ink">
          {product.name}
        </Link>
        <p className="text-xs text-smoke-400">
          {isWeighted ? `${formatPrice(product.price)}/кг` : formatWeight(product.weight, product.unit)}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold">{formatPrice(getLineTotal(product.price, quantity, product))}</span>
          {product.oldPrice && (
            <span className="text-xs text-smoke-400 line-through">
              {formatPrice(getLineTotal(product.oldPrice, quantity, product))}
            </span>
          )}
        </div>
      </div>

      <QuantityStepper
        size="sm"
        quantity={quantity}
        label={isWeighted ? formatCartAmount(quantity, product) : undefined}
        onIncrement={() => setQuantity(product.id, quantity + step)}
        onDecrement={() => setQuantity(product.id, quantity - step)}
      />

      <button
        aria-label="Удалить товар"
        onClick={() => removeItem(product.id)}
        className="-m-2 shrink-0 p-2 text-smoke-300 transition-colors hover:text-flash-500 active:text-flash-600"
      >
        <Trash2 size={17} />
      </button>
    </motion.div>
  );
}
