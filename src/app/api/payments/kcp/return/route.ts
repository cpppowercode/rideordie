import { NextRequest, NextResponse } from "next/server";
import iconv from "iconv-lite";
import { finalizeKcpBookingPayment, loadBookingPayContext } from "@/lib/kcp-booking";
import { approveKcpPayment, expectedPayAmount, toKcpPayType } from "@/lib/kcp";

function originFrom(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://rideordie.kr";
}

function failRedirect(request: NextRequest, orderId: string, code: string, message: string) {
  const path = orderId.startsWith("WEB_") ? "/book/pay/fail" : "/checkout/fail";
  const url = new URL(path, originFrom(request));
  if (orderId) url.searchParams.set("orderId", orderId);
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
  const orderId = params.get("ordr_idxx") || params.get("ordr_no") || "";
  if (resCd !== "0000") {
    return failRedirect(request, orderId, resCd || "FAIL", resMsg);
  }

  const enc_data = params.get("enc_data") || "";
  const enc_info = params.get("enc_info") || "";
  const tran_cd = params.get("tran_cd") || "";
  const payMethod = params.get("pay_method") || params.get("use_pay_method") || "CARD";

  if (!enc_data || !enc_info || !tran_cd || !orderId) {
    return failRedirect(request, orderId, "INVALID", "결제 정보가 올바르지 않습니다.");
  }

  try {
    const booking = await loadBookingPayContext(orderId);
    if (booking) {
      const result = await finalizeKcpBookingPayment({
        enc_data,
        enc_info,
        tran_cd,
        orderId,
        payMethod,
      });
      const url = new URL("/book/pay/success", originFrom(request));
      url.searchParams.set("orderId", result.orderNo);
      url.searchParams.set("amount", String(result.amount));
      url.searchParams.set("tno", result.tno || "");
      return NextResponse.redirect(url, 303);
    }

    const amount = expectedPayAmount();
    const payment = await approveKcpPayment({
      enc_data,
      enc_info,
      tran_cd,
      orderId,
      amount,
      payType: toKcpPayType(payMethod),
    });

    const url = new URL("/checkout/success", originFrom(request));
    url.searchParams.set("orderId", orderId);
    url.searchParams.set("amount", String(amount));
    url.searchParams.set("tno", payment.tno || "");
    return NextResponse.redirect(url, 303);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "결제 승인에 실패했습니다.";
    return failRedirect(request, orderId, "APPROVE_FAIL", message);
  }
}

export async function POST(request: NextRequest) {
  return handleReturn(request);
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("ordr_idxx") || request.nextUrl.searchParams.get("orderId") || "";
  return failRedirect(request, orderId, "METHOD", "잘못된 결제 콜백입니다.");
}
