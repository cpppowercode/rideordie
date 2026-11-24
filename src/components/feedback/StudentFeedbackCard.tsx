"use client";

import { useMemo, useState } from "react";
import {
  availableSports,
  filterFeedbacksBySport,
  givenNameOnly,
  latestFeedback,
  sportLabel,
  visibleBadges,
} from "@/lib/customer-feedback/display";
import type { FeedbackStudent } from "@/lib/customer-feedback/types";
import { BadgeRack } from "./BadgeRack";
import { FeedbackSessionView } from "./FeedbackSessionView";
import { JuniorGradeCard } from "./JuniorGradeCard";
import { ProgressSummary } from "./ProgressSummary";

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

  const latest = latestFeedback(sessions);
  const name = givenNameOnly(student.display_name);
  const showToggle = sports.length > 1;
  const badges = visibleBadges(student);

  return (
    <section className="space-y-3" data-student-key={student.student_key}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-[var(--fb-text)]">
            {name}
          </h2>
          <p className="text-[13px] text-[var(--fb-text-secondary)]">
            {sportLabel(student.sport)}
            {latest ? ` · 최근 ${latest.session_date}` : null}
          </p>
        </div>
        {showToggle ? (
          <div className="fb-sport-toggle" role="group" aria-label="종목 선택">
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

      {sessions.length > 1 && student.progress ? (
        <ProgressSummary progress={student.progress} />
      ) : null}

      {student.is_junior_eligible ? (
        <JuniorGradeCard progress={student.progress} />
      ) : null}

      <div className="space-y-3">
        {sessions.length === 0 ? (
          <p className="fb-card p-4 text-[14px] text-[var(--fb-text-secondary)]">
            이 종목의 피드백이 아직 없습니다.
          </p>
        ) : (
          [...sessions].reverse().map((session) => (
            <FeedbackSessionView key={session.id} session={session} />
          ))
        )}
      </div>
    </section>
  );
}
