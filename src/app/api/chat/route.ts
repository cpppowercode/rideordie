import { NextResponse } from "next/server";
import { getSeasonSettings } from "@/lib/season-settings";
import { getChatbotSettings } from "@/lib/chatbot/settings";
import { answer, gatewayAi, paidAllowed } from "@/lib/chatbot/engine";
import { UsageLimiter } from "@/lib/chatbot/limits";
import { PRESETS } from "@/lib/chatbot/presets";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import { enforceRateLimit, readJsonBody } from "@/lib/security/request";

export const dynamic = "force-dynamic";
const limiter = new UsageLimiter();

/** 위젯이 켜져 있는지 + 프리셋 목록. */
export async function GET(req: Request) {
  const limited = enforceRateLimit(req, "chatGet", { windowMs: 60_000, max: 60 });
  if (limited) return limited;
  const s = await getChatbotSettings();
  return NextResponse.json({ enabled: s.enabled, presets: s.enabled ? PRESETS : [], mode: paidAllowed() ? "ai" : "mock" });
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "chat", RATE_LIMITS.chat);
  if (limited) return limited;

  const s = await getChatbotSettings();
  if (!s.enabled) return NextResponse.json({ error: "disabled" }, { status: 404 });

  const parsed = await readJsonBody<{
    sessionId?: unknown;
    question?: unknown;
    presetId?: unknown;
    history?: unknown;
  }>(req);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const sessionId = String(body.sessionId || req.headers.get("x-forwarded-for") || "anon").slice(0, 80);
  const question = body.question == null ? undefined : String(body.question).slice(0, 2000);
  const presetId = body.presetId == null ? undefined : String(body.presetId).slice(0, 64);
  const history = Array.isArray(body.history) ? body.history.slice(0, 20) : [];

  const reply = await answer(
    { question, presetId, history, sessionId },
    { settings: await getSeasonSettings(), limiter, ai: paidAllowed() ? await gatewayAi() : null },
  );
  return NextResponse.json({ text: reply.text, via: reply.via });
}
