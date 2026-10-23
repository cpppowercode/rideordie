import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "/opt/cursor/artifacts/screenshots";
const STATE_FILE = "/tmp/rideordie-e2e-booking.json";
const TEST_NAME = "테스트 예약 (삭제 예정)";
const TEST_PHONE = "010-0000-0000";
const LESSON_DATE = process.env.E2E_LESSON_DATE || "2026-12-20";
const SKI_RESORT = "오투리조트";
const SLOT_ID = "night2";
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

async function goToDecember(page: Page) {
  for (let i = 0; i < 8; i += 1) {
    if (await page.getByTestId(`day-${LESSON_DATE}`).count()) return;
    await page.getByTestId("cal-next").click();
  }
  throw new Error(`달력에서 ${LESSON_DATE} 를 찾지 못했습니다.`);
}

async function fillSchedule(page: Page) {
  await goToDecember(page);
  await page.getByTestId(`day-${LESSON_DATE}`).click();
  await page.getByTestId(`resort-${SKI_RESORT}`).click();
  const slot = page.getByTestId(`slot-${SLOT_ID}`);
  await expect(slot).toBeEnabled({ timeout: 20_000 });
  await slot.click();
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
    expect(Array.isArray(body.noticeSkipped)).toBeTruthy();

    writeState({
      orderNo: body.orderNo,
      reservationId: body.reservationId,
      noticeSent: body.noticeSent,
      noticeSkipped: body.noticeSkipped,
      noticeFailed: body.noticeFailed,
    });

    await expect(page.getByTestId("booking-success")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("success-order-no")).toHaveText(body.orderNo);
    await shot(page, "booking_confirmation_desktop");

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
    expect(row.ski_resort).toContain("오투");
    expect(row.reservation_status).toBe("pending");
    expect(row.payment_status).toBe("pending");
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
        slotId: SLOT_ID,
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
        slotId: SLOT_ID,
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
    writeState({ ...readState(), ...cleanup, noticeSent: body.noticeSent, noticeSkipped: body.noticeSkipped });
    ensureDir(ARTIFACT_DIR);
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, "e2e_admin_result.json"),
      JSON.stringify({ booking: body, adminRow: row, cleanup, noticeSkipped: body.noticeSkipped, noticeSent: body.noticeSent, noticeFailed: body.noticeFailed }, null, 2)
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
    await shot(page, "booking_step3_mobile");

    const state = readState();
    const successUrl = state.orderNo
      ? `/book/success?orderNo=${encodeURIComponent(state.orderNo)}&date=${LESSON_DATE}&resort=${encodeURIComponent(SKI_RESORT)}&time=${encodeURIComponent("18:00–20:00")}&name=${encodeURIComponent(TEST_NAME)}&people=1`
      : "/book/success?orderNo=WEB_PREVIEW&date=2026-12-20&resort=오투리조트";
    await page.goto(successUrl);
    await expect(page.getByTestId("booking-success")).toBeVisible();
    await shot(page, "booking_confirmation_mobile");
  });
});
