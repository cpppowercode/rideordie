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

  // 2 wrong login
  await page.fill('input[name="name"]', "없는사람");
  await page.fill('input[name="phone"]', "01099998888");
  await page.click('button[type="submit"]');
  await page.waitForSelector('[role="alert"]');
  await shot(page, "feedback_02_invalid_message");

  // 3 locked
  await page.fill('input[name="name"]', "잠금");
  await page.fill('input[name="phone"]', "01012345678");
  await page.click('button[type="submit"]');
  await page.waitForSelector('[role="alert"]');
  await shot(page, "feedback_03_locked_message");

  // 4 success
  await page.fill('input[name="name"]', "테스트");
  await page.fill('input[name="phone"]', "01012345678");
  const remember = page.locator('input[type="checkbox"]');
  if (!(await remember.isChecked())) await remember.check();
  await page.click('button[type="submit"]');
  await page.waitForSelector("text=내 강습 피드백");
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

  await page.locator('[data-testid="step-grouped-view"]').first().waitFor();
  await shot(page, "feedback_05_step_grouped");

  // expand/collapse older round if present
  const fold = page.locator('[data-step-label="스노우플라우"] button', {
    hasText: "펼치기",
  }).first();
  if (await fold.count()) {
    await fold.click();
    await shot(page, "feedback_05b_round_expanded");
  }
  const change = page.locator('[data-testid="mark-change"]').first();
  if (await change.count()) {
    await change.scrollIntoViewIfNeeded();
    await shot(page, "feedback_05c_mark_change");
  }

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

  // login via share
  await page.fill('input[name="name"]', "테스트");
  await page.fill('input[name="phone"]', "01012345678");
  await page.click('button[type="submit"]');
  await page.waitForSelector("text=내 강습 피드백");
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
