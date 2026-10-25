import assert from "node:assert/strict";
import sitemap from "../app/sitemap";
import {
  bookingValueFromResortQuery,
  bookHref,
  EARLY_BIRD_COPY,
  EARLY_BIRD_LABEL,
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
assert.equal(EARLY_BIRD_LABEL, "시즌 전 얼리버드");
assert.equal(
  EARLY_BIRD_COPY,
  "시즌 전 얼리버드: 개장 후 첫 2주 안에 예약 또는 2월 중순 이후 예약 시 14만원"
);
assert.equal(EARLY_BIRD_COPY.includes("특가"), false);
assert.equal(EARLY_BIRD_COPY.includes("오픈 기념"), false);
assert.equal(EARLY_BIRD_COPY.includes("오픈기념"), false);
assert.equal(EARLY_BIRD_COPY.includes("강습은"), false);
assert.equal(EARLY_BIRD_COPY.includes("2월 한 달"), false);
const landingBlob = JSON.stringify(RESORT_LANDINGS);
assert.equal(landingBlob.includes("2월 한 달"), false);
assert.equal(landingBlob.includes("특가"), false);
assert.equal(landingBlob.includes("오픈 기념"), false);
assert.equal(landingBlob.includes("오픈기념"), false);
assert.ok(landingBlob.includes("시즌 전 얼리버드"));
assert.equal(JSON.stringify(RESORT_LANDINGS).includes("넓은 초급 지형"), false);
assert.equal(JSON.stringify(RESORT_LANDINGS).includes("숙박·식음이 한 단지에"), false);
assert.equal(JSON.stringify(RESORT_LANDINGS).includes("오전에 출발해 오후에 강습"), false);

const yongpyong = resortLandingBySlug("yongpyong");
assert.ok(yongpyong);
assert.deepEqual(yongpyong.intro, [
  "평창 용평에서 어린이 스키·보드 강습을 진행합니다. 1:1·2:1·3:1, 공인 강사, 응급처치 교육 이수, 강습보험 적용.",
  "1:1 2시간 일반 요금은 15만원입니다. 환불은 약관 제9조를 따릅니다.",
]);
assert.equal(yongpyong.layout, "minimal");

const vivaldi = resortLandingBySlug("vivaldi");
const jisan = resortLandingBySlug("jisan");
assert.ok(vivaldi?.intro.some((p) => p.includes("패찰비")));
assert.ok(jisan?.intro.some((p) => p.includes("패찰비")));
assert.equal(REGULAR_PRICE_TABLE.amounts["3:1"][4], 400_000);
assert.ok(
  RESORT_LANDINGS.every((row) =>
    row.faqs.some((item) => item.a.includes("예약 시 14만원"))
  )
);

const sitemapUrls = sitemap().map((entry) => entry.url);
assert.ok(sitemapUrls.includes("https://rideordie.kr/resorts"));
assert.ok(sitemapUrls.includes("https://rideordie.kr/resorts/high1"));

assert.deepEqual(
  RESORT_LANDINGS.map((row) => [row.slug, row.title, row.h1]),
  [
    ["high1", "하이원 어린이 스키강습·보드강습 1:1 | 라이드올다이", "하이원 어린이 스키·보드강습"],
    ["welli-hilli", "웰리힐리 어린이 스키강습·보드강습 1:1 | 라이드올다이", "웰리힐리 어린이 스키·보드강습"],
    ["vivaldi", "비발디 어린이 스키강습·보드강습 1:1 | 라이드올다이", "비발디파크 어린이 스키·보드강습"],
    ["jisan", "지산 어린이 스키강습·보드강습 1:1 | 라이드올다이", "지산 어린이 스키·보드강습"],
    ["yongpyong", "용평 어린이 스키강습·보드강습 1:1 | 라이드올다이", "용평 어린이 스키·보드강습"],
  ]
);

const titles = new Set(RESORT_LANDINGS.map((row) => row.title));
const descriptions = new Set(RESORT_LANDINGS.map((row) => row.description));
const intros = new Set(RESORT_LANDINGS.map((row) => row.intro.join("\n")));
assert.equal(titles.size, 5);
assert.equal(descriptions.size, 5);
assert.equal(intros.size, 5);

console.log("resort landing tests passed");
