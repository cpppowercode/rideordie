/**
 * 회차 이력 · 첫 평가 · 강사 마스킹 · 보강/다음단계 단위 테스트.
 */
import assert from "node:assert/strict";
import {
  buildHistoryFromFeedbacks,
  formatChangeLabel,
  progressCompareSummary,
  resolveStudentHistory,
} from "./history";
import { customerInstructorLabel, INSTRUCTOR_PUBLIC_LABEL } from "./instructor";
import { markLabel } from "./display";
import type { FeedbackSession, FeedbackStudent } from "./types";

function session(
  id: string,
  date: string,
  instructor: string,
  marks: Array<[string, "o" | "triangle" | "x" | null, boolean?]>,
  extra?: Partial<FeedbackSession>,
): FeedbackSession {
  return {
    id,
    session_date: date,
    sport: "ski",
    instructor_display_name: instructor,
    items: marks.map(([label, mark, isNext]) => ({
      label,
      kind: "step" as const,
      mark,
      step_comment: mark ? `${label} 코멘트` : null,
      is_next_step: Boolean(isNext),
    })),
    day_summary: extra?.day_summary ?? "종합",
    next_focus: extra?.next_focus ?? "다음",
    instructor_note: extra?.instructor_note ?? "의견",
    ...extra,
  };
}

async function main() {
  assert.equal(INSTRUCTOR_PUBLIC_LABEL, "담당 강사");
  assert.equal(customerInstructorLabel("이강사"), "담당 강사");
  assert.equal(markLabel("o"), "할 수 있어요");
  assert.equal(markLabel("x"), "아직 어려워요");
  assert.equal(markLabel(null), "배우기 전");

  const feedbacks = [
    session("a", "2026-01-05", "이강사", [
      ["스노우플라우", "triangle"],
      ["스노우플라우턴", "x"],
    ]),
    session(
      "b",
      "2026-01-12",
      "이강사",
      [
        ["스노우플라우", "o"],
        ["스노우플라우턴", "triangle"],
        ["스템턴", "x"],
        ["패러렐", null, true],
      ],
      { next_focus: "패러렐 연습", day_summary: "좋아졌어요" },
    ),
  ];

  const history = buildHistoryFromFeedbacks(feedbacks, "ski");
  assert.equal(history.sessions.length, 2);
  assert.equal(history.sessions[0]!.instructor, "담당 강사");
  assert.equal(history.sessions[0]!.daySummary, "좋아졌어요");
  assert.ok(history.sessions[0]!.marks.every((m) => m.stepComment || m.mark == null || m.isNextStep));

  const plow = history.byStep.find((r) => r.kind === "step" && r.step === "스노우플라우");
  assert.ok(plow && plow.kind === "step");
  assert.equal(plow.records[0]!.change, "triangle->o"); // newest first after reverse... wait newest is first
  // records newest first: session b then a
  assert.equal(plow.records[0]!.sessionNo, 2);
  assert.equal(plow.records[0]!.change, "triangle->o");
  assert.equal(plow.records[1]!.change, "first");
  assert.equal(formatChangeLabel("first"), "첫 평가");
  assert.equal(formatChangeLabel("triangle->o"), "△ → ○");

  const parallel = history.byStep.find((r) => r.kind === "step" && r.step === "패러렐");
  assert.ok(parallel && parallel.kind === "step");
  assert.equal(parallel.isNextStep, true);
  assert.equal(parallel.neverMarked, true);
  assert.equal(history.nextSteps.length, 1);
  assert.equal(history.nextSteps[0]!.label, "패러렐");
  assert.equal(history.nextFocusText, "패러렐 연습");

  // reinforce: mark + is_next
  const reinforce = buildHistoryFromFeedbacks([
    session("r", "2026-02-01", "이강사", [
      ["패러렐", "triangle", true],
      ["베이직 숏턴", null, true],
    ], { next_focus: "" }),
  ]);
  assert.equal(reinforce.nextSteps.length, 2);
  assert.equal(reinforce.nextSteps.find((n) => n.label === "패러렐")!.isReinforce, true);
  assert.equal(reinforce.nextFocusText, null); // empty → names only in UI

  const summary = progressCompareSummary(history);
  assert.ok(summary && summary.includes("○"));

  const student: FeedbackStudent = {
    student_key: "s",
    display_name: "김민준",
    sport: "ski",
    is_junior_eligible: true,
    feedbacks,
    progress: null,
    history: {
      byStep: [
        {
          step: "스노우플라우",
          kind: "step",
          records: [
            {
              sessionNo: 1,
              date: "2026-01-05",
              instructor: "이강사",
              mark: "o",
              markLabel: "할 수 있어요",
              change: "first",
              stepComment: null,
            },
          ],
          latestMark: "o",
          markLabel: "할 수 있어요",
          neverMarked: false,
          isNextStep: false,
          isReinforce: false,
        },
      ],
      sessions: [
        {
          sessionNo: 1,
          date: "2026-01-05",
          instructor: "이강사",
          marks: [],
          daySummary: null,
          nextFocus: null,
          instructorNote: null,
          feedbackId: "a",
        },
      ],
    },
  };
  const resolved = resolveStudentHistory(student, "ski");
  assert.equal(resolved.sessions[0]!.instructor, "담당 강사");

  // mark 없는 행 코멘트는 이력에 안 넣음
  const noComment = buildHistoryFromFeedbacks([
    {
      id: "z",
      session_date: "2026-03-01",
      sport: "ski",
      instructor_display_name: "숨김",
      items: [
        {
          label: "스노우플라우",
          kind: "step",
          mark: null,
          step_comment: "나오면 안 됨",
          is_next_step: false,
        },
      ],
      day_summary: null,
      next_focus: null,
      instructor_note: null,
    },
  ]);
  const gray = noComment.byStep.find((r) => r.kind === "step");
  assert.ok(gray && gray.kind === "step");
  assert.equal(gray.neverMarked, true);
  assert.equal(gray.records.length, 0);

  console.log("history.test.ts OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
