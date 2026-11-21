import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";

interface StoreValue {
  /** productId -> количество товаров в корзине */
  cart: Record<string, number>;
  cartCount: number;
  favorites: string[];
  addToCart: (id: string) => void;
  changeQty: (id: string, delta: number) => void;
  clearCart: () => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* localStorage может быть недоступен — не страшно */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>(() => load("sf-cart", {}));
  const [favorites, setFavorites] = useState<string[]>(() => load("sf-fav", []));

  const addToCart = useCallback((id: string) => {
    setCart((prev) => {
      const next = { ...prev, [id]: (prev[id] ?? 0) + 1 };
      save("sf-cart", next);
      return next;
    });
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setCart((prev) => {
      const qty = (prev[id] ?? 0) + delta;
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      save("sf-cart", next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
    save("sf-cart", {});
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      save("sf-fav", next);
      return next;
    });
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      cartCount: Object.values(cart).reduce((a, b) => a + b, 0),
      favorites,
      addToCart,
      changeQty,
      clearCart,
      toggleFavorite,
      isFavorite: (id) => favorites.includes(id),
    }),
    [cart, favorites, addToCart, changeQty, clearCart, toggleFavorite]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
