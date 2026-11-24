/**
 * 손님 피드백 — 계약·쿠키·문구·뱃지·404 내성 단위 테스트.
 * 운영 어드민/DB 에 쓰지 않는다. fetch 는 mock.
 */
import assert from "node:assert/strict";
import {
  adminApiBaseUrl,
  adminFeedbackByToken,
  adminFeedbackList,
  adminFeedbackLogin,
  buildAdminAuthHeaderForTest,
  callCustomerFeedbackApi,
} from "./admin";
import {
  givenNameOnly,
  isJuniorBadge,
  visibleBadges,
} from "./display";
import {
  FEEDBACK_LOGIN_INVALID_MESSAGE,
  FEEDBACK_LOGIN_RETRY_MESSAGE,
  loginErrorMessage,
} from "./messages";
import { parseFeedbackLoginBody } from "./parse-login";
import {
  FB_SESSION_COOKIE,
  feedbackSessionCookieOptions,
  maxAgeFromExpiresAt,
} from "./session";
import type { FeedbackStudent } from "./types";
import { RATE_LIMITS } from "@/lib/security/rate-limit";

process.env.ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN || "test-admin-token-only-server";

async function main() {
  // --- base URL 파생 (새 env 없음) ---
  assert.equal(
    adminApiBaseUrl("https://admin.rideordie.kr/api/reservations"),
    "https://admin.rideordie.kr",
  );
  assert.equal(
    adminApiBaseUrl("http://127.0.0.1:4099/api/reservations"),
    "http://127.0.0.1:4099",
  );

  // --- 토큰은 Authorization 헤더에만 (서버 측 패턴) ---
  {
    const h = buildAdminAuthHeaderForTest("secret-token-xyz");
    assert.equal(h.Authorization, "Bearer secret-token-xyz");
    assert.ok(!JSON.stringify(h).includes("NEXT_PUBLIC"));
  }

  // --- 쿠키 속성 ---
  {
    assert.equal(FB_SESSION_COOKIE, "rod_fb_session");
    const remembered = feedbackSessionCookieOptions({
      secure: true,
      maxAgeSec: 90 * 24 * 60 * 60,
    });
    assert.equal(remembered.httpOnly, true);
    assert.equal(remembered.secure, true);
    assert.equal(remembered.sameSite, "lax");
    assert.equal(remembered.path, "/");
    assert.equal(remembered.maxAge, 90 * 24 * 60 * 60);

    const sessionOnly = feedbackSessionCookieOptions({ secure: false });
    assert.equal(sessionOnly.httpOnly, true);
    assert.equal(sessionOnly.secure, false);
    assert.equal(sessionOnly.sameSite, "lax");
    assert.equal(sessionOnly.path, "/");
    assert.equal(sessionOnly.maxAge, undefined);

    const maxAge = maxAgeFromExpiresAt(
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    );
    assert.ok(maxAge > 89 * 24 * 60 * 60);
  }

  // --- 로그인 실패 문구 항상 동일 ---
  assert.equal(loginErrorMessage("invalid"), FEEDBACK_LOGIN_INVALID_MESSAGE);
  assert.equal(loginErrorMessage(undefined), FEEDBACK_LOGIN_INVALID_MESSAGE);
  assert.equal(loginErrorMessage("locked"), FEEDBACK_LOGIN_RETRY_MESSAGE);
  assert.equal(loginErrorMessage("rate_limited"), FEEDBACK_LOGIN_RETRY_MESSAGE);

  {
    const bad = parseFeedbackLoginBody({ name: "A", phone: "010" });
    assert.equal(bad.ok, false);
    const good = parseFeedbackLoginBody({
      name: "홍길동",
      phone: "010-1234-5678",
      remember: true,
    });
    assert.equal(good.ok, true);
    if (good.ok) {
      assert.equal(good.data.phone, "01012345678");
      assert.equal(good.data.remember, true);
    }
  }

  // --- 성 제거 ---
  assert.equal(givenNameOnly("김민준"), "민준");
  assert.equal(givenNameOnly("남궁민수"), "민수");
  assert.equal(givenNameOnly("Hong Gildong"), "Gildong");

  // --- 주니어 뱃지 필터 ---
  {
    const student: FeedbackStudent = {
      student_key: "a",
      display_name: "박서연",
      sport: "board",
      is_junior_eligible: false,
      feedbacks: [],
      progress: null,
      badges: [
        {
          code: "junior_level1",
          label: "레벨1",
          sport: "board",
          earned_at: "2026-01-01T00:00:00.000Z",
        },
        {
          code: "board_carve",
          label: "카빙 입문",
          sport: "board",
          earned_at: "2026-02-01T00:00:00.000Z",
        },
      ],
    };
    assert.equal(isJuniorBadge(student.badges![0]!), true);
    const visible = visibleBadges(student);
    assert.equal(visible.length, 1);
    assert.equal(visible[0]!.code, "board_carve");

    const juniorOn: FeedbackStudent = { ...student, is_junior_eligible: true };
    assert.equal(visibleBadges(juniorOn).length, 2);

    const noBadges: FeedbackStudent = {
      ...student,
      badges: undefined,
    };
    assert.deepEqual(visibleBadges(noBadges), []);
  }

  // --- 레이트리밋 키 존재 ---
  assert.ok(RATE_LIMITS.feedbackLogin.max >= 1);
  assert.equal(RATE_LIMITS.feedbackLogin.windowMs, 60_000);

  // --- 어드민 404 → unavailable (500 아님) ---
  {
    const fetch404: typeof fetch = async () =>
      new Response("not found", { status: 404 });
    const r = await callCustomerFeedbackApi("list", { session_token: "x" }, fetch404);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.unavailable, true);

    const prev = globalThis.fetch;
    globalThis.fetch = fetch404;
    try {
      const listMock = await adminFeedbackList("tok");
      assert.equal(listMock.ok, false);
      if (!listMock.ok) assert.equal(listMock.unavailable, true);
    } finally {
      globalThis.fetch = prev;
    }
  }

  {
    const fetch404: typeof fetch = async () =>
      new Response("{}", { status: 404 });
    const prev = globalThis.fetch;
    globalThis.fetch = fetch404;
    try {
      const by = await adminFeedbackByToken({ share_token: "t" });
      assert.equal(by.ok, false);
      if (!by.ok) assert.equal(by.unavailable, true);

      const login = await adminFeedbackLogin({
        name: "테스트",
        phone: "01012345678",
        client_ip: "1.1.1.1",
        user_agent: "test",
      });
      assert.equal(login.ok, false);
      if (!login.ok) assert.equal("unavailable" in login && login.unavailable, true);
    } finally {
      globalThis.fetch = prev;
    }
  }

  // --- 로그인 mock 성공 시 토큰이 서버 Authorization 에만 ---
  {
    const fetchOk: typeof fetch = async (_url, init) => {
      const headers = new Headers(init?.headers);
      assert.equal(headers.get("Authorization"), "Bearer test-admin-token-only-server");
      assert.ok(!String(init?.body || "").includes("ADMIN_API_TOKEN"));
      return new Response(
        JSON.stringify({
          ok: true,
          session_token: "sess_abc",
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };
    const prev = globalThis.fetch;
    globalThis.fetch = fetchOk;
    try {
      const r = await adminFeedbackLogin({
        name: "테스트",
        phone: "01012345678",
        client_ip: "127.0.0.1",
        user_agent: "jest",
      });
      assert.equal(r.ok, true);
      if (r.ok && !("unavailable" in r)) {
        assert.equal(r.session_token, "sess_abc");
      }
    } finally {
      globalThis.fetch = prev;
    }
  }

  console.log("customer-feedback.test.ts: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
