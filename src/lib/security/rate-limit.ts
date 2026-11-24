/**
 * 인스턴스 메모리 기반 레이트리밋 (추가 비용 없음).
 * 서버리스는 인스턴스별로 카운트되므로 WAF 룰과 함께 쓰는 것을 권장한다.
 */

export type RateLimitConfig = {
  /** 윈도우 길이(ms) */
  windowMs: number;
  /** 윈도우당 최대 허용 횟수 */
  max: number;
};

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  retryAfterSec: number;
};

type Bucket = { count: number; resetAt: number };

const stores = new Map<string, Map<string, Bucket>>();

function storeFor(namespace: string): Map<string, Bucket> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

/** 테스트·로컬에서 카운터를 비운다. */
export function resetRateLimitStores(): void {
  stores.clear();
}

/**
 * key(보통 IP)가 한도를 넘으면 limited=true.
 * 호출할 때마다 1회 소비한다.
 */
export function consumeRateLimit(
  namespace: string,
  key: string,
  config: RateLimitConfig,
  now = Date.now(),
): RateLimitResult {
  const store = storeFor(namespace);
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { limited: false, remaining: Math.max(0, config.max - 1), retryAfterSec: Math.ceil(config.windowMs / 1000) };
  }

  existing.count += 1;
  const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  if (existing.count > config.max) {
    return { limited: true, remaining: 0, retryAfterSec };
  }
  return { limited: false, remaining: Math.max(0, config.max - existing.count), retryAfterSec };
}

/** 엔드포인트별 기본 한도 (분당). */
export const RATE_LIMITS = {
  bookings: { windowMs: 60_000, max: 12 },
  availability: { windowMs: 60_000, max: 60 },
  paymentsConfirm: { windowMs: 60_000, max: 20 },
  paymentsRegister: { windowMs: 60_000, max: 20 },
  paymentsReturn: { windowMs: 60_000, max: 30 },
  cashReceipt: { windowMs: 60_000, max: 10 },
  contact: { windowMs: 60_000, max: 8 },
  chat: { windowMs: 60_000, max: 30 },
  seasonOrder: { windowMs: 60_000, max: 10 },
  webhooksKcp: { windowMs: 60_000, max: 60 },
  webhooksKakao: { windowMs: 60_000, max: 60 },
  legacyOrders: { windowMs: 60_000, max: 5 },
} as const satisfies Record<string, RateLimitConfig>;
