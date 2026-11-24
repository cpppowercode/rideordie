#!/usr/bin/env node
/**
 * 로컬 전용 어드민 피드백 API mock.
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
 * 위치는 시드 milestones[].after_step 만 따른다(홈페이지에 고정하지 않음).
 */
function buildItems(sport, marksByCode) {
  const steps = stepsFor(sport);
  const milestones = milestonesFor(sport);
  const afterMap = new Map();
  for (const ms of milestones) {
    const after = typeof ms.after_step === "string" ? ms.after_step.trim() : "";
    if (!after) continue;
    if (!afterMap.has(after)) afterMap.set(after, []);
    afterMap.get(after).push(ms);
  }

  const items = [];
  for (const step of steps) {
    const mark = Object.prototype.hasOwnProperty.call(marksByCode, step.code)
      ? marksByCode[step.code]
      : null;
    items.push({ label: step.label, kind: "step", mark });
    for (const ms of afterMap.get(step.code) || []) {
      items.push({ label: ms.label, kind: "milestone", mark: null });
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

const skiMarksEarly = {
  SKI_SNOWPLOW: "o",
  SKI_SNOWPLOW_TURN: "triangle",
  SKI_STEM_EARLY: "x",
  SKI_STEM_MID: null,
  SKI_STEM_LATE: null,
  SKI_PARALLEL: null,
  SKI_BASIC_SHORT: null,
  SKI_DYNAMIC: null,
  SKI_DYNAMIC_SHORT: null,
};

const skiMarksLater = {
  SKI_SNOWPLOW: "o",
  SKI_SNOWPLOW_TURN: "o",
  SKI_STEM_EARLY: "o",
  SKI_STEM_MID: "o",
  SKI_STEM_LATE: "o",
  SKI_PARALLEL: "o",
  SKI_BASIC_SHORT: "triangle",
  SKI_DYNAMIC: "x",
  SKI_DYNAMIC_SHORT: null,
  SKI_BASIC_CARVING: null,
  SKI_CARVING_LONG: null,
  SKI_CARVING_SHORT: null,
  SKI_MOGUL: null,
  SKI_GATE: null,
  SKI_FREE_RUN: null,
};

const boardMarks1 = {
  SB_SIDESLIP: "triangle",
  SB_PENDULUM: "x",
  SB_TRAVERSE_GARLAND: null,
};

const boardMarks2 = {
  SB_SIDESLIP: "o",
  SB_PENDULUM: "triangle",
  SB_TRAVERSE_GARLAND: "x",
  SB_HALF_TURN: null,
};

const boardMarks3 = {
  SB_SIDESLIP: "o",
  SB_PENDULUM: "o",
  SB_TRAVERSE_GARLAND: "triangle",
  SB_HALF_TURN: "x",
  SB_BEGINNER_TURN: null,
};

/** 어드민 list 계약과 같이 feedbacks → step_groups 로 묶는다. */
function buildStepGroups(feedbacks) {
  const sessions = feedbacks
    .slice()
    .sort((a, b) => a.session_date.localeCompare(b.session_date));
  const order = [];
  const seen = new Set();
  for (const fb of sessions) {
    for (const item of fb.items || []) {
      const kind = item.kind === "milestone" ? "milestone" : "step";
      const key = `${kind}::${item.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      order.push({ key, label: item.label, kind, sport: fb.sport });
    }
  }
  const roundsByKey = new Map();
  for (const fb of sessions) {
    for (const item of fb.items || []) {
      if (item.kind === "milestone") continue;
      const key = `step::${item.label}`;
      const list = roundsByKey.get(key) || [];
      list.push({
        feedback_id: fb.id,
        round: list.length + 1,
        session_date: fb.session_date,
        instructor_display_name: fb.instructor_display_name,
        mark: item.mark ?? null,
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

function withStepGroups(student) {
  return { ...student, step_groups: buildStepGroups(student.feedbacks) };
}

const skiMarksMid = {
  SKI_SNOWPLOW: "o",
  SKI_SNOWPLOW_TURN: "o",
  SKI_STEM_EARLY: "triangle",
  SKI_STEM_MID: "x",
  SKI_STEM_LATE: null,
  SKI_PARALLEL: null,
  SKI_BASIC_SHORT: null,
};

const juniorSkiStudent = withStepGroups({
  student_key: "stu_junior_ski",
  display_name: "김민준",
  sport: "ski",
  is_junior_eligible: true,
  badges: [
    earnedBadge("BADGE_SKI_JR_01", "2026-01-08T00:00:00.000Z"),
    earnedBadge("BADGE_SKI_JR_02", "2026-01-15T00:00:00.000Z"),
    earnedBadge("BADGE_SKI_KSIA_L1", "2026-01-20T00:00:00.000Z"),
  ].filter(Boolean),
  progress: {
    per_step_latest_mark: marksArray("ski", skiMarksLater),
    current_milestone_label: "레벨1 취득 도전",
    steps_to_next_milestone: 2,
    next_milestone_label: "티칭1 취득 도전",
  },
  feedbacks: [
    {
      id: "fb_ski_1",
      session_date: "2026-01-05",
      sport: "ski",
      instructor_display_name: "이강사",
      items: buildItems("ski", skiMarksEarly),
      next_focus: "스노우플라우턴 연결",
      instructor_note: "기본 자세가 안정적이에요.",
    },
    {
      id: "fb_ski_2",
      session_date: "2026-01-12",
      sport: "ski",
      instructor_display_name: "이강사",
      items: buildItems("ski", skiMarksMid),
      next_focus: "스템 전·중 연습",
      instructor_note: "플라우턴이 자연스러워졌어요.",
    },
    {
      id: "fb_ski_3",
      session_date: "2026-01-19",
      sport: "ski",
      instructor_display_name: "이강사",
      items: buildItems("ski", skiMarksLater),
      next_focus: "베이직 숏턴 → 다이나믹",
      instructor_note: "패러렐까지 잘 왔어요. 숏턴을 다듬어 봐요.",
    },
  ],
});

const juniorBoardStudent = withStepGroups({
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
      sport: "board",
      instructor_display_name: "박강사",
      items: buildItems("board", boardMarks1),
      next_focus: "펜듈럼 좌우 이동",
      instructor_note: "사이드슬리핑 감각을 익히는 중이에요.",
    },
    {
      id: "fb_board_2",
      session_date: "2026-01-18",
      sport: "board",
      instructor_display_name: "박강사",
      items: buildItems("board", boardMarks2),
      next_focus: "갈란데 연결",
      instructor_note: "사이드슬리핑이 안정됐어요. △→○",
    },
    {
      id: "fb_board_3",
      session_date: "2026-01-25",
      sport: "board",
      instructor_display_name: "박강사",
      items: buildItems("board", boardMarks3),
      next_focus: "하프턴 연습",
      instructor_note: "펜듈럼이 통과예요.",
    },
  ],
});

const adultStudent = withStepGroups({
  student_key: "stu_adult",
  display_name: "박서연",
  sport: "board",
  is_junior_eligible: false,
  badges: [
    earnedBadge("BADGE_SB_JR_01", "2026-01-01T00:00:00.000Z"),
    earnedBadge("BADGE_SB_KSIA_L1", "2026-02-01T00:00:00.000Z"),
  ].filter(Boolean),
  progress: {
    per_step_latest_mark: marksArray("board", {
      SB_SIDESLIP: "o",
      SB_PENDULUM: "o",
      SB_TRAVERSE_GARLAND: "o",
      SB_HALF_TURN: "triangle",
    }),
    current_milestone_label: null,
    steps_to_next_milestone: null,
    next_milestone_label: null,
  },
  feedbacks: [
    {
      id: "fb_adult_1",
      session_date: "2026-01-28",
      sport: "board",
      instructor_display_name: "최강사",
      items: buildItems("board", {
        SB_SIDESLIP: "o",
        SB_PENDULUM: "triangle",
        SB_TRAVERSE_GARLAND: "x",
      }),
      next_focus: "펜듈럼",
      instructor_note: "균형이 좋아요.",
    },
    {
      id: "fb_adult_2",
      session_date: "2026-02-01",
      sport: "board",
      instructor_display_name: "최강사",
      items: buildItems("board", {
        SB_SIDESLIP: "o",
        SB_PENDULUM: "o",
        SB_TRAVERSE_GARLAND: "o",
        SB_HALF_TURN: "triangle",
      }),
      next_focus: "비기너턴",
      instructor_note: "리듬이 좋아요.",
    },
  ],
});

const ALL_STUDENTS = [juniorSkiStudent, juniorBoardStudent, adultStudent];

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
        hint: { display_name_initial: "김*준", session_date: "2026-01-12" },
      });
    }
    return send(res, 200, {
      ok: true,
      students: [juniorSkiStudent, juniorBoardStudent],
    });
  }

  return send(res, 404, { ok: false, error: "not_found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock-customer-feedback-admin] http://127.0.0.1:${PORT}`);
  console.log(`  seed ${seed.version} · steps ${seed.steps.length} · badges ${seed.badges.length}`);
  console.log(`  login: 테스트 / 01012345678 · share: demo-share-token`);
});
