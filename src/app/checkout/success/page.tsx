'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PaymentInfo {
    orderId: string;
    totalAmount: number;
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [orderInfo, setOrderInfo] = useState<PaymentInfo | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const confirmPayment = async () => {
            const paymentKey = searchParams.get('paymentKey');
            const orderId = searchParams.get('orderId');
            const amount = searchParams.get('amount');

            if (!paymentKey || !orderId || !amount) {
                setStatus('error');
                setErrorMessage('결제 정보가 올바르지 않습니다.');
                return;
            }

            try {
                const res = await fetch('/api/payments/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentKey,
                        orderId,
                        amount: Number(amount)
                    })
                });

                const data = await res.json();

                if (data.success) {
                    setOrderInfo(data.payment);
                    setStatus('success');
                } else {
                    throw new Error(data.error || '결제 승인에 실패했습니다.');
                }
            } catch (error: unknown) {
                console.error('Payment confirmation failed:', error);
                setStatus('error');
                const errorMessage = error instanceof Error ? error.message : '결제 승인 중 오류가 발생했습니다.';
                setErrorMessage(errorMessage);
            }
        };

        confirmPayment();
    }, [searchParams]);

    if (status === 'loading') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-6" />
                <h1 className="text-2xl font-bold mb-2">결제 승인 중입니다</h1>
                <p className="text-muted-foreground">잠시만 기다려주세요...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-red-100 p-6 rounded-full mb-6">
                    <XCircle className="h-16 w-16 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold mb-4">결제 승인에 실패했습니다</h1>
                <p className="text-muted-foreground text-lg mb-8 max-w-md">
                    {errorMessage}
                </p>
                <div className="flex gap-4">
                    <Link href="/checkout" className="px-6 py-3 border border-black font-medium hover:bg-gray-50 transition-colors">
                        다시 시도
                    </Link>
                    <Link href="/" className="px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors">
                        홈으로
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-green-100 p-6 rounded-full mb-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">결제가 완료되었습니다</h1>
            <div className="text-muted-foreground text-lg mb-8 max-w-md space-y-2">
                <p>주문번호: <span className="font-semibold text-black">{orderInfo?.orderId}</span></p>
                <p>결제금액: <span className="font-semibold text-black">{orderInfo?.totalAmount?.toLocaleString()}원</span></p>
            </div>

            {/* 채널톡 안내 */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8 max-w-md">
                <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        💬
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-blue-900 mb-2">다음 단계</h3>
                        <p className="text-sm text-blue-800">
                            곧 채널톡으로 연락드려 강습 일정, 레벨, 시간대를 상담해드리겠습니다.
                        </p>
                    </div>
                </div>
                <a
                    href="https://rideordie.channel.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-blue-600 text-white font-medium rounded-sm hover:bg-blue-700 transition-colors text-center"
                >
                    지금 바로 상담하기
                </a>
            </div>

            <Link href="/" className="px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-sm">
                쇼핑 계속하기
            </Link>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
