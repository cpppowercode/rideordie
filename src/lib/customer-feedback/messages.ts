/** 손님 UI에 노출하는 고정 문구. 실패 원인을 구분하지 않는다. */

export const FEEDBACK_LOGIN_INVALID_MESSAGE =
  "예약 정보를 찾을 수 없거나 아직 발행된 피드백이 없습니다";

export const FEEDBACK_LOGIN_RETRY_MESSAGE = "잠시 후 다시 시도해 주세요";

export const FEEDBACK_SERVICE_PREPARING_MESSAGE = "피드백 서비스 준비 중";

export function loginErrorMessage(
  error: "invalid" | "locked" | "rate_limited" | string | undefined,
): string {
  if (error === "locked" || error === "rate_limited") {
    return FEEDBACK_LOGIN_RETRY_MESSAGE;
  }
  return FEEDBACK_LOGIN_INVALID_MESSAGE;
}
