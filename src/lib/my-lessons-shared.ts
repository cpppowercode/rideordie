/** 손님 강습 조회 입력 검증 (클라이언트·서버 공용, supabase 무의존) */

export function validateMyLessonLookupInput(input: {
  customerName: string;
  customerPhone: string;
}): { ok: true; name: string; phone: string } | { ok: false; error: string } {
  const name = input.customerName.trim().replace(/\s+/g, " ");
  const phone = input.customerPhone.replace(/\D/g, "");
  if (name.length < 2) return { ok: false, error: "이름을 확인해 주세요." };
  if (phone.length < 10 || phone.length > 11) {
    return { ok: false, error: "휴대폰 번호를 확인해 주세요." };
  }
  return { ok: true, name, phone };
}
