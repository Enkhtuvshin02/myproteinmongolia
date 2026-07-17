import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true, flavors: true, variants: true },
  });
  if (!product) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(product);
}
