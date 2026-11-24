/** 손님용 강습 피드백 — 어드민 API 계약 타입. */

export type FeedbackMark = "o" | "triangle" | "x" | null;

export type FeedbackItemKind = "step" | "milestone";

export type FeedbackItem = {
  label: string;
  kind: FeedbackItemKind;
  mark: FeedbackMark;
};

export type FeedbackSession = {
  id: string;
  session_date: string;
  sport: string;
  instructor_display_name: string;
  items: FeedbackItem[];
  next_focus: string | null;
  instructor_note: string | null;
};

/** 한 단계를 배운 회차(어드민이 단계별로 묶어 내려줌). */
export type StepRound = {
  feedback_id: string;
  round: number;
  session_date: string;
  instructor_display_name: string;
  mark: FeedbackMark;
  next_focus: string | null;
  instructor_note: string | null;
};

/** 단계 소제목 + 회차 배열. milestone 은 rounds 가 비어 있을 수 있다. */
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
  /** 주니어 급수 뱃지 색 이름(흰색·노랑…). 어드민이 생략할 수 있다. */
  color_name?: string | null;
};

export type FeedbackStudent = {
  student_key: string;
  display_name: string;
  sport: string;
  is_junior_eligible: boolean;
  feedbacks: FeedbackSession[];
  /** 단계별 회차 묶음. 어드민이 생략하면 feedbacks 에서 파생한다. */
  step_groups?: StepGroup[];
  progress: StudentProgress | null;
  /** 어드민이 생략해도 된다. */
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
