import { slotOverlapsGrooming } from "@/lib/grooming";
import { SKI_RESORTS } from "@/lib/site";

/**
 * Per-resort slope operating hours used to generate bookable lesson starts.
 *
 * Hours are decimal (16.5 = 16:30). Close may be 24+ for after-midnight
 * (26 = 02:00). A lesson that ends exactly at close is allowed.
 *
 * 26/27-season pages were not posted as of 2026-10-23, so times come from the
 * latest official 25/26 pages still live on each resort site (or a flagged
 * default when the official page could not be confirmed).
 *
 * Edit this file only — availability, POST /api/bookings, and the booking
 * form all read from RESORT_HOURS. Grooming windows stay in src/lib/grooming.ts.
 */

type ResortValue = (typeof SKI_RESORTS)[number]["value"];

export const LESSON_DURATIONS = [2, 3, 4] as const;
export type LessonDurationHours = (typeof LESSON_DURATIONS)[number];

export const LESSON_START_STEP_HOURS = 0.5;

export type ResortHours = {
  openHour: number;
  /** Closing hour; 24+ means past midnight (26 = 02:00). */
  closeHour: number;
  source: string;
  confirmed: boolean;
  note?: string;
};

const DEFAULT_HOURS: ResortHours = {
  openHour: 9,
  closeHour: 22,
  source: "default: typical 09:00–22:00 winter operating hours",
  confirmed: false,
  note: "Official operating hours were not confirmed; using 09:00–22:00.",
};

export const RESORT_HOURS: Record<ResortValue, ResortHours> = {
  // 하이원: 주간 09:00–16:00, 정설 16:00–18:00, 야간 18:00–22:00.
  // Source: https://www.high1.com/ski/contents.do?key=750
  하이원리조트: {
    openHour: 9,
    closeHour: 22,
    source: "https://www.high1.com/ski/contents.do?key=750",
    confirmed: true,
  },

  // 비발디파크: 주간~심야. Booking uses 09:00–23:00 (late-night to 03:00 exists
  // on some slopes; not offered as a lesson window until confirmed as standard).
  // Source: https://www.sonohotelsresorts.com/skiboard/info
  비발디파크: {
    openHour: 9,
    closeHour: 23,
    source: "https://www.sonohotelsresorts.com/skiboard/info",
    confirmed: true,
    note: "Some slopes list late-night to 03:00; lesson booking closes at 23:00.",
  },

  // 웰리힐리파크: official Korean charge page 404'd. Secondary 25/26 writeups
  // state 동절기 09:00~22:30; night tickets historically run later. Use 24:00
  // so a 2h lesson can start after 16:30–18:30 정설.
  // Fallback refs: https://www.ktriptips.com/kor/leisure/131299
  웰리힐리파크: {
    openHour: 9,
    closeHour: 24,
    source:
      "default from day/night ticket gap; official Korean charge page 404 as of 2026-10-23",
    confirmed: false,
    note: "Official wellihillipark.com charge page was not reachable; 09:00–24:00 is the booking window.",
  },

  // 용평: 주간 09:00–17:00, 야간 19:00–23:00.
  // Source: https://www.yongpyong.co.kr/mobile/kor/skiNboard/charge/lift.do
  용평리조트: {
    openHour: 9,
    closeHour: 23,
    source: "https://www.yongpyong.co.kr/mobile/kor/skiNboard/charge/lift.do",
    confirmed: true,
  },

  // 지산: 주간 09:00–17:00, 정설 17:00–18:30, 야간 18:30–02:00.
  // Source: https://www.jisanresort.co.kr/w/ski/slopes/info.asp
  지산포레스트: {
    openHour: 9,
    closeHour: 26,
    source: "https://www.jisanresort.co.kr/w/ski/slopes/info.asp",
    confirmed: true,
    note: "Night skiing listed through 02:00 (26:00 in booking hours).",
  },
};

export function resortHoursFor(skiResort: string): ResortHours {
  if (skiResort in RESORT_HOURS) {
    return RESORT_HOURS[skiResort as ResortValue];
  }
  return DEFAULT_HOURS;
}

export function isLessonDuration(value: number): value is LessonDurationHours {
  return (LESSON_DURATIONS as readonly number[]).includes(value);
}

export function toHalfHourSteps(hour: number): number {
  return Math.round(hour * 2);
}

export function fromHalfHourSteps(steps: number): number {
  return steps / 2;
}

export function isHalfHour(hour: number): boolean {
  return Number.isFinite(hour) && Math.abs(hour * 2 - Math.round(hour * 2)) < 1e-9;
}

export function normalizeHalfHour(hour: number): number {
  return fromHalfHourSteps(toHalfHourSteps(hour));
}

/** Clock label. 24:00 stays 24:00; 24.5 → 00:30; 26 → 02:00. */
export function formatLessonHour(hour: number): string {
  if (hour === 24) return "24:00";
  const wrapped = hour >= 24 ? hour - 24 * Math.floor(hour / 24) : hour;
  const hours = Math.floor(wrapped);
  const minutes = Math.round((wrapped - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatLessonRange(startHour: number, durationHours: number): string {
  return `${formatLessonHour(startHour)}~${formatLessonHour(startHour + durationHours)}`;
}

export function lessonFitsOperatingHours(
  skiResort: string,
  startHour: number,
  durationHours: number
): boolean {
  if (!isHalfHour(startHour) || !Number.isFinite(durationHours) || durationHours <= 0) {
    return false;
  }
  const hours = resortHoursFor(skiResort);
  const start = toHalfHourSteps(startHour);
  const end = start + toHalfHourSteps(durationHours);
  return start >= toHalfHourSteps(hours.openHour) && end <= toHalfHourSteps(hours.closeHour);
}

export type GeneratedStart = {
  id: string;
  startHour: number;
  durationHours: number;
  timeLabel: string;
};

/**
 * Bookable starts every 30 minutes. Hidden when the window overlaps grooming
 * or would run past closing.
 */
export function generateLessonStarts(
  skiResort: string,
  durationHours: number
): GeneratedStart[] {
  if (!isLessonDuration(durationHours)) return [];
  const hours = resortHoursFor(skiResort);
  const open = toHalfHourSteps(hours.openHour);
  const lastStart = toHalfHourSteps(hours.closeHour) - toHalfHourSteps(durationHours);
  const starts: GeneratedStart[] = [];
  for (let step = open; step <= lastStart; step += 1) {
    const startHour = fromHalfHourSteps(step);
    if (slotOverlapsGrooming(skiResort, startHour, durationHours)) continue;
    starts.push({
      id: formatLessonHour(startHour),
      startHour,
      durationHours,
      timeLabel: formatLessonRange(startHour, durationHours),
    });
  }
  return starts;
}

export function findLessonStart(
  skiResort: string,
  durationHours: number,
  startHour: number
): GeneratedStart | undefined {
  if (!isHalfHour(startHour)) return undefined;
  const normalized = normalizeHalfHour(startHour);
  return generateLessonStarts(skiResort, durationHours).find(
    (slot) => toHalfHourSteps(slot.startHour) === toHalfHourSteps(normalized)
  );
}
