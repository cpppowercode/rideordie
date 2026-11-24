import assert from "node:assert/strict";
import {
  buildStepGroupsFromFeedbacks,
  markChanged,
  resolveStepGroups,
} from "./step-groups";
import type { FeedbackStudent } from "./types";

assert.equal(markChanged("triangle", "o"), true);
assert.equal(markChanged("o", "o"), false);

const feedbacks = [
  {
    id: "a",
    session_date: "2026-01-05",
    sport: "ski",
    instructor_display_name: "이",
    items: [
      { label: "스노우플라우", kind: "step" as const, mark: "triangle" as const },
      { label: "레벨1 취득 도전", kind: "milestone" as const, mark: null },
      { label: "스노우플라우턴", kind: "step" as const, mark: "x" as const },
    ],
    next_focus: "플라우턴",
    instructor_note: "1회",
  },
  {
    id: "b",
    session_date: "2026-01-12",
    sport: "ski",
    instructor_display_name: "이",
    items: [
      { label: "스노우플라우", kind: "step" as const, mark: "o" as const },
      { label: "레벨1 취득 도전", kind: "milestone" as const, mark: null },
      { label: "스노우플라우턴", kind: "step" as const, mark: "triangle" as const },
    ],
    next_focus: "스템",
    instructor_note: "2회",
  },
];

const groups = buildStepGroupsFromFeedbacks(feedbacks);
assert.equal(groups[0]!.label, "스노우플라우");
assert.equal(groups[0]!.rounds.length, 2);
assert.equal(groups[0]!.rounds[0]!.mark, "triangle");
assert.equal(groups[0]!.rounds[1]!.mark, "o");
assert.equal(groups[0]!.rounds[1]!.round, 2);
assert.equal(groups[1]!.kind, "milestone");
assert.equal(groups[1]!.rounds.length, 0);

const student: FeedbackStudent = {
  student_key: "s",
  display_name: "김민준",
  sport: "ski",
  is_junior_eligible: true,
  feedbacks,
  progress: null,
  step_groups: [
    {
      label: "패러렐",
      kind: "step",
      sport: "ski",
      rounds: [
        {
          feedback_id: "x",
          round: 1,
          session_date: "2026-01-19",
          instructor_display_name: "이",
          mark: "o",
          next_focus: null,
          instructor_note: null,
        },
      ],
    },
  ],
};

const fromApi = resolveStepGroups(student, "ski");
assert.equal(fromApi.length, 1);
assert.equal(fromApi[0]!.label, "패러렐");

const derived = resolveStepGroups({ ...student, step_groups: undefined }, "ski");
assert.ok(derived.some((g) => g.label === "스노우플라우" && g.rounds.length === 2));

console.log("step-groups.test.ts: ok");
