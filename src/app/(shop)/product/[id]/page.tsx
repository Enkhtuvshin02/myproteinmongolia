import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductDetail } from "@/components/product-detail";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: PageProps<"/product/[id]">) {
  const { id } = await params;
  const raw = await db.product.findUnique({
    where: { id },
    include: { flavors: true, variants: true },
  });
  if (!raw) notFound();

  const product: Product = {
    id: raw.id,
    name: raw.name,
    price: raw.price,
    originalPrice: raw.originalPrice ?? undefined,
    image: raw.image,
    categorySlug: raw.categorySlug,
    rating: raw.rating,
    stock: raw.stock,
    isNew: raw.isNew,
    isFeatured: raw.isFeatured,
    isBundle: raw.isBundle,
    unit: raw.unit ?? undefined,
    flavors: raw.flavors,

    brand: raw.brand ?? undefined,
    url: raw.url ?? undefined,
    descriptionAccordions: (raw.descriptionAccordions as Record<string, string>) ?? undefined,
    nutritionTable: (raw.nutritionTable as any) ?? undefined,
    nutritionNotice: raw.nutritionNotice ?? undefined,
    variants: (raw.variants as any) ?? undefined,
  };

  return <ProductDetail product={product} />;
}
