"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import type { Product } from "@/data/products";
import ProductGrid from "@/components/product-grid";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const trimmed = query.trim();

  useEffect(() => {
    const words = ["хлеб", "сыр", "молоко безлактозное"];
    let word = 0;
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (query) return;
      const current = words[word];
      char += deleting ? -1 : 1;
      setPlaceholder(current.slice(0, char));
      let delay = deleting ? 105 : 175;
      if (!deleting && char === current.length) { deleting = true; delay = 1900; }
      else if (deleting && char === 0) { deleting = false; word = (word + 1) % words.length; delay = 650; }
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 450);
    return () => clearTimeout(timer);
  }, [Boolean(query)]);

  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/products?query=${encodeURIComponent(trimmed)}`)
        .then((response) => response.json())
        .then((data) => setResults(data.products ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [trimmed]);

  return (
    <div className={`search-wrap${trimmed ? " search-results-open" : ""}`}>
      <label className="search">
        <Search size={20} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder || "Поиск продуктов"} aria-label="Найти продукты" />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск"><X size={17} /></button>}
      </label>
      {trimmed && (
        <div className="search-results">
          <div className="section-head">
            <h2>{loading ? "Ищем…" : `Результаты поиска · ${results.length}`}</h2>
            {!loading && results.length > 6 && <Link className="link" href={`/search?q=${encodeURIComponent(trimmed)}`}>Все <ArrowRight size={15} /></Link>}
          </div>
          <ProductGrid products={results.slice(0, 6)} />
        </div>
      )}
    </div>
  );
}
