"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Tags } from "lucide-react";
import type { Category } from "@/data/categories";
import { cn } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function move(index: number, direction: -1 | 1) {
    const next = [...categories];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setCategories(next);
    await fetch("/api/admin/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: next.map((c) => c.slug) })
    });
  }

  async function remove(slug: string) {
    setError("");
    setCategories((prev) => prev.filter((c) => c.slug !== slug));
    const res = await fetch(`/api/admin/categories/${slug}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Не удалось удалить категорию");
      load();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Категории</h1>
          <p className="text-sm text-smoke-500">
            {categories.length} категорий — порядок влияет на отображение на главной и в каталоге
          </p>
        </div>
        <Link
          href="/admin/categories/create"
          className="flex items-center gap-2 rounded-full bg-lime-500 px-4 py-2.5 text-sm font-bold text-ink shadow-glowLime"
        >
          <Plus size={16} />
          Добавить категорию
        </Link>
      </div>

      {error && <p className="text-sm text-flash-600">{error}</p>}

      {loading ? (
        <p className="py-10 text-center text-sm text-smoke-500">Загрузка…</p>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl2 border border-smoke-100 bg-white py-16 text-center">
          <Tags className="h-8 w-8 text-smoke-300" />
          <p className="text-sm text-smoke-500">Категорий пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <div key={c.slug} className="flex flex-col overflow-hidden rounded-xl2 border border-smoke-100 bg-white">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-smoke-50">
                {c.image ? (
                  <Image src={c.image} alt={c.name} fill sizes="240px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-4xl">{c.emoji}</span>
                )}
                <span
                  className={cn(
                    "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-subtle",
                    c.active !== false ? "bg-lime-500 text-ink" : "bg-white/90 text-smoke-500"
                  )}
                >
                  {c.active !== false ? "Активна" : "Скрыта"}
                </span>
                <div className="absolute right-2 top-2 flex flex-col gap-1 rounded-full bg-white/90 p-0.5 shadow-subtle">
                  <button
                    aria-label="Выше"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="flex h-6 w-6 items-center justify-center text-smoke-500 hover:text-ink disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    aria-label="Ниже"
                    disabled={i === categories.length - 1}
                    onClick={() => move(i, 1)}
                    className="flex h-6 w-6 items-center justify-center text-smoke-500 hover:text-ink disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-1.5 p-3">
                <p className="line-clamp-1 text-sm font-semibold text-ink">
                  {c.emoji} {c.name}
                </p>
                <p className="text-xs text-smoke-400">
                  /{c.slug} · {c.productCount} товаров
                </p>

                <div className="mt-auto flex items-center gap-1.5 pt-2">
                  <Link
                    href={`/admin/categories/${c.slug}/edit`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-smoke-100 py-2 text-xs font-semibold text-smoke-700 hover:bg-smoke-200"
                  >
                    <Pencil size={13} />
                    Изменить
                  </Link>
                  <button
                    aria-label="Удалить"
                    onClick={() => setConfirmSlug(c.slug)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-smoke-100 text-flash-600 hover:bg-flash-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl3 bg-white p-5">
            <h3 className="font-display text-base font-bold">Удалить категорию?</h3>
            <p className="mt-1 text-sm text-smoke-500">
              Товары в этой категории не удалятся, но пропадут из навигации по категории.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setConfirmSlug(null)}
                className="flex-1 rounded-full border border-smoke-200 py-2.5 text-sm font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  remove(confirmSlug);
                  setConfirmSlug(null);
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
