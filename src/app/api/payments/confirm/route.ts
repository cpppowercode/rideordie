import { NextRequest, NextResponse } from "next/server";
import { readBookingIntent } from "@/lib/booking-intent";
import { approveAndFinalizeBooking } from "@/lib/booking-finalize";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import { enforceRateLimit, readJsonBody } from "@/lib/security/request";

export async function POST(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, "paymentsConfirm", RATE_LIMITS.paymentsConfirm);
    if (limited) return limited;

    const parsed = await readJsonBody<{
      enc_data?: string;
      enc_info?: string;
      tran_cd?: string;
      orderId?: string;
      payMethod?: string;
      intent?: string;
    }>(request);
    if (!parsed.ok) return parsed.response;

    const { enc_data, enc_info, tran_cd, orderId, payMethod, intent: intentToken } = parsed.data;

    if (!enc_data || !enc_info || !tran_cd || !orderId) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }
    if (
      typeof enc_data !== "string" ||
      typeof enc_info !== "string" ||
      typeof tran_cd !== "string" ||
      typeof orderId !== "string" ||
      enc_data.length > 16_000 ||
      enc_info.length > 8_000 ||
      tran_cd.length > 64 ||
      orderId.length > 64
    ) {
      return NextResponse.json({ error: "결제 정보 형식이 올바르지 않습니다." }, { status: 400 });
    }

    const intent = readBookingIntent(intentToken);
    if (!intent) {
      return NextResponse.json(
        { error: "예약 정보가 만료되었거나 올바르지 않습니다. 예약을 다시 진행해 주세요." },
        { status: 400 },
      );
    }

    const result = await approveAndFinalizeBooking(intent, {
      enc_data,
      enc_info,
      tran_cd,
      orderId,
      payMethod: payMethod || "PACA",
    });

    return NextResponse.json({
      success: true,
      orderNo: result.orderNo,
      receipt: result.receipt,
      payment: { orderId: result.orderNo, totalAmount: result.amount, tno: result.tno },
    });
  } catch (error: unknown) {
    console.error("KCP payment confirmation error:", error);
    const errorMessage = error instanceof Error ? error.message : "결제 승인에 실패했습니다.";
    return NextResponse.json({ error: errorMessage }, { status: 502 });
  }
}
