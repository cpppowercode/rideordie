import assert from "node:assert/strict";
import { filterAnswer, SAFE_FALLBACK } from "./filter";
import { presetAnswer, PRESETS, BASIS_QUESTION } from "./presets";
import { UsageLimiter, costUsd } from "./limits";
import { parseChatbotSettings, getChatbotSettings } from "./settings";
import { answer, mockAnswer, paidAllowed } from "./engine";
import { buildKnowledge, systemInstructions } from "./knowledge";
import { DEFAULT_SETTINGS, EARLY_TABLE, REGULAR_TABLE } from "@/lib/pricing";

const S = DEFAULT_SETTINGS;
const EARLY = new Date("2026-11-01T03:00:00Z"), REG = new Date("2027-01-10T03:00:00Z"), LATE = new Date("2027-02-20T03:00:00Z");

// 출력 필터: 금지 항목은 답 전체를 안전 문구로
const bad = [
  "전화 010-1234-5678 로 주세요", "대표번호 1588-1234", "OO도 가나군 다라면 마바길 12 에서 만나요", "서울시 가나구 다라로 3", "메일 a@b.com",
  "박강후 대표가 직접", "만 5세 이상만 가능해요", "6세부터 가능합니다", "숙소·리프트권·장비 별도입니다", "리프트권은 별도예요",
  "마감 임박! 서두르세요", "강사료는 내부 기준으로", "예약이 확정됐어요", "결제가 완료되었습니다", "강사님 연락처 알려드릴게요",
  "https://evil.example.com 참고",
];
for (const b of bad) { const r = filterAnswer(b); assert.equal(r.ok, false, b); assert.equal(r.text, SAFE_FALLBACK); }
for (const g of ["1:1 2시간 15만원이에요.", "자세한 건 https://pf.kakao.com/_xfWMxaG 로", "예약은 rideordie.kr/book 에서 해요.", "결제하면 예약이 접수돼요."]) assert.equal(filterAnswer(g).ok, true, g);

// 프리셋 10개, 고정 답변 전부 필터 통과
assert.deepEqual(PRESETS.map((p) => p.label), ["가격", "예약·결제", "하이원", "비발디", "웰리힐리", "용평", "지산", "환불", "준비물·렌탈", "단체·가족"]);
for (const p of PRESETS) for (const d of [EARLY, REG, LATE]) assert.equal(filterAnswer(presetAnswer(p.id, S, d)!).ok, true, p.id);

// 가격은 날짜별 요금표(pricing.ts)에서
const man = (n: number) => `${n / 10000}만원`;
assert.ok(presetAnswer("price", S, EARLY)!.includes(`1:1 2시간 ${man(EARLY_TABLE["1:1"][2])}`));
assert.ok(presetAnswer("price", S, EARLY)!.includes("얼리버드"));
assert.ok(presetAnswer("price", S, REG)!.includes(`1:1 2시간 ${man(REGULAR_TABLE["1:1"][2])}`));
assert.ok(presetAnswer("price", S, LATE)!.includes("시즌말 특가"));

// 용평 1:1·2:1만
const y = presetAnswer("yongpyong", S, REG)!;
assert.ok(/1:1과 2:1/.test(y)); assert.ok(!/^3:1 /m.test(y)); assert.ok(/^3:1 /m.test(presetAnswer("high1", S, REG)!));
assert.ok(mockAnswer("용평 3:1 돼요?", S, REG).includes("3:1은 없어요"));
// 패찰비는 비발디·지산만
assert.ok(/패찰비는 없어요/.test(presetAnswer("high1", S, REG)!) && /패찰비는 없어요/.test(presetAnswer("welli", S, REG)!));
assert.ok(/12,500/.test(presetAnswer("vivaldi", S, REG)!) && /35,000/.test(presetAnswer("jisan", S, REG)!));

// 얼리버드 기준일은 말하지 않음 → 카톡
for (const q of ["얼리버드는 예약일 기준인가요?", "강습일 기준으로 적용돼요?", "결제일 기준이에요?", "시즌말 특가 날짜 기준이 뭐예요"]) assert.ok(BASIS_QUESTION.test(q), q);
assert.ok(!BASIS_QUESTION.test("지산 가격 알려주세요"));
const kn = systemInstructions(buildKnowledge("early", S));
assert.ok(!/강습 날짜 기준|예약 날짜 기준|예약일 기준/.test(kn));
assert.ok(!/만\s*5세|박강후|010-/.test(kn));
assert.ok(/용평은 1:1과 2:1만/.test(kn) && /패찰비는 비발디와 지산에만/.test(kn));

// 제한
const L = new UsageLimiter({ perSession10m: 2, perSessionDay: 3, globalDay: 100, monthlyTokenCap: 1000, monthlyUsdCap: 1 });
const t0 = new Date("2026-11-01T00:00:00Z");
L.record("a", t0); L.record("a", t0); assert.equal(L.check("a", t0), "session_burst");
const t1 = new Date(t0.getTime() + 11 * 60e3); assert.equal(L.check("a", t1), null); L.record("a", t1); assert.equal(L.check("a", new Date(t1.getTime() + 11 * 60e3)), "session_day");
assert.equal(L.check("b", t1), null); L.addUsage(900, 200, t1); assert.equal(L.check("b", t1), "monthly_cap");
assert.equal(L.check("b", new Date("2026-12-01T00:00:00Z")), null, "다음 달 초기화");
assert.equal(costUsd(1_000_000, 1_000_000), 1.75);

(async () => {
  // 설정: 기본 OFF, 실패 시 OFF
  assert.equal(parseChatbotSettings(null), false); assert.equal(parseChatbotSettings({ data: { enabled: "true" } }), false); assert.equal(parseChatbotSettings({ data: { enabled: true } }), true);
  const saved = { ...process.env }; delete process.env.CHATBOT_PREVIEW; delete process.env.SEASON_SETTINGS_OFFLINE;
  assert.deepEqual(await getChatbotSettings((async () => { throw new Error("down"); }) as never), { enabled: false, source: "fallback" });
  assert.deepEqual(await getChatbotSettings((async () => new Response("x", { status: 500 })) as never), { enabled: false, source: "fallback" });
  process.env.CHATBOT_PREVIEW = "1"; process.env.VERCEL_ENV = "production";
  assert.equal((await getChatbotSettings((async () => { throw new Error(); }) as never)).enabled, false, "운영에서는 미리보기 무시");
  process.env = saved;
  // 유료 호출 조건
  assert.equal(paidAllowed({ AI_GATEWAY_API_KEY: "x" }), false); assert.equal(paidAllowed({}), false); assert.equal(paidAllowed({ AI_GATEWAY_API_KEY: "x", CHATBOT_ALLOW_PAID: "1" }), true);
  // 엔진: AI 가 금지 답을 내면 필터, 기준일 질문은 AI 안 거침
  let called = 0;
  const ai = async () => { called++; return { text: "예약이 확정됐어요! 010-0000-0000", inputTokens: 10, outputTokens: 5 }; };
  const deps = { settings: S, limiter: new UsageLimiter(), now: REG, ai };
  assert.equal((await answer({ question: "예약 됐나요", sessionId: "s" }, deps)).via, "filtered");
  assert.equal((await answer({ question: "얼리버드는 예약일 기준인가요?", sessionId: "s" }, deps)).via, "rule");
  assert.equal((await answer({ presetId: "price", sessionId: "s" }, deps)).via, "preset");
  assert.equal(called, 1);
  assert.equal((await answer({ question: "주차는 어디에 해요?", sessionId: "s" }, { settings: S, limiter: new UsageLimiter(), now: REG })).via, "mock");
  console.log("chatbot tests passed");
})().catch((e) => { console.error(e); process.exit(1); });
