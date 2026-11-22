import { NextRequest, NextResponse } from "next/server";
import { listReservationsForDate } from "@/lib/admin-reservations";
import {
  computeAvailabilitySlots,
  publicAvailabilityErrorMessage,
} from "@/lib/availability";
import { isLessonDuration } from "@/lib/hours";
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
    // 서버 간 ADMIN_API_TOKEN 으로 조회한다. 손님 로그인과는 무관하다.
    const existing = await listReservationsForDate({ date, skiResort });
    const slots = computeAvailabilitySlots({
      skiResort,
      durationHours,
      existing,
      capacity,
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
    const message = publicAvailabilityErrorMessage(error);
    console.error("availability error", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
