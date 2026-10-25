/** 결제 전(아직 접수 안 된) 예약 입력값. 브라우저 탭(sessionStorage)에만 보관한다. */
export const PENDING_BOOKING_KEY = "rod_pending_booking";

export type PendingBooking = {
  customerName: string;
  customerPhone: string;
  participants: number;
  childCount: number;
  skiResort: string;
  lessonType: string;
  lessonDate: string;
  durationHours: number;
  startHour: number;
  notes: string;
  timeLabel: string;
};

export function readPendingBooking(): PendingBooking | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_BOOKING_KEY);
    return raw ? (JSON.parse(raw) as PendingBooking) : null;
  } catch {
    return null;
  }
}
