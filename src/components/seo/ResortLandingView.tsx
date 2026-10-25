import Image from "next/image";
import Link from "next/link";
import { TrustBadges } from "@/components/seo/TrustBadges";
import { KakaoConsultLink } from "@/components/seo/KakaoConsultLink";
import {
  bookHref,
  EARLY_BIRD_COPY,
  EARLY_BIRD_LABEL,
  FAMILY_GUIDE_POSTS,
  formatManwon,
  REGULAR_PRICE_TABLE,
  RESORT_LANDINGS,
  TERMS_REFUND_HREF,
  type ResortLanding,
} from "@/lib/resort-landings";

function Ctas({ landing }: { landing: ResortLanding }) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Link
        href={bookHref(landing.slug)}
        className="btn-primary px-8 py-4 text-[17px]"
        data-testid={`resort-cta-book-${landing.slug}`}
      >
        {landing.shortName}으로 예약하기
      </Link>
      <KakaoConsultLink
        className="btn-ghost px-8 py-4 text-[17px]"
        testId={`resort-cta-kakao-${landing.slug}`}
      >
        카톡 상담
      </KakaoConsultLink>
    </div>
  );
}

function PriceTable() {
  return (
    <div className="overflow-x-auto rounded-[24px] border border-line bg-white">
      <table className="w-full min-w-[320px] text-left text-[15px]">
        <caption className="sr-only">1:1·2:1·3:1 일반 요금표</caption>
        <thead>
          <tr className="border-b border-line bg-snow text-muted">
            <th className="px-4 py-3 font-semibold">구성</th>
            {REGULAR_PRICE_TABLE.hours.map((hour) => (
              <th key={hour} className="px-4 py-3 font-semibold">
                {hour}시간
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {REGULAR_PRICE_TABLE.ratios.map((ratio) => (
            <tr key={ratio} className="border-b border-line last:border-0">
              <th className="px-4 py-3 font-semibold text-ink">{ratio}</th>
              {REGULAR_PRICE_TABLE.hours.map((hour) => (
                <td key={hour} className="px-4 py-3">
                  {formatManwon(REGULAR_PRICE_TABLE.amounts[ratio][hour])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FamilyGuideLinks({ landing }: { landing: ResortLanding }) {
  const posts = FAMILY_GUIDE_POSTS[landing.slug] ?? [];
  if (posts.length === 0) return null;
  return (
    <section
      className="mt-12 rounded-[24px] bg-ice px-5 py-6"
      aria-label={`${landing.shortName} 가족 가이드`}
      data-testid={`resort-guide-${landing.slug}`}
    >
      <h2 className="text-[20px] font-bold tracking-tight">가족 가이드 읽기</h2>
      <ul className="mt-3 space-y-2 text-[16px]">
        {posts.map((post) => (
          <li key={post.url}>
            <a
              href={post.url}
              target="_blank"
              rel="noopener"
              className="font-semibold text-brand hover:underline"
            >
              {post.title} →
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ResortLandingView({ landing }: { landing: ResortLanding }) {
  const showPrice = landing.layout === "full";
  const showImage = landing.layout !== "minimal";

  return (
    <article className="bg-white" data-testid={`resort-${landing.slug}`}>
      <header className="border-b border-line bg-snow">
        <div className="mx-auto max-w-3xl px-5 py-14 md:py-20">
          <p className="eyebrow">어린이 스키·보드강습</p>
          <h1 className="mt-3 text-[32px] font-bold tracking-tight md:text-[44px]">
            {landing.h1}
          </h1>
          <p className="mt-4 text-[17px] leading-7 text-muted">
            라이드올다이 · {landing.placeName}
          </p>
          <TrustBadges className="mt-6" />
          <Ctas landing={landing} />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        {showImage ? (
          <div className="relative mb-10 aspect-[16/10] overflow-hidden rounded-[28px] bg-snow">
            <Image
              src={landing.image}
              alt={landing.imageAlt}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority={landing.layout === "full"}
            />
          </div>
        ) : null}

        <div className="space-y-5 text-[17px] leading-8 text-ink">
          {landing.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {landing.mentionBadgeFee ? (
          <p className="mt-6 rounded-[20px] bg-ice px-5 py-4 text-[16px] leading-7 text-ink">
            이 스키장은 패찰비가 별도입니다.
          </p>
        ) : null}

        {landing.sections?.map((section) => (
          <section key={section.heading} className="mt-12">
            <h2 className="text-[24px] font-bold tracking-tight">{section.heading}</h2>
            <div className="mt-4 space-y-4 text-[17px] leading-8 text-muted">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {section.heading === "환불" ? (
              <Link
                href={TERMS_REFUND_HREF}
                className="mt-4 inline-block text-[16px] font-semibold text-brand hover:underline"
              >
                이용약관 제9조 보기
              </Link>
            ) : null}
          </section>
        ))}

        {showPrice ? (
          <>
          <section className="mt-12">
            <h2 className="text-[24px] font-bold tracking-tight">가격표</h2>
            <p className="mt-3 text-[16px] leading-7 text-muted">
              1:1 2시간 15만원부터. 아래는 일반 요금입니다.
            </p>
            <div className="mt-5">
              <PriceTable />
            </div>
          </section>
          <section className="mt-12">
            <h2 className="text-[24px] font-bold tracking-tight">{EARLY_BIRD_LABEL}</h2>
            <p className="mt-3 text-[16px] leading-7 text-muted">
              {EARLY_BIRD_COPY}
            </p>
          </section>
          </>
        ) : (
          <section className="mt-12">
            <h2 className="text-[24px] font-bold tracking-tight">강습비</h2>
            <p className="mt-3 text-[17px] leading-8 text-muted">
              {EARLY_BIRD_COPY}.
              {landing.mentionBadgeFee ? " 패찰비도 별도입니다." : ""}
            </p>
            {landing.layout !== "minimal" ? (
              <Link
                href={TERMS_REFUND_HREF}
                className="mt-4 inline-block text-[16px] font-semibold text-brand hover:underline"
              >
                환불은 이용약관 제9조
              </Link>
            ) : (
              <Link
                href={TERMS_REFUND_HREF}
                className="mt-4 inline-block text-[16px] font-semibold text-brand hover:underline"
              >
                이용약관 제9조
              </Link>
            )}
          </section>
        )}

        {landing.faqs.length > 0 ? (
          <section className="mt-14" id="faq">
            <h2 className="text-[24px] font-bold tracking-tight">자주 묻는 질문</h2>
            <div className="mt-6 border-t border-line">
              {landing.faqs.map((item) => (
                <details key={item.q} className="group border-b border-line py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold tracking-tight">
                    {item.q}
                    <span className="text-2xl font-light text-muted transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[16px] leading-7 text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        <FamilyGuideLinks landing={landing} />

        <Ctas landing={landing} />

        <nav className="mt-14 border-t border-line pt-8" aria-label="다른 스키장 강습">
          <p className="text-[13px] font-semibold tracking-[0.04em] text-muted">다른 스키장</p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[16px]">
            {RESORT_LANDINGS.filter((row) => row.slug !== landing.slug).map((row) => (
              <li key={row.slug}>
                <Link href={`/resorts/${row.slug}`} className="font-semibold text-ink hover:text-brand">
                  {row.shortName} 강습
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </article>
  );
}
