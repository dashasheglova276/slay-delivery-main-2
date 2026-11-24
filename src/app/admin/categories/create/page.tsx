"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CategoryForm, { type CategoryFormValues } from "@/components/admin/category-form";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(values: CategoryFormValues) {
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Не удалось создать категорию");
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
        <h1 className="font-display text-2xl font-bold">Новая категория</h1>
        <p className="text-sm text-smoke-500">Категория сразу появится в каталоге и на главной странице</p>
      </div>
      {error && <p className="text-sm text-flash-600">{error}</p>}
      <CategoryForm onSubmit={handleSubmit} submitLabel="Создать категорию" />
    </div>
  );
}
