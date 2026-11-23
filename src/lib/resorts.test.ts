import assert from "node:assert/strict";
import {
  RESORTS,
  badgeFeeKind,
  badgeFeeNotice,
  resortAllowedRatios,
  resortBySlug,
  resortByValue,
  resortHasBadgeFee,
  teachingResortNames,
} from "./resorts";
import { SKI_RESORTS, TEACHING_RESORTS } from "./site";
import { RESORT_HOURS } from "./hours";
import { GROOMING_BREAKS } from "./grooming";

assert.equal(RESORTS.length, 5);
assert.deepEqual(
  RESORTS.map((r) => r.shortName),
  ["하이원", "용평", "비발디", "지산", "웰리힐리"],
);
assert.equal(SKI_RESORTS.length, 5);
assert.equal(TEACHING_RESORTS.length, 5);
assert.equal(teachingResortNames().includes("알펜시아"), false);
assert.equal(teachingResortNames().includes("무주"), false);
assert.equal(resortBySlug("alpensia"), undefined);
assert.equal(resortBySlug("muju"), undefined);
assert.ok(resortByValue("하이원리조트"));
assert.ok(resortByValue("용평"));

assert.equal(badgeFeeKind("비발디파크"), "vivaldi");
assert.equal(badgeFeeKind("지산포레스트"), "jisan");
assert.equal(badgeFeeKind("웰리힐리파크"), "welli");
assert.equal(badgeFeeKind("하이원리조트"), "none");
assert.equal(badgeFeeKind("용평리조트"), "none");
assert.equal(resortHasBadgeFee("웰리힐리파크"), true);
assert.ok(badgeFeeNotice("웰리힐리파크")?.includes("40,000"));
assert.ok(!badgeFeeNotice("웰리힐리파크")?.includes("확정 전"));

assert.deepEqual(resortAllowedRatios("용평리조트"), ["1:1", "2:1"]);
assert.deepEqual(resortAllowedRatios("하이원리조트"), ["1:1", "2:1", "3:1"]);

for (const r of RESORTS) {
  assert.ok(RESORT_HOURS[r.value], r.value);
  assert.ok(GROOMING_BREAKS[r.value], r.value);
}

console.log("resorts.test.ts: ok");
