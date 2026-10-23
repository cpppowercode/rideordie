import { KAKAO_CONSULT_URL } from "@/lib/site";

type KakaoConsultLinkProps = {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
};

export function KakaoConsultLink({
  className = "",
  children = "카톡 상담",
  testId,
}: KakaoConsultLinkProps) {
  return (
    <a
      href={KAKAO_CONSULT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-testid={testId}
    >
      {children}
    </a>
  );
}
