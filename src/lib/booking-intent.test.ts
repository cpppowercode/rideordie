import assert from "node:assert/strict";
import {
  createBookingIntent,
  createBookingReceipt,
  readBookingIntent,
  readBookingReceipt,
} from "./booking-intent";
import type { BookingInput } from "./booking";

const sample: BookingInput = {
  customerName: "홍길동",
  customerPhone: "01012345678",
  participants: 1,
  childCount: 0,
  skiResort: "하이원리조트",
  lessonType: "ski",
  lessonDate: "2027-01-15",
  durationHours: 2,
  startHour: 9,
  notes: "",
};

const intentToken = createBookingIntent("RODTEST001", 200000, sample);
assert.ok(intentToken.startsWith("v2."), "intent 는 암호화 v2 형식이어야 한다");
assert.equal(intentToken.includes("홍길동"), false, "intent 토큰에 이름이 평문으로 보이면 안 된다");
assert.equal(intentToken.includes("01012345678"), false, "intent 토큰에 전화가 평문으로 보이면 안 된다");

const intent = readBookingIntent(intentToken);
assert.ok(intent);
assert.equal(intent.orderNo, "RODTEST001");
assert.equal(intent.amount, 200000);
assert.equal(intent.input.customerName, "홍길동");
assert.equal(intent.input.customerPhone, "01012345678");
assert.equal(readBookingIntent("tampered." + intentToken.slice(3)), null);
assert.equal(readBookingIntent(null), null);

const receiptToken = createBookingReceipt({
  orderNo: "RODTEST001",
  amount: 200000,
  tno: "TNO1",
  date: "2027-01-15",
  resort: "하이원리조트",
  time: "09:00-11:00",
  people: 1,
});
assert.ok(receiptToken.startsWith("v2."));
const receipt = readBookingReceipt(receiptToken);
assert.ok(receipt);
assert.equal(receipt.orderNo, "RODTEST001");
assert.equal("name" in receipt, false, "영수증에 이름을 넣지 않는다");

console.log("booking-intent.test.ts: ok");
