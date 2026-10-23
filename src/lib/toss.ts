/**
 * Toss Payments widget keys.
 *
 * 고객 사이트 Vercel에는 `NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_…` 와
 * `TOSS_SECRET_KEY` 가 있습니다. 이 키는 API 개별연동(ck/sk)용이라
 * 주문서형 위젯(gck/gsk)과 맞지 않습니다. 위젯 키가 없으면 토스 문서
 * 테스트 키로 결제합니다.
 *
 * 사장님이 넣어야 하는 값:
 * - NEXT_PUBLIC_TOSS_CLIENT_KEY  (test_gck_… 또는 live_gck_…)
 * - TOSS_SECRET_KEY              (test_gsk_… 또는 live_gsk_…)
 */
export const TOSS_TEST_WIDGET_CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
export const TOSS_TEST_WIDGET_SECRET_KEY = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

export type TossKeySource = "env" | "test-fallback";

export function tossWidgetKeys(): {
  clientKey: string;
  secretKey: string;
  source: TossKeySource;
} {
  const client = (process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "").trim();
  const secret = (process.env.TOSS_SECRET_KEY || "").trim();
  const widgetClient = client.startsWith("test_gck_") || client.startsWith("live_gck_");
  const widgetSecret = secret.startsWith("test_gsk_") || secret.startsWith("live_gsk_");
  if (widgetClient && widgetSecret) {
    return { clientKey: client, secretKey: secret, source: "env" };
  }
  return {
    clientKey: TOSS_TEST_WIDGET_CLIENT_KEY,
    secretKey: TOSS_TEST_WIDGET_SECRET_KEY,
    source: "test-fallback",
  };
}

export function tossClientKey(): string {
  return tossWidgetKeys().clientKey;
}

export function tossIsTestMode(): boolean {
  return tossWidgetKeys().clientKey.startsWith("test_");
}

export type TossConfirmResult = {
  paymentKey: string;
  orderId: string;
  status: string;
  method?: string;
  totalAmount: number;
  approvedAt?: string;
};

function tossAuthHeader(secretKey: string): string {
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

export async function confirmTossPayment(input: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossConfirmResult> {
  const { secretKey } = tossWidgetKeys();
  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: tossAuthHeader(secretKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentKey: input.paymentKey,
      orderId: input.orderId,
      amount: input.amount,
    }),
  });
  const body = (await response.json().catch(() => ({}))) as {
    paymentKey?: string;
    orderId?: string;
    status?: string;
    method?: string;
    totalAmount?: number;
    approvedAt?: string;
    message?: string;
    code?: string;
  };
  if (!response.ok) {
    throw new Error(body.message || `토스 결제 승인에 실패했습니다. (${body.code || response.status})`);
  }
  if (!body.paymentKey || body.totalAmount == null) {
    throw new Error("토스 결제 승인 응답이 올바르지 않습니다.");
  }
  return {
    paymentKey: body.paymentKey,
    orderId: body.orderId || input.orderId,
    status: body.status || "DONE",
    method: body.method,
    totalAmount: Number(body.totalAmount),
    approvedAt: body.approvedAt,
  };
}

export function tossCustomerKey(orderNo: string): string {
  const compact = orderNo.replace(/[^a-zA-Z0-9=_@.-]/g, "").slice(0, 50);
  if (compact.length >= 10) return compact;
  return `guest_${compact}`.padEnd(10, "0").slice(0, 50);
}
