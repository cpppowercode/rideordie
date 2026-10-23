import { NextRequest, NextResponse } from "next/server";
import { listReservationsForDate } from "@/lib/admin-reservations";
import { overlappingReservations } from "@/lib/booking";
import { BOOKING_SLOT_CAPACITY, LESSON_SLOTS, SKI_RESORTS } from "@/lib/site";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") || "";
  const skiResort = request.nextUrl.searchParams.get("skiResort") || "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "날짜를 선택해 주세요." }, { status: 400 });
  }
  if (!SKI_RESORTS.some((resort) => resort.value === skiResort)) {
    return NextResponse.json({ error: "스키장을 선택해 주세요." }, { status: 400 });
  }

  try {
    const existing = await listReservationsForDate({ date, skiResort });
    const slots = LESSON_SLOTS.map((slot) => {
      const used = overlappingReservations(
        existing,
        skiResort,
        slot.startHour,
        slot.durationHours
      ).length;
      return {
        id: slot.id,
        label: slot.label,
        timeLabel: slot.timeLabel,
        startHour: slot.startHour,
        durationHours: slot.durationHours,
        used,
        remaining: Math.max(0, BOOKING_SLOT_CAPACITY - used),
        available: used < BOOKING_SLOT_CAPACITY,
      };
    });

    return NextResponse.json({
      success: true,
      date,
      skiResort,
      capacity: BOOKING_SLOT_CAPACITY,
      slots,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "예약 가능 여부를 확인하지 못했습니다.";
    console.error("availability error", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
