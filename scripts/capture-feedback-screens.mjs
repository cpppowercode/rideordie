/**
 * 로컬 mock 환경 모바일 스크린샷 캡처 (운영 DB 미사용).
 */
import { chromium, devices } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const BASE = process.env.FEEDBACK_BASE || "http://127.0.0.1:3010";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";
fs.mkdirSync(OUT, { recursive: true });

const KAKAO_UA =
  "Mozilla/5.0 (Linux; Android 13; SM-S908N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 KAKAOTALK";

const phone = devices["iPhone 13"];

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log("saved", file);
  return file;
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...phone,
    userAgent: KAKAO_UA,
    locale: "ko-KR",
  });
  const page = await context.newPage();

  // 1 login form
  await page.goto(`${BASE}/feedback`, { waitUntil: "networkidle" });
  await shot(page, "feedback_01_login_form");

  async function fillLogin(name, phone) {
    const nameInput = page.locator('input[name="name"]');
    const phoneInput = page.locator('input[name="phone"]');
    await nameInput.click({ clickCount: 3 });
    await nameInput.fill(name);
    await phoneInput.click({ clickCount: 3 });
    await phoneInput.fill(phone);
    // React controlled 값 확인
    await page.waitForFunction(
      ([n, p]) => {
        const nameEl = document.querySelector('input[name="name"]');
        const phoneEl = document.querySelector('input[name="phone"]');
        return nameEl?.value === n && phoneEl?.value === p;
      },
      [name, phone],
    );
  }

  // 2 wrong login
  await fillLogin("없는사람", "01099998888");
  await page.click('button[type="submit"]');
  await page.waitForSelector('[role="alert"]', { timeout: 15000 });
  await shot(page, "feedback_02_invalid_message");

  // 3 locked
  await fillLogin("잠금", "01012345678");
  await page.click('button[type="submit"]');
  await page.waitForSelector('[role="alert"]', { timeout: 15000 });
  await shot(page, "feedback_03_locked_message");

  // 4 success
  await fillLogin("테스트", "01012345678");
  const remember = page.locator('input[type="checkbox"]');
  if (!(await remember.isChecked())) await remember.check();
  await page.click('button[type="submit"]');
  await page.waitForSelector("text=내 강습 피드백", { timeout: 20000 });
  await shot(page, "feedback_04_list_after_login");

  const cookies = await context.cookies();
  const sess = cookies.find((c) => c.name === "rod_fb_session");
  console.log(
    "cookie",
    sess
      ? {
          name: sess.name,
          httpOnly: sess.httpOnly,
          secure: sess.secure,
          sameSite: sess.sameSite,
          path: sess.path,
          hasExpires: Boolean(sess.expires && sess.expires > 0),
        }
      : null,
  );

  // 강사 실명 비노출 · 담당 강사만
  const listText = await page.locator('[data-student-key="stu_junior_ski"]').innerText();
  const hasRealName = /이강사|박강사|최강사/.test(listText);
  const hasPublicLabel = listText.includes("담당 강사");
  console.log("instructor real name leaked?", hasRealName);
  console.log("instructor public label present?", hasPublicLabel);
  if (hasRealName) throw new Error("instructor real name visible on customer UI");
  if (!hasPublicLabel) throw new Error("expected 담당 강사 on customer UI");

  await page.locator('[data-testid="history-views"]').first().waitFor();
  await page.locator('[data-testid="view-by-step"]').first().waitFor();
  await shot(page, "feedback_05_history_by_step");

  const firstEval = page.locator('[data-testid="first-eval"]').first();
  if (await firstEval.count()) {
    await firstEval.scrollIntoViewIfNeeded();
    await shot(page, "feedback_05b_first_eval");
  }
  const change = page.locator('[data-testid="mark-change"]').first();
  if (await change.count()) {
    await change.scrollIntoViewIfNeeded();
    await shot(page, "feedback_05c_mark_change");
  }

  // 회차별 탭
  await page
    .locator('[data-testid="history-views"]')
    .first()
    .locator('button[role="tab"]', { hasText: "회차별" })
    .click();
  await page.locator('[data-testid="view-by-session"]').first().waitFor();
  await shot(page, "feedback_05d_history_by_session");

  await page.locator('[data-testid="junior-grade-card"]').first().scrollIntoViewIfNeeded();
  await shot(page, "feedback_06_junior_card_and_badges");

  // sport toggle (ski-only junior may have no toggle; board junior below)
  const skiBtn = page.locator('.fb-sport-toggle button', { hasText: "스키" }).first();
  const boardBtn = page.locator('.fb-sport-toggle button', { hasText: "보드" }).first();
  if ((await skiBtn.count()) && (await boardBtn.count())) {
    await skiBtn.click();
    await shot(page, "feedback_07_sport_ski");
    await boardBtn.click();
    await shot(page, "feedback_07b_sport_board");
  }

  // board junior card present
  const boardJunior = page.locator('[data-student-key="stu_junior_board"]');
  await boardJunior.scrollIntoViewIfNeeded();
  await shot(page, "feedback_08_board_junior_card");
  console.log(
    "board junior card count",
    await boardJunior.locator('[data-testid="junior-grade-card"]').count(),
  );

  // adult — scroll to 서연
  const adult = page.locator('[data-student-key="stu_adult"]');
  await adult.scrollIntoViewIfNeeded();
  await shot(page, "feedback_09_adult_no_junior_card");
  const adultJunior = adult.locator('[data-testid="junior-grade-card"]');
  console.log("adult junior card count", await adultJunior.count());

  // logout
  await page.click("text=로그아웃");
  await page.waitForSelector("text=강습 피드백");
  await shot(page, "feedback_10_after_logout");

  // share token needs login
  await context.clearCookies();
  await page.goto(`${BASE}/feedback/demo-share-token`, { waitUntil: "networkidle" });
  await shot(page, "feedback_11_share_needs_login");

  // login via share (레이트리밋이면 창 대기 후 페이지 재진입)
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      console.log("share login retry after rate limit, attempt", attempt + 1);
      await page.waitForTimeout(65000);
      await context.clearCookies();
      await page.goto(`${BASE}/feedback/demo-share-token`, {
        waitUntil: "networkidle",
      });
    }
    await page.waitForSelector('input[name="name"]', { timeout: 15000 });
    await fillLogin("테스트", "01012345678");
    await page.click('button[type="submit"]');
    const landed = await page
      .waitForSelector("text=내 강습 피드백", { timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    if (landed) break;
    const alertText =
      (await page.locator('[role="alert"]').textContent().catch(() => "")) || "";
    if (attempt === 2) throw new Error(`share login failed: ${alertText}`);
  }
  await shot(page, "feedback_12_share_after_login");

  // junior page — age wording only in .fb-root (layout 헤더 제외)
  await page.goto(`${BASE}/junior`, { waitUntil: "networkidle" });
  await shot(page, "feedback_13_junior_page");
  const bodyText = await page.locator(".fb-root").innerText();
  const ageHit = /(나이|연령|\d+\s*세|만\s*\d+)/.test(bodyText);
  console.log("junior age wording present?", ageHit);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
