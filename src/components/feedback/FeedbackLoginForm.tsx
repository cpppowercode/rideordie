"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FEEDBACK_LOGIN_INVALID_MESSAGE,
  FEEDBACK_LOGIN_RETRY_MESSAGE,
  FEEDBACK_SERVICE_PREPARING_MESSAGE,
} from "@/lib/customer-feedback/messages";

type FeedbackLoginFormProps = {
  shareToken?: string;
  hint?: { display_name_initial: string; session_date: string } | null;
  redirectTo?: string;
};

export function FeedbackLoginForm({
  shareToken,
  hint,
  redirectTo,
}: FeedbackLoginFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/feedback/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          remember,
          ...(shareToken ? { share_token: shareToken } : {}),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        unavailable?: boolean;
        error?: string;
      };

      if (body.unavailable || res.status === 503) {
        setError(FEEDBACK_SERVICE_PREPARING_MESSAGE);
        return;
      }

      if (!res.ok || !body.ok) {
        if (body.error === "locked" || body.error === "rate_limited" || res.status === 429) {
          setError(body.message || FEEDBACK_LOGIN_RETRY_MESSAGE);
        } else {
          setError(body.message || FEEDBACK_LOGIN_INVALID_MESSAGE);
        }
        return;
      }

      if (redirectTo) {
        router.replace(redirectTo);
      } else {
        router.refresh();
      }
    } catch {
      setError(FEEDBACK_SERVICE_PREPARING_MESSAGE);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="fb-card-elevated space-y-5 p-5 md:p-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--fb-text)]">
          강습 피드백
        </h1>
        <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--fb-text-secondary)]">
          예약하신 이름과 전화번호로 확인해 주세요.
        </p>
        {hint ? (
          <p className="mt-3 rounded-[var(--fb-radius-sm)] bg-[var(--fb-brand-subtle)] px-3 py-2 text-[13px] text-[var(--fb-brand)]">
            {hint.display_name_initial} · {hint.session_date} 피드백
          </p>
        ) : null}
      </div>

      <label className="block space-y-1.5">
        <span className="text-[13px] font-medium text-[var(--fb-text-secondary)]">
          예약자 이름
        </span>
        <input
          className="fb-input"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          placeholder="홍길동"
          required
          minLength={2}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-[13px] font-medium text-[var(--fb-text-secondary)]">
          전화번호
        </span>
        <input
          className="fb-input"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={phone}
          onChange={(ev) => setPhone(ev.target.value)}
          placeholder="01012345678"
          required
        />
      </label>

      <label className="flex items-center gap-2 text-[14px] text-[var(--fb-text-secondary)]">
        <input
          type="checkbox"
          checked={remember}
          onChange={(ev) => setRemember(ev.target.checked)}
          className="size-4 rounded border-[var(--fb-border)] accent-[var(--fb-brand)]"
        />
        이 기기에서 로그인 유지
      </label>

      {error ? (
        <p
          role="alert"
          className="rounded-[var(--fb-radius-sm)] bg-[var(--fb-error-bg)] px-3 py-2 text-[13px] text-[var(--fb-error)]"
        >
          {error}
        </p>
      ) : null}

      <button type="submit" className="fb-btn-primary w-full" disabled={pending}>
        {pending ? "확인 중…" : "피드백 보기"}
      </button>
    </form>
  );
}
