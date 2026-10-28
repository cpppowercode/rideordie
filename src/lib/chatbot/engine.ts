/**
 * 챗봇 답변 순서: (1) 프리셋 → 고정 답변 (2) 요금 기준일 질문 → 카톡 (3) 사용 제한 (4) AI 또는 목업 (5) 출력 필터.
 * 스트리밍하지 않는다(필터를 통과한 답만 보여 주기 위해).
 * 유료 호출은 AI_GATEWAY_API_KEY 와 CHATBOT_ALLOW_PAID=1 이 모두 있을 때만. 아니면 목업(키워드 → 고정 답변).
 */
import { type SeasonSettings, kstToday, periodFor } from "@/lib/pricing";
import { buildKnowledge, KAKAO_LINE, systemInstructions } from "./knowledge";
import { filterAnswer, SAFE_FALLBACK } from "./filter";
import { BASIS_ANSWER, BASIS_QUESTION, presetAnswer, type PresetId } from "./presets";
import { LIMIT_MESSAGE, MODEL_ID, type UsageLimiter } from "./limits";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type ChatReply = { text: string; via: "preset" | "rule" | "ai" | "mock" | "limit" | "filtered"; reason?: string };
export type AiCall = (args: { instructions: string; messages: ChatTurn[] }) => Promise<{ text: string; inputTokens: number; outputTokens: number }>;

const KEYWORDS: [RegExp, PresetId][] = [
  [/용평/, "yongpyong"], [/하이원/, "high1"], [/비발디/, "vivaldi"], [/웰리|힐리/, "welli"], [/지산/, "jisan"],
  [/환불|취소|위약/, "refund"], [/준비물|렌탈|렌털|장비|복장|옷/, "gear"], [/단체|가족|형제|친구|여러\s*명/, "group"],
  [/예약|결제|접수|신청/, "booking"], [/가격|요금|얼마|비용|금액|얼리|특가/, "price"],
];
export function mockAnswer(q: string, s: SeasonSettings, now: Date): string {
  for (const [re, id] of KEYWORDS) if (re.test(q)) return presetAnswer(id, s, now)!;
  return `그 부분은 제가 정확히 안내하기 어려워요. ${KAKAO_LINE}`;
}

export function paidAllowed(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.AI_GATEWAY_API_KEY) && env.CHATBOT_ALLOW_PAID === "1";
}

export async function answer(
  input: { question?: string; presetId?: string; history?: ChatTurn[]; sessionId: string },
  deps: { settings: SeasonSettings; limiter: UsageLimiter; now?: Date; ai?: AiCall | null },
): Promise<ChatReply> {
  const now = deps.now ?? new Date();
  if (input.presetId) {
    const t = presetAnswer(input.presetId, deps.settings, now);
    return t ? { text: t, via: "preset" } : { text: SAFE_FALLBACK, via: "rule", reason: "unknown preset" };
  }
  const q = String(input.question || "").trim().slice(0, 300);
  if (!q) return { text: "궁금한 점을 적어 주세요.", via: "rule" };
  if (BASIS_QUESTION.test(q)) return { text: BASIS_ANSWER, via: "rule", reason: "basis" };
  const blocked = deps.limiter.check(input.sessionId, now);
  if (blocked) return { text: `${LIMIT_MESSAGE[blocked]} ${KAKAO_LINE}`, via: "limit", reason: blocked };
  deps.limiter.record(input.sessionId, now);
  let raw: string; let via: ChatReply["via"];
  if (deps.ai) {
    const knowledge = buildKnowledge(periodFor(kstToday(now), deps.settings), deps.settings);
    const history = (input.history ?? []).slice(-6).map((t) => ({ role: t.role, content: String(t.content).slice(0, 600) }));
    try {
      const r = await deps.ai({ instructions: systemInstructions(knowledge), messages: [...history, { role: "user", content: q }] });
      deps.limiter.addUsage(r.inputTokens, r.outputTokens, now);
      raw = r.text; via = "ai";
    } catch {
      return { text: SAFE_FALLBACK, via: "rule", reason: "ai_error" };
    }
  } else {
    raw = mockAnswer(q, deps.settings, now); via = "mock";
  }
  const f = filterAnswer(raw);
  return f.ok ? { text: f.text, via } : { text: f.text, via: "filtered", reason: f.reason };
}

/** 실제 AI 호출(AI SDK → Vercel AI Gateway). paidAllowed() 일 때만 만든다. */
export async function gatewayAi(): Promise<AiCall> {
  const { generateText } = await import("ai");
  return async ({ instructions, messages }) => {
    const r = await generateText({ model: MODEL_ID, instructions, messages, maxOutputTokens: 350, temperature: 0.2 } as never);
    return { text: r.text, inputTokens: r.usage?.inputTokens ?? 0, outputTokens: r.usage?.outputTokens ?? 0 };
  };
}
