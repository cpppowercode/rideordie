/**
 * 서버 전용 Supabase 클라이언트 (service_role).
 * 브라우저·anon 키로 payments/season_lessons 를 직접 읽지 않는다.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    throw new Error("Supabase 서버 설정이 없습니다.");
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
