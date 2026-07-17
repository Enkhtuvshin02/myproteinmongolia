import { ProductSection } from "@/components/product-section";
import { Hero } from "@/components/hero";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const toProduct = (p: {
    id: string; name: string; price: number; originalPrice: number | null; image: string;
    categorySlug: string; rating: number; stock: number; isNew: boolean; isFeatured: boolean;
    isBundle: boolean; unit: string | null; flavors: { id: string; productId: string; flavorName: string; stock: number }[];
  }) => ({
    ...p,
    originalPrice: p.originalPrice ?? undefined,
    unit: p.unit ?? undefined,
  });

  const [newestRaw, featuredRaw] = await Promise.all([
    db.product.findMany({ where: { isNew: true }, take: 8, include: { flavors: true } }),
    db.product.findMany({ where: { isFeatured: true }, take: 8, include: { flavors: true } }),
  ]);
  const newest = newestRaw.map(toProduct);
  const featured = featuredRaw.map(toProduct);

  return (
    <>
      <Hero />

      <ProductSection
        eyebrow="02 — Онцлох"
        title="Хамгийн эрэлттэй"
        subtitle="Хамгийн их эрэлттэй уураг, амин хүчил, иж бүрдэлүүд"
        products={featured}
        href="/product?filter=featured"
      />

      <ProductSection
        eyebrow="03 — Шинэ ирэлт"
        title="Шинэ бүтээгдэхүүн"
        subtitle="Шинээр нэмэгдсэн уураг, спорт нэмэлт тэжээл"
        products={newest}
        href="/product?filter=new"
      />
    </>
  );
}
