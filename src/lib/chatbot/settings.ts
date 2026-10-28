/**
 * 챗봇 켜기/끄기: 어드민 GET {ADMIN}/api/chatbot-settings → { enabled }.
 * 읽기 실패·값 없음이면 꺼짐(OFF). 기본값 OFF.
 * 미리보기 전용: CHATBOT_PREVIEW=1 이고 VERCEL_ENV 가 production 이 아닐 때만 켬(운영에서는 무시).
 */
import { ADMIN_TENANT_ID } from "@/lib/site";

export type ChatbotSettings = { enabled: boolean; source: "admin" | "preview" | "fallback" };
export const CHATBOT_SETTINGS_URL = process.env.ADMIN_CHATBOT_SETTINGS_URL || "https://admin.rideordie.kr/api/chatbot-settings";

export function parseChatbotSettings(json: unknown): boolean {
  const v = (json as { data?: { enabled?: unknown }; enabled?: unknown } | null) ?? null;
  return (v?.data?.enabled ?? v?.enabled) === true;
}

export async function getChatbotSettings(fetcher: typeof fetch = fetch): Promise<ChatbotSettings> {
  if (process.env.CHATBOT_PREVIEW === "1" && process.env.VERCEL_ENV !== "production") return { enabled: true, source: "preview" };
  if (process.env.SEASON_SETTINGS_OFFLINE === "1") return { enabled: false, source: "fallback" };
  try {
    const res = await fetcher(`${CHATBOT_SETTINGS_URL}?tenantId=${encodeURIComponent(ADMIN_TENANT_ID)}`, {
      headers: { "X-Tenant-Id": ADMIN_TENANT_ID }, signal: AbortSignal.timeout(3000), cache: "no-store",
    });
    if (!res.ok) return { enabled: false, source: "fallback" };
    return { enabled: parseChatbotSettings(await res.json()), source: "admin" };
  } catch {
    return { enabled: false, source: "fallback" };
  }
}
