import assert from "node:assert/strict";
import {
  isKcpProduction,
  kcpSiteCd,
  kcpHubScriptUrl,
  expectedPayAmount,
  serializeKcpCert,
  kcpApproveUrl,
  kcpRegisterUrl,
  toKcpPayType,
} from "./kcp";

// 기본(T0000 / test) — Vercel·로컬에서 NEXT_PUBLIC_KCP_* 가 test 로 맞춰져 있다고 가정.
// 값이 production 이면 이 assert 는 환경에 맞게 스킵하지 않고 현재 모듈 동작을 기록한다.
assert.equal(typeof kcpSiteCd(), "string");
assert.equal(typeof isKcpProduction(), "boolean");
assert.ok(kcpHubScriptUrl().includes("kcp.co.kr"));
assert.ok(kcpApproveUrl().includes("spl.kcp.co.kr") || kcpApproveUrl().includes("stg-spl"));
assert.ok(kcpRegisterUrl().includes("smpay.kcp.co.kr") || kcpRegisterUrl().includes("testsmpay"));
assert.equal(expectedPayAmount(), 140_000);
assert.equal(toKcpPayType("CARD"), "PACA");
assert.equal(toKcpPayType("BANK"), "PABK");
assert.equal(toKcpPayType("MOBX"), "PAMC");
assert.equal(serializeKcpCert("A\nB\r\nC"), "ABC");

// site_cd 기본값
if (!process.env.NEXT_PUBLIC_KCP_SITE_CD) {
  assert.equal(kcpSiteCd(), "T0000");
  assert.equal(isKcpProduction(), false);
  assert.ok(kcpHubScriptUrl().includes("testspay"));
  assert.equal(kcpApproveUrl(), "https://stg-spl.kcp.co.kr/gw/enc/v1/payment");
  assert.equal(kcpRegisterUrl(), "https://testsmpay.kcp.co.kr/trade/register.do");
}

console.log("kcp.test.ts: ok", {
  siteCd: kcpSiteCd(),
  production: isKcpProduction(),
  approve: kcpApproveUrl(),
});
