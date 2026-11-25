import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminFeedbackByToken } from "@/lib/customer-feedback/admin";
import { formatSessionDate } from "@/lib/customer-feedback/display";
import { FB_SESSION_COOKIE } from "@/lib/customer-feedback/session";
import { FeedbackList } from "@/components/feedback/FeedbackList";
import { FeedbackLoginForm } from "@/components/feedback/FeedbackLoginForm";
import { FeedbackShell } from "@/components/feedback/FeedbackShell";
import { ServicePreparing } from "@/components/feedback/ServicePreparing";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: "라이드올다이 강습 피드백" },
    description: "라이드올다이 강습 피드백을 확인합니다.",
    robots: { index: false, follow: false },
    openGraph: {
      title: "라이드올다이 강습 피드백",
      description: "예약 정보로 강습 피드백을 확인하세요.",
      siteName: "라이드올다이",
      locale: "ko_KR",
      type: "website",
    },
  };
}

export default async function FeedbackSharePage({ params }: PageProps) {
  const { token } = await params;
  const shareToken = decodeURIComponent(token || "").trim();
  const jar = await cookies();
  const session = jar.get(FB_SESSION_COOKIE)?.value;

  if (!shareToken) {
    return (
      <FeedbackShell>
        <ServicePreparing />
      </FeedbackShell>
    );
  }

  let result: Awaited<ReturnType<typeof adminFeedbackByToken>>;
  try {
    result = await adminFeedbackByToken({
      share_token: shareToken,
      session_token: session,
    });
  } catch {
    return (
      <FeedbackShell>
        <ServicePreparing />
      </FeedbackShell>
    );
  }

  if (!result.ok) {
    return (
      <FeedbackShell>
        <ServicePreparing />
      </FeedbackShell>
    );
  }

  if ("needs_login" in result && result.needs_login) {
    const hint = result.hint
      ? {
          display_name_initial: result.hint.display_name_initial,
          session_date: formatSessionDate(result.hint.session_date),
        }
      : null;
    return (
      <FeedbackShell>
        <FeedbackLoginForm
          shareToken={shareToken}
          hint={hint}
          redirectTo={`/feedback/${encodeURIComponent(shareToken)}`}
        />
      </FeedbackShell>
    );
  }

  const students = "students" in result ? result.students ?? [] : [];
  return (
    <FeedbackShell>
      <FeedbackList students={students} />
    </FeedbackShell>
  );
}
