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

assert.equal(RESORT_LANDINGS.length, 6);
assert.equal(bookingValueFromResortQuery("high1"), "하이원리조트");
assert.equal(bookingValueFromResortQuery("welli-hilli"), "웰리힐리파크");
assert.equal(bookingValueFromResortQuery("vivaldi"), "비발디파크");
assert.equal(bookingValueFromResortQuery("jisan"), "지산포레스트");
assert.equal(bookingValueFromResortQuery("yongpyong"), "용평리조트");
assert.equal(bookingValueFromResortQuery("alpensia"), "알펜시아리조트");
assert.equal(bookingValueFromResortQuery("하이원리조트"), "하이원리조트");
assert.equal(bookHref("high1"), "/book?resort=high1");
assert.equal(resortCanonical("high1"), "https://rideordie.kr/resorts/high1");
assert.equal(resortLandingBySlug("missing"), undefined);
assert.equal(PRICE_TABLE.sale["1:1"][2], 140_000);
assert.equal(PRICE_TABLE.list["1:1"][2], 150_000);
assert.equal(SALE_PRICE_LABEL, "강습 가격");
assert.ok(SALE_PRICE_COPY.includes("1:1 2시간 14만원"));
assert.ok(SALE_PRICE_COPY.includes("정가 15만원"));
// 오픈 기념, 할인율 문구 금지
assert.equal(SALE_PRICE_COPY.includes("오픈 기념"), false);
assert.equal(SALE_PRICE_COPY.includes("오픈기념"), false);
assert.equal(SALE_PRICE_COPY.includes("%"), false);
const landingBlob = JSON.stringify(RESORT_LANDINGS);
assert.equal(landingBlob.includes("2월 한 달"), false);
assert.equal(landingBlob.includes("오픈 기념"), false);
assert.equal(landingBlob.includes("오픈기념"), false);
assert.equal(landingBlob.includes("얼리버드"), false);
assert.equal(landingBlob.includes("% 할인"), false);
assert.equal(landingBlob.includes("15% "), false);
assert.equal(landingBlob.includes("20% "), false);
assert.equal(landingBlob.includes("25% "), false);
assert.equal(JSON.stringify(RESORT_LANDINGS).includes("넓은 초급 지형"), false);
assert.equal(JSON.stringify(RESORT_LANDINGS).includes("숙박·식음이 한 단지에"), false);
assert.equal(JSON.stringify(RESORT_LANDINGS).includes("오전에 출발해 오후에 강습"), false);

const yongpyong = resortLandingBySlug("yongpyong");
assert.ok(yongpyong);
assert.deepEqual(yongpyong.intro, [
  "평창 용평에서 어린이 스키·보드 강습을 진행합니다. 1:1·2:1(용평은 3:1 강습이 없습니다), 공인 강사, 응급처치 교육 이수, 강습보험 적용.",
  "1:1 2시간 14만원. 환불은 약관 제9조를 따릅니다.",
]);
assert.equal(yongpyong.layout, "minimal");

const vivaldi = resortLandingBySlug("vivaldi");
const jisan = resortLandingBySlug("jisan");
const welli = resortLandingBySlug("welli-hilli");
const alpensia = resortLandingBySlug("alpensia");
assert.ok(vivaldi?.mentionBadgeFee && vivaldi.intro.some((p) => p.includes("패찰비")));
assert.ok(vivaldi?.faqs.some((f) => f.q === "패찰비가 따로 있나요?"));
assert.ok(jisan?.mentionBadgeFee && jisan.intro.some((p) => p.includes("패찰비")));
assert.ok(jisan?.faqs.some((f) => f.q === "패찰비가 따로 있나요?"));
assert.ok(welli && !welli.mentionBadgeFee && !JSON.stringify(welli).includes("패찰비"));
assert.ok(alpensia && !alpensia.mentionBadgeFee && !JSON.stringify(alpensia).includes("패찰비"));
assert.equal(PRICE_TABLE.sale["3:1"][4], 440_000);
assert.equal(PRICE_TABLE.list["3:1"][4], 470_000);
assert.ok(
  RESORT_LANDINGS.every((row) =>
    row.faqs.some((item) => item.a.includes("1:1 2시간 14만원"))
  )
);

const sitemapUrls = sitemap().map((entry) => entry.url);
assert.ok(sitemapUrls.includes("https://rideordie.kr/resorts"));
assert.ok(sitemapUrls.includes("https://rideordie.kr/resorts/high1"));
assert.ok(sitemapUrls.includes("https://rideordie.kr/resorts/alpensia"));

assert.deepEqual(
  RESORT_LANDINGS.map((row) => [row.slug, row.title, row.h1]),
  [
    ["high1", "하이원 어린이 스키강습·보드강습 1:1 | 라이드올다이", "하이원 어린이 스키·보드강습"],
    ["welli-hilli", "웰리힐리 어린이 스키강습·보드강습 1:1 | 라이드올다이", "웰리힐리 어린이 스키·보드강습"],
    ["vivaldi", "비발디 어린이 스키강습·보드강습 1:1 | 라이드올다이", "비발디파크 어린이 스키·보드강습"],
    ["jisan", "지산 어린이 스키강습·보드강습 1:1 | 라이드올다이", "지산 어린이 스키·보드강습"],
    ["yongpyong", "용평 어린이 스키강습·보드강습 1:1 | 라이드올다이", "용평 어린이 스키·보드강습"],
    ["alpensia", "알펜시아 어린이 스키강습·보드강습 1:1 | 라이드올다이", "알펜시아 어린이 스키·보드강습"],
  ]
);

const titles = new Set(RESORT_LANDINGS.map((row) => row.title));
const descriptions = new Set(RESORT_LANDINGS.map((row) => row.description));
const intros = new Set(RESORT_LANDINGS.map((row) => row.intro.join("\n")));
assert.equal(titles.size, 6);
assert.equal(descriptions.size, 6);
assert.equal(intros.size, 6);

console.log("resort landing tests passed");
import { priceCopy as __pc } from "./resort-landings";
assert.equal(__pc("A. 1:1 2시간 15만원부터. B"), "A. 1:1 2시간 14만원. B");
assert.equal(__pc("1:1 2시간 15만원부터"), "1:1 2시간 14만원");

// 용평: 3:1 문구 없음(SEO·JSON-LD 원문)
{
  const y = resortLandingBySlug("yongpyong")!;
  const txt = [y.description, ...y.intro, ...y.faqs.map((f) => f.a)].join(" ");
  assert.ok(!/1:1·2:1·3:1/.test(txt), "용평에 3:1 구성 안내 금지");
  assert.ok(/3:1 없음|3:1 강습이 없습니다/.test(txt));
  console.log("yongpyong landing tests passed");
}
