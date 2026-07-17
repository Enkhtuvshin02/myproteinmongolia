import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  const addresses = await db.savedAddress.findMany({
    where: { userId: session.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтэрч орно уу." }, { status: 401 });

  const { label, city, district, khoroo, detail, isDefault } = await req.json();

  if (isDefault) {
    await db.savedAddress.updateMany({
      where: { userId: session.sub },
      data: { isDefault: false },
    });
  }

  const address = await db.savedAddress.create({
    data: { userId: session.sub, label, city, district, khoroo, detail, isDefault: isDefault ?? false },
  });

  return NextResponse.json(address, { status: 201 });
}
