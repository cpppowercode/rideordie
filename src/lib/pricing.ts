import type { LessonDurationHours } from "@/lib/hours";
import { SKI_RESORTS } from "@/lib/site";

export const MAX_PARTICIPANTS_PER_INSTRUCTOR = 3;

export type InstructorRatio = "1:1" | "2:1" | "3:1";

export const INSTRUCTOR_RATIOS = ["1:1", "2:1", "3:1"] as const;

type ResortValue = (typeof SKI_RESORTS)[number]["value"];

/**
 * 패찰비 산정 단위.
 * 기본은 강습 1회당 1회(`per-lesson`). 인원당으로 바꾸려면 리조트 config의
 * `badgeFeeBasis`만 `"per-person"`으로 바꾸면 `quoteLessonPrice`가 인원을 곱합니다.
 */
export type SurchargeBasis = "per-lesson" | "per-person";

export type ResortSurcharge = {
  /** 패찰비 단가(원). 0이면 부과하지 않음. */
  badgeFee: number;
  badgeFeeBasis: SurchargeBasis;
};

const ZERO_SURCHARGE: ResortSurcharge = {
  badgeFee: 0,
  badgeFeeBasis: "per-lesson",
};

/**
 * 리조트별 패찰비.
 * 지산·비발디만 부과하고 나머지는 0입니다.
 * 기본 산정은 강습 1회당(`per-lesson`). 인원당으로 바꾸려면 `badgeFeeBasis`만 `"per-person"`으로 바꿉니다.
 *
 * TODO-owner-confirm: 비발디·지산 `badgeFee` 금액을 넣어 주세요. 지금은 0원 플레이스홀더입니다.
 */
export const RESORT_SURCHARGES: Record<ResortValue, ResortSurcharge> = {
  하이원리조트: { ...ZERO_SURCHARGE },
  비발디파크: {
    // TODO-owner-confirm: 비발디 패찰비(원)
    badgeFee: 0,
    badgeFeeBasis: "per-lesson",
  },
  웰리힐리파크: { ...ZERO_SURCHARGE },
  용평리조트: { ...ZERO_SURCHARGE },
  지산포레스트: {
    // TODO-owner-confirm: 지산 패찰비(원)
    badgeFee: 0,
    badgeFeeBasis: "per-lesson",
  },
};

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
  /** 정가 강습비 (패찰비 제외). */
  regularAmount: number;
  /** 이번 예약 강습비 (얼리버드면 특가, 패찰비 제외). */
  lessonAmount: number;
  /** 패찰비 단가 (config 값). */
  badgeFeeUnit: number;
  /** 적용된 패찰비 총액. per-person이면 단가 × 인원. */
  badgeFee: number;
  badgeFeeBasis: SurchargeBasis;
  /** 결제 총액 = lessonAmount + badgeFee. */
  payableAmount: number;
  earlyBird: boolean;
};

export function resortSurcharge(skiResort: string | undefined): ResortSurcharge {
  if (!skiResort) return ZERO_SURCHARGE;
  return RESORT_SURCHARGES[skiResort as ResortValue] ?? ZERO_SURCHARGE;
}

/** 단가와 산정 단위로 패찰비 총액을 계산합니다. 나중에 per-person으로 바꿔도 호출부는 그대로입니다. */
export function badgeFeeAmount(surcharge: ResortSurcharge, participants: number): number {
  if (surcharge.badgeFee <= 0) return 0;
  if (surcharge.badgeFeeBasis === "per-person") {
    return surcharge.badgeFee * Math.max(1, participants);
  }
  return surcharge.badgeFee;
}

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
  skiResort?: string;
  now?: Date;
}): PriceQuote | null {
  const duration = input.durationHours;
  if (duration !== 2 && duration !== 3 && duration !== 4) return null;
  const ratio = ratioFromParticipants(input.participants);
  if (!ratio) return null;
  const earlyBird = isEarlyBird(input.lessonDate, input.now);
  const regularAmount = REGULAR_PRICES[ratio][duration];
  const lessonAmount = earlyBird ? EARLY_BIRD_PRICES[ratio][duration] : regularAmount;
  const surcharge = resortSurcharge(input.skiResort);
  const badgeFee = badgeFeeAmount(surcharge, input.participants);
  return {
    ratio,
    durationHours: duration,
    regularAmount,
    lessonAmount,
    badgeFeeUnit: surcharge.badgeFee,
    badgeFee,
    badgeFeeBasis: surcharge.badgeFeeBasis,
    payableAmount: lessonAmount + badgeFee,
    earlyBird,
  };
}

export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}
