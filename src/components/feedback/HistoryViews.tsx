"use client";

import { useId, useState } from "react";
import {
  ALL_STEPS_DONE_LABEL,
  formatSessionDate,
  REINFORCE_BADGE_LABEL,
} from "@/lib/customer-feedback/display";
import {
  formatChangeLabel,
  type ByStepRecord,
  type ByStepRow,
  type HistorySessionCard,
  type StudentHistory,
} from "@/lib/customer-feedback/history";
import { INSTRUCTOR_PUBLIC_LABEL } from "@/lib/customer-feedback/instructor";
import { CommentFold } from "./CommentFold";
import { MarkGlyph } from "./MarkGlyph";
import { SessionPhotos } from "./SessionPhotos";

function shortDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return iso;
  return `${m[2]}.${m[3]}`;
}

function weekdayKo(iso: string): string {
  const d = new Date(`${iso.trim()}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return ["일", "월", "화", "수", "목", "금", "토"][d.getDay()] ?? "";
}

function ChangeTag({ change }: { change: ByStepRecord["change"] }) {
  const label = formatChangeLabel(change);
  if (!label) return null;
  return <span className="chg-tag">{label}</span>;
}

function SummaryBlock({ history }: { history: StudentHistory }) {
  const cols = Math.max(history.totalSteps, 1);
  const showNextWell = history.nextSteps.length > 0;

  return (
    <section className="sum" aria-labelledby="fb-sum-h">
      <h2 id="fb-sum-h" className="visually-hidden">
        요약
      </h2>
      <div className="sum__fig">
        <span className="big">{history.canDoCount}</span>
        <span className="note">
          {history.totalSteps}단계 중 할 수 있는 단계
        </span>
      </div>
      <div
        className="bars"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        aria-hidden="true"
      >
        {history.barSlots.map((slot, i) => (
          <span
            key={i}
            className={
              slot === "o"
                ? "b-o"
                : slot === "tx"
                  ? "b-t"
                  : slot === "next"
                    ? "b-next"
                    : undefined
            }
          />
        ))}
      </div>

      {history.allStepsDone ? (
        <div className="nextwell" data-testid="all-steps-done">
          <span className="done">{ALL_STEPS_DONE_LABEL}</span>
          <p>자율활강까지 표시가 있어서 미리 체크할 다음 단계가 없어요.</p>
        </div>
      ) : null}

      {showNextWell ? (
        <div className="nextwell" data-testid="next-well">
          <span className="nexttag">다음에 배울 단계</span>
          {history.nextSteps.map((n) => (
            <strong key={n.label}>
              {n.label}
              {n.isReinforce ? (
                <>
                  {" "}
                  <span className="again">{REINFORCE_BADGE_LABEL}</span>
                </>
              ) : null}
            </strong>
          ))}
          {history.nextFocusText ? (
            <p className="fb-say-long">{history.nextFocusText}</p>
          ) : null}
        </div>
      ) : null}

      <dl className="legend">
        <div>
          <dt>
            <MarkGlyph mark="o" />
          </dt>
        </div>
        <div>
          <dt>
            <MarkGlyph mark="triangle" />
          </dt>
        </div>
        <div>
          <dt>
            <MarkGlyph mark="x" />
          </dt>
        </div>
        <div>
          <dt>
            <span className="sw sw--next" />
          </dt>
          <dd>다음에 배울 단계</dd>
        </div>
        <div>
          <dt>
            <span className="sw sw--gray" />
          </dt>
          <dd>아직 배우지 않은 단계</dd>
        </div>
      </dl>
    </section>
  );
}

function ByStepBlock({
  row,
  nextFocusText,
}: {
  row: Extract<ByStepRow, { kind: "step" }>;
  nextFocusText: string | null;
}) {
  if (row.neverMarked && row.isNextStep) {
    return (
      <li className="step step--next" data-step-label={row.step}>
        <div className="step__top">
          <span className="step__name">{row.step}</span>
          <MarkGlyph mark={null} variant="next" />
        </div>
        {nextFocusText ? <p className="say fb-say-long">{nextFocusText}</p> : null}
      </li>
    );
  }

  if (row.neverMarked) {
    return (
      <li className="step step--gray" data-step-label={row.step}>
        <div className="step__top">
          <span className="step__name">{row.step}</span>
          <MarkGlyph mark={null} variant="none" />
        </div>
      </li>
    );
  }

  const again = row.isReinforce;
  return (
    <li
      className={`step${again ? " step--again" : ""}`}
      data-step-label={row.step}
    >
      <div className="step__top">
        <span className="step__name">{row.step}</span>
        <span style={{ display: "inline-flex", gap: "var(--space-xs)", alignItems: "center" }}>
          {again ? <span className="again">{REINFORCE_BADGE_LABEL}</span> : null}
          <MarkGlyph mark={row.latestMark} label={row.markLabel} />
        </span>
      </div>
      <ul className="hist">
        {row.records.map((r) => (
          <li key={`${r.feedbackId ?? r.date}-${r.sessionNo}`}>
            <div className="hist__line">
              <time dateTime={r.date}>{shortDate(r.date)}</time>
              <span>{r.sessionNo}회차</span>
              <MarkGlyph mark={r.mark} label={r.markLabel} />
              <ChangeTag change={r.change} />
            </div>
            <CommentFold text={r.stepComment} />
          </li>
        ))}
      </ul>
    </li>
  );
}

function SessionArticle({ session }: { session: HistorySessionCard }) {
  const wd = weekdayKo(session.date);
  const dateLabel = wd
    ? `${formatSessionDate(session.date).replace(/\s/g, "")} (${wd})`
    : formatSessionDate(session.date);

  return (
    <article className="sess" data-session={session.feedbackId}>
      <div className="sess__head">
        <h2>{session.sessionNo}회차</h2>
        <time className="when" dateTime={session.date}>
          {dateLabel}
        </time>
        <span className="who">{INSTRUCTOR_PUBLIC_LABEL}</span>
      </div>

      {session.daySummary ? (
        <div className="overall" data-testid="day-summary">
          <h3>그날 종합 피드백</h3>
          <p className="fb-say-long">{session.daySummary}</p>
        </div>
      ) : null}

      {session.nextFocus ? (
        <div className="sub sub--next">
          <h3>다음에 배울 것</h3>
          <p className="say fb-say-long">{session.nextFocus}</p>
        </div>
      ) : null}

      {session.instructorNote ? (
        <div className="sub">
          <h3>강사 의견</h3>
          <p className="say fb-say-long">{session.instructorNote}</p>
        </div>
      ) : null}

      {session.photos?.length ? (
        <SessionPhotos photos={session.photos} label={`${session.sessionNo}회차`} />
      ) : null}

      <div className="sub">
        <h3>이날 배운 단계</h3>
        <ul className="daylist">
          {session.marks.map((m) => (
            <li key={m.step}>
              <div className="row">
                <span className="nm">{m.step}</span>
                <span
                  style={{
                    display: "inline-flex",
                    gap: "var(--space-xs)",
                    alignItems: "center",
                  }}
                >
                  {m.isReinforce ? (
                    <span className="again">{REINFORCE_BADGE_LABEL}</span>
                  ) : null}
                  <ChangeTag change={m.change} />
                  {m.mark == null && m.isNextStep ? (
                    <MarkGlyph mark={null} variant="next" />
                  ) : (
                    <MarkGlyph mark={m.mark} label={m.markLabel} />
                  )}
                </span>
              </div>
              <CommentFold text={m.stepComment} />
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

type HistoryViewsProps = {
  history: StudentHistory;
};

export function HistoryViews({ history }: HistoryViewsProps) {
  const baseId = useId();
  const [tab, setTab] = useState<"step" | "date">("step");
  const t1 = `${baseId}-t1`;
  const t2 = `${baseId}-t2`;
  const p1 = `${baseId}-p1`;
  const p2 = `${baseId}-p2`;

  const pick = (next: "step" | "date") => setTab(next);

  return (
    <div data-testid="history-views">
      <SummaryBlock history={history} />

      <div className="tabs" data-switch>
        <div className="toggle toggle--wide" role="tablist" aria-label="보기">
          <button
            role="tab"
            type="button"
            id={t1}
            aria-controls={p1}
            aria-selected={tab === "step"}
            tabIndex={tab === "step" ? 0 : -1}
            onClick={() => pick("step")}
            onKeyDown={(ev) => {
              if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
                ev.preventDefault();
                pick("date");
              }
            }}
          >
            단계별
          </button>
          <button
            role="tab"
            type="button"
            id={t2}
            aria-controls={p2}
            aria-selected={tab === "date"}
            tabIndex={tab === "date" ? 0 : -1}
            onClick={() => pick("date")}
            onKeyDown={(ev) => {
              if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
                ev.preventDefault();
                pick("step");
              }
            }}
          >
            날짜별
          </button>
        </div>
      </div>

      <section
        role="tabpanel"
        id={p1}
        aria-labelledby={t1}
        hidden={tab !== "step"}
      >
        {history.byStep.length === 0 ? (
          <p className="empty">이 종목의 피드백이 아직 없습니다.</p>
        ) : (
          <ol className="ladder">
            {history.byStep.map((row) =>
              row.kind === "milestone" ? (
                <li key={`ms-${row.step}`} className="gate">
                  {row.step}
                </li>
              ) : (
                <ByStepBlock
                  key={`st-${row.step}`}
                  row={row}
                  nextFocusText={history.nextFocusText}
                />
              ),
            )}
          </ol>
        )}
      </section>

      <section
        role="tabpanel"
        id={p2}
        aria-labelledby={t2}
        hidden={tab !== "date"}
      >
        {history.sessions.length === 0 ? (
          <p className="empty">이 종목의 피드백이 아직 없습니다.</p>
        ) : (
          history.sessions.map((s) => (
            <SessionArticle key={s.feedbackId} session={s} />
          ))
        )}
      </section>
    </div>
  );
}
