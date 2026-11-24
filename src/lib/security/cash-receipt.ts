/** 현금영수증 요청 입력 검증 (공개 /api/payments/cash-receipt). */

export type CashReceiptInput = {
  orderNo: string;
  /** 휴대폰 또는 사업자번호 등 발급 식별자 */
  identity: string;
  /** 개인 / 사업자 */
  type: "personal" | "business";
};

export type CashReceiptCheck =
  | { ok: true; data: CashReceiptInput }
  | { ok: false; error: string };

export function parseCashReceiptBody(body: Record<string, unknown>): CashReceiptCheck {
  const orderNo = String(body.orderNo ?? "").trim().slice(0, 40);
  const identity = String(body.identity ?? body.phone ?? "").replace(/\D/g, "").slice(0, 20);
  const typeRaw = String(body.type ?? "personal").trim().toLowerCase();
  const type: "personal" | "business" = typeRaw === "business" ? "business" : "personal";

  if (!/^[A-Za-z0-9_-]{6,40}$/.test(orderNo)) {
    return { ok: false, error: "주문번호가 올바르지 않습니다." };
  }
  if (type === "personal") {
    if (!/^01[016789]\d{7,8}$/.test(identity)) {
      return { ok: false, error: "현금영수증 휴대폰 번호를 확인해 주세요." };
    }
  } else if (!/^\d{10}$/.test(identity)) {
    return { ok: false, error: "사업자등록번호 10자리를 입력해 주세요." };
  }

  return { ok: true, data: { orderNo, identity, type } };
}
