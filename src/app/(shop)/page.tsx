import Link from "next/link";
import { CreditCard, Phone, ShieldCheck, Truck } from "lucide-react";
import { ProductSection } from "@/components/product-section";
import { Hero } from "@/components/hero";
import { MarqueeStrip } from "@/components/marquee-strip";
import { CategoryShowcase } from "@/components/category-showcase";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const SPECS = [
  { icon: Truck, label: "Хүргэлт Улаанбаатарт", value: "24–48 цаг" },
  { icon: ShieldCheck, label: "Original баталгаа", value: "Лабораторийн шалгалттай" },
  { icon: CreditCard, label: "Төлбөрийн арга", value: "Банкны шилжүүлэг" },
  { icon: Phone, label: "Лавлах утас", value: "77100100 — өдөр бүр" },
];

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
      <MarqueeStrip />

      <CategoryShowcase />

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

      {/* dark spec / guarantee band */}
      <section className="bg-shop-black py-16 text-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">04 — Баталгаа</span>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase leading-[0.95] tracking-normal">
              Хүргэлт. Баталгаа.
              <br />
              Хялбар төлбөр.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              Бид зөвхөн 100% гарал үүсэлтэй, лабораторийн шалгалттай бүтээгдэхүүн зарна.
              Захиалга бүрийг банкны шилжүүлгээр баталгаажуулж, Улаанбаатар даяар шуурхай хүргэдэг.
            </p>
            <Link
              href="/product"
              className="mt-8 inline-flex items-center gap-2 bg-brand px-7 py-3.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-hover"
            >
              Бараа үзэх →
            </Link>
          </div>

          <dl className="divide-y divide-white/10 border-t border-white/10 lg:self-center">
            {SPECS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4 py-4">
                <dt className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-white/60">
                  <Icon className="size-4 text-brand" />
                  {label}
                </dt>
                <dd className="text-sm font-semibold text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* brand statement */}
      <section className="bg-shop-paper py-20">
        <div className="mx-auto max-w-[860px] px-4 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">05 — Амлалт</span>
          <p className="mt-4 font-display text-2xl font-bold uppercase leading-tight tracking-normal sm:text-4xl">
            Цэвэр формул. Лабораторийн баталгаа. Хуурамчгүй.
          </p>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            — MyProtein Mongolia Original баталгаа
          </p>
        </div>
      </section>
    </>
  );
}
