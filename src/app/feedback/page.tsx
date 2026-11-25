import { cookies } from "next/headers";
import { adminFeedbackList } from "@/lib/customer-feedback/admin";
import { FB_SESSION_COOKIE } from "@/lib/customer-feedback/session";
import { FeedbackList } from "@/components/feedback/FeedbackList";
import { FeedbackLoginForm } from "@/components/feedback/FeedbackLoginForm";
import { FeedbackShell } from "@/components/feedback/FeedbackShell";
import { ServicePreparing } from "@/components/feedback/ServicePreparing";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const jar = await cookies();
  const session = jar.get(FB_SESSION_COOKIE)?.value;

  if (!session) {
    return (
      <FeedbackShell>
        <FeedbackLoginForm />
      </FeedbackShell>
    );
  }

  let list: Awaited<ReturnType<typeof adminFeedbackList>>;
  try {
    list = await adminFeedbackList(session);
  } catch {
    return (
      <FeedbackShell>
        <ServicePreparing />
      </FeedbackShell>
    );
  }

  if (!list.ok) {
    if (list.unavailable) {
      return (
        <FeedbackShell>
          <ServicePreparing />
        </FeedbackShell>
      );
    }
    return (
      <FeedbackShell>
        <FeedbackLoginForm />
      </FeedbackShell>
    );
  }

  return (
    <FeedbackShell>
      <FeedbackList students={list.students ?? []} />
    </FeedbackShell>
  );
}
