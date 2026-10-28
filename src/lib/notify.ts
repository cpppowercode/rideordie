import crypto from "crypto";
import { OWNER_EMAIL } from "@/lib/site";

export type BookingNotice = {
  orderNo: string;
  customerName: string;
  customerPhone: string;
  skiResort: string;
  lessonType: string;
  lessonDate: string;
  timeLabel: string;
  participants: number;
  childCount: number;
  notes: string;
};

export type NotifyResult = {
  sent: string[];
  skipped: string[];
  failed: string[];
};

function ownerEmail(): string {
  return process.env.OWNER_NOTIFY_EMAIL || OWNER_EMAIL;
}

function lessonTypeLabel(value: string): string {
  if (value === "board") return "보드";
  if (value === "both") return "스키·보드";
  return "스키";
}

function noticeText(notice: BookingNotice): string {
  return [
    "홈페이지에 새 강습 예약이 들어왔습니다.",
    "",
    `주문번호: ${notice.orderNo}`,
    `이름: ${notice.customerName}`,
    `연락처: ${notice.customerPhone}`,
    `스키장: ${notice.skiResort}`,
    `종목: ${lessonTypeLabel(notice.lessonType)}`,
    `날짜: ${notice.lessonDate}`,
    `시간: ${notice.timeLabel}`,
    `인원: ${notice.participants}명 (아이 ${notice.childCount}명)`,
    `메모: ${notice.notes || "-"}`,
    "",
    "admin.rideordie.kr → 테이블 → 강습예약에서 확인할 수 있습니다.",
  ].join("\n");
}

async function sendResend(notice: BookingNotice): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.RESEND_FROM_EMAIL || "RideOrDie <noreply@rideordie.kr>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [ownerEmail()],
      subject: `[라이드올다이] 새 강습 예약 — ${notice.customerName} (${notice.lessonDate})`,
      text: noticeText(notice),
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend ${response.status}: ${body.slice(0, 300)}`);
  }
  return true;
}

async function sendWebhook(url: string | undefined, notice: BookingNotice, kind: "slack" | "discord"): Promise<boolean> {
  if (!url) return false;
  const text = noticeText(notice);
  const payload =
    kind === "slack"
      ? { text }
      : { content: text.slice(0, 1800) };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`${kind} webhook ${response.status}`);
  }
  return true;
}

// Grok Bot 루틴 웹훅(또는 임의 웹훅)으로 예약 알림. 개인정보(이름·연락처)는 보내지 않는다.
// BOOKING_WEBHOOK_URL: 루틴 패널에서 복사한 웹훅 URL
// BOOKING_WEBHOOK_KEY: 루틴 패널의 발신자 키 (선택)
// BOOKING_WEBHOOK_KEY_HEADER: 키를 담을 헤더 이름 (기본 "Authorization" → "Bearer <키>", 그 외 헤더는 키 원문)
async function sendBookingWebhook(notice: BookingNotice): Promise<boolean> {
  const url = process.env.BOOKING_WEBHOOK_URL;
  if (!url) return false;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const key = process.env.BOOKING_WEBHOOK_KEY;
  if (key) {
    const headerName = process.env.BOOKING_WEBHOOK_KEY_HEADER || "Authorization";
    headers[headerName] = headerName.toLowerCase() === "authorization" ? `Bearer ${key}` : key;
  }
  const payload = {
    event: "booking.created",
    orderNo: notice.orderNo,
    skiResort: notice.skiResort,
    lessonType: lessonTypeLabel(notice.lessonType),
    lessonDate: notice.lessonDate,
    timeLabel: notice.timeLabel,
    participants: notice.participants,
    childCount: notice.childCount,
    adminUrl: "https://admin.rideordie.kr",
    text: `새 강습 예약: ${notice.lessonDate} ${notice.timeLabel} ${notice.skiResort} ${lessonTypeLabel(notice.lessonType)} ${notice.participants}명 (주문 ${notice.orderNo})`,
  };
  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`booking webhook ${response.status}`);
  return true;
}

async function sendSolapi(notice: BookingNotice): Promise<boolean> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const to = process.env.SOLAPI_TO;
  const from = process.env.SOLAPI_FROM;
  if (!apiKey || !apiSecret || !to) return false;

  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto.createHmac("sha256", apiSecret).update(date + salt).digest("hex");
  const pfid = process.env.SOLAPI_KAKAO_PFID;
  const templateId = process.env.SOLAPI_KAKAO_TEMPLATE_ID;
  const text = noticeText(notice).slice(0, 2000);

  const message: Record<string, unknown> = {
    to,
    from: from || to,
    text,
  };
  if (pfid && templateId) {
    message.type = "ATA";
    message.kakaoOptions = {
      pfId: pfid,
      templateId,
      variables: {
        "#{이름}": notice.customerName,
        "#{날짜}": notice.lessonDate,
        "#{시간}": notice.timeLabel,
        "#{스키장}": notice.skiResort,
        "#{인원}": String(notice.participants),
        "#{연락처}": notice.customerPhone,
      },
    };
  }

  const response = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: {
      Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Solapi ${response.status}: ${body.slice(0, 300)}`);
  }
  return true;
}

export const NOTIFY_CHANNELS = [
  { name: "email(Resend)", configured: () => Boolean(process.env.RESEND_API_KEY) },
  { name: "slack", configured: () => Boolean(process.env.SLACK_WEBHOOK_URL) },
  { name: "discord", configured: () => Boolean(process.env.DISCORD_WEBHOOK_URL) },
  { name: "grokbot-webhook", configured: () => Boolean(process.env.BOOKING_WEBHOOK_URL) },
  { name: "solapi", configured: () => Boolean(process.env.SOLAPI_API_KEY && process.env.SOLAPI_API_SECRET && process.env.SOLAPI_TO) },
] as const;

export function notifyChannelStatus() {
  return NOTIFY_CHANNELS.map((channel) => ({
    name: channel.name,
    configured: channel.configured(),
  }));
}

export async function notifyOwner(notice: BookingNotice): Promise<NotifyResult> {
  const sent: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  const tasks: Array<[string, boolean, () => Promise<boolean>]> = [
    ["email(Resend)", Boolean(process.env.RESEND_API_KEY), () => sendResend(notice)],
    ["slack", Boolean(process.env.SLACK_WEBHOOK_URL), () => sendWebhook(process.env.SLACK_WEBHOOK_URL, notice, "slack")],
    ["discord", Boolean(process.env.DISCORD_WEBHOOK_URL), () => sendWebhook(process.env.DISCORD_WEBHOOK_URL, notice, "discord")],
    ["grokbot-webhook", Boolean(process.env.BOOKING_WEBHOOK_URL), () => sendBookingWebhook(notice)],
    ["solapi", Boolean(process.env.SOLAPI_API_KEY && process.env.SOLAPI_API_SECRET && process.env.SOLAPI_TO), () => sendSolapi(notice)],
  ];

  for (const [name, ready, run] of tasks) {
    if (!ready) {
      skipped.push(name);
      continue;
    }
    try {
      if (await run()) sent.push(name);
      else skipped.push(name);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failed.push(`${name}: ${message}`);
      console.error(`[notify] ${name} failed`, error);
    }
  }

  if (sent.length === 0) {
    console.warn(
      "[notify] 예약은 저장됐지만 사장 알림을 보내지 못했습니다. RESEND_API_KEY 또는 웹훅을 설정해 주세요.",
      { skipped, failed }
    );
  }
  return { sent, skipped, failed };
}
