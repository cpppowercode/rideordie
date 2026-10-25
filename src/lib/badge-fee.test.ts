import assert from "node:assert/strict";
import { BadgeFeeError, computeBadgeFee, payBreakdown } from "./badge-fee";
const D = "2026-12-20"; // 일반 요금 기간
// 비발디: 인원 × 시간 × 12,500 (어드민 계산기)
assert.equal(computeBadgeFee("비발디파크", 1, 2), 25000);
assert.equal(computeBadgeFee("비발디파크", 2, 3), 75000);
assert.equal(computeBadgeFee("비발디파크", 3, 4), 150000);
// 지산: 2h 35,000 / 4h 50,000 / 6h 85,000 (1인), 홀수는 다음 짝수
assert.equal(computeBadgeFee("지산포레스트", 1, 2), 35000);
assert.equal(computeBadgeFee("지산포레스트", 1, 3), 50000);
assert.equal(computeBadgeFee("지산포레스트", 2, 4), 100000);
assert.equal(computeBadgeFee("지산포레스트", 1, 6), 85000);
// 나머지 리조트는 0 (웰리힐리, 하이원, 용평)
for (const r of ["웰리힐리파크", "하이원리조트", "용평리조트"]) assert.equal(computeBadgeFee(r, 2, 4), 0);
// 계산 불가 입력은 실패(결제 진행 금지)
assert.throws(() => computeBadgeFee("비발디파크", 0, 2), BadgeFeeError);
assert.throws(() => computeBadgeFee("지산포레스트", 1, Number.NaN), BadgeFeeError);
assert.throws(() => computeBadgeFee("비발디파크", 1.5, 2), BadgeFeeError);
// 합계
assert.deepEqual(payBreakdown({ skiResort: "비발디파크", participants: 1, durationHours: 2, lessonDate: D }), { lessonFee: 150000, badgeFee: 25000, total: 175000, period: "regular" });
assert.deepEqual(payBreakdown({ skiResort: "지산포레스트", participants: 1, durationHours: 2, lessonDate: D }), { lessonFee: 150000, badgeFee: 35000, total: 185000, period: "regular" });
assert.deepEqual(payBreakdown({ skiResort: "웰리힐리파크", participants: 2, durationHours: 2, lessonDate: D }), { lessonFee: 180000, badgeFee: 0, total: 180000, period: "regular" });
assert.deepEqual(payBreakdown({ skiResort: "하이원리조트", participants: 2, durationHours: 2, lessonDate: D }), { lessonFee: 180000, badgeFee: 0, total: 180000, period: "regular" });
assert.throws(() => payBreakdown({ skiResort: "비발디파크", participants: 4, durationHours: 2, lessonDate: D }), BadgeFeeError);
// 사장님 결정 10/26: 용평은 3:1 불가(1:1·2:1만). 금액 계산(=예약 생성·KCP 등록·최종 확정 공통)에서 거절.
assert.throws(() => payBreakdown({ skiResort: "용평리조트", participants: 3, durationHours: 2, lessonDate: D }), BadgeFeeError);
assert.equal(payBreakdown({ skiResort: "용평리조트", participants: 2, durationHours: 2, lessonDate: D }).total, 180000);
assert.equal(payBreakdown({ skiResort: "하이원리조트", participants: 3, durationHours: 2, lessonDate: D }).badgeFee, 0);
console.log("badge-fee tests passed");
