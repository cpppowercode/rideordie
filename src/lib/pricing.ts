import type { LessonDurationHours } from "@/lib/hours";

export const MAX_PARTICIPANTS_PER_INSTRUCTOR = 3;

export type InstructorRatio = "1:1" | "2:1" | "3:1";

export const INSTRUCTOR_RATIOS = ["1:1", "2:1", "3:1"] as const;

type PriceTable = Record<InstructorRatio, Record<LessonDurationHours, number>>;

/** 정가. 강습 1회 총액(원), 강습 시간 × 강사 비율. */
export const REGULAR_PRICES: PriceTable = {
  "1:1": { 2: 150_000, 3: 220_000, 4: 290_000 },
  "2:1": { 2: 180_000, 3: 270_000, 4: 350_000 },
  "3:1": { 2: 210_000, 3: 310_000, 4: 400_000 },
};

/** 얼리버드 가. 강습 1회 총액(원). */
export const EARLY_BIRD_PRICES: PriceTable = {
  "1:1": { 2: 140_000, 3: 200_000, 4: 270_000 },
  "2:1": { 2: 170_000, 3: 250_000, 4: 330_000 },
  "3:1": { 2: 200_000, 3: 300_000, 4: 390_000 },
};

/**
 * TODO-owner-confirm: 얼리버드 적용 규칙을 라이브 전에 확정해 주세요.
 * - `untilDate`: 이 날짜(KST, 포함)까지 모든 예약에 얼리버드
 * - `daysBeforeLesson`: 강습일까지 N일 이상 남으면 얼리버드
 * - `off`: 얼리버드 없음
 */
export const EARLY_BIRD_RULE: {
  mode: "untilDate" | "daysBeforeLesson" | "off";
  untilDate: string;
  daysBeforeLesson: number;
} = {
  mode: "daysBeforeLesson",
  untilDate: "2026-12-15",
  daysBeforeLesson: 14,
};

export type PriceQuote = {
  ratio: InstructorRatio;
  durationHours: LessonDurationHours;
  regularAmount: number;
  payableAmount: number;
  earlyBird: boolean;
};

export function ratioFromParticipants(participants: number): InstructorRatio | null {
  if (participants === 1) return "1:1";
  if (participants === 2) return "2:1";
  if (participants === 3) return "3:1";
  return null;
}

export function kstYmd(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function calendarDaysUntil(lessonDate: string, now = new Date()): number {
  const today = kstYmd(now);
  const start = Date.parse(`${today}T00:00:00+09:00`);
  const end = Date.parse(`${lessonDate}T00:00:00+09:00`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.round((end - start) / 86_400_000);
}

export function isEarlyBird(lessonDate: string, now = new Date()): boolean {
  if (EARLY_BIRD_RULE.mode === "off") return false;
  if (EARLY_BIRD_RULE.mode === "untilDate") {
    return Boolean(EARLY_BIRD_RULE.untilDate) && kstYmd(now) <= EARLY_BIRD_RULE.untilDate;
  }
  return calendarDaysUntil(lessonDate, now) >= EARLY_BIRD_RULE.daysBeforeLesson;
}

export function quoteLessonPrice(input: {
  durationHours: number;
  participants: number;
  lessonDate: string;
  now?: Date;
}): PriceQuote | null {
  const duration = input.durationHours;
  if (duration !== 2 && duration !== 3 && duration !== 4) return null;
  const ratio = ratioFromParticipants(input.participants);
  if (!ratio) return null;
  const earlyBird = isEarlyBird(input.lessonDate, input.now);
  const regularAmount = REGULAR_PRICES[ratio][duration];
  const payableAmount = earlyBird ? EARLY_BIRD_PRICES[ratio][duration] : regularAmount;
  return { ratio, durationHours: duration, regularAmount, payableAmount, earlyBird };
}

export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}
