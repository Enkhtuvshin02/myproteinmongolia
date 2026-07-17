import type { Category, Product } from "./types";

// GainHub — protein & fitness supplement categories (Mongolian).
export const categories: Category[] = [
  { slug: "whey", name: "Уураг (Whey)" },
  { slug: "creatine", name: "Креатин" },
  { slug: "preworkout", name: "Дасгалын өмнөх" },
  { slug: "bcaa", name: "Амин хүчил, Витамин" },
  { slug: "bundle", name: "Иж бүрдэл" },
];

const img = (name: string) => `/products/${name}`;

// Seed-only shape: flavor names expand into ProductFlavor rows at seed time.
export type SeedProduct = Omit<Product, "flavors"> & { flavorNames?: string[] };

export const products: SeedProduct[] = [
  // Уураг (Whey)
  { id: "gh-1001", name: "Whey Protein Isolate", price: 185000, originalPrice: 210000, image: img("whey.svg"), categorySlug: "whey", rating: 0, stock: 60, unit: "2кг", isFeatured: true, flavorNames: ["Шоколад", "Ваниль", "Цөцгийн тос", "Амтгүй"] },
  { id: "gh-1002", name: "Whey Protein Concentrate", price: 95000, image: img("whey.svg"), categorySlug: "whey", rating: 0, stock: 80, unit: "1кг", flavorNames: ["Шоколад", "Ваниль"] },
  { id: "gh-1003", name: "Whey Gold Standard", price: 145000, image: img("whey.svg"), categorySlug: "whey", rating: 0, stock: 45, unit: "908г", isNew: true, flavorNames: ["Шоколад", "Ваниль", "Кофе"] },
  { id: "gh-1004", name: "Casein Protein (удаан шимэгддэг)", price: 120000, image: img("whey.svg"), categorySlug: "whey", rating: 0, stock: 30, unit: "900г", flavorNames: ["Шоколад", "Ваниль"] },
  { id: "gh-1005", name: "Rice & Pea Protein (Vegan)", price: 98000, image: img("whey.svg"), categorySlug: "whey", rating: 0, stock: 25, unit: "900г", flavorNames: ["Ваниль", "Шоколад"] },

  // Креатин
  { id: "gh-2001", name: "Creatine Monohydrate", price: 45000, image: img("creatine.svg"), categorySlug: "creatine", rating: 0, stock: 100, unit: "500г", isFeatured: true },
  { id: "gh-2002", name: "Micronized Creatine", price: 52000, image: img("creatine.svg"), categorySlug: "creatine", rating: 0, stock: 70, unit: "300г", isNew: true },
  { id: "gh-2003", name: "Creatine HCL", price: 68000, image: img("creatine.svg"), categorySlug: "creatine", rating: 0, stock: 40, unit: "250г" },

  // Дасгалын өмнөх
  { id: "gh-3001", name: "C4 Original Pre-Workout", price: 78000, originalPrice: 89000, image: img("preworkout.svg"), categorySlug: "preworkout", rating: 0, stock: 55, unit: "30 порц", isFeatured: true, flavorNames: ["Fruit Punch", "Blue Raz", "Watermelon"] },
  { id: "gh-3002", name: "Pre-Workout Extreme", price: 82000, image: img("preworkout.svg"), categorySlug: "preworkout", rating: 0, stock: 35, unit: "300г", isNew: true, flavorNames: ["Green Apple", "Orange"] },
  { id: "gh-3003", name: "Pump Booster (Стимуляторгүй)", price: 65000, image: img("preworkout.svg"), categorySlug: "preworkout", rating: 0, stock: 28, unit: "20 порц" },
  { id: "gh-3004", name: "Nitric Oxide Booster", price: 55000, image: img("preworkout.svg"), categorySlug: "preworkout", rating: 0, stock: 32, unit: "120 капс" },

  // Амин хүчил, Витамин
  { id: "gh-4001", name: "BCAA 2:1:1", price: 58000, image: img("bcaa.svg"), categorySlug: "bcaa", rating: 0, stock: 65, unit: "400г", isFeatured: true, flavorNames: ["Лимон", "Усэн үзэм", "Тарвас"] },
  { id: "gh-4002", name: "EAA Complex", price: 72000, image: img("bcaa.svg"), categorySlug: "bcaa", rating: 0, stock: 40, unit: "500г", flavorNames: ["Blue Raz", "Персик"] },
  { id: "gh-4003", name: "Glutamine", price: 48000, image: img("bcaa.svg"), categorySlug: "bcaa", rating: 0, stock: 50, unit: "300г" },
  { id: "gh-4004", name: "Multivitamin Men's", price: 38000, image: img("bcaa.svg"), categorySlug: "bcaa", rating: 0, stock: 60, unit: "60 капс", isNew: true },

  // Иж бүрдэл
  { id: "gh-5001", name: "Bulking Stack — Whey + Creatine", price: 220000, originalPrice: 260000, image: img("bundle.svg"), categorySlug: "bundle", rating: 0, stock: 20, unit: "1 иж", isBundle: true, isFeatured: true },
  { id: "gh-5002", name: "Shred Stack — Isolate + Pre-Workout + BCAA", price: 310000, originalPrice: 391000, image: img("bundle.svg"), categorySlug: "bundle", rating: 0, stock: 12, unit: "1 иж", isBundle: true, isNew: true },
  { id: "gh-5003", name: "Starter Stack — Whey + Shaker", price: 175000, originalPrice: 195000, image: img("bundle.svg"), categorySlug: "bundle", rating: 0, stock: 18, unit: "1 иж", isBundle: true },
];

export function getProduct(id: string): SeedProduct | undefined {
  return products.find((p) => p.id === id);
}

export function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export const formatPrice = (n: number) => `${n.toLocaleString("en-US")}₮`;
