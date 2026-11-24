"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, LayoutGrid } from "lucide-react";
import type { Collection } from "@/data/collections";
import { cn } from "@/lib/utils";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/admin/collections")
      .then((res) => res.json())
      .then((data) => setCollections(data.collections ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function remove(slug: string) {
    setError("");
    setCollections((prev) => prev.filter((c) => c.slug !== slug));
    const res = await fetch(`/api/admin/collections/${slug}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Не удалось удалить подборку");
      load();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Подборки</h1>
          <p className="text-sm text-smoke-500">{collections.length} подборок на главной и в каталоге</p>
        </div>
        <Link
          href="/admin/collections/create"
          className="flex items-center gap-2 rounded-full bg-lime-500 px-4 py-2.5 text-sm font-bold text-ink shadow-glowLime"
        >
          <Plus size={16} />
          Добавить подборку
        </Link>
      </div>

      {error && <p className="text-sm text-flash-600">{error}</p>}

      {loading ? (
        <p className="py-10 text-center text-sm text-smoke-500">Загрузка…</p>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl2 border border-smoke-100 bg-white py-16 text-center">
          <LayoutGrid className="h-8 w-8 text-smoke-300" />
          <p className="text-sm text-smoke-500">Подборок пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {collections.map((c) => {
            const cover = c.image ?? c.products[0]?.image;
            return (
              <div key={c.slug} className="flex flex-col overflow-hidden rounded-xl2 border border-smoke-100 bg-white">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-smoke-50">
                  {cover ? (
                    <Image src={cover} alt={c.title} fill sizes="240px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-smoke-300">
                      <LayoutGrid size={28} />
                    </span>
                  )}
                  <span
                    className={cn(
                      "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-subtle",
                      c.active !== false ? "bg-lime-500 text-ink" : "bg-white/90 text-smoke-500"
                    )}
                  >
                    {c.active !== false ? "Активна" : "Скрыта"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <p className="line-clamp-1 text-sm font-semibold text-ink">{c.title}</p>
                  <p className="text-xs text-smoke-400">
                    /{c.slug} · {c.products.length} товаров
                  </p>

                  <div className="mt-auto flex items-center gap-1.5 pt-2">
                    <Link
                      href={`/admin/collections/${c.slug}/edit`}
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
            );
          })}
        </div>
      )}

      {confirmSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl3 bg-white p-5">
            <h3 className="font-display text-base font-bold">Удалить подборку?</h3>
            <p className="mt-1 text-sm text-smoke-500">Товары в ней не удалятся, пропадёт только сама подборка.</p>
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
