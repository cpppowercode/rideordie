import assert from "node:assert/strict";
import { payBreakdown } from "./badge-fee";
import { DEFAULT_SETTINGS, headlineCopy, kstDate, lessonPrice, normalizeSettings, periodFor, tableFor, PriceError } from "./pricing";

const S = DEFAULT_SETTINGS;
assert.deepEqual(S, { seasonStart: "2026-12-07", seasonEnd: null });

// 경계 시각(KST) → 기간 → 표·문구·결제 금액이 함께 바뀌는지
const cases: [string, "early" | "regular" | "late", string, number][] = [
  ["2026-12-06T23:59:00+09:00", "early", "얼리버드 14만원부터", 140000],
  ["2026-12-07T00:00:00+09:00", "regular", "1:1 2시간 15만원부터", 150000],
  ["2027-02-14T23:59:00+09:00", "regular", "1:1 2시간 15만원부터", 150000],
  ["2027-02-15T00:00:00+09:00", "late", "시즌말 특가 14만원부터", 140000],
];
for (const [iso, period, headline, oneToOne2h] of cases) {
  const ymd = kstDate(new Date(iso));
  const p = periodFor(ymd, S);
  assert.equal(p, period, iso);
  assert.equal(headlineCopy(p), headline, iso);
  assert.equal(tableFor(p)["1:1"][2], oneToOne2h, iso);
  // 결제 금액(강습 날짜 기준): 비발디 2:1 3h, 지산 3:1 2h
  const lesson23 = tableFor(p)["2:1"][3];
  assert.equal(payBreakdown({ skiResort: "비발디파크", participants: 2, durationHours: 3, lessonDate: ymd }, S).total, lesson23 + 2 * 3 * 12500, iso);
  const lesson32 = tableFor(p)["3:1"][2];
  assert.equal(payBreakdown({ skiResort: "지산포레스트", participants: 3, durationHours: 2, lessonDate: ymd }, S).total, lesson32 + 3 * 35000, iso);
}
assert.equal(kstDate(new Date("2026-12-06T14:59:00Z")), "2026-12-06");
assert.equal(kstDate(new Date("2026-12-06T15:00:00Z")), "2026-12-07");

// 전체 표
assert.deepEqual(tableFor("early")["2:1"], { 2: 170000, 3: 250000, 4: 330000 });
assert.deepEqual(tableFor("early")["3:1"], { 2: 210000, 3: 300000, 4: 390000 });
assert.deepEqual(tableFor("regular")["1:1"], { 2: 150000, 3: 220000, 4: 290000 });
assert.deepEqual(tableFor("regular")["2:1"], { 2: 180000, 3: 270000, 4: 350000 });
assert.deepEqual(tableFor("regular")["3:1"], { 2: 210000, 3: 310000, 4: 400000 });
assert.equal(tableFor("late"), tableFor("early"));

// 종료일 미정: 2/15 이후 계속 시즌말 특가. 종료일 설정 시 다음날부터 일반.
assert.equal(periodFor("2027-04-30", S), "late");
const withEnd = normalizeSettings({ seasonStart: "2026-12-07", seasonEnd: "2027-03-15" });
assert.equal(periodFor("2027-03-15", withEnd), "late");
assert.equal(periodFor("2027-03-16", withEnd), "regular");
// 어드민 값이 깨졌으면 기본값
assert.deepEqual(normalizeSettings({ seasonStart: "2026-13-40" }), S);
assert.deepEqual(normalizeSettings(null), S);
assert.deepEqual(normalizeSettings({ seasonStart: "2026-12-07", seasonEnd: "2026-01-01" }), S);
// 어드민에서 시작일 변경
assert.equal(periodFor("2026-12-10", normalizeSettings({ seasonStart: "2026-12-14" })), "early");

// 선택지 밖은 실패
assert.throws(() => lessonPrice("2026-12-10", 4, 2, S), PriceError);
assert.throws(() => lessonPrice("2026-12-10", 1, 5, S), PriceError);
console.log("pricing tests passed");

// 용평 3:1 불가
import { allowedRatios, assertResortRatio } from "./pricing";
assert.deepEqual(allowedRatios("용평리조트"), ["1:1", "2:1"]);
assert.deepEqual(allowedRatios("하이원리조트"), ["1:1", "2:1", "3:1"]);
assert.throws(() => assertResortRatio("용평리조트", 3), /용평은 1:1·2:1/);
assert.doesNotThrow(() => assertResortRatio("용평리조트", 2));
console.log("yongpyong ratio tests passed");
