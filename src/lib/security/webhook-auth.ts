import crypto from "crypto";

/**
 * 인바운드 웹훅 서명 검증 — 시크릿 없으면 fail-closed.
 *
 * 환경변수:
 * - KCP_NOTI_SECRET: KCP 결과 통보 (/api/webhooks/kcp)
 * - KAKAO_WEBHOOK_SECRET: 카카오/알림톡 관련 인바운드 웹훅 (/api/webhooks/kakao)
 */

export type WebhookAuthResult =
  | { ok: true }
  | { ok: false; reason: "missing_secret" | "missing_signature" | "invalid_signature" };

function timingSafeEqualString(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function hmacHex(secret: string, rawBody: Buffer | string, algo: "sha256" | "sha1" = "sha256"): string {
  return crypto.createHmac(algo, secret).update(rawBody).digest("hex");
}

function stripSignaturePrefix(header: string): string {
  const v = header.trim();
  // "sha256=...", "Bearer ...", raw hex/token
  if (v.toLowerCase().startsWith("sha256=")) return v.slice(7).trim();
  if (v.toLowerCase().startsWith("sha1=")) return v.slice(5).trim();
  if (v.toLowerCase().startsWith("bearer ")) return v.slice(7).trim();
  return v;
}

/**
 * 공통 검증: 시크릿 필수.
 * 1) Authorization / X-Webhook-Secret / X-*-Signature 헤더와 시크릿 직접 비교, 또는
 * 2) HMAC-SHA256(raw body) 와 서명 헤더 비교
 */
export function verifyWebhookSignature(options: {
  secret: string | undefined;
  rawBody: Buffer | string;
  signatureHeader: string | null;
  /** 시크릿 자체를 헤더로 보내는 단순 공유 토큰 방식도 허용 */
  sharedTokenHeader?: string | null;
}): WebhookAuthResult {
  const secret = options.secret?.trim();
  if (!secret) {
    return { ok: false, reason: "missing_secret" };
  }

  const shared = options.sharedTokenHeader?.trim();
  if (shared) {
    const sharedToken = stripSignaturePrefix(shared);
    if (timingSafeEqualString(sharedToken, secret)) {
      return { ok: true };
    }
  }

  const sigRaw = options.signatureHeader?.trim();
  if (!sigRaw) {
    return { ok: false, reason: "missing_signature" };
  }

  const provided = stripSignaturePrefix(sigRaw);
  // 공유 토큰을 서명 헤더에 넣는 경우
  if (timingSafeEqualString(provided, secret)) {
    return { ok: true };
  }

  const expectedSha256 = hmacHex(secret, options.rawBody, "sha256");
  if (timingSafeEqualString(provided.toLowerCase(), expectedSha256.toLowerCase())) {
    return { ok: true };
  }

  return { ok: false, reason: "invalid_signature" };
}

export function kcpNotiSecret(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.KCP_NOTI_SECRET?.trim() || undefined;
}

export function kakaoWebhookSecret(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.KAKAO_WEBHOOK_SECRET?.trim() || undefined;
}

export type WebhookAuthFailReason = "missing_secret" | "missing_signature" | "invalid_signature";

export function webhookAuthErrorMessage(reason: WebhookAuthFailReason): string {
  switch (reason) {
    case "missing_secret":
      return "웹훅 시크릿이 설정되지 않았습니다.";
    case "missing_signature":
      return "웹훅 서명이 없습니다.";
    case "invalid_signature":
      return "웹훅 서명이 올바르지 않습니다.";
    default:
      return "웹훅 인증에 실패했습니다.";
  }
}
