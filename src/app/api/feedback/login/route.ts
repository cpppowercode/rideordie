import { NextRequest, NextResponse } from "next/server";
import { adminFeedbackLogin } from "@/lib/customer-feedback/admin";
import {
  FEEDBACK_LOGIN_INVALID_MESSAGE,
  FEEDBACK_LOGIN_RETRY_MESSAGE,
  FEEDBACK_SERVICE_PREPARING_MESSAGE,
  loginErrorMessage,
} from "@/lib/customer-feedback/messages";
import { parseFeedbackLoginBody } from "@/lib/customer-feedback/parse-login";
import {
  FB_SESSION_COOKIE,
  feedbackSessionCookieOptions,
  isSecureRequest,
  maxAgeFromExpiresAt,
} from "@/lib/customer-feedback/session";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import { clientIp, enforceRateLimit, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 손님 피드백 로그인. ADMIN_API_TOKEN 은 서버에서만 어드민 API 호출에 쓴다.
 * Vercel Bot Protection 우회를 위해 /api/ 경로로 제출한다.
 */
export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(
    request,
    "feedbackLogin",
    RATE_LIMITS.feedbackLogin,
  );
  if (limited) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: FEEDBACK_LOGIN_RETRY_MESSAGE },
      { status: 429 },
    );
  }

  const parsed = await readJsonBody<Record<string, unknown>>(request);
  if (!parsed.ok) return parsed.response;

  const checked = parseFeedbackLoginBody(parsed.data ?? {});
  if (!checked.ok) {
    return NextResponse.json(
      { ok: false, error: "invalid", message: FEEDBACK_LOGIN_INVALID_MESSAGE },
      { status: 400 },
    );
  }

  const ip = clientIp(request);
  const userAgent = request.headers.get("user-agent")?.slice(0, 300) || "";

  let result: Awaited<ReturnType<typeof adminFeedbackLogin>>;
  try {
    result = await adminFeedbackLogin({
      name: checked.data.name,
      phone: checked.data.phone,
      client_ip: ip,
      user_agent: userAgent,
      share_token: checked.data.share_token,
    });
  } catch {
    return NextResponse.json(
      { ok: false, unavailable: true, message: FEEDBACK_SERVICE_PREPARING_MESSAGE },
      { status: 503 },
    );
  }

  if (!result.ok) {
    if ("unavailable" in result && result.unavailable) {
      return NextResponse.json(
        { ok: false, unavailable: true, message: FEEDBACK_SERVICE_PREPARING_MESSAGE },
        { status: 503 },
      );
    }
    const error = "error" in result ? result.error : "invalid";
    const message = loginErrorMessage(error);
    const status = error === "locked" || error === "rate_limited" ? 429 : 401;
    return NextResponse.json(
      { ok: false, error, message },
      { status },
    );
  }

  const response = NextResponse.json({
    ok: true,
    expires_at: result.expires_at,
  });

  const secure = isSecureRequest(request);
  const cookieOpts = feedbackSessionCookieOptions({
    secure,
    maxAgeSec: checked.data.remember
      ? maxAgeFromExpiresAt(result.expires_at)
      : undefined,
  });
  response.cookies.set(FB_SESSION_COOKIE, result.session_token, cookieOpts);
  return response;
}
