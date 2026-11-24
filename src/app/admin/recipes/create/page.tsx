"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import RecipeForm, { type RecipeFormValues } from "@/components/admin/recipe-form";

export default function CreateRecipePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(values: RecipeFormValues) {
    setError("");
    const res = await fetch("/api/admin/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Не удалось создать рецепт");
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
        <h1 className="font-display text-2xl font-bold">Новый рецепт</h1>
        <p className="text-sm text-smoke-500">Свяжите ингредиенты с реальными товарами каталога</p>
      </div>
      {error && <p className="text-sm text-flash-600">{error}</p>}
      <RecipeForm onSubmit={handleSubmit} submitLabel="Создать рецепт" />
    </div>
  );
}
