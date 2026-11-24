"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadCloud, X, Search } from "lucide-react";
import type { Category } from "@/data/categories";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";

export interface ProductFormValues {
  name: string;
  description: string;
  categorySlug: string;
  price: number;
  oldPrice: number | null;
  image: string;
  images: string[];
  inStock: boolean;
  unit: string;
  weight: number;
  composition: string;
  manufacturer: string;
  shelfLife: string;
  storage: string;
  isNew: boolean;
  featured: boolean;
  relatedIds: string[];
  /** Продаётся поштучно или на вес. */
  saleType: "piece" | "weight";
  /** Шаг добавления в корзину: граммы для весового товара. */
  step: number;
  /** Скрыть товар с публичной витрины, не удаляя (отдельно от inStock). */
  active: boolean;
}

const MIN_IMAGES = 1;

export default function ProductForm({
  initial,
  onSubmit,
  submitLabel = "Сохранить товар"
}: {
  initial?: Product;
  onSubmit: (values: ProductFormValues) => void;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [oldPrice, setOldPrice] = useState(initial?.oldPrice?.toString() ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "шт");
  const [weight, setWeight] = useState(initial?.weight?.toString() ?? "1");
  const [saleType, setSaleType] = useState<"piece" | "weight">(initial?.saleType ?? "piece");
  const [step, setStep] = useState(initial?.step ?? 500);
  const [inStock, setInStock] = useState(initial?.inStock !== false);
  const [active, setActive] = useState(initial?.active !== false);
  // Галерея: минимум 3 фотографии. Первое изображение в массиве — главное (image).
  const [images, setImages] = useState<string[]>(initial?.images?.length ? initial.images : initial?.image ? [initial.image] : []);
  // Характеристики
  const [composition, setComposition] = useState(initial?.composition ?? "");
  const [manufacturer, setManufacturer] = useState(initial?.manufacturer ?? "");
  const [shelfLife, setShelfLife] = useState(initial?.shelfLife ?? "");
  const [storage, setStorage] = useState(initial?.storage ?? "");
  // Акции/популярность/связанные товары
  const [isNew, setIsNew] = useState(initial?.isNew ?? false);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  const soldByPackage = categorySlug === "bakery";
  const soldByKilogram = unit === "кг" && !soldByPackage;

  useEffect(() => {
    if (soldByPackage) {
      setSaleType("piece");
      setStep(1);
    } else if (soldByKilogram) {
      setSaleType("weight");
      setStep((current) => current > 1 ? current : 500);
    }
  }, [soldByKilogram, soldByPackage]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        const list: Category[] = data.categories ?? [];
        setCategories(list);
        if (!categorySlug && list[0]) setCategorySlug(list[0].slug);
      });
  }, []);

  useEffect(() => {
    if (!initial?.relatedIds?.length) return;
    Promise.all(
      initial.relatedIds.map((id) =>
        fetch(`/api/products/${id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => data?.product)
      )
    ).then((products) => setRelatedProducts(products.filter(Boolean)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiles(files: FileList) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function makeMain(index: number) {
    setImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);
  }

  function addRelated(product: Product) {
    if (product.id === initial?.id) return;
    if (relatedProducts.some((p) => p.id === product.id)) return;
    setRelatedProducts((prev) => [...prev, product]);
  }

  function removeRelated(id: string) {
    setRelatedProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price) {
      setError("Заполните название и цену");
      return;
    }
    if (images.length < MIN_IMAGES) {
      setError(`Загрузите минимум ${MIN_IMAGES} фотографии товара (сейчас: ${images.length})`);
      return;
    }
    // Та же защита, что и на сервере: шаг весового товара — целое число граммов,
    // не меньше 1. Именно перепутанные кг/граммы в этом поле когда-то приводили
    // к тому, что 0.2 кг огурцов превращались в 200 позиций в корзине.
    if (saleType === "weight" && (!Number.isInteger(step) || step < 1)) {
      setError("Шаг для весового товара должен быть целым числом граммов, не меньше 1 (например 500 = 0,5 кг)");
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      categorySlug,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      image: images[0],
      images,
      inStock,
      active,
      unit,
      weight: Number(weight) || 1,
      composition: composition.trim(),
      manufacturer: manufacturer.trim(),
      shelfLife: shelfLife.trim(),
      storage: storage.trim(),
      isNew,
      featured,
      relatedIds: relatedProducts.map((p) => p.id),
      saleType,
      step: saleType === "weight" ? step : 1
    });
  }

  const category = categories.find((c) => c.slug === categorySlug);
  const discountPercent =
    oldPrice && price && Number(oldPrice) > Number(price)
      ? Math.round((1 - Number(price) / Number(oldPrice)) * 100)
      : 0;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-[1fr,320px]">
      <div className="flex flex-col gap-4">
        <Field label="Название товара" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Огурцы грунтовые"
            className="admin-input"
          />
        </Field>

        <Field label="Описание">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Короткое описание товара для карточки"
            className="admin-input resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Категория" required>
            <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className="admin-input">
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Единица измерения">
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="admin-input">
              {["шт", "кг", "г", "л", "мл"].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label={saleType === "weight" ? "Цена, ₽ за 1 кг" : "Цена, ₽"} required>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="199"
              className="admin-input"
            />
          </Field>
          <Field label="Старая цена, ₽">
            <input
              type="number"
              min={0}
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              placeholder="Если есть скидка"
              className="admin-input"
            />
          </Field>
          <Field label="Вес / объём (для карточки товара)">
            <input
              type="number"
              min={0}
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="admin-input"
            />
          </Field>
        </div>
        {discountPercent > 0 && (
          <p className="-mt-2 text-xs font-semibold text-flash-600">Скидка по цене: −{discountPercent}%</p>
        )}

        <div className="rounded-xl2 border border-smoke-100 bg-smoke-50/60 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-smoke-400">Продажа товара</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="radio"
                name="saleType"
                checked={saleType === "piece" && !soldByKilogram || soldByPackage}
                disabled={soldByKilogram}
                onChange={() => setSaleType("piece")}
                className="h-4 w-4 accent-lime-500"
              />
              Поштучно
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="radio"
                name="saleType"
                checked={saleType === "weight" || soldByKilogram}
                disabled={soldByPackage}
                onChange={() => setSaleType("weight")}
                className="h-4 w-4 accent-lime-500"
              />
              На вес
            </label>
          </div>

          {(saleType === "weight" || soldByKilogram) && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <Field label="Шаг добавления, г">
                <input type="number" min={1} step={1} value={step} onChange={(e) => setStep(Number(e.target.value))} className="admin-input" />
              </Field>
              <p className="col-span-2 text-[11px] text-smoke-400">
                Цена — стоимость за 1 кг. Поле step хранит размер шага в граммах. Например, 500 = 0,5 кг.
              </p>
            </div>
          )}
          {soldByPackage && <p className="mt-2 text-[11px] text-smoke-400">Товары из пекарни продаются поштучно; вес указан для информации на карточке.</p>}
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="h-4 w-4 accent-lime-500"
            />
            Товар в наличии
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 accent-lime-500"
            />
            Активен (виден на витрине)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={isNew}
              onChange={(e) => setIsNew(e.target.checked)}
              className="h-4 w-4 accent-lime-500"
            />
            Новинка
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 accent-lime-500"
            />
            Популярный товар (кураторская подборка)
          </label>
        </div>

        <div className="rounded-xl2 border border-smoke-100 bg-smoke-50/60 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-smoke-400">Характеристики</p>
          <div className="flex flex-col gap-3">
            <Field label="Состав">
              <textarea
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
                rows={2}
                className="admin-input resize-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Производитель">
                <input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} className="admin-input" />
              </Field>
              <Field label="Срок годности">
                <input value={shelfLife} onChange={(e) => setShelfLife(e.target.value)} className="admin-input" />
              </Field>
            </div>
            <Field label="Условия хранения">
              <input value={storage} onChange={(e) => setStorage(e.target.value)} className="admin-input" />
            </Field>
          </div>
        </div>

        <Field label="Похожие товары (вручную, необязательно)">
          <RelatedProductPicker excludeId={initial?.id} onSelect={addRelated} />
          <div className="mt-2 flex flex-col gap-1.5">
            {relatedProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl2 border border-smoke-100 bg-white px-3 py-2 text-sm">
                <span className="line-clamp-1">{p.name}</span>
                <button
                  type="button"
                  onClick={() => removeRelated(p.id)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-smoke-100 text-smoke-500 hover:bg-flash-50 hover:text-flash-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-smoke-400">
            Если список пуст, на карточке товара показываются товары из той же категории автоматически.
          </p>
        </Field>

        {error && <p className="text-sm text-flash-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button type="submit" className="rounded-full bg-lime-500 px-6 py-3 text-sm font-bold text-ink shadow-glowLime">
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="rounded-full border border-smoke-200 px-6 py-3 text-sm font-semibold text-smoke-600"
          >
            Отмена
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Field label={`Фото товара (минимум ${MIN_IMAGES}, первое — главное)`} required>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl2 ring-2 ring-transparent">
                <Image src={img} alt={`Фото ${i + 1}`} fill sizes="120px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded-full bg-lime-500 px-1.5 py-0.5 text-[9px] font-bold text-ink">
                    Главное
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeMain(i)}
                      className="rounded bg-white/90 px-1 text-[9px] font-semibold"
                    >
                      Сделать главным
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-white/90"
                  >
                    <X size={11} />
                  </button>
                </div>
              </div>
            ))}
            <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl2 border-2 border-dashed border-smoke-200 bg-smoke-50 text-center hover:border-lime-500">
              <UploadCloud className="h-6 w-6 text-smoke-400" />
              <span className="text-[10px] text-smoke-500">Добавить</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                }}
              />
            </label>
          </div>
          <p className="mt-1.5 text-[11px] text-smoke-400">
            Загружено: {images.length} {images.length < MIN_IMAGES && `(нужно ещё ${MIN_IMAGES - images.length})`}
          </p>
        </Field>

        <div className="rounded-xl2 border border-smoke-100 bg-white p-4">
          <p className="mb-2 text-xs font-semibold text-smoke-400">Предпросмотр карточки</p>
          <p className="text-sm font-medium text-ink">{name || "Название товара"}</p>
          {category && (
            <p className="text-xs text-smoke-400">
              {category.emoji} {category.name}
            </p>
          )}
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-bold">{price ? `${price} ₽` : "— ₽"}</span>
            {oldPrice && <span className="text-xs text-smoke-400 line-through">{oldPrice} ₽</span>}
          </div>
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

/** Поиск товаров каталога для ручной привязки в качестве "похожего товара". */
function RelatedProductPicker({ onSelect, excludeId }: { onSelect: (product: Product) => void; excludeId?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/products?query=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => setResults((data.products ?? []).filter((p: Product) => p.id !== excludeId)));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, excludeId]);

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-smoke-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Найти товар..."
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

