"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CategoryForm, { type CategoryFormValues } from "@/components/admin/category-form";
import type { Category } from "@/data/categories";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/categories/${params.slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCategory(data?.category ?? null));
  }, [params.slug]);

  if (category === undefined) {
    return <p className="py-20 text-center text-sm text-smoke-500">Загрузка…</p>;
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-sm text-smoke-500">Категория не найдена — возможно, она была удалена.</p>
        <Link href="/admin/categories" className="text-sm font-semibold text-lime-600">
          Вернуться к списку категорий
        </Link>
      </div>
    );
  }

  async function handleSubmit(values: CategoryFormValues) {
    setError("");
    const res = await fetch(`/api/admin/categories/${category!.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name, emoji: values.emoji, image: values.image, active: values.active })
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Не удалось сохранить изменения");
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/admin/categories" className="mb-2 flex items-center gap-1 text-sm text-smoke-500">
          <ChevronLeft size={15} />
          Категории
        </Link>
        <h1 className="font-display text-2xl font-bold">Редактировать категорию</h1>
        <p className="text-sm text-smoke-500">{category.name}</p>
      </div>
      {error && <p className="text-sm text-flash-600">{error}</p>}
      <CategoryForm initial={category} onSubmit={handleSubmit} submitLabel="Сохранить изменения" lockSlug />
    </div>
  );
}
