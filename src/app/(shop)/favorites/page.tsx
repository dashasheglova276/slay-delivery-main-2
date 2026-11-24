"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/context/favorites-store";
import type { Product } from "@/data/products";
import ProductGrid from "@/components/product-grid";

export default function FavoritesPage() {
  const ids = useFavoritesStore((s) => s.ids);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []));
  }, [ids]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 md:px-6">
      <h1 className="mb-4 font-display text-xl font-bold">Избранное</h1>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-smoke-100">
            <Heart className="h-7 w-7 text-smoke-400" />
          </div>
          <h2 className="font-display text-base font-bold">Пока пусто</h2>
          <p className="text-sm text-smoke-500">Нажмите на сердечко у товара, чтобы сохранить его здесь</p>
          <Link href="/catalog" className="mt-2 rounded-full bg-lime-500 px-6 py-3 text-sm font-bold text-ink">
            В каталог
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
