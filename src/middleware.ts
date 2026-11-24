import { NextResponse, type NextRequest } from "next/server";
import {
  GUEST_REWRITE_HEADER,
  GUEST_REWRITE_TOKEN,
  shouldAttachGuestRewriteHeader,
} from "@/lib/guest-proxy";

/**
 * admin으로 rewrite 되는 손님 경로에만 마커 헤더를 붙인다.
 * admin은 이 헤더가 있을 때만 대체 IP 헤더를 신뢰하고, 307 리다이렉트를 건너뛴다.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!shouldAttachGuestRewriteHeader(pathname)) {
    return NextResponse.next();
  }

  const headers = new Headers(req.headers);
  headers.set(GUEST_REWRITE_HEADER, GUEST_REWRITE_TOKEN);
  // 외부 rewrite 응답이 CDN에 캐시되지 않도록 (개인정보 페이지)
  headers.set("x-vercel-enable-rewrite-caching", "0");

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/my-lesson",
    "/my-lesson/:path*",
    "/e-contract",
    "/e-contract/:path*",
    "/api/e-contract/:path*",
    "/api/client-errors",
    "/api/admin-profile",
    "/rod-a/:path*",
    "/images/logo/:path*",
    "/icons/:path*",
    "/manifest.json",
  ],
};
