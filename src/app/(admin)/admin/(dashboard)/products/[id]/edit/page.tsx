"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "../../ProductForm";
import { Spinner } from "@/components/ui/spinner";

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  categorySlug: string;
  stock: number;
  unit: string | null;
  brand: string | null;
  isNew: boolean;
  isFeatured: boolean;
  isBundle: boolean;
  flavors: { flavorName: string; stock: number }[];
  descriptionAccordions: Record<string, string> | null;
  nutritionTable: { parameter: string; per_100g?: string; per_serving?: string }[] | null;
  nutritionNotice: string | null;
};

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then(setProduct);
  }, [id]);

  if (!product) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Бүтээгдэхүүн засах</h1>
      <ProductForm
        productId={product.id}
        initial={{
          name: product.name,
          price: String(product.price),
          originalPrice: product.originalPrice ? String(product.originalPrice) : "",
          image: product.image,
          categorySlug: product.categorySlug,
          stock: String(product.stock),
          unit: product.unit ?? "",
          brand: product.brand ?? "",
          isNew: product.isNew,
          isFeatured: product.isFeatured,
          isBundle: product.isBundle,
          flavors: product.flavors.map((f) => ({ flavorName: f.flavorName, stock: String(f.stock) })),
          descriptionAccordions: Object.entries(product.descriptionAccordions ?? {}).map(([key, value]) => ({ key, value })),
          nutritionTable: (product.nutritionTable ?? []).map((n) => ({ parameter: n.parameter, per_100g: n.per_100g ?? "", per_serving: n.per_serving ?? "" })),
          nutritionNotice: product.nutritionNotice ?? "",
        }}
      />
    </div>
  );
}
