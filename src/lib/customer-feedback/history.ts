import { normalizeSport } from "./display";
import { customerInstructorLabel } from "./instructor";
import type {
  FeedbackMark,
  FeedbackSession,
  FeedbackStudent,
  StepGroup,
} from "./types";

export type MarkChange =
  | "first"
  | `${"o" | "triangle" | "x"}->${"o" | "triangle" | "x"}`
  | null;

export type ByStepRecord = {
  sessionNo: number;
  date: string;
  /** 손님 UI에서는 항상 '담당 강사' */
  instructor: string;
  mark: FeedbackMark;
  change: MarkChange;
  nextFocus?: string | null;
  instructorNote?: string | null;
  feedbackId?: string;
};

export type ByStepRow =
  | {
      step: string;
      kind: "step";
      records: ByStepRecord[];
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
  change: MarkChange;
};

export type HistorySessionCard = {
  sessionNo: number;
  date: string;
  instructor: string;
  marks: SessionMarkRow[];
  nextFocus: string | null;
  instructorNote: string | null;
  feedbackId: string;
};

export type StudentHistory = {
  byStep: ByStepRow[];
  sessions: HistorySessionCard[];
};

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

/** feedbacks 로부터 v3.1 8-2 형태 이력을 만든다. */
export function buildHistoryFromFeedbacks(
  feedbacks: FeedbackSession[],
  sportFilter?: "ski" | "board",
): StudentHistory {
  const sessions = orderedSessions(feedbacks, sportFilter);
  const instructor = customerInstructorLabel();

  const sessionCards: HistorySessionCard[] = sessions.map((fb, i) => {
    const sessionNo = i + 1;
    const marks: SessionMarkRow[] = [];
    for (const item of fb.items ?? []) {
      if (item.kind !== "step") continue;
      if (item.mark == null) continue; // 평가 안 한 단계는 줄 없음
      // prev mark from earlier sessions
      let prev: FeedbackMark | undefined;
      for (let j = i - 1; j >= 0; j--) {
        const earlier = sessions[j]!;
        const hit = (earlier.items ?? []).find(
          (it) => it.kind === "step" && it.label === item.label && it.mark != null,
        );
        if (hit) {
          prev = hit.mark;
          break;
        }
      }
      marks.push({
        step: item.label,
        mark: item.mark,
        change: changeOf(prev, item.mark),
      });
    }
    return {
      sessionNo,
      date: fb.session_date,
      instructor,
      marks,
      nextFocus: fb.next_focus,
      instructorNote: fb.instructor_note,
      feedbackId: fb.id,
    };
  });

  // byStep order from first appearance across sessions
  const order: Array<{ step: string; kind: "step" | "milestone" }> = [];
  const seen = new Set<string>();
  for (const fb of sessions) {
    for (const item of fb.items ?? []) {
      const kind = item.kind === "milestone" ? "milestone" : "step";
      const key = `${kind}::${item.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      order.push({ step: item.label, kind });
    }
  }

  const byStep: ByStepRow[] = order.map((o) => {
    if (o.kind === "milestone") {
      return { step: o.step, kind: "milestone", remaining: null };
    }
    const records: ByStepRecord[] = [];
    let prevMark: FeedbackMark | undefined;
    for (const card of sessionCards) {
      const m = card.marks.find((x) => x.step === o.step);
      if (!m) continue;
      records.push({
        sessionNo: card.sessionNo,
        date: card.date,
        instructor,
        mark: m.mark,
        change: changeOf(prevMark, m.mark),
        nextFocus: card.nextFocus,
        instructorNote: card.instructorNote,
        feedbackId: card.feedbackId,
      });
      prevMark = m.mark;
    }
    return { step: o.step, kind: "step", records };
  });

  return { byStep, sessions: sessionCards };
}

/** step_groups API 가 있으면 변환, 없으면 feedbacks 파생. 강사명은 항상 마스킹. */
export function resolveStudentHistory(
  student: FeedbackStudent,
  sportFilter?: "ski" | "board",
): StudentHistory {
  if (student.history?.byStep || student.history?.sessions) {
    return maskHistory(student.history, sportFilter);
  }
  if (Array.isArray(student.step_groups) && student.step_groups.length > 0) {
    return historyFromStepGroups(student.step_groups, sportFilter);
  }
  return buildHistoryFromFeedbacks(student.feedbacks ?? [], sportFilter);
}

function maskHistory(
  history: Partial<StudentHistory>,
  sportFilter?: "ski" | "board",
): StudentHistory {
  void sportFilter;
  const instructor = customerInstructorLabel();
  const byStep = (history.byStep ?? []).map((row) => {
    if (row.kind === "milestone") return row;
    return {
      ...row,
      records: (row.records ?? []).map((r) => ({
        ...r,
        instructor,
      })),
    };
  });
  const sessions = (history.sessions ?? []).map((s) => ({
    ...s,
    instructor,
  }));
  return { byStep, sessions };
}

function historyFromStepGroups(
  groups: StepGroup[],
  sportFilter?: "ski" | "board",
): StudentHistory {
  const filtered = groups.filter((g) => {
    if (!sportFilter) return true;
    return normalizeSport(g.sport) === sportFilter || !g.sport;
  });
  // synthesize feedbacks-like sessions from rounds
  const byId = new Map<
    string,
    { date: string; nextFocus: string | null; note: string | null; items: Array<{ label: string; kind: "step"; mark: FeedbackMark }> }
  >();
  for (const g of filtered) {
    if (g.kind !== "step") continue;
    for (const r of g.rounds ?? []) {
      if (r.mark == null) continue;
      const cur = byId.get(r.feedback_id) ?? {
        date: r.session_date,
        nextFocus: r.next_focus,
        note: r.instructor_note,
        items: [],
      };
      cur.items.push({ label: g.label, kind: "step", mark: r.mark });
      byId.set(r.feedback_id, cur);
    }
  }
  const feedbacks: FeedbackSession[] = Array.from(byId.entries())
    .map(([id, v]) => ({
      id,
      session_date: v.date,
      sport: sportFilter || "ski",
      instructor_display_name: customerInstructorLabel(),
      items: [
        ...filtered
          .filter((g) => g.kind === "milestone")
          .map((g) => ({ label: g.label, kind: "milestone" as const, mark: null })),
        ...v.items,
      ],
      next_focus: v.nextFocus,
      instructor_note: v.note,
    }))
    .sort((a, b) => a.session_date.localeCompare(b.session_date));

  // Prefer byStep order from groups, rebuild via feedbacks for change calc
  const built = buildHistoryFromFeedbacks(feedbacks, sportFilter);
  // Reorder byStep to match group order (milestones included)
  const byLabel = new Map(built.byStep.map((r) => [r.step, r]));
  const ordered: ByStepRow[] = [];
  for (const g of filtered) {
    if (g.kind === "milestone") {
      ordered.push({ step: g.label, kind: "milestone", remaining: null });
      continue;
    }
    const row = byLabel.get(g.label);
    if (row && row.kind === "step" && row.records.length > 0) ordered.push(row);
  }
  return { byStep: ordered, sessions: built.sessions };
}

/** "지난 회차보다 ○ 2개 늘었어요" */
export function progressCompareSummary(history: StudentHistory): string | null {
  const sessions = history.sessions;
  if (sessions.length < 2) {
    if (sessions.length === 1) {
      const o = sessions[0]!.marks.filter((m) => m.mark === "o").length;
      return o > 0 ? `이번 회차에서 ○ ${o}개를 기록했어요` : "첫 피드백이 도착했어요";
    }
    return null;
  }
  const latest = sessions[sessions.length - 1]!;
  const prev = sessions[sessions.length - 2]!;
  const delta =
    latest.marks.filter((m) => m.mark === "o").length -
    prev.marks.filter((m) => m.mark === "o").length;
  if (delta > 0) return `지난 회차보다 ○ ${delta}개 늘었어요`;
  if (delta < 0) return `지난 회차보다 ○ ${Math.abs(delta)}개 줄었어요`;
  const improved = latest.marks.filter(
    (m) => m.change && m.change !== "first" && m.change.endsWith("->o"),
  ).length;
  if (improved > 0) return `지난 회차보다 ○로 오른 단계가 ${improved}개 있어요`;
  return "지난 회차와 ○ 개수가 같아요";
}

export function formatChangeLabel(change: MarkChange): string | null {
  if (!change) return null;
  if (change === "first") return "첫 평가";
  const [a, b] = change.split("->");
  const sym = (m: string) =>
    m === "o" ? "○" : m === "triangle" ? "△" : m === "x" ? "✕" : m;
  return `${sym(a!)} → ${sym(b!)}`;
}
