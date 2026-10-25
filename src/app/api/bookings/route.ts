import { NextRequest, NextResponse } from "next/server";
import { buildOrderNo, type BookingInput } from "@/lib/booking";
import { checkBookingAvailability, parseBookingBody } from "@/lib/booking-checks";
import { createBookingIntent, INTENT_COOKIE } from "@/lib/booking-intent";
import { expectedPayAmount } from "@/lib/kcp";

/**
 * 결제 전 단계: 예약 정보를 확인만 하고 저장·알림은 하지 않는다.
 * 서버 서명 토큰(intent)을 돌려주고, KCP 결제 승인 뒤에만 예약이 접수된다.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<BookingInput>;
    const checked = await checkBookingAvailability(parseBookingBody(body));
    if (!checked.ok) {
      return NextResponse.json({ error: checked.error }, { status: checked.status });
    }

    const orderNo = buildOrderNo();
    const amount = expectedPayAmount();
    const intent = createBookingIntent(orderNo, amount, checked.input);

    const response = NextResponse.json({
      success: true,
      status: "awaiting_payment",
      orderNo,
      amount,
      intent,
    });
    // 모바일 결제는 KCP가 Ret_URL로 POST 하므로 서명 토큰을 쿠키로도 실어 둔다(내용은 서버 서명으로 검증).
    const secure = (request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "")) === "https";
    response.cookies.set(INTENT_COOKIE, intent, {
      httpOnly: true,
      path: "/api/payments",
      maxAge: 60 * 60,
      sameSite: secure ? "none" : "lax",
      secure,
    });
    return response;
  } catch (error) {
    console.error("booking intent error", error);
    const message = error instanceof Error ? error.message : "예약 확인에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
