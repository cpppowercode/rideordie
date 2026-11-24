export const FB_SESSION_COOKIE = "rod_fb_session";

export type FeedbackCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge?: number;
};

/**
 * 카톡 인앱 브라우저에서도 같은 도메인 탑레벨 이동이면 SameSite=Lax 로 유지된다.
 * Secure 는 HTTPS(프리뷰·운영)에서만 켠다.
 */
export function feedbackSessionCookieOptions(input: {
  secure: boolean;
  /** 로그인 유지 시 expires_at 기준 초. 없으면 세션 쿠키. */
  maxAgeSec?: number;
}): FeedbackCookieOptions {
  const options: FeedbackCookieOptions = {
    httpOnly: true,
    secure: input.secure,
    sameSite: "lax",
    path: "/",
  };
  if (typeof input.maxAgeSec === "number" && input.maxAgeSec > 0) {
    options.maxAge = Math.floor(input.maxAgeSec);
  }
  return options;
}

/** expires_at ISO 와 현재 시각으로 maxAge(초)를 계산. 실패 시 90일. */
export function maxAgeFromExpiresAt(
  expiresAt: string,
  now = Date.now(),
): number {
  const t = Date.parse(expiresAt);
  if (!Number.isFinite(t)) return 90 * 24 * 60 * 60;
  return Math.max(60, Math.floor((t - now) / 1000));
}

export function isSecureRequest(request: {
  headers: Headers;
  nextUrl?: { protocol: string };
}): boolean {
  const proto =
    request.headers.get("x-forwarded-proto") ||
    request.nextUrl?.protocol?.replace(":", "") ||
    "";
  return proto === "https";
}
