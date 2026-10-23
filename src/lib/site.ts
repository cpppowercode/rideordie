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
  { value: "곤지암리조트", label: "곤지암" },
] as const;

export const LESSON_TYPES = [
  { value: "ski", label: "스키" },
  { value: "board", label: "보드" },
  { value: "both", label: "둘 다" },
] as const;

export type LessonSlot = {
  id: string;
  label: string;
  startHour: number;
  durationHours: number;
  timeLabel: string;
};

export const LESSON_SLOTS: LessonSlot[] = [
  { id: "am2", label: "오전 2시간", startHour: 9, durationHours: 2, timeLabel: "09:00–11:00" },
  { id: "pm2", label: "오후 2시간", startHour: 13, durationHours: 2, timeLabel: "13:00–15:00" },
  { id: "am4", label: "오전 4시간", startHour: 9, durationHours: 4, timeLabel: "09:00–13:00" },
  { id: "pm4", label: "오후 4시간", startHour: 13, durationHours: 4, timeLabel: "13:00–17:00" },
  { id: "night2", label: "야간 2시간", startHour: 18, durationHours: 2, timeLabel: "18:00–20:00" },
];

export const PHOTO_SOURCES = [
  {
    file: "/images/lessons/hero.png",
    credit: "Unsplash",
    url: "https://unsplash.com/photos/person-skiing-on-snow-covered-ground-1551698618",
    photoId: "photo-1551698618-1dfe5d97d256",
  },
  {
    file: "/images/lessons/gallery-1.jpg",
    credit: "Pexels / 848612",
    url: "https://www.pexels.com/photo/848612/",
  },
  {
    file: "/images/lessons/gallery-2.jpg",
    credit: "Pexels / 376697",
    url: "https://www.pexels.com/photo/376697/",
  },
  {
    file: "/images/lessons/gallery-3.jpg",
    credit: "Pexels / 2433353",
    url: "https://www.pexels.com/photo/2433353/",
  },
  {
    file: "/images/lessons/gallery-4.jpg",
    credit: "Pexels / 257961",
    url: "https://www.pexels.com/photo/257961/",
  },
  {
    file: "/images/lessons/gallery-6.jpg",
    credit: "Pexels / 352093",
    url: "https://www.pexels.com/photo/352093/",
  },
] as const;
