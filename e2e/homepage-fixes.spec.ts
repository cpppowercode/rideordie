import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "/opt/cursor/artifacts/screenshots";

async function shot(page: import("@playwright/test").Page, name: string, fullPage = true) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  await page.addStyleTag({
    content: "header,.sticky,[class*='sticky']{position:static!important;top:auto!important;bottom:auto!important;}",
  });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, `${name}.png`),
    fullPage,
  });
}

test("resorts index includes alpensia and muju", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.goto("/resorts", { waitUntil: "networkidle" });
  await expect(page.getByTestId("resort-index-alpensia")).toBeVisible();
  await expect(page.getByTestId("resort-index-muju")).toBeVisible();
  await shot(page, "resorts_index_with_muju");
});

test("alpensia and muju landing pages", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.goto("/resorts/alpensia", { waitUntil: "networkidle" });
  await expect(page.getByTestId("resort-alpensia")).toBeVisible();
  await shot(page, "resort_alpensia");

  await page.goto("/resorts/muju", { waitUntil: "networkidle" });
  await expect(page.getByTestId("resort-muju")).toBeVisible();
  await shot(page, "resort_muju");
});

test("welli badge fee notice on landing and book", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.goto("/resorts/welli-hilli", { waitUntil: "networkidle" });
  await expect(page.getByTestId("resort-badge-fee")).toBeVisible();
  await expect(page.getByTestId("resort-badge-fee")).toContainText("40,000");
  await shot(page, "resort_welli_badge_fee");

  await page.goto("/book?resort=welli-hilli", { waitUntil: "networkidle" });
  await expect(page.getByTestId("badge-fee-notice")).toBeVisible();
  await shot(page, "book_welli_badge_fee");
});

test("book shows opening soon before season start", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.goto("/book", { waitUntil: "networkidle" });
  await expect(page.getByTestId("booking-form")).toBeVisible();
  // 오늘(시즌 오픈 전) 선택 시 오픈 예정
  const today = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
  if (await page.getByTestId(`day-${today}`).count()) {
    await page.getByTestId(`day-${today}`).click();
  }
  await expect(page.getByTestId("opening-soon-notice")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("start-badge-09:00")).toHaveText("오픈 예정");
  await shot(page, "book_opening_soon");

  // 시즌 오픈 후 날짜 → 잔여 N팀
  for (let i = 0; i < 8; i += 1) {
    if (await page.getByTestId("day-2026-12-20").count()) break;
    await page.getByTestId("cal-next").click();
  }
  await page.getByTestId("day-2026-12-20").click();
  await page.getByTestId("resort-하이원리조트").click();
  await expect(page.getByTestId("start-badge-09:00")).toContainText(/잔여 \d+팀|잔여 확인 중/, {
    timeout: 20_000,
  });
  await shot(page, "book_open_remaining");
});

test("home manager copy and early bird price", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByText("담당 매니저가 일정을 확인하고")).toBeVisible();
  await expect(page.getByTestId("home-headline-price")).toContainText("14만원");
  await expect(page.getByText("사장님이 일정을")).toHaveCount(0);
  await shot(page, "home_manager_copy");
});
