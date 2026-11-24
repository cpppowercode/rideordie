import assert from "node:assert/strict";
import crypto from "crypto";
import {
  consumeRateLimit,
  resetRateLimitStores,
} from "@/lib/security/rate-limit";
import { checkBotGuard, HONEYPOT_FIELD } from "@/lib/security/bot-guard";
import { parseContactBody } from "@/lib/security/contact";
import { parseCashReceiptBody } from "@/lib/security/cash-receipt";
import { verifyWebhookSignature } from "@/lib/security/webhook-auth";
import { assertAllowedUpload } from "@/lib/security/request";

async function main() {
  resetRateLimitStores();

  // --- rate limit ---
  {
    const cfg = { windowMs: 60_000, max: 3 };
    assert.equal(consumeRateLimit("t", "ip1", cfg).limited, false);
    assert.equal(consumeRateLimit("t", "ip1", cfg).limited, false);
    assert.equal(consumeRateLimit("t", "ip1", cfg).limited, false);
    assert.equal(consumeRateLimit("t", "ip1", cfg).limited, true);
    assert.equal(consumeRateLimit("t", "ip2", cfg).limited, false);
  }

  // --- honeypot ---
  {
    const blocked = await checkBotGuard({ honeypot: "http://spam.example" }, { env: {} });
    assert.equal(blocked.ok, false);
    const ok = await checkBotGuard({ honeypot: "" }, { env: {} });
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.turnstile, "skipped");
  }

  // --- turnstile off without env ---
  {
    const r = await checkBotGuard({ turnstileToken: "" }, { env: {} });
    assert.equal(r.ok, true);
  }

  // --- turnstile on requires token ---
  {
    const r = await checkBotGuard(
      { turnstileToken: "" },
      { env: { TURNSTILE_SECRET_KEY: "sec", NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site" } },
    );
    assert.equal(r.ok, false);
  }

  // --- contact validation ---
  {
    const bad = parseContactBody({ name: "A", phone: "010", message: "hi" });
    assert.equal(bad.ok, false);
    const good = parseContactBody({
      name: "홍길동",
      phone: "01012345678",
      message: "강습 문의드립니다",
    });
    assert.equal(good.ok, true);
  }

  // --- cash receipt validation ---
  {
    const bad = parseCashReceiptBody({ orderNo: "!!", identity: "1" });
    assert.equal(bad.ok, false);
    const good = parseCashReceiptBody({ orderNo: "ROD123456", identity: "01012345678", type: "personal" });
    assert.equal(good.ok, true);
  }

  // --- webhook fail-closed ---
  {
    const missing = verifyWebhookSignature({
      secret: undefined,
      rawBody: "{}",
      signatureHeader: "abc",
    });
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.reason, "missing_secret");

    const secret = "test-webhook-secret";
    const body = Buffer.from('{"ok":true}');
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
    const ok = verifyWebhookSignature({
      secret,
      rawBody: body,
      signatureHeader: `sha256=${sig}`,
    });
    assert.equal(ok.ok, true);

    const tokenOk = verifyWebhookSignature({
      secret,
      rawBody: body,
      signatureHeader: null,
      sharedTokenHeader: `Bearer ${secret}`,
    });
    assert.equal(tokenOk.ok, true);

    const badSig = verifyWebhookSignature({
      secret,
      rawBody: body,
      signatureHeader: "sha256=deadbeef",
    });
    assert.equal(badSig.ok, false);
  }

  // --- upload guard ---
  {
    assert.ok(assertAllowedUpload({ type: "application/pdf", size: 100 }));
    assert.equal(assertAllowedUpload({ type: "image/jpeg", size: 100 }), null);
    assert.ok(assertAllowedUpload({ type: "image/jpeg", size: 9_000_000 }));
  }

  assert.equal(HONEYPOT_FIELD, "company_url");
  console.log("security.test.ts: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
