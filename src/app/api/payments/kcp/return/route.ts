import { NextRequest, NextResponse } from "next/server";
import iconv from "iconv-lite";
import { INTENT_COOKIE, readBookingIntent } from "@/lib/booking-intent";
import { approveAndFinalizeBooking } from "@/lib/booking-finalize";
import { SITE_URL } from "@/lib/site";

function siteOrigin(): string {
  return SITE_URL;
}

function failRedirect(code: string, order?: string) {
  const url = new URL("/checkout/fail", siteOrigin());
  url.searchParams.set("code", code);
  if (order) url.searchParams.set("order", order);
  return NextResponse.redirect(url, 303);
}

async function handleReturn(request: NextRequest) {
  const buf = Buffer.from(await request.arrayBuffer());
  let text = iconv.decode(buf, "euc-kr");
  if (!text.includes("enc_data") && !text.includes("res_cd")) {
    text = buf.toString("utf8");
  }
  const params = new URLSearchParams(text);

  const resCd = params.get("res_cd") || "";
  if (resCd !== "0000") {
    // KCP 메시지를 URL에 그대로 넣지 않는다(피싱·오인 문구 방지).
    return failRedirect(resCd || "FAIL");
  }

  const enc_data = params.get("enc_data") || "";
  const enc_info = params.get("enc_info") || "";
  const tran_cd = params.get("tran_cd") || "";
  const orderId = params.get("ordr_idxx") || params.get("ordr_no") || "";
  const payMethod = params.get("pay_method") || params.get("use_pay_method") || "CARD";

  if (!enc_data || !enc_info || !tran_cd || !orderId) {
    return failRedirect("INVALID");
  }

  // intent 는 httpOnly 쿠키만 사용. 쿼리 문자열 폴백은 Referer·로그 유출 위험이 있어 제거.
  const intent = readBookingIntent(request.cookies.get(INTENT_COOKIE)?.value);
  if (!intent) {
    return failRedirect("INTENT");
  }

  try {
    const result = await approveAndFinalizeBooking(intent, { enc_data, enc_info, tran_cd, orderId, payMethod });
    const url = new URL("/book/success", siteOrigin());
    url.searchParams.set("r", result.receipt);
    return NextResponse.redirect(url, 303);
  } catch (error: unknown) {
    console.error("KCP return processing failed", { orderId, error });
    return failRedirect("APPROVE_FAIL", orderId);
  }
}

export async function POST(request: NextRequest) {
  return handleReturn(request);
}

export async function GET() {
  return failRedirect("METHOD");
}
