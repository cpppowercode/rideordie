"use client";

import { useMemo, useState } from "react";
import {
  availableSports,
  filterFeedbacksBySport,
  formatSessionDate,
  givenNameOnly,
  latestFeedback,
  sportLabel,
  visibleBadges,
} from "@/lib/customer-feedback/display";
import { resolveStudentHistory } from "@/lib/customer-feedback/history";
import type { FeedbackStudent } from "@/lib/customer-feedback/types";
import { BadgeRack } from "./BadgeRack";
import { HistoryViews } from "./HistoryViews";
import { JuniorGradeCard } from "./JuniorGradeCard";

type StudentFeedbackCardProps = {
  student: FeedbackStudent;
};

export function StudentFeedbackCard({ student }: StudentFeedbackCardProps) {
  const sports = useMemo(() => availableSports(student), [student]);
  const [sport, setSport] = useState<"ski" | "board">(
    () => sports[0] ?? "ski",
  );

  const activeSport = sports.includes(sport) ? sport : sports[0] ?? "ski";
  const sessions =
    sports.length > 0
      ? filterFeedbacksBySport(student.feedbacks, activeSport)
      : student.feedbacks
          .slice()
          .sort((a, b) => a.session_date.localeCompare(b.session_date));

  const history = useMemo(
    () =>
      resolveStudentHistory(
        student,
        sports.length > 0 ? activeSport : undefined,
      ),
    [student, sports.length, activeSport],
  );

  const latest = latestFeedback(sessions);
  const name = givenNameOnly(student.display_name);
  const showToggle = sports.length > 1;
  const badges = visibleBadges(student);

  return (
    <div className="customer" data-student-key={student.student_key}>
      <div className="head">
        <h1>
          {name} {sportLabel(activeSport)} 기록
        </h1>
        <dl className="meta">
          {latest ? (
            <div>
              <dt>최근 강습</dt>
              <dd>{formatSessionDate(latest.session_date).replace(/\s/g, "")}</dd>
            </div>
          ) : null}
          <div>
            <dt>기록</dt>
            <dd>{sessions.length}회</dd>
          </div>
        </dl>
        {showToggle ? (
          <div
            className="toggle"
            role="group"
            aria-label="종목 선택"
            style={{ marginTop: "var(--space-sm)" }}
          >
            {sports.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={activeSport === s}
                onClick={() => setSport(s)}
              >
                {sportLabel(s)}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <BadgeRack badges={badges} />

      {student.is_junior_eligible ? (
        <JuniorGradeCard progress={student.progress} />
      ) : null}

      <HistoryViews history={history} />
    </div>
  );
}
