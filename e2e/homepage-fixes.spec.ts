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

test("resorts index has only five resorts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.goto("/resorts", { waitUntil: "networkidle" });
  await expect(page.getByTestId("resort-index-high1")).toBeVisible();
  await expect(page.getByTestId("resort-index-yongpyong")).toBeVisible();
  await expect(page.getByTestId("resort-index-vivaldi")).toBeVisible();
  await expect(page.getByTestId("resort-index-jisan")).toBeVisible();
  await expect(page.getByTestId("resort-index-welli-hilli")).toBeVisible();
  await expect(page.getByTestId("resort-index-alpensia")).toHaveCount(0);
  await expect(page.getByTestId("resort-index-muju")).toHaveCount(0);
  await shot(page, "resorts_index_five_only");
});

test("alpensia and muju pages are gone", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  const alpensia = await page.goto("/resorts/alpensia", { waitUntil: "networkidle" });
  expect(alpensia?.status()).toBeGreaterThanOrEqual(400);
  const muju = await page.goto("/resorts/muju", { waitUntil: "networkidle" });
  expect(muju?.status()).toBeGreaterThanOrEqual(400);
});

test("welli badge fee 40000 for 2/3/4h on landing and book", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.goto("/resorts/welli-hilli", { waitUntil: "networkidle" });
  await expect(page.getByTestId("resort-badge-fee")).toBeVisible();
  await expect(page.getByTestId("resort-badge-fee")).toContainText("40,000");
  await expect(page.getByTestId("resort-badge-fee")).toContainText("2·3·4시간");
  await shot(page, "resort_welli_badge_fee_confirmed");

  await page.goto("/book?resort=welli-hilli", { waitUntil: "networkidle" });
  await expect(page.getByTestId("badge-fee-notice")).toBeVisible();
  await expect(page.getByTestId("badge-fee-notice")).toContainText("40,000");
  await page.getByTestId("duration-3").click();
  // 합계에 패찰비 4만 반영(강습비 14만+패찰 4만=18만 for 1:1 2h; 3h=21만+4만)
  await expect(page.getByText("40,000원").or(page.getByText("패찰비"))).toBeVisible();
  await shot(page, "book_welli_badge_fee_3h");
});

test("book allows dates before Dec 7 by default", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.goto("/book", { waitUntil: "networkidle" });
  await expect(page.getByTestId("booking-form")).toBeVisible();

  const today = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
  if (await page.getByTestId(`day-${today}`).count()) {
    await page.getByTestId(`day-${today}`).click();
  }
  await page.getByTestId("resort-하이원리조트").click();
  await page.getByTestId("duration-2").click();
  await expect(page.getByTestId("opening-soon-notice")).toHaveCount(0);
  await expect(page.getByTestId("start-badge-09:00")).not.toHaveText("오픈 예정", { timeout: 20_000 });
  await expect(page.getByTestId("start-badge-09:00")).toContainText(/잔여 \d+팀|잔여 확인 중/, {
    timeout: 20_000,
  });
  await shot(page, "book_open_before_dec7");

  // 11/27 선택 가능 확인
  if (await page.getByTestId("day-2026-11-27").count()) {
    await page.getByTestId("day-2026-11-27").click();
    await expect(page.getByTestId("opening-soon-notice")).toHaveCount(0);
    await expect(page.getByTestId("start-badge-09:00")).toContainText(/잔여 \d+팀|잔여 확인 중/, {
      timeout: 20_000,
    });
    await shot(page, "book_open_nov27");
  }
});

test("home manager copy and five resorts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByText("담당 매니저가 일정을 확인하고")).toBeVisible();
  await expect(page.getByText("사장님이 일정을")).toHaveCount(0);
  await expect(page.getByText("알펜시아")).toHaveCount(0);
  await expect(page.getByText("무주")).toHaveCount(0);
  await shot(page, "home_five_resorts");
});
