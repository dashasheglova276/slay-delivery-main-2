"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProductForm, { type ProductFormValues } from "@/components/admin/product-form";
import type { Product } from "@/data/products";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProduct(data?.product ?? null));
  }, [params.id]);

  if (product === undefined) {
    return <p className="py-20 text-center text-sm text-smoke-500">Загрузка…</p>;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-sm text-smoke-500">Товар не найден — возможно, он был удалён.</p>
        <Link href="/admin/products" className="text-sm font-semibold text-lime-600">
          Вернуться к списку товаров
        </Link>
      </div>
    );
  }

  async function handleSubmit(values: ProductFormValues) {
    setError("");
    const categoryRes = await fetch("/api/admin/categories");
    const categoryData = await categoryRes.json();
    const category = (categoryData.categories ?? []).find((c: { slug: string }) => c.slug === values.categorySlug);

    const res = await fetch(`/api/products/${product!.id}`, {
      method: "PATCH",
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
        composition: values.composition,
        manufacturer: values.manufacturer,
        shelfLife: values.shelfLife,
        storage: values.storage,
        image: values.image,
        images: values.images,
        inStock: values.inStock,
        active: values.active,
        isNew: values.isNew,
        featured: values.featured,
        relatedIds: values.relatedIds
      })
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Не удалось сохранить изменения");
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
        <h1 className="font-display text-2xl font-bold">Редактировать товар</h1>
        <p className="text-sm text-smoke-500">{product.name}</p>
      </div>
      {error && <p className="text-sm text-flash-600">{error}</p>}
      <ProductForm initial={product} onSubmit={handleSubmit} submitLabel="Сохранить изменения" />
    </div>
  );
}
