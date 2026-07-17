-- DropForeignKey
ALTER TABLE "BundleItem" DROP CONSTRAINT "BundleItem_childProductId_fkey";

-- CreateTable
CREATE TABLE "PromotionSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "productId" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Урамшуулал!',
    "description" TEXT NOT NULL DEFAULT 'Хямдралтай бүтээгдэхүүнийг амжиж аваарай!',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discountCode" TEXT DEFAULT '',
    "discountValue" TEXT DEFAULT '',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PromotionSetting" ADD CONSTRAINT "PromotionSetting_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_childProductId_fkey" FOREIGN KEY ("childProductId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
