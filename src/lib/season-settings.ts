import { normalizeSettings, DEFAULT_SETTINGS as UNSET_SETTINGS, type SeasonSettings } from "@/lib/pricing";
import { ADMIN_TENANT_ID } from "@/lib/site";

/**
 * 어드민 시즌 날짜 설정 읽기. 실패하거나 값이 없으면 '미설정'(일반 요금표)으로 둔다.
 * GET {ADMIN_BASE}/api/season-settings → { seasonStart, seasonEnd }
 */
export const SEASON_SETTINGS_URL =
  process.env.ADMIN_SEASON_SETTINGS_URL || "https://admin.rideordie.kr/api/season-settings";

export async function getSeasonSettings(): Promise<SeasonSettings> {
  if (process.env.SEASON_SETTINGS_OFFLINE === "1") return UNSET_SETTINGS;
  try {
    const headers: Record<string, string> = { "X-Tenant-Id": ADMIN_TENANT_ID };
    const token = process.env.ADMIN_API_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${SEASON_SETTINGS_URL}?tenantId=${encodeURIComponent(ADMIN_TENANT_ID)}`, {
      headers,
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return UNSET_SETTINGS;
    const json = await res.json();
    return normalizeSettings(json?.data ?? json);
  } catch {
    return UNSET_SETTINGS;
  }
}
