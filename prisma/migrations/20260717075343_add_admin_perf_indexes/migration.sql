-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "BundleItem_parentBundleId_idx" ON "BundleItem"("parentBundleId");

-- CreateIndex
CREATE INDEX "BundleItem_childProductId_idx" ON "BundleItem"("childProductId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Product_categorySlug_idx" ON "Product"("categorySlug");

-- CreateIndex
CREATE INDEX "ProductFlavor_productId_idx" ON "ProductFlavor"("productId");

-- CreateIndex
CREATE INDEX "PromotionSetting_productId_idx" ON "PromotionSetting"("productId");
