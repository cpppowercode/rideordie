/**
 * 날짜별 강습 요금표 (단위: 원). 사장님 결정 2026-11-10: 정가 업데이트.
 *
 * 모든 고객에게 항상 판매가(SALE_TABLE)가 청구됩니다.
 * 정가(LIST_TABLE)는 표시용으로만 사용됩니다(취소선 처리).
 * 할인율(%) 라벨은 표시하지 않습니다.
 * 
 * 판매가 (항상 청구):
 * - 1:1: 2h 140,000 / 3h 210,000 / 4h 280,000
 * - 2:1: 2h 170,000 / 3h 270,000 / 4h 360,000
 * - 3:1: 2h 220,000 / 3h 330,000 / 4h 440,000
 * 
 * 정가 (표시용, 취소선):
 * - 1:1: 2h 150,000 / 3h 240,000 / 4h 290,000
 * - 2:1: 2h 190,000 / 3h 300,000 / 4h 370,000
 * - 3:1: 2h 240,000 / 3h 360,000 / 4h 470,000
 */
export const RATIOS = ["1:1", "2:1", "3:1"] as const;
export const PRICE_HOURS = [2, 3, 4] as const;
export type Ratio = (typeof RATIOS)[number];
export type PriceHours = (typeof PRICE_HOURS)[number];
export type PriceTable = Record<Ratio, Record<PriceHours, number>>;

export const SALE_TABLE: PriceTable = {
  "1:1": { 2: 140_000, 3: 210_000, 4: 280_000 },
  "2:1": { 2: 170_000, 3: 270_000, 4: 360_000 },
  "3:1": { 2: 220_000, 3: 330_000, 4: 440_000 },
};
export const LIST_TABLE: PriceTable = {
  "1:1": { 2: 150_000, 3: 240_000, 4: 290_000 },
  "2:1": { 2: 190_000, 3: 300_000, 4: 370_000 },
  "3:1": { 2: 240_000, 3: 360_000, 4: 470_000 },
};

export type SeasonSettings = {
  /** 시즌 시작일 YYYY-MM-DD, 없으면 null (더 이상 가격 변경에 사용되지 않음) */
  seasonStart: string | null;
  /** 시즌 종료일 YYYY-MM-DD, 없으면 null */
  seasonEnd: string | null;
};
/** 기본 시즌 설정 (가격은 더 이상 날짜와 무관하게 항상 세일 가격) */
export const DEFAULT_SEASON_START = "2026-12-07";
export const DEFAULT_SETTINGS: SeasonSettings = { seasonStart: DEFAULT_SEASON_START, seasonEnd: null };
/** 하위 호환 이름: 어드민 값을 못 읽을 때 쓰는 기본값 */
export const UNSET_SETTINGS = DEFAULT_SETTINGS;

const YMD = /^\d{4}-\d{2}-\d{2}$/;
export function isYmd(v: unknown): v is string {
  if (typeof v !== "string" || !YMD.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

export function normalizeSettings(raw: Partial<Record<keyof SeasonSettings, unknown>> | null | undefined): SeasonSettings {
  const seasonStart = isYmd(raw?.seasonStart) ? raw!.seasonStart as string : DEFAULT_SEASON_START;
  const seasonEnd = isYmd(raw?.seasonEnd) ? raw!.seasonEnd as string : null;
  if (seasonEnd && seasonEnd < seasonStart) return { seasonStart, seasonEnd: null };
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

/** 항상 판매가를 반환 (날짜와 무관) */
export function saleTable(): PriceTable {
  return SALE_TABLE;
}

/** 정가 테이블 (표시용, 취소선 처리) */
export function listTable(): PriceTable {
  return LIST_TABLE;
}

export function ratioForParticipants(n: number): Ratio | null {
  return n === 1 ? "1:1" : n === 2 ? "2:1" : n === 3 ? "3:1" : null;
}

export class PriceError extends Error {}

/** 리조트별 가능한 구성. 용평은 3:1 불가(1:1·2:1만, 사장님 결정 10/26). */
export function allowedRatios(skiResort: string): Ratio[] {
  const r = String(skiResort || "").replace(/\s/g, "");
  return r.includes("용평") ? ["1:1", "2:1"] : [...RATIOS];
}
export function assertResortRatio(skiResort: string, participants: number): void {
  const ratio = ratioForParticipants(participants);
  if (ratio && !allowedRatios(skiResort).includes(ratio)) throw new PriceError(`${String(skiResort).includes("용평") ? "용평은" : "이 스키장은"} ${allowedRatios(skiResort).join("·")} 강습만 가능합니다.`);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function lessonPrice(dateYmd: string, participants: number, hours: number, _s: SeasonSettings): { amount: number } {
  const ratio = ratioForParticipants(participants);
  if (!ratio) throw new PriceError("인원은 1:1, 2:1, 3:1 중에서 선택해 주세요.");
  if (!(PRICE_HOURS as readonly number[]).includes(hours)) throw new PriceError("강습 시간은 2·3·4시간 중에서 선택해 주세요.");
  return { amount: SALE_TABLE[ratio][hours as PriceHours] };
}

export function headlineCopy(): string {
  const salePrice = SALE_TABLE["1:1"][2] / 10000;
  return `1:1 2시간 ${salePrice}만원`;
}
