import { NextResponse } from "next/server";
import { getSeasonSettings } from "@/lib/season-settings";
import { getChatbotSettings } from "@/lib/chatbot/settings";
import { answer, gatewayAi, paidAllowed } from "@/lib/chatbot/engine";
import { UsageLimiter } from "@/lib/chatbot/limits";
import { PRESETS } from "@/lib/chatbot/presets";

export const dynamic = "force-dynamic";
const limiter = new UsageLimiter();

/** 위젯이 켜져 있는지 + 프리셋 목록. */
export async function GET() {
  const s = await getChatbotSettings();
  return NextResponse.json({ enabled: s.enabled, presets: s.enabled ? PRESETS : [], mode: paidAllowed() ? "ai" : "mock" });
}

export async function POST(req: Request) {
  const s = await getChatbotSettings();
  if (!s.enabled) return NextResponse.json({ error: "disabled" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const sessionId = String(body.sessionId || req.headers.get("x-forwarded-for") || "anon").slice(0, 80);
  const reply = await answer(
    { question: body.question, presetId: body.presetId, history: Array.isArray(body.history) ? body.history : [], sessionId },
    { settings: await getSeasonSettings(), limiter, ai: paidAllowed() ? await gatewayAi() : null },
  );
  return NextResponse.json({ text: reply.text, via: reply.via });
}
