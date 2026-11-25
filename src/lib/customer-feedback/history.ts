/**
 * 손님 회차 이력 — 최종 명세 §3 (단계별 사다리 · 날짜별 · 다음 단계 · 보강).
 * 강사 실명/ID는 항상 「담당 강사」로 덮는다.
 */
import {
  markLabel as defaultMarkLabel,
  markSymbol,
  normalizeSport,
  resolveMarkLabel,
} from "./display";
import { customerInstructorLabel } from "./instructor";
import type {
  FeedbackItem,
  FeedbackMark,
  FeedbackPhoto,
  FeedbackSession,
  FeedbackStudent,
} from "./types";

export type MarkChange =
  | "first"
  | `${"o" | "triangle" | "x"}->${"o" | "triangle" | "x"}`
  | null;

export type ByStepRecord = {
  sessionNo: number;
  date: string;
  instructor: string;
  mark: FeedbackMark;
  markLabel: string;
  change: MarkChange;
  stepComment: string | null;
  nextFocus?: string | null;
  instructorNote?: string | null;
  feedbackId?: string;
};

export type ByStepRow =
  | {
      step: string;
      kind: "step";
      records: ByStepRecord[];
      latestMark: FeedbackMark;
      markLabel: string;
      neverMarked: boolean;
      isNextStep: boolean;
      /** 최근 회차에 표시+다음체크 = 보강 */
      isReinforce: boolean;
    }
  | {
      step: string;
      kind: "milestone";
      remaining?: number | null;
      records?: never;
    };

export type SessionMarkRow = {
  step: string;
  mark: FeedbackMark;
  markLabel: string;
  change: MarkChange;
  stepComment: string | null;
  isNextStep: boolean;
  isReinforce: boolean;
};

/** 어드민이 준 사진 중 Supabase 서명 주소만 통과(다른 주소·스크립트 차단). 최대 20장. */
export function safeFeedbackPhotos(input: unknown): FeedbackPhoto[] {
  if (!Array.isArray(input)) return [];
  const ok = (u: unknown) => {
    if (typeof u !== "string") return false;
    try {
      const x = new URL(u);
      return (x.protocol === "https:" || x.protocol === "http:") && x.pathname.includes("/storage/v1/object/sign/");
    } catch {
      return false;
    }
  };
  return input
    .filter((p): p is FeedbackPhoto => !!p && typeof p === "object" && typeof (p as FeedbackPhoto).id === "string" && ok((p as FeedbackPhoto).url) && ok((p as FeedbackPhoto).download_url))
    .slice(0, 20)
    .map((p) => ({ id: p.id, url: p.url, download_url: p.download_url, width: p.width ?? null, height: p.height ?? null }));
}

export type HistorySessionCard = {
  sessionNo: number;
  date: string;
  instructor: string;
  marks: SessionMarkRow[];
  daySummary: string | null;
  nextFocus: string | null;
  instructorNote: string | null;
  feedbackId: string;
  /** 회차 공용 사진 (없으면 빈 배열) */
  photos: FeedbackPhoto[];
};

export type NextStepChip = {
  label: string;
  isReinforce: boolean;
};

export type StudentHistory = {
  byStep: ByStepRow[];
  sessions: HistorySessionCard[];
  canDoCount: number;
  totalSteps: number;
  /** o | triangle_or_x | next | empty — 막대용 */
  barSlots: Array<"o" | "tx" | "next" | "empty">;
  nextSteps: NextStepChip[];
  nextFocusText: string | null;
  allStepsDone: boolean;
};

export function formatChangeLabel(change: MarkChange): string | null {
  if (!change) return null;
  if (change === "first") return "첫 평가";
  const [a, b] = change.split("->") as [FeedbackMark, FeedbackMark];
  return `${markSymbol(a)} → ${markSymbol(b)}`;
}

export function progressCompareSummary(history: StudentHistory): string | null {
  const steps = history.byStep.filter(
    (r): r is Extract<ByStepRow, { kind: "step" }> => r.kind === "step",
  );
  if (!steps.length) return null;
  const o = steps.filter((s) => s.latestMark === "o").length;
  return `○ ${o} / ${steps.length}`;
}

function changeOf(prev: FeedbackMark | undefined, mark: FeedbackMark): MarkChange {
  if (prev === undefined) return "first";
  if (prev === mark || mark == null || prev == null) return null;
  return `${prev}->${mark}` as MarkChange;
}

function orderedSessions(
  feedbacks: FeedbackSession[],
  sportFilter?: "ski" | "board",
): FeedbackSession[] {
  return feedbacks
    .filter((fb) => {
      if (!sportFilter) return true;
      return normalizeSport(fb.sport) === sportFilter;
    })
    .slice()
    .sort((a, b) => a.session_date.localeCompare(b.session_date));
}

function withNums(sessions: FeedbackSession[]): Array<FeedbackSession & { _num: number }> {
  return sessions.map((s, i) => ({
    ...s,
    _num:
      typeof s.session_number === "number" && s.session_number > 0
        ? s.session_number
        : i + 1,
  }));
}

function itemComment(it: FeedbackItem): string | null {
  if (it.mark == null) return null; // 명세: mark 없는 행 코멘트는 손님에게 없음
  const c = typeof it.step_comment === "string" ? it.step_comment.trim() : "";
  return c || null;
}

type LadderSlot =
  | { kind: "step"; label: string }
  | { kind: "milestone"; label: string };

function buildLadder(sessions: FeedbackSession[]): LadderSlot[] {
  const out: LadderSlot[] = [];
  const seen = new Set<string>();
  for (const s of sessions) {
    for (const it of s.items ?? []) {
      if (!it || typeof it.label !== "string") continue;
      const key = `${it.kind}:${it.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        kind: it.kind === "milestone" ? "milestone" : "step",
        label: it.label,
      });
    }
  }
  return out;
}

/** feedbacks 로부터 최종 명세 형태 이력을 만든다. */
export function buildHistoryFromFeedbacks(
  feedbacks: FeedbackSession[],
  sportFilter?: "ski" | "board",
): StudentHistory {
  const sessions = withNums(orderedSessions(feedbacks, sportFilter));
  const ladder = buildLadder(sessions);
  const newest = sessions[sessions.length - 1] ?? null;

  const byStep: ByStepRow[] = [];
  for (const slot of ladder) {
    if (slot.kind === "milestone") {
      byStep.push({ step: slot.label, kind: "milestone" });
      continue;
    }

    const records: ByStepRecord[] = [];
    let prev: FeedbackMark | undefined;
    let latestMark: FeedbackMark = null;
    let latestLabel = "배우기 전";
    let neverMarked = true;

    for (const s of sessions) {
      const it = (s.items ?? []).find(
        (x) => x.kind === "step" && x.label === slot.label,
      );
      if (!it || it.mark == null) continue;
      neverMarked = false;
      const mark = it.mark;
      const change = changeOf(prev, mark);
      records.push({
        sessionNo: s._num,
        date: s.session_date,
        instructor: customerInstructorLabel(s.instructor_display_name),
        mark,
        markLabel: resolveMarkLabel(mark, it.mark_label),
        change,
        stepComment: itemComment(it),
        nextFocus: s.next_focus,
        instructorNote: s.instructor_note,
        feedbackId: s.id,
      });
      prev = mark;
      latestMark = mark;
      latestLabel = resolveMarkLabel(mark, it.mark_label);
    }

    const newestItem = newest
      ? (newest.items ?? []).find(
          (x) => x.kind === "step" && x.label === slot.label,
        )
      : undefined;
    const isNextStep = Boolean(newestItem?.is_next_step);
    const isReinforce = Boolean(
      isNextStep && newestItem && newestItem.mark != null,
    );

    if (isNextStep && neverMarked) {
      latestLabel = "다음에 배울 단계";
      latestMark = null;
    } else if (neverMarked) {
      latestLabel = "배우기 전";
      latestMark = null;
    }

    byStep.push({
      step: slot.label,
      kind: "step",
      records: records.slice().reverse(), // 최신 위
      latestMark,
      markLabel: latestLabel,
      neverMarked,
      isNextStep,
      isReinforce,
    });
  }

  // sessions cards — chronological then reverse for display
  const prevMarks = new Map<string, FeedbackMark>();
  const sessionCardsAsc: HistorySessionCard[] = [];
  for (const s of sessions) {
    const marks: SessionMarkRow[] = [];
    for (const it of s.items ?? []) {
      if (it.kind !== "step") continue;
      const marked = it.mark != null;
      const isNext = Boolean(it.is_next_step);
      if (!marked && !isNext) continue;
      const prev = prevMarks.get(it.label);
      const mark = (it.mark ?? null) as FeedbackMark;
      const change = marked ? changeOf(prev, mark) : null;
      marks.push({
        step: it.label,
        mark,
        markLabel:
          isNext && !marked
            ? "다음에 배울 단계"
            : resolveMarkLabel(mark, it.mark_label),
        change,
        stepComment: itemComment(it),
        isNextStep: isNext,
        isReinforce: isNext && marked,
      });
      if (marked) prevMarks.set(it.label, mark);
    }
    sessionCardsAsc.push({
      sessionNo: s._num,
      date: s.session_date,
      instructor: customerInstructorLabel(s.instructor_display_name),
      marks,
      daySummary:
        typeof s.day_summary === "string" && s.day_summary.trim()
          ? s.day_summary.trim()
          : null,
      nextFocus:
        typeof s.next_focus === "string" && s.next_focus.trim()
          ? s.next_focus.trim()
          : null,
      instructorNote:
        typeof s.instructor_note === "string" && s.instructor_note.trim()
          ? s.instructor_note.trim()
          : null,
      feedbackId: s.id,
      photos: safeFeedbackPhotos(s.photos),
    });
  }
  const sessionCards = sessionCardsAsc.slice().reverse();

  const stepRows = byStep.filter(
    (r): r is Extract<ByStepRow, { kind: "step" }> => r.kind === "step",
  );
  const canDoCount = stepRows.filter((r) => r.latestMark === "o").length;
  const totalSteps = stepRows.length;

  const nextSteps: NextStepChip[] = stepRows
    .filter((r) => r.isNextStep)
    .map((r) => ({ label: r.step, isReinforce: r.isReinforce }));

  const nextFocusText =
    newest && typeof newest.next_focus === "string" && newest.next_focus.trim()
      ? newest.next_focus.trim()
      : null;

  // 모든 단계 완료: 다음 체크가 없고, 모든 step에 표시 기록이 있음
  const allMarked = totalSteps > 0 && stepRows.every((r) => !r.neverMarked);
  const allStepsDone = allMarked && nextSteps.length === 0;

  const barSlots: StudentHistory["barSlots"] = stepRows.map((r) => {
    if (r.isNextStep && r.neverMarked) return "next";
    if (r.isNextStep && r.isReinforce) {
      // 보강: 표시 색 + 다음으로도 볼 수 있게 표시 우선
      if (r.latestMark === "o") return "o";
      if (r.latestMark === "triangle" || r.latestMark === "x") return "tx";
      return "next";
    }
    if (r.latestMark === "o") return "o";
    if (r.latestMark === "triangle" || r.latestMark === "x") return "tx";
    return "empty";
  });

  return {
    byStep,
    sessions: sessionCards,
    canDoCount,
    totalSteps,
    barSlots,
    nextSteps,
    nextFocusText,
    allStepsDone,
  };
}

function maskApiHistory(history: {
  byStep?: ByStepRow[];
  sessions?: HistorySessionCard[];
}): Pick<StudentHistory, "byStep" | "sessions"> | null {
  if (!history.byStep?.length && !history.sessions?.length) return null;
  return {
    byStep: (history.byStep ?? []).map((r) => {
      if (r.kind === "milestone") return r;
      return {
        ...r,
        records: (r.records ?? []).map((rec) => ({
          ...rec,
          instructor: customerInstructorLabel(rec.instructor),
          markLabel: rec.markLabel || defaultMarkLabel(rec.mark),
          stepComment: rec.stepComment ?? null,
        })),
        latestMark: r.latestMark ?? r.records?.[0]?.mark ?? null,
        markLabel:
          r.markLabel ||
          defaultMarkLabel(r.latestMark ?? r.records?.[0]?.mark ?? null),
        neverMarked: r.neverMarked ?? !(r.records && r.records.length),
        isNextStep: Boolean(r.isNextStep),
        isReinforce: Boolean(r.isReinforce),
      };
    }),
    sessions: (history.sessions ?? []).map((s) => ({
      ...s,
      instructor: customerInstructorLabel(s.instructor),
      daySummary: s.daySummary ?? null,
      photos: safeFeedbackPhotos(s.photos),
      marks: (s.marks ?? []).map((m) => ({
        ...m,
        markLabel: m.markLabel || defaultMarkLabel(m.mark),
        stepComment: m.stepComment ?? null,
        isNextStep: Boolean(m.isNextStep),
        isReinforce: Boolean(m.isReinforce),
      })),
    })),
  };
}

/**
 * history.byStep / sessions 가 있으면 강사만 마스킹해 쓰고,
 * 없으면 feedbacks 에서 파생. 요약 필드는 항상 feedbacks 기준으로 보강.
 */
export function resolveStudentHistory(
  student: FeedbackStudent,
  sportFilter?: "ski" | "board",
): StudentHistory {
  const fromFb = buildHistoryFromFeedbacks(student.feedbacks ?? [], sportFilter);
  const masked = student.history ? maskApiHistory(student.history) : null;
  if (!masked) return fromFb;

  // API history 가 옛 형태여도 요약은 feedbacks 파생값을 쓴다
  // 사진은 항상 feedbacks(회차) 기준으로 붙인다
  const photosById = new Map(
    (student.feedbacks ?? []).map((f) => [f.id, safeFeedbackPhotos(f.photos)]),
  );
  const sessions = masked.sessions.length ? masked.sessions : fromFb.sessions;
  return {
    ...fromFb,
    byStep: masked.byStep.length ? masked.byStep : fromFb.byStep,
    sessions: sessions.map((s) => ({
      ...s,
      photos: s.photos?.length ? s.photos : (photosById.get(s.feedbackId) ?? []),
    })),
  };
}
