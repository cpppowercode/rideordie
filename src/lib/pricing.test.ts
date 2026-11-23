import assert from "node:assert/strict";
import { payBreakdown } from "./badge-fee";
import {
  DEFAULT_SETTINGS,
  earlyBirdFromCopy,
  headlineCopy,
  isLessonScheduleOpen,
  kstDate,
  lessonPrice,
  normalizeSettings,
  saleTable,
  listTable,
  PriceError,
} from "./pricing";

const S = DEFAULT_SETTINGS;
assert.deepEqual(S, { seasonStart: null, seasonEnd: null });

// 날짜와 무관하게 항상 세일 가격 적용
const testDates = ["2026-11-23", "2026-11-27", "2026-12-06", "2026-12-07", "2027-02-15"];
for (const ymd of testDates) {
  assert.equal(lessonPrice(ymd, 1, 2, S).amount, 140000, ymd);
  assert.equal(lessonPrice(ymd, 2, 3, S).amount, 270000, ymd);
  assert.equal(lessonPrice(ymd, 3, 4, S).amount, 440000, ymd);
  assert.equal(payBreakdown({ skiResort: "비발디파크", participants: 2, durationHours: 3, lessonDate: ymd }, S).total, 270000 + 2 * 3 * 12500, ymd);
  assert.equal(payBreakdown({ skiResort: "지산포레스트", participants: 3, durationHours: 2, lessonDate: ymd }, S).total, 220000 + 3 * 35000, ymd);
}

// KST 날짜 변환
assert.equal(kstDate(new Date("2026-12-06T14:59:00Z")), "2026-12-06");
assert.equal(kstDate(new Date("2026-12-06T15:00:00Z")), "2026-12-07");

assert.deepEqual(saleTable()["1:1"], { 2: 140000, 3: 210000, 4: 280000 });
assert.deepEqual(listTable()["1:1"], { 2: 150000, 3: 240000, 4: 290000 });

assert.equal(headlineCopy(), "1:1 2시간 14만원");
assert.equal(earlyBirdFromCopy(), "얼리버드 14만원부터");

// 기본(오픈일 미설정) → 즉시 오픈. 오늘·11/27~29 포함.
assert.equal(isLessonScheduleOpen("2026-11-23", S), true);
assert.equal(isLessonScheduleOpen("2026-11-27", S), true);
assert.equal(isLessonScheduleOpen("2026-11-29", S), true);
assert.equal(isLessonScheduleOpen("2026-12-20", S), true);

// 어드민이 오픈일을 명시한 경우에만 그 미만을 막음
const gated = { seasonStart: "2026-12-07", seasonEnd: null };
assert.equal(isLessonScheduleOpen("2026-11-23", gated), false);
assert.equal(isLessonScheduleOpen("2026-12-07", gated), true);

// 깨진 값·null → 즉시 오픈 기본값
assert.deepEqual(normalizeSettings({ seasonStart: "2026-13-40" }), S);
assert.deepEqual(normalizeSettings(null), S);
assert.deepEqual(normalizeSettings({ seasonStart: "2026-12-07", seasonEnd: "2026-01-01" }), {
  seasonStart: "2026-12-07",
  seasonEnd: null,
});

assert.throws(() => lessonPrice("2026-12-10", 4, 2, S), PriceError);
assert.throws(() => lessonPrice("2026-12-10", 1, 5, S), PriceError);
console.log("pricing tests passed");

import { allowedRatios, assertResortRatio } from "./pricing";
assert.deepEqual(allowedRatios("용평리조트"), ["1:1", "2:1"]);
assert.deepEqual(allowedRatios("하이원리조트"), ["1:1", "2:1", "3:1"]);
assert.throws(() => assertResortRatio("용평리조트", 3), /용평은 1:1·2:1/);
assert.doesNotThrow(() => assertResortRatio("용평리조트", 2));
console.log("yongpyong ratio tests passed");
