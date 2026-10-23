'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { OWNER_PHONE } from '@/lib/site';

function SuccessContent() {
  const params = useSearchParams();
  const orderNo = params.get('orderNo');
  const date = params.get('date');
  const resort = params.get('resort');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 rounded-full bg-ice p-6">
        <CheckCircle className="h-16 w-16 text-brand" />
      </div>
      <h1 className="mb-4 text-3xl font-bold">예약이 접수되었습니다</h1>
      <div className="mb-8 max-w-md space-y-2 text-lg text-muted">
        {orderNo && (
          <p>
            예약번호: <span className="font-semibold text-ink">{orderNo}</span>
          </p>
        )}
        {date && <p>날짜: <span className="font-semibold text-ink">{date}</span></p>}
        {resort && <p>스키장: <span className="font-semibold text-ink">{resort}</span></p>}
        <p>남겨 주신 번호로 일정 확인 연락을 드립니다.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={`tel:${OWNER_PHONE}`} className="btn-ghost">전화하기 {OWNER_PHONE}</a>
        <Link href="/" className="btn-dark">홈으로</Link>
      </div>
    </div>
  );
}

export default function BookSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-brand" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
