import Link from "next/link";
import Image from "next/image";
import { INSTAGRAM_URL, KAKAO_CONSULT_URL, NAVER_BLOG_URL, TEACHING_RESORTS_COPY } from "@/lib/site";
import { RESORT_LANDINGS } from "@/lib/resort-landings";
import { KakaoConsultLink } from "@/components/seo/KakaoConsultLink";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-line bg-snow">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Image src="/logo.svg" alt="RideOrDie" width={88} height={40} className="h-9 w-auto" />
            <p className="mt-5 max-w-sm text-[16px] leading-7 text-muted">
              {TEACHING_RESORTS_COPY}에서 스키·스노보드 강습합니다.
              <br />
              스키를 가르치는 게 아니라, 라이딩을 가르칩니다.
            </p>
            <ul className="mt-5 flex flex-wrap gap-4 text-[15px] font-semibold">
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink transition-colors hover:text-brand"
                >
                  인스타그램
                </a>
              </li>
              <li>
                <a
                  href={NAVER_BLOG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink transition-colors hover:text-brand"
                >
                  네이버 블로그
                </a>
              </li>
              <li>
                <a
                  href={KAKAO_CONSULT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink transition-colors hover:text-brand"
                >
                  카톡 상담
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold tracking-[0.04em] text-muted">고객센터</h3>
            <ul className="space-y-2 text-[15px] text-muted">
              <li>
                <KakaoConsultLink className="text-[22px] font-bold tracking-tight text-ink hover:text-brand">
                  카톡 상담
                </KakaoConsultLink>
              </li>
              <li>연중 무휴</li>
              <li>
                <a href="mailto:contact@rideordie.kr" className="hover:text-ink">contact@rideordie.kr</a>
              </li>
            </ul>
            <h3 className="mb-3 mt-8 text-[13px] font-semibold tracking-[0.04em] text-muted">
              <Link href="/resorts" className="hover:text-ink">
                강습 스키장
              </Link>
            </h3>
            <ul className="space-y-2 text-[15px] text-muted">
              {RESORT_LANDINGS.map((row) => (
                <li key={row.slug}>
                  <Link href={`/resorts/${row.slug}`} className="hover:text-ink">
                    {row.shortName} 어린이 강습
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold tracking-[0.04em] text-muted">회사 정보</h3>
            <ul className="space-y-1.5 text-[14px] leading-6 text-muted">
              <li>상호: 라이드올다이</li>
              <li>대표: 정동진</li>
              <li>사업자등록번호: 331-14-02684</li>
              <li>주소: 서울 서대문구 모래내로 411</li>
              <li>개인정보 보호책임자: 정동진</li>
              <li>호스팅 제공자: Vercel Inc.</li>
              <li className="pt-3">
                <Link href="/service-policy" className="font-semibold text-ink hover:text-brand">
                  이용약관 · 개인정보 처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-8 text-[13px] text-muted">
          &copy; {new Date().getFullYear()} 라이드올다이. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
