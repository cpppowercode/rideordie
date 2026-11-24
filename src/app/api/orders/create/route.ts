import { NextResponse } from "next/server";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import { enforceRateLimit } from "@/lib/security/request";

/**
 * 레거시 Toss 주문 API. 클라이언트 금액을 신뢰하고 개인정보를 에코하던 엔드포인트라
 * 비활성화한다. 활성 결제는 /api/bookings → KCP 경로만 사용한다.
 */
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "legacyOrders", RATE_LIMITS.legacyOrders);
  if (limited) return limited;

  return NextResponse.json(
    { error: "이 주문 API는 더 이상 사용할 수 없습니다. /api/bookings 를 이용해 주세요." },
    { status: 410 },
  );
}
