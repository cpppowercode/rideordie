import { normalizePhone } from "@/lib/booking";
import type { AdminReservation } from "@/lib/admin-reservations";
import { LESSON_TYPES } from "@/lib/site";

const ORDER_NO_RE = /^[A-Za-z0-9_-]{6,50}$/;
const PHONE_RE = /^01[016789]\d{7,8}$/;

export type OrderLookupInput = {
  orderNo: string;
  customerPhone: string;
};

export type OrderLookupPublic = {
  orderNo: string;
  lessonDate: string | null;
  timeLabel: string | null;
  skiResort: string | null;
  lessonType: string | null;
  participants: number | null;
  reservationStatus: string | null;
  paymentStatus: string | null;
  /** admin 공개 강습 확인 페이지(토큰=예약 id). 없으면 null. */
  detailUrl: string | null;
};

export function normalizeOrderNo(raw: string): string {
  return raw.trim();
}

export function validateOrderLookupInput(input: {
  orderNo?: unknown;
  customerPhone?: unknown;
}): string | null {
  const orderNo = typeof input.orderNo === "string" ? normalizeOrderNo(input.orderNo) : "";
  const phone = typeof input.customerPhone === "string" ? normalizePhone(input.customerPhone) : "";
  if (!ORDER_NO_RE.test(orderNo)) return "주문번호를 확인해 주세요.";
  if (!PHONE_RE.test(phone)) return "휴대폰 번호를 확인해 주세요. 예: 010-1234-5678";
  return null;
}

/** 주문번호·연락처가 모두 맞을 때만 공개용 예약 요약을 만든다. 불일치/없음은 null. */
export function toPublicOrderLookup(
  row: AdminReservation | null,
  customerPhone: string,
  detailBaseUrl = "https://admin.rideordie.kr/my-lesson",
): OrderLookupPublic | null {
  if (!row) return null;
  const rowPhone = normalizePhone(String(row.customer_phone || ""));
  const want = normalizePhone(customerPhone);
  if (!rowPhone || rowPhone !== want) return null;

  const orderNo = String(row.order_no || "").trim();
  if (!orderNo) return null;

  const lessonTypeRaw = row.lesson_type;
  const lessonType =
    LESSON_TYPES.find((t) => t.value === lessonTypeRaw)?.label ||
    (typeof lessonTypeRaw === "string" && lessonTypeRaw.trim() ? lessonTypeRaw : null);

  const id = typeof row.id === "string" && row.id.trim() ? row.id.trim() : null;

  return {
    orderNo,
    lessonDate: row.lesson_date ? String(row.lesson_date).slice(0, 10) : null,
    timeLabel: row.lesson_time ? String(row.lesson_time) : null,
    skiResort: row.ski_resort ? String(row.ski_resort) : null,
    lessonType,
    participants:
      typeof row.participants === "number" && Number.isFinite(row.participants)
        ? row.participants
        : null,
    reservationStatus: row.reservation_status ? String(row.reservation_status) : null,
    paymentStatus: row.payment_status ? String(row.payment_status) : null,
    detailUrl: id ? `${detailBaseUrl.replace(/\/$/, "")}/${encodeURIComponent(id)}` : null,
  };
}

export function reservationStatusLabel(status: string | null): string {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "접수";
    case "confirmed":
    case "paid":
      return "확정";
    case "completed":
      return "완료";
    case "cancelled":
    case "canceled":
      return "취소";
    default:
      return status || "확인 중";
  }
}

export function paymentStatusLabel(status: string | null): string {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "결제 확인 중";
    case "completed":
    case "paid":
      return "결제 완료";
    case "cancelled":
    case "canceled":
    case "refunded":
      return "결제 취소";
    default:
      return status || "확인 중";
  }
}
