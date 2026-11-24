/**
 * /api/feedback/login — 쿠키·문구·토큰 미노출.
 * 어드민은 fetch mock. 운영 DB 미사용.
 */
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/feedback/login/route";
import {
  FEEDBACK_LOGIN_INVALID_MESSAGE,
  FEEDBACK_LOGIN_RETRY_MESSAGE,
  FEEDBACK_SERVICE_PREPARING_MESSAGE,
} from "./messages";
import { FB_SESSION_COOKIE } from "./session";
import { resetRateLimitStores } from "@/lib/security/rate-limit";

process.env.ADMIN_API_TOKEN = "test-admin-token-login-route";

function req(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/feedback/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.10",
      "x-forwarded-proto": "https",
      "user-agent": "KakaoTalk/Test",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

async function withFetch(mock: typeof fetch, fn: () => Promise<void>) {
  const prev = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    await fn();
  } finally {
    globalThis.fetch = prev;
  }
}

async function main() {
  resetRateLimitStores();

  await withFetch(async (url, init) => {
    const u = String(url);
    assert.ok(u.includes("/api/customer-feedback/login"));
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("Authorization"), "Bearer test-admin-token-login-route");
    const body = JSON.parse(String(init?.body || "{}")) as {
      client_ip?: string;
      user_agent?: string;
    };
    assert.equal(body.client_ip, "203.0.113.10");
    assert.ok(String(body.user_agent || "").includes("KakaoTalk"));
    return new Response(
      JSON.stringify({
        ok: true,
        session_token: "sess_route_1",
        expires_at: new Date(Date.now() + 90 * 86400000).toISOString(),
      }),
      { status: 200 },
    );
  }, async () => {
    const res = await POST(
      req({ name: "홍길동", phone: "01012345678", remember: true }),
    );
    assert.equal(res.status, 200);
    const setCookie = res.headers.get("set-cookie") || "";
    assert.ok(setCookie.includes(`${FB_SESSION_COOKIE}=`));
    assert.ok(/HttpOnly/i.test(setCookie));
    assert.ok(/Secure/i.test(setCookie));
    assert.ok(/SameSite=Lax/i.test(setCookie));
    assert.ok(/Path=\//i.test(setCookie));
    assert.ok(/Max-Age=/i.test(setCookie));
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(json.session_token, undefined);
  });

  resetRateLimitStores();

  await withFetch(async () => {
    return new Response(JSON.stringify({ ok: false, error: "invalid" }), {
      status: 200,
    });
  }, async () => {
    const res = await POST(req({ name: "없는사람", phone: "01099998888" }));
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.message, FEEDBACK_LOGIN_INVALID_MESSAGE);
  });

  resetRateLimitStores();

  await withFetch(async () => {
    return new Response(JSON.stringify({ ok: false, error: "locked" }), {
      status: 200,
    });
  }, async () => {
    const res = await POST(req({ name: "잠금유저", phone: "01012345678" }));
    assert.equal(res.status, 429);
    const json = await res.json();
    assert.equal(json.message, FEEDBACK_LOGIN_RETRY_MESSAGE);
  });

  resetRateLimitStores();

  await withFetch(async () => new Response("nope", { status: 404 }), async () => {
    const res = await POST(req({ name: "홍길동", phone: "01012345678" }));
    assert.equal(res.status, 503);
    const json = await res.json();
    assert.equal(json.message, FEEDBACK_SERVICE_PREPARING_MESSAGE);
  });

  resetRateLimitStores();

  await withFetch(async () => {
    return new Response(
      JSON.stringify({
        ok: true,
        session_token: "sess_no_remember",
        expires_at: new Date(Date.now() + 90 * 86400000).toISOString(),
      }),
      { status: 200 },
    );
  }, async () => {
    const res = await POST(
      req({ name: "홍길동", phone: "01012345678", remember: false }),
    );
    assert.equal(res.status, 200);
    const setCookie = res.headers.get("set-cookie") || "";
    assert.ok(setCookie.includes(`${FB_SESSION_COOKIE}=`));
    assert.ok(!/Max-Age=/i.test(setCookie));
  });

  console.log("login-route.test.ts: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
