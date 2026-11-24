import { NextRequest, NextResponse } from "next/server";
import { checkBotGuard, HONEYPOT_FIELD } from "@/lib/security/bot-guard";
import { parseContactBody } from "@/lib/security/contact";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import { clientIp, enforceRateLimit, readJsonBody } from "@/lib/security/request";
import { OWNER_EMAIL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 문의 접수 API — 레이트리밋·허니팟·(선택) Turnstile·입력 검증.
 * RESEND_API_KEY 가 없으면 채널톡 안내와 함께 503.
 */
export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "contact", RATE_LIMITS.contact);
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

  const checked = parseContactBody(body);
  if (!checked.ok) {
    return NextResponse.json({ error: checked.error }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "지금은 채널톡 또는 카톡 상담으로 문의해 주세요." },
      { status: 503 },
    );
  }

  const to = process.env.OWNER_NOTIFY_EMAIL || OWNER_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || "RideOrDie <noreply@rideordie.kr>";
  const text = [
    "홈페이지 문의가 도착했습니다.",
    "",
    `이름: ${checked.data.name}`,
    `연락처: ${checked.data.phone}`,
    checked.data.email ? `이메일: ${checked.data.email}` : "",
    "",
    checked.data.message,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `[라이드올다이] 문의 — ${checked.data.name}`,
        text,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("[api/contact] resend failed", response.status, detail.slice(0, 200));
      return NextResponse.json({ error: "문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
    }
  } catch (error) {
    console.error("[api/contact]", error);
    return NextResponse.json({ error: "문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
