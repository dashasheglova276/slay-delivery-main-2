-- Canonical sale type used by Product.saleType in the final Prisma schema.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SaleType') THEN
    CREATE TYPE "SaleType" AS ENUM ('PIECE', 'WEIGHT');
  END IF;
END $$;
