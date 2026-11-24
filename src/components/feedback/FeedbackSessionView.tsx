import {
  formatSessionDate,
  markLabel,
  markSymbol,
  sportLabel,
} from "@/lib/customer-feedback/display";
import type { FeedbackItem, FeedbackSession } from "@/lib/customer-feedback/types";

function ItemRow({ item }: { item: FeedbackItem }) {
  if (item.kind === "milestone") {
    return (
      <div className="fb-milestone" role="separator" aria-label={item.label}>
        <div className="fb-milestone-bar" aria-hidden />
        <div className="fb-milestone-label">] {item.label}</div>
      </div>
    );
  }

  const markClass =
    item.mark === "o"
      ? "fb-mark-o"
      : item.mark === "triangle"
        ? "fb-mark-triangle"
        : item.mark === "x"
          ? "fb-mark-x"
          : "fb-mark-null";

  return (
    <li className="flex items-start gap-3 py-2">
      <span
        className={`mt-0.5 inline-flex min-w-8 justify-center text-[18px] font-semibold ${markClass}`}
        title={markLabel(item.mark)}
        aria-label={markLabel(item.mark)}
      >
        {markSymbol(item.mark)}
      </span>
      <span className="flex-1 text-[15px] leading-snug text-[var(--fb-text)]">
        {item.label}
      </span>
    </li>
  );
}

export function FeedbackSessionView({ session }: { session: FeedbackSession }) {
  return (
    <article className="fb-card p-4">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[13px] text-[var(--fb-text-secondary)]">
            {formatSessionDate(session.session_date)} · {sportLabel(session.sport)}
          </p>
          <p className="mt-0.5 text-[14px] font-medium text-[var(--fb-text)]">
            강사 {session.instructor_display_name}
          </p>
        </div>
      </header>

      <ul className="divide-y divide-[var(--fb-border-subtle)]">
        {session.items.map((item, i) => (
          <ItemRow key={`${item.kind}-${item.label}-${i}`} item={item} />
        ))}
      </ul>

      {session.next_focus?.trim() ? (
        <div className="mt-4 rounded-[var(--fb-radius-sm)] bg-[var(--fb-brand-25)] px-3 py-2.5">
          <p className="text-[12px] font-semibold text-[var(--fb-brand)]">다음에 배울 것</p>
          <p className="mt-1 text-[14px] leading-relaxed text-[var(--fb-text)]">
            {session.next_focus}
          </p>
        </div>
      ) : null}

      {session.instructor_note?.trim() ? (
        <div className="mt-3 rounded-[var(--fb-radius-sm)] bg-[var(--fb-border-subtle)] px-3 py-2.5">
          <p className="text-[12px] font-semibold text-[var(--fb-text-secondary)]">
            강사 소견
          </p>
          <p className="mt-1 text-[14px] leading-relaxed text-[var(--fb-text)]">
            {session.instructor_note}
          </p>
        </div>
      ) : null}
    </article>
  );
}
