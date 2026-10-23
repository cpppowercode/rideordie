import type { Metadata } from "next";
import Link from "next/link";
import { KakaoConsultLink } from "@/components/seo/KakaoConsultLink";
import { ResortCards } from "@/components/seo/ResortCards";
import { TrustBadges } from "@/components/seo/TrustBadges";
import { pageMetadata } from "@/lib/seo";
import { TEACHING_RESORTS_COPY } from "@/lib/site";

const TITLE = "강습 스키장 | 라이드올다이";
const DESCRIPTION = `${TEACHING_RESORTS_COPY}에서 진행하는 어린이 스키강습·보드강습. 1:1 2시간 정가 15만원. 숙소·리프트권·장비 별도. 카톡 상담과 온라인 예약.`;

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/resorts",
  absoluteTitle: true,
});

export default function ResortsIndexPage() {
  return (
    <article className="bg-white" data-testid="resorts-index">
      <header className="border-b border-line bg-snow">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <p className="eyebrow">RESORTS</p>
          <h1 className="mt-3 text-[32px] font-bold tracking-tight md:text-[44px]">
            강습 스키장
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-7 text-muted">
            {TEACHING_RESORTS_COPY}에서 어린이 스키·보드강습을 진행합니다.
          </p>
          <TrustBadges className="mt-6" />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <ResortCards />
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/book" className="btn-primary px-8 py-4 text-[17px]" data-testid="resorts-index-book">
            강습 예약하기
          </Link>
          <KakaoConsultLink className="btn-ghost px-8 py-4 text-[17px]" testId="resorts-index-kakao">
            카톡 상담
          </KakaoConsultLink>
        </div>
      </div>
    </article>
  );
}
