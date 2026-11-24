import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/data/categories";

export default function CategoryCard({ category }: { category: Category }) {
  const hasImage = Boolean(category.image);

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col items-center gap-1.5 text-center transition-transform duration-200 active:scale-95"
    >
      {hasImage ? (
        // Реальное фото категории из админки (Category.image в БД). Фото
        // заполняет всю ширину колонки сетки — так оно остаётся главным
        // визуальным акцентом, а не маленькой иконкой в пустой рамке.
        <span className="relative aspect-square w-full overflow-hidden rounded-2xl bg-smoke-50 transition-transform duration-300 group-hover:scale-105">
          <Image src={category.image!} alt="" fill sizes="120px" className="object-cover" />
        </span>
      ) : (
        <span className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br from-lime-100 to-lime-50 text-3xl transition-transform duration-300 group-hover:scale-105">
          {category.emoji}
        </span>
      )}
      <span className="line-clamp-1 w-full text-[11px] font-medium leading-tight text-ink">{category.name}</span>
    </Link>
  );
}
