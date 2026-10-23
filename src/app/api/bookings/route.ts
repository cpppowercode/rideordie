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
import { notifyOwner } from "@/lib/notify";
import { LESSON_SLOTS } from "@/lib/site";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<BookingInput>;
    const input: BookingInput = {
      customerName: String(body.customerName || ""),
      customerPhone: String(body.customerPhone || ""),
      participants: Number(body.participants),
      childCount: Number(body.childCount),
      skiResort: String(body.skiResort || ""),
      lessonType: String(body.lessonType || "ski"),
      lessonDate: String(body.lessonDate || ""),
      slotId: String(body.slotId || ""),
      notes: String(body.notes || ""),
    };

    const validationError = validateBookingInput(input);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const slot = LESSON_SLOTS.find((item) => item.id === input.slotId);
    if (!slot) {
      return NextResponse.json({ error: "시간대를 선택해 주세요." }, { status: 400 });
    }

    const existing = await listReservationsForDate({
      date: input.lessonDate,
      skiResort: input.skiResort,
    });

    if (hasDuplicateBooking(existing, input.customerPhone, slot.startHour, slot.durationHours)) {
      return NextResponse.json(
        { error: "같은 날짜·시간대에 이미 예약이 있습니다. 다른 시간을 선택하거나 고객센터로 문의해 주세요." },
        { status: 409 }
      );
    }

    if (slotIsFull(existing, input.skiResort, slot.startHour, slot.durationHours)) {
      return NextResponse.json(
        { error: "선택한 시간대는 예약이 마감되었습니다. 다른 시간을 선택해 주세요." },
        { status: 409 }
      );
    }

    const orderNo = buildOrderNo();
    const payload = toAdminPayload(input, orderNo);
    const created = await createAdminReservation(payload);

    const noticeSent = await notifyOwner({
      orderNo,
      customerName: input.customerName.trim(),
      customerPhone: payload.customer_phone,
      skiResort: input.skiResort,
      lessonType: input.lessonType,
      lessonDate: input.lessonDate,
      timeLabel: slot.timeLabel,
      participants: input.participants,
      childCount: input.childCount,
      notes: payload.notes,
    });

    return NextResponse.json({
      success: true,
      orderNo,
      reservationId: created.id,
      noticeSent,
    });
  } catch (error) {
    console.error("booking create error", error);
    const message = error instanceof Error ? error.message : "예약 접수에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
