import { NextRequest, NextResponse } from "next/server";
import { listReservationsForDate } from "@/lib/admin-reservations";
import {
  computeAvailabilitySlots,
  publicAvailabilityErrorMessage,
} from "@/lib/availability";
import { isLessonDuration } from "@/lib/hours";
import { bookingSlotCapacity, SKI_RESORTS } from "@/lib/site";
import { getSeasonSettings } from "@/lib/season-settings";
import { isLessonScheduleOpen } from "@/lib/pricing";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import { enforceRateLimit } from "@/lib/security/request";

export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, "availability", RATE_LIMITS.availability);
  if (limited) return limited;

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
    const seasonSettings = await getSeasonSettings();
    const scheduleOpen = isLessonScheduleOpen(date, seasonSettings);

    // 오픈 전이면 어드민 예약 조회를 건너뛰고 '오픈 예정'만 내린다.
    // (마감/0팀으로 오해하지 않게 한다. workplace_schedule 미등록과 동일 UX.)
    // AVAILABILITY_OFFLINE=1 → 운영 DB에 쓰지 않는 빈 예약으로 잔여만 계산(로컬·E2E용).
    const offline = process.env.AVAILABILITY_OFFLINE === "1";
    const existing = !scheduleOpen || offline
      ? []
      : await listReservationsForDate({ date, skiResort });

    const slots = computeAvailabilitySlots({
      skiResort,
      durationHours,
      existing,
      capacity,
      lessonDate: date,
      seasonSettings,
    });

    return NextResponse.json({
      success: true,
      date,
      skiResort,
      durationHours,
      capacity,
      scheduleStatus: scheduleOpen ? "open" : "opening_soon",
      seasonStart: seasonSettings.seasonStart,
      slots,
    });
  } catch (error) {
    const message = publicAvailabilityErrorMessage(error);
    console.error("availability error", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
