"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, ChefHat, Clock, ListChecks } from "lucide-react";
import type { Recipe } from "@/data/recipes";

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/recipes")
      .then((res) => res.json())
      .then((data) => setRecipes(data.recipes ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function remove(slug: string) {
    setRecipes((prev) => prev.filter((r) => r.slug !== slug));
    await fetch(`/api/admin/recipes/${slug}`, { method: "DELETE" });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Рецепты</h1>
          <p className="text-sm text-smoke-500">{recipes.length} рецептов в разделе &quot;Что приготовить&quot;</p>
        </div>
        <Link
          href="/admin/recipes/create"
          className="flex items-center gap-2 rounded-full bg-lime-500 px-4 py-2.5 text-sm font-bold text-ink shadow-glowLime"
        >
          <Plus size={16} />
          Добавить рецепт
        </Link>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-smoke-500">Загрузка…</p>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl2 border border-smoke-100 bg-white py-16 text-center">
          <ChefHat className="h-8 w-8 text-smoke-300" />
          <p className="text-sm text-smoke-500">Рецептов пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <div key={recipe.slug} className="flex gap-3 rounded-xl2 border border-smoke-100 bg-white p-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl2 bg-smoke-50">
                <Image src={recipe.image} alt={recipe.title} fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <p className="line-clamp-1 text-sm font-semibold text-ink">{recipe.title}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-smoke-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {recipe.cookTimeMinutes} мин
                    </span>
                    <span className="flex items-center gap-1">
                      <ListChecks size={12} />
                      {recipe.ingredients.length}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-smoke-100 px-2 py-0.5 text-[10px] font-bold text-smoke-600">
                    {recipe.difficulty}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <Link
                      href={`/admin/recipes/${recipe.slug}/edit`}
                      aria-label="Редактировать"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke-100 text-smoke-600 hover:bg-smoke-200"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      aria-label="Удалить"
                      onClick={() => setConfirmSlug(recipe.slug)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke-100 text-flash-600 hover:bg-flash-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl3 bg-white p-5">
            <h3 className="font-display text-base font-bold">Удалить рецепт?</h3>
            <p className="mt-1 text-sm text-smoke-500">Это действие нельзя отменить.</p>
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
