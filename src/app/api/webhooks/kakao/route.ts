import { NextRequest, NextResponse } from "next/server";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import { enforceRateLimit, readRawBody } from "@/lib/security/request";
import {
  kakaoWebhookSecret,
  verifyWebhookSignature,
  webhookAuthErrorMessage,
} from "@/lib/security/webhook-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 카카오/알림톡 관련 인바운드 웹훅.
 * 시크릿(KAKAO_WEBHOOK_SECRET)이 없으면 fail-closed(503).
 */
async function handle(request: NextRequest) {
  const limited = enforceRateLimit(request, "webhooksKakao", RATE_LIMITS.webhooksKakao);
  if (limited) return limited;

  const raw = await readRawBody(request);
  if (!raw.ok) return raw.response;

  const auth = verifyWebhookSignature({
    secret: kakaoWebhookSecret(),
    rawBody: raw.buf,
    signatureHeader:
      request.headers.get("x-kakao-signature") ||
      request.headers.get("x-webhook-signature") ||
      request.headers.get("x-hub-signature-256") ||
      request.headers.get("x-solapi-signature"),
    sharedTokenHeader:
      request.headers.get("x-webhook-secret") ||
      request.headers.get("authorization"),
  });

  if (!auth.ok) {
    const status = auth.reason === "missing_secret" ? 503 : 401;
    console.warn("[webhooks/kakao] auth failed", auth.reason);
    return NextResponse.json({ error: webhookAuthErrorMessage(auth.reason) }, { status });
  }

  console.info("[webhooks/kakao] accepted", { bytes: raw.buf.byteLength });
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
