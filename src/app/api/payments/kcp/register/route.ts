import { NextRequest, NextResponse } from "next/server";
import { payBreakdown } from "@/lib/badge-fee";
import { getSeasonSettings } from "@/lib/season-settings";
import { INTENT_COOKIE, readBookingIntent } from "@/lib/booking-intent";
import {
  kcpRegisterUrl,
  kcpSiteCd,
  KCP_PAY_METHODS,
  type KcpPayMethod,
} from "@/lib/kcp";

export async function POST(request: NextRequest) {
  try {
    const { orderId, goodName, payMethod, retUrl, intent: intentToken } = (await request.json()) as {
      intent?: string;
      orderId?: string;
      goodName?: string;
      payMethod?: KcpPayMethod;
      retUrl?: string;
    };

    if (!orderId || !goodName || !payMethod || !retUrl) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    const method = KCP_PAY_METHODS[payMethod];
    if (!method) {
      return NextResponse.json({ error: "지원하지 않는 결제 수단입니다." }, { status: 400 });
    }

    // 금액은 클라이언트 값을 쓰지 않는다. 서버가 서명한 예약 정보로 강습비 + 패찰비를 다시 계산한다.
    const intent = readBookingIntent(intentToken || request.cookies.get(INTENT_COOKIE)?.value);
    if (!intent || intent.orderNo !== orderId) {
      return NextResponse.json({ error: "예약 정보를 확인할 수 없습니다. 처음부터 다시 진행해 주세요." }, { status: 400 });
    }
    const amount = payBreakdown(intent.input, await getSeasonSettings()).total;
    if (intent.amount !== amount) {
      return NextResponse.json({ error: "결제 금액이 주문 금액과 다릅니다." }, { status: 400 });
    }
    const response = await fetch(kcpRegisterUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        site_cd: kcpSiteCd(),
        ordr_idxx: orderId,
        good_mny: String(amount),
        good_name: goodName,
        pay_method: method.mobile,
        Ret_URL: retUrl,
        user_agent: request.headers.get("user-agent") || "",
      }),
    });

    const data = (await response.json()) as {
      Code?: string;
      Message?: string;
      approvalKey?: string;
      PayUrl?: string;
    };

    if (data.Code !== "0000" || !data.approvalKey || !data.PayUrl) {
      return NextResponse.json(
        { error: data.Message || "KCP 거래등록에 실패했습니다." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      approvalKey: data.approvalKey,
      PayUrl: data.PayUrl,
      amount,
      payMethod: method.mobile,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "KCP 거래등록에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
