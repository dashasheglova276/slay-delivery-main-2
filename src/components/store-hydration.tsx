"use client";

import { useEffect } from "react";
import { useCartStore } from "@/context/cart-store";
import { useFavoritesStore } from "@/context/favorites-store";

export default function StoreHydration() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
    void useFavoritesStore.persist.rehydrate();
  }, []);

  return null;
}
