import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/catalog";
import ProductGrid from "@/components/product-grid";
import BackButton from "@/components/back-button";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const collection = await getCollectionBySlug(params.slug);
  return { title: collection ? collection.title : "Подборка" };
}

export const revalidate = 0;

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = await getCollectionBySlug(params.slug);
  if (!collection || collection.active === false) notFound();

  return (
    <>
      <BackButton fallbackHref="/" />
      <h1 className="title-lg">{collection.title}</h1>
      <p className="subtitle">{collection.products.length} товаров</p>

      <ProductGrid products={collection.products} />
    </>
  );
}
