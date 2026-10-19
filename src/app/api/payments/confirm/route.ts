import { NextRequest, NextResponse } from "next/server";
import { approveKcpPayment, expectedPayAmount, toKcpPayType } from "@/lib/kcp";

export async function POST(request: NextRequest) {
  try {
    const { enc_data, enc_info, tran_cd, orderId, payMethod } = (await request.json()) as {
      enc_data?: string;
      enc_info?: string;
      tran_cd?: string;
      orderId?: string;
      payMethod?: string;
    };

    if (!enc_data || !enc_info || !tran_cd || !orderId) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    const amount = expectedPayAmount();
    const payment = await approveKcpPayment({
      enc_data,
      enc_info,
      tran_cd,
      orderId,
      amount,
      payType: toKcpPayType(payMethod || "PACA"),
    });

    return NextResponse.json({
      success: true,
      payment: {
        orderId,
        totalAmount: amount,
        tno: payment.tno,
        cardName: payment.card_name,
        appNo: payment.app_no,
      },
    });
  } catch (error: unknown) {
    console.error("KCP payment confirmation error:", error);
    const errorMessage = error instanceof Error ? error.message : "결제 승인에 실패했습니다.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
