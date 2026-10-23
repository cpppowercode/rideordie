import assert from "node:assert/strict";
import {
  badgeFeeAmount,
  calendarDaysUntil,
  formatWon,
  isEarlyBird,
  quoteLessonPrice,
  ratioFromParticipants,
  REGULAR_PRICES,
  EARLY_BIRD_PRICES,
  RESORT_SURCHARGES,
} from "./pricing";
import { SKI_RESORTS } from "./site";

assert.equal(ratioFromParticipants(1), "1:1");
assert.equal(ratioFromParticipants(2), "2:1");
assert.equal(ratioFromParticipants(3), "3:1");
assert.equal(ratioFromParticipants(4), null);
assert.equal(ratioFromParticipants(0), null);

assert.equal(REGULAR_PRICES["1:1"][2], 150_000);
assert.equal(REGULAR_PRICES["1:1"][3], 220_000);
assert.equal(REGULAR_PRICES["1:1"][4], 290_000);
assert.equal(REGULAR_PRICES["2:1"][2], 180_000);
assert.equal(REGULAR_PRICES["2:1"][3], 270_000);
assert.equal(REGULAR_PRICES["2:1"][4], 350_000);
assert.equal(REGULAR_PRICES["3:1"][2], 210_000);
assert.equal(REGULAR_PRICES["3:1"][3], 310_000);
assert.equal(REGULAR_PRICES["3:1"][4], 400_000);
assert.equal(EARLY_BIRD_PRICES["1:1"][2], 140_000);
assert.equal(EARLY_BIRD_PRICES["3:1"][4], 390_000);
assert.equal(formatWon(150000), "150,000원");

const far = quoteLessonPrice({
  durationHours: 2,
  participants: 1,
  lessonDate: "2099-01-15",
  now: new Date("2026-10-23T00:00:00+09:00"),
});
assert.ok(far);
assert.equal(far.earlyBird, true);
assert.equal(far.lessonAmount, 140_000);
assert.equal(far.badgeFee, 0);
assert.equal(far.payableAmount, 140_000);
assert.equal(far.regularAmount, 150_000);
assert.equal(far.ratio, "1:1");

const soon = quoteLessonPrice({
  durationHours: 3,
  participants: 2,
  lessonDate: "2026-10-24",
  now: new Date("2026-10-23T00:00:00+09:00"),
});
assert.ok(soon);
assert.equal(soon.earlyBird, false);
assert.equal(soon.lessonAmount, 270_000);
assert.equal(soon.badgeFee, 0);
assert.equal(soon.payableAmount, 270_000);

assert.equal(quoteLessonPrice({ durationHours: 2, participants: 8, lessonDate: "2099-01-01" }), null);

assert.equal(SKI_RESORTS.every((resort) => resort.value in RESORT_SURCHARGES), true);
assert.equal(RESORT_SURCHARGES["하이원리조트"].badgeFee, 0);
assert.equal(RESORT_SURCHARGES["용평리조트"].badgeFee, 0);
assert.equal(RESORT_SURCHARGES["웰리힐리파크"].badgeFee, 0);
assert.equal(RESORT_SURCHARGES["비발디파크"].badgeFeeBasis, "per-lesson");
assert.equal(RESORT_SURCHARGES["지산포레스트"].badgeFeeBasis, "per-lesson");
assert.ok(Number.isFinite(RESORT_SURCHARGES["비발디파크"].badgeFee));
assert.ok(Number.isFinite(RESORT_SURCHARGES["지산포레스트"].badgeFee));

assert.equal(badgeFeeAmount({ badgeFee: 10_000, badgeFeeBasis: "per-lesson" }, 3), 10_000);
assert.equal(badgeFeeAmount({ badgeFee: 10_000, badgeFeeBasis: "per-person" }, 3), 30_000);
assert.equal(badgeFeeAmount({ badgeFee: 0, badgeFeeBasis: "per-person" }, 3), 0);

const jisan = quoteLessonPrice({
  durationHours: 2,
  participants: 2,
  lessonDate: "2099-01-15",
  skiResort: "지산포레스트",
  now: new Date("2026-10-23T00:00:00+09:00"),
});
assert.ok(jisan);
assert.equal(jisan.lessonAmount, 170_000);
assert.equal(jisan.badgeFee, badgeFeeAmount(RESORT_SURCHARGES["지산포레스트"], 2));
assert.equal(jisan.payableAmount, jisan.lessonAmount + jisan.badgeFee);
assert.equal(jisan.badgeFeeBasis, "per-lesson");

const high1 = quoteLessonPrice({
  durationHours: 2,
  participants: 2,
  lessonDate: "2099-01-15",
  skiResort: "하이원리조트",
  now: new Date("2026-10-23T00:00:00+09:00"),
});
assert.ok(high1);
assert.equal(high1.badgeFee, 0);
assert.equal(high1.payableAmount, high1.lessonAmount);
assert.equal(calendarDaysUntil("2026-10-30", new Date("2026-10-23T12:00:00+09:00")), 7);
assert.equal(isEarlyBird("2026-10-24", new Date("2026-10-23T00:00:00+09:00")), false);

console.log("pricing tests passed");
