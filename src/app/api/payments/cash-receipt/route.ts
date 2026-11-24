import { NextRequest, NextResponse } from "next/server";
import { parseCashReceiptBody } from "@/lib/security/cash-receipt";
import { checkBotGuard, HONEYPOT_FIELD } from "@/lib/security/bot-guard";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import { clientIp, enforceRateLimit, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 현금영수증 요청 API — 레이트리밋·입력 검증·봇 가드.
 * KCP 현금영수증 연동은 아직 없어 접수만 막고 안내한다(남용 엔드포인트 선제 방어).
 */
export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "cashReceipt", RATE_LIMITS.cashReceipt);
  if (limited) return limited;

  const parsed = await readJsonBody<Record<string, unknown>>(request);
  if (!parsed.ok) return parsed.response;

  const body = parsed.data ?? {};
  const bot = await checkBotGuard(
    {
      honeypot: body[HONEYPOT_FIELD] ?? body.honeypot,
      turnstileToken: body.turnstileToken ?? body["cf-turnstile-response"],
    },
    { ip: clientIp(request) },
  );
  if (!bot.ok) {
    return NextResponse.json({ error: bot.error }, { status: bot.status });
  }

  const checked = parseCashReceiptBody(body);
  if (!checked.ok) {
    return NextResponse.json({ error: checked.error }, { status: 400 });
  }

  // 주문번호 존재 여부 등 상세 조회는 연동 시 추가. 지금은 남용만 차단.
  return NextResponse.json(
    {
      error: "현금영수증 온라인 발급은 준비 중입니다. 채널톡으로 주문번호를 알려 주세요.",
      orderNo: checked.data.orderNo,
    },
    { status: 503 },
  );
}
