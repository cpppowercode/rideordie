import assert from "node:assert/strict";
import sitemap from "../app/sitemap";
import {
  bookingValueFromResortQuery,
  bookHref,
  SALE_PRICE_COPY,
  SALE_PRICE_LABEL,
  PRICE_TABLE,
  RESORT_LANDINGS,
  resortCanonical,
  resortLandingBySlug,
} from "./resort-landings";
import { RESORTS } from "./resorts";

assert.equal(RESORT_LANDINGS.length, 5);
assert.equal(RESORT_LANDINGS.length, RESORTS.length);
assert.equal(bookingValueFromResortQuery("high1"), "하이원리조트");
assert.equal(bookingValueFromResortQuery("welli-hilli"), "웰리힐리파크");
assert.equal(bookingValueFromResortQuery("vivaldi"), "비발디파크");
assert.equal(bookingValueFromResortQuery("jisan"), "지산포레스트");
assert.equal(bookingValueFromResortQuery("yongpyong"), "용평리조트");
assert.equal(bookingValueFromResortQuery("alpensia"), SKI_DEFAULT());
assert.equal(bookingValueFromResortQuery("muju"), SKI_DEFAULT());
assert.equal(bookingValueFromResortQuery("하이원리조트"), "하이원리조트");
assert.equal(bookHref("high1"), "/book?resort=high1");
assert.equal(resortCanonical("high1"), "https://rideordie.kr/resorts/high1");
assert.equal(resortLandingBySlug("missing"), undefined);
assert.equal(resortLandingBySlug("alpensia"), undefined);
assert.equal(resortLandingBySlug("muju"), undefined);
assert.equal(PRICE_TABLE.sale["1:1"][2], 140_000);
assert.equal(SALE_PRICE_LABEL, "얼리버드 특가");
assert.ok(SALE_PRICE_COPY.includes("1:1 2시간 14만원"));
assert.ok(SALE_PRICE_COPY.includes("얼리버드"));
assert.equal(SALE_PRICE_COPY.includes("정가"), false);
assert.equal(SALE_PRICE_COPY.includes("오픈 기념"), false);

const landingBlob = JSON.stringify(RESORT_LANDINGS);
assert.equal(landingBlob.includes("알펜시아"), false);
assert.equal(landingBlob.includes("무주"), false);
assert.equal(landingBlob.includes("정가"), false);

const yongpyong = resortLandingBySlug("yongpyong");
assert.ok(yongpyong);
assert.equal(yongpyong.layout, "minimal");

const vivaldi = resortLandingBySlug("vivaldi");
const jisan = resortLandingBySlug("jisan");
const welli = resortLandingBySlug("welli-hilli");
assert.ok(vivaldi?.mentionBadgeFee && vivaldi.intro.some((p) => p.includes("패찰비")));
assert.ok(jisan?.mentionBadgeFee && jisan.intro.some((p) => p.includes("패찰비")));
assert.ok(welli?.mentionBadgeFee && welli.intro.some((p) => p.includes("패찰비")));
assert.ok(welli?.faqs.some((f) => f.a.includes("40,000")));
assert.ok(!JSON.stringify(welli).includes("확정 전"));

assert.ok(
  RESORT_LANDINGS.every((row) =>
    row.faqs.some((item) => item.a.includes("1:1 2시간 14만원"))
  )
);

const sitemapUrls = sitemap().map((entry) => entry.url);
assert.ok(sitemapUrls.includes("https://rideordie.kr/resorts"));
assert.ok(sitemapUrls.includes("https://rideordie.kr/resorts/high1"));
assert.equal(sitemapUrls.includes("https://rideordie.kr/resorts/alpensia"), false);
assert.equal(sitemapUrls.includes("https://rideordie.kr/resorts/muju"), false);

assert.deepEqual(
  RESORT_LANDINGS.map((row) => row.slug),
  ["high1", "welli-hilli", "vivaldi", "jisan", "yongpyong"],
);

const titles = new Set(RESORT_LANDINGS.map((row) => row.title));
assert.equal(titles.size, 5);

console.log("resort landing tests passed");
import { priceCopy as __pc } from "./resort-landings";
assert.equal(__pc("A. 1:1 2시간 15만원부터. B"), "A. 1:1 2시간 14만원. B");

{
  const y = resortLandingBySlug("yongpyong")!;
  const txt = [y.description, ...y.intro, ...y.faqs.map((f) => f.a)].join(" ");
  assert.ok(!/1:1·2:1·3:1/.test(txt), "용평에 3:1 구성 안내 금지");
  assert.ok(/3:1 없음|3:1 강습이 없습니다/.test(txt));
  console.log("yongpyong landing tests passed");
}

function SKI_DEFAULT() {
  return "하이원리조트";
}
