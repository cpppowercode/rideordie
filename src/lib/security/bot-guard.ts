/**
 * 봇 폼 제출 차단.
 * - 허니팟: 항상 검사(필드가 채워지면 거부). 추가 env 불필요.
 * - Cloudflare Turnstile: 시크릿·사이트키가 둘 다 있을 때만 검증. 없으면 통과(예약 유지).
 */

export const HONEYPOT_FIELD = "company_url";

export type BotGuardInput = {
  /** 허니팟 필드 값 — 사람이면 빈 문자열 */
  honeypot?: unknown;
  /** Turnstile 토큰 (클라이언트 cf-turnstile-response) */
  turnstileToken?: unknown;
};

export type BotGuardResult =
  | { ok: true; turnstile: "skipped" | "verified" }
  | { ok: false; error: string; status: number };

function turnstileConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.TURNSTILE_SECRET_KEY?.trim() && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
}

/** 서버: 시크릿+사이트키가 모두 있을 때만 토큰 검증을 강제한다. */
export function isTurnstileEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return turnstileConfigured(env);
}

/** 클라이언트 위젯 표시용 — 공개 사이트키만 본다(시크릿은 브라우저에 없음). */
export function getTurnstileSiteKey(env: NodeJS.ProcessEnv = process.env): string | null {
  const key = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return key || null;
}

/** 클라이언트: 사이트키가 있으면 위젯을 보여 준다. */
export function shouldShowTurnstile(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(getTurnstileSiteKey(env));
}

function honeypotFilled(value: unknown): boolean {
  if (value == null) return false;
  return String(value).trim().length > 0;
}

async function verifyTurnstileToken(
  token: string,
  secret: string,
  ip?: string,
): Promise<boolean> {
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return false;
  const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
  return Boolean(data?.success);
}

/**
 * 허니팟 + (선택) Turnstile.
 * Turnstile env가 없으면 turnstile 검증을 건너뛰어 기존 예약 흐름을 깨지 않는다.
 */
export async function checkBotGuard(
  input: BotGuardInput,
  options: { ip?: string; env?: NodeJS.ProcessEnv } = {},
): Promise<BotGuardResult> {
  const env = options.env ?? process.env;

  if (honeypotFilled(input.honeypot)) {
    // 봇에게는 성공처럼 보이게 하지 않고 일반 검증 실패로 응답한다.
    return { ok: false, error: "요청을 처리할 수 없습니다.", status: 400 };
  }

  if (!turnstileConfigured(env)) {
    return { ok: true, turnstile: "skipped" };
  }

  const token = String(input.turnstileToken || "").trim();
  if (!token) {
    return { ok: false, error: "봇 확인이 필요합니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.", status: 400 };
  }

  const secret = env.TURNSTILE_SECRET_KEY!.trim();
  const ok = await verifyTurnstileToken(token, secret, options.ip);
  if (!ok) {
    return { ok: false, error: "봇 확인에 실패했습니다. 다시 시도해 주세요.", status: 403 };
  }
  return { ok: true, turnstile: "verified" };
}
