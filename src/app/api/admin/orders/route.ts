import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const validStatus = status && status in OrderStatus ? (status as OrderStatus) : undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(searchParams.get("pageSize")) || 30));
  const where = validStatus ? { status: validStatus } : undefined;

  const [data, total] = await Promise.all([
    db.order.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
        custFirstName: true,
        custLastName: true,
        phonePrimary: true,
        phoneSecondary: true,
        district: true,
        khoroo: true,
        detailedAddress: true,
        receiptImageUrl: true,
        items: { select: { qty: true, product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ]);
  return NextResponse.json({ data, total, page, pageSize });
}
