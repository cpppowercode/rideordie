'use client';

import { useEffect, useState } from 'react';
import { executeKcpPay, KcpPayForm } from '@/components/checkout/KcpPayForm';
import {
  EXTRAS_COPY,
  isMobileUserAgent,
  type KcpPayMethod,
} from '@/lib/kcp-public';

type Props = {
  orderNo: string;
  orderName: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  testMode: boolean;
};

type KcpLaunch = {
  approvalKey?: string;
  payUrl?: string;
  retUrl?: string;
};

export function KcpCheckout({
  orderNo,
  orderName,
  amount,
  customerName,
  customerPhone,
  testMode,
}: Props) {
  const [payMethod, setPayMethod] = useState<KcpPayMethod>('card');
  const [launch, setLaunch] = useState<KcpLaunch | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!launch) return;
    let cancelled = false;
    (async () => {
      if (!launch.payUrl) {
        for (let i = 0; i < 50 && !window.KCP_Pay_Execute_Web; i += 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        if (!window.KCP_Pay_Execute_Web) {
          throw new Error('KCP 결제창을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
      }
      if (cancelled) return;
      const form = document.forms.namedItem('order_info') as HTMLFormElement | null;
      if (!form) throw new Error('결제 폼을 찾지 못했습니다.');
      executeKcpPay(form, launch.payUrl);
    })().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : '결제를 시작하지 못했습니다.');
      setProcessing(false);
      setLaunch(null);
    });
    return () => {
      cancelled = true;
    };
  }, [launch]);

  const pay = async () => {
    setError('');
    setProcessing(true);
    try {
      const mobile = isMobileUserAgent(navigator.userAgent);
      if (mobile) {
        const retUrl = `${window.location.origin}/api/payments/kcp/return`;
        const registerRes = await fetch('/api/payments/kcp/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderNo,
            goodName: orderName,
            payMethod,
            retUrl,
          }),
        });
        const registerData = await registerRes.json();
        if (!registerData.success) {
          throw new Error(registerData.error || 'KCP 거래등록에 실패했습니다.');
        }
        if (Number(registerData.amount) !== amount) {
          throw new Error('결제 금액이 예약 금액과 다릅니다.');
        }
        setLaunch({
          approvalKey: registerData.approvalKey,
          payUrl: registerData.PayUrl,
          retUrl,
        });
        return;
      }
      setLaunch({});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '결제를 시작하지 못했습니다.');
      setProcessing(false);
    }
  };

  return (
    <div data-testid="kcp-checkout">
      <KcpPayForm
        key={`${orderNo}-${payMethod}-${launch ? 'go' : 'idle'}`}
        orderId={orderNo}
        goodName={orderName}
        amount={amount}
        buyerName={customerName}
        buyerPhone={customerPhone}
        payMethod={payMethod}
        approvalKey={launch?.approvalKey}
        payUrl={launch?.payUrl}
        retUrl={launch?.retUrl}
        successPath="/book/pay/success"
        failPath="/book/pay/fail"
      />
      {testMode && (
        <p className="mb-4 rounded-2xl bg-ice px-4 py-3 text-[14px] text-ink" data-testid="kcp-test-mode">
          KCP 테스트 결제입니다. 사이트코드 T0000 · 실제 출금되지 않습니다.
        </p>
      )}
      <p className="mb-4 text-[14px] text-muted" data-testid="pay-extras">
        {EXTRAS_COPY}
      </p>
      <div className="grid grid-cols-2 gap-3" data-testid="kcp-methods">
        {([['card', '신용카드'], ['bank', '계좌이체']] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setPayMethod(value)}
            className={`min-h-14 rounded-2xl text-[16px] font-semibold ${
              payMethod === value ? 'bg-ink text-white' : 'bg-white ring-1 ring-line'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600" data-testid="kcp-error">
          {error}
        </p>
      )}
      <button
        type="button"
        data-testid="kcp-pay"
        disabled={processing}
        onClick={pay}
        className="btn-primary mt-6 min-h-14 w-full text-[18px]"
      >
        {processing ? '결제창 여는 중…' : `${amount.toLocaleString('ko-KR')}원 결제하기`}
      </button>
    </div>
  );
}
