import assert from "node:assert/strict";
import { payBreakdown } from "./badge-fee";
import { DEFAULT_SETTINGS, headlineCopy, kstDate, lessonPrice, normalizeSettings, saleTable, listTable, PriceError } from "./pricing";

const S = DEFAULT_SETTINGS;
assert.deepEqual(S, { seasonStart: "2026-12-07", seasonEnd: null });

// 날짜와 무관하게 항상 세일 가격 적용
const testDates = ["2026-12-06", "2026-12-07", "2027-02-15", "2027-04-30"];
for (const ymd of testDates) {
  // 강습비는 항상 세일 가격
  assert.equal(lessonPrice(ymd, 1, 2, S).amount, 140000, ymd);
  assert.equal(lessonPrice(ymd, 2, 3, S).amount, 270000, ymd);
  assert.equal(lessonPrice(ymd, 3, 4, S).amount, 440000, ymd);
  // 결제 금액(강습 날짜 기준): 비발디 2:1 3h, 지산 3:1 2h
  assert.equal(payBreakdown({ skiResort: "비발디파크", participants: 2, durationHours: 3, lessonDate: ymd }, S).total, 270000 + 2 * 3 * 12500, ymd);
  assert.equal(payBreakdown({ skiResort: "지산포레스트", participants: 3, durationHours: 2, lessonDate: ymd }, S).total, 220000 + 3 * 35000, ymd);
}

// KST 날짜 변환
assert.equal(kstDate(new Date("2026-12-06T14:59:00Z")), "2026-12-06");
assert.equal(kstDate(new Date("2026-12-06T15:00:00Z")), "2026-12-07");

// 세일 가격표
assert.deepEqual(saleTable()["1:1"], { 2: 140000, 3: 210000, 4: 280000 });
assert.deepEqual(saleTable()["2:1"], { 2: 170000, 3: 270000, 4: 360000 });
assert.deepEqual(saleTable()["3:1"], { 2: 220000, 3: 330000, 4: 440000 });

// 정가표
assert.deepEqual(listTable()["1:1"], { 2: 150000, 3: 240000, 4: 290000 });
assert.deepEqual(listTable()["2:1"], { 2: 190000, 3: 300000, 4: 370000 });
assert.deepEqual(listTable()["3:1"], { 2: 240000, 3: 360000, 4: 470000 });

// 헤드라인 카피
assert.equal(headlineCopy(), "1:1 2시간 14만원");

// 어드민 값이 깨졌으면 기본값
assert.deepEqual(normalizeSettings({ seasonStart: "2026-13-40" }), S);
assert.deepEqual(normalizeSettings(null), S);
assert.deepEqual(normalizeSettings({ seasonStart: "2026-12-07", seasonEnd: "2026-01-01" }), S);

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
