import type { FeedbackStudent } from "@/lib/customer-feedback/types";
import { LogoutButton } from "./LogoutButton";
import { StudentFeedbackCard } from "./StudentFeedbackCard";

type FeedbackListProps = {
  students: FeedbackStudent[];
};

export function FeedbackList({ students }: FeedbackListProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-[var(--fb-text)]">
            내 강습 피드백
          </h1>
          <p className="mt-1 text-[14px] text-[var(--fb-text-secondary)]">
            강습생별로 최신 피드백과 회차 기록을 볼 수 있어요.
          </p>
        </div>
        <LogoutButton />
      </div>

      {students.length === 0 ? (
        <p className="fb-card p-5 text-[14px] text-[var(--fb-text-secondary)]">
          아직 발행된 피드백이 없습니다.
        </p>
      ) : (
        students.map((student) => (
          <StudentFeedbackCard key={student.student_key} student={student} />
        ))
      )}
    </div>
  );
}
