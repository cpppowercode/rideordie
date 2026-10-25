import {
  createAdminReservation,
  findReservationByOrderNo,
} from "@/lib/admin-reservations";
import { toAdminPayload } from "@/lib/booking";
import { checkBookingAvailability } from "@/lib/booking-checks";
import { createBookingReceipt, type BookingIntent } from "@/lib/booking-intent";
import { formatLessonRange } from "@/lib/hours";
import { payBreakdown } from "@/lib/badge-fee";
import { approveKcpPayment, toKcpPayType } from "@/lib/kcp";
import { notifyOwner } from "@/lib/notify";

export type KcpApprovalRequest = {
  enc_data: string;
  enc_info: string;
  tran_cd: string;
  orderId: string;
  payMethod: string;
};

export type FinalizeResult = {
  orderNo: string;
  amount: number;
  tno: string;
  reservationId: string | null;
  receipt: string;
  alreadyReceived: boolean;
  needsReview: string | null;
};

/**
 * 결제 승인 → 금액 확인 → 예약 '접수' 저장 → 사장 알림.
 * KCP 승인이 실패하면 예외를 던지고, 아무것도 저장·발송하지 않는다.
 */
export async function approveAndFinalizeBooking(
  intent: BookingIntent,
  kcp: KcpApprovalRequest,
): Promise<FinalizeResult> {
  // 강습비 + 패찰비를 서명된 예약 정보로 다시 계산한다. 계산할 수 없으면 승인 요청 전에 멈춘다.
  const breakdown = payBreakdown(intent.input);
  const amount = breakdown.total;
  if (intent.amount !== amount) {
    throw new Error("결제 금액이 주문 금액과 다릅니다.");
  }
  if (kcp.orderId !== intent.orderNo) {
    throw new Error("주문번호가 예약 정보와 다릅니다.");
  }

  // 1) KCP 서버에 직접 승인 요청. res_cd=0000, 금액 일치가 확인돼야 통과한다.
  const payment = await approveKcpPayment({
    enc_data: kcp.enc_data,
    enc_info: kcp.enc_info,
    tran_cd: kcp.tran_cd,
    orderId: intent.orderNo,
    amount,
    payType: toKcpPayType(kcp.payMethod || "PACA"),
  });
  const tno = String(payment.tno || "");

  const input = intent.input;
  const receiptFor = () =>
    createBookingReceipt({
      orderNo: intent.orderNo,
      amount,
      tno,
      name: input.customerName.trim(),
      date: input.lessonDate,
      resort: input.skiResort,
      time: formatLessonRange(input.startHour, input.durationHours),
      people: input.participants,
    });

  // 2) 같은 주문번호가 이미 접수됐으면(새로고침·중복 콜백) 다시 저장·알림하지 않는다.
  const existing = await findReservationByOrderNo(intent.orderNo).catch(() => null);
  if (existing && existing.order_no === intent.orderNo) {
    return {
      orderNo: intent.orderNo,
      amount,
      tno,
      reservationId: existing.id || null,
      receipt: receiptFor(),
      alreadyReceived: true,
      needsReview: null,
    };
  }

  // 3) 결제 중에 다른 예약이 그 시간을 채웠을 수 있다. 결제는 이미 됐으므로 접수는 하되 확인 표시를 단다.
  let needsReview: string | null = null;
  try {
    const recheck = await checkBookingAvailability(input);
    if (!recheck.ok) needsReview = recheck.error;
  } catch (error) {
    needsReview = error instanceof Error ? error.message : "예약 현황 재확인 실패";
  }

  const base = toAdminPayload(input, intent.orderNo);
  const payMethodLabel = toKcpPayType(kcp.payMethod || "PACA") === "PABK" ? "bank" : "card";
  const notes = [
    `KCP 결제완료 ${amount.toLocaleString("ko-KR")}원 (거래번호 ${tno})`,
    breakdown.badgeFee > 0
      ? `[결제내역] 강습비 ${breakdown.lessonFee.toLocaleString("ko-KR")}원 + 패찰비 ${breakdown.badgeFee.toLocaleString("ko-KR")}원`
      : "",
    base.notes,
    needsReview ? `[확인 필요] ${needsReview}` : "",
  ]
    .filter(Boolean)
    .join(" / ")
    .slice(0, 1000);

  const payload = {
    ...base,
    amount,
    payment_method: payMethodLabel,
    payment_status: "paid",
    reservation_status: "pending",
    notes,
  };
  const created = await createAdminReservation(payload);

  await notifyOwner({
    orderNo: intent.orderNo,
    customerName: input.customerName.trim(),
    customerPhone: payload.customer_phone,
    skiResort: input.skiResort,
    lessonType: input.lessonType,
    lessonDate: input.lessonDate,
    timeLabel: formatLessonRange(input.startHour, input.durationHours),
    participants: input.participants,
    childCount: input.childCount,
    notes,
  });

  return {
    orderNo: intent.orderNo,
    amount,
    tno,
    reservationId: created.id,
    receipt: receiptFor(),
    alreadyReceived: false,
    needsReview,
  };
}
