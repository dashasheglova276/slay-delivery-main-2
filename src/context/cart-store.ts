"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Product } from "@/data/products";
import { getLineTotal, getStepAmount, MIN_ORDER_AMOUNT } from "@/lib/utils";

export interface CartLine {
  product: Product;
  /** Штуки (saleType = "piece") или граммы (saleType = "weight"). */
  quantity: number;
}

/** Keep only the small product snapshot the cart actually renders. In
 * particular, never put admin-uploaded base64 photos into localStorage. */
function compactProduct(product: Product): Product {
  return {
    id: product.id,
    name: product.name,
    categorySlug: product.categorySlug,
    categoryName: product.categoryName,
    price: product.price,
    oldPrice: product.oldPrice,
    unit: product.unit,
    weight: product.weight,
    description: "",
    composition: "",
    manufacturer: "",
    shelfLife: "",
    storage: "",
    image: product.image.startsWith("data:") ? "" : product.image,
    images: [],
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    isNew: product.isNew,
    discountPercent: product.discountPercent,
    inStock: product.inStock,
    featured: product.featured,
    relatedIds: [],
    saleType: product.saleType,
    step: product.step,
    active: product.active
  };
}

const quotaSafeStorage = {
  getItem: (name: string) => localStorage.getItem(name),
  setItem(name: string, value: string) {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      // Old cart snapshots could contain large base64 photos. Free the stale
      // snapshot and retry with the compact state; if the browser is still
      // full, keep the cart usable in memory instead of throwing at the UI.
      if (error && typeof error === "object" && "name" in error && error.name === "QuotaExceededError") {
        try { localStorage.removeItem(name); } catch {}
        try { localStorage.setItem(name, value); } catch {}
        return;
      }
      throw error;
    }
  },
  removeItem: (name: string) => localStorage.removeItem(name)
};

interface CartState {
  lines: CartLine[];
  promoCode: string | null;
  promoDiscountPercent: number;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  setPromo: (code: string, discountPercent: number) => void;
  removePromo: () => void;
  quantityOf: (productId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      promoCode: null,
      promoDiscountPercent: 0,
      addItem: (product, qty) => {
        const amount = qty ?? getStepAmount(product);
        const lines = get().lines;
        const existing = lines.find((l) => l.product.id === product.id);
        if (existing) {
          set({
            lines: lines.map((l) =>
              l.product.id === product.id ? { ...l, quantity: l.quantity + amount } : l
            )
          });
        } else {
          set({ lines: [...lines, { product, quantity: amount }] });
        }
      },
      removeItem: (productId) => {
        set({ lines: get().lines.filter((l) => l.product.id !== productId) });
      },
      setQuantity: (productId, qty) => {
        if (qty <= 0) {
          set({ lines: get().lines.filter((l) => l.product.id !== productId) });
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.product.id === productId ? { ...l, quantity: qty } : l
          )
        });
      },
      clear: () => set({ lines: [], promoCode: null, promoDiscountPercent: 0 }),
      setPromo: (code, discountPercent) => set({ promoCode: code.trim().toUpperCase(), promoDiscountPercent: discountPercent }),
      removePromo: () => set({ promoCode: null, promoDiscountPercent: 0 }),
      quantityOf: (productId) => {
        const line = get().lines.find((l) => l.product.id === productId);
        return line ? line.quantity : 0;
      }
    }),
    {
      name: "slay-cart",
      version: 3,
      skipHydration: true,
      storage: createJSONStorage(() => quotaSafeStorage),
      partialize: (state) => ({
        lines: state.lines.map((line) => ({ ...line, product: compactProduct(line.product) })),
        promoCode: state.promoCode,
        promoDiscountPercent: state.promoDiscountPercent
      }),
      migrate: (persistedState) => {
        const persisted = persistedState as Partial<CartState> | null;
        const lines = Array.isArray(persisted?.lines) ? persisted.lines : [];
        return {
          ...persisted,
          lines: lines.map((line) => {
              const product = compactProduct(line.product);
            const soldByKilogram = product.unit === "кг";

            if (product.categorySlug === "bakery") {
              const packageWeightGrams = product.unit === "кг" ? product.weight * 1000 : product.weight;
              const looksLikeStoredGrams = packageWeightGrams > 0 && line.quantity >= packageWeightGrams * 0.6;
              const pieceCount = looksLikeStoredGrams ? Math.max(1, Math.round(line.quantity / packageWeightGrams)) : line.quantity;
              return {
                ...line,
                quantity: pieceCount,
                product: { ...product, saleType: "piece" as const, step: 1 }
              };
            }

            if (soldByKilogram && product.saleType !== "weight") {
              return {
                ...line,
                quantity: line.quantity * 500,
                product: { ...product, saleType: "weight" as const, step: 500 }
              };
            }

            if (product.saleType === "weight" && product.step <= 1) {
              return { ...line, product: { ...product, step: 500 } };
            }

            return line;
          })
        } as CartState;
      }
}
  )
);

export function cartTotals(lines: CartLine[], promoDiscountPercent: number) {
  const subtotal = lines.reduce((sum, l) => sum + getLineTotal(l.product.price, l.quantity, l.product), 0);
  const productDiscount = lines.reduce(
    (sum, l) =>
      sum + (l.product.oldPrice ? getLineTotal(l.product.oldPrice - l.product.price, l.quantity, l.product) : 0),
    0
  );
  const promoDiscount = Math.round((subtotal * promoDiscountPercent) / 100);
  const deliveryFee = subtotal === 0 || subtotal >= 1500 ? 0 : 199;
  const total = Math.max(subtotal - promoDiscount, 0) + deliveryFee;
  return { subtotal, productDiscount, promoDiscount, deliveryFee, total, minimumOrderAmount: MIN_ORDER_AMOUNT, remainingToMinimum: Math.max(0, MIN_ORDER_AMOUNT - subtotal) };
}
