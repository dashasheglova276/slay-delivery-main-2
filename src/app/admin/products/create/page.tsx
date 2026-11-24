"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProductForm, { type ProductFormValues } from "@/components/admin/product-form";

export default function CreateProductPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(values: ProductFormValues) {
    setError("");
    const categoryRes = await fetch("/api/admin/categories");
    const categoryData = await categoryRes.json();
    const category = (categoryData.categories ?? []).find((c: { slug: string }) => c.slug === values.categorySlug);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        description: values.description,
        categorySlug: values.categorySlug,
        categoryName: category?.name ?? values.categorySlug,
        price: values.price,
        oldPrice: values.oldPrice,
        unit: values.unit,
        weight: values.weight,
        saleType: values.saleType,
        step: values.step,
        composition: values.composition || "Подробный состав уточняйте на упаковке товара.",
        manufacturer: values.manufacturer || "StarFood Поставщик",
        shelfLife: values.shelfLife || "См. на упаковке",
        storage: values.storage || "Хранить в сухом прохладном месте.",
        image: values.image,
        images: values.images,
        isNew: values.isNew,
        inStock: values.inStock,
        active: values.active,
        featured: values.featured,
        relatedIds: values.relatedIds
      })
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Не удалось создать товар");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/admin/products" className="mb-2 flex items-center gap-1 text-sm text-smoke-500">
          <ChevronLeft size={15} />
          Товары
        </Link>
        <h1 className="font-display text-2xl font-bold">Новый товар</h1>
        <p className="text-sm text-smoke-500">Заполните информацию о товаре</p>
      </div>
      {error && <p className="text-sm text-flash-600">{error}</p>}
      <ProductForm onSubmit={handleSubmit} submitLabel="Создать товар" />
    </div>
  );
}

