/**
 * Раньше этот файл читал src/data/products.ts и src/data/categories.ts напрямую.
 * Теперь это тонкая обёртка над src/lib/data-service.ts (Prisma/PostgreSQL) —
 * имена и сигнатуры функций сохранены (кроме getCategoryBySlug, который стал
 * асинхронным, т.к. категории теперь загружаются из БД, а не статики), только
 * добавлено await в местах вызова.
 */
export {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getPopularProducts,
  getNewProducts,
  getDiscountedProducts,
  getRecommendedProducts,
  getRelatedProducts,
  getFeaturedProducts,
  getBrandsForCategory,
  filterProducts,
  getCategories,
  getCategoryBySlug,
  getRecipes,
  getRecipeBySlug,
  getCollections,
  getCollectionBySlug,
  type SortOption,
  type CatalogFilters
} from "@/lib/data-service";
