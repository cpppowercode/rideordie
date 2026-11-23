/**
 * 패찰비(리조트 강습 패찰 비용) 계산.
 *
 * 스키장·패찰비 종류는 src/lib/resorts.ts (RESORTS SSOT) 한 곳에서만 정한다.
 * 금액 산식만 이 파일에 둔다.
 *
 * 출처: 어드민 패널 "시즌 강습 정가 계산기"
 *   cpppowercode/admin · main · src/app/(admin)/(others-pages)/(Calc)/Calculator/page.tsx
 *   (최종 커밋 f2bd5f3, 비발디 단가는 3dedf39 "비발디 패찰비 업데이트")
 *
 * - 비발디파크: 인원 × 시간 × 12,500원
 * - 지산포레스트: 2시간 35,000 / 4시간 50,000 / 6시간 85,000 (1인), 홀수는 다음 짝수
 * - 웰리힐리파크: 1인 2시간 40,000원 (3·4시간은 미확정 → 우선 2시간 요율 적용)
 * - 그 외(하이원, 용평, 알펜시아, 무주): 0원
 */
export const ADMIN_SOURCE = {
  repo: "cpppowercode/admin",
  path: "src/app/(admin)/(others-pages)/(Calc)/Calculator/page.tsx",
  commit: "f2bd5f3",
} as const;

/** 웰리힐리 3·4시간 패찰비 요율은 미확정. true 로 바꾸면 별도 구간표를 쓴다. */
export const WELLI_LONGER_HOURS_CONFIRMED = false;

import { badgeFeeKind, type BadgeFeeKind } from "@/lib/resorts";
import { assertResortRatio, lessonPrice, PriceError, UNSET_SETTINGS, type SeasonSettings } from "@/lib/pricing";

const VIVALDI_PER_PERSON_HOUR = 12500;
const WELLI_PER_PERSON_2H = 40000;

function jisanTierPerPerson(hours: number): number {
  const even = hours % 2 === 0 ? hours : hours + 1;
  if (even === 2) return 35000;
  if (even === 4) return 50000;
  if (even === 6) return 85000;
  return 50000 + ((even - 4) / 2) * 12500;
}

export type BadgeFeeResort = Exclude<BadgeFeeKind, "none"> | null;

export function badgeFeeResort(skiResort: string): BadgeFeeResort {
  const kind = badgeFeeKind(skiResort);
  return kind === "none" ? null : kind;
}

export class BadgeFeeError extends Error {}

/** 패찰비. 계산할 수 없는 입력이면 예외(결제 진행 금지). */
export function computeBadgeFee(skiResort: string, participants: number, durationHours: number): number {
  const kind = badgeFeeKind(skiResort);
  if (kind === "none") return 0;
  if (!Number.isInteger(participants) || participants < 1 || participants > 8) {
    throw new BadgeFeeError("패찰비를 계산할 수 없습니다(인원 확인 필요).");
  }
  if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 8) {
    throw new BadgeFeeError("패찰비를 계산할 수 없습니다(강습 시간 확인 필요).");
  }
  let fee = 0;
  if (kind === "vivaldi") {
    fee = participants * durationHours * VIVALDI_PER_PERSON_HOUR;
  } else if (kind === "jisan") {
    fee = participants * jisanTierPerPerson(durationHours);
  } else if (kind === "welli") {
    // 확정: 1인 2시간 40,000. 3·4시간은 미확정이라 동일 요율(인원×40,000)을 임시 적용.
    fee = participants * WELLI_PER_PERSON_2H;
  }
  if (!Number.isFinite(fee) || fee <= 0) throw new BadgeFeeError("패찰비를 계산할 수 없습니다.");
  return fee;
}

export type PayBreakdown = { lessonFee: number; badgeFee: number; total: number };

/**
 * 결제 금액 = 강습비(날짜와 무관하게 항상 세일 가격, 인원=1:1/2:1/3:1) + 패찰비.
 * 계산할 수 없으면 BadgeFeeError(결제 진행 금지).
 */
export function payBreakdown(
  input: { skiResort: string; participants: number; durationHours: number; lessonDate: string },
  settings: SeasonSettings = UNSET_SETTINGS,
): PayBreakdown {
  let price;
  try {
    assertResortRatio(input.skiResort, Number(input.participants));
    price = lessonPrice(String(input.lessonDate), Number(input.participants), Number(input.durationHours), settings);
  } catch (error) {
    if (error instanceof PriceError) throw new BadgeFeeError(error.message);
    throw error;
  }
  const badgeFee = computeBadgeFee(input.skiResort, Number(input.participants), Number(input.durationHours));
  return { lessonFee: price.amount, badgeFee, total: price.amount + badgeFee };
}
