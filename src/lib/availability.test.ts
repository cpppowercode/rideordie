import assert from "node:assert/strict";
import {
  computeAvailabilitySlots,
  publicAvailabilityErrorMessage,
} from "./availability";

const high1 = "하이원리조트";

const empty = computeAvailabilitySlots({
  skiResort: high1,
  durationHours: 4,
  existing: [],
  capacity: 6,
});
assert.ok(empty.length > 0);
assert.equal(empty.every((s) => s.remaining === 6 && s.available), true);
assert.ok(empty.some((s) => s.startHour === 9));
assert.ok(empty.some((s) => s.startHour === 18));
assert.equal(empty.some((s) => s.startHour === 13), false); // 정설 겹침

const booked = computeAvailabilitySlots({
  skiResort: high1,
  durationHours: 4,
  capacity: 2,
  existing: [
    {
      ski_resort: "하이원리조트",
      lesson_start_hour: 9,
      lesson_duration_hours: 4,
      reservation_status: "pending",
    },
    {
      ski_resort: "하이원",
      lesson_start_hour: 10,
      lesson_duration_hours: 2,
      reservation_status: "confirmed",
    },
  ],
});
const nine = booked.find((s) => s.startHour === 9)!;
assert.equal(nine.used, 2);
assert.equal(nine.remaining, 0);
assert.equal(nine.available, false);

// 다른 스키장·취소 건은 잔여에 넣지 않는다 (스노프로 등 다른 테넌트 행은 조회 단계에서 제외).
const ignored = computeAvailabilitySlots({
  skiResort: high1,
  durationHours: 2,
  capacity: 1,
  existing: [
    {
      ski_resort: "비발디파크",
      lesson_start_hour: 9,
      lesson_duration_hours: 2,
      reservation_status: "pending",
    },
    {
      ski_resort: high1,
      lesson_start_hour: 9,
      lesson_duration_hours: 2,
      reservation_status: "cancelled",
    },
  ],
});
assert.equal(ignored.find((s) => s.startHour === 9)?.remaining, 1);

// 하이원 4시간과 비발디 4시간이 같은 계산기를 쓴다.
const vivaldi = computeAvailabilitySlots({
  skiResort: "비발디파크",
  durationHours: 4,
  existing: [],
  capacity: 6,
});
assert.ok(vivaldi.every((s) => s.remaining === 6));

assert.equal(
  publicAvailabilityErrorMessage(new Error("로그인이 필요합니다.")),
  "예약 현황을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
);
assert.equal(
  publicAvailabilityErrorMessage(new Error("Unauthorized")),
  "예약 현황을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
);
assert.equal(
  publicAvailabilityErrorMessage(new Error("스키장을 선택해 주세요.")),
  "스키장을 선택해 주세요.",
);

console.log("availability.test.ts: ok");
