import { NextRequest, NextResponse } from "next/server";
import { listReservationsForDate } from "@/lib/admin-reservations";
import { overlappingReservations } from "@/lib/booking";
import { generateLessonStarts, isLessonDuration } from "@/lib/hours";
import { bookingSlotCapacity, SKI_RESORTS } from "@/lib/site";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") || "";
  const skiResort = request.nextUrl.searchParams.get("skiResort") || "";
  const durationHours = Number(request.nextUrl.searchParams.get("duration"));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "날짜를 선택해 주세요." }, { status: 400 });
  }
  if (!SKI_RESORTS.some((resort) => resort.value === skiResort)) {
    return NextResponse.json({ error: "스키장을 선택해 주세요." }, { status: 400 });
  }
  if (!isLessonDuration(durationHours)) {
    return NextResponse.json({ error: "강습 시간을 선택해 주세요." }, { status: 400 });
  }

  try {
    const capacity = bookingSlotCapacity();
    const existing = await listReservationsForDate({ date, skiResort });
    const slots = generateLessonStarts(skiResort, durationHours).map((slot) => {
      const used = overlappingReservations(
        existing,
        skiResort,
        slot.startHour,
        slot.durationHours
      ).length;
      const remaining = Math.max(0, capacity - used);
      return {
        id: slot.id,
        startHour: slot.startHour,
        durationHours: slot.durationHours,
        timeLabel: slot.timeLabel,
        used,
        remaining,
        available: remaining > 0,
        reason: remaining > 0 ? null : "full",
      };
    });

    return NextResponse.json({
      success: true,
      date,
      skiResort,
      durationHours,
      capacity,
      slots,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "예약 가능 여부를 확인하지 못했습니다.";
    console.error("availability error", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
