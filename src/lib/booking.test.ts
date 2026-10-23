import assert from "node:assert/strict";
import {
  buildNotes,
  hasDuplicateBooking,
  normalizePhone,
  slotsOverlap,
  slotIsFull,
  toAdminPayload,
  validateBookingInput,
  type BookingInput,
} from "./booking";

function sample(overrides: Partial<BookingInput> = {}): BookingInput {
  return {
    customerName: "홍길동",
    customerPhone: "010-1234-5678",
    participants: 2,
    childCount: 1,
    skiResort: "하이원리조트",
    lessonType: "ski",
    lessonDate: "2099-01-15",
    slotId: "am2",
    notes: "처음 타요",
    ...overrides,
  };
}

assert.equal(normalizePhone("010-1234-5678"), "01012345678");
assert.equal(slotsOverlap(9, 2, 10, 2), true);
assert.equal(slotsOverlap(9, 2, 11, 2), false);
assert.equal(slotsOverlap(13, 4, 15, 2), true);
assert.equal(slotsOverlap(9, 2, 13, 2), false);

assert.equal(validateBookingInput(sample()), null);
assert.match(validateBookingInput(sample({ customerName: "김" })) || "", /이름/);
assert.match(validateBookingInput(sample({ customerPhone: "123" })) || "", /휴대폰/);
assert.match(validateBookingInput(sample({ childCount: 3, participants: 2 })) || "", /아이/);
assert.match(validateBookingInput(sample({ lessonDate: "2001-01-01" })) || "", /날짜/);

const payload = toAdminPayload(sample(), "WEB_TEST");
assert.equal(payload.customer_phone, "01012345678");
assert.equal(payload.ski_resort, "하이원리조트");
assert.equal(payload.lesson_start_hour, 9);
assert.equal(payload.lesson_duration_hours, 2);
assert.equal(payload.payment_status, "pending");
assert.equal(payload.reservation_status, "pending");
assert.equal(payload.payment_method, "etc");
assert.match(payload.notes, /홈페이지 예약/);
assert.match(buildNotes(sample()), /아이 1명/);

const existing = [
  {
    customer_phone: "01012345678",
    ski_resort: "하이원리조트",
    lesson_start_hour: 9,
    lesson_duration_hours: 2,
    reservation_status: "pending",
  },
  {
    customer_phone: "01099999999",
    ski_resort: "하이원리조트",
    lesson_start_hour: 9,
    lesson_duration_hours: 2,
    reservation_status: "cancelled",
  },
];

assert.equal(hasDuplicateBooking(existing, "010-1234-5678", 9, 2), true);
assert.equal(hasDuplicateBooking(existing, "010-1234-5678", 13, 2), false);
assert.equal(slotIsFull(existing, "하이원리조트", 9, 2, 1), true);
assert.equal(slotIsFull(existing, "하이원리조트", 9, 2, 2), false);

console.log("booking tests passed");
