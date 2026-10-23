'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { KakaoConsultLink } from '@/components/seo/KakaoConsultLink';
import { EXTRAS_COPY } from '@/lib/kcp-public';

function FailContent() {
  const params = useSearchParams();
  const orderId = params.get('orderId') || params.get('orderNo') || '';
  const message = params.get('message') || '결제가 완료되지 않았습니다.';
  const code = params.get('code') || '';

  return (
    <div className="bg-snow" data-testid="book-pay-fail">
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <p className="eyebrow">결제 취소</p>
        <h1 className="mt-2 text-[32px] font-bold tracking-tight">예약이 확정되지 않았습니다</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted">
          {message}
          {code ? ` (${code})` : ''}
          {' '}강습비 결제가 끝나야 예약이 확정됩니다.
        </p>
        <p className="mt-2 text-[15px] text-muted">{EXTRAS_COPY}</p>
        <div className="mt-8 flex flex-col gap-3">
          {orderId && (
            <Link
              href={`/book/pay?orderNo=${encodeURIComponent(orderId)}`}
              className="btn-primary min-h-14"
              data-testid="pay-retry"
            >
              다시 결제하기
            </Link>
          )}
          <KakaoConsultLink className="btn-ghost min-h-14">카톡 상담</KakaoConsultLink>
          <Link href="/book" className="btn-ghost min-h-14">예약 다시 하기</Link>
        </div>
      </div>
    </div>
  );
}

export default function PayFailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
      </div>
    }>
      <FailContent />
    </Suspense>
  );
}
