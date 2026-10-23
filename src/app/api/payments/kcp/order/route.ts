import { NextRequest, NextResponse } from "next/server";
import { isPaidStatus } from "@/lib/booking";
import { loadBookingPayContext } from "@/lib/kcp-booking";
import { formatWon } from "@/lib/pricing";
import { isKcpProduction, kcpSiteCd } from "@/lib/kcp-public";

export async function GET(request: NextRequest) {
  const orderNo = request.nextUrl.searchParams.get("orderNo")?.trim() || "";
  if (!orderNo) {
    return NextResponse.json({ error: "주문번호가 없습니다." }, { status: 400 });
  }

  try {
    const ctx = await loadBookingPayContext(orderNo);
    if (!ctx) {
      return NextResponse.json({ error: "예약 정보를 찾지 못했습니다." }, { status: 404 });
    }

    return NextResponse.json({
      orderNo,
      amount: ctx.amount,
      amountLabel: formatWon(ctx.amount),
      lessonAmount: ctx.lessonAmount ?? undefined,
      badgeFee: ctx.badgeFee ?? undefined,
      orderName: ctx.orderName,
      customerName: ctx.row.customer_name || "고객",
      customerPhone: ctx.row.customer_phone || "",
      lessonDate: ctx.row.lesson_date,
      lessonTime: ctx.row.lesson_time,
      skiResort: ctx.row.ski_resort,
      alreadyPaid: isPaidStatus(ctx.row.payment_status),
      siteCd: kcpSiteCd(),
      testMode: !isKcpProduction(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "결제 정보를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
