import { SITE_URL } from "@/lib/site";

/** 운영에서 항상 허용하는 apex / www. */
const PRODUCTION_HOSTS = new Set(["rideordie.kr", "www.rideordie.kr"]);

type HeaderReader = { get(name: string): string | null };
/** process.env 및 테스트용 부분 env. ProcessEnv 와 호환되게 인덱스 시그니처 포함. */
type EnvLike = Record<string, string | undefined>;

/** host 헤더·VERCEL_URL 값을 소문자 호스트명으로 정규화(포트·스킴 제거). */
export function normalizeRequestHost(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim().toLowerCase() || "";
  const withoutScheme = first.replace(/^https?:\/\//, "");
  const host = withoutScheme.replace(/:\d+$/, "").trim();
  if (!host || /[^a-z0-9.-]/.test(host)) return null;
  return host;
}

function fallbackSiteUrl(env: EnvLike = process.env): string {
  const fromEnv = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return SITE_URL;
}

/** 프리뷰/개발에서만 Vercel 배포 호스트를 허용 목록에 넣는다. */
export function vercelPreviewHosts(env: EnvLike = process.env): Set<string> {
  const hosts = new Set<string>();
  if (env.VERCEL_ENV === "production") return hosts;
  for (const key of ["VERCEL_URL", "VERCEL_BRANCH_URL"] as const) {
    const host = normalizeRequestHost(env[key]);
    if (host) hosts.add(host);
  }
  return hosts;
}

export function isAllowedRequestHost(host: string, env: EnvLike = process.env): boolean {
  const normalized = normalizeRequestHost(host);
  if (!normalized) return false;
  if (PRODUCTION_HOSTS.has(normalized)) return true;
  return vercelPreviewHosts(env).has(normalized);
}

/**
 * 결제 Ret_URL·성공/실패 리다이렉트 origin.
 * 요청 Host(또는 x-forwarded-host)가 허용 목록에 있을 때만 그 https origin,
 * 아니면 SITE_URL. 악성 Host 주입으로 오픈 리다이렉트되지 않게 한다.
 *
 * intent 쿠키는 Domain 없이 호스트 전용이므로, 쿠키를 심은 호스트와
 * KCP return 호스트가 같아야 한다 → register/return 모두 이 헬퍼를 쓴다.
 */
export function requestOrigin(headers: HeaderReader, env: EnvLike = process.env): string {
  for (const headerName of ["x-forwarded-host", "host"] as const) {
    const host = normalizeRequestHost(headers.get(headerName));
    if (host && isAllowedRequestHost(host, env)) {
      return `https://${host}`;
    }
  }
  return fallbackSiteUrl(env);
}

export function kcpReturnUrl(headers: HeaderReader, env: EnvLike = process.env): string {
  return `${requestOrigin(headers, env)}/api/payments/kcp/return`;
}
