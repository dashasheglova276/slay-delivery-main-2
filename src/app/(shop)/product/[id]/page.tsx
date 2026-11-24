import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, Factory, CalendarClock, Warehouse } from "lucide-react";
import { getProductById, getRelatedProducts } from "@/lib/catalog";
import ProductGallery from "@/components/product-gallery";
import ProductBuyBox from "@/components/product-buy-box";
import ProductRail from "@/components/product-rail";
import RatingStars from "@/components/rating-stars";
import { formatWeight } from "@/lib/utils";

// Товары теперь живут в БД и меняются админкой в реальном времени,
// поэтому страница рендерится динамически, без generateStaticParams.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProductById(params.id);
  return {
    title: product ? product.name : "Товар",
    description: product?.description
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  const infoRows = [
    { icon: Package, label: "Состав", value: product.composition },
    { icon: Factory, label: "Производитель", value: product.manufacturer },
    { icon: CalendarClock, label: "Срок годности", value: product.shelfLife },
    { icon: Warehouse, label: "Условия хранения", value: product.storage }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 pb-28 md:px-6 md:pb-4">
      <Link href={`/category/${product.categorySlug}`} className="mb-4 flex items-center gap-1 text-sm text-smoke-500">
        <ChevronLeft size={16} />
        {product.categoryName}
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <RatingStars rating={product.rating} reviewsCount={product.reviewsCount} />
              <span className="text-xs text-smoke-400">{formatWeight(product.weight, product.unit)}</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-smoke-600">{product.description}</p>

          {/* На мобильном ProductBuyBox сам уезжает в fixed-панель снизу
              экрана (см. компонент) — оставлять здесь пустую рамку не нужно. */}
          <div className="hidden rounded-xl2 border border-smoke-100 p-4 md:block">
            <ProductBuyBox product={product} />
          </div>
          <div className="md:hidden">
            <ProductBuyBox product={product} />
          </div>

          <div className="flex flex-col divide-y divide-smoke-100 rounded-xl2 border border-smoke-100">
            {infoRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-3 p-4">
                <Icon size={18} className="mt-0.5 shrink-0 text-smoke-400" />
                <div>
                  <p className="text-xs font-semibold text-smoke-400">{label}</p>
                  <p className="mt-0.5 text-sm text-ink">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 font-display text-lg font-bold">Похожие товары</h2>
          <ProductRail products={related} />
        </div>
      )}
    </div>
  );
}
