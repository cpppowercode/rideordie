import { BOOKING_SLOT_CAPACITY, LESSON_SLOTS, SKI_RESORTS } from "@/lib/site";

export type BookingInput = {
  customerName: string;
  customerPhone: string;
  participants: number;
  childCount: number;
  skiResort: string;
  lessonType: string;
  lessonDate: string;
  slotId: string;
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

export function slotsOverlap(
  startA: number,
  durationA: number,
  startB: number,
  durationB: number
): boolean {
  return startA < startB + durationB && startB < startA + durationA;
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
  capacity = BOOKING_SLOT_CAPACITY
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

  if (!Number.isInteger(input.participants) || input.participants < 1 || input.participants > 8) {
    return "인원은 1명에서 8명까지 선택할 수 있습니다.";
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
  if (!LESSON_SLOTS.some((slot) => slot.id === input.slotId)) {
    return "시간대를 선택해 주세요.";
  }
  if ((input.notes || "").length > 1000) {
    return "메모는 1000자 이내로 작성해 주세요.";
  }
  return null;
}

export function buildNotes(input: BookingInput): string {
  const parts = [
    "[홈페이지 예약]",
    `총 ${input.participants}명`,
    `아이 ${input.childCount}명`,
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
  const slot = LESSON_SLOTS.find((item) => item.id === input.slotId);
  if (!slot) throw new Error("시간대를 선택해 주세요.");

  return {
    customer_name: input.customerName.trim(),
    customer_phone: normalizePhone(input.customerPhone),
    lesson_type: input.lessonType,
    ski_resort: input.skiResort,
    lesson_date: input.lessonDate,
    lesson_start_hour: slot.startHour,
    lesson_duration_hours: slot.durationHours,
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
