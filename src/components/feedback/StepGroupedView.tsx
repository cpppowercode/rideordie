"use client";

import { useState } from "react";
import {
  formatSessionDate,
  markLabel,
  markSymbol,
} from "@/lib/customer-feedback/display";
import { INSTRUCTOR_PUBLIC_LABEL } from "@/lib/customer-feedback/instructor";
import { markChanged } from "@/lib/customer-feedback/step-groups";
import type { FeedbackMark, StepGroup, StepRound } from "@/lib/customer-feedback/types";

function markClass(mark: FeedbackMark): string {
  if (mark === "o") return "fb-mark-o";
  if (mark === "triangle") return "fb-mark-triangle";
  if (mark === "x") return "fb-mark-x";
  return "fb-mark-null";
}

function RoundCard({
  round,
  prevMark,
  isLatest,
  defaultOpen,
}: {
  round: StepRound;
  prevMark: FeedbackMark | undefined;
  isLatest: boolean;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const changed =
    prevMark !== undefined && markChanged(prevMark, round.mark);

  return (
    <article
      className={`rounded-[var(--fb-radius-sm)] border px-3 py-3 ${
        isLatest
          ? "border-[var(--fb-brand)] bg-[var(--fb-brand-25)] shadow-[var(--fb-shadow-sm)]"
          : "border-[var(--fb-border-subtle)] bg-white"
      }`}
      data-latest={isLatest ? "true" : "false"}
    >
      <button
        type="button"
        className="flex w-full items-start gap-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span
          className={`mt-0.5 inline-flex min-w-8 justify-center text-[20px] font-semibold ${markClass(round.mark)}`}
          title={markLabel(round.mark)}
        >
          {markSymbol(round.mark)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-semibold text-[var(--fb-text)]">
              {round.round}회차
            </span>
            {isLatest ? (
              <span className="rounded-md bg-[var(--fb-brand)] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                최신
              </span>
            ) : null}
            {changed ? (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-[var(--fb-warning-bg)] px-1.5 py-0.5 text-[12px] font-semibold text-[var(--fb-warning)]"
                data-testid="mark-change"
              >
                <span className={markClass(prevMark!)}>{markSymbol(prevMark!)}</span>
                <span aria-hidden>→</span>
                <span className={markClass(round.mark)}>{markSymbol(round.mark)}</span>
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[12px] text-[var(--fb-text-secondary)]">
            {formatSessionDate(round.session_date)} · {INSTRUCTOR_PUBLIC_LABEL}
          </p>
        </div>
        <span className="text-[12px] text-[var(--fb-text-tertiary)]">
          {open ? "접기" : "펼치기"}
        </span>
      </button>

      {open ? (
        <div className="mt-3 space-y-2 border-t border-[var(--fb-border-subtle)] pt-3">
          {round.next_focus?.trim() ? (
            <div>
              <p className="text-[12px] font-semibold text-[var(--fb-brand)]">
                다음에 배울 것
              </p>
              <p className="mt-0.5 text-[14px] leading-relaxed text-[var(--fb-text)]">
                {round.next_focus}
              </p>
            </div>
          ) : null}
          {round.instructor_note?.trim() ? (
            <div>
              <p className="text-[12px] font-semibold text-[var(--fb-text-secondary)]">
                강사 의견
              </p>
              <p className="mt-0.5 text-[14px] leading-relaxed text-[var(--fb-text)]">
                {round.instructor_note}
              </p>
            </div>
          ) : null}
          {!round.next_focus?.trim() && !round.instructor_note?.trim() ? (
            <p className="text-[13px] text-[var(--fb-text-tertiary)]">
              이 회차의 추가 메모는 없습니다.
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function StepBlock({ group }: { group: StepGroup }) {
  if (group.kind === "milestone") {
    return (
      <div className="fb-milestone" role="separator" aria-label={group.label}>
        <div className="fb-milestone-bar" aria-hidden />
        <div className="fb-milestone-label">] {group.label}</div>
      </div>
    );
  }

  if (!group.rounds.length) return null;

  const latestRound = group.rounds[group.rounds.length - 1]!;
  // 최신만 기본 펼침, 이전이 많으면 접힌 상태
  const collapseOlder = group.rounds.length > 1;

  return (
    <section className="fb-card space-y-3 p-4" data-step-label={group.label}>
      <h3 className="text-[16px] font-semibold tracking-tight text-[var(--fb-text)]">
        {group.label}
      </h3>
      <div className="space-y-2">
        {[...group.rounds].reverse().map((round, revIdx) => {
          const idx = group.rounds.length - 1 - revIdx;
          const prev = idx > 0 ? group.rounds[idx - 1]!.mark : undefined;
          const isLatest = round.feedback_id === latestRound.feedback_id &&
            round.round === latestRound.round;
          return (
            <RoundCard
              key={`${round.feedback_id}-${round.round}`}
              round={round}
              prevMark={prev}
              isLatest={isLatest}
              defaultOpen={isLatest || !collapseOlder}
            />
          );
        })}
      </div>
    </section>
  );
}

export function StepGroupedView({ groups }: { groups: StepGroup[] }) {
  const visible = groups.filter(
    (g) => g.kind === "milestone" || g.rounds.length > 0,
  );
  if (!visible.length) {
    return (
      <p className="fb-card p-4 text-[14px] text-[var(--fb-text-secondary)]">
        이 종목의 피드백이 아직 없습니다.
      </p>
    );
  }
  return (
    <div className="space-y-3" data-testid="step-grouped-view">
      {visible.map((g, i) => (
        <StepBlock key={`${g.kind}-${g.label}-${i}`} group={g} />
      ))}
    </div>
  );
}
