import { overlappingReservations, type ExistingReservation } from "@/lib/booking";
import { generateLessonStarts, type LessonDurationHours } from "@/lib/hours";
import { bookingSlotCapacity } from "@/lib/site";
import {
  DEFAULT_SETTINGS,
  isLessonScheduleOpen,
  type SeasonSettings,
} from "@/lib/pricing";

export type AvailabilitySlotReason = "full" | "opening_soon" | null;

export type AvailabilitySlot = {
  id: string;
  startHour: number;
  durationHours: number;
  timeLabel: string;
  used: number;
  remaining: number | null;
  available: boolean;
  reason: AvailabilitySlotReason;
};

/**
 * 공개 예약 화면용 잔여 팀 수.
 * capacity(동시 강습 가능 팀 = 강사 여유) − 같은 스키장·겹치는 시간대 예약 수.
 * 시즌 오픈 전(lessonDate < seasonStart)이면 remaining=null, reason=opening_soon.
 */
export function computeAvailabilitySlots(options: {
  skiResort: string;
  durationHours: LessonDurationHours;
  existing: ExistingReservation[];
  capacity?: number;
  lessonDate?: string;
  seasonSettings?: SeasonSettings;
}): AvailabilitySlot[] {
  const capacity = options.capacity ?? bookingSlotCapacity();
  const settings = options.seasonSettings ?? DEFAULT_SETTINGS;
  const scheduleOpen =
    !options.lessonDate || isLessonScheduleOpen(options.lessonDate, settings);

  return generateLessonStarts(options.skiResort, options.durationHours).map((slot) => {
    if (!scheduleOpen) {
      return {
        id: slot.id,
        startHour: slot.startHour,
        durationHours: slot.durationHours,
        timeLabel: slot.timeLabel,
        used: 0,
        remaining: null,
        available: false,
        reason: "opening_soon" as const,
      };
    }
    const used = overlappingReservations(
      options.existing,
      options.skiResort,
      slot.startHour,
      slot.durationHours,
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
      reason: remaining > 0 ? null : ("full" as const),
    };
  });
}

/** 관리자 API 인증 실패 문구를 손님 화면에 그대로 노출하지 않는다. */
export function publicAvailabilityErrorMessage(raw: unknown): string {
  const message = raw instanceof Error ? raw.message : String(raw || "");
  if (/로그인|unauthorized|401|인증|권한/i.test(message)) {
    return "예약 현황을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }
  return message || "예약 가능 여부를 확인하지 못했습니다.";
}
