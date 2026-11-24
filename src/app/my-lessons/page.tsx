"use client";

import { useState } from "react";
import Link from "next/link";

type Lesson = {
  id: string;
  kind: "regular" | "season";
  lessonDate: string | null;
  skiResort: string | null;
  lessonType: string | null;
  participants: number | null;
  progressStatus: string | null;
  reservationStatus: string | null;
};

export default function MyLessonsPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[] | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLessons(null);
    try {
      const res = await fetch("/api/my-lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name, customerPhone: phone }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "조회에 실패했습니다.");
        return;
      }
      setLessons(Array.isArray(body.lessons) ? body.lessons : []);
    } catch {
      setError("조회에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-lg px-5 py-12">
      <p className="text-sm text-muted">
        <Link href="/" className="underline-offset-2 hover:underline">
          홈
        </Link>
      </p>
      <h1 className="mt-4 text-[28px] font-bold tracking-tight">내 강습 조회</h1>
      <p className="mt-2 text-[15px] leading-6 text-muted">
        예약 시 남긴 이름과 휴대폰 번호로 본인 강습만 확인합니다.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">이름</span>
          <input
            className="w-full rounded-md border border-line px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            maxLength={80}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">휴대폰</span>
          <input
            className="w-full rounded-md border border-line px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            required
            maxLength={20}
            placeholder="01012345678"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60"
        >
          {loading ? "조회 중…" : "조회하기"}
        </button>
      </form>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {lessons && (
        <section className="mt-8 space-y-3">
          {lessons.length === 0 ? (
            <p className="text-sm text-muted">조회된 강습이 없습니다.</p>
          ) : (
            lessons.map((l) => (
              <article key={`${l.kind}-${l.id}`} className="border-b border-line py-3">
                <p className="text-sm font-semibold">
                  {l.kind === "season" ? "시즌권" : "일반 강습"} · {l.lessonDate || "날짜 미정"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {[l.skiResort, l.lessonType, l.participants ? `${l.participants}명` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {[l.progressStatus, l.reservationStatus].filter(Boolean).join(" · ")}
                </p>
              </article>
            ))
          )}
        </section>
      )}
    </main>
  );
}
