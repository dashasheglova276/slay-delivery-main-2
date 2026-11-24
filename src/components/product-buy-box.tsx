"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { useCartStore } from "@/context/cart-store";
import { useFavoritesStore } from "@/context/favorites-store";
import { formatPrice, formatCartAmount, getStepAmount, cn } from "@/lib/utils";
import QuantityStepper from "@/components/quantity-stepper";

export default function ProductBuyBox({ product }: { product: Product }) {
  const quantity = useCartStore((s) => s.quantityOf(product.id));
  const addItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const isWeighted = product.saleType === "weight";
  const step = getStepAmount(product);

  return (
    <div
      className={cn(
        // На мобильном — закреплённая снизу панель покупки над BottomNav,
        // как в мобильных приложениях доставки (не нужно скроллить, чтобы
        // добавить товар). На десктопе (md+) остаётся обычным инлайн-блоком
        // внутри карточки на странице товара — там ничего не меняется.
        "flex items-center gap-3",
        "fixed inset-x-0 bottom-[64px] z-30 border-t border-smoke-100 bg-white/95 px-4 py-3 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] backdrop-blur-md",
        "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        "md:static md:inset-auto md:border-0 md:bg-transparent md:p-0 md:pb-0 md:shadow-none md:backdrop-blur-none"
      )}
    >
      <div className="flex flex-1 items-baseline gap-2">
        <span className="font-display text-2xl font-extrabold">
          {formatPrice(product.price)}
          {isWeighted && <span className="ml-1 text-sm font-medium text-smoke-400">/ кг</span>}
        </span>
        {product.oldPrice && (
          <span className="text-sm text-smoke-400 line-through">{formatPrice(product.oldPrice)}</span>
        )}
      </div>

      <button
        onClick={() => toggleFavorite(product.id)}
        aria-label="В избранное"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-smoke-200"
      >
        <Heart size={18} className={cn(isFavorite ? "fill-flash-500 text-flash-500" : "text-smoke-400")} />
      </button>

      {quantity === 0 ? (
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => { addItem(product); window.dispatchEvent(new CustomEvent("starfood:address-needed")); }}
          className="shrink-0 rounded-full bg-lime-500 px-6 py-3 text-sm font-bold text-ink"
        >
          В корзину
        </motion.button>
      ) : (
        <QuantityStepper
          quantity={quantity}
          label={isWeighted ? formatCartAmount(quantity, product) : undefined}
          onIncrement={() => addItem(product, step)}
          onDecrement={() => setQuantity(product.id, quantity - step)}
          className="shrink-0"
        />
      )}
    </div>
  );
}
