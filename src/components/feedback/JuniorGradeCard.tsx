import Link from "next/link";
import type { StudentProgress } from "@/lib/customer-feedback/types";

type JuniorGradeCardProps = {
  /** is_junior_eligible 이 true 일 때만 부모에서 렌더한다. */
  progress: StudentProgress | null;
};

/**
 * 주니어 대상 강습생에게만 보이는 등급 호기심 카드.
 * 어른·비대상에게는 절대 렌더하지 않는다 (호출 측에서 eligible 가드).
 */
export function JuniorGradeCard({ progress }: JuniorGradeCardProps) {
  const current = progress?.current_milestone_label?.trim() || "성장 구간";
  const next = progress?.next_milestone_label?.trim();
  const steps = progress?.steps_to_next_milestone;

  return (
    <aside
      className="fb-card mt-4 overflow-hidden border-[var(--fb-brand)]/20 bg-[var(--fb-brand-25)]"
      data-testid="junior-grade-card"
    >
      <div className="border-l-4 border-[var(--fb-brand)] p-4">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fb-brand)]">
          주니어 등급
        </p>
        <p className="mt-1 text-[16px] font-semibold text-[var(--fb-text)]">
          지금: {current}
        </p>
        {typeof steps === "number" && next ? (
          <p className="mt-1 text-[14px] text-[var(--fb-text-secondary)]">
            {next}까지 {steps}단계
          </p>
        ) : next ? (
          <p className="mt-1 text-[14px] text-[var(--fb-text-secondary)]">
            다음 도전: {next}
          </p>
        ) : null}
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--fb-text-secondary)]">
          단계가 쌓일수록 다음 등급이 열려요. 어떤 구간을 향해 가는지 살짝
          엿볼까요?
        </p>
        <Link
          href="/junior"
          className="mt-3 inline-flex text-[14px] font-semibold text-[var(--fb-brand)] hover:text-[var(--fb-brand-hover)]"
        >
          주니어 등급 알아보기
        </Link>
      </div>
    </aside>
  );
}
