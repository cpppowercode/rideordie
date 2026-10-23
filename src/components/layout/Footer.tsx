import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { INSTAGRAM_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-line bg-snow">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Image src="/logo.svg" alt="RideOrDie" width={88} height={40} className="h-9 w-auto" />
            <p className="mt-5 max-w-sm text-[16px] leading-7 text-muted">
              하이원 리조트 기반 스키·스노보드 강습.
              <br />
              스키를 가르치는 게 아니라, 라이딩을 가르칩니다.
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-ink transition-colors hover:text-brand"
            >
              <Instagram className="h-4 w-4" />
              @ski.rideordie
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold tracking-[0.04em] text-muted">고객센터</h3>
            <ul className="space-y-2 text-[15px] text-muted">
              <li>
                <a href="tel:010-2028-2744" className="text-[22px] font-bold tracking-tight text-ink hover:text-brand">
                  010-2028-2744
                </a>
              </li>
              <li>연중 무휴</li>
              <li>
                <a href="mailto:contact@rideordie.kr" className="hover:text-ink">contact@rideordie.kr</a>
              </li>
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
