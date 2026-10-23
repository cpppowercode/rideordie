import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "/opt/cursor/artifacts/screenshots";
const LESSON_DATE = "2026-12-20";

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

async function shot(page: Page, name: string) {
  ensureDir(ARTIFACT_DIR);
  await page.addStyleTag({
    content: "header,.sticky,[class*='sticky']{position:static!important;top:auto!important;bottom:auto!important;}",
  });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, `${name}.png`),
    fullPage: true,
  });
}

async function goToDecember(page: Page) {
  for (let i = 0; i < 8; i += 1) {
    if (await page.getByTestId(`day-${LESSON_DATE}`).count()) return;
    await page.getByTestId("cal-next").click();
  }
  throw new Error(`달력에서 ${LESSON_DATE} 를 찾지 못했습니다.`);
}

test.describe("grooming blocks", () => {
  test("disabled 정설 시간 slot in the booking UI", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "데스크톱에서 정설 UI를 확인합니다.");

    await page.goto("/book");
    await expect(page.getByTestId("booking-form")).toBeVisible();
    await goToDecember(page);
    await page.getByTestId(`day-${LESSON_DATE}`).click();

    await expect(page.getByTestId("resort-오투리조트")).toHaveCount(0);

    await page.getByTestId("resort-하이원리조트").click();
    await expect(page.getByTestId("slot-pm4")).toBeDisabled();
    await expect(page.getByTestId("slot-badge-pm4")).toHaveText("정설 시간");
    await expect(page.getByTestId("slot-badge-night2")).not.toHaveText("확인 중");
    await expect(page.getByTestId("slot-night2")).toBeEnabled();
    await expect(page.getByTestId("slot-badge-night2")).toContainText("잔여");

    await page.getByTestId("resort-비발디파크").click();
    await expect(page.getByTestId("slot-night2")).toBeDisabled();
    await expect(page.getByTestId("slot-badge-night2")).toHaveText("정설 시간");
    await expect(page.getByTestId("slot-badge-am2")).not.toHaveText("확인 중");
    await expect(page.getByTestId("slot-am2")).toBeEnabled();
    await expect(page.getByTestId("slot-badge-am2")).toContainText("잔여");
    await expect(page.getByTestId("slot-badge-pm4")).not.toHaveText("정설 시간");
    await expect(page.getByTestId("slot-badge-pm4")).toContainText("잔여");
    await shot(page, "booking_grooming_vivaldi_page");
    ensureDir(ARTIFACT_DIR);
    await page.locator("section", { has: page.getByRole("heading", { name: "시간대" }) }).screenshot({
      path: path.join(ARTIFACT_DIR, "booking_grooming_vivaldi_slots.png"),
    });
  });

  test("API rejects a grooming slot", async ({ request }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "API 거절은 한 번만 확인합니다.");

    const res = await request.post("/api/bookings", {
      data: {
        customerName: "정설 테스트",
        customerPhone: "010-0000-0000",
        participants: 1,
        childCount: 0,
        skiResort: "비발디파크",
        lessonType: "ski",
        lessonDate: LESSON_DATE,
        slotId: "night2",
        notes: "grooming reject probe",
      },
    });
    const body = await res.json();
    expect(res.status(), JSON.stringify(body)).toBe(409);
    expect(String(body.error)).toMatch(/정설 시간/);

    const high1 = await request.post("/api/bookings", {
      data: {
        customerName: "정설 테스트",
        customerPhone: "010-0000-0000",
        participants: 1,
        childCount: 0,
        skiResort: "하이원리조트",
        lessonType: "ski",
        lessonDate: LESSON_DATE,
        slotId: "pm4",
        notes: "grooming reject probe high1",
      },
    });
    const high1Body = await high1.json();
    expect(high1.status(), JSON.stringify(high1Body)).toBe(409);
    expect(String(high1Body.error)).toMatch(/정설 시간에는 강습을 예약할 수 없습니다/);

    const o2Avail = await request.get(
      `/api/bookings/availability?date=${LESSON_DATE}&skiResort=${encodeURIComponent("오투리조트")}`
    );
    const o2AvailBody = await o2Avail.json();
    expect(o2Avail.status(), JSON.stringify(o2AvailBody)).toBe(400);
    expect(String(o2AvailBody.error)).toMatch(/스키장/);

    const o2 = await request.post("/api/bookings", {
      data: {
        customerName: "오투 테스트",
        customerPhone: "010-0000-0000",
        participants: 1,
        childCount: 0,
        skiResort: "오투리조트",
        lessonType: "ski",
        lessonDate: LESSON_DATE,
        slotId: "am2",
        notes: "o2 reject probe",
      },
    });
    const o2Body = await o2.json();
    expect(o2.status(), JSON.stringify(o2Body)).toBe(400);
    expect(String(o2Body.error)).toMatch(/스키장/);
  });
});
