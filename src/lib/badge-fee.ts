/**
 * 패찰비(리조트 강습 패찰 비용) 계산.
 *
 * 출처: 어드민 패널 "시즌 강습 정가 계산기"
 *   cpppowercode/admin · main · src/app/(admin)/(others-pages)/(Calc)/Calculator/page.tsx
 *   (최종 커밋 f2bd5f3, 비발디 단가는 3dedf39 "비발디 패찰비 업데이트")
 * 어드민은 이 값을 DB나 API가 아닌 코드 상수로만 들고 있어서, 사이트는 이 파일 하나에 같은 규칙을 그대로 옮겨 둔다.
 * 어드민 계산기 값을 바꾸면 이 파일도 같이 바꾼다(ADMIN_SOURCE 참고). 다른 곳에 금액을 따로 적지 않는다.
 *
 * - 비발디파크: 인원 × 시간 × 12,500원 (어드민 현재 값)
 * - 웰리힐리파크: 어드민 최초 버전(bc4c6f0)의 웰리힐리 구간표 — 2시간 35,000 / 4시간 50,000 / 6시간 85,000 (1인),
 *   홀수 시간은 다음 짝수 시간 요금. 현재 어드민 코드는 이 구간표를 '지산'에만 적용하고 있어 사장님 확인 필요.
 * - 그 외 리조트: 0원(패찰비 줄 없음)
 */
export const ADMIN_SOURCE = {
  repo: "cpppowercode/admin",
  path: "src/app/(admin)/(others-pages)/(Calc)/Calculator/page.tsx",
  commit: "f2bd5f3",
} as const;

import { PRODUCT_DATA } from "@/lib/mockData";

export const LESSON_FEE = PRODUCT_DATA.price;

const VIVALDI_PER_PERSON_HOUR = 12500;

function welliTierPerPerson(hours: number): number {
  const even = hours % 2 === 0 ? hours : hours + 1;
  if (even === 2) return 35000;
  if (even === 4) return 50000;
  if (even === 6) return 85000;
  return 50000 + ((even - 4) / 2) * 12500;
}

export type BadgeFeeResort = "vivaldi" | "welli" | null;

export function badgeFeeResort(skiResort: string): BadgeFeeResort {
  const r = String(skiResort || "").replace(/\s/g, "");
  if (r.includes("비발디")) return "vivaldi";
  if (r.includes("웰리힐리")) return "welli";
  return null;
}

export class BadgeFeeError extends Error {}

/** 패찰비. 계산할 수 없는 입력이면 예외(결제 진행 금지). */
export function computeBadgeFee(skiResort: string, participants: number, durationHours: number): number {
  const kind = badgeFeeResort(skiResort);
  if (!kind) return 0;
  if (!Number.isInteger(participants) || participants < 1 || participants > 8) {
    throw new BadgeFeeError("패찰비를 계산할 수 없습니다(인원 확인 필요).");
  }
  if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 8) {
    throw new BadgeFeeError("패찰비를 계산할 수 없습니다(강습 시간 확인 필요).");
  }
  const fee = kind === "vivaldi"
    ? participants * durationHours * VIVALDI_PER_PERSON_HOUR
    : participants * welliTierPerPerson(durationHours);
  if (!Number.isFinite(fee) || fee <= 0) throw new BadgeFeeError("패찰비를 계산할 수 없습니다.");
  return fee;
}

export type PayBreakdown = { lessonFee: number; badgeFee: number; total: number };

export function payBreakdown(input: { skiResort: string; participants: number; durationHours: number }): PayBreakdown {
  const badgeFee = computeBadgeFee(input.skiResort, Number(input.participants), Number(input.durationHours));
  return { lessonFee: LESSON_FEE, badgeFee, total: LESSON_FEE + badgeFee };
}
