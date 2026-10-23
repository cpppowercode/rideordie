import { NextRequest, NextResponse } from "next/server";
import { createAdminReservation, listReservationsForDate } from "@/lib/admin-reservations";
import {
  buildOrderNo,
  hasDuplicateBooking,
  slotIsFull,
  toAdminPayload,
  validateBookingInput,
  type BookingInput,
} from "@/lib/booking";
import { GROOMING_BOOKING_ERROR, slotOverlapsGrooming } from "@/lib/grooming";
import { findLessonStart, isLessonDuration, normalizeHalfHour } from "@/lib/hours";
import { quoteLessonPrice } from "@/lib/pricing";
import { tossClientKey, tossCustomerKey, tossIsTestMode } from "@/lib/toss";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<BookingInput>;
    const durationHours = Number(body.durationHours);
    const startHour = Number(body.startHour);
    const input: BookingInput = {
      customerName: String(body.customerName || ""),
      customerPhone: String(body.customerPhone || ""),
      participants: Number(body.participants),
      childCount: Number(body.childCount),
      skiResort: String(body.skiResort || ""),
      lessonType: String(body.lessonType || "ski"),
      lessonDate: String(body.lessonDate || ""),
      durationHours,
      startHour,
      notes: String(body.notes || ""),
    };

    const validationError = validateBookingInput(input);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const duration = isLessonDuration(input.durationHours) ? input.durationHours : null;
    const start = Number.isFinite(input.startHour) ? normalizeHalfHour(input.startHour) : NaN;
    if (!duration || !Number.isFinite(start)) {
      return NextResponse.json({ error: "시작 시간을 선택해 주세요." }, { status: 400 });
    }

    if (slotOverlapsGrooming(input.skiResort, start, duration)) {
      return NextResponse.json({ error: GROOMING_BOOKING_ERROR }, { status: 409 });
    }

    const slot = findLessonStart(input.skiResort, duration, start);
    if (!slot) {
      return NextResponse.json({ error: "선택한 시간에는 강습을 예약할 수 없습니다." }, { status: 400 });
    }

    const existing = await listReservationsForDate({
      date: input.lessonDate,
      skiResort: input.skiResort,
    });

    if (hasDuplicateBooking(existing, input.customerPhone, start, duration)) {
      return NextResponse.json(
        { error: "같은 날짜·시간대에 이미 예약이 있습니다. 다른 시간을 선택하거나 고객센터로 문의해 주세요." },
        { status: 409 }
      );
    }

    if (slotIsFull(existing, input.skiResort, start, duration)) {
      return NextResponse.json(
        { error: "선택한 시간대는 예약이 마감되었습니다. 다른 시간을 선택해 주세요." },
        { status: 409 }
      );
    }

    const quote = quoteLessonPrice(input);
    if (!quote) {
      return NextResponse.json({ error: "강습 요금을 계산할 수 없습니다." }, { status: 400 });
    }

    const orderNo = buildOrderNo();
    const payload = toAdminPayload({ ...input, startHour: start, durationHours: duration }, orderNo);
    const created = await createAdminReservation(payload);

    return NextResponse.json({
      success: true,
      orderNo,
      reservationId: created.id,
      amount: quote.payableAmount,
      regularAmount: quote.regularAmount,
      lessonAmount: quote.lessonAmount,
      badgeFee: quote.badgeFee,
      earlyBird: quote.earlyBird,
      ratio: quote.ratio,
      clientKey: tossClientKey(),
      customerKey: tossCustomerKey(orderNo),
      testMode: tossIsTestMode(),
      payPath: `/book/pay?orderNo=${encodeURIComponent(orderNo)}`,
    });
  } catch (error) {
    console.error("booking create error", error);
    const message = error instanceof Error ? error.message : "예약 접수에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
