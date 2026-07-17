export type Category = {
  slug: string;
  name: string; // Mongolian label
};

export type ProductFlavor = {
  id: string;
  productId: string;
  flavorName: string;
  stock: number;
};

export type ProductVariant = {
  sku: string;
  productId: string;
  name: string;
  description?: string;
  gtin?: string;
  flavour?: string;
  weight?: string;
  price: number; // in Tögrög (₮)
  currency: string;
  availability: string;
  url?: string;
  imageUrl?: string;
  localImagePath?: string;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  price: number; // in Tögrög (₮) — current price
  originalPrice?: number; // present when discounted / bundle savings
  image: string;
  categorySlug: string;
  rating: number;
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isBundle?: boolean;
  unit?: string; // e.g. "2 кг", "300г"
  flavors?: ProductFlavor[];

  // Rich scraped details
  brand?: string;
  url?: string;
  descriptionAccordions?: Record<string, string>;
  nutritionTable?: Array<{ parameter: string; per_100g?: string; per_serving?: string }>;
  nutritionNotice?: string;
  variants?: ProductVariant[];
};
