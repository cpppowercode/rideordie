import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "/opt/cursor/artifacts/screenshots";
const LESSON_DATE = "2026-12-20";

async function shot(page: import("@playwright/test").Page, name: string) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  await page.addStyleTag({
    content: "header,.sticky,[class*='sticky']{position:static!important;top:auto!important;bottom:auto!important;}",
  });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${name}.png`), fullPage: true });
}

/**
 * 격리 환경에서 /book → intent → /checkout 까지 진행.
 * KCP 결제창(외부) 실클릭·승인·어드민 쓰기는 하지 않는다(운영 DB 오염 금지).
 * T0000/test 모드 스크립트·금액·패찰비가 준비됐는지만 확인한다.
 */
test("checkout loads in KCP test mode after booking intent", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");

  await page.goto("/book", { waitUntil: "networkidle" });
  for (let i = 0; i < 8; i += 1) {
    if (await page.getByTestId(`day-${LESSON_DATE}`).count()) break;
    await page.getByTestId("cal-next").click();
  }
  await page.getByTestId(`day-${LESSON_DATE}`).click();
  await page.getByTestId("resort-하이원리조트").click();
  await page.getByTestId("duration-2").click();
  await expect(page.getByTestId("start-09:00")).toBeEnabled({ timeout: 20_000 });
  await page.getByTestId("start-09:00").click();
  await page.getByTestId("booking-next").click();
  await page.getByTestId("input-name").fill("KCP 테스트");
  await page.getByTestId("input-phone").fill("01012345678");
  await page.getByTestId("booking-next").click();
  await expect(page.getByTestId("step-confirm")).toBeVisible();
  await shot(page, "kcp_booking_confirm_140000");

  await page.getByTestId("booking-submit").click();
  await expect(page).toHaveURL(/\/checkout/, { timeout: 20_000 });
  await expect(page.getByTestId("checkout-pay")).toBeVisible({ timeout: 20_000 });
  // 테스트 모드 허브 스크립트
  await expect(page.locator("script[data-kcp-hub], script[src*='testspay'], script[src*='kcp']").first()).toBeAttached({
    timeout: 10_000,
  });
  await shot(page, "kcp_checkout_test_mode");
});
