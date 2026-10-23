import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "/opt/cursor/artifacts/screenshots";
const STATE_FILE = "/tmp/rideordie-e2e-booking.json";
const TEST_NAME = "테스트 예약 (삭제 예정)";
const TEST_PHONE = "010-0000-0000";
const LESSON_DATE = process.env.E2E_LESSON_DATE || "2027-01-24";
const SKI_RESORT = "하이원리조트";
const DURATION_HOURS = 2;
const START_HOUR = 9;
const START_ID = "09:00";
const TIME_LABEL = "09:00~11:00";
const ADMIN_URL = "https://admin.rideordie.kr/api/reservations";

type BookingState = {
  orderNo?: string;
  reservationId?: string | null;
  noticeSent?: string[];
  noticeSkipped?: string[];
  noticeFailed?: string[];
};

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

async function shot(page: Page, name: string, fullPage = true) {
  ensureDir(ARTIFACT_DIR);
  await page.addStyleTag({
    content: "header,.sticky,[class*='sticky']{position:static!important;top:auto!important;bottom:auto!important;}",
  });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, `${name}.png`),
    fullPage,
  });
}

function readState(): BookingState {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as BookingState;
  } catch {
    return {};
  }
}

function writeState(state: BookingState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function goToLessonMonth(page: Page) {
  for (let i = 0; i < 16; i += 1) {
    if (await page.getByTestId(`day-${LESSON_DATE}`).count()) return;
    await page.getByTestId("cal-next").click();
  }
  throw new Error(`달력에서 ${LESSON_DATE} 를 찾지 못했습니다.`);
}

async function fillSchedule(page: Page) {
  await goToLessonMonth(page);
  await page.getByTestId(`day-${LESSON_DATE}`).click();
  await page.getByTestId(`resort-${SKI_RESORT}`).click();
  await page.getByTestId(`duration-${DURATION_HOURS}`).click();
  const start = page.getByTestId(`start-${START_ID}`);
  await expect(start).toBeVisible({ timeout: 20_000 });
  await expect(start).toBeEnabled({ timeout: 20_000 });
  await start.click();
}

test.describe("desktop booking", () => {
  test("home, wizard, confirmation, admin sync", async ({ page, request }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "데스크톱에서만 실제 예약을 만듭니다.");
    test.skip(process.env.E2E_LIVE_ADMIN !== "1", "실제 관리자 예약은 E2E_LIVE_ADMIN=1 일 때만 생성합니다.");

    await page.goto("/");
    await expect(page.getByTestId("home-page")).toBeVisible();
    await expect(page.locator("text=채널톡")).toHaveCount(0);
    await expect(page.locator("script[src*='channel.io']")).toHaveCount(0);
    await shot(page, "home_desktop");

    await page.getByTestId("home-cta-book").click();
    await expect(page.getByTestId("booking-form")).toBeVisible();
    await fillSchedule(page);
    await expect(page.getByTestId("start-grid")).toContainText(TIME_LABEL);
    await shot(page, "booking_step1_desktop");

    await page.getByTestId("booking-next").click();
    await expect(page.getByTestId("step-info")).toBeVisible();
    await page.getByTestId("input-name").fill(TEST_NAME);
    await page.getByTestId("input-phone").fill(TEST_PHONE);
    await page.getByTestId("type-ski").click();
    await page.getByTestId("input-notes").fill("E2E 테스트 예약. 삭제 예정.");
    await shot(page, "booking_step2_desktop");

    await page.getByTestId("booking-next").click();
    await expect(page.getByTestId("step-confirm")).toBeVisible();
    await expect(page.getByTestId("booking-summary")).toContainText(TEST_NAME);
    await expect(page.getByTestId("booking-summary")).toContainText("2시간");
    await expect(page.getByTestId("booking-summary")).toContainText(TIME_LABEL);
    await shot(page, "booking_step3_desktop");

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/bookings") && res.request().method() === "POST"
    );
    await page.getByTestId("booking-submit").click();
    const apiRes = await responsePromise;
    const body = await apiRes.json();
    expect(apiRes.ok(), JSON.stringify(body)).toBeTruthy();
    expect(body.success).toBeTruthy();
    expect(String(body.orderNo)).toMatch(/^WEB_/);
    expect(Number(body.amount)).toBe(140000);

    writeState({
      orderNo: body.orderNo,
      reservationId: body.reservationId,
    });

    await expect(page.getByTestId("book-pay")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("pay-order-no")).toHaveText(body.orderNo);
    await expect(page.getByTestId("pay-amount")).toContainText("140,000");
    await shot(page, "booking_pay_desktop");

    const adminRes = await request.get(
      `${ADMIN_URL}?tenantId=rideordie&dateFrom=${LESSON_DATE}&dateTo=${LESSON_DATE}&showAllLessons=true&limit=50`,
      { headers: { "X-Tenant-Id": "rideordie" } }
    );
    const adminBody = await adminRes.json();
    expect(adminRes.ok(), JSON.stringify(adminBody)).toBeTruthy();
    const row = (adminBody.data || []).find((item: { order_no?: string }) => item.order_no === body.orderNo);
    expect(row, `admin row missing for ${body.orderNo}`).toBeTruthy();
    expect(row.customer_name).toBe(TEST_NAME);
    expect(String(row.customer_phone).replace(/\D/g, "")).toBe("01000000000");
    expect(row.ski_resort).toContain("하이원");
    expect(Number(row.lesson_start_hour)).toBe(START_HOUR);
    expect(Number(row.lesson_duration_hours)).toBe(DURATION_HOURS);
    expect(String(row.notes || "")).toMatch(/강습 2시간/);
    expect(String(row.notes || "")).toMatch(/09:00~11:00/);
    expect(row.reservation_status).toBe("pending");
    expect(row.payment_status).toBe("pending");
    expect(Number(row.amount)).toBe(140000);
    expect(row.payment_method === "app" || row.payment_method === "toss" || !row.payment_method).toBeTruthy();
    expect(String(row.order_no)).toMatch(/^WEB_/);
    if (row.id) {
      const state = readState();
      writeState({ ...state, reservationId: row.id });
    }

    const dup = await request.post("/api/bookings", {
      data: {
        customerName: TEST_NAME,
        customerPhone: TEST_PHONE,
        participants: 1,
        childCount: 1,
        skiResort: SKI_RESORT,
        lessonType: "ski",
        lessonDate: LESSON_DATE,
        durationHours: DURATION_HOURS,
        startHour: START_HOUR,
        notes: "duplicate-phone probe",
      },
    });
    expect(dup.status()).toBe(409);
    const dupBody = await dup.json();
    expect(String(dupBody.error)).toMatch(/이미 예약/);

    const full = await request.post("/api/bookings", {
      data: {
        customerName: "용량 테스트",
        customerPhone: "010-1111-1111",
        participants: 1,
        childCount: 0,
        skiResort: SKI_RESORT,
        lessonType: "ski",
        lessonDate: LESSON_DATE,
        durationHours: DURATION_HOURS,
        startHour: START_HOUR,
        notes: "capacity probe",
      },
    });
    const fullBody = await full.json();
    if (full.ok()) {
      fs.writeFileSync("/tmp/rideordie-e2e-extra.json", JSON.stringify(fullBody, null, 2));
    }
    expect(full.status(), JSON.stringify(fullBody)).toBe(409);
    expect(String(fullBody.error || "")).toMatch(/마감/);

    const cleanup: Record<string, unknown> = { orderNo: body.orderNo, id: row.id };
    try {
      const del = await request.fetch(ADMIN_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "X-Tenant-Id": "rideordie" },
        data: { id: row.id, tenant_id: "rideordie" },
      });
      cleanup.deleteStatus = del.status();
      cleanup.deleteBody = await del.json().catch(() => ({}));
      if (del.ok()) {
        cleanup.method = "delete";
      } else {
        const put = await request.fetch(ADMIN_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "X-Tenant-Id": "rideordie" },
          data: {
            id: row.id,
            tenant_id: "rideordie",
            reservation_status: "cancelled",
            payment_status: "cancelled",
          },
        });
        cleanup.putStatus = put.status();
        cleanup.putBody = await put.json().catch(() => ({}));
        cleanup.method = put.ok() ? "cancel" : "failed";
      }
    } catch (error) {
      cleanup.method = "failed";
      cleanup.error = error instanceof Error ? error.message : String(error);
    }
    writeState({ ...readState(), ...cleanup });
    ensureDir(ARTIFACT_DIR);
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, "e2e_admin_result.json"),
      JSON.stringify({ booking: body, adminRow: row, cleanup }, null, 2)
    );
  });
});

test.describe("mobile layout", () => {
  test("home and booking steps", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "모바일 뷰포트 전용");

    await page.goto("/");
    await expect(page.getByTestId("home-page")).toBeVisible();
    await shot(page, "home_mobile");

    await page.getByTestId("home-cta-book").click();
    await expect(page.getByTestId("booking-form")).toBeVisible();
    await fillSchedule(page);
    await shot(page, "booking_step1_mobile");

    await page.getByTestId("booking-next").click();
    await expect(page.getByTestId("step-info")).toBeVisible();
    await page.getByTestId("input-name").fill(TEST_NAME);
    await page.getByTestId("input-phone").fill(TEST_PHONE);
    await shot(page, "booking_step2_mobile");

    await page.getByTestId("booking-next").click();
    await expect(page.getByTestId("step-confirm")).toBeVisible();
    await expect(page.getByTestId("price-payable")).toBeVisible();
    await shot(page, "booking_step3_mobile");
  });
});
