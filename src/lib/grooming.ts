import { slotsOverlap } from "@/lib/overlap";
import { SKI_RESORTS } from "@/lib/site";

/**
 * Per-resort slope grooming (정설) windows used to block lesson bookings.
 *
 * Hours are decimal (16.5 = 16:30). Windows are half-open: a slot that ends
 * exactly when grooming starts, or starts exactly when grooming ends, is OK.
 *
 * 26/27-season pages were not posted as of 2026-10-23, so times come from the
 * latest official 25/26 pages still live on each resort site (or a flagged
 * default when the official page could not be confirmed).
 *
 * Edit this file only — availability, POST /api/bookings, and the booking
 * form all read from GROOMING_BREAKS.
 */

export const GROOMING_REASON = "grooming";
export const GROOMING_LABEL = "정설 시간";
export const GROOMING_BOOKING_ERROR =
  "정설 시간에는 강습을 예약할 수 없습니다.";

export type GroomingWindow = {
  /** Start of the grooming break, e.g. 17.5 = 17:30. */
  startHour: number;
  durationHours: number;
  /** Official (or fallback) source cited for this window. */
  source: string;
  /** False when the official 26/27 (or live) page could not be confirmed. */
  confirmed: boolean;
  note?: string;
};

type ResortValue = (typeof SKI_RESORTS)[number]["value"];

/** Typical day-to-night gap used only when a resort has no confirmed window. */
const DEFAULT_GROOMING: GroomingWindow = {
  startHour: 17,
  durationHours: 2,
  source: "default: typical 17:00–19:00 day-to-night slope grooming gap",
  confirmed: false,
  note: "Official 정설 hours were not confirmed; using the common afternoon/night gap.",
};

export const GROOMING_BREAKS: Record<ResortValue, GroomingWindow[]> = {
  // 하이원: 주간 09:00–16:00, 정설 16:00–18:00, 야간 18:00–22:00.
  // Source: https://www.high1.com/ski/contents.do?key=750
  // ("정설시간(16시~18시) 이용 불가합니다.") — 25/26 page still live.
  하이원리조트: [
    {
      startHour: 16,
      durationHours: 2,
      source: "https://www.high1.com/ski/contents.do?key=750",
      confirmed: true,
    },
  ],

  // 비발디파크: 매일 17:30–19:00 (블루스/힙합Ⅰ/힙합Ⅱ는 17:00–19:00).
  // Booking uses the main window 17:30–19:00; night2 18:00–20:00 still overlaps.
  // Source: https://www.sonohotelsresorts.com/skiboard/info
  비발디파크: [
    {
      startHour: 17.5,
      durationHours: 1.5,
      source: "https://www.sonohotelsresorts.com/skiboard/info",
      confirmed: true,
      note: "Blues / Hip-hop I / Hip-hop II groom 17:00–19:00; main slopes 17:30–19:00.",
    },
  ],

  // 웰리힐리파크: Korean charge page 404'd. Afternoon tickets historically end
  // 16:30 and night tickets start 18:30. Secondary 25/26 writeups state
  // 16:30–18:30 정설. Treat as a default until the official page is restored.
  // Fallback refs: https://www.ktriptips.com/kor/leisure/131299
  // (VisitKorea-style listing: 동절기 09:00~22:30, 정비 16:30~18:30)
  웰리힐리파크: [
    {
      startHour: 16.5,
      durationHours: 2,
      source:
        "default from day/night ticket gap (오후 ~16:30, 야간 18:30~); official Korean charge page 404 as of 2026-10-23",
      confirmed: false,
      note: "Official wellihillipark.com charge page was not reachable; 16:30–18:30 is the usual break.",
    },
  ],

  // 용평: 주간 09:00–17:00, 야간 19:00–23:00, 오후야간권 Breaktime 17:00–19:00.
  // Source: https://www.yongpyong.co.kr/mobile/kor/skiNboard/charge/lift.do
  용평리조트: [
    {
      startHour: 17,
      durationHours: 2,
      source: "https://www.yongpyong.co.kr/mobile/kor/skiNboard/charge/lift.do",
      confirmed: true,
      note: "Listed as 오후야간권 Breaktime 17:00–19:00 on the 25/26 lift ticket table.",
    },
  ],

  // 지산: 주간 09:00–17:00, 정설 17:00–18:30, 야간 18:30–24:00.
  // Source: https://www.jisanresort.co.kr/w/ski/slopes/info.asp
  // Also https://jisanresort.co.kr/m/ski/use/rental.asp
  지산포레스트: [
    {
      startHour: 17,
      durationHours: 1.5,
      source: "https://www.jisanresort.co.kr/w/ski/slopes/info.asp",
      confirmed: true,
    },
  ],
};

export function formatGroomingHour(hour: number): string {
  const hours = Math.floor(hour);
  const minutes = Math.round((hour - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function groomingWindowsFor(skiResort: string): GroomingWindow[] {
  if (skiResort in GROOMING_BREAKS) {
    return GROOMING_BREAKS[skiResort as ResortValue];
  }
  return [DEFAULT_GROOMING];
}

export function slotOverlapsGrooming(
  skiResort: string,
  startHour: number,
  durationHours: number
): boolean {
  return groomingWindowsFor(skiResort).some((window) =>
    slotsOverlap(startHour, durationHours, window.startHour, window.durationHours)
  );
}
