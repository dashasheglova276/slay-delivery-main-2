"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import RecipeForm, { type RecipeFormValues } from "@/components/admin/recipe-form";
import type { Recipe } from "@/data/recipes";

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/recipes/${params.slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setRecipe(data?.recipe ?? null));
  }, [params.slug]);

  if (recipe === undefined) {
    return <p className="py-20 text-center text-sm text-smoke-500">Загрузка…</p>;
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-sm text-smoke-500">Рецепт не найден — возможно, он был удалён.</p>
        <Link href="/admin/recipes" className="text-sm font-semibold text-lime-600">
          Вернуться к списку рецептов
        </Link>
      </div>
    );
  }

  async function handleSubmit(values: RecipeFormValues) {
    setError("");
    const res = await fetch(`/api/admin/recipes/${recipe!.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Не удалось сохранить изменения");
      return;
    }
    router.push("/admin/recipes");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/admin/recipes" className="mb-2 flex items-center gap-1 text-sm text-smoke-500">
          <ChevronLeft size={15} />
          Рецепты
        </Link>
        <h1 className="font-display text-2xl font-bold">Редактировать рецепт</h1>
        <p className="text-sm text-smoke-500">{recipe.title}</p>
      </div>
      {error && <p className="text-sm text-flash-600">{error}</p>}
      <RecipeForm initial={recipe} onSubmit={handleSubmit} submitLabel="Сохранить изменения" lockSlug />
    </div>
  );
}
