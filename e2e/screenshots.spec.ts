import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "/opt/cursor/artifacts/screenshots";
const TEST_NAME = "테스트 예약 (삭제 예정)";
const TEST_PHONE = "010-0000-0000";
const LESSON_DATE = "2026-12-20";
const SKI_RESORT = "오투리조트";
const SLOT_ID = "night2";

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

async function goToDecember(page: import("@playwright/test").Page) {
  for (let i = 0; i < 8; i += 1) {
    if (await page.getByTestId(`day-${LESSON_DATE}`).count()) return;
    await page.getByTestId("cal-next").click();
  }
}

test("clean visual captures", async ({ page }, testInfo) => {
  const suffix = testInfo.project.name === "mobile" ? "mobile" : "desktop";

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByTestId("home-page")).toBeVisible();
  await expect(page.getByTestId("home-cta-book")).toBeVisible();
  await expect(page.getByTestId("home-cta-book")).toHaveCSS("background-color", "rgb(49, 130, 246)");
  await shot(page, `final_home_hero_${suffix}`, false);
  await shot(page, `final_home_full_${suffix}`, true);

  await page.goto("/book", { waitUntil: "networkidle" });
  await expect(page.getByTestId("booking-form")).toBeVisible();
  await goToDecember(page);
  await page.getByTestId(`day-${LESSON_DATE}`).click();
  await page.getByTestId(`resort-${SKI_RESORT}`).click();
  await page.getByTestId(`slot-${SLOT_ID}`).click();
  await shot(page, `final_booking_schedule_${suffix}`);

  await page.getByTestId("booking-next").click();
  await expect(page.getByTestId("step-info")).toBeVisible();
  await page.getByTestId("input-name").fill(TEST_NAME);
  await page.getByTestId("input-phone").fill(TEST_PHONE);
  await page.getByTestId("input-notes").fill("E2E 테스트 예약. 삭제 예정.");
  await shot(page, `final_booking_info_${suffix}`);

  await page.getByTestId("booking-next").click();
  await expect(page.getByTestId("step-confirm")).toBeVisible();
  await shot(page, `final_booking_review_${suffix}`);

  await page.goto(
    `/book/success?orderNo=${encodeURIComponent("WEB_1792754666968_C3ZXY2")}&date=${LESSON_DATE}&resort=${encodeURIComponent(SKI_RESORT)}&time=${encodeURIComponent("18:00–20:00")}&name=${encodeURIComponent(TEST_NAME)}&people=1`
  );
  await expect(page.getByTestId("booking-success")).toBeVisible();
  await shot(page, `final_booking_done_${suffix}`);
});
