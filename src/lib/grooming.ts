import { slotsOverlap } from "@/lib/overlap";
import {
  DEFAULT_GROOMING_WINDOW,
  RESORTS,
  resortByValue,
  type GroomingWindowDef,
} from "@/lib/resorts";

/**
 * Per-resort slope grooming (정설) windows used to block lesson bookings.
 *
 * Hours are decimal (16.5 = 16:30). Windows are half-open: a slot that ends
 * exactly when grooming starts, or starts exactly when grooming ends, is OK.
 *
 * Source of truth: src/lib/resorts.ts (RESORTS[].grooming).
 */

export const GROOMING_REASON = "grooming";
export const GROOMING_LABEL = "정설 시간";
export const GROOMING_BOOKING_ERROR =
  "정설 시간에는 강습을 예약할 수 없습니다.";

export type GroomingWindow = GroomingWindowDef;

const DEFAULT_GROOMING: GroomingWindow = DEFAULT_GROOMING_WINDOW;

/** Derived from RESORTS SSOT — do not edit here. */
export const GROOMING_BREAKS: Record<string, GroomingWindow[]> = Object.fromEntries(
  RESORTS.map((r) => [r.value, [...r.grooming]]),
);

export function formatGroomingHour(hour: number): string {
  const hours = Math.floor(hour);
  const minutes = Math.round((hour - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function groomingWindowsFor(skiResort: string): GroomingWindow[] {
  const found = resortByValue(skiResort);
  if (found) return [...found.grooming];
  if (skiResort in GROOMING_BREAKS) return GROOMING_BREAKS[skiResort];
  return [DEFAULT_GROOMING];
}

export function slotOverlapsGrooming(
  skiResort: string,
  startHour: number,
  durationHours: number
): boolean {
  return groomingWindowsFor(skiResort).some((window) =>
    slotsOverlap(startHour, durationHours, window.startHour, window.durationHours)
  );
}
