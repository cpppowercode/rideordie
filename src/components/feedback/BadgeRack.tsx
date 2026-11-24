import { badgePalette, isChallengeBadgeCode } from "@/lib/customer-feedback/badge-colors";
import { sportLabel } from "@/lib/customer-feedback/display";
import type { FeedbackBadge } from "@/lib/customer-feedback/types";

type BadgeRackProps = {
  badges: FeedbackBadge[];
};

/** SVG/CSS 자체 제작 뱃지. 연맹 로고·외부 이미지 없음. */
function BadgeGlyph({ badge }: { badge: FeedbackBadge }) {
  const palette = badgePalette(badge.sport, badge.color_name);
  const challenge = isChallengeBadgeCode(badge.code);
  const gradeMatch = /JR[_-]?0?(\d{1,2})/i.exec(badge.code);
  const gradeNum = gradeMatch ? gradeMatch[1] : null;

  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      aria-hidden
      className="shrink-0"
    >
      <circle
        cx="28"
        cy="28"
        r="26"
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth="2.5"
      />
      <circle
        cx="28"
        cy="28"
        r="18"
        fill={challenge ? "#fff" : palette.fill}
        stroke={palette.stroke}
        strokeWidth="1.5"
      />
      {challenge ? (
        <>
          <path
            d="M28 14 L32 24 L42 24 L34 30 L37 40 L28 34 L19 40 L22 30 L14 24 L24 24 Z"
            fill={palette.stroke}
            opacity="0.9"
          />
        </>
      ) : gradeNum ? (
        <text
          x="28"
          y="32"
          textAnchor="middle"
          fontSize="16"
          fontWeight="700"
          fill={palette.text}
          fontFamily="Pretendard, system-ui, sans-serif"
        >
          {gradeNum}
        </text>
      ) : badge.sport === "ski" ? (
        <path
          d="M16 34 L28 18 L40 34"
          fill="none"
          stroke={palette.stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <ellipse
          cx="28"
          cy="28"
          rx="11"
          ry="7"
          fill="none"
          stroke={palette.stroke}
          strokeWidth="2.2"
          transform="rotate(-28 28 28)"
        />
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
            <BadgeGlyph badge={badge} />
            <p className="mt-2 text-[13px] font-semibold leading-snug text-[var(--fb-text)]">
              {badge.label}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--fb-text-tertiary)]">
              {sportLabel(badge.sport)}
              {badge.color_name ? ` · ${badge.color_name}` : null}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
