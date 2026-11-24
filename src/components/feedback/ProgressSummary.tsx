import type { FeedbackMark, StudentProgress } from "@/lib/customer-feedback/types";

type ProgressSummaryProps = {
  progress: StudentProgress;
};

function stepClass(mark: FeedbackMark): string {
  if (mark === "o") return "fb-progress-step is-o";
  if (mark === "triangle") return "fb-progress-step is-triangle";
  if (mark === "x") return "fb-progress-step is-x";
  return "fb-progress-step";
}

export function ProgressSummary({ progress }: ProgressSummaryProps) {
  const marks = progress.per_step_latest_mark ?? [];
  if (!marks.length && !progress.current_milestone_label) return null;

  return (
    <section className="fb-card mt-4 p-4">
      <h3 className="text-[14px] font-semibold text-[var(--fb-text)]">누적 진행도</h3>
      {marks.length > 0 ? (
        <div className="fb-progress-track mt-3" aria-label="단계별 최신 표시">
          {marks.map((mark, i) => (
            <span key={i} className={stepClass(mark)} title={String(mark ?? "none")} />
          ))}
        </div>
      ) : null}
      <div className="mt-3 space-y-1 text-[13px] text-[var(--fb-text-secondary)]">
        {progress.current_milestone_label ? (
          <p>
            현재 구간:{" "}
            <span className="font-medium text-[var(--fb-text)]">
              {progress.current_milestone_label}
            </span>
          </p>
        ) : null}
        {typeof progress.steps_to_next_milestone === "number" &&
        progress.next_milestone_label ? (
          <p>
            다음 도전까지 {progress.steps_to_next_milestone}단계 ·{" "}
            {progress.next_milestone_label}
          </p>
        ) : null}
      </div>
    </section>
  );
}
