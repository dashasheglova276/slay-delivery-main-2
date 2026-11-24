"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, PackageX } from "lucide-react";
import type { Category } from "@/data/categories";
import type { Product } from "@/data/products";
import { formatPrice, cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products?admin=1")
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []));
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  async function deleteProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/products/${id}`, { method: "DELETE" });
  }

  const filtered = products.filter((p) => {
    const matchesQuery = query.trim()
      ? p.name.toLowerCase().includes(query.trim().toLowerCase())
      : true;
    const matchesCategory = categoryFilter ? p.categorySlug === categoryFilter : true;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Товары</h1>
          <p className="text-sm text-smoke-500">{products.length} товаров в каталоге</p>
        </div>
        <Link
          href="/admin/products/create"
          className="flex items-center gap-2 rounded-full bg-lime-500 px-4 py-2.5 text-sm font-bold text-ink shadow-glowLime"
        >
          <Plus size={16} />
          Добавить товар
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-smoke-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full rounded-xl2 border border-smoke-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl2 border border-smoke-200 bg-white px-3 py-2.5 text-sm outline-none"
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl2 border border-smoke-100 bg-white py-16 text-center">
          <PackageX className="h-8 w-8 text-smoke-300" />
          <p className="text-sm text-smoke-500">Товары не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => {
            const inStock = product.inStock !== false;
            const isActive = product.active !== false;
            return (
              <div key={product.id} className="flex gap-3 rounded-xl2 border border-smoke-100 bg-white p-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl2 bg-smoke-50">
                  <Image src={product.image} alt={product.name} fill sizes="80px" className="object-cover" />
                  {!inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] font-bold text-white">
                      Нет в наличии
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <p className="line-clamp-1 text-sm font-semibold text-ink">{product.name}</p>
                    <p className="text-xs text-smoke-400">{product.categoryName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                      {product.oldPrice && (
                        <span className="text-xs text-smoke-400 line-through">{formatPrice(product.oldPrice)}</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        inStock ? "bg-lime-100 text-lime-700" : "bg-smoke-100 text-smoke-500"
                      )}
                    >
                      {inStock ? "В наличии" : "Нет в наличии"}
                    </span>
                    {!isActive && (
                      <span className="rounded-full bg-flash-50 px-2 py-0.5 text-[10px] font-bold text-flash-600">
                        Скрыт
                      </span>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        aria-label="Редактировать"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke-100 text-smoke-600 hover:bg-smoke-200"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        aria-label="Удалить"
                        onClick={() => setConfirmId(product.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke-100 text-flash-600 hover:bg-flash-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl3 bg-white p-5">
            <h3 className="font-display text-base font-bold">Удалить товар?</h3>
            <p className="mt-1 text-sm text-smoke-500">Это действие нельзя отменить.</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 rounded-full border border-smoke-200 py-2.5 text-sm font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  deleteProduct(confirmId);
                  setConfirmId(null);
                }}
                className="flex-1 rounded-full bg-flash-500 py-2.5 text-sm font-bold text-white"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
