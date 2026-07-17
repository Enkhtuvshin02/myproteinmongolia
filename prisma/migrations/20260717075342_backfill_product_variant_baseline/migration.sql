-- Baseline migration: captures schema objects that already exist on the
-- Neon production database (added out-of-band at some point, never
-- previously captured in a committed migration). This migration is marked
-- as already-applied on production via `prisma migrate resolve --applied`,
-- so its SQL only actually runs on fresh/local databases that don't have
-- these objects yet.

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "descriptionAccordions" JSONB,
ADD COLUMN     "nutritionNotice" TEXT,
ADD COLUMN     "nutritionTable" JSONB,
ADD COLUMN     "url" TEXT;

-- CreateTable
CREATE TABLE "ProductVariant" (
    "sku" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gtin" TEXT,
    "flavour" TEXT,
    "weight" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "availability" TEXT NOT NULL DEFAULT 'InStock',
    "url" TEXT,
    "imageUrl" TEXT,
    "localImagePath" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("sku")
);

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
