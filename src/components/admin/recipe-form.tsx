"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadCloud, X, Plus, Search, GripVertical } from "lucide-react";
import type { Recipe, RecipeDifficulty, RecipeIngredient } from "@/data/recipes";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";

export interface RecipeFormValues {
  slug: string;
  title: string;
  image: string;
  cookTimeMinutes: number;
  difficulty: RecipeDifficulty;
  description: string;
  steps: string[];
  ingredients: RecipeIngredient[];
}

const DIFFICULTIES: RecipeDifficulty[] = ["Легко", "Средне", "Сложно"];

export default function RecipeForm({
  initial,
  onSubmit,
  submitLabel = "Сохранить рецепт",
  lockSlug
}: {
  initial?: Recipe;
  onSubmit: (values: RecipeFormValues) => void;
  submitLabel?: string;
  lockSlug?: boolean;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [cookTimeMinutes, setCookTimeMinutes] = useState(initial?.cookTimeMinutes?.toString() ?? "20");
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>(initial?.difficulty ?? "Легко");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [steps, setSteps] = useState<string[]>(initial?.steps?.length ? initial.steps : [""]);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(initial?.ingredients ?? []);
  const [error, setError] = useState("");

  function handleFile(files: FileList | null) {
    if (!files || !files[0]) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(files[0]);
  }

  function updateStep(i: number, value: string) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? value : s)));
  }
  function addStep() {
    setSteps((prev) => [...prev, ""]);
  }
  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addIngredient(product: Product) {
    if (ingredients.some((ing) => ing.productId === product.id)) return;
    setIngredients((prev) => [...prev, { productId: product.id, name: product.name }]);
  }
  function updateIngredientName(index: number, name: string) {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, name } : ing)));
  }
  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);
    if (!title.trim() || !image || (!lockSlug && !slug.trim())) {
      setError("Заполните название, slug и фото рецепта");
      return;
    }
    if (ingredients.length === 0) {
      setError("Добавьте хотя бы один ингредиент из товаров");
      return;
    }
    if (cleanSteps.length === 0) {
      setError("Добавьте хотя бы один шаг приготовления");
      return;
    }
    onSubmit({
      slug: slug.trim().toLowerCase(),
      title: title.trim(),
      image,
      cookTimeMinutes: Number(cookTimeMinutes) || 1,
      difficulty,
      description: description.trim(),
      steps: cleanSteps,
      ingredients
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-[1fr,320px]">
      <div className="flex flex-col gap-4">
        <Field label="Название рецепта" required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Омлет с помидорами и сыром"
            className="admin-input"
          />
        </Field>

        <Field label="Slug (латиница, для ссылок)" required>
          <input
            value={slug}
            disabled={lockSlug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="omelette-tomato-cheese"
            className="admin-input disabled:bg-smoke-50 disabled:text-smoke-400"
          />
        </Field>

        <Field label="Описание">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="admin-input resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Время приготовления, мин" required>
            <input
              type="number"
              min={1}
              value={cookTimeMinutes}
              onChange={(e) => setCookTimeMinutes(e.target.value)}
              className="admin-input"
            />
          </Field>
          <Field label="Сложность">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as RecipeDifficulty)}
              className="admin-input"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Ингредиенты (связаны с товарами каталога)" required>
          <IngredientPicker onSelect={addIngredient} />
          <div className="recipe-ingredient-rail mt-2">
            {ingredients.length === 0 && (
              <p className="text-xs text-smoke-400">Ингредиенты не добавлены — найдите товары выше.</p>
            )}
            {ingredients.map((ing, i) => (
              <div key={ing.productId} className="recipe-ingredient-card flex items-center gap-2">
                <GripVertical size={14} className="shrink-0 text-smoke-300" />
                <input
                  value={ing.name}
                  onChange={(e) => updateIngredientName(i, e.target.value)}
                  className="flex-1 border-none bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-smoke-100 text-smoke-500 hover:bg-flash-50 hover:text-flash-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </Field>

        <Field label="Шаги приготовления" required>
          <div className="flex flex-col gap-1.5">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-100 text-[10px] font-bold text-lime-700">
                  {i + 1}
                </span>
                <textarea
                  value={step}
                  onChange={(e) => updateStep(i, e.target.value)}
                  rows={1}
                  placeholder="Опишите шаг..."
                  className="admin-input resize-none"
                />
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-smoke-100 text-smoke-500 hover:bg-flash-50 hover:text-flash-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addStep}
            className="mt-2 flex items-center gap-1.5 self-start rounded-full border border-smoke-200 px-3 py-1.5 text-xs font-semibold text-smoke-600"
          >
            <Plus size={13} />
            Добавить шаг
          </button>
        </Field>

        {error && <p className="text-sm text-flash-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button type="submit" className="rounded-full bg-lime-500 px-6 py-3 text-sm font-bold text-ink shadow-glowLime">
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/recipes")}
            className="rounded-full border border-smoke-200 px-6 py-3 text-sm font-semibold text-smoke-600"
          >
            Отмена
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Field label="Фото рецепта" required>
          {image ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl2">
              <Image src={image} alt="Рецепт" fill sizes="320px" className="object-cover" />
              <button
                type="button"
                onClick={() => setImage("")}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl2 border-2 border-dashed border-smoke-200 bg-smoke-50 text-center hover:border-lime-500">
              <UploadCloud className="h-6 w-6 text-smoke-400" />
              <span className="text-[11px] text-smoke-500">Загрузить фото</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
            </label>
          )}
        </Field>

        <div className="rounded-xl2 border border-smoke-100 bg-white p-4">
          <p className="mb-2 text-xs font-semibold text-smoke-400">Предпросмотр</p>
          <p className="text-sm font-medium text-ink">{title || "Название рецепта"}</p>
          <p className="text-xs text-smoke-400">
            {cookTimeMinutes} мин · {difficulty} · {ingredients.length} ингредиентов
          </p>
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

/** Поиск товаров каталога для привязки в качестве ингредиента рецепта. */
function IngredientPicker({ onSelect }: { onSelect: (product: Product) => void }) {
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
        .then((data) => setResults(data.products ?? []));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

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
          placeholder="Найти товар и добавить как ингредиент..."
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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
