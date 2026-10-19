import { NextRequest, NextResponse } from "next/server";
import {
  expectedPayAmount,
  kcpRegisterUrl,
  kcpSiteCd,
  KCP_PAY_METHODS,
  type KcpPayMethod,
} from "@/lib/kcp";

export async function POST(request: NextRequest) {
  try {
    const { orderId, goodName, payMethod, retUrl } = (await request.json()) as {
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

    const amount = expectedPayAmount();
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
