export type Category = {
  slug: string;
  name: string; // Mongolian label
};

export type ProductFlavor = {
  id: string;
  flavorName: string;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  price: number; // in tögrög (₮) — current price
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
};
