import type { Metadata } from "next";
import Link from "next/link";
import { SEASON_OPTIONS, isPayable } from "@/lib/season";
import { KakaoConsultLink } from "@/components/seo/KakaoConsultLink";

export const metadata: Metadata = {
  title: "시즌강습 결제하기 | 라이드올다이",
  description: "라이드올다이 시즌강습 옵션과 환불 규정 안내.",
};

export default function SeasonPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-14 md:py-20" data-testid="season-page">
      <p className="eyebrow">SEASON</p>
      <h1 className="mt-3 text-[32px] font-bold tracking-tight md:text-[40px]">시즌강습 결제하기</h1>
      <p className="mt-3 text-[16px] leading-7 text-muted">정해진 옵션 중에서만 고를 수 있어요. 금액은 옵션에 따라 서버에서 계산됩니다.</p>
      <ul className="mt-8 divide-y divide-line border-y border-line" data-testid="season-options">
        {SEASON_OPTIONS.map((o) => (
          <li key={o.id} className="flex items-center justify-between gap-4 py-5">
            <div>
              <p className="text-[18px] font-semibold">{o.name}</p>
              <p className="mt-1 text-[15px] text-muted">{o.includes}</p>
            </div>
            <div className="text-right">
              {isPayable(o) ? (
                <p className="text-[18px] font-bold">{o.price.toLocaleString("ko-KR")}원</p>
              ) : (
                <>
                  <p className="text-[16px] font-semibold text-muted">가격 필요</p>
                  <button type="button" disabled className="btn-ghost mt-2 opacity-50">결제 준비 중</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      <section className="mt-8 rounded-[20px] bg-snow p-6 text-[15px] leading-7" data-testid="season-summary">
        <h2 className="text-[18px] font-bold">결제 전 확인</h2>
        <p className="mt-2">이름과 휴대폰 번호가 필요하며, 결제가 승인된 뒤에만 접수됩니다. 비발디·지산은 어드민 계산기 기준 패찰비가 포함됩니다.</p>
        <p className="mt-2">환불은 <Link href="/service-policy#article-9" className="font-semibold underline">이용약관 제9조(결제 및 환불 규정)</Link>를 따릅니다.</p>
        <p className="mt-2">지금은 시즌강습 가격이 확정되지 않아 결제를 받지 않아요. <KakaoConsultLink className="font-semibold underline">카톡 상담</KakaoConsultLink>으로 문의해 주세요.</p>
      </section>
    </div>
  );
}
