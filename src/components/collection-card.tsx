import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/data/collections";

/**
 * Карточка подборки — обложка (если задана админом) с фолбэком на фото
 * первого товара, если своей обложки нет. Ведёт на страницу подборки
 * с её собственным набором товаров (не категория целиком).
 */
export default function CollectionCard({ collection }: { collection: Collection }) {
  const cover = collection.image ?? collection.products[0]?.image;

  return (
    <Link
      href={`/collection/${collection.slug}`}
      className="group flex w-28 shrink-0 snap-start flex-col gap-1.5 transition-transform duration-200 active:scale-95 sm:w-32"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-smoke-50 shadow-subtle">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="130px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl">🛒</span>
        )}
      </div>
      <span className="truncate px-0.5 text-[12px] font-semibold leading-tight text-ink">
        {collection.title}
      </span>
    </Link>
  );
}
