ALTER TABLE "OrderItem"
ADD COLUMN "saleType" "SaleType" NOT NULL DEFAULT 'PIECE',
ADD COLUMN "unit" TEXT NOT NULL DEFAULT 'шт';

-- Existing kilogram products were stored as pieces. Convert historical line
-- quantities to grams while preserving each order's original line total.
UPDATE "OrderItem" AS item
SET "saleType" = 'WEIGHT',
    "unit" = product."unit",
    "quantity" = item."quantity" * 1000
FROM "Product" AS product
WHERE item."productId" = product."id"
  AND product."unit" = 'кг'
  AND product."saleType" = 'PIECE';
