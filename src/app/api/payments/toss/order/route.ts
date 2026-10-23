import { NextRequest, NextResponse } from "next/server";
import { findReservationByOrderNo } from "@/lib/admin-reservations";
import { isPaidStatus } from "@/lib/booking";
import { loadAdminBadgeRates } from "@/lib/admin-badge-fees";
import { formatWon, quoteLessonPrice, ratioFromParticipants } from "@/lib/pricing";
import { tossClientKey, tossCustomerKey, tossIsTestMode } from "@/lib/toss";

export async function GET(request: NextRequest) {
  const orderNo = request.nextUrl.searchParams.get("orderNo")?.trim() || "";
  if (!orderNo) {
    return NextResponse.json({ error: "주문번호가 없습니다." }, { status: 400 });
  }

  try {
    const row = await findReservationByOrderNo(orderNo);
    if (!row) {
      return NextResponse.json({ error: "예약 정보를 찾지 못했습니다." }, { status: 404 });
    }

    const amount = Number(row.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "결제 금액이 없습니다." }, { status: 400 });
    }

    const ratio = ratioFromParticipants(Number(row.participants) || 1);
    const duration = Number(row.lesson_duration_hours) || 2;
    const orderName = `라이드올다이 강습 ${duration}시간${ratio ? ` ${ratio}` : ""}`;
    const rates = await loadAdminBadgeRates();
    const quote = quoteLessonPrice({
      durationHours: duration,
      participants: Number(row.participants) || 1,
      lessonDate: String(row.lesson_date || ""),
      skiResort: String(row.ski_resort || ""),
      rates,
    });
    const showBadge = Boolean(quote && quote.badgeFee > 0 && quote.payableAmount === amount);

    return NextResponse.json({
      orderNo,
      amount,
      amountLabel: formatWon(amount),
      lessonAmount: showBadge ? quote?.lessonAmount : undefined,
      badgeFee: showBadge ? quote?.badgeFee : undefined,
      orderName,
      customerName: row.customer_name || "고객",
      lessonDate: row.lesson_date,
      lessonTime: row.lesson_time,
      skiResort: row.ski_resort,
      alreadyPaid: isPaidStatus(row.payment_status),
      clientKey: tossClientKey(),
      customerKey: tossCustomerKey(orderNo),
      testMode: tossIsTestMode(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "결제 정보를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
