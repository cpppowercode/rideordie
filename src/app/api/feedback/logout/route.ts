import { NextRequest, NextResponse } from "next/server";
import { adminFeedbackLogout } from "@/lib/customer-feedback/admin";
import {
  FB_SESSION_COOKIE,
  feedbackSessionCookieOptions,
  isSecureRequest,
} from "@/lib/customer-feedback/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(FB_SESSION_COOKIE)?.value;
  if (token) {
    try {
      await adminFeedbackLogout(token);
    } catch {
      // 로그아웃은 쿠키 삭제만으로도 충분하다.
    }
  }

  const response = NextResponse.json({ ok: true });
  const secure = isSecureRequest(request);
  response.cookies.set(FB_SESSION_COOKIE, "", {
    ...feedbackSessionCookieOptions({ secure }),
    maxAge: 0,
  });
  return response;
}
