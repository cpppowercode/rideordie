'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { CHANNEL_URL, PRODUCT_DATA } from '@/lib/mockData';
import { executeKcpPay, KcpPayForm } from '@/components/checkout/KcpPayForm';
import {
    expectedPayAmount,
    isMobileUserAgent,
    type KcpPayMethod,
} from '@/lib/kcp-public';

type KcpLaunch = {
    orderId: string;
    approvalKey?: string;
    payUrl?: string;
    retUrl?: string;
};

export default function CheckoutPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasConsulted, setHasConsulted] = useState(false);
    const [payMethod, setPayMethod] = useState<KcpPayMethod>('card');
    const [kcpLaunch, setKcpLaunch] = useState<KcpLaunch | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    const amount = expectedPayAmount();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

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
            alert(message);
            setIsProcessing(false);
            setKcpLaunch(null);
        });

        return () => {
            cancelled = true;
        };
    }, [kcpLaunch]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hasConsulted) {
            alert('결제 전 채널톡으로 상담을 완료해 주세요.');
            return;
        }

        if (!formData.name || !formData.phone) {
            alert('필수 정보를 모두 입력해주세요.');
            return;
        }

        setIsProcessing(true);

        try {
            const orderRes = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: formData.name,
                    customerPhone: formData.phone,
                    productId: PRODUCT_DATA.id,
                    productName: PRODUCT_DATA.title,
                    selectedOptions: {},
                    amount
                })
            });

            const orderData = await orderRes.json();

            if (!orderData.success) {
                throw new Error(orderData.error || '주문 생성에 실패했습니다.');
            }

            const { orderId } = orderData as { orderId: string };
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
                    approvalKey: registerData.approvalKey,
                    payUrl: registerData.PayUrl,
                    retUrl,
                });
                return;
            }

            setKcpLaunch({ orderId });
        } catch (error: unknown) {
            console.error('Payment error:', error);
            const errorMessage = error instanceof Error ? error.message : '결제 요청 중 오류가 발생했습니다.';
            alert(errorMessage);
            setIsProcessing(false);
        }
    };

    const inputClass = 'w-full rounded-xl border border-line bg-white px-4 py-3.5 text-lg outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

    return (
        <div className="bg-snow">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
            <h1 className="mb-8 text-3xl font-bold">결제하기</h1>

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
            />

            <form onSubmit={handlePayment} className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                    <section className="flex gap-4 rounded-xl bg-ink p-6 text-white md:p-7">
                        <MessageCircle className="mt-0.5 h-6 w-6 shrink-0 text-[#9db4ff]" />
                        <div>
                            <h2 className="text-lg font-bold">먼저 상담을 마쳐주세요</h2>
                            <p className="mt-2 text-[15px] leading-relaxed text-white/75">
                                상담 없이 결제하면 일정 조율·환불이 어려울 수 있습니다. 채널톡으로 일정·레벨·시간을 확인한 뒤에만 결제가 가능합니다.
                            </p>
                            <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="btn mt-4 bg-white px-5 py-2.5 text-[15px] text-ink hover:bg-ice">
                                채널톡 상담하기
                            </a>
                        </div>
                    </section>

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
                                    className={`flex cursor-pointer items-center justify-center rounded-lg border-2 py-4 text-lg font-semibold transition-colors ${payMethod === value ? 'border-brand bg-ice text-brand' : 'border-line hover:bg-snow'}`}
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
                            <p className="mt-1 text-sm text-muted">하이원 현장 강습</p>
                        </div>

                        <div className="mb-6 flex items-end justify-between">
                            <span className="font-medium">총 결제금액</span>
                            <span className="text-2xl font-extrabold">{amount.toLocaleString()}원</span>
                        </div>

                        <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-lg bg-snow p-4">
                            <input
                                type="checkbox"
                                checked={hasConsulted}
                                onChange={(e) => setHasConsulted(e.target.checked)}
                                className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
                            />
                            <span className="text-[15px] font-medium leading-snug">채널톡으로 상담을 완료했어요</span>
                        </label>

                        <button type="submit" disabled={isProcessing || !hasConsulted} className="btn-primary w-full py-4 text-lg">
                            {isProcessing ? '처리 중...' : `${amount.toLocaleString()}원 결제하기`}
                        </button>
                        {!hasConsulted && (
                            <p className="mt-3 text-center text-sm text-muted">상담 완료에 체크하면 결제할 수 있어요.</p>
                        )}
                    </div>
                </div>
            </form>
        </div>
        </div>
    );
}
