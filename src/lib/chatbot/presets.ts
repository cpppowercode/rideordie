/**
 * 프리셋 버튼 답변. AI 를 쓰지 않는 고정 답변(비용 0). 가격은 pricing.ts 에서 매번 계산한다.
 * 얼리버드 기준일(예약일/강습일)은 말하지 않는다(사장님 확인 전) → 카톡 안내.
 */
import { PERIOD_LABEL, allowedRatios, headlineCopy, kstToday, periodFor, tableFor, type SeasonSettings } from "@/lib/pricing";
import { KAKAO_CONSULT_URL } from "@/lib/site";
import { KAKAO_LINE, REFUND_LINES, tableText } from "./knowledge";

export type PresetId = "price" | "booking" | "high1" | "vivaldi" | "welli" | "yongpyong" | "jisan" | "refund" | "gear" | "group";
export const PRESETS: { id: PresetId; label: string }[] = [
  { id: "price", label: "가격" }, { id: "booking", label: "예약·결제" },
  { id: "high1", label: "하이원" }, { id: "vivaldi", label: "비발디" }, { id: "welli", label: "웰리힐리" }, { id: "yongpyong", label: "용평" }, { id: "jisan", label: "지산" },
  { id: "refund", label: "환불" }, { id: "gear", label: "준비물·렌탈" }, { id: "group", label: "단체·가족" },
];

function priceBlock(s: SeasonSettings, today: string, resortName = ""): string {
  const period = periodFor(today, s);
  return `지금은 ${PERIOD_LABEL[period]} 기간이에요. ${headlineCopy(period)}\n${tableText(tableFor(period), allowedRatios(resortName))}`;
}
const resort = (name: string, extra: string) => (s: SeasonSettings, today: string) =>
  `${name}에서 어린이 스키·보드 강습을 해요. ${extra}\n${priceBlock(s, today, name)}\n예약은 rideordie.kr/book 에서 할 수 있어요.`;

const ANSWERS: Record<PresetId, (s: SeasonSettings, today: string) => string> = {
  price: (s, t) => `${priceBlock(s, t)}\n(강습비 총액 기준. 비발디·지산은 패찰비가 결제 때 함께 계산돼요.)`,
  booking: () => `rideordie.kr/book 에서 날짜·스키장·시간·구성을 고르고 이름과 휴대폰 번호를 남긴 뒤 결제하면 예약이 접수돼요. 만날 장소와 시간은 카카오톡으로 보내 드려요. 예약·결제 상태는 카카오톡 채널에서 확인해 드려요: ${KAKAO_CONSULT_URL}`,
  high1: resort("하이원", "패찰비는 없어요."),
  vivaldi: resort("비발디", "패찰비는 인원×시간×12,500원이고 결제 때 함께 계산돼요."),
  welli: resort("웰리힐리", "패찰비는 없어요."),
  yongpyong: resort("용평", "용평은 1:1과 2:1 강습만 있어요(3:1은 없어요). 패찰비는 없어요."),
  jisan: resort("지산", "패찰비는 1인 2시간 35,000원, 3·4시간 50,000원이고 결제 때 함께 계산돼요."),
  refund: () => `환불 규정이에요.\n${REFUND_LINES.map((l) => `· ${l}`).join("\n")}\n환불 신청은 카카오톡 채널로 해 주세요.`,
  gear: () => `준비물과 장비 렌탈은 스키장과 일정에 따라 달라서 상담으로 안내해 드려요. ${KAKAO_LINE}`,
  group: () => `1:1, 2:1, 3:1 강습과 가족 그룹 강습이 있고, 한 그룹은 최대 3명이에요(용평은 1:1·2:1만). 인원이 더 많은 단체는 카카오톡 채널로 문의해 주세요: ${KAKAO_CONSULT_URL}`,
};

export function presetAnswer(id: string, s: SeasonSettings, now: Date = new Date()): string | null {
  const f = ANSWERS[id as PresetId];
  return f ? f(s, kstToday(now)) : null;
}

/** 얼리버드 등 요금 기간의 '기준 날짜'를 묻는 질문 → AI 를 거치지 않고 카톡 안내. */
export const BASIS_QUESTION = /(예약\s*(일|날|날짜|한\s*날)|결제\s*(일|날)|강습\s*(일|날)|이용\s*(일|날)).{0,20}(기준|적용|맞|되|인가|인지|냐|요\?)|(기준|적용).{0,15}(예약|결제|강습|이용)\s*(일|날)|(얼리|조기|시즌말|특가).{0,20}(언제\s*예약|날짜\s*기준|어느\s*날)/;
export const BASIS_ANSWER = `요금 기간(얼리버드·일반·시즌말 특가)을 어느 날짜로 정하는지는 상담으로 정확히 안내해 드릴게요. ${KAKAO_LINE}`;
