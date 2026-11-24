import { NextRequest, NextResponse } from "next/server";
import { lookupMyLessons } from "@/lib/my-lessons";
import { isAllowedRequestHost, requestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 간단 IP 레이트리밋 (인스턴스 메모리) */
const hits = new Map<string, { n: number; at: number }>();
const WINDOW_MS = 60_000;
const MAX_HITS = 20;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now - cur.at > WINDOW_MS) {
    hits.set(ip, { n: 1, at: now });
    return false;
  }
  cur.n += 1;
  return cur.n > MAX_HITS;
}

export async function POST(request: NextRequest) {
  try {
    const host = request.headers.get("host") || "";
    if (!isAllowedRequestHost(host, process.env)) {
      return NextResponse.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      customerName?: unknown;
      customerPhone?: unknown;
    };
    const customerName = String(body.customerName || "").slice(0, 80);
    const customerPhone = String(body.customerPhone || "").slice(0, 20);

    const result = await lookupMyLessons({ customerName, customerPhone });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // 조회 결과가 없어도 동일 응답 형태로 (존재 여부 열거 완화)
    return NextResponse.json({
      success: true,
      lessons: result.lessons,
      origin: requestOrigin(request.headers, process.env),
    });
  } catch (error) {
    console.error("[api/my-lessons]", error);
    return NextResponse.json(
      { error: "조회에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
