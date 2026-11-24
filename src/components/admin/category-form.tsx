"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import type { Category } from "@/data/categories";

export interface CategoryFormValues {
  slug: string;
  name: string;
  emoji: string;
  image: string | null;
  active: boolean;
}

const EMOJI_SUGGESTIONS = ["🥬", "🍎", "🥩", "🐟", "🥛", "🍞", "🧀", "🥚", "🍝", "🥤", "🍬", "🍕", "🧂", "🍼", "🧴", "🧻", "💊", "💄", "🐶"];

export default function CategoryForm({
  initial,
  onSubmit,
  submitLabel = "Сохранить категорию",
  lockSlug
}: {
  initial?: Category;
  onSubmit: (values: CategoryFormValues) => void;
  submitLabel?: string;
  /** При редактировании slug менять нельзя — это первичный ключ. */
  lockSlug?: boolean;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "🛒");
  const [image, setImage] = useState<string | null>(initial?.image ?? null);
  const [active, setActive] = useState(initial?.active !== false);
  const [error, setError] = useState("");

  function handleFile(files: FileList | null) {
    if (!files || !files[0]) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(files[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !emoji.trim() || (!lockSlug && !slug.trim())) {
      setError("Заполните название, эмодзи и slug");
      return;
    }
    onSubmit({
      slug: slug.trim().toLowerCase(),
      name: name.trim(),
      emoji: emoji.trim(),
      image,
      active
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-[1fr,280px]">
      <div className="flex flex-col gap-4">
        <Field label="Название категории" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Овощи"
            className="admin-input"
          />
        </Field>

        <Field label="Slug (латиница, для ссылок)" required>
          <input
            value={slug}
            disabled={lockSlug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="vegetables"
            className="admin-input disabled:bg-smoke-50 disabled:text-smoke-400"
          />
        </Field>

        <Field label="Эмодзи-иконка" required>
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="admin-input w-24" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EMOJI_SUGGESTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke-100 text-base hover:bg-smoke-200"
              >
                {e}
              </button>
            ))}
          </div>
        </Field>

        {error && <p className="text-sm text-flash-600">{error}</p>}

        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-lime-500"
          />
          Категория активна (видна на витрине)
        </label>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="rounded-full bg-lime-500 px-6 py-3 text-sm font-bold text-ink shadow-glowLime">
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className="rounded-full border border-smoke-200 px-6 py-3 text-sm font-semibold text-smoke-600"
          >
            Отмена
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Field label="Картинка категории (необязательно)">
          {image ? (
            <div className="relative aspect-square overflow-hidden rounded-xl2">
              <Image src={image} alt="Категория" fill sizes="240px" className="object-cover" />
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
        </Field>

        <div className="rounded-xl2 border border-smoke-100 bg-white p-4">
          <p className="mb-2 text-xs font-semibold text-smoke-400">Предпросмотр</p>
          <p className="text-sm font-medium text-ink">
            {emoji} {name || "Название категории"}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
              active ? "bg-lime-100 text-lime-700" : "bg-smoke-100 text-smoke-500"
            }`}
          >
            {active ? "Активна" : "Скрыта с витрины"}
          </span>
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
