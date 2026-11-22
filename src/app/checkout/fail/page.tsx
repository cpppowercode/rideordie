'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Loader2 } from 'lucide-react';

/** 쿼리 message 반사 대신 코드 → 고정 문구만 표시(피싱·XSS 문구 삽입 방지). */
const FAIL_MESSAGES: Record<string, string> = {
  APPROVE_FAIL: '결제 처리 결과를 확인하지 못했습니다. 중복 결제를 막기 위해 다시 결제하지 말고 카톡 상담으로 문의해 주세요.',
  INTENT: '예약 정보가 만료되었거나 올바르지 않습니다. 예약을 다시 진행해 주세요.',
  INVALID: '결제 정보가 올바르지 않습니다.',
  METHOD: '잘못된 결제 콜백입니다.',
  FAIL: '결제가 취소되었거나 실패했습니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};

function messageForCode(code: string): string {
  if (FAIL_MESSAGES[code]) return FAIL_MESSAGES[code];
  // KCP 응답 코드 등 — 외부 문자열을 그대로 쓰지 않고 일반 문구만.
  return FAIL_MESSAGES.FAIL;
}

function FailContent() {
    const searchParams = useSearchParams();
    const code = searchParams.get('code') || 'UNKNOWN_ERROR';
    const needsReview = code === 'APPROVE_FAIL';
    const order = searchParams.get('order') || '';
    const message = messageForCode(code);

    useEffect(() => {
        if (needsReview) {
            try { sessionStorage.setItem('rod_payment_review', order || 'unknown'); } catch { /* 저장이 차단돼도 안내는 표시한다. */ }
        }
    }, [needsReview, order]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-red-100 p-6 rounded-full mb-6">
                <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">{needsReview ? '결제 확인이 필요합니다' : '결제에 실패했습니다'}</h1>
            <div className="text-muted text-lg mb-8 max-w-md space-y-2">
                <p className="font-semibold text-red-600">{message}</p>
                <p className="text-sm text-muted">오류 코드: {code}</p>
                {needsReview ? <p className="text-[15px] text-ink">{order ? `주문번호: ${order}` : '결제 내역을 함께 확인해 주세요.'}</p> : <p className="text-[15px] text-ink">예약은 접수되지 않았어요. 입력하신 정보는 그대로 있으니 다시 결제할 수 있어요.</p>}
            </div>
            <div className="flex gap-4">
                {!needsReview && <Link 
                    href="/checkout" 
                    className="btn-ghost"
                >
                    다시 결제하기
                </Link>}
                <Link 
                    href="/" 
                    className="btn-dark"
                >
                    홈으로
                </Link>
            </div>
            
            <div className="mt-12 p-6 bg-snow rounded-xl max-w-md">
                <h3 className="font-semibold mb-2">도움이 필요하신가요?</h3>
                <p className="text-sm text-muted">
                    고객센터: <a href="https://pf.kakao.com/_xfWMxaG" target="_blank" rel="noopener noreferrer" className="hover:underline">카톡 상담</a><br />
                    이메일: contact@rideordie.kr<br />
                    운영시간: 연중 무휴
                </p>
            </div>
        </div>
    );
}

export default function PaymentFailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-16 w-16 text-brand animate-spin" />
            </div>
        }>
            <FailContent />
        </Suspense>
    );
}
