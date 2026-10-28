import {
  findLessonStart,
  formatLessonRange,
  isLessonDuration,
  lessonFitsOperatingHours,
  normalizeHalfHour,
} from "@/lib/hours";
import { slotsOverlap } from "@/lib/overlap";
import { bookingSlotCapacity, SKI_RESORTS } from "@/lib/site";

export { slotsOverlap };

export type BookingInput = {
  customerName: string;
  customerPhone: string;
  participants: number;
  childCount: number;
  skiResort: string;
  lessonType: string;
  lessonDate: string;
  durationHours: number;
  startHour: number;
  notes?: string;
};

export type ExistingReservation = {
  id?: string;
  customer_phone?: string | null;
  lesson_date?: string | null;
  lesson_start_hour?: number | null;
  lesson_duration_hours?: number | null;
  lesson_time?: string | null;
  ski_resort?: string | null;
  reservation_status?: string | null;
  payment_status?: string | null;
  participants?: number | null;
};

const PHONE_RE = /^01[016789]\d{7,8}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BLOCKING_STATUSES = new Set(["cancelled", "canceled", "refunded"]);

export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

export function formatPhoneDisplay(raw: string): string {
  const digits = normalizePhone(raw);
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return raw;
}

export function todayYmd(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 사전예약 가능 상한(미포함): 오늘부터 정확히 3개월 뒤. 예약은 이 날짜 전날까지. */
export function maxBookingDateExclusive(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  return todayYmd(d);
}

/** 선택 가능한 마지막 날짜 YYYY-MM-DD (오늘 + 3개월 − 1일). */
export function maxBookingDateInclusive(now = new Date()): string {
  const exclusive = maxBookingDateExclusive(now);
  const [y, m, day] = exclusive.split("-").map(Number);
  const d = new Date(y, m - 1, day - 1);
  return todayYmd(d);
}

export function parseLessonStartHour(reservation: ExistingReservation): number | null {
  if (typeof reservation.lesson_start_hour === "number" && Number.isFinite(reservation.lesson_start_hour)) {
    return reservation.lesson_start_hour;
  }
  const match = reservation.lesson_time?.match(/(\d+):?(\d*)/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minutes = match[2] ? Number(match[2]) : 0;
  return hour + minutes / 60;
}

export function parseLessonDuration(reservation: ExistingReservation): number {
  if (typeof reservation.lesson_duration_hours === "number" && reservation.lesson_duration_hours > 0) {
    return reservation.lesson_duration_hours;
  }
  const match = reservation.lesson_time?.match(/(\d+):?(\d*)\s*[-~–]\s*(\d+):?(\d*)/);
  if (!match) return 2;
  const start = Number(match[1]) + (match[2] ? Number(match[2]) / 60 : 0);
  const end = Number(match[3]) + (match[4] ? Number(match[4]) / 60 : 0);
  const duration = end - start;
  return duration > 0 ? duration : 2;
}

export function isBlockingReservation(reservation: ExistingReservation): boolean {
  const status = (reservation.reservation_status || "").toLowerCase();
  const payment = (reservation.payment_status || "").toLowerCase();
  return !BLOCKING_STATUSES.has(status) && !BLOCKING_STATUSES.has(payment);
}

export function sameResort(a: string, b: string | null | undefined): boolean {
  if (!b) return false;
  const normalize = (value: string) => value.replace(/\s/g, "").replace(/리조트|파크|포레스트/g, "");
  return normalize(a) === normalize(b) || a === b || b.includes(a) || a.includes(b);
}

export function overlappingReservations(
  existing: ExistingReservation[],
  skiResort: string,
  startHour: number,
  durationHours: number
): ExistingReservation[] {
  return existing.filter((row) => {
    if (!isBlockingReservation(row)) return false;
    if (!sameResort(skiResort, row.ski_resort || undefined)) return false;
    const start = parseLessonStartHour(row);
    if (start == null) return false;
    return slotsOverlap(startHour, durationHours, start, parseLessonDuration(row));
  });
}

export function slotIsFull(
  existing: ExistingReservation[],
  skiResort: string,
  startHour: number,
  durationHours: number,
  capacity = bookingSlotCapacity()
): boolean {
  return overlappingReservations(existing, skiResort, startHour, durationHours).length >= capacity;
}

export function hasDuplicateBooking(
  existing: ExistingReservation[],
  phone: string,
  startHour: number,
  durationHours: number
): boolean {
  const digits = normalizePhone(phone);
  return existing.some((row) => {
    if (!isBlockingReservation(row)) return false;
    if (normalizePhone(row.customer_phone || "") !== digits) return false;
    const start = parseLessonStartHour(row);
    if (start == null) return false;
    return slotsOverlap(startHour, durationHours, start, parseLessonDuration(row));
  });
}

export function validateBookingInput(input: BookingInput): string | null {
  const name = input.customerName.trim();
  if (name.length < 2) return "이름을 두 글자 이상 입력해 주세요.";

  const phone = normalizePhone(input.customerPhone);
  if (!PHONE_RE.test(phone)) return "휴대폰 번호를 확인해 주세요. 예: 010-1234-5678";

  if (!Number.isInteger(input.participants) || input.participants < 1 || input.participants > 3) {
    return "인원은 1:1, 2:1, 3:1(1~3명) 중에서 선택해 주세요.";
  }
  if (!Number.isInteger(input.childCount) || input.childCount < 0 || input.childCount > input.participants) {
    return "아이 인원은 총 인원 이하로 입력해 주세요.";
  }
  if (!SKI_RESORTS.some((resort) => resort.value === input.skiResort)) {
    return "스키장을 선택해 주세요.";
  }
  if (!["ski", "board", "both"].includes(input.lessonType)) {
    return "강습 종목을 선택해 주세요.";
  }
  if (!DATE_RE.test(input.lessonDate) || input.lessonDate < todayYmd()) {
    return "예약 날짜를 오늘 이후로 선택해 주세요.";
  }
  if (input.lessonDate >= maxBookingDateExclusive()) {
    return "사전예약은 3개월 미만만 가능합니다.";
  }
  if (!isLessonDuration(input.durationHours)) {
    return "강습 시간을 선택해 주세요.";
  }
  if (!Number.isFinite(input.startHour)) {
    return "시작 시간을 선택해 주세요.";
  }
  if (!lessonFitsOperatingHours(input.skiResort, input.startHour, input.durationHours)) {
    return "운영 시간 안에서 시작 시간을 선택해 주세요.";
  }
  if ((input.notes || "").length > 1000) {
    return "메모는 1000자 이내로 작성해 주세요.";
  }
  return null;
}

export function buildNotes(input: BookingInput): string {
  const range = formatLessonRange(input.startHour, input.durationHours);
  const parts = [
    "[홈페이지 예약]",
    `총 ${input.participants}명`,
    `아이 ${input.childCount}명`,
    `강습 ${input.durationHours}시간`,
    range,
  ];
  const extra = (input.notes || "").trim();
  if (extra) parts.push(extra);
  return parts.join(" / ").slice(0, 1000);
}

export function buildOrderNo(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `WEB_${Date.now()}_${rand}`.slice(0, 50);
}

export function toAdminPayload(input: BookingInput, orderNo: string) {
  if (!isLessonDuration(input.durationHours)) {
    throw new Error("강습 시간을 선택해 주세요.");
  }
  const startHour = normalizeHalfHour(input.startHour);
  const durationHours = input.durationHours;
  const timeLabel = formatLessonRange(startHour, durationHours);
  const slot = findLessonStart(input.skiResort, durationHours, startHour);
  if (!slot && !lessonFitsOperatingHours(input.skiResort, startHour, durationHours)) {
    throw new Error("시작 시간을 선택해 주세요.");
  }

  return {
    customer_name: input.customerName.trim(),
    customer_phone: normalizePhone(input.customerPhone),
    lesson_type: input.lessonType,
    ski_resort: input.skiResort,
    lesson_date: input.lessonDate,
    lesson_start_hour: startHour,
    lesson_duration_hours: durationHours,
    lesson_time: timeLabel,
    participants: input.participants,
    insurance_count: 0,
    amount: 0,
    payment_method: "etc",
    order_no: orderNo,
    notes: buildNotes(input),
    instructor_id: null,
    payment_status: "pending",
    reservation_status: "pending",
  };
}
