import { slotOverlapsGrooming } from "@/lib/grooming";
import {
  DEFAULT_RESORT_HOURS,
  RESORTS,
  resortByValue,
  type ResortHoursDef,
} from "@/lib/resorts";

/**
 * Per-resort slope operating hours used to generate bookable lesson starts.
 *
 * Hours are decimal (16.5 = 16:30). Close may be 24+ for after-midnight
 * (26 = 02:00). A lesson that ends exactly at close is allowed.
 *
 * Source of truth: src/lib/resorts.ts (RESORTS[].hours).
 */

export type ResortHours = ResortHoursDef;

export const LESSON_DURATIONS = [2, 3, 4] as const;
export type LessonDurationHours = (typeof LESSON_DURATIONS)[number];

export const LESSON_START_STEP_HOURS = 0.5;

const DEFAULT_HOURS: ResortHours = DEFAULT_RESORT_HOURS;

/** Derived from RESORTS SSOT — do not edit here. */
export const RESORT_HOURS: Record<string, ResortHours> = Object.fromEntries(
  RESORTS.map((r) => [r.value, r.hours]),
);

export function resortHoursFor(skiResort: string): ResortHours {
  const found = resortByValue(skiResort);
  if (found) return found.hours;
  if (skiResort in RESORT_HOURS) return RESORT_HOURS[skiResort];
  return DEFAULT_HOURS;
}

export function isLessonDuration(value: number): value is LessonDurationHours {
  return (LESSON_DURATIONS as readonly number[]).includes(value);
}

export function toHalfHourSteps(hour: number): number {
  return Math.round(hour * 2);
}

export function fromHalfHourSteps(steps: number): number {
  return steps / 2;
}

export function isHalfHour(hour: number): boolean {
  return Number.isFinite(hour) && Math.abs(hour * 2 - Math.round(hour * 2)) < 1e-9;
}

export function normalizeHalfHour(hour: number): number {
  return fromHalfHourSteps(toHalfHourSteps(hour));
}

/** Clock label. 24:00 stays 24:00; 24.5 → 00:30; 26 → 02:00. */
export function formatLessonHour(hour: number): string {
  if (hour === 24) return "24:00";
  const wrapped = hour >= 24 ? hour - 24 * Math.floor(hour / 24) : hour;
  const hours = Math.floor(wrapped);
  const minutes = Math.round((wrapped - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatLessonRange(startHour: number, durationHours: number): string {
  return `${formatLessonHour(startHour)}~${formatLessonHour(startHour + durationHours)}`;
}

export function lessonFitsOperatingHours(
  skiResort: string,
  startHour: number,
  durationHours: number
): boolean {
  if (!isHalfHour(startHour) || !Number.isFinite(durationHours) || durationHours <= 0) {
    return false;
  }
  const hours = resortHoursFor(skiResort);
  const start = toHalfHourSteps(startHour);
  const end = start + toHalfHourSteps(durationHours);
  return start >= toHalfHourSteps(hours.openHour) && end <= toHalfHourSteps(hours.closeHour);
}

export type GeneratedStart = {
  id: string;
  startHour: number;
  durationHours: number;
  timeLabel: string;
};

/**
 * Bookable starts every 30 minutes. Hidden when the window overlaps grooming
 * or would run past closing.
 */
export function generateLessonStarts(
  skiResort: string,
  durationHours: number
): GeneratedStart[] {
  if (!isLessonDuration(durationHours)) return [];
  const hours = resortHoursFor(skiResort);
  const open = toHalfHourSteps(hours.openHour);
  const lastStart = toHalfHourSteps(hours.closeHour) - toHalfHourSteps(durationHours);
  const starts: GeneratedStart[] = [];
  for (let step = open; step <= lastStart; step += 1) {
    const startHour = fromHalfHourSteps(step);
    if (slotOverlapsGrooming(skiResort, startHour, durationHours)) continue;
    starts.push({
      id: formatLessonHour(startHour),
      startHour,
      durationHours,
      timeLabel: formatLessonRange(startHour, durationHours),
    });
  }
  return starts;
}

export function findLessonStart(
  skiResort: string,
  durationHours: number,
  startHour: number
): GeneratedStart | undefined {
  if (!isHalfHour(startHour)) return undefined;
  const normalized = normalizeHalfHour(startHour);
  return generateLessonStarts(skiResort, durationHours).find(
    (slot) => toHalfHourSteps(slot.startHour) === toHalfHourSteps(normalized)
  );
}
