/**
 * 손님 화면 강사 표시 정책 (사장님 23:16 정정).
 * 실제 이름·강사 id·사진·연락처는 비노출. 공개 스위치 기본 off.
 */
export const INSTRUCTOR_PUBLIC_LABEL = "담당 강사";

/** 손님 UI용. API 값이 와도 항상 일반 문구만 반환한다. */
export function customerInstructorLabel(
  fromApi?: string | null,
): typeof INSTRUCTOR_PUBLIC_LABEL {
  void fromApi;
  return INSTRUCTOR_PUBLIC_LABEL;
}
