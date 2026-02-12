import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json();

    // 입력 검증
    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 토스페이먼츠 API 호출 - 결제 승인
    const tossSecretKey = process.env.TOSS_SECRET_KEY;
    if (!tossSecretKey) {
      throw new Error('토스페이먼츠 시크릿 키가 설정되지 않았습니다.');
    }

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${tossSecretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount
      })
    });

    const paymentData = await response.json();

    if (!response.ok) {
      console.error('Toss payment confirmation failed:', paymentData);
      throw new Error(paymentData.message || '결제 승인에 실패했습니다.');
    }

    // Supabase 없이, 토스 응답만 그대로 반환
    return NextResponse.json({ 
      success: true, 
      payment: paymentData 
    });
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: error.message || '결제 승인에 실패했습니다.' },
      { status: 500 }
    );
  }
}
