import crypto from "crypto";
import type { BookingInput } from "@/lib/booking";

/**
 * 결제 전 예약 정보는 저장하지 않고, 서버가 서명한 토큰(intent)으로만 들고 다닌다.
 * 결제 승인 후 서버가 서명과 금액을 확인한 뒤에만 예약을 접수한다.
 * v2 토큰은 AES-GCM으로 본문을 암호화해 base64 디코드만으로 개인정보가 보이지 않게 한다.
 */
export type BookingIntent = {
  v: 1;
  orderNo: string;
  amount: number;
  input: BookingInput;
  exp: number;
};

/** 성공 화면용. 이름·전화 등 식별 개인정보는 넣지 않는다. */
export type BookingReceipt = {
  v: 1;
  orderNo: string;
  amount: number;
  tno: string;
  date: string;
  resort: string;
  time: string;
  people: number;
  exp: number;
};

export const INTENT_COOKIE = "rod_booking_intent";

const INTENT_TTL_MS = 60 * 60 * 1000; // 1시간
const RECEIPT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30일

function signingSecret(): string {
  const dedicated = process.env.BOOKING_SIGNING_SECRET?.trim();
  if (dedicated && dedicated.length >= 16) return dedicated;

  // 운영에서 전용 키가 없을 때만 폴백. 키 분리(BOOKING_SIGNING_SECRET)를 권장한다.
  const fallback = process.env.ADMIN_API_TOKEN?.trim();
  if (fallback && fallback.length >= 16) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[booking-intent] BOOKING_SIGNING_SECRET 미설정 — ADMIN_API_TOKEN 폴백 사용 중(키 분리를 권장합니다).",
      );
    }
    return fallback;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("예약 서명 키(BOOKING_SIGNING_SECRET)가 설정되지 않았습니다.");
  }
  return "rideordie-local-dev-only-secret";
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function deriveEncKey(): Buffer {
  return crypto.createHash("sha256").update(`rod-token-v2.${signingSecret()}`).digest();
}

function sign(kind: string, body: string): string {
  return b64url(crypto.createHmac("sha256", signingSecret()).update(`${kind}.${body}`).digest());
}

function encryptBody(payload: object): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", deriveEncKey(), iv);
  const plain = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return b64url(Buffer.concat([iv, tag, ciphertext]));
}

function decryptBody<T>(body: string): T | null {
  try {
    const raw = Buffer.from(body, "base64url");
    if (raw.length < 12 + 16 + 1) return null;
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const ciphertext = raw.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", deriveEncKey(), iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(plain.toString("utf8")) as T;
  } catch {
    return null;
  }
}

function encode(kind: string, payload: object): string {
  const body = encryptBody(payload);
  return `v2.${body}.${sign(kind, body)}`;
}

function verifyMac(kind: string, body: string, mac: string): boolean {
  const expected = sign(kind, body);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function decode<T extends { exp: number }>(kind: string, token: string | null | undefined): T | null {
  if (!token || typeof token !== "string") return null;

  // v2: 암호화된 본문 + HMAC
  if (token.startsWith("v2.")) {
    const rest = token.slice(3);
    const dot = rest.lastIndexOf(".");
    if (dot <= 0) return null;
    const body = rest.slice(0, dot);
    const mac = rest.slice(dot + 1);
    if (!verifyMac(kind, body, mac)) return null;
    const payload = decryptBody<T>(body);
    if (!payload || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  }

  // 레거시(평문 base64 + HMAC) — 배포 중 진행 중인 결제만 허용
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  if (!verifyMac(kind, body, mac)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    if (!payload || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createBookingIntent(orderNo: string, amount: number, input: BookingInput): string {
  const payload: BookingIntent = { v: 1, orderNo, amount, input, exp: Date.now() + INTENT_TTL_MS };
  return encode("intent", payload);
}

export function readBookingIntent(token: string | null | undefined): BookingIntent | null {
  return decode<BookingIntent>("intent", token);
}

export function createBookingReceipt(data: Omit<BookingReceipt, "v" | "exp">): string {
  return encode("receipt", { v: 1, ...data, exp: Date.now() + RECEIPT_TTL_MS });
}

export function readBookingReceipt(token: string | null | undefined): BookingReceipt | null {
  return decode<BookingReceipt>("receipt", token);
}
