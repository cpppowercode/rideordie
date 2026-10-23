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
 * 얼리버드: (a) 예약일(오늘, KST)이 해당 리조트 개장일+earlyBirdWindowDays 이내
 * 이거나 (b) 강습일이 그 시즌 lateSeasonStart(02-15) 이후.
 * 날짜 비교는 전부 KST 달력 기준입니다.
 */
export const EARLY_BIRD_RULE = {
  seasonLabel: "26/27",
  earlyBirdWindowDays: 14,
  lateSeasonStart: "02-15",
} as const;

export type OpeningDateSource = "official" | "estimate";

export type ResortOpening = {
  /** 26/27 시즌 개장일 YYYY-MM-DD. */
  openingDate: string;
  source: OpeningDateSource;
  note: string;
};

/**
 * 26/27 시즌 개장일. 2026-10-23 기준 다섯 곳 모두 공식 미발표.
 * 지난 시즌(25/26) 실제 개장일을 추정값으로 넣었습니다. ESTIMATE로 표시.
 */
export const RESORT_OPENING_DATES: Record<ResortValue, ResortOpening> = {
  하이원리조트: {
    openingDate: "2026-11-28",
    source: "estimate",
    note: "ESTIMATE: 26/27 공식 미발표. 25/26 공식 개장 2025-11-28을 그대로 옮김.",
  },
  비발디파크: {
    openingDate: "2026-12-05",
    source: "estimate",
    note: "ESTIMATE: 26/27 공식 미발표. 24/25·25/26 개장이 모두 12-05.",
  },
  웰리힐리파크: {
    openingDate: "2026-12-05",
    source: "estimate",
    note: "ESTIMATE: 26/27 공식 미발표. 25/26 개장 2025-12-05.",
  },
  용평리조트: {
    openingDate: "2026-11-21",
    source: "estimate",
    note: "ESTIMATE: 26/27 공식 미발표. 25/26 개장 2025-11-21.",
  },
  지산포레스트: {
    openingDate: "2026-12-08",
    source: "estimate",
    note: "ESTIMATE: 26/27 공식 미발표. 25/26 개장 2025-12-08.",
  },
};

export type EarlyBirdReason = "opening-window" | "late-season";

export const EARLY_BIRD_REASON_LABEL: Record<EarlyBirdReason, string> = {
  "opening-window": "개장 초 예약",
  "late-season": "2월 중순 이후 강습",
};

export type EarlyBirdDecision = {
  earlyBird: boolean;
  reasons: EarlyBirdReason[];
  reasonLabel: string;
  openingDate: string | null;
  windowEndDate: string | null;
  lateSeasonDate: string | null;
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
  earlyBirdReasons: EarlyBirdReason[];
  earlyBirdReasonLabel: string;
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

function parseYmd(ymd: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

export function addDaysYmd(ymd: string, days: number): string {
  const ms = Date.parse(`${ymd}T00:00:00+09:00`);
  if (!Number.isFinite(ms)) return ymd;
  return kstYmd(new Date(ms + days * 86_400_000));
}

export function addYearsYmd(ymd: string, years: number): string {
  const parsed = parseYmd(ymd);
  if (!parsed) return ymd;
  const year = parsed.year + years;
  const lastDay = new Date(Date.UTC(year, parsed.month, 0)).getUTCDate();
  const day = Math.min(parsed.day, lastDay);
  return `${year}-${String(parsed.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 강습일이 속한 스키 시즌의 종료 연도. 7–12월은 다음 해, 1–6월은 그해. */
export function skiSeasonEndYear(ymd: string): number | null {
  const parsed = parseYmd(ymd);
  if (!parsed) return null;
  return parsed.month >= 7 ? parsed.year + 1 : parsed.year;
}

export function lateSeasonDateFor(lessonDate: string): string | null {
  const endYear = skiSeasonEndYear(lessonDate);
  if (endYear == null) return null;
  return `${endYear}-${EARLY_BIRD_RULE.lateSeasonStart}`;
}

export function openingDateFor(skiResort: string | undefined, lessonDate: string): string | null {
  if (!skiResort) return null;
  const base = RESORT_OPENING_DATES[skiResort as ResortValue];
  if (!base) return null;
  const lessonEnd = skiSeasonEndYear(lessonDate);
  const baseEnd = skiSeasonEndYear(base.openingDate);
  if (lessonEnd == null || baseEnd == null) return null;
  return addYearsYmd(base.openingDate, lessonEnd - baseEnd);
}

export function evaluateEarlyBird(input: {
  lessonDate: string;
  skiResort?: string;
  now?: Date;
}): EarlyBirdDecision {
  const today = kstYmd(input.now ?? new Date());
  const openingDate = openingDateFor(input.skiResort, input.lessonDate);
  const windowEndDate = openingDate
    ? addDaysYmd(openingDate, EARLY_BIRD_RULE.earlyBirdWindowDays)
    : null;
  const lateSeasonDate = lateSeasonDateFor(input.lessonDate);
  const reasons: EarlyBirdReason[] = [];
  if (openingDate && windowEndDate && today <= windowEndDate) {
    reasons.push("opening-window");
  }
  if (lateSeasonDate && input.lessonDate >= lateSeasonDate) {
    reasons.push("late-season");
  }
  return {
    earlyBird: reasons.length > 0,
    reasons,
    reasonLabel: reasons.map((reason) => EARLY_BIRD_REASON_LABEL[reason]).join(" · "),
    openingDate,
    windowEndDate,
    lateSeasonDate,
  };
}

export function isEarlyBird(
  lessonDate: string,
  skiResort?: string,
  now = new Date()
): boolean {
  return evaluateEarlyBird({ lessonDate, skiResort, now }).earlyBird;
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
  const decision = evaluateEarlyBird({
    lessonDate: input.lessonDate,
    skiResort: input.skiResort,
    now: input.now,
  });
  const regularAmount = REGULAR_PRICES[ratio][duration];
  const lessonAmount = decision.earlyBird ? EARLY_BIRD_PRICES[ratio][duration] : regularAmount;
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
    earlyBird: decision.earlyBird,
    earlyBirdReasons: decision.reasons,
    earlyBirdReasonLabel: decision.reasonLabel,
  };
}

export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}
