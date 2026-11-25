/** 강사 코멘트 — 처음엔 접힘 (최종 명세 3-3·3-4). */
export function CommentFold({ text }: { text: string | null | undefined }) {
  const body = typeof text === "string" ? text.trim() : "";
  if (!body) return null;

  return (
    <details className="fold-toggle">
      <summary>
        <span>강사 코멘트</span>
        <span className="when-shut">열기</span>
        <span className="when-open">접기</span>
        <svg className="chev" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
      <p className="say fb-say-long">{body}</p>
    </details>
  );
}
