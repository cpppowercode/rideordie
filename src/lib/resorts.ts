/**
 * 스키장·패찰비 Single Source of Truth.
 * 메인, /resorts, 상세, /book, 결제 계산, 챗봇, 사이트맵, 운영시간·정설은
 * 이 파일의 RESORTS 한 곳만 보면 된다. hours.ts / grooming.ts / site.ts / badge-fee.ts 는 여기서 파생한다.
 */
import { LESSON_PHOTOS } from "@/lib/site-photos";
import { RATIOS, type Ratio } from "@/lib/pricing-tables";

export type ResortSlug =
  | "high1"
  | "welli-hilli"
  | "vivaldi"
  | "jisan"
  | "yongpyong"
  | "alpensia"
  | "muju";

export type BadgeFeeKind = "none" | "vivaldi" | "jisan" | "welli";

export type ResortHoursDef = {
  openHour: number;
  closeHour: number;
  source: string;
  confirmed: boolean;
  note?: string;
};

export type GroomingWindowDef = {
  startHour: number;
  durationHours: number;
  source: string;
  confirmed: boolean;
  note?: string;
};

export type ResortDefinition = {
  value: string;
  label: string;
  shortName: string;
  slug: ResortSlug;
  /** null = 전체 RATIOS, 아니면 허용 구성만 */
  allowedRatios: readonly Ratio[] | null;
  badgeFee: BadgeFeeKind;
  hours: ResortHoursDef;
  grooming: GroomingWindowDef[];
  image: string;
};

export const DEFAULT_RESORT_HOURS: ResortHoursDef = {
  openHour: 9,
  closeHour: 22,
  source: "default: typical 09:00–22:00 winter operating hours",
  confirmed: false,
  note: "Official operating hours were not confirmed; using 09:00–22:00.",
};

export const DEFAULT_GROOMING_WINDOW: GroomingWindowDef = {
  startHour: 17,
  durationHours: 2,
  source: "default: typical 17:00–19:00 day-to-night slope grooming gap",
  confirmed: false,
  note: "Official 정설 hours were not confirmed; using the common afternoon/night gap.",
};

/**
 * 운영 스키장 목록 (순서 = 메인·/resorts·예약 피커·챗봇 노출 순서).
 * 기존 6곳 + 무주(무주덕유산리조트, 사장님 확인 2026-11).
 */
export const RESORTS: readonly ResortDefinition[] = [
  {
    value: "하이원리조트",
    label: "하이원",
    shortName: "하이원",
    slug: "high1",
    allowedRatios: null,
    badgeFee: "none",
    hours: {
      openHour: 9,
      closeHour: 22,
      source: "https://www.high1.com/ski/contents.do?key=750",
      confirmed: true,
    },
    grooming: [
      {
        startHour: 16,
        durationHours: 2,
        source: "https://www.high1.com/ski/contents.do?key=750",
        confirmed: true,
      },
    ],
    image: LESSON_PHOTOS.lesson,
  },
  {
    value: "비발디파크",
    label: "비발디파크",
    shortName: "비발디",
    slug: "vivaldi",
    allowedRatios: null,
    badgeFee: "vivaldi",
    hours: {
      openHour: 9,
      closeHour: 23,
      source: "https://www.sonohotelsresorts.com/skiboard/info",
      confirmed: true,
      note: "Some slopes list late-night to 03:00; lesson booking closes at 23:00.",
    },
    grooming: [
      {
        startHour: 17.5,
        durationHours: 1.5,
        source: "https://www.sonohotelsresorts.com/skiboard/info",
        confirmed: true,
        note: "Blues / Hip-hop I / Hip-hop II groom 17:00–19:00; main slopes 17:30–19:00.",
      },
    ],
    image: LESSON_PHOTOS.slope,
  },
  {
    value: "웰리힐리파크",
    label: "웰리힐리파크",
    shortName: "웰리힐리",
    slug: "welli-hilli",
    allowedRatios: null,
    badgeFee: "welli",
    hours: {
      openHour: 9,
      closeHour: 24,
      source:
        "default from day/night ticket gap; official Korean charge page 404 as of 2026-10-23",
      confirmed: false,
      note: "Official wellihillipark.com charge page was not reachable; 09:00–24:00 is the booking window.",
    },
    grooming: [
      {
        startHour: 16.5,
        durationHours: 2,
        source:
          "default from day/night ticket gap (오후 ~16:30, 야간 18:30~); official Korean charge page 404 as of 2026-10-23",
        confirmed: false,
        note: "Official wellihillipark.com charge page was not reachable; 16:30–18:30 is the usual break.",
      },
    ],
    image: LESSON_PHOTOS.carve,
  },
  {
    value: "용평리조트",
    label: "용평",
    shortName: "용평",
    slug: "yongpyong",
    allowedRatios: ["1:1", "2:1"],
    badgeFee: "none",
    hours: {
      openHour: 9,
      closeHour: 23,
      source: "https://www.yongpyong.co.kr/mobile/kor/skiNboard/charge/lift.do",
      confirmed: true,
    },
    grooming: [
      {
        startHour: 17,
        durationHours: 2,
        source: "https://www.yongpyong.co.kr/mobile/kor/skiNboard/charge/lift.do",
        confirmed: true,
        note: "Listed as 오후야간권 Breaktime 17:00–19:00 on the 25/26 lift ticket table.",
      },
    ],
    image: LESSON_PHOTOS.air,
  },
  {
    value: "지산포레스트",
    label: "지산",
    shortName: "지산",
    slug: "jisan",
    allowedRatios: null,
    badgeFee: "jisan",
    hours: {
      openHour: 9,
      closeHour: 26,
      source: "https://www.jisanresort.co.kr/w/ski/slopes/info.asp",
      confirmed: true,
      note: "Night skiing listed through 02:00 (26:00 in booking hours).",
    },
    grooming: [
      {
        startHour: 17,
        durationHours: 1.5,
        source: "https://www.jisanresort.co.kr/w/ski/slopes/info.asp",
        confirmed: true,
      },
    ],
    image: LESSON_PHOTOS.lift,
  },
  {
    value: "알펜시아리조트",
    label: "알펜시아",
    shortName: "알펜시아",
    slug: "alpensia",
    allowedRatios: null,
    badgeFee: "none",
    hours: {
      openHour: 9,
      closeHour: 22,
      source: "default: typical 09:00–22:00; alpensia official hours not confirmed as of 2026-11-05",
      confirmed: false,
      note: "Official Alpensia operating hours were not confirmed; using 09:00–22:00.",
    },
    grooming: [
      {
        startHour: 17,
        durationHours: 2,
        source: "default: typical 17:00–19:00 day-to-night slope grooming gap; not confirmed for Alpensia",
        confirmed: false,
        note: "Official Alpensia 정설 hours were not confirmed; using the common afternoon/night gap.",
      },
    ],
    image: LESSON_PHOTOS.carve,
  },
  {
    value: "무주덕유산리조트",
    label: "무주",
    shortName: "무주",
    slug: "muju",
    allowedRatios: null,
    badgeFee: "none",
    hours: {
      ...DEFAULT_RESORT_HOURS,
      note: "무주덕유산 공식 26/27 운영시간 미확인; 09:00–22:00 임시.",
    },
    grooming: [
      {
        ...DEFAULT_GROOMING_WINDOW,
        note: "무주덕유산 공식 정설 시간 미확인; 17:00–19:00 임시.",
      },
    ],
    image: LESSON_PHOTOS.slope,
  },
];

export function resortByValue(value: string): ResortDefinition | undefined {
  const raw = String(value || "").trim();
  if (!raw) return undefined;
  const compact = raw.replace(/\s/g, "");
  return (
    RESORTS.find((r) => r.value === raw) ||
    RESORTS.find((r) => r.value.replace(/\s/g, "") === compact) ||
    RESORTS.find((r) => r.shortName === raw || r.label === raw) ||
    RESORTS.find((r) => compact.includes(r.shortName))
  );
}

export function resortBySlug(slug: string): ResortDefinition | undefined {
  return RESORTS.find((r) => r.slug === slug);
}

export function resortHasBadgeFee(skiResort: string): boolean {
  const r = resortByValue(skiResort);
  return Boolean(r && r.badgeFee !== "none");
}

export function resortAllowedRatios(skiResort: string): Ratio[] {
  const r = resortByValue(skiResort);
  if (r?.allowedRatios) return [...r.allowedRatios];
  return [...RATIOS];
}

export function teachingResortNames(): string[] {
  return RESORTS.map((r) => r.shortName);
}

export function teachingResortsCopy(): string {
  return teachingResortNames().join(", ");
}

export function teachingResortsInline(): string {
  return teachingResortNames().join(" · ");
}

export function badgeFeeKind(skiResort: string): BadgeFeeKind {
  return resortByValue(skiResort)?.badgeFee ?? "none";
}

/** 패찰비 별도 안내 문구(손님 노출). */
export function badgeFeeNotice(skiResort: string): string | null {
  const kind = badgeFeeKind(skiResort);
  if (kind === "vivaldi") {
    return "비발디는 패찰비가 별도입니다(인원×시간×12,500원). 온라인 결제 때 강습비와 함께 계산됩니다.";
  }
  if (kind === "jisan") {
    return "지산은 패찰비가 별도입니다(1인 2시간 35,000원 / 3·4시간 50,000원). 온라인 결제 때 강습비와 함께 계산됩니다.";
  }
  if (kind === "welli") {
    return "웰리힐리는 패찰비가 별도입니다(1인 2시간 40,000원). 온라인 결제 때 강습비와 함께 계산됩니다. 3·4시간 요율은 확정 전이라 우선 2시간 요율(1인 40,000원)을 적용합니다.";
  }
  return null;
}

export function skiResortOptions(): { value: string; label: string }[] {
  return RESORTS.map((r) => ({ value: r.value, label: r.label }));
}
