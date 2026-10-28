import assert from "node:assert/strict";
import { SEASON_OPTIONS, checkSeasonOrder, isPayable } from "./season";

assert.ok(SEASON_OPTIONS.length > 0);
for (const o of SEASON_OPTIONS) assert.equal(isPayable(o), false, `${o.id}: 출처 없는 가격 금지`);
const ok = { customerName: "테스트", customerPhone: "010-0000-0000" };
assert.equal(checkSeasonOrder({ ...ok, optionId: "season-1to1" }).ok, false);
const r = checkSeasonOrder({ ...ok, optionId: "season-1to1" });
assert.ok(!r.ok && r.status === 409);
const bad = checkSeasonOrder({ ...ok, optionId: "free-amount" });
assert.ok(!bad.ok && bad.status === 400);
const noName = checkSeasonOrder({ customerPhone: "01000000000", optionId: "season-1to1" });
assert.ok(!noName.ok && noName.status === 400);
const noPhone = checkSeasonOrder({ customerName: "a", customerPhone: "123", optionId: "season-1to1" });
assert.ok(!noPhone.ok && noPhone.status === 400);
console.log("season tests passed");
