"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CollectionForm, { type CollectionFormValues } from "@/components/admin/collection-form";
import type { Collection } from "@/data/collections";

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/collections/${params.slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCollection(data?.collection ?? null));
  }, [params.slug]);

  if (collection === undefined) {
    return <p className="py-20 text-center text-sm text-smoke-500">Загрузка…</p>;
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-sm text-smoke-500">Подборка не найдена — возможно, она была удалена.</p>
        <Link href="/admin/collections" className="text-sm font-semibold text-lime-600">
          Вернуться к списку подборок
        </Link>
      </div>
    );
  }

  async function handleSubmit(values: CollectionFormValues) {
    setError("");
    const res = await fetch(`/api/admin/collections/${collection!.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        image: values.image,
        active: values.active,
        productIds: values.productIds
      })
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Не удалось сохранить изменения");
      return;
    }
    router.push("/admin/collections");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/admin/collections" className="mb-2 flex items-center gap-1 text-sm text-smoke-500">
          <ChevronLeft size={15} />
          Подборки
        </Link>
        <h1 className="font-display text-2xl font-bold">Редактировать подборку</h1>
        <p className="text-sm text-smoke-500">{collection.title}</p>
      </div>
      {error && <p className="text-sm text-flash-600">{error}</p>}
      <CollectionForm initial={collection} onSubmit={handleSubmit} submitLabel="Сохранить изменения" lockSlug />
    </div>
  );
}
