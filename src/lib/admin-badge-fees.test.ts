import assert from "node:assert/strict";
import {
  badgeFeeForResort,
  FALLBACK_ADMIN_BADGE_RATES,
  loadAdminBadgeRates,
  parseAdminCalculatorJs,
  resetAdminBadgeRateCache,
} from "./admin-badge-fees";

const snippet = `
let t=m/2*(1e4*r);if("용평"===a&&"보드"===e){k("❌ 용평에서는 보드 선택 불가");return}let s=0;if("비발디"===a)s=o*m*12500;else if("지산"===a)if(m%2==0)s=2===m?35e3*o:4===m?5e4*o:6===m?85e3*o:o*(5e4+(m-4)/2*12500);else{let e=m+1;s=2===e?35e3*o:4===e?5e4*o:6===e?85e3*o:o*(5e4+(e-4)/2*12500)}
`;

const parsed = parseAdminCalculatorJs(snippet);
assert.ok(parsed);
assert.equal(parsed.source, "admin-calculator");
assert.equal(parsed.vivaldiPerPersonPerHour, 12_500);
assert.equal(parsed.jisanPerPersonByEvenHours[2], 35_000);
assert.equal(parsed.jisanPerPersonByEvenHours[4], 50_000);
assert.equal(parsed.jisanPerPersonByEvenHours[6], 85_000);
assert.equal(parsed.jisanExtraPairUnit, 12_500);

assert.equal(parseAdminCalculatorJs("no fees here"), null);

const vivaldi1x2 = badgeFeeForResort({
  skiResort: "비발디파크",
  participants: 1,
  durationHours: 2,
});
assert.equal(vivaldi1x2.amount, 25_000);
assert.equal(vivaldi1x2.unit, 25_000);
assert.equal(vivaldi1x2.basis, "per-person");

const vivaldi2x3 = badgeFeeForResort({
  skiResort: "비발디파크",
  participants: 2,
  durationHours: 3,
});
assert.equal(vivaldi2x3.amount, 75_000);
assert.equal(vivaldi2x3.unit, 37_500);

const jisan1x2 = badgeFeeForResort({
  skiResort: "지산포레스트",
  participants: 1,
  durationHours: 2,
});
assert.equal(jisan1x2.amount, 35_000);
assert.equal(jisan1x2.basis, "per-person");

const jisan2x2 = badgeFeeForResort({
  skiResort: "지산포레스트",
  participants: 2,
  durationHours: 2,
});
assert.equal(jisan2x2.amount, 70_000);

const jisan1x3 = badgeFeeForResort({
  skiResort: "지산리조트",
  participants: 1,
  durationHours: 3,
});
assert.equal(jisan1x3.amount, 50_000);

const jisan1x4 = badgeFeeForResort({
  skiResort: "지산포레스트",
  participants: 1,
  durationHours: 4,
});
assert.equal(jisan1x4.amount, 50_000);

const high1 = badgeFeeForResort({
  skiResort: "하이원리조트",
  participants: 3,
  durationHours: 4,
});
assert.equal(high1.amount, 0);
assert.equal(FALLBACK_ADMIN_BADGE_RATES.vivaldiPerPersonPerHour, 12_500);

resetAdminBadgeRateCache();
loadAdminBadgeRates()
  .then((live) => {
    assert.equal(live.vivaldiPerPersonPerHour, 12_500);
    assert.equal(live.jisanPerPersonByEvenHours[2], 35_000);
    assert.equal(live.jisanPerPersonByEvenHours[4], 50_000);
    assert.ok(live.source === "admin-calculator" || live.source === "fallback");
    console.log("admin-badge-fees tests passed", live.source);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
