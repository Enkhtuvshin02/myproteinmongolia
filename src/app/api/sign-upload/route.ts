import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSession } from "@/lib/auth-utils";

// Same signing scheme as /api/admin/sign-upload, but open to any signed-in
// customer — used for order receipt-screenshot uploads, not just admin assets.
function signRequest(paramsToSign: Record<string, string>, apiSecret: string): string {
  const sorted = Object.keys(paramsToSign)
    .sort()
    .map((k) => `${k}=${paramsToSign[k]}`)
    .join("&");
  return createHash("sha256").update(sorted + apiSecret).digest("hex");
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтэрч орно уу." }, { status: 401 });

  const { paramsToSign } = await req.json();

  const signature = signRequest(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

  return NextResponse.json({
    signature,
    timestamp: paramsToSign.timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}
