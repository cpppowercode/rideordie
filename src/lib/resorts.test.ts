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

assert.equal(RESORTS.length, 7);
assert.deepEqual(
  RESORTS.map((r) => r.shortName),
  ["하이원", "비발디", "웰리힐리", "용평", "지산", "알펜시아", "무주"],
);
assert.equal(SKI_RESORTS.length, 7);
assert.equal(TEACHING_RESORTS.length, 7);
assert.ok(teachingResortNames().includes("무주"));
assert.ok(resortBySlug("muju")?.value === "무주덕유산리조트");
assert.ok(resortByValue("알펜시아리조트"));
assert.ok(resortByValue("무주"));

// 패찰비 SSOT
assert.equal(badgeFeeKind("비발디파크"), "vivaldi");
assert.equal(badgeFeeKind("지산포레스트"), "jisan");
assert.equal(badgeFeeKind("웰리힐리파크"), "welli");
assert.equal(badgeFeeKind("하이원리조트"), "none");
assert.equal(badgeFeeKind("무주덕유산리조트"), "none");
assert.equal(resortHasBadgeFee("웰리힐리파크"), true);
assert.ok(badgeFeeNotice("웰리힐리파크")?.includes("40,000"));

// 용평 3:1 불가
assert.deepEqual(resortAllowedRatios("용평리조트"), ["1:1", "2:1"]);
assert.deepEqual(resortAllowedRatios("하이원리조트"), ["1:1", "2:1", "3:1"]);

// hours / grooming 파생
for (const r of RESORTS) {
  assert.ok(RESORT_HOURS[r.value], r.value);
  assert.ok(GROOMING_BREAKS[r.value], r.value);
}

console.log("resorts.test.ts: ok");
