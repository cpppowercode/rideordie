"use client";

import { useState } from "react";
import {
  formatSessionDate,
  markLabel,
  markSymbol,
} from "@/lib/customer-feedback/display";
import {
  formatChangeLabel,
  progressCompareSummary,
  type ByStepRecord,
  type ByStepRow,
  type HistorySessionCard,
  type StudentHistory,
} from "@/lib/customer-feedback/history";
import { INSTRUCTOR_PUBLIC_LABEL } from "@/lib/customer-feedback/instructor";
import type { FeedbackMark } from "@/lib/customer-feedback/types";

function markClass(mark: FeedbackMark): string {
  if (mark === "o") return "fb-mark-o";
  if (mark === "triangle") return "fb-mark-triangle";
  if (mark === "x") return "fb-mark-x";
  return "fb-mark-null";
}

function ChangeBadge({ change }: { change: ByStepRecord["change"] }) {
  const label = formatChangeLabel(change);
  if (!label) return null;
  const first = change === "first";
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[12px] font-semibold ${
        first
          ? "bg-[var(--fb-brand-subtle)] text-[var(--fb-brand)]"
          : "bg-[var(--fb-warning-bg)] text-[var(--fb-warning)]"
      }`}
      data-testid={first ? "first-eval" : "mark-change"}
    >
      {label}
    </span>
  );
}

function ByStepRecordRow({ record }: { record: ByStepRecord }) {
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--fb-border-subtle)] py-2.5 first:border-t-0">
      <span className="text-[13px] font-semibold text-[var(--fb-text)]">
        {record.sessionNo}회차
      </span>
      <span className="text-[12px] text-[var(--fb-text-secondary)]">
        {formatSessionDate(record.date)}
      </span>
      <span className="text-[12px] text-[var(--fb-text-tertiary)]">
        {INSTRUCTOR_PUBLIC_LABEL}
      </span>
      <span
        className={`text-[16px] font-semibold ${markClass(record.mark)}`}
        title={markLabel(record.mark)}
      >
        {markSymbol(record.mark)} {markLabel(record.mark)}
      </span>
      <ChangeBadge change={record.change} />
    </li>
  );
}

function ByStepBlock({ row }: { row: ByStepRow }) {
  if (row.kind === "milestone") {
    return (
      <div className="fb-milestone" role="separator" aria-label={row.step}>
        <div className="fb-milestone-bar" aria-hidden />
        <div className="fb-milestone-label">] {row.step}</div>
      </div>
    );
  }
  if (!row.records.length) return null;
  return (
    <section className="fb-card p-4" data-step-label={row.step}>
      <h3 className="text-[16px] font-semibold text-[var(--fb-text)]">{row.step}</h3>
      <ul className="mt-1">
        {row.records.map((r) => (
          <ByStepRecordRow key={`${r.feedbackId}-${r.sessionNo}`} record={r} />
        ))}
      </ul>
    </section>
  );
}

function SessionCard({
  session,
  isLatest,
  defaultOpen,
}: {
  session: HistorySessionCard;
  isLatest: boolean;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <article
      className={`fb-card overflow-hidden ${
        isLatest ? "border-[var(--fb-brand)] shadow-[var(--fb-shadow-sm)]" : ""
      }`}
      data-session-no={session.sessionNo}
      data-latest={isLatest ? "true" : "false"}
    >
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold text-[var(--fb-text)]">
              {session.sessionNo}회차
            </span>
            {isLatest ? (
              <span className="rounded-md bg-[var(--fb-brand)] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                최신
              </span>
            ) : null}
            <span className="text-[12px] text-[var(--fb-text-secondary)]">
              {formatSessionDate(session.date)}
            </span>
            <span className="text-[12px] text-[var(--fb-text-tertiary)]">
              {INSTRUCTOR_PUBLIC_LABEL}
            </span>
          </div>
        </div>
        <span className="text-[12px] text-[var(--fb-text-tertiary)]">
          {open ? "접기" : "펼치기"}
        </span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-[var(--fb-border-subtle)] px-4 py-3">
          <ul className="space-y-1.5">
            {session.marks.map((m) => (
              <li
                key={m.step}
                className="flex flex-wrap items-center gap-2 text-[14px]"
              >
                <span className={`font-semibold ${markClass(m.mark)}`}>
                  {markSymbol(m.mark)}
                </span>
                <span className="text-[var(--fb-text)]">{m.step}</span>
                <ChangeBadge change={m.change} />
              </li>
            ))}
          </ul>
          {session.nextFocus?.trim() ? (
            <div>
              <p className="text-[12px] font-semibold text-[var(--fb-brand)]">
                다음에 배울 것
              </p>
              <p className="mt-0.5 text-[14px] text-[var(--fb-text)]">{session.nextFocus}</p>
            </div>
          ) : null}
          {session.instructorNote?.trim() ? (
            <div>
              <p className="text-[12px] font-semibold text-[var(--fb-text-secondary)]">
                강사 의견
              </p>
              <p className="mt-0.5 text-[14px] text-[var(--fb-text)]">
                {session.instructorNote}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function HistoryViews({ history }: { history: StudentHistory }) {
  const [tab, setTab] = useState<"byStep" | "sessions">("byStep");
  const summary = progressCompareSummary(history);
  const sessionsNewestFirst = [...history.sessions].reverse();

  return (
    <div className="space-y-3" data-testid="history-views">
      {summary ? (
        <p
          className="rounded-[var(--fb-radius-sm)] bg-[var(--fb-brand-25)] px-3 py-2.5 text-[14px] font-medium text-[var(--fb-brand)]"
          data-testid="history-summary"
        >
          {summary}
        </p>
      ) : null}

      <div className="fb-sport-toggle w-full" role="tablist" aria-label="이력 보기">
        <button
          type="button"
          role="tab"
          className="flex-1"
          aria-selected={tab === "byStep"}
          onClick={() => setTab("byStep")}
        >
          단계별
        </button>
        <button
          type="button"
          role="tab"
          className="flex-1"
          aria-selected={tab === "sessions"}
          onClick={() => setTab("sessions")}
        >
          회차별
        </button>
      </div>

      {tab === "byStep" ? (
        <div className="space-y-3" data-testid="view-by-step">
          {history.byStep.length === 0 ? (
            <p className="fb-card p-4 text-[14px] text-[var(--fb-text-secondary)]">
              이 종목의 피드백이 아직 없습니다.
            </p>
          ) : (
            history.byStep.map((row, i) => (
              <ByStepBlock key={`${row.kind}-${row.step}-${i}`} row={row} />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3" data-testid="view-by-session">
          {sessionsNewestFirst.length === 0 ? (
            <p className="fb-card p-4 text-[14px] text-[var(--fb-text-secondary)]">
              이 종목의 피드백이 아직 없습니다.
            </p>
          ) : (
            sessionsNewestFirst.map((s, i) => (
              <SessionCard
                key={s.feedbackId}
                session={s}
                isLatest={i === 0}
                defaultOpen={i === 0}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
