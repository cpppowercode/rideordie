/** 문의 폼 입력 검증 (공개 /api/contact). */

export type ContactInput = {
  name: string;
  phone: string;
  message: string;
  email?: string;
};

export type ContactCheck =
  | { ok: true; data: ContactInput }
  | { ok: false; error: string };

const PHONE_RE = /^01[016789]\d{7,8}$/;

export function parseContactBody(body: Record<string, unknown>): ContactCheck {
  const name = String(body.name ?? "").trim().slice(0, 40);
  const phone = String(body.phone ?? "").replace(/\D/g, "").slice(0, 11);
  const message = String(body.message ?? "").trim().slice(0, 1000);
  const emailRaw = String(body.email ?? "").trim().slice(0, 120);
  const email = emailRaw || undefined;

  if (name.length < 2) return { ok: false, error: "이름을 두 글자 이상 입력해 주세요." };
  if (!PHONE_RE.test(phone)) return { ok: false, error: "휴대폰 번호를 확인해 주세요." };
  if (message.length < 5) return { ok: false, error: "문의 내용을 조금 더 적어 주세요." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "이메일 형식을 확인해 주세요." };
  }

  return { ok: true, data: { name, phone, message, email } };
}
