/** 손님용 강습 피드백 — 어드민 API 계약 (PR #68 + 최종 명세). */

export type FeedbackMark = "o" | "triangle" | "x" | null;

export type FeedbackItemKind = "step" | "milestone";

export type FeedbackMarkLabel =
  | "할 수 있어요"
  | "연습 중"
  | "아직 어려워요"
  | "배우기 전";

export type FeedbackItem = {
  label: string;
  kind: FeedbackItemKind;
  mark: FeedbackMark;
  mark_label?: FeedbackMarkLabel | string | null;
  step_comment?: string | null;
  is_next_step?: boolean;
};

/** 회차 사진(긴 변 2048px 압축본). 서명 URL 1시간. 그 회차 강습생 모두에게 공용. */
export type FeedbackPhoto = {
  id: string;
  url: string;
  download_url: string;
  width?: number | null;
  height?: number | null;
};

export type FeedbackSession = {
  id: string;
  session_date: string;
  session_number?: number;
  sport: string;
  instructor_display_name: string;
  items: FeedbackItem[];
  day_summary?: string | null;
  next_focus: string | null;
  instructor_note: string | null;
  photos?: FeedbackPhoto[];
};

export type StepRound = {
  feedback_id: string;
  round: number;
  session_date: string;
  instructor_display_name: string;
  mark: FeedbackMark;
  next_focus: string | null;
  instructor_note: string | null;
  step_comment?: string | null;
};

export type StepGroup = {
  code?: string | null;
  label: string;
  kind: FeedbackItemKind;
  sport: string;
  rounds: StepRound[];
};

export type StudentProgress = {
  per_step_latest_mark: FeedbackMark[];
  current_milestone_label: string | null;
  steps_to_next_milestone: number | null;
  next_milestone_label: string | null;
};

export type FeedbackBadge = {
  code: string;
  label: string;
  sport: "ski" | "board";
  earned_at: string;
  color_name?: string | null;
};

export type FeedbackStudent = {
  student_key: string;
  display_name: string;
  sport: string;
  is_junior_eligible: boolean;
  feedbacks: FeedbackSession[];
  step_groups?: StepGroup[];
  history?: {
    byStep?: import("./history").ByStepRow[];
    sessions?: import("./history").HistorySessionCard[];
  };
  progress: StudentProgress | null;
  badges?: FeedbackBadge[];
};

export type FeedbackLoginSuccess = {
  ok: true;
  session_token: string;
  expires_at: string;
};

export type FeedbackLoginFailure = {
  ok: false;
  error: "invalid" | "locked" | "rate_limited";
};

export type FeedbackLoginResult = FeedbackLoginSuccess | FeedbackLoginFailure;

export type FeedbackListResult =
  | { ok: true; students: FeedbackStudent[] }
  | { ok: false; error?: string; unavailable?: boolean };

export type FeedbackByTokenHint = {
  display_name_initial: string;
  session_date: string;
};

export type FeedbackByTokenResult =
  | { ok: true; needs_login: true; hint: FeedbackByTokenHint }
  | { ok: true; needs_login?: false; students: FeedbackStudent[] }
  | { ok: false; error?: string; unavailable?: boolean };

export type FeedbackSessionCheck =
  | { ok: true; expires_at: string }
  | { ok: false; unavailable?: boolean };

export const FEEDBACK_TEXT_LIMIT = 3000;
