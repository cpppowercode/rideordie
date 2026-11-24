import Link from "next/link";
import type { Metadata } from "next";
import { ChannelTalkOpenButton } from "@/components/feedback/ChannelTalkOpenButton";
import { FeedbackShell } from "@/components/feedback/FeedbackShell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "주니어 등급 안내",
    description:
      "라이드올다이 주니어 등급 체계 — 레벨1·레벨2·티칭1 도전 구간과 피드백으로 보는 성장.",
    path: "/junior",
  }),
};

const TRACKS = [
  {
    title: "레벨1 도전",
    body: "처음 설원에서 균형과 기본 자세를 다지는 구간이에요. 작은 통과가 쌓이면 다음 문이 열립니다.",
  },
  {
    title: "레벨2 도전",
    body: "회전과 속도 조절이 자연스러워지는 단계. 피드백의 ○△✕로 지금 위치를 바로 확인할 수 있어요.",
  },
  {
    title: "티칭1 도전",
    body: "배운 것을 또렷하게 표현하는 도전 구간. 다음 목표까지의 남은 단계가 피드백에 표시됩니다.",
  },
] as const;

export default function JuniorPage() {
  return (
    <FeedbackShell>
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[var(--fb-brand)]">
            Junior Track
          </p>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[var(--fb-text)]">
            구간마다 자라는
            <br />
            주니어 등급
          </h1>
          <p className="text-[15px] leading-relaxed text-[var(--fb-text-secondary)]">
            레벨1 · 레벨2 · 티칭1 — 도전 구간이 이어지며 실력이 쌓여요. 강습 피드백에서
            진행도를 바로 볼 수 있습니다.
          </p>
        </header>

        <section className="space-y-3">
          {TRACKS.map((track, i) => (
            <article key={track.title} className="fb-card-elevated p-4">
              <div className="fb-milestone mb-0">
                <div className="fb-milestone-bar" aria-hidden />
                <div>
                  <p className="fb-milestone-label">
                    ] {i + 1}. {track.title}
                  </p>
                  <p className="mt-1 text-[14px] leading-relaxed text-[var(--fb-text-secondary)]">
                    {track.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="fb-card p-5">
          <h2 className="text-[17px] font-semibold text-[var(--fb-text)]">
            피드백으로 진행도 확인
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--fb-text-secondary)]">
            강습이 끝나면 단계별 ○(통과) · △(연습 중) · ✕(아직)와 누적 진행도가 업데이트돼요.
            취득한 뱃지도 같은 화면에서 볼 수 있습니다.
          </p>
          <Link
            href="/feedback"
            className="fb-btn-primary mt-4 inline-flex w-full sm:w-auto"
          >
            내 피드백 보기
          </Link>
        </section>

        <section className="space-y-3">
          <h2 className="text-[17px] font-semibold text-[var(--fb-text)]">
            예약 · 상담
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/book" className="fb-btn-primary flex-1">
              강습 예약하기
            </Link>
            <ChannelTalkOpenButton className="fb-btn-ghost flex-1">
              채널톡 상담
            </ChannelTalkOpenButton>
          </div>
        </section>
      </div>
    </FeedbackShell>
  );
}
