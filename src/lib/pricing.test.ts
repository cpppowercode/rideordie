import assert from "node:assert/strict";
import {
  addDaysYmd,
  badgeFeeAmount,
  calendarDaysUntil,
  EARLY_BIRD_PRICES,
  EARLY_BIRD_RULE,
  evaluateEarlyBird,
  formatWon,
  isEarlyBird,
  quoteLessonPrice,
  ratioFromParticipants,
  REGULAR_PRICES,
  RESORT_OPENING_DATES,
  RESORT_SURCHARGES,
} from "./pricing";
import { badgeFeeForResort } from "./admin-badge-fees";
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

assert.equal(EARLY_BIRD_RULE.earlyBirdWindowDays, 14);
assert.equal(EARLY_BIRD_RULE.lateSeasonStart, "02-15");
assert.equal(SKI_RESORTS.every((resort) => resort.value in RESORT_OPENING_DATES), true);
assert.equal(RESORT_OPENING_DATES["하이원리조트"].openingDate, "2026-11-28");
assert.equal(RESORT_OPENING_DATES["용평리조트"].openingDate, "2026-11-21");
assert.equal(RESORT_OPENING_DATES["비발디파크"].openingDate, "2026-12-05");
assert.equal(RESORT_OPENING_DATES["웰리힐리파크"].openingDate, "2026-12-05");
assert.equal(RESORT_OPENING_DATES["지산포레스트"].openingDate, "2026-12-08");
assert.ok(Object.values(RESORT_OPENING_DATES).every((row) => row.source === "estimate"));

const high1WindowEnd = addDaysYmd("2026-11-28", 14);
assert.equal(high1WindowEnd, "2026-12-12");

const openingBook = quoteLessonPrice({
  durationHours: 2,
  participants: 1,
  lessonDate: "2027-01-10",
  skiResort: "하이원리조트",
  now: new Date("2026-10-23T00:00:00+09:00"),
});
assert.ok(openingBook);
assert.equal(openingBook.earlyBird, true);
assert.deepEqual(openingBook.earlyBirdReasons, ["opening-window"]);
assert.equal(openingBook.earlyBirdReasonLabel, "개장 초 예약");
assert.equal(openingBook.lessonAmount, 140_000);
assert.equal(openingBook.regularAmount, 150_000);
assert.equal(openingBook.ratio, "1:1");

const afterWindow = quoteLessonPrice({
  durationHours: 3,
  participants: 2,
  lessonDate: "2027-01-10",
  skiResort: "하이원리조트",
  now: new Date("2026-12-13T00:00:00+09:00"),
});
assert.ok(afterWindow);
assert.equal(afterWindow.earlyBird, false);
assert.equal(afterWindow.lessonAmount, 270_000);
assert.equal(afterWindow.payableAmount, 270_000);

const lateSeason = quoteLessonPrice({
  durationHours: 2,
  participants: 1,
  lessonDate: "2027-02-15",
  skiResort: "하이원리조트",
  now: new Date("2027-01-20T00:00:00+09:00"),
});
assert.ok(lateSeason);
assert.equal(lateSeason.earlyBird, true);
assert.deepEqual(lateSeason.earlyBirdReasons, ["late-season"]);
assert.equal(lateSeason.earlyBirdReasonLabel, "2월 중순 이후 강습");
assert.equal(lateSeason.lessonAmount, 140_000);

const bothReasons = evaluateEarlyBird({
  lessonDate: "2027-02-20",
  skiResort: "지산포레스트",
  now: new Date("2026-10-23T00:00:00+09:00"),
});
assert.equal(bothReasons.earlyBird, true);
assert.deepEqual(bothReasons.reasons, ["opening-window", "late-season"]);
assert.match(bothReasons.reasonLabel, /개장 초 예약/);
assert.match(bothReasons.reasonLabel, /2월 중순 이후 강습/);

assert.equal(isEarlyBird("2027-01-10", "하이원리조트", new Date("2026-12-13T00:00:00+09:00")), false);
assert.equal(isEarlyBird("2027-02-15", "하이원리조트", new Date("2026-12-13T00:00:00+09:00")), true);
assert.equal(isEarlyBird("2026-12-12", "하이원리조트", new Date("2026-12-12T15:00:00+09:00")), true);

assert.equal(quoteLessonPrice({ durationHours: 2, participants: 8, lessonDate: "2099-01-01" }), null);

assert.equal(SKI_RESORTS.every((resort) => resort.value in RESORT_SURCHARGES), true);
assert.equal(RESORT_SURCHARGES["하이원리조트"].badgeFee, 0);
assert.equal(RESORT_SURCHARGES["용평리조트"].badgeFee, 0);
assert.equal(RESORT_SURCHARGES["웰리힐리파크"].badgeFee, 0);
assert.equal(RESORT_SURCHARGES["비발디파크"].badgeFeeBasis, "per-person");
assert.equal(RESORT_SURCHARGES["지산포레스트"].badgeFeeBasis, "per-person");
assert.equal(RESORT_SURCHARGES["비발디파크"].badgeFee, 25_000);
assert.equal(RESORT_SURCHARGES["지산포레스트"].badgeFee, 35_000);

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
assert.equal(jisan.badgeFee, badgeFeeForResort({
  skiResort: "지산포레스트",
  participants: 2,
  durationHours: 2,
}).amount);
assert.equal(jisan.badgeFee, 70_000);
assert.equal(jisan.payableAmount, jisan.lessonAmount + jisan.badgeFee);
assert.equal(jisan.badgeFeeBasis, "per-person");

const vivaldi = quoteLessonPrice({
  durationHours: 2,
  participants: 1,
  lessonDate: "2099-01-15",
  skiResort: "비발디파크",
  now: new Date("2026-10-23T00:00:00+09:00"),
});
assert.ok(vivaldi);
assert.equal(vivaldi.badgeFee, 25_000);
assert.equal(vivaldi.payableAmount, vivaldi.lessonAmount + 25_000);

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

console.log("pricing tests passed");
