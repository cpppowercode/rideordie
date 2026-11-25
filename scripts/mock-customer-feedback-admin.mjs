#!/usr/bin/env node
/**
 * 로컬 전용 어드민 피드백 API mock (최종 명세 / seed_v3).
 * scripts/feedback-grades-seed.json 기준으로 단계·마일스톤·뱃지를 구성한다.
 * 운영 DB에 쓰지 않는다.
 *
 * ADMIN_RESERVATIONS_URL=http://127.0.0.1:4099/api/reservations
 * 계정: 테스트 / 01012345678
 * 공유 토큰: demo-share-token
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.MOCK_ADMIN_PORT || 4099);
const TOKEN = process.env.ADMIN_API_TOKEN || "test-admin-token";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(
  fs.readFileSync(path.join(__dirname, "feedback-grades-seed.json"), "utf8"),
);

const sessions = new Map();
const loginFails = new Map();

/** 손님 화면 공개 스위치 기본 off — 실제 강사명 비노출. */
const INSTRUCTOR_PUBLIC_LABEL = "담당 강사";

const MARK_LABELS = {
  o: "할 수 있어요",
  triangle: "연습 중",
  x: "아직 어려워요",
};

function markLabelOf(mark) {
  if (mark == null) return "배우기 전";
  return MARK_LABELS[mark] || "배우기 전";
}

function stepsFor(sport) {
  return seed.steps
    .filter((s) => s.sport === sport && s.kind === "step")
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
}

function milestonesFor(sport) {
  return seed.milestones.filter((m) => m.sport === sport);
}

/**
 * 어드민이 내려주는 것과 같이 step + milestone 항목을 순서대로 만든다.
 * 위치는 시드 milestones[].after_step 만 따른다.
 *
 * @param {string} sport
 * @param {Record<string, 'o'|'triangle'|'x'|null>} marksByCode
 * @param {{
 *   commentsByCode?: Record<string, string>,
 *   nextStepCodes?: Iterable<string>|Set<string>|string[],
 * }} [opts]
 */
function buildItems(sport, marksByCode, opts = {}) {
  const steps = stepsFor(sport);
  const milestones = milestonesFor(sport);
  const commentsByCode = opts.commentsByCode || {};
  const nextSet = new Set(opts.nextStepCodes ? [...opts.nextStepCodes] : []);

  const afterMap = new Map();
  for (const ms of milestones) {
    const after = typeof ms.after_step === "string" ? ms.after_step.trim() : "";
    if (!after) continue;
    if (!afterMap.has(after)) afterMap.set(after, []);
    afterMap.get(after).push(ms);
  }

  const items = [];
  for (const step of steps) {
    const hasMark = Object.prototype.hasOwnProperty.call(marksByCode, step.code);
    const mark = hasMark ? marksByCode[step.code] : null;
    const item = {
      label: step.label,
      kind: "step",
      mark,
      mark_label: markLabelOf(mark),
      is_next_step: nextSet.has(step.code),
    };
    // 손님 API: mark 가 있을 때만 step_comment 포함
    if (mark != null) {
      const comment = commentsByCode[step.code];
      if (typeof comment === "string" && comment.trim()) {
        item.step_comment = comment.trim();
      }
    }
    items.push(item);
    for (const ms of afterMap.get(step.code) || []) {
      items.push({
        label: ms.label,
        kind: "milestone",
        mark: null,
        mark_label: "배우기 전",
        is_next_step: false,
      });
    }
  }
  return items;
}

function marksArray(sport, marksByCode) {
  return stepsFor(sport).map((s) =>
    Object.prototype.hasOwnProperty.call(marksByCode, s.code)
      ? marksByCode[s.code]
      : null,
  );
}

function findBadge(code) {
  return seed.badges.find((b) => b.code === code);
}

function earnedBadge(code, earned_at) {
  const b = findBadge(code);
  if (!b) return null;
  return {
    code: b.code,
    label: b.label,
    sport: b.sport,
    earned_at,
    color_name: b.color_name || null,
  };
}

/** 긴 텍스트 랩 검증용 (~3000자). */
function longKorean(seedSentence, target = 3000) {
  let out = "";
  while (out.length < target) {
    out += seedSentence;
  }
  return out.slice(0, target);
}

function changeOf(prev, mark) {
  if (prev === undefined) return "first";
  if (prev === mark || mark == null || prev == null) return null;
  return `${prev}->${mark}`;
}

/** byStep + sessions. daySummary / stepComment 포함. 강사는 항상 일반 문구. */
function buildHistory(feedbacks) {
  const ordered = feedbacks
    .slice()
    .sort((a, b) => a.session_date.localeCompare(b.session_date));
  const instructor = INSTRUCTOR_PUBLIC_LABEL;

  const sessionCards = ordered.map((fb, i) => {
    const marks = [];
    for (const item of fb.items || []) {
      if (item.kind !== "step") continue;
      const marked = item.mark != null;
      const isNext = Boolean(item.is_next_step);
      if (!marked && !isNext) continue;
      let prev;
      for (let j = i - 1; j >= 0; j--) {
        const hit = (ordered[j].items || []).find(
          (it) => it.kind === "step" && it.label === item.label && it.mark != null,
        );
        if (hit) {
          prev = hit.mark;
          break;
        }
      }
      marks.push({
        step: item.label,
        mark: item.mark,
        markLabel: item.mark_label || markLabelOf(item.mark),
        change: marked ? changeOf(prev, item.mark) : null,
        stepComment:
          marked && typeof item.step_comment === "string" && item.step_comment.trim()
            ? item.step_comment.trim()
            : null,
        isNextStep: isNext,
        isReinforce: isNext && marked,
      });
    }
    const sessionNo =
      typeof fb.session_number === "number" && fb.session_number > 0
        ? fb.session_number
        : i + 1;
    return {
      sessionNo,
      date: fb.session_date,
      instructor,
      marks,
      daySummary:
        typeof fb.day_summary === "string" && fb.day_summary.trim()
          ? fb.day_summary.trim()
          : null,
      nextFocus:
        typeof fb.next_focus === "string" && fb.next_focus.trim()
          ? fb.next_focus.trim()
          : null,
      instructorNote:
        typeof fb.instructor_note === "string" && fb.instructor_note.trim()
          ? fb.instructor_note.trim()
          : null,
      feedbackId: fb.id,
    };
  });

  const order = [];
  const seen = new Set();
  for (const fb of ordered) {
    for (const item of fb.items || []) {
      const kind = item.kind === "milestone" ? "milestone" : "step";
      const key = `${kind}::${item.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      order.push({ step: item.label, kind });
    }
  }

  const newest = ordered[ordered.length - 1] || null;

  const byStep = order.map((o) => {
    if (o.kind === "milestone") {
      return { step: o.step, kind: "milestone" };
    }
    const records = [];
    let prevMark;
    let latestMark = null;
    let latestLabel = "배우기 전";
    let neverMarked = true;
    for (const card of sessionCards) {
      const m = card.marks.find((x) => x.step === o.step && x.mark != null);
      if (!m) continue;
      neverMarked = false;
      records.push({
        sessionNo: card.sessionNo,
        date: card.date,
        instructor,
        mark: m.mark,
        markLabel: m.markLabel,
        change: changeOf(prevMark, m.mark),
        stepComment: m.stepComment,
        nextFocus: card.nextFocus,
        instructorNote: card.instructorNote,
        feedbackId: card.feedbackId,
      });
      prevMark = m.mark;
      latestMark = m.mark;
      latestLabel = m.markLabel;
    }
    const newestItem = newest
      ? (newest.items || []).find(
          (it) => it.kind === "step" && it.label === o.step,
        )
      : undefined;
    const isNextStep = Boolean(newestItem?.is_next_step);
    const isReinforce = Boolean(isNextStep && newestItem && newestItem.mark != null);
    if (isNextStep && neverMarked) {
      latestLabel = "다음에 배울 단계";
      latestMark = null;
    } else if (neverMarked) {
      latestLabel = "배우기 전";
      latestMark = null;
    }
    return {
      step: o.step,
      kind: "step",
      records,
      latestMark,
      markLabel: latestLabel,
      neverMarked,
      isNextStep,
      isReinforce,
    };
  });

  return { byStep, sessions: sessionCards };
}

/** 어드민 list 계약과 같이 feedbacks → step_groups 로 묶는다. */
function buildStepGroups(feedbacks) {
  const ordered = feedbacks
    .slice()
    .sort((a, b) => a.session_date.localeCompare(b.session_date));
  const order = [];
  const seen = new Set();
  for (const fb of ordered) {
    for (const item of fb.items || []) {
      const kind = item.kind === "milestone" ? "milestone" : "step";
      const key = `${kind}::${item.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      order.push({ key, label: item.label, kind, sport: fb.sport });
    }
  }
  const roundsByKey = new Map();
  for (const fb of ordered) {
    for (const item of fb.items || []) {
      if (item.kind === "milestone") continue;
      const key = `step::${item.label}`;
      const list = roundsByKey.get(key) || [];
      list.push({
        feedback_id: fb.id,
        round: list.length + 1,
        session_date: fb.session_date,
        instructor_display_name: INSTRUCTOR_PUBLIC_LABEL,
        mark: item.mark ?? null,
        step_comment:
          item.mark != null &&
          typeof item.step_comment === "string" &&
          item.step_comment.trim()
            ? item.step_comment.trim()
            : null,
        next_focus: fb.next_focus,
        instructor_note: fb.instructor_note,
      });
      roundsByKey.set(key, list);
    }
  }
  return order.map((o) => ({
    code: null,
    label: o.label,
    kind: o.kind,
    sport: o.sport,
    rounds: o.kind === "milestone" ? [] : roundsByKey.get(o.key) || [],
  }));
}

/** 손님 API 응답: 강사 실명 제거 + history/step_groups 첨부. */
function forCustomer(student) {
  const feedbacks = (student.feedbacks || []).map((fb) => ({
    ...fb,
    instructor_display_name: INSTRUCTOR_PUBLIC_LABEL,
  }));
  return {
    ...student,
    feedbacks,
    step_groups: buildStepGroups(feedbacks),
    history: buildHistory(feedbacks),
  };
}

// ─── mockup-v5 민지 본편 마크/코멘트 ────────────────────────────────────────

const minjiSession1Marks = {
  SKI_SNOWPLOW: "o",
  SKI_SNOWPLOW_TURN: "triangle",
  SKI_STEM_TURN: "x",
};

const minjiSession1Comments = {
  SKI_SNOWPLOW: "멈추는 자세가 안정적이에요. 혼자서도 멈출 수 있어요.",
  SKI_SNOWPLOW_TURN:
    "왼쪽으로 돌 때 상체가 같이 돌아가요. 시선은 가는 방향, 몸통은 경사 아래를 보는 연습을 했어요.",
  SKI_STEM_TURN:
    "처음 해 봤어요. A자에서 스키를 모으는 순간 뒤로 앉는 버릇이 있어서 다음 시간에 다시 연습해요.",
};

const minjiSession2Marks = {
  SKI_SNOWPLOW: "o",
  SKI_SNOWPLOW_TURN: "o",
  SKI_STEM_TURN: "triangle",
};

const minjiSession2Comments = {
  SKI_SNOWPLOW:
    "완전히 몸에 익었어요. 경사가 조금 있는 곳에서도 원하는 자리에 정확히 멈춰요.",
  SKI_SNOWPLOW_TURN:
    "양쪽 턴 크기가 비슷해졌어요. 왼쪽 턴에서 상체가 따라 돌던 버릇이 거의 없어졌고, 속도 조절도 스스로 해요.",
  SKI_STEM_TURN:
    "A자로 시작해서 턴 가운데서 안쪽 스키를 모으는 흐름은 이해했어요.\n다만 경사가 세지면 모으는 타이밍이 늦어지고, 턴 끝에서 스키가 다시 살짝 벌어져요.\n완만한 경사에서 '모으고, 기다리고, 돌기' 리듬을 열 번 정도 더 반복하면 좋아요. 특히 오른쪽 턴에서 바깥 발 체중이 빠지는 순간이 있어서 무릎을 앞으로 내미는 느낌을 계속 기억해 주세요.",
};

const MINJI_S1_DAY =
  "첫날인데 겁먹지 않고 끝까지 잘 따라왔어요. 멈추기는 혼자서도 됩니다. 리프트 타고 내리기도 두 번째부터는 도움 없이 했어요.";
const MINJI_S1_NEXT =
  "스노우플라우턴을 양쪽 고르게 다듬고, 스템턴을 다시 연습해요.";
const MINJI_S1_NOTE =
  "초급 코스에서 리프트를 한두 번 더 타 보시면 다음 시간이 훨씬 편해요.";

const MINJI_S2_DAY =
  "지난주보다 속도를 훨씬 편하게 다뤄요. 스노우플라우턴은 이제 할 수 있어요.\n스템턴은 흐름을 이해했고, 완만한 경사에서는 거의 됩니다. 오늘은 초급 코스 전체를 쉬지 않고 세 번 내려왔어요.\n겁이 날 때 뒤로 앉는 버릇이 아직 조금 남아 있지만, 오늘 후반에는 스스로 알아채고 고쳤어요. 체력도 좋아서 마지막 시간까지 집중력이 유지됐습니다.";
const MINJI_S2_NEXT =
  "패러렐: 두 스키를 나란히 모은 채로 도는 연습부터 해요. 스템턴 리듬이 익숙해지면 바로 이어서 배울 수 있어요.";
const MINJI_S2_NOTE =
  "다음 강습 전에 한 번 더 타실 수 있다면, 초급 코스에서 스템턴만 연습해 주세요.\n급한 경사로 바로 올라가기보다는 완만한 곳에서 리듬을 몸에 익히는 게 훨씬 빨라요.";

function buildMinjiFeedbacks({ emptyLatestNextFocus = false } = {}) {
  return [
    {
      id: "fb_minji_1",
      session_date: "2026-12-06",
      session_number: 1,
      sport: "ski",
      instructor_display_name: "이강사",
      items: buildItems("ski", minjiSession1Marks, {
        commentsByCode: minjiSession1Comments,
        // 1회차: 스노우플라우턴·스템턴을 다음에 배울 단계로 (표시+다음 = 보강)
        nextStepCodes: ["SKI_SNOWPLOW_TURN", "SKI_STEM_TURN"],
      }),
      day_summary: MINJI_S1_DAY,
      next_focus: MINJI_S1_NEXT,
      instructor_note: MINJI_S1_NOTE,
    },
    {
      id: "fb_minji_2",
      session_date: "2026-12-13",
      session_number: 2,
      sport: "ski",
      instructor_display_name: "이강사",
      items: buildItems("ski", minjiSession2Marks, {
        commentsByCode: minjiSession2Comments,
        nextStepCodes: ["SKI_PARALLEL"],
      }),
      day_summary: MINJI_S2_DAY,
      next_focus: emptyLatestNextFocus ? "" : MINJI_S2_NEXT,
      instructor_note: MINJI_S2_NOTE,
    },
  ];
}

/** 1. 민지 본편 — mockup-v5 customer.html */
const minjiMainRaw = {
  student_key: "stu_minji_main",
  display_name: "김민지",
  sport: "ski",
  is_junior_eligible: false,
  badges: [
    earnedBadge("BADGE_SKI_JR_01", "2026-12-06T00:00:00.000Z"),
  ].filter(Boolean),
  progress: {
    per_step_latest_mark: marksArray("ski", minjiSession2Marks),
    current_milestone_label: null,
    steps_to_next_milestone: null,
    next_milestone_label: "레벨1 취득 도전",
  },
  feedbacks: buildMinjiFeedbacks(),
};

/** 2. next_focus 빈 최신 회차 — 단계 이름만 표시 캡처용 */
const noguideStudentRaw = {
  student_key: "stu_noguide",
  display_name: "김민지",
  sport: "ski",
  is_junior_eligible: false,
  badges: [],
  progress: {
    per_step_latest_mark: marksArray("ski", minjiSession2Marks),
    current_milestone_label: null,
    steps_to_next_milestone: null,
    next_milestone_label: "레벨1 취득 도전",
  },
  feedbacks: buildMinjiFeedbacks({ emptyLatestNextFocus: true }).map((fb, i) => ({
    ...fb,
    id: `fb_noguide_${i + 1}`,
  })),
};

/** 3. 보강(표시+is_next) + 또 다른 다음 단계 — 「조금 더 다듬기」 */
const reinforceLatestMarks = {
  SKI_SNOWPLOW: "o",
  SKI_SNOWPLOW_TURN: "o",
  SKI_STEM_TURN: "o",
  SKI_PARALLEL: "triangle",
};

const reinforceStudentRaw = {
  student_key: "stu_reinforce",
  display_name: "박보강",
  sport: "ski",
  is_junior_eligible: false,
  badges: [],
  progress: {
    per_step_latest_mark: marksArray("ski", reinforceLatestMarks),
    current_milestone_label: null,
    steps_to_next_milestone: null,
    next_milestone_label: "레벨1 취득 도전",
  },
  feedbacks: [
    {
      id: "fb_reinforce_1",
      session_date: "2026-12-06",
      session_number: 1,
      sport: "ski",
      instructor_display_name: "최강사",
      items: buildItems("ski", minjiSession1Marks, {
        commentsByCode: minjiSession1Comments,
        nextStepCodes: ["SKI_SNOWPLOW_TURN", "SKI_STEM_TURN"],
      }),
      day_summary: MINJI_S1_DAY,
      next_focus: MINJI_S1_NEXT,
      instructor_note: MINJI_S1_NOTE,
    },
    {
      id: "fb_reinforce_2",
      session_date: "2026-12-13",
      session_number: 2,
      sport: "ski",
      instructor_display_name: "최강사",
      items: buildItems("ski", minjiSession2Marks, {
        commentsByCode: minjiSession2Comments,
        nextStepCodes: ["SKI_PARALLEL"],
      }),
      day_summary: MINJI_S2_DAY,
      next_focus: MINJI_S2_NEXT,
      instructor_note: MINJI_S2_NOTE,
    },
    {
      id: "fb_reinforce_3",
      session_date: "2026-12-20",
      session_number: 3,
      sport: "ski",
      instructor_display_name: "최강사",
      items: buildItems("ski", reinforceLatestMarks, {
        commentsByCode: {
          SKI_SNOWPLOW: "멈추기는 안정적이에요.",
          SKI_SNOWPLOW_TURN: "턴 크기가 고르게 유지돼요.",
          SKI_STEM_TURN: "스템턴 리듬이 몸에 익었어요.",
          SKI_PARALLEL:
            "패러렐은 완만한 곳에서는 잘 되지만, 경사가 센 곳에서 두 스키가 벌어져요. 조금 더 다듬기 연습이 필요해요.",
        },
        // 패러렐 = 표시+다음(보강), 베이직 숏턴 = 다음만
        nextStepCodes: ["SKI_PARALLEL", "SKI_BASIC_SHORT"],
      }),
      day_summary:
        "패러렐을 처음 평가했어요. 완만한 경사에서는 두 스키가 모이지만, 급한 곳에서는 벌어지는 버릇이 남아 있어요.",
      next_focus:
        "베이직 숏턴: 짧은 리듬으로 폴 체킹을 넣어 보는 것부터 해요. 패러렐은 경사가 센 곳에서 두 스키가 벌어지지 않게 한 번 더 잡아요. (조금 더 다듬기)",
      instructor_note:
        "보강 단계는 손님 화면에 「조금 더 다듬기」로 보여요. 패러렐 △와 베이직 숏턴 다음 단계를 함께 체크한 예시입니다.",
    },
  ],
};

/** 4. 스키 13단계 전부 표시, is_next_step 없음 (모든 단계 완료) */
const alldoneMarks = Object.fromEntries(
  stepsFor("ski").map((s) => [
    s.code,
    s.code === "SKI_MOGUL" ||
    s.code === "SKI_GATE" ||
    s.code === "SKI_FREE_RUN"
      ? "triangle"
      : "o",
  ]),
);

const alldoneComments = Object.fromEntries(
  stepsFor("ski").map((s) => [
    s.code,
    `${s.label} 단계까지 잘 왔어요. 오늘 평가를 남깁니다.`,
  ]),
);

const alldoneStudentRaw = {
  student_key: "stu_alldone",
  display_name: "이완료",
  sport: "ski",
  is_junior_eligible: false,
  badges: [
    earnedBadge("BADGE_SKI_KSIA_L1", "2027-01-10T00:00:00.000Z"),
    earnedBadge("BADGE_SKI_KSIA_L2", "2027-02-14T00:00:00.000Z"),
  ].filter(Boolean),
  progress: {
    per_step_latest_mark: marksArray("ski", alldoneMarks),
    current_milestone_label: "레벨2 취득 도전",
    steps_to_next_milestone: 0,
    next_milestone_label: null,
  },
  feedbacks: [
    {
      id: "fb_alldone_1",
      session_date: "2027-02-21",
      session_number: 12,
      sport: "ski",
      instructor_display_name: "한강사",
      items: buildItems("ski", alldoneMarks, {
        commentsByCode: alldoneComments,
        nextStepCodes: [],
      }),
      day_summary:
        "자율활강까지 표시가 있어서 미리 체크할 다음 단계가 없어요. 모든 단계를 한 번씩은 평가했습니다.",
      next_focus: "모든 단계 완료",
      instructor_note:
        "보강이 필요하면 목록에서 직접 체크해 주세요. 오늘은 다음 단계 체크가 없습니다.",
    },
  ],
};

/** 5. 긴 글(~3000자) 랩 검증 */
const LONG_DAY = longKorean(
  "오늘 강습 종합 피드백입니다. 자세와 리듬, 속도 조절을 꼼꼼히 보았어요. ",
);
const LONG_COMMENT = longKorean(
  "이 단계 코멘트입니다. 체중 이동과 시선, 스키 각도를 반복해서 연습해 주세요. ",
);
const LONG_NEXT = longKorean(
  "다음에 배울 것 안내입니다. 패러렐 스탠스를 유지하며 롱턴부터 익혀 봐요. ",
);
const LONG_NOTE = longKorean(
  "강사 의견입니다. 다음 강습 전에 초급 코스에서 복습하시면 좋아요. ",
);

const longtextMarks = {
  SKI_SNOWPLOW: "o",
  SKI_SNOWPLOW_TURN: "triangle",
};

const longtextStudentRaw = {
  student_key: "stu_longtext",
  display_name: "최긴글",
  sport: "ski",
  is_junior_eligible: false,
  badges: [],
  progress: {
    per_step_latest_mark: marksArray("ski", longtextMarks),
    current_milestone_label: null,
    steps_to_next_milestone: null,
    next_milestone_label: null,
  },
  feedbacks: [
    {
      id: "fb_longtext_1",
      session_date: "2026-12-15",
      session_number: 1,
      sport: "ski",
      instructor_display_name: "김강사",
      items: buildItems("ski", longtextMarks, {
        commentsByCode: {
          SKI_SNOWPLOW: LONG_COMMENT,
          SKI_SNOWPLOW_TURN: LONG_COMMENT,
        },
        nextStepCodes: ["SKI_STEM_TURN"],
      }),
      day_summary: LONG_DAY,
      next_focus: LONG_NEXT,
      instructor_note: LONG_NOTE,
    },
  ],
};

/** 6. 주니어 보드 — /junior 테스트용 */
const boardMarks3 = {
  SB_SIDESLIP: "o",
  SB_PENDULUM: "o",
  SB_TRAVERSE_GARLAND: "triangle",
  SB_HALF_TURN: "x",
};

const juniorBoardStudentRaw = {
  student_key: "stu_junior_board",
  display_name: "이서아",
  sport: "board",
  is_junior_eligible: true,
  badges: [
    earnedBadge("BADGE_SB_JR_01", "2026-01-10T00:00:00.000Z"),
    earnedBadge("BADGE_SB_JR_02", "2026-01-18T00:00:00.000Z"),
    earnedBadge("BADGE_SB_KSIA_L1", "2026-01-22T00:00:00.000Z"),
  ].filter(Boolean),
  progress: {
    per_step_latest_mark: marksArray("board", boardMarks3),
    current_milestone_label: "레벨1 취득 도전",
    steps_to_next_milestone: 3,
    next_milestone_label: "티칭1 취득 도전",
  },
  feedbacks: [
    {
      id: "fb_board_1",
      session_date: "2026-01-11",
      session_number: 1,
      sport: "board",
      instructor_display_name: "박강사",
      items: buildItems(
        "board",
        { SB_SIDESLIP: "triangle", SB_PENDULUM: "x" },
        {
          commentsByCode: {
            SB_SIDESLIP: "사이드슬리핑 감각을 익히는 중이에요.",
            SB_PENDULUM: "좌우 이동이 아직 어려워요.",
          },
          nextStepCodes: ["SB_PENDULUM"],
        },
      ),
      day_summary: "첫 보드 강습. 균형 잡는 연습부터 했어요.",
      next_focus: "펜듈럼 좌우 이동",
      instructor_note: "사이드슬리핑 감각을 익히는 중이에요.",
    },
    {
      id: "fb_board_2",
      session_date: "2026-01-18",
      session_number: 2,
      sport: "board",
      instructor_display_name: "박강사",
      items: buildItems(
        "board",
        {
          SB_SIDESLIP: "o",
          SB_PENDULUM: "triangle",
          SB_TRAVERSE_GARLAND: "x",
        },
        {
          commentsByCode: {
            SB_SIDESLIP: "사이드슬리핑이 안정됐어요.",
            SB_PENDULUM: "펜듈럼이 점점 편해져요.",
            SB_TRAVERSE_GARLAND: "갈란데는 처음이라 아직 어려워요.",
          },
          nextStepCodes: ["SB_TRAVERSE_GARLAND"],
        },
      ),
      day_summary: "사이드슬리핑이 안정됐고 펜듈럼을 연습했어요.",
      next_focus: "갈란데 연결",
      instructor_note: "사이드슬리핑이 안정됐어요. △→○",
    },
    {
      id: "fb_board_3",
      session_date: "2026-01-25",
      session_number: 3,
      sport: "board",
      instructor_display_name: "박강사",
      items: buildItems("board", boardMarks3, {
        commentsByCode: {
          SB_SIDESLIP: "완벽하게 멈출 수 있어요.",
          SB_PENDULUM: "펜듈럼이 통과예요.",
          SB_TRAVERSE_GARLAND: "갈란데 연결이 연습 중이에요.",
          SB_HALF_TURN: "하프턴은 아직 어려워요.",
        },
        nextStepCodes: ["SB_HALF_TURN", "SB_BEGINNER_TURN"],
      }),
      day_summary: "펜듈럼이 통과했고 하프턴을 시작했어요.",
      next_focus: "하프턴 연습, 이어서 비기너턴",
      instructor_note: "펜듈럼이 통과예요.",
    },
  ],
};

const ALL_STUDENTS = [
  forCustomer(minjiMainRaw),
  forCustomer(reinforceStudentRaw),
  forCustomer(noguideStudentRaw),
  forCustomer(alldoneStudentRaw),
  forCustomer(longtextStudentRaw),
  forCustomer(juniorBoardStudentRaw),
];

const MINJI_MAIN = ALL_STUDENTS[0];

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function unauthorized(res) {
  send(res, 401, { ok: false, error: "unauthorized" });
}

function checkAuth(req) {
  return (req.headers.authorization || "") === `Bearer ${TOKEN}`;
}

function expiresAt(days = 90) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return send(res, 200, {
      ok: true,
      seed_version: seed.version,
      badges: seed.badges.length,
      steps: seed.steps.length,
    });
  }

  if (url.pathname === "/api/reservations") {
    return send(res, 200, { success: true, data: [] });
  }

  if (!url.pathname.startsWith("/api/customer-feedback/")) {
    return send(res, 404, { ok: false, error: "not_found" });
  }
  if (!checkAuth(req)) return unauthorized(res);

  let body = {};
  try {
    body = await readBody(req);
  } catch {
    return send(res, 400, { ok: false, error: "bad_json" });
  }

  const action = url.pathname.replace("/api/customer-feedback/", "");

  if (action === "login" && req.method === "POST") {
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").replace(/\D/g, "");
    const key = `${body.client_ip || "ip"}`;
    if (name === "잠금") return send(res, 200, { ok: false, error: "locked" });
    if (name === "한도") return send(res, 200, { ok: false, error: "rate_limited" });
    if (name !== "테스트" || phone !== "01012345678") {
      loginFails.set(key, (loginFails.get(key) || 0) + 1);
      return send(res, 200, { ok: false, error: "invalid" });
    }
    loginFails.set(key, 0);
    const session_token = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const exp = expiresAt(90);
    sessions.set(session_token, { exp, share: body.share_token || null });
    return send(res, 200, { ok: true, session_token, expires_at: exp });
  }

  if (action === "session" && req.method === "POST") {
    const s = sessions.get(body.session_token);
    if (!s) return send(res, 200, { ok: false });
    return send(res, 200, { ok: true, expires_at: s.exp });
  }

  if (action === "logout" && req.method === "POST") {
    sessions.delete(body.session_token);
    return send(res, 200, { ok: true });
  }

  if (action === "list" && req.method === "POST") {
    const s = sessions.get(body.session_token);
    if (!s) return send(res, 200, { ok: false });
    // scenario 쿼리는 선택 — 기본은 전원 반환(캡처가 스크롤/선택)
    return send(res, 200, { ok: true, students: ALL_STUDENTS });
  }

  if (action === "by-token" && req.method === "POST") {
    if (body.share_token !== "demo-share-token") {
      return send(res, 200, { ok: false, error: "invalid" });
    }
    const s = body.session_token ? sessions.get(body.session_token) : null;
    if (!s) {
      return send(res, 200, {
        ok: true,
        needs_login: true,
        hint: { display_name_initial: "김*지", session_date: "2026-12-13" },
      });
    }
    return send(res, 200, {
      ok: true,
      students: [MINJI_MAIN],
    });
  }

  return send(res, 404, { ok: false, error: "not_found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock-customer-feedback-admin] http://127.0.0.1:${PORT}`);
  console.log(
    `  seed ${seed.version} · steps ${seed.steps.length} · badges ${seed.badges.length}`,
  );
  console.log(`  login: 테스트 / 01012345678 · share: demo-share-token`);
  console.log(
    `  students: ${ALL_STUDENTS.map((s) => s.student_key).join(", ")}`,
  );
});
