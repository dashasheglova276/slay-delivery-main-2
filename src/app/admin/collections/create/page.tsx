"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CollectionForm, { type CollectionFormValues } from "@/components/admin/collection-form";

export default function CreateCollectionPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(values: CollectionFormValues) {
    setError("");
    const res = await fetch("/api/admin/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Не удалось создать подборку");
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
        <h1 className="font-display text-2xl font-bold">Новая подборка</h1>
        <p className="text-sm text-smoke-500">Подборка сразу появится на главной странице</p>
      </div>
      {error && <p className="text-sm text-flash-600">{error}</p>}
      <CollectionForm onSubmit={handleSubmit} submitLabel="Создать подборку" />
    </div>
  );
}
