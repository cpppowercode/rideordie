/**
 * KCP 승인 → 어드민 접수 경로를 fetch 모킹으로 검증.
 * 운영 DB/어드민에 쓰지 않는다.
 */
import assert from "node:assert/strict";
import { createBookingIntent, readBookingIntent } from "./booking-intent";
import { payBreakdown } from "./badge-fee";
import { DEFAULT_SETTINGS } from "./pricing";

process.env.BOOKING_SIGNING_SECRET = process.env.BOOKING_SIGNING_SECRET || "test-signing-secret-32chars!!";
process.env.SEASON_SETTINGS_OFFLINE = "1";
process.env.ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN || "test-admin-token";

const input = {
  customerName: "테스트",
  customerPhone: "01000000000",
  participants: 1,
  childCount: 0,
  skiResort: "하이원리조트",
  lessonType: "ski",
  lessonDate: "2026-12-20",
  durationHours: 2,
  startHour: 9,
  notes: "finalize unit test",
};

const breakdown = payBreakdown(input, DEFAULT_SETTINGS);
assert.equal(breakdown.total, 140_000);
assert.equal(breakdown.badgeFee, 0);

const orderNo = `WEB_TEST_${Date.now()}`;
const intentToken = createBookingIntent(orderNo, breakdown.total, input);
const intent = readBookingIntent(intentToken);
assert.ok(intent);
assert.equal(intent!.orderNo, orderNo);
assert.equal(intent!.amount, 140_000);

// 웰리힐리 패찰비 포함 intent
const welliInput = { ...input, skiResort: "웰리힐리파크" };
const welli = payBreakdown(welliInput, DEFAULT_SETTINGS);
assert.equal(welli.badgeFee, 40_000);
assert.equal(welli.total, 180_000);
const welliToken = createBookingIntent(`WEB_WELLI_${Date.now()}`, welli.total, welliInput);
assert.equal(readBookingIntent(welliToken)?.amount, 180_000);

console.log("booking-finalize.test.ts: ok (intent+amount isolated, no admin write)");
