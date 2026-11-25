import "@/app/feedback/feedback-tokens.css";

type FeedbackShellProps = {
  children: React.ReactNode;
  className?: string;
};

/** 피드백·주니어 페이지 공통 래퍼. 토큰은 .fb-root 에만 적용. */
export function FeedbackShell({ children, className = "" }: FeedbackShellProps) {
  return (
    <div className={`fb-root min-h-[70vh] overflow-x-clip ${className}`.trim()}>
      <div className="container page customer">{children}</div>
    </div>
  );
}
