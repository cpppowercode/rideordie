import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "/opt/cursor/artifacts/screenshots";
const TEST_NAME = "테스트 결제 (삭제 예정)";
const TEST_PHONE = "010-0000-0001";
const LESSON_DATE = process.env.E2E_LESSON_DATE || "2027-01-24";
const SKI_RESORT = "하이원리조트";
const ADMIN_URL = "https://admin.rideordie.kr/api/reservations";

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

async function shot(page: Page, name: string, fullPage = true) {
  ensureDir(ARTIFACT_DIR);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, `${name}.png`),
    fullPage,
  });
}

async function goToLessonMonth(page: Page) {
  for (let i = 0; i < 16; i += 1) {
    if (await page.getByTestId(`day-${LESSON_DATE}`).count()) return;
    await page.getByTestId("cal-next").click();
  }
  throw new Error(`달력에서 ${LESSON_DATE} 를 찾지 못했습니다.`);
}

async function cleanupOrder(request: { fetch: Page["request"]["fetch"] }, id: string | null | undefined) {
  if (!id) return { method: "skipped" as const };
  const del = await request.fetch(ADMIN_URL, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", "X-Tenant-Id": "rideordie" },
    data: { id, tenant_id: "rideordie" },
  });
  if (del.ok()) return { method: "delete" as const, status: del.status() };
  const put = await request.fetch(ADMIN_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Tenant-Id": "rideordie" },
    data: {
      id,
      tenant_id: "rideordie",
      reservation_status: "cancelled",
      payment_status: "cancelled",
    },
  });
  return { method: put.ok() ? ("cancel" as const) : ("failed" as const), status: put.status() };
}

test.describe("toss payment", () => {
  test("shows live price, creates pending amount, toss widget, wrong-amount confirm rejected", async ({
    page,
    request,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "데스크톱에서 결제 흐름을 확인합니다.");

    await page.goto("/book");
    await expect(page.getByTestId("booking-form")).toBeVisible();
    await goToLessonMonth(page);
    await page.getByTestId(`day-${LESSON_DATE}`).click();
    await page.getByTestId(`resort-${SKI_RESORT}`).click();
    await page.getByTestId("duration-2").click();
    await expect(page.getByTestId("live-price")).toContainText("1:1");
    await expect(page.getByTestId("live-price")).toContainText("140,000원");
    await expect(page.getByTestId("live-price")).toContainText("150,000원");
    await shot(page, "booking_live_price");

    const start = page.getByTestId("start-09:00");
    await expect(start).toBeEnabled({ timeout: 20_000 });
    await start.click();
    await page.getByTestId("booking-next").click();
    await page.getByTestId("input-name").fill(TEST_NAME);
    await page.getByTestId("input-phone").fill(TEST_PHONE);
    await page.getByTestId("type-ski").click();
    await page.getByTestId("booking-next").click();
    await expect(page.getByTestId("step-confirm")).toBeVisible();
    await expect(page.getByTestId("price-payable")).toContainText("140,000원");
    await expect(page.getByTestId("price-regular")).toContainText("150,000원");
    await expect(page.getByTestId("price-early-bird")).toBeVisible();
    await shot(page, "booking_confirm_price");

    if (process.env.E2E_LIVE_ADMIN !== "1") {
      return;
    }

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/bookings") && res.request().method() === "POST"
    );
    await page.getByTestId("booking-submit").click();
    const apiRes = await responsePromise;
    const body = await apiRes.json();
    expect(apiRes.ok(), JSON.stringify(body)).toBeTruthy();
    expect(Number(body.amount)).toBe(140000);

    await expect(page.getByTestId("book-pay")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("toss-test-mode")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("toss-pay")).toBeEnabled({ timeout: 30_000 });
    await shot(page, "toss_widget_ready");

    const bad = await request.post("/api/payments/toss/confirm", {
      data: {
        paymentKey: "fake_payment_key",
        orderId: body.orderNo,
        amount: 1,
      },
    });
    expect(bad.status()).toBe(409);

    const adminRes = await request.get(
      `${ADMIN_URL}?tenantId=rideordie&searchQuery=${encodeURIComponent(body.orderNo)}&showAllLessons=true&limit=20`,
      { headers: { "X-Tenant-Id": "rideordie" } }
    );
    const adminBody = await adminRes.json();
    const row = (adminBody.data || []).find((item: { order_no?: string }) => item.order_no === body.orderNo);
    expect(row, `admin row missing for ${body.orderNo}`).toBeTruthy();
    expect(Number(row.amount)).toBe(140000);
    expect(row.payment_status).toBe("pending");

    let paid = false;
    try {
      await page.getByTestId("toss-pay").click();
      const tossFrame = page.frameLocator("iframe").first();
      await tossFrame.locator("body").waitFor({ timeout: 15_000 });
      await shot(page, "toss_payment_window");
    } catch {
      await shot(page, "toss_payment_window_skipped");
    }

    const cleanup = await cleanupOrder(request, row.id);
    expect(cleanup.method === "delete" || cleanup.method === "cancel").toBeTruthy();
    ensureDir(ARTIFACT_DIR);
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, "e2e_payment_result.json"),
      JSON.stringify({ booking: body, adminRow: row, cleanup, paid }, null, 2)
    );
  });
});
