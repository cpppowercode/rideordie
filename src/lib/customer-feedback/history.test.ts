/**
 * 회차 이력 · 첫 평가 · 강사 마스킹 단위 테스트.
 */
import assert from "node:assert/strict";
import {
  buildHistoryFromFeedbacks,
  formatChangeLabel,
  progressCompareSummary,
  resolveStudentHistory,
} from "./history";
import { customerInstructorLabel, INSTRUCTOR_PUBLIC_LABEL } from "./instructor";
import type { FeedbackSession, FeedbackStudent } from "./types";

function session(
  id: string,
  date: string,
  instructor: string,
  marks: Array<[string, "o" | "triangle" | "x"]>,
): FeedbackSession {
  return {
    id,
    session_date: date,
    sport: "ski",
    instructor_display_name: instructor,
    items: marks.map(([label, mark]) => ({
      label,
      kind: "step" as const,
      mark,
    })),
    next_focus: null,
    instructor_note: null,
  };
}

async function main() {
  assert.equal(INSTRUCTOR_PUBLIC_LABEL, "담당 강사");
  assert.equal(customerInstructorLabel("이강사"), "담당 강사");
  assert.equal(customerInstructorLabel(null), "담당 강사");

  const feedbacks = [
    session("a", "2026-01-05", "이강사", [
      ["스노우플라우", "triangle"],
      ["스노우플라우턴", "x"],
    ]),
    session("b", "2026-01-12", "이강사", [
      ["스노우플라우", "o"],
      ["스노우플라우턴", "triangle"],
      ["스템턴(전)", "x"],
    ]),
  ];

  const history = buildHistoryFromFeedbacks(feedbacks, "ski");
  assert.equal(history.sessions.length, 2);
  assert.equal(history.sessions[0]!.instructor, "담당 강사");
  assert.equal(history.sessions[1]!.instructor, "담당 강사");

  const plow = history.byStep.find((r) => r.kind === "step" && r.step === "스노우플라우");
  assert.ok(plow && plow.kind === "step");
  assert.equal(plow.records[0]!.change, "first");
  assert.equal(plow.records[0]!.instructor, "담당 강사");
  assert.equal(plow.records[1]!.change, "triangle->o");
  assert.equal(formatChangeLabel("first"), "첫 평가");
  assert.equal(formatChangeLabel("triangle->o"), "△ → ○");

  const summary = progressCompareSummary(history);
  assert.ok(summary && summary.includes("○"));

  // API history 에 실명이 와도 마스킹
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
              change: "first",
            },
          ],
        },
      ],
      sessions: [
        {
          sessionNo: 1,
          date: "2026-01-05",
          instructor: "이강사",
          marks: [{ step: "스노우플라우", mark: "o", change: "first" }],
          nextFocus: null,
          instructorNote: null,
          feedbackId: "a",
        },
      ],
    },
  };
  const masked = resolveStudentHistory(student, "ski");
  assert.equal(masked.sessions[0]!.instructor, "담당 강사");
  assert.ok(masked.byStep[0]!.kind === "step");
  if (masked.byStep[0]!.kind === "step") {
    assert.equal(masked.byStep[0]!.records[0]!.instructor, "담당 강사");
  }

  // 직명 문자열이 손님 라벨로 절대 남아있지 않음
  const blob = JSON.stringify(masked);
  assert.ok(!blob.includes("이강사"));
  assert.ok(blob.includes("담당 강사"));

  console.log("history.test.ts: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
