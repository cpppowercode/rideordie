import assert from "node:assert/strict";
import {
  buildNotes,
  formatPhoneDisplay,
  hasDuplicateBooking,
  normalizePhone,
  slotsOverlap,
  slotIsFull,
  toAdminPayload,
  validateBookingInput,
  type BookingInput,
} from "./booking";
import { notifyChannelStatus } from "./notify";
import {
  GROOMING_BREAKS,
  GROOMING_LABEL,
  formatGroomingHour,
  slotOverlapsGrooming,
} from "./grooming";
import { LESSON_SLOTS, SKI_RESORTS } from "./site";

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
assert.equal(formatPhoneDisplay("01000000000"), "010-0000-0000");
assert.equal(validateBookingInput(sample({ customerName: "테스트 예약 (삭제 예정)", customerPhone: "010-0000-0000" })), null);
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

assert.equal(SKI_RESORTS.every((resort) => resort.value in GROOMING_BREAKS), true);
assert.equal(GROOMING_LABEL, "정설 시간");
assert.equal(formatGroomingHour(16), "16:00");
assert.equal(formatGroomingHour(16.5), "16:30");
assert.equal(formatGroomingHour(17.5), "17:30");

assert.equal(slotOverlapsGrooming("하이원리조트", 13, 4), true); // pm4 13–17 overlaps 16–18
assert.equal(slotOverlapsGrooming("하이원리조트", 18, 2), false); // night2 starts when grooming ends
assert.equal(slotOverlapsGrooming("하이원리조트", 9, 2), false);
assert.equal(slotOverlapsGrooming("비발디파크", 18, 2), true); // 17:30–19:00 vs 18–20
assert.equal(slotOverlapsGrooming("비발디파크", 13, 4), false);
assert.equal(slotOverlapsGrooming("용평리조트", 18, 2), true);
assert.equal(slotOverlapsGrooming("용평리조트", 13, 4), false); // pm4 ends at 17:00
assert.equal(slotOverlapsGrooming("지산포레스트", 18, 2), true);
assert.equal(slotOverlapsGrooming("오투리조트", 13, 4), true); // 16:30–18:00 vs 13–17
assert.equal(slotOverlapsGrooming("오투리조트", 18, 2), false);
assert.equal(slotOverlapsGrooming("웰리힐리파크", 18, 2), true);
assert.equal(slotOverlapsGrooming("웰리힐리파크", 13, 4), true);
assert.equal(slotOverlapsGrooming("곤지암리조트", 18, 2), true);
assert.equal(slotOverlapsGrooming("알파인미확인", 18, 2), true); // default 17–19

const night2 = LESSON_SLOTS.find((slot) => slot.id === "night2");
assert.ok(night2);
assert.equal(slotOverlapsGrooming("비발디파크", night2.startHour, night2.durationHours), true);

const channels = notifyChannelStatus();
assert.deepEqual(
  channels.map((c) => c.name),
  ["email(Resend)", "slack", "discord", "solapi"]
);
assert.ok(channels.every((c) => typeof c.configured === "boolean"));

console.log("booking tests passed");
