'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2, Phone } from 'lucide-react';
import { OWNER_PHONE } from '@/lib/site';
import { formatWon } from '@/lib/pricing';

type ConfirmState =
  | { status: 'loading' }
  | { status: 'ok'; orderNo: string; amount: number }
  | { status: 'error'; message: string };

function SuccessContent() {
  const params = useSearchParams();
  const paymentKey = params.get('paymentKey') || '';
  const orderId = params.get('orderId') || '';
  const amount = Number(params.get('amount'));
  const [state, setState] = useState<ConfirmState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/payments/toss/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || '결제 확인에 실패했습니다.');
        }
        if (!cancelled) {
          setState({ status: 'ok', orderNo: data.orderNo, amount: data.amount });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : '결제 확인에 실패했습니다.',
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [amount, orderId, paymentKey]);

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3" data-testid="pay-confirming">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
        <p className="text-muted">결제를 확인하고 있습니다…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center" data-testid="pay-confirm-error">
        <h1 className="text-[28px] font-bold">결제는 됐지만 확인에 실패했습니다</h1>
        <p className="mt-3 text-muted">{state.message}</p>
        <p className="mt-2 text-[14px] text-muted">고객센터로 연락 주시면 확인해 드립니다.</p>
        <a href={`tel:${OWNER_PHONE}`} className="btn-primary mt-8 inline-flex min-h-14 px-8">
          전화하기 {OWNER_PHONE}
        </a>
      </div>
    );
  }

  return (
    <div className="bg-snow" data-testid="booking-success">
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center px-5 py-16 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgba(49,130,246,0.35)]">
          <Check className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <p className="eyebrow">결제 완료</p>
        <h1 className="mt-2 text-[32px] font-bold tracking-tight md:text-[40px]">예약이 확정됐어요</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted">
          강습비가 결제되었고, 사장님에게 알림이 전달됐습니다.
        </p>
        <dl className="mt-8 w-full overflow-hidden rounded-[24px] bg-white text-left shadow-[0_8px_30px_rgba(25,31,40,0.04)]">
          <div className="flex justify-between gap-4 border-b border-line px-5 py-4">
            <dt className="text-[15px] text-muted">예약번호</dt>
            <dd className="font-semibold" data-testid="success-order-no">{state.orderNo}</dd>
          </div>
          <div className="flex justify-between gap-4 px-5 py-4">
            <dt className="text-[15px] text-muted">결제 금액</dt>
            <dd className="font-semibold" data-testid="success-amount">{formatWon(state.amount)}</dd>
          </div>
        </dl>
        <div className="mt-8 flex w-full flex-col gap-3">
          <a href={`tel:${OWNER_PHONE}`} className="btn-ghost min-h-14">
            <Phone className="h-4 w-4" />
            전화하기 {OWNER_PHONE}
          </a>
          <Link href="/" className="btn-primary min-h-14">홈으로</Link>
        </div>
      </div>
    </div>
  );
}

export default function PaySuccessPage() {
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
