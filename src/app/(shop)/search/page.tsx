"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, X } from "lucide-react";
import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";
import ProductGrid from "@/components/product-grid";

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/products?query=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => setResults(data.products ?? []))
        .finally(() => setLoading(false));
    }, 250); // небольшой debounce, чтобы не слать запрос на каждый символ
    return () => clearTimeout(timeout);
  }, [query]);

  const suggestions = categories.slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 md:px-6">
      <div className="relative mb-5">
        <SearchIcon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-smoke-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти продукты, бренды..."
          className="w-full rounded-full bg-smoke-100 py-3.5 pl-11 pr-10 text-sm outline-none ring-lime-500/60 focus:ring-2"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Очистить"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-smoke-400"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {!query.trim() ? (
        <div>
          <h2 className="mb-3 font-display text-sm font-bold text-smoke-500">Популярные категории</h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((c) => (
              <button
                key={c.slug}
                onClick={() => setQuery(c.name)}
                className="flex items-center gap-1.5 rounded-full bg-smoke-100 px-3.5 py-2 text-xs font-medium"
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-smoke-400">
            {loading ? "Ищем…" : `${results.length} результатов по запросу «${query}»`}
          </p>
          <ProductGrid products={results} />
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}
