-- Возможность скрыть категорию/товар с витрины, не удаляя данные.
ALTER TABLE "Category"
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;

-- Подборки товаров (аналог по структуре модели Recipe/RecipeIngredient),
-- ссылаются на существующие Product по id — без дублирования каталога.
CREATE TABLE IF NOT EXISTS "Collection" (
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "image" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Collection_pkey" PRIMARY KEY ("slug")
);

CREATE TABLE IF NOT EXISTS "CollectionItem" (
  "id" TEXT NOT NULL,
  "collectionSlug" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Collection_order_idx" ON "Collection"("order");
CREATE INDEX IF NOT EXISTS "CollectionItem_collectionSlug_idx" ON "CollectionItem"("collectionSlug");
CREATE INDEX IF NOT EXISTS "CollectionItem_productId_idx" ON "CollectionItem"("productId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'CollectionItem_productId_fkey'
  ) THEN
    ALTER TABLE "CollectionItem"
      ADD CONSTRAINT "CollectionItem_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'CollectionItem_collectionSlug_fkey'
  ) THEN
    ALTER TABLE "CollectionItem"
      ADD CONSTRAINT "CollectionItem_collectionSlug_fkey"
      FOREIGN KEY ("collectionSlug") REFERENCES "Collection"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
