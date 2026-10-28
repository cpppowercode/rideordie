import { NextRequest, NextResponse } from "next/server";
import iconv from "iconv-lite";
import { INTENT_COOKIE, readBookingIntent } from "@/lib/booking-intent";
import { approveAndFinalizeBooking } from "@/lib/booking-finalize";

function originFrom(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://rideordie-eight.vercel.app";
}

function failRedirect(request: NextRequest, code: string, message: string) {
  const url = new URL("/checkout/fail", originFrom(request));
  url.searchParams.set("code", code);
  url.searchParams.set("message", message);
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
  const resMsg = params.get("res_msg") || "결제에 실패했습니다.";
  if (resCd !== "0000") {
    return failRedirect(request, resCd || "FAIL", resMsg);
  }

  const enc_data = params.get("enc_data") || "";
  const enc_info = params.get("enc_info") || "";
  const tran_cd = params.get("tran_cd") || "";
  const orderId = params.get("ordr_idxx") || params.get("ordr_no") || "";
  const payMethod = params.get("pay_method") || params.get("use_pay_method") || "CARD";

  if (!enc_data || !enc_info || !tran_cd || !orderId) {
    return failRedirect(request, "INVALID", "결제 정보가 올바르지 않습니다.");
  }

  const intent = readBookingIntent(
    request.cookies.get(INTENT_COOKIE)?.value || request.nextUrl.searchParams.get("intent"),
  );
  if (!intent) {
    return failRedirect(request, "INTENT", "예약 정보가 만료되었거나 올바르지 않습니다. 예약을 다시 진행해 주세요.");
  }

  try {
    const result = await approveAndFinalizeBooking(intent, { enc_data, enc_info, tran_cd, orderId, payMethod });
    const url = new URL("/book/success", originFrom(request));
    url.searchParams.set("r", result.receipt);
    return NextResponse.redirect(url, 303);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "결제 승인에 실패했습니다.";
    return failRedirect(request, "APPROVE_FAIL", message);
  }
}

export async function POST(request: NextRequest) {
  return handleReturn(request);
}

export async function GET(request: NextRequest) {
  return failRedirect(request, "METHOD", "잘못된 결제 콜백입니다.");
}
