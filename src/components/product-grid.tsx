import { Fragment } from "react";
import type { Product } from "@/data/products";
import ProductCard from "@/components/product-card";
import Link from "next/link";

export default function ProductGrid({ products, insertAd = false }: { products: Product[]; insertAd?: boolean }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <span className="text-3xl">🔍</span>
        <p className="text-sm font-medium text-smoke-500">Ничего не нашлось</p>
        <p className="text-xs text-smoke-400">Попробуйте изменить запрос или фильтры</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <Fragment key={product.id}>
          <ProductCard product={product} />
          {insertAd && index === 4 && (
            <Link href="/catalog" className="inline-ad inline-ad-tile">
              <small>РЕКЛАМА</small>
              <b>Добавьте яркости в каждый день</b>
              <span>Откройте подборки StarFood</span>
              <strong aria-hidden="true">🍊</strong>
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  );
}
