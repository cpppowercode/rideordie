import { NextRequest, NextResponse } from "next/server";
import { readBookingIntent } from "@/lib/booking-intent";
import { approveAndFinalizeBooking } from "@/lib/booking-finalize";

export async function POST(request: NextRequest) {
  try {
    const { enc_data, enc_info, tran_cd, orderId, payMethod, intent: intentToken } = (await request.json()) as {
      enc_data?: string;
      enc_info?: string;
      tran_cd?: string;
      orderId?: string;
      payMethod?: string;
      intent?: string;
    };

    if (!enc_data || !enc_info || !tran_cd || !orderId) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
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
