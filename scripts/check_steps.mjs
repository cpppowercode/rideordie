import { chromium, devices } from "@playwright/test";
const phone = devices["iPhone 13"];
const UA =
  "Mozilla/5.0 (Linux; Android 13; SM-S908N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 KAKAOTALK";
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...phone, userAgent: UA, locale: "ko-KR" });
const page = await ctx.newPage();
await page.goto("http://127.0.0.1:3010/feedback", { waitUntil: "networkidle" });
await page.fill('input[name="name"]', "테스트");
await page.fill('input[name="phone"]', "01012345678");
await page.click('button[type="submit"]');
await page.waitForSelector('[data-testid="step-grouped-view"]');
const steps = await page
  .locator("[data-step-label]")
  .evaluateAll((els) => els.map((e) => e.getAttribute("data-step-label")));
const changes = await page.locator("[data-testid=mark-change]").count();
const latest = await page.locator("[data-latest=true]").count();
const snow = page.locator('[data-step-label="스노우플라우"]');
const rounds = await snow.locator("article").count();
const changeText = await page.locator("[data-testid=mark-change]").first().innerText();
console.log(
  JSON.stringify({ steps: steps.slice(0, 10), changes, latest, snowRounds: rounds, changeText }, null, 2),
);
await browser.close();
