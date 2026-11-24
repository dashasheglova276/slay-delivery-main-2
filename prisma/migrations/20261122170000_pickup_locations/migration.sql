CREATE TYPE "FulfillmentType" AS ENUM ('DELIVERY', 'PICKUP');

CREATE TABLE "PickupLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "description" TEXT,
    "hours" TEXT NOT NULL,
    "contact" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PickupLocation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PickupLocation_active_idx" ON "PickupLocation"("active");

ALTER TABLE "Order" ADD COLUMN "fulfillmentType" "FulfillmentType" NOT NULL DEFAULT 'DELIVERY';
ALTER TABLE "Order" ADD COLUMN "pickupLocationId" TEXT;
CREATE INDEX "Order_pickupLocationId_idx" ON "Order"("pickupLocationId");
ALTER TABLE "Order" ADD CONSTRAINT "Order_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "PickupLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
