import { ADMIN_RESERVATIONS_URL, ADMIN_TENANT_ID } from "@/lib/site";
import type { ExistingReservation } from "@/lib/booking";

type AdminListResponse = {
  success?: boolean;
  data?: ExistingReservation[];
  count?: number;
  error?: string;
  message?: string;
};

function adminHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {
    "X-Tenant-Id": ADMIN_TENANT_ID,
  };
  if (json) headers["Content-Type"] = "application/json";
  const token = process.env.ADMIN_API_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function listReservationsForDate(options: {
  date: string;
  skiResort?: string;
}): Promise<ExistingReservation[]> {
  const params = new URLSearchParams({
    tenantId: ADMIN_TENANT_ID,
    dateFrom: options.date,
    dateTo: options.date,
    showAllLessons: "true",
    limit: "200",
  });
  if (options.skiResort) params.set("skiResort", options.skiResort);

  const response = await fetch(`${ADMIN_RESERVATIONS_URL}?${params.toString()}`, {
    headers: adminHeaders(),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as AdminListResponse;
  if (!response.ok || body.error) {
    throw new Error(body.error || body.message || `예약 현황을 불러오지 못했습니다. (${response.status})`);
  }
  return Array.isArray(body.data) ? body.data : [];
}

export async function createAdminReservation(payload: Record<string, unknown>) {
  const response = await fetch(ADMIN_RESERVATIONS_URL, {
    method: "POST",
    headers: adminHeaders(true),
    body: JSON.stringify({
      ...payload,
      tenant_id: ADMIN_TENANT_ID,
    }),
  });
  const body = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
    message?: string;
    details?: string;
    data?: { id?: string };
    id?: string;
  };

  if (!response.ok || body.success === false || body.error) {
    throw new Error(body.error || body.message || body.details || `예약 저장에 실패했습니다. (${response.status})`);
  }

  return {
    id: body.data?.id || body.id || null,
    raw: body,
  };
}
