/**
 * sticky 헤더 회귀: /feedback·/junior만 relative, 메인·/book·/checkout는 sticky 유지.
 * 데스크톱 1280 · 휴대폰 390 스크롤 전/후 캡처 + computed style 검사.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.FEEDBACK_BASE || "http://127.0.0.1:3010";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  { path: "/", expectSticky: true, name: "home" },
  { path: "/book", expectSticky: true, name: "book" },
  { path: "/checkout", expectSticky: true, name: "checkout" },
  { path: "/feedback", expectSticky: false, name: "feedback" },
  { path: "/junior", expectSticky: false, name: "junior" },
];

const VIEWPORTS = [
  { label: "d1280", width: 1280, height: 800 },
  { label: "m390", width: 390, height: 844 },
];

async function headerState(page) {
  return page.evaluate(() => {
    const el = document.querySelector("header");
    if (!el) return null;
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      position: cs.position,
      top: cs.top,
      dataFeedback: el.getAttribute("data-feedback-surface"),
      className: el.className,
      y: rect.y,
      height: rect.height,
    };
  });
}

async function runViewport(browser, vp) {
  const results = [];
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    locale: "ko-KR",
  });
  const page = await context.newPage();

  for (const p of PAGES) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(800);

    const before = await headerState(page);
    await page.screenshot({
      path: path.join(OUT, `sticky_${vp.label}_${p.name}_top.png`),
      fullPage: false,
    });

    await page.evaluate(() => window.scrollTo(0, Math.min(900, document.body.scrollHeight)));
    await page.waitForTimeout(500);

    const after = await headerState(page);
    await page.screenshot({
      path: path.join(OUT, `sticky_${vp.label}_${p.name}_scrolled.png`),
      fullPage: false,
    });

    const isSticky =
      after?.position === "sticky" ||
      (after?.position === "fixed" && Number(after?.y) === 0);
    // After scroll: sticky header stays near top (y≈0); relative scrolls away (y < 0)
    const stayedPinned = after != null && after.y >= -1 && after.y < 5;
    const scrolledAway = after != null && after.y < -20;

    let ok = false;
    let detail = "";
    if (p.expectSticky) {
      ok =
        before?.position === "sticky" &&
        after?.position === "sticky" &&
        stayedPinned &&
        before?.dataFeedback == null;
      detail = `pos=${after?.position} y=${after?.y?.toFixed?.(1)} data=${after?.dataFeedback}`;
    } else {
      ok =
        before?.position === "relative" &&
        after?.position === "relative" &&
        scrolledAway &&
        after?.dataFeedback === "true";
      detail = `pos=${after?.position} y=${after?.y?.toFixed?.(1)} data=${after?.dataFeedback}`;
    }

    const label = `${vp.label} ${p.path} sticky=${p.expectSticky}`;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label} — ${detail}`);
    results.push({ label, ok, detail, before, after });
  }

  await context.close();
  return results;
}

async function main() {
  // wait for server
  for (let i = 0; i < 30; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok || r.status === 200) break;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  const browser = await chromium.launch();
  const all = [];
  for (const vp of VIEWPORTS) {
    all.push(...(await runViewport(browser, vp)));
  }
  await browser.close();

  const failed = all.filter((r) => !r.ok);
  console.log(`\nsticky checks: ${all.length - failed.length}/${all.length} pass`);
  if (failed.length) {
    for (const f of failed) console.error("FAIL", f.label, f.detail);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
