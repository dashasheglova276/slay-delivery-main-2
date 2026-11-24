import Link from "next/link";
import SearchBar from "@/components/search-bar";
import StorefrontHero from "@/components/storefront-hero";
import ProductRail from "@/components/product-rail";
import ProductGrid from "@/components/product-grid";
import { getPopularProducts, getCollections } from "@/lib/catalog";

export const revalidate = 0;

export default async function HomePage() {
  const [popular, dbCollections] = await Promise.all([
    getPopularProducts(20),
    getCollections({ onlyActive: true })
  ]);
  const fallbackCollections = [
    { slug: "popular", title: "Популярное сегодня", order: 0, products: popular.slice(0, 8) },
    { slug: "to-breakfast", title: "Для завтрака", order: 1, products: popular.slice(3, 11) },
    { slug: "something-tasty", title: "Что-нибудь вкусное", order: 2, products: popular.slice(7, 15) },
    { slug: "stock-up", title: "Запасаемся на неделю", order: 3, products: popular.slice(12, 20) }
  ].filter((collection) => collection.products.length > 0);
  const visibleDbCollections = dbCollections.filter((collection) => collection.products.length > 0);
  const collections = visibleDbCollections.length ? visibleDbCollections : fallbackCollections;

  return (
    <div className="home-content">
      <SearchBar />
      <StorefrontHero />
      {collections.map((collection) => (
        <div key={collection.slug}>
          <section className="collection-section">
            <div className="section-head">
              <h2>{collection.title}</h2>
              {visibleDbCollections.length > 0 && <Link className="link" href={`/collection/${collection.slug}`}>Все <span aria-hidden="true">→</span></Link>}
            </div>
            <ProductRail products={collection.products} />
          </section>
        </div>
      ))}

      <RecommendationBanner />

      <div className="section-head">
        <h2>Популярное</h2>
        <span className="scroll-hint">{popular.length} товаров</span>
      </div>
      <ProductGrid products={popular} insertAd />
    </div>
  );
}

function RecommendationBanner() {
  return (
    <div className="ad-banner">
      <div>
        <small>STARFOOD РЕКОМЕНДУЕТ</small>
        <b>Соберите вечер по вкусу</b>
        <span>Всё для уютного вечера дома</span>
      </div>
      <strong aria-hidden="true">✨</strong>
    </div>
  );
}
