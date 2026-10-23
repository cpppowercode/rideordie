import { NextRequest, NextResponse } from "next/server";
import {
  findReservationByOrderNo,
  updateAdminReservation,
} from "@/lib/admin-reservations";
import { isPaidStatus } from "@/lib/booking";
import { formatLessonRange } from "@/lib/hours";
import { notifyOwner } from "@/lib/notify";
import { confirmTossPayment } from "@/lib/toss";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      paymentKey?: string;
      orderId?: string;
      amount?: number;
    };
    const paymentKey = String(body.paymentKey || "").trim();
    const orderId = String(body.orderId || "").trim();
    const clientAmount = Number(body.amount);

    if (!paymentKey || !orderId) {
      return NextResponse.json({ error: "결제 정보가 없습니다." }, { status: 400 });
    }

    const row = await findReservationByOrderNo(orderId);
    if (!row?.id) {
      return NextResponse.json({ error: "예약 정보를 찾지 못했습니다." }, { status: 404 });
    }

    const expectedAmount = Number(row.amount);
    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
      return NextResponse.json({ error: "예약 금액이 없습니다." }, { status: 400 });
    }
    if (Number.isFinite(clientAmount) && clientAmount !== expectedAmount) {
      return NextResponse.json({ error: "결제 금액이 예약 금액과 다릅니다." }, { status: 409 });
    }

    if (isPaidStatus(row.payment_status)) {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        orderNo: orderId,
        amount: expectedAmount,
      });
    }

    const payment = await confirmTossPayment({
      paymentKey,
      orderId,
      amount: expectedAmount,
    });
    if (payment.totalAmount !== expectedAmount) {
      return NextResponse.json({ error: "승인 금액이 예약 금액과 다릅니다." }, { status: 409 });
    }

    const paidNote = [
      row.notes || "",
      `결제완료 ${expectedAmount.toLocaleString("ko-KR")}원`,
      `paymentKey ${payment.paymentKey}`,
    ]
      .filter(Boolean)
      .join(" / ")
      .slice(0, 1000);

    await updateAdminReservation(row.id, {
      payment_status: "completed",
      reservation_status: "confirmed",
      payment_method: "app",
      amount: expectedAmount,
      notes: paidNote,
    });

    const start = Number(row.lesson_start_hour);
    const duration = Number(row.lesson_duration_hours) || 2;
    const timeLabel =
      row.lesson_time ||
      (Number.isFinite(start) ? formatLessonRange(start, duration) : "-");

    const notice = await notifyOwner({
      orderNo: orderId,
      customerName: row.customer_name || "",
      customerPhone: row.customer_phone || "",
      skiResort: row.ski_resort || "",
      lessonType: row.lesson_type || "ski",
      lessonDate: row.lesson_date || "",
      timeLabel,
      participants: Number(row.participants) || 1,
      childCount: 0,
      notes: paidNote,
      amount: expectedAmount,
      paymentKey: payment.paymentKey,
    });

    return NextResponse.json({
      success: true,
      orderNo: orderId,
      amount: expectedAmount,
      paymentKey: payment.paymentKey,
      method: payment.method,
      noticeSent: notice.sent,
      noticeSkipped: notice.skipped,
      noticeFailed: notice.failed,
    });
  } catch (error) {
    console.error("toss confirm error", error);
    const message = error instanceof Error ? error.message : "결제 확인에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
