import assert from "node:assert/strict";
import { BadgeFeeError, computeBadgeFee, LESSON_FEE, payBreakdown } from "./badge-fee";

assert.equal(LESSON_FEE, 150000);
// 비발디: 인원 × 시간 × 12,500 (어드민 계산기)
assert.equal(computeBadgeFee("비발디파크", 1, 2), 25000);
assert.equal(computeBadgeFee("비발디파크", 2, 3), 75000);
assert.equal(computeBadgeFee("비발디파크", 3, 4), 150000);
// 웰리힐리: 2h 35,000 / 4h 50,000 (1인), 홀수는 다음 짝수
assert.equal(computeBadgeFee("웰리힐리파크", 1, 2), 35000);
assert.equal(computeBadgeFee("웰리힐리파크", 1, 3), 50000);
assert.equal(computeBadgeFee("웰리힐리파크", 2, 4), 100000);
// 나머지 리조트는 0
for (const r of ["하이원리조트", "용평리조트", "지산포레스트"]) assert.equal(computeBadgeFee(r, 2, 4), 0);
// 계산 불가 입력은 실패(결제 진행 금지)
assert.throws(() => computeBadgeFee("비발디파크", 0, 2), BadgeFeeError);
assert.throws(() => computeBadgeFee("웰리힐리파크", 1, Number.NaN), BadgeFeeError);
assert.throws(() => computeBadgeFee("비발디파크", 1.5, 2), BadgeFeeError);
// 합계
assert.deepEqual(payBreakdown({ skiResort: "비발디파크", participants: 1, durationHours: 2 }), { lessonFee: 150000, badgeFee: 25000, total: 175000 });
assert.deepEqual(payBreakdown({ skiResort: "하이원리조트", participants: 2, durationHours: 2 }), { lessonFee: 150000, badgeFee: 0, total: 150000 });
console.log("badge-fee tests passed");
