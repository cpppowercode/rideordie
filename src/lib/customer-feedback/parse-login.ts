export type FeedbackLoginInput = {
  name: string;
  phone: string;
  remember: boolean;
  share_token?: string;
};

export type FeedbackLoginParse =
  | { ok: true; data: FeedbackLoginInput }
  | { ok: false; error: "invalid" };

const PHONE_RE = /^01[016789]\d{7,8}$/;

export function parseFeedbackLoginBody(
  body: Record<string, unknown>,
): FeedbackLoginParse {
  const name = String(body.name ?? "").trim().slice(0, 40);
  const phone = String(body.phone ?? "").replace(/\D/g, "").slice(0, 11);
  const rememberRaw = body.remember;
  const remember =
    rememberRaw === undefined || rememberRaw === null
      ? true
      : Boolean(rememberRaw);
  const shareRaw = String(body.share_token ?? "").trim().slice(0, 200);
  const share_token = shareRaw || undefined;

  if (name.length < 2 || !PHONE_RE.test(phone)) {
    return { ok: false, error: "invalid" };
  }

  return { ok: true, data: { name, phone, remember, share_token } };
}
