'use client';

import { useEffect, useState } from 'react';
import { PRODUCT_DATA } from '@/lib/mockData';
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

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-8">결제하기</h1>

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

            <form onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <section className="bg-white p-6 rounded-sm border shadow-sm">
                        <h2 className="text-lg font-bold mb-4">주문자 정보</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">이름</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border p-2 rounded-sm"
                                    placeholder="홍길동"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">연락처</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border p-2 rounded-sm"
                                    placeholder="010-1234-5678"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-blue-50 p-6 rounded-sm border border-blue-200">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                💬
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-blue-900 mb-2">강습 일정 및 옵션 상담</h3>
                                <p className="text-sm text-blue-800 mb-3">
                                    상담 없이 결제하면 일정 조율·환불이 어려울 수 있습니다. 채널톡으로 일정·레벨·시간을 확인한 뒤에만 결제가 가능합니다.
                                </p>
                                <a
                                    href="https://rideordie.channel.io/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                                >
                                    지금 바로 문의하기 →
                                </a>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-sm border shadow-sm">
                        <h2 className="text-lg font-bold mb-4">결제 수단</h2>
                        <div className="space-y-3">
                            <label className="flex items-center space-x-3 p-3 border rounded-sm cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={payMethod === 'card'}
                                    onChange={() => setPayMethod('card')}
                                    className="h-4 w-4 accent-black"
                                />
                                <span>신용카드</span>
                            </label>
                            <label className="flex items-center space-x-3 p-3 border rounded-sm cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={payMethod === 'bank'}
                                    onChange={() => setPayMethod('bank')}
                                    className="h-4 w-4 accent-black"
                                />
                                <span>계좌이체</span>
                            </label>
                        </div>
                    </section>
                </div>

                <div className="md:col-span-1">
                    <div className="sticky top-24 bg-gray-50 p-6 rounded-sm border">
                        <h3 className="font-bold mb-4 text-lg">주문 요약</h3>
                        <div className="flex justify-between items-start mb-4 pb-4 border-b">
                            <div className="flex-1">
                                <p className="font-medium text-sm">{PRODUCT_DATA.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">하이원 현장 강습</p>
                            </div>
                            <span className="font-bold">{amount.toLocaleString()}</span>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">상품금액</span>
                                <span>{amount.toLocaleString()} 원</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">할인</span>
                                <span className="text-accent">-0 원</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-4 border-t">
                                <span>총 결제금액</span>
                                <span className="text-accent">{amount.toLocaleString()} 원</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <button
                                type="button"
                                onClick={() => setHasConsulted(prev => !prev)}
                                className={`w-full py-3 border font-medium text-sm flex items-center justify-center gap-2 transition-colors ${hasConsulted
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-black border-black hover:bg-gray-50'
                                    }`}
                            >
                                {hasConsulted ? '네, 채널톡으로 상담을 완료했어요' : '결제 전 채널톡으로 상담을 완료했어요'}
                            </button>
                            <p className="mt-2 text-xs text-muted-foreground">
                                상담 완료 버튼을 누르면 아래 결제 버튼이 활성화됩니다.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing || !hasConsulted}
                            className="w-full py-3 border border-black font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? '처리 중...' : '결제하기'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
