import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getAdminSession } from "@/lib/auth-utils";

function signRequest(paramsToSign: Record<string, string>, apiSecret: string): string {
  const sorted = Object.keys(paramsToSign)
    .sort()
    .map((k) => `${k}=${paramsToSign[k]}`)
    .join("&");
  return createHash("sha256").update(sorted + apiSecret).digest("hex");
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { paramsToSign } = await req.json();

  const signature = signRequest(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

  return NextResponse.json({
    signature,
    timestamp: paramsToSign.timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}
