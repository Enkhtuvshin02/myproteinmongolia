"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "../../ProductForm";

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  categorySlug: string;
  stock: number;
  unit: string | null;
  isNew: boolean;
  isFeatured: boolean;
  isBundle: boolean;
  flavors: { flavorName: string; stock: number }[];
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
    return <p className="text-sm text-muted-foreground">Уншиж байна...</p>;
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
          isNew: product.isNew,
          isFeatured: product.isFeatured,
          isBundle: product.isBundle,
          flavors: product.flavors.map((f) => ({ flavorName: f.flavorName, stock: String(f.stock) })),
        }}
      />
    </div>
  );
}
