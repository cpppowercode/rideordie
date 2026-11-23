import assert from "node:assert/strict";
import { BadgeFeeError, computeBadgeFee, payBreakdown } from "./badge-fee";
const D = "2026-12-20";
assert.equal(computeBadgeFee("비발디파크", 1, 2), 25000);
assert.equal(computeBadgeFee("비발디파크", 2, 3), 75000);
assert.equal(computeBadgeFee("비발디파크", 3, 4), 150000);
assert.equal(computeBadgeFee("지산포레스트", 1, 2), 35000);
assert.equal(computeBadgeFee("지산포레스트", 1, 3), 50000);
assert.equal(computeBadgeFee("지산포레스트", 2, 4), 100000);
assert.equal(computeBadgeFee("지산포레스트", 1, 6), 85000);
// 웰리힐리: 1인 40,000원 (2·3·4시간 동일, 확정)
assert.equal(computeBadgeFee("웰리힐리파크", 1, 2), 40000);
assert.equal(computeBadgeFee("웰리힐리파크", 1, 3), 40000);
assert.equal(computeBadgeFee("웰리힐리파크", 1, 4), 40000);
assert.equal(computeBadgeFee("웰리힐리파크", 2, 3), 80000);
for (const r of ["하이원리조트", "용평리조트"]) {
  assert.equal(computeBadgeFee(r, 2, 4), 0);
}
assert.throws(() => computeBadgeFee("비발디파크", 0, 2), BadgeFeeError);
assert.throws(() => computeBadgeFee("지산포레스트", 1, Number.NaN), BadgeFeeError);
assert.throws(() => computeBadgeFee("비발디파크", 1.5, 2), BadgeFeeError);
assert.deepEqual(payBreakdown({ skiResort: "비발디파크", participants: 1, durationHours: 2, lessonDate: D }), { lessonFee: 140000, badgeFee: 25000, total: 165000 });
assert.deepEqual(payBreakdown({ skiResort: "지산포레스트", participants: 1, durationHours: 2, lessonDate: D }), { lessonFee: 140000, badgeFee: 35000, total: 175000 });
assert.deepEqual(payBreakdown({ skiResort: "웰리힐리파크", participants: 2, durationHours: 2, lessonDate: D }), { lessonFee: 170000, badgeFee: 80000, total: 250000 });
assert.deepEqual(payBreakdown({ skiResort: "웰리힐리파크", participants: 1, durationHours: 3, lessonDate: D }), { lessonFee: 210000, badgeFee: 40000, total: 250000 });
assert.deepEqual(payBreakdown({ skiResort: "웰리힐리파크", participants: 1, durationHours: 4, lessonDate: D }), { lessonFee: 280000, badgeFee: 40000, total: 320000 });
assert.deepEqual(payBreakdown({ skiResort: "하이원리조트", participants: 2, durationHours: 2, lessonDate: D }), { lessonFee: 170000, badgeFee: 0, total: 170000 });
assert.throws(() => payBreakdown({ skiResort: "비발디파크", participants: 4, durationHours: 2, lessonDate: D }), BadgeFeeError);
assert.equal(computeBadgeFee("지산포레스트", 1, 3), 50000);
assert.equal(computeBadgeFee("지산포레스트", 2, 3), 100000);
assert.equal(computeBadgeFee("지산포레스트", 1, 3), computeBadgeFee("지산포레스트", 1, 4));
assert.throws(() => payBreakdown({ skiResort: "용평리조트", participants: 3, durationHours: 2, lessonDate: D }), BadgeFeeError);
assert.equal(payBreakdown({ skiResort: "용평리조트", participants: 2, durationHours: 2, lessonDate: D }).total, 170000);
assert.equal(payBreakdown({ skiResort: "하이원리조트", participants: 3, durationHours: 2, lessonDate: D }).badgeFee, 0);
console.log("badge-fee tests passed");
