import assert from "node:assert/strict";
import {
  calendarDaysUntil,
  formatWon,
  isEarlyBird,
  quoteLessonPrice,
  ratioFromParticipants,
  REGULAR_PRICES,
  EARLY_BIRD_PRICES,
} from "./pricing";

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
assert.equal(soon.payableAmount, 270_000);

assert.equal(quoteLessonPrice({ durationHours: 2, participants: 8, lessonDate: "2099-01-01" }), null);
assert.equal(calendarDaysUntil("2026-10-30", new Date("2026-10-23T12:00:00+09:00")), 7);
assert.equal(isEarlyBird("2026-10-24", new Date("2026-10-23T00:00:00+09:00")), false);

console.log("pricing tests passed");
