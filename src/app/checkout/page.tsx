'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';
import { PRODUCT_DATA } from '@/lib/mockData';
import { TEACHING_RESORTS_COPY } from '@/lib/site';
import { executeKcpPay, KcpPayForm } from '@/components/checkout/KcpPayForm';
import {
    expectedPayAmount,
    isMobileUserAgent,
    type KcpPayMethod,
} from '@/lib/kcp-public';
import { PENDING_BOOKING_KEY, readPendingBooking, type PendingBooking } from '@/lib/pending-booking';

type KcpLaunch = {
    orderId: string;
    intent: string;
    approvalKey?: string;
    payUrl?: string;
    retUrl?: string;
};

export default function CheckoutPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [pending, setPending] = useState<PendingBooking | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [payError, setPayError] = useState('');
    const [payMethod, setPayMethod] = useState<KcpPayMethod>('card');
    const [kcpLaunch, setKcpLaunch] = useState<KcpLaunch | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    const amount = expectedPayAmount();

    useEffect(() => {
        const saved = readPendingBooking();
        setPending(saved);
        if (saved) setFormData({ name: saved.customerName, phone: saved.customerPhone });
        setLoaded(true);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handlePayFail = useCallback((message: string) => {
        // 결제 실패·취소: 예약은 접수되지 않는다. 입력 정보는 그대로 두고 다시 결제할 수 있게 한다.
        setPayError(message);
        setIsProcessing(false);
        setKcpLaunch(null);
    }, []);

    useEffect(() => {
        if (!kcpLaunch) return;

        let cancelled = false;
        (async () => {
            if (!kcpLaunch.payUrl) {
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
            executeKcpPay(form, kcpLaunch.payUrl);
        })().catch((error: unknown) => {
            const message = error instanceof Error ? error.message : '결제 요청 중 오류가 발생했습니다.';
            handlePayFail(message);
        });

        return () => {
            cancelled = true;
        };
    }, [kcpLaunch, handlePayFail]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setPayError('');

        if (!pending) {
            setPayError('먼저 강습 일정을 골라 주세요.');
            return;
        }

        if (!formData.name.trim() || !formData.phone.trim()) {
            setPayError('이름과 연락처를 입력해 주세요.');
            return;
        }

        setIsProcessing(true);

        try {
            const updated: PendingBooking = { ...pending, customerName: formData.name, customerPhone: formData.phone };
            sessionStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(updated));

            // 서버가 일정·마감을 다시 확인하고 서명된 결제 대기 정보를 준다. 이 단계에서는 저장·알림이 없다.
            const intentRes = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            });
            const intentData = await intentRes.json();
            if (!intentRes.ok || !intentData.success) {
                throw new Error(intentData.error || '예약 정보를 확인하지 못했습니다.');
            }

            const { orderNo: orderId, intent } = intentData as { orderNo: string; intent: string };
            const mobile = isMobileUserAgent(navigator.userAgent);

            if (mobile) {
                const retUrl = `${window.location.origin}/api/payments/kcp/return`;
                const registerRes = await fetch('/api/payments/kcp/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId,
                        goodName: PRODUCT_DATA.title,
                        payMethod,
                        retUrl,
                    }),
                });
                const registerData = await registerRes.json();
                if (!registerData.success) {
                    throw new Error(registerData.error || 'KCP 거래등록에 실패했습니다.');
                }
                setKcpLaunch({
                    orderId,
                    intent,
                    approvalKey: registerData.approvalKey,
                    payUrl: registerData.PayUrl,
                    retUrl,
                });
                return;
            }

            setKcpLaunch({ orderId, intent });
        } catch (error: unknown) {
            console.error('Payment error:', error);
            const errorMessage = error instanceof Error ? error.message : '결제 요청 중 오류가 발생했습니다.';
            handlePayFail(errorMessage);
        }
    };

    const inputClass = 'w-full rounded-2xl border border-line bg-white px-4 py-4 text-[17px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15';

    return (
        <div className="bg-snow">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
            <p className="eyebrow">CHECKOUT</p>
            <h1 className="mb-8 mt-2 text-[32px] font-bold tracking-tight">결제하기</h1>

            <KcpPayForm
                key={kcpLaunch?.orderId || 'idle'}
                orderId={kcpLaunch?.orderId || ''}
                goodName={PRODUCT_DATA.title}
                amount={amount}
                buyerName={formData.name}
                buyerPhone={formData.phone}
                payMethod={payMethod}
                approvalKey={kcpLaunch?.approvalKey}
                payUrl={kcpLaunch?.payUrl}
                retUrl={kcpLaunch?.retUrl}
                intent={kcpLaunch?.intent}
                onFail={handlePayFail}
            />

            <form onSubmit={handlePayment} className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                    {loaded && !pending ? (
                        <section className="flex gap-4 rounded-[24px] bg-ink p-6 text-white md:p-7" data-testid="checkout-no-booking">
                            <CalendarCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#9db4ff]" />
                            <div>
                                <h2 className="text-lg font-bold">먼저 강습 일정을 골라 주세요</h2>
                                <p className="mt-2 text-[15px] leading-relaxed text-white/75">
                                    날짜와 시간을 고른 뒤 결제하면 예약이 접수됩니다.
                                </p>
                                <Link href="/book" className="btn mt-4 bg-white px-5 py-2.5 text-[15px] text-ink hover:bg-ice">
                                    강습 일정 고르기
                                </Link>
                            </div>
                        </section>
                    ) : null}

                    {pending ? (
                        <section className="card p-6 md:p-7" data-testid="checkout-booking-summary">
                            <h2 className="mb-4 text-xl font-bold">예약할 강습</h2>
                            <dl className="grid grid-cols-2 gap-3 text-[15px]">
                                <dt className="text-muted">스키장</dt><dd className="font-semibold">{pending.skiResort}</dd>
                                <dt className="text-muted">날짜</dt><dd className="font-semibold">{pending.lessonDate}</dd>
                                <dt className="text-muted">시간</dt><dd className="font-semibold">{pending.timeLabel}</dd>
                                <dt className="text-muted">인원</dt><dd className="font-semibold">{pending.participants}명</dd>
                            </dl>
                            <p className="mt-4 text-sm text-muted">아직 접수 전이에요. 결제가 끝나야 예약이 접수됩니다.</p>
                            <Link href="/book" className="mt-3 inline-block text-sm font-semibold text-brand underline">일정 바꾸기</Link>
                        </section>
                    ) : null}

                    <section className="card p-6 md:p-7">
                        <h2 className="mb-5 text-xl font-bold">주문자 정보</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="block">
                                <span className="mb-1.5 block text-[15px] font-medium">이름</span>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={inputClass} placeholder="홍길동" autoComplete="name" />
                            </label>
                            <label className="block">
                                <span className="mb-1.5 block text-[15px] font-medium">연락처</span>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className={inputClass} placeholder="010-1234-5678" autoComplete="tel" />
                            </label>
                        </div>
                    </section>

                    <section className="card p-6 md:p-7">
                        <h2 className="mb-5 text-xl font-bold">결제 수단</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {([['card', '신용카드'], ['bank', '계좌이체']] as const).map(([value, label]) => (
                                <label
                                    key={value}
                                    className={`flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border-2 py-4 text-lg font-semibold transition-colors ${payMethod === value ? 'border-brand bg-ice text-brand' : 'border-line hover:bg-snow'}`}
                                >
                                    <input type="radio" name="payment" checked={payMethod === value} onChange={() => setPayMethod(value)} className="sr-only" />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="md:col-span-1">
                    <div className="card sticky top-24 p-6">
                        <h3 className="mb-4 text-lg font-bold">주문 요약</h3>
                        <div className="mb-4 border-b border-line pb-4">
                            <p className="font-medium leading-snug">{PRODUCT_DATA.title}</p>
                            <p className="mt-1 text-sm text-muted">{TEACHING_RESORTS_COPY} 현장 강습</p>
                        </div>

                        <div className="mb-6 flex items-end justify-between">
                            <span className="font-medium">총 결제금액</span>
                            <span className="text-2xl font-extrabold">{amount.toLocaleString()}원</span>
                        </div>

                        {payError ? (
                            <p className="mb-4 rounded-lg bg-red-50 p-4 text-[15px] font-medium text-red-600" role="alert" data-testid="checkout-error">
                                {payError}
                                <span className="mt-1 block text-sm font-normal text-red-500">예약은 접수되지 않았어요. 다시 결제할 수 있어요.</span>
                            </p>
                        ) : null}

                        <button type="submit" disabled={isProcessing || !pending} className="btn-primary w-full py-4 text-lg" data-testid="checkout-pay">
                            {isProcessing ? '처리 중...' : `${amount.toLocaleString()}원 결제하기`}
                        </button>
                        <p className="mt-3 text-center text-sm text-muted">결제가 끝나면 예약이 접수됩니다.</p>
                    </div>
                </div>
            </form>
        </div>
        </div>
    );
}
