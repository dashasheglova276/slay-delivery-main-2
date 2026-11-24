export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import { getAllProducts, getCategories, getRecipes } from "@/lib/data-service";

const BASE_URL = "https://slay-delivery.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/catalog", "/favorites", "/cart", "/profile", "/recipes"].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.6
  }));

  const [categories, products, recipes] = await Promise.all([getCategories(), getAllProducts(), getRecipes()]);

  const categoryRoutes = categories.map((c) => ({
    url: `${BASE_URL}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7
  }));

  const productRoutes = products.map((p) => ({
    url: `${BASE_URL}/product/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5
  }));

  const recipeRoutes = recipes.map((r) => ({
    url: `${BASE_URL}/recipes/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...recipeRoutes];
}

