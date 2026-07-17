import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-utils";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Self-healing: if the default promotion doesn't exist, create it.
  let promo = await db.promotionSetting.findUnique({
    where: { id: "default" },
  });

  if (!promo) {
    promo = await db.promotionSetting.create({
      data: {
        id: "default",
        isActive: false,
        title: "Хүслээ цэнэглэ",
        description: "Эхний захиалгадаа 15% хямдрал аваарай! Шинэ хэрэглэгчдэд зориулсан онцгой урамшуулал.",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        discountCode: "WELCOME15",
        discountValue: "15%",
      },
    });
  }

  return NextResponse.json(promo);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { isActive, productId, title, description, startDate, endDate, discountCode, discountValue, imageUrl } = body;

    if (!title || !description || !startDate || !endDate) {
      return NextResponse.json({ error: "Гарчиг, тайлбар, эхлэх болон дуусах хугацааг заавал оруулна уу." }, { status: 400 });
    }

    const promo = await db.promotionSetting.upsert({
      where: { id: "default" },
      update: {
        isActive: Boolean(isActive),
        productId: productId || null,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        discountCode: discountCode || "",
        discountValue: discountValue || "",
        imageUrl: imageUrl || null,
      },
      create: {
        id: "default",
        isActive: Boolean(isActive),
        productId: productId || null,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        discountCode: discountCode || "",
        discountValue: discountValue || "",
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(promo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Алдаа гарлаа." }, { status: 500 });
  }
}
