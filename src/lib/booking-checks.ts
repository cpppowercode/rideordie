import { listReservationsForDate } from "@/lib/admin-reservations";
import {
  hasDuplicateBooking,
  slotIsFull,
  validateBookingInput,
  type BookingInput,
} from "@/lib/booking";
import { GROOMING_BOOKING_ERROR, slotOverlapsGrooming } from "@/lib/grooming";
import { findLessonStart, isLessonDuration, normalizeHalfHour } from "@/lib/hours";

export type CheckedBooking = { ok: true; input: BookingInput } | { ok: false; status: number; error: string };

export function parseBookingBody(body: Partial<BookingInput>): BookingInput {
  return {
    customerName: String(body.customerName || ""),
    customerPhone: String(body.customerPhone || ""),
    participants: Number(body.participants),
    childCount: Number(body.childCount),
    skiResort: String(body.skiResort || ""),
    lessonType: String(body.lessonType || "ski"),
    lessonDate: String(body.lessonDate || ""),
    durationHours: Number(body.durationHours),
    startHour: Number(body.startHour),
    notes: String(body.notes || ""),
  };
}

/** 입력값 검증 + 정비 시간 + 운영 시간 + 중복/마감 확인. 저장은 하지 않는다. */
export async function checkBookingAvailability(raw: BookingInput): Promise<CheckedBooking> {
  const validationError = validateBookingInput(raw);
  if (validationError) return { ok: false, status: 400, error: validationError };

  const duration = isLessonDuration(raw.durationHours) ? raw.durationHours : null;
  const start = Number.isFinite(raw.startHour) ? normalizeHalfHour(raw.startHour) : NaN;
  if (!duration || !Number.isFinite(start)) {
    return { ok: false, status: 400, error: "시작 시간을 선택해 주세요." };
  }
  if (slotOverlapsGrooming(raw.skiResort, start, duration)) {
    return { ok: false, status: 409, error: GROOMING_BOOKING_ERROR };
  }
  if (!findLessonStart(raw.skiResort, duration, start)) {
    return { ok: false, status: 400, error: "선택한 시간에는 강습을 예약할 수 없습니다." };
  }

  const existing = await listReservationsForDate({ date: raw.lessonDate, skiResort: raw.skiResort });
  if (hasDuplicateBooking(existing, raw.customerPhone, start, duration)) {
    return {
      ok: false,
      status: 409,
      error: "같은 날짜·시간대에 이미 예약이 있습니다. 다른 시간을 선택하거나 카톡 상담으로 문의해 주세요.",
    };
  }
  if (slotIsFull(existing, raw.skiResort, start, duration)) {
    return { ok: false, status: 409, error: "선택한 시간대는 예약이 마감되었습니다. 다른 시간을 선택해 주세요." };
  }
  return { ok: true, input: { ...raw, startHour: start, durationHours: duration } };
}
