import type { FeedbackStudent } from "@/lib/customer-feedback/types";
import { LogoutButton } from "./LogoutButton";
import { StudentFeedbackCard } from "./StudentFeedbackCard";

type FeedbackListProps = {
  students: FeedbackStudent[];
};

export function FeedbackList({ students }: FeedbackListProps) {
  return (
    <div className="list-stack" style={{ display: "grid", gap: "var(--space-xl)" }}>
      <div
        className="list-top"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--space-md)",
        }}
      >
        <div className="head" style={{ marginBottom: 0 }}>
          <h1>내 강습 피드백</h1>
          <p className="note">강습생별로 최신 피드백과 회차 기록을 볼 수 있어요.</p>
        </div>
        <LogoutButton />
      </div>

      {students.length === 0 ? (
        <p className="empty">아직 발행된 피드백이 없습니다.</p>
      ) : (
        students.map((student) => (
          <StudentFeedbackCard key={student.student_key} student={student} />
        ))
      )}
    </div>
  );
}
