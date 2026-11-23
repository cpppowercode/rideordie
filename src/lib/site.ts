import {
  RESORTS,
  skiResortOptions,
  teachingResortNames,
  teachingResortsCopy,
  teachingResortsInline,
} from "@/lib/resorts";
import { LESSON_PHOTOS } from "@/lib/site-photos";

export const INSTAGRAM_URL = "https://www.instagram.com/ski.rideordie/";
export const NAVER_BLOG_URL = "https://blog.naver.com/rideordieski";
export const KAKAO_CONSULT_URL = "https://pf.kakao.com/_xfWMxaG";
export const OWNER_EMAIL = "contact@rideordie.kr";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://rideordie.kr"
).replace(/\/$/, "");

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

/** Booking picker — derived from RESORTS SSOT. */
export const SKI_RESORTS = skiResortOptions() as {
  value: (typeof RESORTS)[number]["value"];
  label: string;
}[];

/** Short names for marketing copy. Booking picker labels stay SKI_RESORTS. */
export const TEACHING_RESORTS = teachingResortNames() as readonly string[];

export const TEACHING_RESORTS_COPY = teachingResortsCopy();
export const TEACHING_RESORTS_INLINE = teachingResortsInline();

export const LESSON_TYPES = [
  { value: "ski", label: "스키" },
  { value: "board", label: "보드" },
  { value: "both", label: "둘 다" },
] as const;

export { LESSON_PHOTOS, RESORTS };
