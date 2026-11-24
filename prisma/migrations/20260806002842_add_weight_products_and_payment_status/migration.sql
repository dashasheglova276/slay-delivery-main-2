-- Add payment status used by Order.paymentStatus.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
  END IF;
END $$;

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "paymentId" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

CREATE UNIQUE INDEX IF NOT EXISTS "Order_paymentId_key" ON "Order"("paymentId");

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "saleType" "SaleType" NOT NULL DEFAULT 'PIECE',
  ADD COLUMN IF NOT EXISTS "step" DOUBLE PRECISION NOT NULL DEFAULT 1;
