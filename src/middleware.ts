import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  extractAttributionFromUrl, 
  isDirect, 
  parseAttributionCookie, 
  serializeAttributionCookie 
} from '@/lib/attribution';
import { ATTRIBUTION_COOKIE_NAME, ATTRIBUTION_EXPIRY_DAYS } from '@/types/attribution';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const referrer = request.headers.get('referer') || '';
  
  // 어트리뷰션 데이터 추출
  const newSource = extractAttributionFromUrl(url, referrer);
  
  // 기존 쿠키 읽기
  const existingCookie = request.cookies.get(ATTRIBUTION_COOKIE_NAME)?.value;
  const existing = parseAttributionCookie(existingCookie);
  
  let first = existing.first;
  let last = existing.last;
  let updated = false;
  
  // First-touch: 쿠키가 없고 새 소스가 있으면 설정
  if (!first && newSource) {
    first = newSource;
    updated = true;
  }
  
  // Last-touch: 새 소스가 있으면 항상 업데이트
  // (last_non_direct 모델: direct가 아닌 경우에만 업데이트)
  if (newSource && !isDirect(newSource)) {
    last = newSource;
    updated = true;
  }
  
  const response = NextResponse.next();
  
  // 쿠키 업데이트
  if (updated) {
    const cookieValue = serializeAttributionCookie({ first, last });
    const maxAge = ATTRIBUTION_EXPIRY_DAYS * 24 * 60 * 60;
    
    response.cookies.set(ATTRIBUTION_COOKIE_NAME, cookieValue, {
      maxAge,
      path: '/',
      httpOnly: false, // 클라이언트에서도 읽을 수 있어야 함
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 대해 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
