import { normalizeSport } from "./display";
import type {
  FeedbackMark,
  FeedbackSession,
  FeedbackStudent,
  StepGroup,
  StepRound,
} from "./types";

export function markChanged(
  prev: FeedbackMark,
  next: FeedbackMark,
): boolean {
  return prev !== next;
}

/**
 * feedbacks → 단계별 회차 묶음.
 * 어드민이 step_groups 를 주면 그걸 쓰고, 없으면 파생한다.
 */
export function resolveStepGroups(
  student: FeedbackStudent,
  sportFilter?: "ski" | "board",
): StepGroup[] {
  const raw = Array.isArray(student.step_groups) ? student.step_groups : null;
  if (raw && raw.length > 0) {
    return raw
      .filter((g) => {
        if (!sportFilter) return true;
        return normalizeSport(g.sport) === sportFilter || !g.sport;
      })
      .map(normalizeGroup)
      .filter(Boolean) as StepGroup[];
  }
  return buildStepGroupsFromFeedbacks(student.feedbacks ?? [], sportFilter);
}

function normalizeGroup(g: StepGroup): StepGroup | null {
  if (!g || typeof g.label !== "string" || !g.label.trim()) return null;
  const kind = g.kind === "milestone" ? "milestone" : "step";
  const rounds = Array.isArray(g.rounds)
    ? g.rounds
        .filter((r) => r && typeof r.session_date === "string")
        .map((r, i) => ({
          feedback_id: String(r.feedback_id ?? `r${i}`),
          round: Number(r.round) || i + 1,
          session_date: r.session_date,
          instructor_display_name: String(r.instructor_display_name ?? ""),
          mark: (r.mark ?? null) as FeedbackMark,
          next_focus: r.next_focus ?? null,
          instructor_note: r.instructor_note ?? null,
        }))
        .sort((a, b) =>
          a.session_date === b.session_date
            ? a.round - b.round
            : a.session_date.localeCompare(b.session_date),
        )
        .map((r, i) => ({ ...r, round: i + 1 }))
    : [];
  return {
    code: g.code ?? null,
    label: g.label.trim(),
    kind,
    sport: g.sport || "",
    rounds,
  };
}

export function buildStepGroupsFromFeedbacks(
  feedbacks: FeedbackSession[],
  sportFilter?: "ski" | "board",
): StepGroup[] {
  const sessions = feedbacks
    .slice()
    .filter((fb) => {
      if (!sportFilter) return true;
      return normalizeSport(fb.sport) === sportFilter;
    })
    .sort((a, b) => a.session_date.localeCompare(b.session_date));

  // label+kind 순서를 첫 등장 피드백의 items 순서로 유지
  const order: Array<{ key: string; label: string; kind: "step" | "milestone"; sport: string }> =
    [];
  const seen = new Set<string>();
  for (const fb of sessions) {
    for (const item of fb.items ?? []) {
      const kind = item.kind === "milestone" ? "milestone" : "step";
      const key = `${kind}::${item.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      order.push({ key, label: item.label, kind, sport: fb.sport });
    }
  }

  const roundsByKey = new Map<string, StepRound[]>();
  for (const fb of sessions) {
    for (const item of fb.items ?? []) {
      const kind = item.kind === "milestone" ? "milestone" : "step";
      if (kind === "milestone") continue;
      const key = `${kind}::${item.label}`;
      const list = roundsByKey.get(key) ?? [];
      list.push({
        feedback_id: fb.id,
        round: list.length + 1,
        session_date: fb.session_date,
        instructor_display_name: fb.instructor_display_name,
        mark: item.mark ?? null,
        next_focus: fb.next_focus,
        instructor_note: fb.instructor_note,
      });
      roundsByKey.set(key, list);
    }
  }

  return order.map((o) => ({
    code: null,
    label: o.label,
    kind: o.kind,
    sport: o.sport,
    rounds: o.kind === "milestone" ? [] : roundsByKey.get(o.key) ?? [],
  }));
}
