import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      message: "Shipping rates endpoint is disabled.",
      reason: "Shopify integration has been removed from this project.",
    },
    { status: 410 }
  );
}
