import assert from "node:assert/strict";
import {
  ADMIN_ASSET_PREFIX,
  ADMIN_ORIGIN,
  guestProxyRewrites,
  shouldAttachGuestRewriteHeader,
} from "./guest-proxy";

function run() {
  const rules = guestProxyRewrites();
  const sources = rules.map((r) => r.source);

  assert.ok(sources.includes("/my-lesson/:path*"));
  assert.ok(sources.includes("/e-contract/:path*"));
  assert.ok(sources.includes("/api/e-contract/:path*"));
  assert.ok(sources.includes("/api/client-errors"));
  assert.ok(sources.includes("/api/admin-profile"));
  assert.ok(sources.includes(`${ADMIN_ASSET_PREFIX}/:path*`));
  assert.ok(sources.includes("/images/logo/:path*"));

  // 범위 밖·충돌 방지
  assert.equal(
    sources.some((s) => s.includes("ticket") || s.includes("season-customer")),
    false,
  );
  assert.equal(
    sources.some((s) => s.includes("feedback") || s.includes("junior")),
    false,
  );
  assert.equal(
    sources.some((s) => s === "/api/:path*" || s.startsWith("/api/:path")),
    false,
  );

  for (const r of rules) {
    assert.ok(r.destination.startsWith(ADMIN_ORIGIN));
  }

  assert.equal(shouldAttachGuestRewriteHeader("/my-lesson/abc"), true);
  assert.equal(shouldAttachGuestRewriteHeader("/e-contract/abc"), true);
  assert.equal(shouldAttachGuestRewriteHeader("/api/e-contract/otp/send"), true);
  assert.equal(shouldAttachGuestRewriteHeader("/api/bookings"), false);
  assert.equal(shouldAttachGuestRewriteHeader("/feedback"), false);
  assert.equal(shouldAttachGuestRewriteHeader("/junior"), false);
  assert.equal(shouldAttachGuestRewriteHeader("/ticket/x"), false);
  assert.equal(shouldAttachGuestRewriteHeader("/"), false);

  console.log("guest-proxy.test.ts: ok");
}

run();
