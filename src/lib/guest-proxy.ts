/**
 * 손님 도메인 분리 1단계: rideordie.kr → admin rewrite 화이트리스트.
 * /feedback·/junior 등 다른 홈페이지 경로는 여기에 넣지 않는다.
 * 리프트권(/ticket)·/season-customer 는 1단계 범위 밖.
 */

export const ADMIN_ORIGIN = "https://admin.rideordie.kr";

/** admin이 rewrite 요청을 식별·IP 헤더를 신뢰할 때 검증하는 마커 (환경변수 아님) */
export const GUEST_REWRITE_HEADER = "x-rod-guest-rewrite";
export const GUEST_REWRITE_TOKEN = "rod-guest-rewrite-v1";

/** admin assetPrefix — /_next 충돌 방지 */
export const ADMIN_ASSET_PREFIX = "/rod-a";

type RewriteRule = { source: string; destination: string };

/** next.config rewrites() 에 넣을 화이트리스트 */
export function guestProxyRewrites(): RewriteRule[] {
  const admin = ADMIN_ORIGIN.replace(/\/$/, "");
  return [
    // 손님 페이지
    {
      source: "/my-lesson/:path*",
      destination: `${admin}/my-lesson/:path*`,
    },
    {
      source: "/e-contract/:path*",
      destination: `${admin}/e-contract/:path*`,
    },
    // 손님 페이지가 부르는 API만 (통째 /api 프록시 금지)
    {
      source: "/api/e-contract/:path*",
      destination: `${admin}/api/e-contract/:path*`,
    },
    {
      source: "/api/client-errors",
      destination: `${admin}/api/client-errors`,
    },
    {
      source: "/api/admin-profile",
      destination: `${admin}/api/admin-profile`,
    },
    // admin 빌드 자산 (assetPrefix)
    {
      source: `${ADMIN_ASSET_PREFIX}/:path*`,
      destination: `${admin}${ADMIN_ASSET_PREFIX}/:path*`,
    },
    // 손님 페이지 정적 자산 (홈페이지 /images 와 로고 경로만 겹치지 않게 logo 하위만)
    {
      source: "/images/logo/:path*",
      destination: `${admin}/images/logo/:path*`,
    },
    {
      source: "/icons/:path*",
      destination: `${admin}/icons/:path*`,
    },
    {
      source: "/manifest.json",
      destination: `${admin}/manifest.json`,
    },
  ];
}

/** 미들웨어에서 rewrite 마커 헤더를 붙일 경로 */
export function shouldAttachGuestRewriteHeader(pathname: string): boolean {
  if (pathname.startsWith("/my-lesson/")) return true;
  if (pathname === "/my-lesson") return true;
  if (pathname.startsWith("/e-contract/")) return true;
  if (pathname === "/e-contract") return true;
  if (pathname.startsWith("/api/e-contract/")) return true;
  if (pathname === "/api/client-errors") return true;
  if (pathname === "/api/admin-profile") return true;
  if (pathname.startsWith(`${ADMIN_ASSET_PREFIX}/`)) return true;
  if (pathname.startsWith("/images/logo/")) return true;
  if (pathname.startsWith("/icons/")) return true;
  if (pathname === "/manifest.json") return true;
  return false;
}
