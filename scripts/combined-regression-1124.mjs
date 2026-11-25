/**
 * 통합 검증 브랜치 로컬 클릭 회귀 (운영 DB·실결제·실발송 없음, KCP 테스트).
 */
import { chromium, devices } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  guestProxyRewrites,
  shouldAttachGuestRewriteHeader,
} from "../src/lib/guest-proxy.ts";

const BASE = process.env.FEEDBACK_BASE || "http://127.0.0.1:3010";
const OUT = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";
fs.mkdirSync(OUT, { recursive: true });

const results = [];

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log("saved", file);
  return file;
}

async function fillLogin(page, name, phone) {
  const nameInput = page.locator('input[name="name"]');
  const phoneInput = page.locator('input[name="phone"]');
  await nameInput.click({ clickCount: 3 });
  await nameInput.fill(name);
  await phoneInput.click({ clickCount: 3 });
  await phoneInput.fill(phone);
  await page.waitForFunction(
    ([n, p]) => {
      const nameEl = document.querySelector('input[name="name"]');
      const phoneEl = document.querySelector('input[name="phone"]');
      return nameEl?.value === n && phoneEl?.value === p;
    },
    [name, phone],
  );
}

async function apiCheck(name, pathOrUrl, init = {}) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${BASE}${pathOrUrl}`;
  const res = await fetch(url, init);
  const text = await res.text();
  return { name, status: res.status, text: text.slice(0, 400), headers: res.headers };
}

async function main() {
  // --- rewrite whitelist unit assertions (no /feedback /junior) ---
  try {
    const sources = guestProxyRewrites().map((r) => r.source);
    assert.equal(
      sources.some((s) => s.includes("feedback") || s.includes("junior")),
      false,
    );
    assert.ok(sources.includes("/my-lesson/:path*"));
    assert.ok(sources.includes("/e-contract/:path*"));
    assert.ok(sources.includes("/rod-a/:path*"));
    assert.equal(shouldAttachGuestRewriteHeader("/feedback"), false);
    assert.equal(shouldAttachGuestRewriteHeader("/junior"), false);
    assert.equal(shouldAttachGuestRewriteHeader("/my-lesson/x"), true);
    record("rewrite whitelist excludes /feedback·/junior", true, sources.join(", "));
  } catch (e) {
    record("rewrite whitelist excludes /feedback·/junior", false, String(e));
  }

  // --- API routes ---
  // KCP register must stay on homepage (not rewritten). GET → 405 Method Not Allowed from Next route.
  {
    const r = await apiCheck("kcp-register-GET", "/api/payments/kcp/register");
    const ok = r.status === 405;
    record(
      "/api/payments/kcp/register not rewritten (GET=405 homepage)",
      ok,
      `status=${r.status}`,
    );
  }
  {
    const r = await apiCheck("kcp-register-POST-empty", "/api/payments/kcp/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    // Homepage route validates body → 400; rewrite to admin would differ
    const ok = r.status === 400 && /필수|결제|예약|누락|형식/i.test(r.text);
    record(
      "/api/payments/kcp/register POST handled by homepage",
      ok,
      `status=${r.status} body=${r.text.slice(0, 120)}`,
    );
  }
  {
    const r = await apiCheck("cash-receipt", "/api/payments/cash-receipt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    const ok = r.status === 400 || r.status === 503;
    record("현금영수증 라우트 응답", ok, `status=${r.status} body=${r.text.slice(0, 160)}`);
  }
  {
    const r = await apiCheck("chat-get", "/api/chat");
    const ok = r.status === 200;
    record("채널톡/챗 API GET", ok, `status=${r.status} body=${r.text.slice(0, 120)}`);
  }
  {
    // ChannelTalk has no inbound webhook; KCP webhook fail-closed without secret = expected
    const r = await apiCheck("kcp-webhook", "/api/webhooks/kcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    const ok = r.status === 503 || r.status === 401 || r.status === 403;
    record(
      "웹훅 라우트(KCP fail-closed; 채널톡 인바운드 웹훅 없음)",
      ok,
      `status=${r.status}`,
    );
  }

  const browser = await chromium.launch();

  // Desktop regression
  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: "ko-KR",
    });
    const page = await context.newPage();

    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1500);
    await shot(page, "combined_01_home");
    record("메인 `/` 로드", page.url().includes("127.0.0.1:3010"), page.url());

    await page.goto(`${BASE}/book`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1500);
    await shot(page, "combined_02_book");
    record("예약 `/book` 로드", /\/book/.test(page.url()), page.url());

    // Checkout / KCP test mode entry (no real payment)
    await page.goto(`${BASE}/checkout`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1500);
    await shot(page, "combined_03_checkout_kcp_test");
    const bodyText = await page.locator("body").innerText();
    // Page may show empty cart / redirect; just confirm homepage served
    record(
      "결제 `/checkout` KCP 테스트 진입(실결제 없음)",
      page.url().includes("127.0.0.1:3010"),
      `url=${page.url()} snippet=${bodyText.slice(0, 80).replace(/\n/g, " ")}`,
    );

    // Feedback flow
    await page.goto(`${BASE}/feedback`, { waitUntil: "networkidle", timeout: 60000 });
    await shot(page, "combined_04_feedback_login");
    await fillLogin(page, "테스트", "01012345678");
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=내 강습 피드백", { timeout: 20000 });
    await shot(page, "combined_05_feedback_list");
    record("feedback 로그인→목록", true);

    // Share link
    await page.goto(`${BASE}/feedback/demo-share-token`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await page.waitForTimeout(1000);
    await shot(page, "combined_06_feedback_share");
    record("공유 링크 /feedback/[token]", true, page.url());

    await page.goto(`${BASE}/junior`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(1000);
    await shot(page, "combined_07_junior");
    record("/junior 로드", /\/junior/.test(page.url()), page.url());

    await context.close();
  }

  // Mobile kakao UA snapshot of feedback
  {
    const phone = devices["iPhone 13"];
    const context = await browser.newContext({
      ...phone,
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; SM-S908N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 KAKAOTALK",
      locale: "ko-KR",
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/feedback`, { waitUntil: "networkidle", timeout: 60000 });
    await fillLogin(page, "테스트", "01012345678");
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=내 강습 피드백", { timeout: 20000 });
    await shot(page, "combined_08_feedback_mobile_list");
    const listText = await page.locator("body").innerText();
    const leaked = /이강사|박강사|최강사/.test(listText);
    record("강사 실명 비노출", !leaked, leaked ? "LEAKED" : "담당 강사 only");
    await context.close();
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log("\n=== SUMMARY ===");
  for (const r of results) {
    console.log(`${r.ok ? "✓" : "✗"} ${r.name}`);
  }
  if (failed.length) {
    console.error(`\n${failed.length} failed`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} checks passed`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
