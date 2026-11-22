import assert from "node:assert/strict";
import {
  isAllowedRequestHost,
  kcpReturnUrl,
  normalizeRequestHost,
  requestOrigin,
  vercelPreviewHosts,
} from "./request-origin";

const SITE = "https://rideordie.kr";

function headers(map: Record<string, string>) {
  return {
    get(name: string) {
      return map[name.toLowerCase()] ?? map[name] ?? null;
    },
  };
}

assert.equal(normalizeRequestHost("WWW.RideOrDie.kr"), "www.rideordie.kr");
assert.equal(normalizeRequestHost("https://rideordie.kr:443"), "rideordie.kr");
assert.equal(normalizeRequestHost("evil.com, rideordie.kr"), "evil.com");
assert.equal(normalizeRequestHost("bad host"), null);

assert.equal(isAllowedRequestHost("rideordie.kr"), true);
assert.equal(isAllowedRequestHost("www.rideordie.kr"), true);
assert.equal(isAllowedRequestHost("evil.example"), false);

const previewEnv = {
  VERCEL_ENV: "preview",
  VERCEL_URL: "rideordie-abc.vercel.app",
  VERCEL_BRANCH_URL: "rideordie-git-feat-dj-s-projects22.vercel.app",
  NEXT_PUBLIC_SITE_URL: SITE,
};
assert.deepEqual(
  [...vercelPreviewHosts(previewEnv)].sort(),
  ["rideordie-abc.vercel.app", "rideordie-git-feat-dj-s-projects22.vercel.app"].sort(),
);
assert.equal(isAllowedRequestHost("rideordie-abc.vercel.app", previewEnv), true);
assert.equal(isAllowedRequestHost("other.vercel.app", previewEnv), false);

const prodEnv = {
  VERCEL_ENV: "production",
  VERCEL_URL: "rideordie-abc.vercel.app",
  VERCEL_BRANCH_URL: "rideordie-git-feat-dj-s-projects22.vercel.app",
  NEXT_PUBLIC_SITE_URL: SITE,
};
assert.equal(vercelPreviewHosts(prodEnv).size, 0);
assert.equal(isAllowedRequestHost("rideordie-abc.vercel.app", prodEnv), false);

// 허용 apex / www → 그 origin
assert.equal(
  requestOrigin(headers({ host: "www.rideordie.kr" }), { NEXT_PUBLIC_SITE_URL: SITE }),
  "https://www.rideordie.kr",
);
assert.equal(
  requestOrigin(headers({ host: "rideordie.kr" }), { NEXT_PUBLIC_SITE_URL: SITE }),
  "https://rideordie.kr",
);

// 프리뷰 호스트 정확 일치
assert.equal(
  requestOrigin(headers({ host: "rideordie-abc.vercel.app" }), previewEnv),
  "https://rideordie-abc.vercel.app",
);

// 악성 Host → SITE_URL
assert.equal(
  requestOrigin(headers({ host: "evil.example", "x-forwarded-host": "phish.test" }), {
    NEXT_PUBLIC_SITE_URL: SITE,
  }),
  SITE,
);

// x-forwarded-host 가 악성이면 host(허용)로 폴백
assert.equal(
  requestOrigin(
    headers({ "x-forwarded-host": "evil.example", host: "www.rideordie.kr" }),
    { NEXT_PUBLIC_SITE_URL: SITE },
  ),
  "https://www.rideordie.kr",
);

// Ret_URL 도 같은 origin
assert.equal(
  kcpReturnUrl(headers({ host: "www.rideordie.kr" }), { NEXT_PUBLIC_SITE_URL: SITE }),
  "https://www.rideordie.kr/api/payments/kcp/return",
);
assert.equal(
  kcpReturnUrl(headers({ host: "attacker.test" }), { NEXT_PUBLIC_SITE_URL: SITE }),
  `${SITE}/api/payments/kcp/return`,
);

// 쿠키 호스트 = Ret_URL 호스트: bookings 가 심은 호스트로 register 가 Ret_URL 을 만들면 일치
const bookingHost = "www.rideordie.kr";
const cookieHost = bookingHost; // Domain 없는 호스트 전용 쿠키
const ret = kcpReturnUrl(headers({ host: bookingHost }), { NEXT_PUBLIC_SITE_URL: SITE });
assert.equal(new URL(ret).host, cookieHost);

console.log("request-origin.test.ts: ok");
