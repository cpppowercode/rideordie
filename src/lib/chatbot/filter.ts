import { KAKAO_LINE } from "./knowledge";

/** 답변을 고객에게 보여 주기 전 마지막 검사. 걸리면 답 전체를 안전 문구로 바꾼다(부분 수정하지 않음). */
const RULES: [string, RegExp][] = [
  ["전화번호", /(?:\+?82[-\s]?)?0\d{1,2}[-\s.)]?\d{3,4}[-\s.]?\d{4}|1[5-9]\d{2}[-\s]?\d{4}/],
  ["주소", /[가-힣]{1,10}(?:로|길)\s?\d{1,4}(?:-\d+)?(?!\s*(?:시간|분|명|만원|원|%))|[가-힣]+(?:도|시)\s+[가-힣]+(?:시|군|구)\b|[가-힣]+(?:시|군|구)\s?[가-힣0-9]+(?:로|길|동|읍|면)\s?\d|\d+번길|도로명|지번|사업장 ?주소/],
  ["이메일", /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/],
  ["금지 이름", /박\s*강\s*후/],
  ["연령 기준", /만\s*\d+\s*세|\d+\s*세\s*(?:이상|부터|미만|이하)|연령\s*(?:제한|기준)|나이\s*(?:제한|기준)/],
  ["추가 비용 문구", /(?:숙소|리프트\s*권|리프트권|장비|렌탈|렌털)[^.\n]{0,12}별도|별도[^.\n]{0,6}(?:숙소|리프트|렌탈|장비)/],
  ["재촉 표현", /마감\s*임박|오늘만|선착순|오픈\s*기념/],
  ["확정·결제 약속", /예약(?:이|은|이\s*정상적으로)?\s*(?:확정|완료)(?:됐|되었|됩니다|돼|되셨|처리)|결제(?:가|는)?\s*(?:완료|승인|처리)(?:됐|되었|됩니다|돼|되셨)|확정해\s*드릴게|자리\s*(?:잡아|맡아)\s*드릴게/],
  ["강사 개인정보", /강사\s*(?:님)?\s*(?:연락처|번호|카톡\s*아이디|인스타|실명|나이)/],
  ["내부 정보", /강사료|원천징수|3\.3\s*%|내부\s*기준|광고\s*예산/],
];

export type FilterResult = { ok: true; text: string } | { ok: false; text: string; reason: string };
export const SAFE_FALLBACK = `그 부분은 제가 정확히 안내하기 어려워요. ${KAKAO_LINE}`;

export function filterAnswer(text: string): FilterResult {
  const t = String(text || "").trim();
  if (!t) return { ok: false, text: SAFE_FALLBACK, reason: "빈 답변" };
  // 허용 링크 외 URL 차단
  for (const m of t.matchAll(/https?:\/\/[^\s)]+/g)) {
    if (!/^https:\/\/(pf\.kakao\.com\/_xfWMxaG|rideordie\.kr)(\/|$)/.test(m[0])) return { ok: false, text: SAFE_FALLBACK, reason: "허용되지 않은 링크" };
  }
  for (const [reason, re] of RULES) if (re.test(t)) return { ok: false, text: SAFE_FALLBACK, reason };
  return { ok: true, text: t.slice(0, 800) };
}
