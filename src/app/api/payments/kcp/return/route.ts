import { NextRequest, NextResponse } from "next/server";
import iconv from "iconv-lite";
import {
  approveKcpPayment,
  expectedPayAmount,
  toKcpPayType,
} from "@/lib/kcp";

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

  try {
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
    return failRedirect(request, "APPROVE_FAIL", message);
  }
}

export async function POST(request: NextRequest) {
  return handleReturn(request);
}

export async function GET(request: NextRequest) {
  return failRedirect(request, "METHOD", "잘못된 결제 콜백입니다.");
}
