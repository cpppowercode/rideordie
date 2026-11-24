import "@/app/feedback/feedback-tokens.css";

type FeedbackShellProps = {
  children: React.ReactNode;
  className?: string;
};

/** 피드백·주니어 페이지 공통 래퍼. 토큰은 .fb-root 에만 적용. */
export function FeedbackShell({ children, className = "" }: FeedbackShellProps) {
  return (
    <div className={`fb-root min-h-[70vh] ${className}`.trim()}>
      <div className="mx-auto w-full max-w-lg px-4 py-8 md:py-12">{children}</div>
    </div>
  );
}
