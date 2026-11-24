import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { filterProducts, getCategoryBySlug, getBrandsForCategory, type SortOption } from "@/lib/catalog";
import ProductGrid from "@/components/product-grid";
import FilterBar from "@/components/filter-bar";
import BackButton from "@/components/back-button";

// Категории теперь загружаются из БД и управляются в админке, поэтому список
// slug'ов не известен на этапе сборки — страница рендерится динамически
// (см. revalidate = 0 ниже), generateStaticParams больше не нужен.

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  return { title: category ? category.name : "Категория" };
}

export const revalidate = 0;

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: { sort?: string; filter?: string; brand?: string; minPrice?: string; maxPrice?: string };
}) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const [products, brands] = await Promise.all([
    filterProducts({
      categorySlug: category.slug,
      sort: (searchParams.sort as SortOption) || "relevance",
      onlyDiscount: searchParams.filter === "discount",
      onlyNew: searchParams.filter === "new",
      brand: searchParams.brand,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined
    }),
    getBrandsForCategory(category.slug)
  ]);

  return (
    <>
      <BackButton fallbackHref="/catalog" />
      <h1 className="title-lg">
        {category.emoji} {category.name}
      </h1>
      <p className="subtitle">{products.length} товаров</p>

      <Suspense fallback={null}>
        <FilterBar categorySlug={category.slug} brands={brands} />
      </Suspense>

      <ProductGrid products={products} />
    </>
  );
}
