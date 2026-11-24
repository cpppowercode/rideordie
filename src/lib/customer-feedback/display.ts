import type {
  FeedbackBadge,
  FeedbackMark,
  FeedbackSession,
  FeedbackStudent,
} from "./types";

/** 흔한 두 글자 성. 그 외는 첫 글자를 성으로 본다. */
const TWO_CHAR_SURNAMES = [
  "남궁",
  "황보",
  "제갈",
  "사공",
  "선우",
  "서문",
  "독고",
  "동방",
  "어금",
] as const;

/**
 * 성을 뺀 이름만 반환. 전화번호·생년월일·성은 표시하지 않는다.
 */
export function givenNameOnly(displayName: string): string {
  const n = String(displayName ?? "").trim();
  if (!n) return "";
  if (/\s/.test(n)) {
    const parts = n.split(/\s+/).filter(Boolean);
    return parts.length > 1 ? parts.slice(1).join(" ") : parts[0]!;
  }
  for (const surname of TWO_CHAR_SURNAMES) {
    if (n.startsWith(surname) && n.length > surname.length) {
      return n.slice(surname.length);
    }
  }
  if (n.length >= 2) return n.slice(1);
  return n;
}

export function normalizeSport(sport: string): "ski" | "board" | "other" {
  const s = sport.trim().toLowerCase();
  if (s === "ski" || s === "스키" || s.includes("ski") || s.includes("스키")) return "ski";
  if (
    s === "board" ||
    s === "보드" ||
    s === "snowboard" ||
    s.includes("board") ||
    s.includes("보드")
  ) {
    return "board";
  }
  return "other";
}

export function sportLabel(sport: string): string {
  const n = normalizeSport(sport);
  if (n === "ski") return "스키";
  if (n === "board") return "보드";
  return sport.trim() || "강습";
}

/** 강습생 피드백에 스키·보드가 모두 있으면 토글 가능. */
export function availableSports(student: FeedbackStudent): Array<"ski" | "board"> {
  const set = new Set<"ski" | "board">();
  const top = normalizeSport(student.sport);
  if (top === "ski" || top === "board") set.add(top);
  for (const fb of student.feedbacks) {
    const n = normalizeSport(fb.sport);
    if (n === "ski" || n === "board") set.add(n);
  }
  return Array.from(set);
}

export function filterFeedbacksBySport(
  feedbacks: FeedbackSession[],
  sport: "ski" | "board",
): FeedbackSession[] {
  return feedbacks
    .filter((fb) => normalizeSport(fb.sport) === sport)
    .slice()
    .sort((a, b) => a.session_date.localeCompare(b.session_date));
}

export function markSymbol(mark: FeedbackMark): string {
  if (mark === "o") return "○";
  if (mark === "triangle") return "△";
  if (mark === "x") return "✕";
  return "·";
}

export function markLabel(mark: FeedbackMark): string {
  if (mark === "o") return "통과";
  if (mark === "triangle") return "연습 중";
  if (mark === "x") return "아직";
  return "미기록";
}

export function formatSessionDate(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (!m) return isoDate;
  return `${m[1]}. ${Number(m[2])}. ${Number(m[3])}.`;
}

export function latestFeedback(feedbacks: FeedbackSession[]): FeedbackSession | null {
  if (!feedbacks.length) return null;
  return feedbacks
    .slice()
    .sort((a, b) => b.session_date.localeCompare(a.session_date))[0]!;
}

/** 주니어 급수 뱃지(종목당 10개). 자격 도전 뱃지(L1/L2/T1)와 구분한다. */
export function isJuniorBadge(badge: Pick<FeedbackBadge, "code" | "label">): boolean {
  const hay = `${badge.code} ${badge.label}`;
  return /_JR_|\bJR\d|주니어\s*\d*급/i.test(hay);
}

/**
 * 취득 뱃지 목록. badges 생략·빈 배열이면 [].
 * 주니어 비대상이면 주니어 급수 뱃지만 숨기고, 자격 도전 뱃지는 남긴다.
 * 손님 UI에는 needs_confirmation 을 쓰지 않는다.
 */
export function visibleBadges(student: FeedbackStudent): FeedbackBadge[] {
  const raw = Array.isArray(student.badges) ? student.badges : [];
  const normalized: FeedbackBadge[] = raw
    .filter(
      (b) =>
        b &&
        typeof b.code === "string" &&
        typeof b.label === "string" &&
        (b.sport === "ski" || b.sport === "board") &&
        typeof b.earned_at === "string",
    )
    .map((b) => ({
      code: b.code,
      label: b.label,
      sport: b.sport as "ski" | "board",
      earned_at: b.earned_at,
      color_name:
        typeof b.color_name === "string" && b.color_name.trim()
          ? b.color_name.trim()
          : null,
    }));

  const filtered = student.is_junior_eligible
    ? normalized
    : normalized.filter((b) => !isJuniorBadge(b));

  return filtered
    .slice()
    .sort((a, b) => b.earned_at.localeCompare(a.earned_at));
}
