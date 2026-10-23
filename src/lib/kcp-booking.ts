import {
  findReservationByOrderNo,
  updateAdminReservation,
  type AdminReservation,
} from "@/lib/admin-reservations";
import { loadAdminBadgeRates } from "@/lib/admin-badge-fees";
import { isPaidStatus } from "@/lib/booking";
import { formatLessonRange } from "@/lib/hours";
import { approveKcpPayment, toKcpPayType } from "@/lib/kcp";
import { notifyOwner } from "@/lib/notify";
import { quoteLessonPrice } from "@/lib/pricing";

export type BookingPayContext = {
  row: AdminReservation;
  amount: number;
  quoteAmount: number | null;
  lessonAmount: number | null;
  badgeFee: number | null;
  orderName: string;
};

export async function loadBookingPayContext(orderNo: string): Promise<BookingPayContext | null> {
  const row = await findReservationByOrderNo(orderNo);
  if (!row?.id) return null;

  const stored = Number(row.amount);
  if (!Number.isFinite(stored) || stored <= 0) return null;

  const duration = Number(row.lesson_duration_hours) || 2;
  const participants = Number(row.participants) || 1;
  const rates = await loadAdminBadgeRates();
  const quote = quoteLessonPrice({
    durationHours: duration,
    participants,
    lessonDate: String(row.lesson_date || ""),
    skiResort: String(row.ski_resort || ""),
    rates,
  });

  const ratio = quote?.ratio;
  const orderName = `라이드올다이 강습 ${duration}시간${ratio ? ` ${ratio}` : ""}`;
  const showBadge = Boolean(quote && quote.badgeFee > 0 && quote.payableAmount === stored);

  return {
    row,
    amount: stored,
    quoteAmount: quote?.payableAmount ?? null,
    lessonAmount: showBadge ? quote?.lessonAmount ?? null : null,
    badgeFee: showBadge ? quote?.badgeFee ?? null : null,
    orderName,
  };
}

export async function finalizeKcpBookingPayment(input: {
  enc_data: string;
  enc_info: string;
  tran_cd: string;
  orderId: string;
  payMethod?: string;
}) {
  const ctx = await loadBookingPayContext(input.orderId);
  if (!ctx) {
    throw new Error("예약 정보를 찾지 못했습니다.");
  }

  if (isPaidStatus(ctx.row.payment_status)) {
    return {
      alreadyPaid: true,
      orderNo: input.orderId,
      amount: ctx.amount,
      tno: "",
    };
  }

  const payment = await approveKcpPayment({
    enc_data: input.enc_data,
    enc_info: input.enc_info,
    tran_cd: input.tran_cd,
    orderId: input.orderId,
    amount: ctx.amount,
    payType: toKcpPayType(input.payMethod || "PACA"),
  });

  const tno = payment.tno || "";
  const paidNote = [
    ctx.row.notes || "",
    `결제완료 ${ctx.amount.toLocaleString("ko-KR")}원`,
    tno ? `KCP ${tno}` : "",
  ]
    .filter(Boolean)
    .join(" / ")
    .slice(0, 1000);

  await updateAdminReservation(ctx.row.id as string, {
    payment_status: "completed",
    reservation_status: "confirmed",
    payment_method: "kcp",
    amount: ctx.amount,
    notes: paidNote,
  });

  const start = Number(ctx.row.lesson_start_hour);
  const duration = Number(ctx.row.lesson_duration_hours) || 2;
  const timeLabel =
    ctx.row.lesson_time ||
    (Number.isFinite(start) ? formatLessonRange(start, duration) : "-");

  const notice = await notifyOwner({
    orderNo: input.orderId,
    customerName: ctx.row.customer_name || "",
    customerPhone: ctx.row.customer_phone || "",
    skiResort: ctx.row.ski_resort || "",
    lessonType: ctx.row.lesson_type || "ski",
    lessonDate: ctx.row.lesson_date || "",
    timeLabel,
    participants: Number(ctx.row.participants) || 1,
    childCount: 0,
    notes: paidNote,
    amount: ctx.amount,
    paymentKey: tno,
  });

  return {
    alreadyPaid: false,
    orderNo: input.orderId,
    amount: ctx.amount,
    tno,
    notice,
  };
}
