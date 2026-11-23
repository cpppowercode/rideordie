/**
 * 날짜별 강습 요금표 (단위: 원). 얼리버드 고정 판매가.
 *
 * 모든 고객에게 항상 판매가(SALE_TABLE)가 청구됩니다.
 * LIST_TABLE은 표시용 취소선만(손님 문구에 '정가' 라벨 금지).
 * 할인율(%) 라벨은 표시하지 않습니다.
 *
 * 판매가 (항상 청구):
 * - 1:1: 2h 140,000 / 3h 210,000 / 4h 280,000
 * - 2:1: 2h 170,000 / 3h 270,000 / 4h 340,000
 * - 3:1: 2h 220,000 / 3h 330,000 / 4h 440,000
 *
 * 표시용 취소선:
 * - 1:1: 2h 150,000 / 3h 240,000 / 4h 290,000
 * - 2:1: 2h 190,000 / 3h 300,000 / 4h 370,000
 * - 3:1: 2h 240,000 / 3h 360,000 / 4h 470,000
 */
import { resortAllowedRatios } from "@/lib/resorts";
import {
  LIST_TABLE,
  PRICE_HOURS,
  RATIOS,
  SALE_TABLE,
  type PriceHours,
  type PriceTable,
  type Ratio,
} from "@/lib/pricing-tables";

export {
  LIST_TABLE,
  PRICE_HOURS,
  RATIOS,
  SALE_TABLE,
  type PriceHours,
  type PriceTable,
  type Ratio,
};

export type SeasonSettings = {
  /**
   * 강습 일정 오픈일 YYYY-MM-DD.
   * null = 즉시 오픈(기본). 어드민이 명시적으로 넣은 경우에만 /book 에서
   * 그 날짜 미만을 '오픈 예정'으로 막는다.
   */
  seasonStart: string | null;
  /** 시즌 종료일 YYYY-MM-DD, 없으면 null */
  seasonEnd: string | null;
};
/** 기본: 오픈일 미설정 → 홈페이지 예약 즉시 가능. */
export const DEFAULT_SETTINGS: SeasonSettings = { seasonStart: null, seasonEnd: null };
/** 하위 호환 이름: 어드민 값을 못 읽을 때 쓰는 기본값 */
export const UNSET_SETTINGS = DEFAULT_SETTINGS;

const YMD = /^\d{4}-\d{2}-\d{2}$/;
export function isYmd(v: unknown): v is string {
  if (typeof v !== "string" || !YMD.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

export function normalizeSettings(raw: Partial<Record<keyof SeasonSettings, unknown>> | null | undefined): SeasonSettings {
  const seasonStart = isYmd(raw?.seasonStart) ? (raw!.seasonStart as string) : null;
  const seasonEnd = isYmd(raw?.seasonEnd) ? (raw!.seasonEnd as string) : null;
  if (seasonStart && seasonEnd && seasonEnd < seasonStart) return { seasonStart, seasonEnd: null };
  return { seasonStart, seasonEnd };
}

/** 오늘 날짜(KST) YYYY-MM-DD */
export function kstDate(now: Date): string {
  return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}
export function kstToday(now: Date = new Date()): string {
  const mock = process.env.PRICING_MOCK_TODAY;
  if (mock && process.env.VERCEL_ENV !== "production" && isYmd(mock)) return mock;
  return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

/**
 * 강습 일정이 오픈된 날짜인지.
 * seasonStart 가 없으면(기본) 항상 오픈. 어드민이 오픈일을 넣은 경우에만 그 미만을 막는다.
 */
export function isLessonScheduleOpen(lessonDate: string, settings: SeasonSettings = DEFAULT_SETTINGS): boolean {
  if (!isYmd(lessonDate)) return false;
  if (settings.seasonStart && isYmd(settings.seasonStart) && lessonDate < settings.seasonStart) return false;
  if (settings.seasonEnd && isYmd(settings.seasonEnd) && lessonDate > settings.seasonEnd) return false;
  return true;
}

export const SCHEDULE_OPENING_SOON_MESSAGE = "해당 날짜는 아직 강습 일정이 오픈되지 않았습니다.";

/** 항상 판매가를 반환 (날짜와 무관) */
export function saleTable(): PriceTable {
  return SALE_TABLE;
}

/** 표시용 취소선 테이블 */
export function listTable(): PriceTable {
  return LIST_TABLE;
}

export function ratioForParticipants(n: number): Ratio | null {
  return n === 1 ? "1:1" : n === 2 ? "2:1" : n === 3 ? "3:1" : null;
}

export class PriceError extends Error {}

/** 리조트별 가능한 구성. 용평은 3:1 불가(RESORTS SSOT). */
export function allowedRatios(skiResort: string): Ratio[] {
  return resortAllowedRatios(skiResort);
}
export function assertResortRatio(skiResort: string, participants: number): void {
  const ratio = ratioForParticipants(participants);
  if (ratio && !allowedRatios(skiResort).includes(ratio)) {
    throw new PriceError(
      `${String(skiResort).includes("용평") ? "용평은" : "이 스키장은"} ${allowedRatios(skiResort).join("·")} 강습만 가능합니다.`,
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function lessonPrice(dateYmd: string, participants: number, hours: number, _s: SeasonSettings): { amount: number } {
  const ratio = ratioForParticipants(participants);
  if (!ratio) throw new PriceError("인원은 1:1, 2:1, 3:1 중에서 선택해 주세요.");
  if (!(PRICE_HOURS as readonly number[]).includes(hours)) throw new PriceError("강습 시간은 2·3·4시간 중에서 선택해 주세요.");
  return { amount: SALE_TABLE[ratio][hours as PriceHours] };
}

/** 대표 가격 문구 (상세): 1:1 2시간 14만원 */
export function headlineCopy(): string {
  const salePrice = SALE_TABLE["1:1"][2] / 10000;
  return `1:1 2시간 ${salePrice}만원`;
}

/** 메타·히어로용 얼리버드 대표 문구 */
export function earlyBirdFromCopy(): string {
  const salePrice = SALE_TABLE["1:1"][2] / 10000;
  return `얼리버드 ${salePrice}만원부터`;
}
