/**
 * 날짜별 강습 요금표 (단위: 원). 사장님 결정 2026-10-26 03:15 KST.
 *
 * - 시즌 전(얼리버드): 시즌 시작일 전날까지        → EARLY 표, 문구 '얼리버드 14만원부터'
 * - 시즌 중(일반):     시즌 시작일 ~ 2월 14일       → REGULAR 표
 * - 시즌말 특가:       2월 15일 ~ 시즌 종료일       → EARLY 표와 같은 금액, 라벨 '시즌말 특가'
 *
 * 기준 날짜: 결제 금액은 '강습 날짜(KST)'로 정한다. 사이트 표·문구는 '오늘(KST)'의 기간을 보여 준다.
 * 시즌 시작일·종료일은 어드민 설정에서 읽는다. 못 읽으면 시작일 2026-12-07, 종료일 미정(기본값).
 * 종료일 미정이면 2/15 이후 계속 시즌말 특가를 보여 준다(사장님 결정 03:16).
 */
export const RATIOS = ["1:1", "2:1", "3:1"] as const;
export const PRICE_HOURS = [2, 3, 4] as const;
export type Ratio = (typeof RATIOS)[number];
export type PriceHours = (typeof PRICE_HOURS)[number];
export type PriceTable = Record<Ratio, Record<PriceHours, number>>;

export const EARLY_TABLE: PriceTable = {
  "1:1": { 2: 140_000, 3: 210_000, 4: 270_000 },
  "2:1": { 2: 170_000, 3: 250_000, 4: 330_000 },
  "3:1": { 2: 210_000, 3: 300_000, 4: 390_000 },
};
export const REGULAR_TABLE: PriceTable = {
  "1:1": { 2: 150_000, 3: 220_000, 4: 290_000 },
  "2:1": { 2: 180_000, 3: 270_000, 4: 350_000 },
  "3:1": { 2: 210_000, 3: 310_000, 4: 400_000 },
};

export type SeasonSettings = {
  /** 시즌 시작일(=얼리버드 종료 다음날) YYYY-MM-DD, 없으면 null(확인 필요) */
  seasonStart: string | null;
  /** 시즌 종료일 YYYY-MM-DD, 없으면 null(확인 필요) */
  seasonEnd: string | null;
};
/** 사장님 결정 2026-10-26 03:16: 얼리버드 2026-12-06까지, 2026-12-07부터 일반. 종료일 미정. */
export const DEFAULT_SEASON_START = "2026-12-07";
export const DEFAULT_SETTINGS: SeasonSettings = { seasonStart: DEFAULT_SEASON_START, seasonEnd: null };
/** 하위 호환 이름: 어드민 값을 못 읽을 때 쓰는 기본값 */
export const UNSET_SETTINGS = DEFAULT_SETTINGS;

export type PricePeriod = "early" | "regular" | "late";
export const PERIOD_LABEL: Record<PricePeriod, string> = { early: "얼리버드", regular: "일반 요금", late: "시즌말 특가" };

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
  // 미리보기·스크린샷용 날짜 고정(운영 배포에서는 무시). 결제 금액은 강습 날짜로 계산하므로 영향 없음.
  const mock = process.env.PRICING_MOCK_TODAY;
  if (mock && process.env.VERCEL_ENV !== "production" && isYmd(mock)) return mock;
  return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

export function periodFor(dateYmd: string, s: SeasonSettings): PricePeriod {
  if (!isYmd(dateYmd)) return "regular";
  if (s.seasonStart && dateYmd < s.seasonStart) return "early";
  if (!s.seasonStart) return "regular";
  // 시즌말 특가 시작: 시즌 시작일 다음에 오는 2월 15일
  const y = Number(s.seasonStart.slice(0, 4));
  const lateStart = s.seasonStart <= `${y}-02-15` ? `${y}-02-15` : `${y + 1}-02-15`;
  if (dateYmd >= lateStart) {
    // 종료일 미정이면 계속 시즌말 특가. 종료일 다음날부터는 일반 요금(덜 받지 않도록).
    if (!s.seasonEnd || dateYmd <= s.seasonEnd) return "late";
  }
  return "regular";
}

export function tableFor(period: PricePeriod): PriceTable {
  return period === "regular" ? REGULAR_TABLE : EARLY_TABLE;
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

export function lessonPrice(dateYmd: string, participants: number, hours: number, s: SeasonSettings): { period: PricePeriod; amount: number } {
  const ratio = ratioForParticipants(participants);
  if (!ratio) throw new PriceError("인원은 1:1, 2:1, 3:1 중에서 선택해 주세요.");
  if (!(PRICE_HOURS as readonly number[]).includes(hours)) throw new PriceError("강습 시간은 2·3·4시간 중에서 선택해 주세요.");
  const period = periodFor(dateYmd, s);
  return { period, amount: tableFor(period)[ratio][hours as PriceHours] };
}

export function headlineCopy(period: PricePeriod): string {
  const from = tableFor(period)["1:1"][2] / 10000;
  return period === "early" ? `얼리버드 ${from}만원부터` : period === "late" ? `시즌말 특가 ${from}만원부터` : `1:1 2시간 ${from}만원부터`;
}
