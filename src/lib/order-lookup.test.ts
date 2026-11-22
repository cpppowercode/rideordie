import assert from "node:assert/strict";
import {
  paymentStatusLabel,
  reservationStatusLabel,
  toPublicOrderLookup,
  validateOrderLookupInput,
} from "./order-lookup";
import type { AdminReservation } from "./admin-reservations";

assert.equal(validateOrderLookupInput({ orderNo: "WEB_123456", customerPhone: "010-1234-5678" }), null);
assert.match(validateOrderLookupInput({ orderNo: "ab", customerPhone: "01012345678" }) || "", /주문번호/);
assert.match(validateOrderLookupInput({ orderNo: "WEB_123456", customerPhone: "123" }) || "", /휴대폰/);

const row: AdminReservation = {
  id: "11111111-1111-4111-8111-111111111111",
  order_no: "WEB_ABCDEF",
  customer_phone: "01012345678",
  customer_name: "홍길동",
  lesson_date: "2027-01-15",
  lesson_time: "09:00~11:00",
  ski_resort: "하이원리조트",
  participants: 1,
  reservation_status: "pending",
  payment_status: "completed",
  lesson_type: "ski",
};

const ok = toPublicOrderLookup(row, "010-1234-5678");
assert.ok(ok);
assert.equal(ok.orderNo, "WEB_ABCDEF");
assert.equal(ok.lessonType, "스키");
assert.equal(ok.detailUrl, "https://admin.rideordie.kr/my-lesson/11111111-1111-4111-8111-111111111111");
assert.equal("customer_name" in ok, false, "공개 응답에 이름을 넣지 않는다");
assert.equal("customer_phone" in ok, false, "공개 응답에 전화를 넣지 않는다");
assert.equal("notes" in ok, false);

assert.equal(toPublicOrderLookup(row, "01099999999"), null, "연락처 불일치면 숨긴다");
assert.equal(toPublicOrderLookup(null, "01012345678"), null);

assert.equal(reservationStatusLabel("pending"), "접수");
assert.equal(paymentStatusLabel("completed"), "결제 완료");

console.log("order-lookup.test.ts: ok");
