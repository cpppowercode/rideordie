import crypto from "crypto";
import type { BookingInput } from "@/lib/booking";

/**
 * 결제 전 예약 정보는 저장하지 않고, 서버가 서명한 토큰(intent)으로만 들고 다닌다.
 * 결제 승인 후 서버가 서명과 금액을 확인한 뒤에만 예약을 접수한다.
 */
export type BookingIntent = {
  v: 1;
  orderNo: string;
  amount: number;
  input: BookingInput;
  exp: number;
};

export type BookingReceipt = {
  v: 1;
  orderNo: string;
  amount: number;
  tno: string;
  name: string;
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
  const secret = process.env.BOOKING_SIGNING_SECRET || process.env.ADMIN_API_TOKEN;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("예약 서명 키(BOOKING_SIGNING_SECRET)가 설정되지 않았습니다.");
  }
  return "rideordie-local-dev-only-secret";
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(kind: string, body: string): string {
  return b64url(crypto.createHmac("sha256", signingSecret()).update(`${kind}.${body}`).digest());
}

function encode(kind: string, payload: object): string {
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${body}.${sign(kind, body)}`;
}

function decode<T extends { exp: number }>(kind: string, token: string | null | undefined): T | null {
  if (!token || typeof token !== "string") return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = sign(kind, body);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
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
