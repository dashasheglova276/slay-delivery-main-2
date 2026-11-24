"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const sortOptions: { value: string; label: string }[] = [
  { value: "relevance", label: "По популярности" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
  { value: "rating", label: "По рейтингу" },
  { value: "discount", label: "По размеру скидки" }
];

export default function FilterBar({ categorySlug, brands = [] }: { categorySlug?: string; brands?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const currentSort = searchParams.get("sort") || "relevance";
  const onlyDiscount = searchParams.get("filter") === "discount";
  const onlyNew = searchParams.get("filter") === "new";
  const currentBrand = searchParams.get("brand") || "";
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const activeFiltersCount = [currentBrand, searchParams.get("minPrice"), searchParams.get("maxPrice")].filter(
    Boolean
  ).length;

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
        <button
          onClick={() => updateParam("filter", onlyDiscount ? null : "discount")}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
            onlyDiscount ? "border-flash-500 bg-flash-50 text-flash-600" : "border-smoke-200 text-smoke-600"
          )}
        >
          Скидки
        </button>
        <button
          onClick={() => updateParam("filter", onlyNew ? null : "new")}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
            onlyNew ? "border-ink bg-smoke-100 text-ink" : "border-smoke-200 text-smoke-600"
          )}
        >
          Новинки
        </button>
      </div>

      <button
        onClick={() => setFiltersOpen(true)}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold",
          activeFiltersCount > 0 ? "border-ink bg-ink text-white" : "border-smoke-200 text-smoke-600"
        )}
      >
        <Filter size={13} />
        Фильтры
        {activeFiltersCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-lime-500 px-1 text-[10px] font-bold text-ink">
            {activeFiltersCount}
          </span>
        )}
      </button>

      <button
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-smoke-200 px-3.5 py-1.5 text-xs font-semibold text-smoke-600"
      >
        <SlidersHorizontal size={13} />
        Сортировка
      </button>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink/40"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl3 bg-white p-5 pb-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-base font-bold">Фильтры</h3>
                <button onClick={() => setFiltersOpen(false)} aria-label="Закрыть">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-smoke-500">Цена, ₽</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="От"
                      className="w-full rounded-xl2 bg-smoke-100 px-3.5 py-2.5 text-sm outline-none ring-lime-500/60 focus:ring-2"
                    />
                    <span className="text-smoke-400">—</span>
                    <input
                      type="number"
                      min={0}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="До"
                      className="w-full rounded-xl2 bg-smoke-100 px-3.5 py-2.5 text-sm outline-none ring-lime-500/60 focus:ring-2"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-smoke-500">Бренд</p>
                  <div className="no-scrollbar flex flex-wrap gap-2">
                    <button
                      onClick={() => updateParam("brand", null)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        !currentBrand ? "border-ink bg-ink text-white" : "border-smoke-200 text-smoke-600"
                      )}
                    >
                      Все бренды
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => updateParam("brand", brand === currentBrand ? null : brand)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium",
                          currentBrand === brand ? "border-ink bg-ink text-white" : "border-smoke-200 text-smoke-600"
                        )}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete("minPrice");
                      params.delete("maxPrice");
                      params.delete("brand");
                      router.push(`${pathname}?${params.toString()}`);
                      setFiltersOpen(false);
                    }}
                    className="flex-1 rounded-full border border-smoke-200 py-3 text-sm font-semibold text-smoke-600"
                  >
                    Сбросить
                  </button>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      minPrice ? params.set("minPrice", minPrice) : params.delete("minPrice");
                      maxPrice ? params.set("maxPrice", maxPrice) : params.delete("maxPrice");
                      router.push(`${pathname}?${params.toString()}`);
                      setFiltersOpen(false);
                    }}
                    className="flex-1 rounded-full bg-lime-500 py-3 text-sm font-bold text-ink"
                  >
                    Показать
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink/40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl3 bg-white p-5 pb-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-base font-bold">Сортировка</h3>
                <button onClick={() => setOpen(false)} aria-label="Закрыть">
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      updateParam("sort", opt.value === "relevance" ? null : opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "rounded-xl2 px-4 py-3 text-left text-sm font-medium",
                      currentSort === opt.value ? "bg-lime-50 text-lime-700" : "text-smoke-700"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
