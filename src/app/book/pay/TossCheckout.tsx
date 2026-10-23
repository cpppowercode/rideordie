'use client';

import { useEffect, useRef, useState } from 'react';
import { loadTossPayments, ANONYMOUS, type TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk';

type Props = {
  clientKey: string;
  customerKey: string;
  orderNo: string;
  orderName: string;
  amount: number;
  customerName: string;
  testMode: boolean;
};

export function TossCheckout({
  clientKey,
  customerKey,
  orderNo,
  orderName,
  amount,
  customerName,
  testMode,
}: Props) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const key = customerKey.length >= 10 ? customerKey : ANONYMOUS;
        const widgets = tossPayments.widgets({ customerKey: key });
        await widgets.setAmount({ currency: 'KRW', value: amount });
        await Promise.all([
          widgets.renderPaymentMethods({ selector: '#toss-payment-method', variantKey: 'DEFAULT' }),
          widgets.renderAgreement({ selector: '#toss-agreement', variantKey: 'AGREEMENT' }),
        ]);
        if (!cancelled) {
          widgetsRef.current = widgets;
          setReady(true);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '결제창을 불러오지 못했습니다.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [amount, clientKey, customerKey]);

  const pay = async () => {
    setError('');
    const widgets = widgetsRef.current;
    if (!widgets) {
      setError('결제창이 아직 준비되지 않았습니다.');
      return;
    }
    try {
      const origin = window.location.origin;
      await widgets.requestPayment({
        orderId: orderNo,
        orderName,
        customerName,
        successUrl: `${origin}/book/pay/success`,
        failUrl: `${origin}/book/pay/fail`,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '결제를 시작하지 못했습니다.');
    }
  };

  return (
    <div data-testid="toss-checkout">
      {testMode && (
        <p className="mb-4 rounded-2xl bg-ice px-4 py-3 text-[14px] text-ink" data-testid="toss-test-mode">
          테스트 결제입니다. 실제 출금되지 않습니다.
        </p>
      )}
      <div id="toss-payment-method" className="overflow-hidden rounded-[24px] bg-white" />
      <div id="toss-agreement" className="mt-3 overflow-hidden rounded-[24px] bg-white" />
      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600" data-testid="toss-error">
          {error}
        </p>
      )}
      <button
        type="button"
        data-testid="toss-pay"
        disabled={!ready}
        onClick={pay}
        className="btn-primary mt-6 min-h-14 w-full text-[18px]"
      >
        {ready ? `${amount.toLocaleString('ko-KR')}원 결제하기` : '결제창 준비 중…'}
      </button>
    </div>
  );
}
