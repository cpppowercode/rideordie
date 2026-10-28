import assert from "node:assert/strict";
import { approveAndFinalizeBooking } from "./booking-finalize";
import { payBreakdown } from "./badge-fee";
import { todayYmd } from "./booking";

process.env.ADMIN_API_TOKEN = "test-token-long-enough";
process.env.BOOKING_SIGNING_SECRET = "test-signing-secret-long-enough";
process.env.KCP_CERT_INFO = "test-certificate";
process.env.SEASON_SETTINGS_OFFLINE = "1";

const input = { customerName: "테스트", customerPhone: "01012345678", participants: 1, childCount: 0,
  skiResort: "하이원리조트", lessonType: "ski", lessonDate: todayYmd(), durationHours: 2, startHour: 9 };
const amount = payBreakdown(input).total;
const intent = { v: 1 as const, orderNo: "WEB_123_ABC", amount, input, exp: Date.now() + 60000 };
const kcp = { enc_data: "test", enc_info: "test", tran_cd: "test", orderId: intent.orderNo, payMethod: "PACA" };

async function main() {
  let calls: string[] = [];
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    calls.push(`${init?.method || "GET"} ${new URL(u).pathname}`);
    if (u.includes("booking-payment-attempts")) return Response.json({ error: "duplicate" }, { status: 409 });
    throw new Error(`unexpected request: ${u}`);
  };
  await assert.rejects(() => approveAndFinalizeBooking(intent, kcp));
  assert.deepEqual(calls, ["POST /api/booking-payment-attempts"]);

  calls = [];
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    calls.push(`${init?.method || "GET"} ${new URL(u).pathname}`);
    if (u.includes("booking-payment-attempts")) return Response.json({ success: true });
    if (u.includes("/gw/enc/v1/payment")) return Response.json({ res_cd: "0000", tno: "T123", amount });
    if (u.includes("/api/reservations") && init?.method === "POST") return Response.json({ error: "unavailable" }, { status: 503 });
    if (u.includes("/api/reservations")) return Response.json({ success: true, data: [] });
    throw new Error(`unexpected request: ${u}`);
  };
  await assert.rejects(() => approveAndFinalizeBooking(intent, kcp));
  assert.ok(calls.indexOf("POST /api/booking-payment-attempts") < calls.indexOf("POST /gw/enc/v1/payment"));
  assert.ok(calls.indexOf("PATCH /api/booking-payment-attempts") < calls.indexOf("POST /api/reservations"));
  assert.equal(calls.filter((x) => x === "PATCH /api/booking-payment-attempts").length, 1);
  console.log("payment journal failure tests passed");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
