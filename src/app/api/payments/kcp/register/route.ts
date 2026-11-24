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
import { kcpReturnUrl } from "@/lib/request-origin";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import { enforceRateLimit, readJsonBody } from "@/lib/security/request";

export async function POST(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, "paymentsRegister", RATE_LIMITS.paymentsRegister);
    if (limited) return limited;

    const parsed = await readJsonBody<{
      intent?: string;
      orderId?: string;
      goodName?: string;
      payMethod?: KcpPayMethod;
      retUrl?: string;
    }>(request);
    if (!parsed.ok) return parsed.response;

    const { orderId, goodName, payMethod, intent: intentToken } = parsed.data;

    if (!orderId || !goodName || !payMethod) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }
    if (
      typeof orderId !== "string" ||
      typeof goodName !== "string" ||
      orderId.length > 64 ||
      goodName.length > 120
    ) {
      return NextResponse.json({ error: "결제 정보 형식이 올바르지 않습니다." }, { status: 400 });
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
    // Ret_URL 은 요청 호스트가 허용 목록일 때만 그 origin(쿠키 호스트와 일치). 클라이언트 retUrl 무시.
    const retUrl = kcpReturnUrl(request.headers);
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
      retUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "KCP 거래등록에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
