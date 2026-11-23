/**
 * 강습 요금표 숫자만. UI 문구·시즌 로직은 pricing.ts 참고.
 *
 * 판매가(SALE): 항상 청구되는 얼리버드 고정 요금.
 * 표시용 취소선(LIST): 손님 문구에 '정가' 라벨을 붙이지 않고 취소선만 쓴다.
 */
export const RATIOS = ["1:1", "2:1", "3:1"] as const;
export const PRICE_HOURS = [2, 3, 4] as const;
export type Ratio = (typeof RATIOS)[number];
export type PriceHours = (typeof PRICE_HOURS)[number];
export type PriceTable = Record<Ratio, Record<PriceHours, number>>;

/** 얼리버드 고정 판매가 (항상 청구) */
export const SALE_TABLE: PriceTable = {
  "1:1": { 2: 140_000, 3: 210_000, 4: 280_000 },
  "2:1": { 2: 170_000, 3: 270_000, 4: 340_000 },
  "3:1": { 2: 220_000, 3: 330_000, 4: 440_000 },
};

/** 표시용 취소선 금액 (라벨 없이 취소선만) */
export const LIST_TABLE: PriceTable = {
  "1:1": { 2: 150_000, 3: 240_000, 4: 290_000 },
  "2:1": { 2: 190_000, 3: 300_000, 4: 370_000 },
  "3:1": { 2: 240_000, 3: 360_000, 4: 470_000 },
};
