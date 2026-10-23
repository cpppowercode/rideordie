import { ADMIN_RESERVATIONS_URL, ADMIN_TENANT_ID } from "@/lib/site";
import type { ExistingReservation } from "@/lib/booking";

export type AdminReservation = ExistingReservation & {
  id?: string;
  order_no?: string | null;
  customer_name?: string | null;
  lesson_type?: string | null;
  notes?: string | null;
  payment_status?: string | null;
  reservation_status?: string | null;
};

type AdminListResponse = {
  success?: boolean;
  data?: AdminReservation[];
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

export async function listReservations(options: {
  dateFrom?: string;
  dateTo?: string;
  skiResort?: string;
  searchQuery?: string;
  limit?: number;
}): Promise<AdminReservation[]> {
  const params = new URLSearchParams({
    tenantId: ADMIN_TENANT_ID,
    showAllLessons: "true",
    limit: String(options.limit ?? 200),
  });
  if (options.dateFrom) params.set("dateFrom", options.dateFrom);
  if (options.dateTo) params.set("dateTo", options.dateTo);
  if (options.skiResort) params.set("skiResort", options.skiResort);
  if (options.searchQuery) params.set("searchQuery", options.searchQuery);

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

export async function listReservationsForDate(options: {
  date: string;
  skiResort?: string;
}): Promise<ExistingReservation[]> {
  return listReservations({
    dateFrom: options.date,
    dateTo: options.date,
    skiResort: options.skiResort,
  });
}

export async function findReservationByOrderNo(orderNo: string): Promise<AdminReservation | null> {
  const rows = await listReservations({ searchQuery: orderNo, limit: 50 });
  const exact = rows.find((row) => row.order_no === orderNo);
  if (exact) return exact;
  return rows.find((row) => (row.order_no || "").includes(orderNo)) || null;
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

export async function updateAdminReservation(id: string, patch: Record<string, unknown>) {
  const response = await fetch(ADMIN_RESERVATIONS_URL, {
    method: "PUT",
    headers: adminHeaders(true),
    body: JSON.stringify({
      id,
      tenant_id: ADMIN_TENANT_ID,
      ...patch,
    }),
  });
  const body = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
    message?: string;
  };
  if (!response.ok || body.success === false || body.error) {
    throw new Error(body.error || body.message || `예약 수정에 실패했습니다. (${response.status})`);
  }
  return body;
}

export async function cancelAdminReservation(id: string) {
  return updateAdminReservation(id, {
    reservation_status: "cancelled",
    payment_status: "cancelled",
  });
}

export async function deleteAdminReservation(id: string) {
  const response = await fetch(ADMIN_RESERVATIONS_URL, {
    method: "DELETE",
    headers: adminHeaders(true),
    body: JSON.stringify({
      id,
      tenant_id: ADMIN_TENANT_ID,
    }),
  });
  const body = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
    message?: string;
  };
  if (!response.ok || body.success === false || body.error) {
    throw new Error(body.error || body.message || `예약 삭제에 실패했습니다. (${response.status})`);
  }
  return body;
}
