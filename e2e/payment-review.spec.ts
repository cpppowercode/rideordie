import { expect, test } from "@playwright/test";

test.use({ channel: process.env.E2E_CHROME === "1" ? "chrome" : undefined });

test("uncertain payment warns against another payment and blocks checkout in the same tab", async ({ page }) => {
  await page.goto("/checkout/fail?code=APPROVE_FAIL&order=WEB_TEST_123");
  await expect(page.getByRole("heading", { name: "결제 확인이 필요합니다" })).toBeVisible();
  await expect(page.getByText(/다시 결제하지 말고/)).toBeVisible();
  await expect(page.getByRole("link", { name: "다시 결제하기" })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("rod_payment_review"))).toBe("WEB_TEST_123");
  await page.goto("/checkout");
  await expect(page.getByText(/이전 결제의 확인이 필요합니다/)).toBeVisible();
  await expect(page.getByTestId("checkout-pay")).toBeDisabled();
});

test("explicit cancellation still offers retry", async ({ page }) => {
  await page.goto("/checkout/fail?code=CANCEL");
  await expect(page.getByRole("link", { name: "다시 결제하기" })).toBeVisible();
});
