import { NextResponse } from "next/server";
import { findReservationByOrderNo } from "@/lib/admin-reservations";
import { normalizePhone } from "@/lib/booking";
import {
  normalizeOrderNo,
  toPublicOrderLookup,
  validateOrderLookupInput,
} from "@/lib/order-lookup";

/**
 * 손님 예약 내역 조회.
 * 주문번호·연락처는 POST 본문으로만 받으며 URL 쿼리에 넣지 않는다.
 * 레거시 /api/orders/create(410)와 경로만 공유하고, 조회는 이 엔드포인트만 사용한다.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    orderNo?: unknown;
    customerPhone?: unknown;
  };

  const invalid = validateOrderLookupInput(body);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const orderNo = normalizeOrderNo(String(body.orderNo));
  const customerPhone = normalizePhone(String(body.customerPhone));

  try {
    const row = await findReservationByOrderNo(orderNo);
    const booking = toPublicOrderLookup(row, customerPhone);
    // 존재 여부·전화 불일치를 구분하지 않아 주문번호 추측을 어렵게 한다.
    if (!booking) {
      return NextResponse.json(
        { error: "일치하는 예약 내역을 찾지 못했습니다. 주문번호와 연락처를 확인해 주세요." },
        { status: 404 },
      );
    }
    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json(
      { error: "예약 내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 },
    );
  }
}
