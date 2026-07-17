import type { Category, Product } from "./types";

// MyProtein Mongolia — protein & fitness supplement categories (Mongolian).
export const categories: Category[] = [
  { slug: "whey", name: "Уураг (Whey)" },
  { slug: "creatine", name: "Креатин" },
  { slug: "preworkout", name: "Дасгалын өмнөх" },
  { slug: "bcaa", name: "Амин хүчил, Витамин" },
  { slug: "bundle", name: "Иж бүрдэл" },
  { slug: "snacks", name: "Эрүүл зууш (Snacks)" },
  { slug: "vitamins", name: "Витамин, Эрдэс бодис" },
];

const img = (name: string) => `/products/${name}`;

// Seed-only shape: flavor names expand into ProductFlavor rows at seed time.
export type SeedProduct = Omit<Product, "flavors"> & { flavorNames?: string[] };

export const products: SeedProduct[] = [];

export function getProduct(id: string): SeedProduct | undefined {
  return products.find((p) => p.id === id);
}

export function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export const formatPrice = (n: number) => `${n.toLocaleString("en-US")}₮`;
