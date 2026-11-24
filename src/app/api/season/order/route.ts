import { NextResponse } from "next/server";
import { checkSeasonOrder } from "@/lib/season";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import { enforceRateLimit, readJsonBody } from "@/lib/security/request";

// 금액은 옵션 ID로만 서버에서 계산한다. 가격이 없는 옵션은 409로 막는다.
// 가격이 확정되면 /api/bookings 와 같은 KCP 흐름(res_cd 0000·거래번호·금액 일치 후 접수)에 연결한다.
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "seasonOrder", RATE_LIMITS.seasonOrder);
  if (limited) return limited;

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const checked = checkSeasonOrder(parsed.data ?? {});
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: checked.status });
  return NextResponse.json({ error: "시즌강습 결제는 아직 열리지 않았습니다." }, { status: 503 });
}
