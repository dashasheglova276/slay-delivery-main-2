import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, filterProducts, getBrandsForCategory, type SortOption } from "@/lib/catalog";
import ProductGrid from "@/components/product-grid";
import FilterBar from "@/components/filter-bar";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Каталог" };
export const revalidate = 0;

const groups = [
  { title: "Овощи и фрукты", slugs: ["vegetables", "fruits", "vegan"] },
  { title: "Молочный отдел", slugs: ["dairy", "cheese", "eggs", "lactose-free", "baby"] },
  { title: "Булочная и кондитерская", slugs: ["bakery", "sweets"] },
  { title: "Готовая еда и напитки", slugs: ["frozen", "grocery", "drinks", "sauces", "pets", "household-chem", "home", "pharmacy", "beauty", "diapers"] }
];
const art: Record<string, string> = {
  vegetables: "🥬🍅", fruits: "🍓🍎", vegan: "🥑🥬", dairy: "🥛🧈", cheese: "🧀", eggs: "🥚",
  "lactose-free": "🥛", baby: "🍼", bakery: "🥖🥐", sweets: "🍩🍫", frozen: "🍕🍟",
  grocery: "🍝", drinks: "🧃🥤", sauces: "🧂", pets: "🐶🐾", "household-chem": "🧴",
  home: "🧻", pharmacy: "💊", beauty: "💄", diapers: "👶"
};

export default async function CatalogPage({ searchParams }: { searchParams: { sort?: string; filter?: string; brand?: string; minPrice?: string; maxPrice?: string } }) {
  const hasFilters = Boolean(searchParams.sort || searchParams.filter || searchParams.brand || searchParams.minPrice || searchParams.maxPrice);
  const categories = await getCategories({ onlyActive: true });

  if (!hasFilters) {
    const bySlug = new Map(categories.map((category) => [category.slug, category]));
    const placed = new Set<string>();
    return (
      <>
        <h1 className="title-lg">Каталог</h1>
        {groups.map((group) => {
          const items = group.slugs.flatMap((slug) => {
            const category = bySlug.get(slug);
            if (!category) return [];
            placed.add(category.slug);
            return [category];
          });
          if (!items.length) return null;
          return (
            <section className="category-group" key={group.title}>
              <h2>{group.title}</h2>
              <div className="category-mosaic">
                {items.map((category, index) => (
                  <Link key={category.slug} href={`/category/${category.slug}`} className={`subcategory-tile color-${index % 5}${index === 0 || (group.title === "Булочная и кондитерская" && index === items.length - 1) ? " wide" : ""}`}>
                    <b>{category.name}</b><span aria-hidden="true">{art[category.slug] ?? category.emoji}</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
        {categories.some((category) => !placed.has(category.slug)) && (
          <section className="category-group">
            <h2>Другие товары</h2>
            <div className="category-mosaic">
              {categories.filter((category) => !placed.has(category.slug)).map((category, index) => (
                <Link key={category.slug} href={`/category/${category.slug}`} className={`subcategory-tile color-${index % 5}`}>
                  <b>{category.name}</b><span aria-hidden="true">{category.emoji}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        <Link href="/catalog?sort=relevance" className="catalog-back">Смотреть все товары →</Link>
      </>
    );
  }

  const [products, brands] = await Promise.all([
    filterProducts({ sort: (searchParams.sort as SortOption) || "relevance", onlyDiscount: searchParams.filter === "discount", onlyNew: searchParams.filter === "new", brand: searchParams.brand, minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined, maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined }),
    getBrandsForCategory()
  ]);
  return <><h1 className="title-lg">Каталог</h1><Suspense fallback={null}><FilterBar brands={brands} /></Suspense><ProductGrid products={products} /></>;
}
