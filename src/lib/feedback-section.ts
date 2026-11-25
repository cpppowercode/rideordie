/**
 * 강습 상세(/product/ski-lesson-premium)의 '강습 후 피드백' 소개 섹션.
 * 기본은 꺼짐. 사진 업로드 기능이 운영에 배포된 뒤에만
 * NEXT_PUBLIC_FEEDBACK_SECTION=1 로 켠다. 값이 없거나 1/true가 아니면 렌더하지 않는다.
 * Next.js는 NEXT_PUBLIC_ 값을 빌드 시점에 넣으므로, Vercel에서 값을 바꾼 뒤에는 재배포가 필요하다.
 */
export const FEEDBACK_SECTION_ENV = "NEXT_PUBLIC_FEEDBACK_SECTION";

export function isFeedbackSectionEnabled(
  envValue: string | undefined = process.env.NEXT_PUBLIC_FEEDBACK_SECTION,
): boolean {
  const value = envValue?.trim().toLowerCase();
  return value === "1" || value === "true";
}
