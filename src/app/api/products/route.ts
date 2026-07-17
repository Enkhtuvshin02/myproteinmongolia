import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") ?? "";
  const filter = searchParams.get("filter") ?? "";
  const q = searchParams.get("q")?.trim() ?? "";

  const products = await db.product.findMany({
    where: {
      ...(category ? { categorySlug: category } : {}),
      ...(filter === "featured" ? { isFeatured: true } : {}),
      ...(filter === "new" ? { isNew: true } : {}),
      ...(filter === "sale" ? { originalPrice: { not: null } } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    select: {
      id: true,
      name: true,
      price: true,
      originalPrice: true,
      image: true,
      categorySlug: true,
      rating: true,
      stock: true,
      isNew: true,
      isFeatured: true,
      isBundle: true,
      unit: true,
      flavors: true,
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(products);
}
