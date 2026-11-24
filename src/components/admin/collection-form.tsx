"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadCloud, X, Search, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import type { Collection } from "@/data/collections";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";

export interface CollectionFormValues {
  slug: string;
  title: string;
  image: string | null;
  active: boolean;
  productIds: string[];
}

export default function CollectionForm({
  initial,
  onSubmit,
  submitLabel = "Сохранить подборку",
  lockSlug
}: {
  initial?: Collection;
  onSubmit: (values: CollectionFormValues) => void;
  submitLabel?: string;
  /** При редактировании slug менять нельзя — это первичный ключ. */
  lockSlug?: boolean;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [image, setImage] = useState<string | null>(initial?.image ?? null);
  const [active, setActive] = useState(initial?.active !== false);
  const [items, setItems] = useState<Product[]>(initial?.products ?? []);
  const [error, setError] = useState("");

  function handleFile(files: FileList | null) {
    if (!files || !files[0]) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(files[0]);
  }

  function addProduct(product: Product) {
    if (items.some((p) => p.id === product.id)) return;
    setItems((prev) => [...prev, product]);
  }

  function removeProduct(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function move(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || (!lockSlug && !slug.trim())) {
      setError("Заполните название и slug");
      return;
    }
    if (items.length === 0) {
      setError("Добавьте хотя бы один товар в подборку");
      return;
    }
    onSubmit({
      slug: slug.trim().toLowerCase(),
      title: title.trim(),
      image,
      active,
      productIds: items.map((p) => p.id)
    });
  }

  // Cover fallback preview: если обложка не задана, показываем фото первого товара —
  // так же, как это будет выглядеть на витрине (см. collection-card.tsx).
  const previewImage = image ?? items[0]?.image ?? null;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-[1fr,320px]">
      <div className="flex flex-col gap-4">
        <Field label="Название подборки" required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Для завтрака"
            className="admin-input"
          />
        </Field>

        <Field label="Slug (латиница, для ссылок)" required>
          <input
            value={slug}
            disabled={lockSlug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="breakfast"
            className="admin-input disabled:bg-smoke-50 disabled:text-smoke-400"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-lime-500"
          />
          Подборка активна (видна на витрине)
        </label>

        <Field label={`Товары в подборке (${items.length})`} required>
          <ProductPicker onSelect={addProduct} excludeIds={items.map((p) => p.id)} />
          <div className="mt-2 flex flex-col gap-1.5">
            {items.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-xl2 border border-smoke-100 bg-white px-2.5 py-2 text-sm"
              >
                <GripVertical size={14} className="shrink-0 text-smoke-300" />
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-smoke-50">
                  <Image src={p.image} alt="" fill sizes="36px" className="object-cover" />
                </div>
                <span className="line-clamp-1 flex-1">{p.name}</span>
                <span className="shrink-0 text-xs text-smoke-400">{formatPrice(p.price)}</span>
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    aria-label="Выше"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="text-smoke-400 hover:text-ink disabled:opacity-30"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label="Ниже"
                    disabled={i === items.length - 1}
                    onClick={() => move(i, 1)}
                    className="text-smoke-400 hover:text-ink disabled:opacity-30"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(p.id)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-smoke-100 text-smoke-500 hover:bg-flash-50 hover:text-flash-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {items.length === 0 && (
              <p className="rounded-xl2 border border-dashed border-smoke-200 p-3 text-center text-xs text-smoke-400">
                Пока нет товаров — найдите их через поиск выше
              </p>
            )}
          </div>
        </Field>

        {error && <p className="text-sm text-flash-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button type="submit" className="rounded-full bg-lime-500 px-6 py-3 text-sm font-bold text-ink shadow-glowLime">
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/collections")}
            className="rounded-full border border-smoke-200 px-6 py-3 text-sm font-semibold text-smoke-600"
          >
            Отмена
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Field label="Обложка подборки (необязательно)">
          {image ? (
            <div className="relative aspect-square overflow-hidden rounded-xl2">
              <Image src={image} alt="Обложка" fill sizes="240px" className="object-cover" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl2 border-2 border-dashed border-smoke-200 bg-smoke-50 text-center hover:border-lime-500">
              <UploadCloud className="h-6 w-6 text-smoke-400" />
              <span className="text-[11px] text-smoke-500">Загрузить фото</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
            </label>
          )}
          {!image && items[0] && (
            <p className="mt-1.5 text-[11px] text-smoke-400">
              Без своей обложки на витрине покажется фото первого товара
            </p>
          )}
        </Field>

        <div className="rounded-xl2 border border-smoke-100 bg-white p-4">
          <p className="mb-2 text-xs font-semibold text-smoke-400">Предпросмотр</p>
          {previewImage && (
            <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-xl">
              <Image src={previewImage} alt="" fill sizes="240px" className="object-cover" />
            </div>
          )}
          <p className="text-sm font-medium text-ink">{title || "Название подборки"}</p>
          <p className="text-xs text-smoke-400">{items.length} товаров</p>
        </div>
      </div>

      <style jsx>{`
        .admin-input {
          border: 1px solid #e7e7e9;
          border-radius: 1.25rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
          width: 100%;
        }
        .admin-input:focus {
          box-shadow: 0 0 0 2px rgba(139, 224, 78, 0.6);
        }
      `}</style>
    </form>
  );
}

/** Поиск товаров каталога для добавления в подборку. */
function ProductPicker({
  onSelect,
  excludeIds
}: {
  onSelect: (product: Product) => void;
  excludeIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);

  function search(q: string) {
    setQuery(q);
    setOpen(true);
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    fetch(`/api/products?query=${encodeURIComponent(trimmed)}&admin=1`)
      .then((res) => res.json())
      .then((data) => setResults((data.products ?? []).filter((p: Product) => !excludeIds.includes(p.id))));
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-smoke-400" />
        <input
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Найти товар для подборки..."
          className="w-full rounded-full border border-smoke-200 bg-white py-3 pl-9 pr-4 text-sm outline-none ring-lime-500/60 focus:ring-2"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl2 border border-smoke-100 bg-white p-1.5 shadow-card">
          {results.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                onSelect(product);
                setQuery("");
                setResults([]);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-smoke-50"
            >
              <span className="line-clamp-1">{product.name}</span>
              <span className="shrink-0 text-xs text-smoke-400">{formatPrice(product.price)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-smoke-500">
        {label}
        {required && <span className="text-flash-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
