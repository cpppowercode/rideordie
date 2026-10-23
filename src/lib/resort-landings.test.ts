import assert from "node:assert/strict";
import {
  bookingValueFromResortQuery,
  bookHref,
  EARLY_BIRD_COPY,
  REGULAR_PRICE_TABLE,
  RESORT_LANDINGS,
  resortCanonical,
  resortLandingBySlug,
} from "./resort-landings";

assert.equal(RESORT_LANDINGS.length, 5);
assert.equal(bookingValueFromResortQuery("high1"), "하이원리조트");
assert.equal(bookingValueFromResortQuery("welli-hilli"), "웰리힐리파크");
assert.equal(bookingValueFromResortQuery("vivaldi"), "비발디파크");
assert.equal(bookingValueFromResortQuery("jisan"), "지산포레스트");
assert.equal(bookingValueFromResortQuery("yongpyong"), "용평리조트");
assert.equal(bookingValueFromResortQuery("하이원리조트"), "하이원리조트");
assert.equal(bookHref("high1"), "/book?resort=high1");
assert.equal(resortCanonical("high1"), "https://rideordie.kr/resorts/high1");
assert.equal(resortLandingBySlug("missing"), undefined);
assert.equal(REGULAR_PRICE_TABLE.amounts["1:1"][2], 150_000);
assert.equal(
  EARLY_BIRD_COPY,
  "1:1 2시간 정가 15만원, 각 리조트 개장 후 첫 2주 안에 예약하거나 2월 중순 이후 강습은 특가 14만원"
);
assert.equal(EARLY_BIRD_COPY.includes("2월 한 달"), false);
assert.equal(
  JSON.stringify(RESORT_LANDINGS).includes("2월 한 달"),
  false
);

const titles = new Set(RESORT_LANDINGS.map((row) => row.title));
const descriptions = new Set(RESORT_LANDINGS.map((row) => row.description));
const intros = new Set(RESORT_LANDINGS.map((row) => row.intro.join("\n")));
assert.equal(titles.size, 5);
assert.equal(descriptions.size, 5);
assert.equal(intros.size, 5);

console.log("resort landing tests passed");
