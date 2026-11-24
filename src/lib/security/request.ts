import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, type RateLimitConfig } from "@/lib/security/rate-limit";

/** JSON API 기본 본문 상한 (업로드 없음). */
export const DEFAULT_JSON_BODY_LIMIT = 32 * 1024; // 32 KiB
/** 웹훅(form/urlencoded) 본문 상한. */
export const DEFAULT_WEBHOOK_BODY_LIMIT = 64 * 1024; // 64 KiB
/** 업로드가 있을 때 쓸 MIME 화이트리스트 (현재 공개 API는 업로드 없음). */
export const ALLOWED_UPLOAD_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MiB

export function clientIp(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded.slice(0, 64);
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}

export function tooManyRequests(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "Cache-Control": "no-store",
      },
    },
  );
}

export function enforceRateLimit(
  request: Request,
  namespace: string,
  config: RateLimitConfig,
): NextResponse | null {
  const result = consumeRateLimit(namespace, clientIp(request), config);
  if (result.limited) return tooManyRequests(result.retryAfterSec);
  return null;
}

function contentLengthTooLarge(request: Request, maxBytes: number): boolean {
  const raw = request.headers.get("content-length");
  if (!raw) return false;
  const n = Number(raw);
  return Number.isFinite(n) && n > maxBytes;
}

export type ReadJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

/** Content-Length·실제 바이트를 제한한 뒤 JSON 파싱. */
export async function readJsonBody<T = unknown>(
  request: Request,
  maxBytes = DEFAULT_JSON_BODY_LIMIT,
): Promise<ReadJsonResult<T>> {
  if (contentLengthTooLarge(request, maxBytes)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "요청 본문이 너무 큽니다." }, { status: 413 }),
    };
  }

  const buf = Buffer.from(await request.arrayBuffer());
  if (buf.byteLength > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json({ error: "요청 본문이 너무 큽니다." }, { status: 413 }),
    };
  }

  if (buf.byteLength === 0) {
    return { ok: true, data: {} as T };
  }

  try {
    const data = JSON.parse(buf.toString("utf8")) as T;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "잘못된 JSON 본문입니다." }, { status: 400 }),
    };
  }
}

export type ReadRawResult =
  | { ok: true; buf: Buffer }
  | { ok: false; response: NextResponse };

export async function readRawBody(
  request: Request,
  maxBytes = DEFAULT_WEBHOOK_BODY_LIMIT,
): Promise<ReadRawResult> {
  if (contentLengthTooLarge(request, maxBytes)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "요청 본문이 너무 큽니다." }, { status: 413 }),
    };
  }
  const buf = Buffer.from(await request.arrayBuffer());
  if (buf.byteLength > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json({ error: "요청 본문이 너무 큽니다." }, { status: 413 }),
    };
  }
  return { ok: true, buf };
}

/** multipart 업로드 검사 헬퍼 — 현재 공개 API에는 업로드가 없다. */
export function assertAllowedUpload(file: { type: string; size: number }): string | null {
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    return `파일 크기는 ${MAX_UPLOAD_BYTES}바이트 이하여야 합니다.`;
  }
  if (!(ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(file.type)) {
    return "허용되지 않는 파일 형식입니다.";
  }
  return null;
}

export function isNextRequest(request: Request): request is NextRequest {
  return "nextUrl" in request;
}
