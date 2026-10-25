/**
 * 챗봇 사용 제한. AI 호출 전에 검사한다(프리셋·고정 답변은 비용 0 이라 세지 않음).
 * - 세션당: 10분 8회, 하루 30회 / 전체: 하루 1,500회
 * - 월 토큰·비용 상한: 넘으면 그 달은 AI 끔(카톡 안내만)
 * 저장소는 메모리(인스턴스별). 실제 운영 전 Upstash Redis 등 공유 저장소로 바꿔야 정확함(보고서 참고).
 */
export type LimitConfig = { perSession10m: number; perSessionDay: number; globalDay: number; monthlyTokenCap: number; monthlyUsdCap: number };
export const DEFAULT_LIMITS: LimitConfig = { perSession10m: 8, perSessionDay: 30, globalDay: 1500, monthlyTokenCap: 6_000_000, monthlyUsdCap: 10 };

/** 공식 단가(USD / 100만 토큰). Vercel AI Gateway 모델 목록 google/gemini-3.1-flash-lite, 2026-10-26 확인. */
export const MODEL_ID = "google/gemini-3.1-flash-lite";
export const PRICE_PER_M = { input: 0.25, output: 1.5 };
export function costUsd(inputTokens: number, outputTokens: number): number {
  return (inputTokens * PRICE_PER_M.input + outputTokens * PRICE_PER_M.output) / 1_000_000;
}

const kstDay = (d: Date) => new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10);

export class UsageLimiter {
  private hits = new Map<string, number[]>();
  private day = new Map<string, number>();
  private month = { key: "", tokens: 0, usd: 0 };
  constructor(private cfg: LimitConfig = DEFAULT_LIMITS) {}

  /** null 이면 통과, 아니면 사유. */
  check(sessionId: string, now: Date = new Date()): null | "session_burst" | "session_day" | "global_day" | "monthly_cap" {
    const t = now.getTime(); const d = kstDay(now); const m = d.slice(0, 7);
    if (this.month.key !== m) this.month = { key: m, tokens: 0, usd: 0 };
    if (this.month.tokens >= this.cfg.monthlyTokenCap || this.month.usd >= this.cfg.monthlyUsdCap) return "monthly_cap";
    if ((this.day.get(`g:${d}`) ?? 0) >= this.cfg.globalDay) return "global_day";
    if ((this.day.get(`s:${sessionId}:${d}`) ?? 0) >= this.cfg.perSessionDay) return "session_day";
    const recent = (this.hits.get(sessionId) ?? []).filter((x) => t - x < 10 * 60e3);
    this.hits.set(sessionId, recent);
    if (recent.length >= this.cfg.perSession10m) return "session_burst";
    return null;
  }
  record(sessionId: string, now: Date = new Date()): void {
    const d = kstDay(now);
    this.hits.set(sessionId, [...(this.hits.get(sessionId) ?? []), now.getTime()]);
    for (const k of [`g:${d}`, `s:${sessionId}:${d}`]) this.day.set(k, (this.day.get(k) ?? 0) + 1);
  }
  addUsage(inputTokens: number, outputTokens: number, now: Date = new Date()): void {
    const m = kstDay(now).slice(0, 7);
    if (this.month.key !== m) this.month = { key: m, tokens: 0, usd: 0 };
    this.month.tokens += inputTokens + outputTokens;
    this.month.usd += costUsd(inputTokens, outputTokens);
  }
  snapshot() { return { ...this.month }; }
}

export const LIMIT_MESSAGE: Record<string, string> = {
  session_burst: "질문이 많아 잠시 쉬어 갈게요. 몇 분 뒤 다시 물어봐 주세요.",
  session_day: "오늘 질문 가능 횟수를 다 쓰셨어요.",
  global_day: "오늘은 자동 상담이 많아 잠시 쉬고 있어요.",
  monthly_cap: "이번 달 자동 상담이 쉬고 있어요.",
};
