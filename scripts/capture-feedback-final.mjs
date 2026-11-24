import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3010";
const OUT = "/opt/cursor/artifacts/feedback_final";
fs.mkdirSync(OUT, { recursive: true });

async function login(page) {
  await page.goto(`${BASE}/feedback`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("[data-student-key], form", { timeout: 30000 });
  if (await page.locator("[data-student-key]").count()) return;
  await page.locator('input[name="name"], input#name').first().fill("테스트");
  await page.locator('input[name="phone"], input#phone').first().fill("01012345678");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForSelector("[data-student-key]", { timeout: 30000 });
}

async function shot(page, name, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(350);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", file);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await login(page);

  const keys = await page.locator("[data-student-key]").evaluateAll((els) =>
    els.map((e) => e.getAttribute("data-student-key")),
  );
  console.log("students", keys);

  await page.locator('[data-student-key="stu_minji_main"]').scrollIntoViewIfNeeded();
  await shot(page, "pc_01_요약", 1280, 800);
  await shot(page, "phone_01_요약", 390, 844);

  const minji = page.locator('[data-student-key="stu_minji_main"]');
  await minji.locator('button[role="tab"]', { hasText: "날짜별" }).click();
  await page.waitForTimeout(300);
  await minji.locator(".overall, [data-testid=day-summary]").first().scrollIntoViewIfNeeded();
  await shot(page, "pc_02_날짜별_종합펼침", 1280, 800);
  await shot(page, "phone_02_날짜별_종합펼침", 390, 844);

  const folds = minji.locator("details.fold-toggle");
  const n = await folds.count();
  console.log("folds", n);
  if (n > 0) {
    const sum = folds.nth(0).locator("summary");
    await sum.scrollIntoViewIfNeeded();
    await sum.click({ force: true });
    await page.waitForTimeout(250);
    await shot(page, "pc_03_코멘트_펼침", 1280, 800);
    await shot(page, "phone_03_코멘트_펼침", 390, 844);
  }

  for (const [key, label] of [
    ["stu_reinforce", "04_보강_조금더다듬기"],
    ["stu_noguide", "05_next_focus빈칸"],
    ["stu_alldone", "06_모든단계완료"],
  ]) {
    const el = page.locator(`[data-student-key="${key}"]`);
    if (!(await el.count())) {
      console.log("missing", key);
      continue;
    }
    await el.scrollIntoViewIfNeeded();
    await el.locator('button[role="tab"]', { hasText: "단계별" }).click().catch(() => {});
    await page.waitForTimeout(250);
    await el.locator(".sum, .nextwell, .done").first().scrollIntoViewIfNeeded().catch(() => {});
    await shot(page, `pc_${label}`, 1280, 800);
    await shot(page, `phone_${label}`, 390, 844);
  }

  const long = page.locator('[data-student-key="stu_longtext"]');
  if (await long.count()) {
    await long.scrollIntoViewIfNeeded();
    await long.locator('button[role="tab"]', { hasText: "날짜별" }).click();
    await page.waitForTimeout(300);
    await long.locator(".overall, [data-testid=day-summary]").first().scrollIntoViewIfNeeded();
    await shot(page, "pc_07_3000자긴글", 1280, 800);
    await shot(page, "phone_07_3000자긴글", 390, 844);
  }

  await page.goto(`${BASE}/junior`, { waitUntil: "domcontentloaded" });
  await shot(page, "pc_08_junior", 1280, 800);
  await shot(page, "phone_08_junior", 390, 844);

  for (const [route, label] of [["/", "home"], ["/book", "book"], ["/checkout", "checkout"]]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    const header = page.locator("header").first();
    let pos = "n/a";
    if (await header.count()) {
      pos = await header.evaluate((el) => getComputedStyle(el).position);
    }
    console.log(`sticky_check ${label}: position=${pos}`);
    await page.screenshot({ path: path.join(OUT, `pc_reg_${label}.png`), fullPage: false });
  }

  await page.goto(`${BASE}/feedback`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-student-key]", { timeout: 30000 });
  const bodyText = await page.locator("body").innerText();
  const leaks = ["이강사", "박강사"].filter((n) => bodyText.includes(n));
  console.log("instructor_leaks", leaks.length ? leaks : "none");
  console.log("has_담당강사", bodyText.includes("담당 강사"));
  console.log("has_조금더다듬기", bodyText.includes("조금 더 다듬기"));
  console.log("has_할수있어요", bodyText.includes("할 수 있어요"));
  console.log("has_배우기전", bodyText.includes("배우기 전"));

  await browser.close();
  console.log("done", fs.readdirSync(OUT).length, "files");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
