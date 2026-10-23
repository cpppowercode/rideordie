'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KakaoConsultLink } from '@/components/seo/KakaoConsultLink';
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
        const orderId = searchParams.get('orderId') || searchParams.get('ordr_idxx');
        const amount = searchParams.get('amount');
        const tno = searchParams.get('tno');

        if (!orderId || !amount) {
            setStatus('error');
            setErrorMessage('결제 정보가 올바르지 않습니다.');
            return;
        }

        if (!tno) {
            setStatus('error');
            setErrorMessage('결제 승인 정보가 없습니다. 다시 시도해 주세요.');
            return;
        }

        setOrderInfo({
            orderId,
            totalAmount: Number(amount),
        });
        setStatus('success');
    }, [searchParams]);

    if (status === 'loading') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <Loader2 className="h-16 w-16 text-brand animate-spin mb-6" />
                <h1 className="text-2xl font-bold mb-2">결제 승인 중입니다</h1>
                <p className="text-muted">잠시만 기다려주세요...</p>
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
                <p className="text-muted text-lg mb-8 max-w-md">
                    {errorMessage}
                </p>
                <div className="flex gap-4">
                    <Link href="/checkout" className="btn-ghost">
                        다시 시도
                    </Link>
                    <Link href="/" className="btn-dark">
                        홈으로
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-ice p-6 rounded-full mb-6">
                <CheckCircle className="h-16 w-16 text-brand" />
            </div>
            <h1 className="text-3xl font-bold mb-4">결제가 완료되었습니다</h1>
            <div className="text-muted text-lg mb-8 max-w-md space-y-2">
                <p>주문번호: <span className="font-semibold text-black">{orderInfo?.orderId}</span></p>
                <p>결제금액: <span className="font-semibold text-black">{orderInfo?.totalAmount?.toLocaleString()}원</span></p>
            </div>

            <div className="bg-ice p-6 rounded-xl text-left mb-8 max-w-md">
                <h3 className="font-bold text-ink mb-2">다음 단계</h3>
                <p className="text-sm text-ink/75">
                    예약한 일정으로 강습을 진행합니다. 변경이 필요하면{" "}
                    <KakaoConsultLink className="font-semibold text-ink underline">카톡 상담</KakaoConsultLink>
                    으로 연락해 주세요.
                </p>
                <Link href="/book" className="btn-primary mt-4 w-full">
                    예약 내역 확인하러 가기
                </Link>
            </div>

            <Link href="/" className="btn-dark">
                홈으로
            </Link>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-16 w-16 text-brand animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
