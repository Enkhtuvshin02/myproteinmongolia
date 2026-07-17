import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const promo = await db.promotionSetting.findUnique({
      where: { id: "default" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            image: true,
          },
        },
      },
    });

    if (!promo) {
      return NextResponse.json({ active: false, promo: null });
    }

    const now = new Date();
    // Compare dates: make sure the current time is between start and end date (inclusive)
    const isInDateRange = now >= promo.startDate && now <= promo.endDate;
    const active = promo.isActive && isInDateRange;

    return NextResponse.json({
      active,
      promo: active ? promo : null,
    });
  } catch (error: any) {
    return NextResponse.json({ active: false, error: error.message }, { status: 500 });
  }
}
