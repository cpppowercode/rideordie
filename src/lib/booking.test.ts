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
import {
  formatLessonRange,
  generateLessonStarts,
  lessonFitsOperatingHours,
  RESORT_HOURS,
} from "./hours";
import { quoteLessonPrice } from "./pricing";
import { SKI_RESORTS } from "./site";

function sample(overrides: Partial<BookingInput> = {}): BookingInput {
  return {
    customerName: "홍길동",
    customerPhone: "010-1234-5678",
    participants: 2,
    childCount: 1,
    skiResort: "하이원리조트",
    lessonType: "ski",
    lessonDate: "2099-01-15",
    durationHours: 2,
    startHour: 9,
    notes: "처음 타요",
    ...overrides,
  };
}

function startHours(resort: string, duration: number): number[] {
  return generateLessonStarts(resort, duration).map((slot) => slot.startHour);
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
assert.match(validateBookingInput(sample({ skiResort: "오투리조트" })) || "", /스키장/);
assert.match(validateBookingInput(sample({ skiResort: "곤지암리조트" })) || "", /스키장/);
assert.match(validateBookingInput(sample({ durationHours: 5 })) || "", /강습 시간/);
assert.match(validateBookingInput(sample({ startHour: 20.5 })) || "", /운영 시간/);
assert.equal(SKI_RESORTS.some((resort) => resort.value === "오투리조트"), false);
assert.equal(SKI_RESORTS.some((resort) => resort.value === "곤지암리조트"), false);

const payload = toAdminPayload(sample(), "WEB_TEST");
assert.equal(payload.customer_phone, "01012345678");
assert.equal(payload.ski_resort, "하이원리조트");
assert.equal(payload.lesson_start_hour, 9);
assert.equal(payload.lesson_duration_hours, 2);
assert.equal(payload.lesson_time, "09:00~11:00");
assert.equal(payload.payment_status, "pending");
assert.equal(payload.reservation_status, "pending");
assert.equal(payload.payment_method, "app");
assert.equal(payload.amount, 170_000);
assert.doesNotMatch(payload.notes, /패찰비/);
assert.match(validateBookingInput(sample({ participants: 4 })) || "", /인원/);

const jisanQuote = quoteLessonPrice({
  durationHours: 2,
  participants: 2,
  lessonDate: "2099-01-15",
  skiResort: "지산포레스트",
});
assert.ok(jisanQuote);
const jisanPayload = toAdminPayload(sample({ skiResort: "지산포레스트" }), "WEB_JISAN");
assert.equal(jisanPayload.amount, jisanQuote.payableAmount);
assert.equal(jisanPayload.amount, jisanQuote.lessonAmount + jisanQuote.badgeFee);
if (jisanQuote.badgeFee > 0) {
  assert.match(jisanPayload.notes, /패찰비/);
} else {
  assert.doesNotMatch(jisanPayload.notes, /패찰비/);
}
assert.match(payload.notes, /홈페이지 예약/);
assert.match(payload.notes, /강습 2시간/);
assert.match(payload.notes, /09:00~11:00/);
assert.match(buildNotes(sample()), /아이 1명/);

const threeHour = toAdminPayload(sample({ durationHours: 3, startHour: 10 }), "WEB_3H");
assert.equal(threeHour.lesson_start_hour, 10);
assert.equal(threeHour.lesson_duration_hours, 3);
assert.equal(threeHour.lesson_time, "10:00~13:00");
assert.match(threeHour.notes, /강습 3시간/);
assert.match(threeHour.notes, /10:00~13:00/);

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
assert.equal(SKI_RESORTS.every((resort) => resort.value in RESORT_HOURS), true);
assert.equal(GROOMING_LABEL, "정설 시간");
assert.equal(formatGroomingHour(16), "16:00");
assert.equal(formatGroomingHour(16.5), "16:30");
assert.equal(formatGroomingHour(17.5), "17:30");
assert.equal(formatLessonRange(10, 3), "10:00~13:00");
assert.equal(formatLessonRange(18, 2), "18:00~20:00");
assert.equal(formatLessonRange(24, 2), "24:00~02:00");

assert.equal(slotOverlapsGrooming("하이원리조트", 13, 4), true); // 13–17 overlaps 16–18
assert.equal(slotOverlapsGrooming("하이원리조트", 18, 2), false); // starts when grooming ends
assert.equal(slotOverlapsGrooming("하이원리조트", 9, 2), false);
assert.equal(slotOverlapsGrooming("하이원리조트", 14, 2), false); // ends exactly at 16:00
assert.equal(slotOverlapsGrooming("하이원리조트", 14.5, 2), true);
assert.equal(slotOverlapsGrooming("비발디파크", 18, 2), true); // 17:30–19:00 vs 18–20
assert.equal(slotOverlapsGrooming("비발디파크", 13, 4), false);
assert.equal(slotOverlapsGrooming("용평리조트", 18, 2), true);
assert.equal(slotOverlapsGrooming("용평리조트", 13, 4), false); // ends at 17:00
assert.equal(slotOverlapsGrooming("지산포레스트", 18, 2), true);
assert.equal(slotOverlapsGrooming("웰리힐리파크", 18, 2), true);
assert.equal(slotOverlapsGrooming("웰리힐리파크", 13, 4), true);
assert.equal(slotOverlapsGrooming("알파인미확인", 18, 2), true); // default 17–19

const high1Two = startHours("하이원리조트", 2);
assert.equal(high1Two.includes(9), true);
assert.equal(high1Two.includes(14), true);
assert.equal(high1Two.includes(14.5), false);
assert.equal(high1Two.includes(16), false);
assert.equal(high1Two.includes(18), true);
assert.equal(high1Two.includes(20), true);
assert.equal(high1Two.includes(20.5), false);
assert.equal(lessonFitsOperatingHours("하이원리조트", 20.5, 2), false);

for (let i = 1; i < high1Two.length; i += 1) {
  assert.ok(high1Two[i] - high1Two[i - 1] >= 0.5);
}
assert.equal(
  generateLessonStarts("하이원리조트", 2).every((slot, i, all) => {
    if (i === 0) return true;
    return Math.abs((slot.startHour - all[i - 1].startHour) * 2 - Math.round((slot.startHour - all[i - 1].startHour) * 2)) < 1e-9;
  }),
  true
);

const high1Four = startHours("하이원리조트", 4);
assert.equal(high1Four.includes(9), true);
assert.equal(high1Four.includes(12), true);
assert.equal(high1Four.includes(12.5), false);
assert.equal(high1Four.includes(13), false);
assert.equal(high1Four.includes(18), true);
assert.equal(high1Four.includes(18.5), false);

const vivaldiTwo = startHours("비발디파크", 2);
assert.equal(vivaldiTwo.includes(9), true);
assert.equal(vivaldiTwo.includes(15.5), true);
assert.equal(vivaldiTwo.includes(16), false);
assert.equal(vivaldiTwo.includes(18), false);
assert.equal(vivaldiTwo.includes(19), true);
assert.equal(startHours("비발디파크", 4).includes(13), true);

const jisanTwo = startHours("지산포레스트", 2);
assert.equal(jisanTwo.includes(18), false);
assert.equal(jisanTwo.includes(18.5), true);
assert.equal(jisanTwo.includes(24), true);

assert.equal(
  generateLessonStarts("하이원리조트", 3).some((slot) => slot.timeLabel === "10:00~13:00"),
  true
);

const channels = notifyChannelStatus();
assert.deepEqual(
  channels.map((c) => c.name),
  ["email(Resend)", "slack", "discord", "solapi"]
);
assert.ok(channels.every((c) => typeof c.configured === "boolean"));

console.log("booking tests passed");
