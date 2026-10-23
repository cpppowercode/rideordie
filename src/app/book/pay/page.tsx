'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { KakaoConsultLink } from '@/components/seo/KakaoConsultLink';
import { EXTRAS_COPY } from '@/lib/kcp-public';
import { KcpCheckout } from './KcpCheckout';

type OrderPayload = {
  orderNo: string;
  amount: number;
  amountLabel: string;
  lessonAmount?: number;
  badgeFee?: number;
  orderName: string;
  customerName: string;
  customerPhone?: string;
  lessonDate?: string | null;
  lessonTime?: string | null;
  skiResort?: string | null;
  alreadyPaid: boolean;
  testMode: boolean;
  error?: string;
};

function PayContent() {
  const params = useSearchParams();
  const orderNo = params.get('orderNo') || '';
  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderNo) {
      setError('주문번호가 없습니다.');
      return;
    }
    let cancelled = false;
    fetch(`/api/payments/kcp/order?orderNo=${encodeURIComponent(orderNo)}`)
      .then(async (res) => {
        const data = (await res.json()) as OrderPayload;
        if (!res.ok) throw new Error(data.error || '결제 정보를 불러오지 못했습니다.');
        if (!cancelled) setOrder(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '결제 정보를 불러오지 못했습니다.');
      });
    return () => {
      cancelled = true;
    };
  }, [orderNo]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center" data-testid="pay-error">
        <h1 className="text-[28px] font-bold">결제를 진행할 수 없습니다</h1>
        <p className="mt-3 text-muted">{error}</p>
        <p className="mt-2 text-[15px] text-muted">{EXTRAS_COPY}</p>
        <KakaoConsultLink className="btn-ghost mt-6 inline-flex min-h-14 px-8">카톡 상담</KakaoConsultLink>
        <Link href="/book" className="btn-primary mt-3 inline-flex min-h-14 px-8">다시 예약하기</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
      </div>
    );
  }

  if (order.alreadyPaid) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center" data-testid="pay-already">
        <h1 className="text-[28px] font-bold">이미 결제가 완료됐습니다</h1>
        <Link href={`/book/pay/success?orderId=${encodeURIComponent(order.orderNo)}&amount=${order.amount}`} className="btn-primary mt-8 inline-flex min-h-14 px-8">
          예약 확인
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-snow" data-testid="book-pay">
      <div className="mx-auto max-w-lg px-5 py-10 md:py-16">
        <p className="eyebrow">결제</p>
        <h1 className="mt-2 text-[32px] font-bold tracking-tight">강습비를 결제해 주세요</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted">
          결제가 끝나야 예약이 확정됩니다. 창을 닫으면 결제는 되지 않습니다.
        </p>
        <dl className="mt-6 overflow-hidden rounded-[24px] bg-white text-[15px] shadow-[0_8px_30px_rgba(25,31,40,0.04)]">
          <div className="flex justify-between border-b border-line px-5 py-4">
            <dt className="text-muted">주문번호</dt>
            <dd className="font-semibold" data-testid="pay-order-no">{order.orderNo}</dd>
          </div>
          {order.lessonDate && (
            <div className="flex justify-between border-b border-line px-5 py-4">
              <dt className="text-muted">날짜</dt>
              <dd className="font-semibold">{order.lessonDate}</dd>
            </div>
          )}
          {order.lessonTime && (
            <div className="flex justify-between border-b border-line px-5 py-4">
              <dt className="text-muted">시간</dt>
              <dd className="font-semibold">{order.lessonTime}</dd>
            </div>
          )}
          {order.badgeFee != null && order.badgeFee > 0 && order.lessonAmount != null && (
            <>
              <div className="flex justify-between border-b border-line px-5 py-4">
                <dt className="text-muted">강습비</dt>
                <dd className="font-semibold" data-testid="pay-lesson-amount">
                  {order.lessonAmount.toLocaleString('ko-KR')}원
                </dd>
              </div>
              <div className="flex justify-between border-b border-line px-5 py-4">
                <dt className="text-muted">패찰비</dt>
                <dd className="font-semibold" data-testid="pay-badge-fee">
                  {order.badgeFee.toLocaleString('ko-KR')}원
                </dd>
              </div>
            </>
          )}
          <div className="flex justify-between px-5 py-4">
            <dt className="text-muted">결제 금액</dt>
            <dd className="text-[20px] font-bold" data-testid="pay-amount">{order.amountLabel}</dd>
          </div>
        </dl>
        <div className="mt-6">
          <KcpCheckout
            orderNo={order.orderNo}
            orderName={order.orderName}
            amount={order.amount}
            customerName={order.customerName}
            customerPhone={order.customerPhone || ''}
            testMode={order.testMode}
          />
        </div>
      </div>
    </div>
  );
}

export default function BookPayPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
      </div>
    }>
      <PayContent />
    </Suspense>
  );
}
