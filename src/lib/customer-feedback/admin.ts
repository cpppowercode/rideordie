import { ADMIN_RESERVATIONS_URL, ADMIN_TENANT_ID } from "@/lib/site";
import type {
  FeedbackByTokenResult,
  FeedbackListResult,
  FeedbackLoginResult,
  FeedbackSessionCheck,
} from "./types";

/**
 * 새 env 없이 기존 ADMIN_RESERVATIONS_URL 에서 어드민 origin 을 얻는다.
 * 예: https://admin.rideordie.kr/api/reservations → https://admin.rideordie.kr
 */
export function adminApiBaseUrl(
  reservationsUrl: string = ADMIN_RESERVATIONS_URL,
): string {
  try {
    const u = new URL(reservationsUrl);
    return u.origin;
  } catch {
    return "https://admin.rideordie.kr";
  }
}

function requireAdminApiToken(): string {
  const token = process.env.ADMIN_API_TOKEN?.trim() || "";
  if (!token) {
    throw new Error("피드백 서버 연동에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }
  return token;
}

function adminHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {
    "X-Tenant-Id": ADMIN_TENANT_ID,
    Authorization: `Bearer ${requireAdminApiToken()}`,
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

function feedbackUrl(path: string): string {
  return `${adminApiBaseUrl()}/api/customer-feedback/${path.replace(/^\//, "")}`;
}

export type AdminFeedbackCall<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; unavailable: true; status: number }
  | { ok: false; unavailable?: false; status: number; body: unknown };

/**
 * 어드민 피드백 API 호출. 404·네트워크 오류는 unavailable 로 돌려 500 을 막는다.
 * ADMIN_API_TOKEN 은 이 모듈에서만 사용한다.
 */
export async function callCustomerFeedbackApi<T>(
  path: string,
  body: Record<string, unknown>,
  fetchImpl: typeof fetch = fetch,
): Promise<AdminFeedbackCall<T>> {
  let response: Response;
  try {
    response = await fetchImpl(feedbackUrl(path), {
      method: "POST",
      headers: adminHeaders(true),
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return { ok: false, unavailable: true, status: 0 };
  }

  if (response.status === 404 || response.status === 501 || response.status === 502) {
    return { ok: false, unavailable: true, status: response.status };
  }

  const parsed = (await response.json().catch(() => null)) as T | null;
  if (parsed == null) {
    return { ok: false, unavailable: true, status: response.status };
  }

  if (!response.ok) {
    return { ok: false, status: response.status, body: parsed };
  }

  return { ok: true, data: parsed, status: response.status };
}

export async function adminFeedbackLogin(input: {
  name: string;
  phone: string;
  client_ip: string;
  user_agent: string;
  share_token?: string;
}): Promise<FeedbackLoginResult | { ok: false; unavailable: true }> {
  const result = await callCustomerFeedbackApi<FeedbackLoginResult>("login", {
    name: input.name,
    phone: input.phone,
    client_ip: input.client_ip,
    user_agent: input.user_agent,
    ...(input.share_token ? { share_token: input.share_token } : {}),
  });
  if (!result.ok) {
    if (result.unavailable) return { ok: false, unavailable: true };
    const body = result.body as FeedbackLoginResult | null;
    if (body && body.ok === false) return body;
    return { ok: false, error: "invalid" };
  }
  return result.data;
}

export async function adminFeedbackSession(
  session_token: string,
): Promise<FeedbackSessionCheck | { ok: false; unavailable: true }> {
  const result = await callCustomerFeedbackApi<FeedbackSessionCheck>("session", {
    session_token,
  });
  if (!result.ok) {
    if (result.unavailable) return { ok: false, unavailable: true };
    return { ok: false };
  }
  return result.data;
}

export async function adminFeedbackLogout(session_token: string): Promise<void> {
  await callCustomerFeedbackApi("logout", { session_token }).catch(() => undefined);
}

export async function adminFeedbackList(
  session_token: string,
): Promise<FeedbackListResult> {
  const result = await callCustomerFeedbackApi<FeedbackListResult>("list", {
    session_token,
  });
  if (!result.ok) {
    if (result.unavailable) return { ok: false, unavailable: true };
    return { ok: false, error: "list_failed" };
  }
  return result.data;
}

export async function adminFeedbackByToken(input: {
  share_token: string;
  session_token?: string;
}): Promise<FeedbackByTokenResult> {
  const result = await callCustomerFeedbackApi<FeedbackByTokenResult>("by-token", {
    share_token: input.share_token,
    ...(input.session_token ? { session_token: input.session_token } : {}),
  });
  if (!result.ok) {
    if (result.unavailable) return { ok: false, unavailable: true };
    return { ok: false, error: "token_failed" };
  }
  return result.data;
}

/** 테스트용 — Authorization 헤더에 토큰이 서버에서만 붙는지 확인. */
export function buildAdminAuthHeaderForTest(token: string): Record<string, string> {
  return {
    "X-Tenant-Id": ADMIN_TENANT_ID,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}
