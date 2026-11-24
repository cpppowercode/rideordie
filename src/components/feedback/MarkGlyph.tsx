import type { FeedbackMark } from "@/lib/customer-feedback/types";
import {
  markLabel,
  resolveMarkLabel,
} from "@/lib/customer-feedback/display";

type MarkGlyphProps = {
  mark: FeedbackMark;
  label?: string | null;
  /** next / none 강제 문구 */
  variant?: "mark" | "next" | "none";
};

export function MarkGlyph({ mark, label, variant = "mark" }: MarkGlyphProps) {
  if (variant === "next") {
    return <span className="st st--next">다음에 배울 단계</span>;
  }
  if (variant === "none" || mark == null) {
    return (
      <span className="st st--none">
        {label?.trim() || "배우기 전"}
      </span>
    );
  }

  const text = resolveMarkLabel(mark, label) || markLabel(mark);
  const cls =
    mark === "o" ? "st st--o" : mark === "triangle" ? "st st--t" : "st st--x";

  return (
    <span className={cls} title={text}>
      {mark === "o" ? (
        <svg className="glyph" viewBox="0 0 16 16" aria-hidden="true">
          <circle
            cx="8"
            cy="8"
            r="5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ) : mark === "triangle" ? (
        <svg className="glyph" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M8 2.5 14 13H2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg className="glyph" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M3.5 3.5l9 9M12.5 3.5l-9 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
      {text}
    </span>
  );
}
