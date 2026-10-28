/**
 * 시즌강습 결제 옵션.
 *
 * 가격 출처는 어드민 "시즌 강습 정가 계산기"(cpppowercode/admin · main ·
 * src/app/(admin)/(others-pages)/(Calc)/Calculator/page.tsx, f2bd5f3)뿐이다.
 * 이 계산기는 고정 가격을 갖고 있지 않다. 강사비를 사장님이 직접 입력(만원 단위)하고,
 * 그 값과 패찰비로 '정가 범위(min~max)'만 보여 준다. 시즌강습 등록 화면도 금액을 손으로 적는다.
 * 그래서 확정 가격이 정해질 때까지 모든 옵션은 price: null(가격 필요)이며 결제할 수 없다.
 * 임의 금액 입력 칸은 두지 않는다.
 */
export type SeasonOption = {
  id: string;
  name: string;
  includes: string;
  people: number;
  /** 원. null이면 '가격 필요' → 결제 불가 */
  price: number | null;
};

export const SEASON_OPTIONS: readonly SeasonOption[] = [
  { id: "season-1to1", name: "시즌강습 1:1", includes: "강사 1명 · 아이 1명, 회차·기간은 상담으로 확정", people: 1, price: null },
  { id: "season-2to1", name: "시즌강습 2:1", includes: "강사 1명 · 아이 2명, 회차·기간은 상담으로 확정", people: 2, price: null },
  { id: "season-3to1", name: "시즌강습 3:1", includes: "강사 1명 · 아이 3명, 회차·기간은 상담으로 확정", people: 3, price: null },
];

export function findSeasonOption(id: unknown): SeasonOption | undefined {
  return typeof id === "string" ? SEASON_OPTIONS.find((o) => o.id === id) : undefined;
}

export function isPayable(o: SeasonOption | undefined): o is SeasonOption & { price: number } {
  return !!o && typeof o.price === "number" && o.price > 0;
}

export type SeasonOrderCheck =
  | { ok: true; amount: number; option: SeasonOption }
  | { ok: false; status: number; error: string };

/** 서버 금액 재계산: 클라이언트 금액은 무시하고 옵션 ID로만 계산한다. */
export function checkSeasonOrder(body: { optionId?: unknown; customerName?: unknown; customerPhone?: unknown }): SeasonOrderCheck {
  const name = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const phone = typeof body.customerPhone === "string" ? body.customerPhone.replace(/[^0-9]/g, "") : "";
  if (!name) return { ok: false, status: 400, error: "이름을 입력해 주세요." };
  if (!/^01[0-9]{8,9}$/.test(phone)) return { ok: false, status: 400, error: "휴대폰 번호를 확인해 주세요." };
  const option = findSeasonOption(body.optionId);
  if (!option) return { ok: false, status: 400, error: "없는 옵션입니다." };
  if (!isPayable(option)) return { ok: false, status: 409, error: "아직 가격이 정해지지 않은 옵션입니다. 카톡으로 상담해 주세요." };
  return { ok: true, amount: option.price, option };
}
