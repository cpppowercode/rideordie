import { ADMIN_RESERVATIONS_URL, ADMIN_TENANT_ID } from "@/lib/site";
import type { BookingInput } from "@/lib/booking";

async function writeAttempt(method: "POST" | "PATCH", body: Record<string, unknown>) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) throw new Error("결제 기록 연결이 설정되지 않았습니다.");
  const url = new URL("/api/booking-payment-attempts", ADMIN_RESERVATIONS_URL);
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ...body, tenantId: ADMIN_TENANT_ID }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("결제 처리 기록을 확인하지 못했습니다. 고객센터에 문의해 주세요.");
}

export function beginPaymentAttempt(orderNo: string, amount: number, input: BookingInput) {
  return writeAttempt("POST", { orderNo, amount, input });
}

export function recordApprovedPayment(orderNo: string, transactionNo: string) {
  return writeAttempt("PATCH", { orderNo, status: "approved", transactionNo });
}

export function completePaymentAttempt(orderNo: string, reservationId: string | null) {
  return writeAttempt("PATCH", { orderNo, status: "completed", reservationId });
}
