-- Domain pivot: bathroom/sanitaryware -> protein & fitness supplements.
-- Old catalog/order rows are incompatible with the new address/customer shape,
-- so this dev migration clears them before restructuring (reseeded separately).
DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "Product";
DELETE FROM "Category";

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'PAID', 'ON_THE_WAY', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "UlaanbaatarDistrict" AS ENUM ('BAYANZURKH', 'KHAN_UUL', 'SONGINOKHAIRKHAN', 'BAYANGOL', 'SUKHMBAATAR', 'CHINGELTEI', 'NALAIKH', 'BAGANUUR');

-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN "originalPrice" DOUBLE PRECISION;
ALTER TABLE "Product" DROP COLUMN "oldPrice";
ALTER TABLE "Product" ADD COLUMN "isBundle" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable ProductFlavor
CREATE TABLE "ProductFlavor" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "flavorName" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductFlavor_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ProductFlavor" ADD CONSTRAINT "ProductFlavor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable BundleItem
CREATE TABLE "BundleItem" (
    "id" TEXT NOT NULL,
    "parentBundleId" TEXT NOT NULL,
    "childProductId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "BundleItem_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_parentBundleId_fkey" FOREIGN KEY ("parentBundleId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_childProductId_fkey" FOREIGN KEY ("childProductId") REFERENCES "Product"("id") ON UPDATE CASCADE;

-- AlterTable Order: drop old address/customer/status columns, add MN delivery fields
ALTER TABLE "Order"
  DROP COLUMN "addrLabel",
  DROP COLUMN "addrCity",
  DROP COLUMN "addrDistrict",
  DROP COLUMN "addrKhoroo",
  DROP COLUMN "addrDetail",
  DROP COLUMN "custEmail",
  DROP COLUMN "custPhone",
  DROP COLUMN "receiptType",
  ADD COLUMN "phonePrimary" TEXT NOT NULL,
  ADD COLUMN "phoneSecondary" TEXT NOT NULL,
  ADD COLUMN "district" "UlaanbaatarDistrict" NOT NULL,
  ADD COLUMN "khoroo" TEXT NOT NULL,
  ADD COLUMN "detailedAddress" TEXT NOT NULL,
  ADD COLUMN "receiptImageUrl" TEXT;

ALTER TABLE "Order" ALTER COLUMN "paymentMethod" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" SET DEFAULT 'BANK_TRANSFER';

ALTER TABLE "Order" DROP COLUMN "status";
ALTER TABLE "Order" ADD COLUMN "status" "OrderStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable OrderItem: track chosen flavor at time of purchase
ALTER TABLE "OrderItem" ADD COLUMN "flavor" TEXT;
