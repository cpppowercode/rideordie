/**
 * 손님 '내 강습 조회' — 서버 전용.
 * 이름+휴대폰으로 본인 확인 후에만 요약 정보를 반환한다 (PII 최소화).
 */
import { getSupabaseServer } from "@/lib/supabase-server";
import { ADMIN_TENANT_ID } from "@/lib/site";
import { validateMyLessonLookupInput } from "@/lib/my-lessons-shared";

export type MyLessonSummary = {
  id: string;
  kind: "regular" | "season";
  lessonDate: string | null;
  skiResort: string | null;
  lessonType: string | null;
  participants: number | null;
  progressStatus: string | null;
  reservationStatus: string | null;
};

export { validateMyLessonLookupInput };

export async function lookupMyLessons(input: {
  customerName: string;
  customerPhone: string;
}): Promise<{ ok: true; lessons: MyLessonSummary[] } | { ok: false; error: string }> {
  const checked = validateMyLessonLookupInput(input);
  if (!checked.ok) return checked;
  const { name, phone } = checked;

  const tenantId = ADMIN_TENANT_ID;
  const supabase = getSupabaseServer();

  const paymentSelect =
    "id,lesson_date,ski_resort,lesson_type,participants,progress_status,reservation_status";
  const seasonSelect =
    "id,lesson_date,ski_resorts,lesson_type,participants,progress_status";

  const [{ data: payments, error: pErr }, { data: seasons, error: sErr }] = await Promise.all([
    supabase
      .from("payments")
      .select(paymentSelect)
      .eq("tenant_id", tenantId)
      .eq("customer_name", name)
      .eq("customer_phone", phone)
      .order("lesson_date", { ascending: true })
      .limit(50),
    supabase
      .from("season_lessons")
      .select(seasonSelect)
      .eq("tenant_id", tenantId)
      .eq("customer_name", name)
      .eq("customer_phone", phone)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (pErr || sErr) {
    console.error("[my-lessons] lookup failed", pErr?.message || sErr?.message);
    return { ok: false, error: "조회에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }

  const lessons: MyLessonSummary[] = [
    ...(payments || []).map((row) => ({
      id: String(row.id),
      kind: "regular" as const,
      lessonDate: row.lesson_date ? String(row.lesson_date).slice(0, 10) : null,
      skiResort: row.ski_resort ? String(row.ski_resort) : null,
      lessonType: row.lesson_type ? String(row.lesson_type) : null,
      participants: typeof row.participants === "number" ? row.participants : null,
      progressStatus: row.progress_status ? String(row.progress_status) : null,
      reservationStatus: row.reservation_status ? String(row.reservation_status) : null,
    })),
    ...(seasons || []).map((row) => ({
      id: String(row.id),
      kind: "season" as const,
      lessonDate: row.lesson_date ? String(row.lesson_date).slice(0, 10) : null,
      skiResort: Array.isArray(row.ski_resorts)
        ? row.ski_resorts.join(", ")
        : row.ski_resorts
          ? String(row.ski_resorts)
          : null,
      lessonType: row.lesson_type ? String(row.lesson_type) : null,
      participants: typeof row.participants === "number" ? row.participants : null,
      progressStatus: row.progress_status ? String(row.progress_status) : null,
      reservationStatus: null,
    })),
  ];

  return { ok: true, lessons };
}
