/**
 * feedback-grades-seed.json 계약 — 사장님 확정(스키 15단계·after_step) 고정.
 * 옛 note/position_owner_default 보다 after_step 이 우선.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const seedPath = path.join(
  process.cwd(),
  "scripts/feedback-grades-seed.json",
);
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8")) as {
  steps: Array<{ sport: string; kind: string; code: string; sort_order: number; label: string }>;
  milestones: Array<{ sport: string; code: string; after_step?: string; label: string }>;
  junior_grades: Array<{
    sport: string;
    grade: number;
    required_steps: string[];
    code: string;
  }>;
  badges: unknown[];
};

const skiSteps = seed.steps
  .filter((s) => s.sport === "ski" && s.kind === "step")
  .sort((a, b) => a.sort_order - b.sort_order);

assert.equal(skiSteps.length, 15, "스키 단계는 15개");
assert.equal(skiSteps[5]!.code, "SKI_PARALLEL");
assert.equal(skiSteps[6]!.code, "SKI_BASIC_SHORT");
assert.equal(skiSteps[7]!.code, "SKI_DYNAMIC");
assert.equal(skiSteps[8]!.code, "SKI_DYNAMIC_SHORT");
assert.ok(skiSteps.some((s) => s.code === "SKI_BASIC_SHORT"));
assert.ok(skiSteps.some((s) => s.code === "SKI_DYNAMIC_SHORT"));

const boardSteps = seed.steps.filter((s) => s.sport === "board" && s.kind === "step");
assert.equal(boardSteps.length, 14, "보드는 기존 14단계 유지");

const skiMs = Object.fromEntries(
  seed.milestones.filter((m) => m.sport === "ski").map((m) => [m.code, m.after_step]),
);
assert.equal(skiMs.SKI_KSIA_L1, "SKI_BASIC_SHORT");
assert.equal(skiMs.SKI_SBAK_T1, "SKI_BASIC_SHORT");
assert.equal(skiMs.SKI_KSIA_L2, "SKI_GATE");

const jr = Object.fromEntries(
  seed.junior_grades
    .filter((g) => g.sport === "ski" && [4, 5, 6, 7].includes(g.grade))
    .map((g) => [g.grade, g.required_steps[0]]),
);
assert.equal(jr[4], "SKI_PARALLEL");
assert.equal(jr[5], "SKI_BASIC_SHORT");
assert.equal(jr[6], "SKI_DYNAMIC");
assert.equal(jr[7], "SKI_DYNAMIC_SHORT");

assert.equal(seed.badges.length, 26);

/** mock 과 동일: after_step 기준으로 milestone 삽입 */
function buildItems(sport: string) {
  const steps = seed.steps
    .filter((s) => s.sport === sport && s.kind === "step")
    .sort((a, b) => a.sort_order - b.sort_order);
  const afterMap = new Map<string, typeof seed.milestones>();
  for (const ms of seed.milestones.filter((m) => m.sport === sport)) {
    const after = String(ms.after_step || "").trim();
    if (!after) continue;
    if (!afterMap.has(after)) afterMap.set(after, []);
    afterMap.get(after)!.push(ms);
  }
  const items: Array<{ kind: string; code?: string; label: string }> = [];
  for (const step of steps) {
    items.push({ kind: "step", code: step.code, label: step.label });
    for (const ms of afterMap.get(step.code) || []) {
      items.push({ kind: "milestone", code: ms.code, label: ms.label });
    }
  }
  return items;
}

const skiItems = buildItems("ski");
const idx = (code: string) => skiItems.findIndex((i) => i.code === code);
assert.ok(idx("SKI_BASIC_SHORT") >= 0);
assert.equal(skiItems[idx("SKI_BASIC_SHORT") + 1]!.code, "SKI_KSIA_L1");
assert.equal(skiItems[idx("SKI_BASIC_SHORT") + 2]!.code, "SKI_SBAK_T1");
assert.equal(skiItems[idx("SKI_GATE") + 1]!.code, "SKI_KSIA_L2");
assert.equal(skiItems[idx("SKI_GATE") + 2]!.code, "SKI_FREE_RUN");
// 패러렐 바로 뒤는 베이직 숏턴 (마일스톤 아님)
assert.equal(skiItems[idx("SKI_PARALLEL") + 1]!.code, "SKI_BASIC_SHORT");
assert.equal(skiItems[idx("SKI_DYNAMIC") + 1]!.code, "SKI_DYNAMIC_SHORT");

console.log("seed-contract.test.ts: ok (ski 15 steps, after_step)");
