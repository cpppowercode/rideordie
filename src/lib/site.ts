export const INSTAGRAM_URL = "https://www.instagram.com/ski.rideordie/";
export const OWNER_EMAIL = "contact@rideordie.kr";
export const OWNER_PHONE = "010-2028-2744";

export const ADMIN_RESERVATIONS_URL =
  process.env.ADMIN_RESERVATIONS_URL ||
  "https://admin.rideordie.kr/api/reservations";

export const ADMIN_TENANT_ID =
  process.env.ADMIN_TENANT_ID || "rideordie";

/** Concurrent lessons allowed for the same resort + overlapping time. */
export function bookingSlotCapacity(): number {
  const raw = process.env["BOOKING_SLOT_CAPACITY"];
  const n = Number(raw ?? "6");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 6;
}

export const SKI_RESORTS = [
  { value: "하이원리조트", label: "하이원" },
  { value: "비발디파크", label: "비발디파크" },
  { value: "웰리힐리파크", label: "웰리힐리파크" },
  { value: "용평리조트", label: "용평" },
  { value: "지산포레스트", label: "지산" },
] as const;

/** Short names for marketing copy. Booking picker labels stay SKI_RESORTS. */
export const TEACHING_RESORTS = [
  "하이원",
  "비발디",
  "웰리힐리",
  "용평",
  "지산",
] as const;

export const TEACHING_RESORTS_COPY = TEACHING_RESORTS.join(", ");
export const TEACHING_RESORTS_INLINE = TEACHING_RESORTS.join(" · ");

export const LESSON_TYPES = [
  { value: "ski", label: "스키" },
  { value: "board", label: "보드" },
  { value: "both", label: "둘 다" },
] as const;

/**
 * Real lesson photos owned by RideOrDie.
 * Only shots without identifiable children's faces are shipped
 * (backs, helmets+goggles covering the face, or distant riding).
 */
export const LESSON_PHOTOS = {
  hero: "/images/lessons/hero.webp",
  heroMobile: "/images/lessons/hero-mobile.webp",
  lesson: "/images/lessons/lesson.webp",
  carve: "/images/lessons/gallery-carve.webp",
  lift: "/images/lessons/gallery-lift.webp",
  jump: "/images/lessons/gallery-jump.webp",
  air: "/images/lessons/gallery-air.webp",
  slope: "/images/lessons/gallery-slope.webp",
} as const;
