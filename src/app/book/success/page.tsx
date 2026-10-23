'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { KakaoConsultLink } from '@/components/seo/KakaoConsultLink';

function SuccessContent() {
  const params = useSearchParams();
  const orderNo = params.get('orderNo');
  const date = params.get('date');
  const resort = params.get('resort');
  const time = params.get('time');
  const name = params.get('name');
  const people = params.get('people');

  return (
    <div className="bg-snow" data-testid="booking-success">
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center px-5 py-16 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgba(49,130,246,0.35)]">
          <Check className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <p className="eyebrow">예약 접수</p>
        <h1 className="mt-2 text-[32px] font-bold tracking-tight md:text-[40px]">예약이 접수됐어요</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted">
          남겨 주신 번호로 일정 확인 연락을 드립니다.
        </p>

        <dl className="mt-8 w-full overflow-hidden rounded-[24px] bg-white text-left shadow-[0_8px_30px_rgba(25,31,40,0.04)]">
          {orderNo && (
            <div className="flex justify-between gap-4 border-b border-line px-5 py-4">
              <dt className="text-[15px] text-muted">예약번호</dt>
              <dd className="font-semibold" data-testid="success-order-no">{orderNo}</dd>
            </div>
          )}
          {name && (
            <div className="flex justify-between gap-4 border-b border-line px-5 py-4">
              <dt className="text-[15px] text-muted">이름</dt>
              <dd className="font-semibold">{name}</dd>
            </div>
          )}
          {date && (
            <div className="flex justify-between gap-4 border-b border-line px-5 py-4">
              <dt className="text-[15px] text-muted">날짜</dt>
              <dd className="font-semibold">{date}</dd>
            </div>
          )}
          {time && (
            <div className="flex justify-between gap-4 border-b border-line px-5 py-4">
              <dt className="text-[15px] text-muted">시간</dt>
              <dd className="font-semibold">{time}</dd>
            </div>
          )}
          {resort && (
            <div className="flex justify-between gap-4 border-b border-line px-5 py-4">
              <dt className="text-[15px] text-muted">스키장</dt>
              <dd className="font-semibold">{resort}</dd>
            </div>
          )}
          {people && (
            <div className="flex justify-between gap-4 px-5 py-4">
              <dt className="text-[15px] text-muted">인원</dt>
              <dd className="font-semibold">{people}명</dd>
            </div>
          )}
        </dl>

        <div className="mt-8 flex w-full flex-col gap-3">
          <KakaoConsultLink className="btn-ghost min-h-14">
            카톡 상담
          </KakaoConsultLink>
          <Link href="/" className="btn-primary min-h-14">홈으로</Link>
        </div>
      </div>
    </div>
  );
}

export default function BookSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
