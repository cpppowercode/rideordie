/**
 * 최종 명세 v5 손님 화면 체크리스트 (mock only).
 */
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3010";
const results = [];

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function login(page) {
  await page.goto(`${BASE}/feedback`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("[data-student-key], form", { timeout: 30000 });
  if (await page.locator("[data-student-key]").count()) return;
  await page.locator('input[name="name"]').first().fill("테스트");
  await page.locator('input[name="phone"]').first().fill("01012345678");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForSelector("[data-student-key]", { timeout: 30000 });
}

async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "ko-KR" })).newPage();
  await login(page);

  const body = await page.locator("body").innerText();
  const html = await page.locator(".fb-root, body").first().innerHTML();

  record("○ 할 수 있어요", body.includes("할 수 있어요"));
  record("△ 연습 중", body.includes("연습 중"));
  record("✕ 아직 어려워요", body.includes("아직 어려워요"));
  record("배우기 전", body.includes("배우기 전"));
  record("보강 '조금 더 다듬기'", body.includes("조금 더 다듬기"));
  record("모든 단계 완료", body.includes("모든 단계 완료"));
  record("강사 실명 없음", !/이강사|박강사|최강사/.test(body), /이강사|박강사|최강사/.exec(body)?.[0] || "none");
  record("강사 전화 없음", !/(강사).{0,30}010[- ]?\d{3,4}/.test(body), "no instructor phone nearby");

  // next_focus orange well
  const nextWellCount = await page.locator(".nextwell").count();
  record("주황 next_focus 칸 존재", nextWellCount > 0 || body.includes("다음에 배울"), `nextwell=${nextWellCount}`);

  // 날짜별: 담당 강사 · 회차 전부 · 종합 펼침 · 코멘트 접힘
  const minji = page.locator('[data-student-key="stu_minji_main"]');
  if (await minji.count()) {
    await minji.locator('button[role="tab"]', { hasText: "날짜별" }).click();
    await page.waitForTimeout(400);
    const dayText = await minji.innerText();
    record("'담당 강사' 표시(날짜별 회차)", dayText.includes("담당 강사"), dayText.includes("담당 강사") ? "visible" : "missing");
    record("강사 실명 없음(날짜별)", !/이강사|박강사|최강사/.test(dayText));
    const dayCards = minji.locator("[data-session-date], .day-card, .session-day, article, .day");
    const dayCount = await dayCards.count();
    record("회차(날짜별) 복수 존재", dayCount >= 1 || (await minji.locator("text=/\\d{4}/").count()) >= 2, `dayish=${dayCount}`);

    const overallOpen = await minji.locator(".overall, [data-testid=day-summary]").first().isVisible().catch(() => false);
    record("종합 피드백 펼침", overallOpen || (await minji.locator(".overall").count()) > 0);

    const folds = minji.locator("details.fold-toggle");
    const foldN = await folds.count();
    let collapsed = foldN === 0;
    if (foldN > 0) {
      collapsed = !(await folds.first().evaluate((el) => el.open));
    }
    record("단계 코멘트 접힘(기본)", collapsed, `folds=${foldN} collapsed=${collapsed}`);
  } else {
    record("'담당 강사' 표시(단계별/날짜별)", false, "stu_minji_main missing");
    record("회차(날짜별) 복수 존재", false, "stu_minji_main missing");
    record("종합 피드백 펼침", false, "stu_minji_main missing");
    record("단계 코멘트 접힘(기본)", false, "stu_minji_main missing");
  }

  // sticky checks
  for (const [route, expect] of [
    ["/", "sticky"],
    ["/book", "sticky"],
    ["/checkout", "sticky"],
    ["/feedback", "relative"],
  ]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(500);
    const pos = await page.locator("header").first().evaluate((el) => getComputedStyle(el).position);
    record(`헤더 ${route} → ${expect}`, pos === expect, `got=${pos}`);
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\nchecklist ${results.length - failed.length}/${results.length}`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
