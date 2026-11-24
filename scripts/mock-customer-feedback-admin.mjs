#!/usr/bin/env node
/**
 * 로컬 전용 어드민 피드백 API mock.
 * 운영 DB에 쓰지 않는다. ADMIN_RESERVATIONS_URL 을
 *   http://127.0.0.1:4099/api/reservations
 * 로 두면 origin 이 http://127.0.0.1:4099 로 파생된다.
 *
 * 계정: 이름 "테스트" / 전화 01012345678
 * 공유 토큰: demo-share-token
 * 잠금 유도: 이름 "잠금"
 */
import http from "node:http";

const PORT = Number(process.env.MOCK_ADMIN_PORT || 4099);
const TOKEN = process.env.ADMIN_API_TOKEN || "test-admin-token";

const sessions = new Map();
const loginFails = new Map();

const juniorStudent = {
  student_key: "stu_junior",
  display_name: "김민준",
  sport: "ski",
  is_junior_eligible: true,
  badges: [
    {
      code: "junior_level1",
      label: "레벨1",
      sport: "ski",
      earned_at: "2026-01-10T00:00:00.000Z",
    },
    {
      code: "board_balance",
      label: "보드 균형",
      sport: "board",
      earned_at: "2026-01-20T00:00:00.000Z",
    },
  ],
  progress: {
    per_step_latest_mark: ["o", "o", "triangle", "x", null],
    current_milestone_label: "레벨1 취득 도전",
    steps_to_next_milestone: 2,
    next_milestone_label: "레벨2 도전",
  },
  feedbacks: [
    {
      id: "fb1",
      session_date: "2026-01-05",
      sport: "ski",
      instructor_display_name: "이강사",
      items: [
        { label: "기본 자세", kind: "step", mark: "o" },
        { label: "플라우 스톱", kind: "step", mark: "triangle" },
        { label: "레벨1 취득 도전", kind: "milestone", mark: null },
        { label: "완만한 사면 활주", kind: "step", mark: "x" },
      ],
      next_focus: "플라우로 속도 줄이기",
      instructor_note: "잘 따라와요. 다음엔 정지에 집중해요.",
    },
    {
      id: "fb2",
      session_date: "2026-01-12",
      sport: "ski",
      instructor_display_name: "이강사",
      items: [
        { label: "기본 자세", kind: "step", mark: "o" },
        { label: "플라우 스톱", kind: "step", mark: "o" },
        { label: "레벨1 취득 도전", kind: "milestone", mark: null },
        { label: "완만한 사면 활주", kind: "step", mark: "triangle" },
      ],
      next_focus: "사면 활주 균형",
      instructor_note: "플라우가 안정됐어요.",
    },
    {
      id: "fb3",
      session_date: "2026-01-18",
      sport: "board",
      instructor_display_name: "박강사",
      items: [
        { label: "보드 균형", kind: "step", mark: "o" },
        { label: "힐사이드 슬립", kind: "step", mark: "triangle" },
      ],
      next_focus: "토사이드",
      instructor_note: "보드도 재미있어해요.",
    },
  ],
};

const adultStudent = {
  student_key: "stu_adult",
  display_name: "박서연",
  sport: "board",
  is_junior_eligible: false,
  badges: [
    {
      code: "junior_level1",
      label: "레벨1",
      sport: "board",
      earned_at: "2026-01-01T00:00:00.000Z",
    },
    {
      code: "board_carve",
      label: "카빙 입문",
      sport: "board",
      earned_at: "2026-02-01T00:00:00.000Z",
    },
  ],
  progress: {
    per_step_latest_mark: ["o", "triangle"],
    current_milestone_label: null,
    steps_to_next_milestone: null,
    next_milestone_label: null,
  },
  feedbacks: [
    {
      id: "fb_a1",
      session_date: "2026-02-01",
      sport: "board",
      instructor_display_name: "최강사",
      items: [
        { label: "엣지 감각", kind: "step", mark: "o" },
        { label: "짧은 턴", kind: "step", mark: "triangle" },
      ],
      next_focus: "리듬 유지",
      instructor_note: "안정적이에요.",
    },
  ],
};

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
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(json);
}

function unauthorized(res) {
  send(res, 401, { ok: false, error: "unauthorized" });
}

function checkAuth(req) {
  const h = req.headers.authorization || "";
  return h === `Bearer ${TOKEN}`;
}

function expiresAt(days = 90) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return send(res, 200, { ok: true });
  }

  // homepage derives base from .../api/reservations
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

    if (name === "잠금") {
      return send(res, 200, { ok: false, error: "locked" });
    }
    if (name === "한도") {
      return send(res, 200, { ok: false, error: "rate_limited" });
    }

    const fails = loginFails.get(key) || 0;
    if (name !== "테스트" || phone !== "01012345678") {
      loginFails.set(key, fails + 1);
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
    return send(res, 200, { ok: true, students: [juniorStudent, adultStudent] });
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
    return send(res, 200, { ok: true, students: [juniorStudent] });
  }

  return send(res, 404, { ok: false, error: "not_found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock-customer-feedback-admin] http://127.0.0.1:${PORT}`);
  console.log(`  login: 테스트 / 01012345678`);
  console.log(`  share: demo-share-token`);
});
