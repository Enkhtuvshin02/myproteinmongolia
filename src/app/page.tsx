import { ProductSection } from "@/components/product-section";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const toProduct = (p: {
    id: string; name: string; price: number; originalPrice: number | null; image: string;
    categorySlug: string; rating: number; stock: number; isNew: boolean; isFeatured: boolean;
    isBundle: boolean; unit: string | null; flavors: { id: string; flavorName: string; stock: number }[];
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
      <ProductSection
        title="Шинэ бүтээгдэхүүн"
        subtitle="Шинээр нэмэгдсэн уураг, спорт нэмэлт тэжээл"
        products={newest}
        href="/product?filter=new"
      />
      <ProductSection
        title="Онцлох бүтээгдэхүүн"
        subtitle="Хамгийн их эрэлттэй уураг, амин хүчил, иж бүрдэлүүд"
        products={featured}
        href="/product?filter=featured"
      />
    </>
  );
}
