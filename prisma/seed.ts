import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { categories, products } from "../src/lib/data";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const db = new PrismaClient({ adapter });

async function main() {
  for (const cat of categories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { slug: cat.slug, name: cat.name },
    });
  }

  for (const p of products) {
    const data = {
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice ?? null,
      image: p.image,
      categorySlug: p.categorySlug,
      rating: p.rating,
      stock: p.stock,
      isNew: p.isNew ?? false,
      isFeatured: p.isFeatured ?? false,
      isBundle: p.isBundle ?? false,
      unit: p.unit ?? null,
    };
    await db.product.upsert({
      where: { id: p.id },
      update: data,
      create: { id: p.id, ...data },
    });

    // Replace flavor rows wholesale — simplest correct approach for a seed script.
    await db.productFlavor.deleteMany({ where: { productId: p.id } });
    if (p.flavorNames?.length) {
      await db.productFlavor.createMany({
        data: p.flavorNames.map((flavorName) => ({ productId: p.id, flavorName, stock: Math.floor(p.stock / p.flavorNames!.length) })),
      });
    }
  }

  const hash = await bcrypt.hash("demo1234", 10);
  await db.user.upsert({
    where: { email: "tuvshin674@gmail.com" },
    update: { isAdmin: true },
    create: {
      email: "tuvshin674@gmail.com",
      password: hash,
      firstName: "Энхтүвшин",
      lastName: "Энхтайван",
      phone: "86155401",
      isAdmin: true,
    },
  });
  
  await db.promotionSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      isActive: false,
      title: "Хүслээ цэнэглэ",
      description: "Эхний захиалгадаа 15% хямдрал аваарай! Шинэ хэрэглэгчдэд зориулсан онцгой урамшуулал.",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      discountCode: "WELCOME15",
      discountValue: "15%",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
