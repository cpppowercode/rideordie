import { sportLabel } from "@/lib/customer-feedback/display";
import type { FeedbackBadge } from "@/lib/customer-feedback/types";

type BadgeRackProps = {
  badges: FeedbackBadge[];
};

/** SVG/CSS 자체 제작 뱃지. 연맹 로고·외부 이미지 없음. */
function BadgeGlyph({ sport, code }: { sport: "ski" | "board"; code: string }) {
  const accent = sport === "ski" ? "#465fff" : "#0ba5ec";
  const hash = Array.from(code).reduce((a, c) => a + c.charCodeAt(0), 0);
  const ring = hash % 2 === 0 ? accent : "#3646f0";

  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="28" cy="28" r="26" fill="#f5f7ff" stroke={ring} strokeWidth="2.5" />
      <circle cx="28" cy="28" r="18" fill="#fff" stroke={accent} strokeWidth="1.5" />
      {sport === "ski" ? (
        <>
          <path
            d="M16 34 L28 18 L40 34"
            fill="none"
            stroke={accent}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="28" cy="36" r="2.2" fill={accent} />
        </>
      ) : (
        <>
          <ellipse
            cx="28"
            cy="28"
            rx="11"
            ry="7"
            fill="none"
            stroke={accent}
            strokeWidth="2.2"
            transform="rotate(-28 28 28)"
          />
          <circle cx="28" cy="28" r="2" fill={accent} />
        </>
      )}
    </svg>
  );
}

export function BadgeRack({ badges }: BadgeRackProps) {
  if (!badges.length) return null;

  return (
    <section className="fb-card mt-4 p-4" data-testid="badge-rack">
      <h3 className="text-[14px] font-semibold text-[var(--fb-text)]">취득 뱃지</h3>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((badge) => (
          <li
            key={`${badge.code}-${badge.sport}-${badge.earned_at}`}
            className="flex flex-col items-center rounded-[var(--fb-radius-sm)] border border-[var(--fb-border-subtle)] bg-[var(--fb-brand-25)] px-2 py-3 text-center"
          >
            <BadgeGlyph sport={badge.sport} code={badge.code} />
            <p className="mt-2 text-[13px] font-semibold leading-snug text-[var(--fb-text)]">
              {badge.label}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--fb-text-tertiary)]">
              {sportLabel(badge.sport)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
