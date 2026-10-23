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
  amount?: number;
  paymentKey?: string;
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
    `결제: ${notice.amount != null ? `${notice.amount.toLocaleString("ko-KR")}원` : "-"}`,
    `결제키: ${notice.paymentKey || "-"}`,
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
      subject: `[라이드올다이] 결제 완료 예약 — ${notice.customerName} (${notice.lessonDate})`,
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
      "[notify] 결제는 완료됐지만 사장 알림을 보내지 못했습니다. RESEND_API_KEY 또는 웹훅을 설정해 주세요.",
      { skipped, failed }
    );
  }
  return { sent, skipped, failed };
}
