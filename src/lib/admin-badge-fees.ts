/**
 * 패찰비(빕 / 강습허가권) 요율.
 *
 * Admin DB(`tenants.settings`, `payments`, 가격 테이블)에는 리조트별 패찰비·강습
 * 정가/얼리버드 표가 없습니다. 사장이 넣은 숫자는
 * `https://admin.rideordie.kr/Calculator` (시즌강습 가격 계산기) 프론트 JS의
 * `passFee` 공식입니다. 패널에서 공식을 바꾸면 그 JS를 다시 읽어 반영하고,
 * 페이지가 안 되면 아래에 적힌 fallback을 씁니다.
 *
 * 비발디: 인원 × 시간 × 12,500원 (인원당·시간당)
 * 지산: 인원당, 짝수 시간 구간 (2h 35,000 / 4h 50,000 / 6h 85,000).
 *       홀수 시간은 다음 짝수로 올림.
 */
import { ADMIN_ORIGIN } from "@/lib/site";

export type BadgeFeeSource = "admin-calculator" | "fallback";

export type AdminBadgeRates = {
  source: BadgeFeeSource;
  /** 비발디 패찰비. 인원 × 강습시간 × 이 값. */
  vivaldiPerPersonPerHour: number;
  /** 지산 패찰비. 짝수 시간(2/4/6)별 1인당 금액. */
  jisanPerPersonByEvenHours: Record<number, number>;
  /** 지산 4시간 초과 짝수 구간에서 2시간당 가산. */
  jisanExtraPairUnit: number;
};

export const FALLBACK_ADMIN_BADGE_RATES: AdminBadgeRates = {
  source: "fallback",
  vivaldiPerPersonPerHour: 12_500,
  jisanPerPersonByEvenHours: { 2: 35_000, 4: 50_000, 6: 85_000 },
  jisanExtraPairUnit: 12_500,
};

export type BadgeFeeQuote = {
  amount: number;
  /** 이번 강습 1인당 패찰비. */
  unit: number;
  basis: "per-person" | "per-lesson";
  label: string;
};

const CACHE_MS = 10 * 60 * 1000;
const FETCH_MS = 4_000;

let cached: { rates: AdminBadgeRates; at: number } | null = null;
let inflight: Promise<AdminBadgeRates> | null = null;

function positiveInt(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) return null;
  return value;
}

function parseJsNumber(raw: string): number | null {
  const trimmed = raw.replace(/_/g, "").trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return positiveInt(value);
}

function evenDurationHours(hours: number): number {
  const n = Math.max(0, Math.round(hours));
  if (n % 2 === 0) return n;
  return n + 1;
}

function jisanUnit(evenHours: number, rates: AdminBadgeRates): number {
  const exact = rates.jisanPerPersonByEvenHours[evenHours];
  if (typeof exact === "number" && exact > 0) return exact;
  const four = rates.jisanPerPersonByEvenHours[4] ?? 50_000;
  if (evenHours <= 0) return 0;
  return Math.round(four + ((evenHours - 4) / 2) * rates.jisanExtraPairUnit);
}

export function parseAdminCalculatorJs(source: string): AdminBadgeRates | null {
  const vivaldi = source.match(/"비발디"===?\w+\)\w+=\w+\*\w+\*(\d+(?:\.\d+)?(?:e[+\-]?\d+)?)/i);
  const vivaldiUnit = vivaldi ? parseJsNumber(vivaldi[1]) : null;

  const two = source.match(/2===\w+\?(\d+(?:\.\d+)?(?:e[+\-]?\d+)?)\*\w+/);
  const four = source.match(/4===\w+\?(\d+(?:\.\d+)?(?:e[+\-]?\d+)?)\*\w+/);
  const six = source.match(/6===\w+\?(\d+(?:\.\d+)?(?:e[+\-]?\d+)?)\*\w+/);
  const extra = source.match(/\(5e4\+\(\w+-4\)\/2\*(\d+(?:\.\d+)?(?:e[+\-]?\d+)?)\)/i)
    || source.match(/\((\d+(?:\.\d+)?(?:e[+\-]?\d+)?)\+\(\w+-4\)\/2\*(\d+(?:\.\d+)?(?:e[+\-]?\d+)?)\)/);

  const jisan2 = two ? parseJsNumber(two[1]) : null;
  const jisan4 = four ? parseJsNumber(four[1]) : null;
  const jisan6 = six ? parseJsNumber(six[1]) : null;
  const extraUnit = extra ? parseJsNumber(extra[extra.length - 1] || extra[1]) : null;

  if (!vivaldiUnit || !jisan2 || !jisan4 || !jisan6) return null;

  return {
    source: "admin-calculator",
    vivaldiPerPersonPerHour: vivaldiUnit,
    jisanPerPersonByEvenHours: { 2: jisan2, 4: jisan4, 6: jisan6 },
    jisanExtraPairUnit: extraUnit ?? FALLBACK_ADMIN_BADGE_RATES.jisanExtraPairUnit,
  };
}

function isJisan(skiResort: string): boolean {
  return skiResort.includes("지산");
}

function isVivaldi(skiResort: string): boolean {
  return skiResort.includes("비발디");
}

export function badgeFeeForResort(input: {
  skiResort?: string;
  participants: number;
  durationHours: number;
  rates?: AdminBadgeRates;
}): BadgeFeeQuote {
  const rates = input.rates ?? FALLBACK_ADMIN_BADGE_RATES;
  const resort = input.skiResort || "";
  const people = Math.max(1, Math.round(input.participants) || 1);
  const hours = input.durationHours;

  if (isVivaldi(resort)) {
    const unit = rates.vivaldiPerPersonPerHour * hours;
    return {
      amount: unit * people,
      unit,
      basis: "per-person",
      label: "인원·시간당",
    };
  }

  if (isJisan(resort)) {
    const unit = jisanUnit(evenDurationHours(hours), rates);
    return {
      amount: unit * people,
      unit,
      basis: "per-person",
      label: "인원당",
    };
  }

  return { amount: 0, unit: 0, basis: "per-lesson", label: "" };
}

function scriptSrcs(html: string): string[] {
  const found: string[] = [];
  const re = /(?:src|href)="(\/_next\/static\/chunks\/[^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    found.push(match[1].replace(/\\/g, ""));
  }
  return [...new Set(found)];
}

function preferCalculatorChunks(srcs: string[]): string[] {
  const scored = srcs.map((src) => {
    let score = 0;
    if (/Calculator/i.test(src)) score += 5;
    if (/Calc/i.test(src)) score += 3;
    if (/3493/.test(src)) score += 2;
    return { src, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.map((row) => row.src);
}

async function fetchText(url: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(url, { cache: "no-store", signal });
  if (!response.ok) {
    throw new Error(`admin fetch ${response.status}`);
  }
  return response.text();
}

async function fetchRatesFromAdmin(): Promise<AdminBadgeRates> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const html = await fetchText(`${ADMIN_ORIGIN}/Calculator`, controller.signal);
    const srcs = preferCalculatorChunks(scriptSrcs(html));
    const candidates = srcs.slice(0, 6);
    if (candidates.length === 0) {
      throw new Error("calculator chunk not found");
    }
    for (const src of candidates) {
      const js = await fetchText(`${ADMIN_ORIGIN}${src}`, controller.signal);
      const parsed = parseAdminCalculatorJs(js);
      if (parsed) return parsed;
    }
    const parsedHtml = parseAdminCalculatorJs(html);
    if (parsedHtml) return parsedHtml;
    throw new Error("calculator formula not found");
  } finally {
    clearTimeout(timer);
  }
}

/** 계산기 JS에서 요율을 읽고, 실패하면 fallback. 10분 캐시. */
export async function loadAdminBadgeRates(): Promise<AdminBadgeRates> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_MS) return cached.rates;
  if (inflight) return inflight;
  inflight = fetchRatesFromAdmin()
    .then((rates) => {
      cached = { rates, at: Date.now() };
      return rates;
    })
    .catch(() => {
      const fallback = cached?.rates ?? FALLBACK_ADMIN_BADGE_RATES;
      cached = { rates: { ...fallback, source: fallback.source }, at: Date.now() };
      return { ...FALLBACK_ADMIN_BADGE_RATES };
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function resetAdminBadgeRateCache() {
  cached = null;
  inflight = null;
}
