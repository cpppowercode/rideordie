import { NextResponse } from "next/server";
import { loadAdminBadgeRates } from "@/lib/admin-badge-fees";

export async function GET() {
  const rates = await loadAdminBadgeRates();
  return NextResponse.json(rates, {
    headers: { "Cache-Control": "no-store" },
  });
}
