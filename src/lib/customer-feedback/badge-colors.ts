/**
 * 시드 급수 색 이름 → 어드민 팔레트 안 표현색.
 * 연맹 로고/공식 색칩이 아니라 홈페이지·어드민 토큰에 맞춘 근사치.
 */
const GRADE_COLOR_MAP: Record<string, { fill: string; stroke: string; text: string }> = {
  흰색: { fill: "#ffffff", stroke: "#d1d1d8", text: "#3d3d46" },
  노랑: { fill: "#fef0c7", stroke: "#fdb022", text: "#93370d" },
  초록: { fill: "#d1fadf", stroke: "#12b76a", text: "#054f31" },
  파랑: { fill: "#e0e6ff", stroke: "#465fff", text: "#252c84" },
  주황: { fill: "#ffead5", stroke: "#fb6514", text: "#9c2a10" },
  빨강: { fill: "#fee4e2", stroke: "#f04438", text: "#7a271a" },
  검정: { fill: "#27272e", stroke: "#18181d", text: "#f7f7f9" },
  브론즈: { fill: "#fddcab", stroke: "#c4320a", text: "#7e2410" },
  실버: { fill: "#f0f0f3", stroke: "#9d9da8", text: "#3d3d46" },
  골드: { fill: "#fef0c7", stroke: "#dc6803", text: "#7a2e0e" },
};

const CHALLENGE_COLORS = {
  ski: { fill: "#eef1ff", stroke: "#465fff", text: "#252c84" },
  board: { fill: "#e0f2fe", stroke: "#0ba5ec", text: "#0b4a6f" },
} as const;

export function badgePalette(
  sport: "ski" | "board",
  colorName?: string | null,
): { fill: string; stroke: string; text: string } {
  const key = String(colorName ?? "").trim();
  if (key && GRADE_COLOR_MAP[key]) return GRADE_COLOR_MAP[key]!;
  return CHALLENGE_COLORS[sport];
}

export function isChallengeBadgeCode(code: string): boolean {
  return /KSIA_L|SBAK_T/i.test(code) && !/_JR_/i.test(code);
}
