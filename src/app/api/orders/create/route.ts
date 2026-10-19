import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      lessonDate,
      productId,
      productName,
      selectedOptions,
      amount
    } = body;

    // 입력 검증 (이메일은 선택)
    if (!customerName || !customerPhone || !productId || !productName || amount === undefined) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const orderId = `ROD${Date.now()}${uuidv4().replace(/-/g, "").slice(0, 8)}`.slice(0, 50);
    return NextResponse.json({
      orderId,
      order: {
        order_id: orderId,
        customer_name: customerName,
        customer_email: null,
        customer_phone: customerPhone,
        lesson_date: lessonDate || null,
        product_id: productId,
        product_name: productName,
        selected_options: selectedOptions || {},
        amount,
        status: 'pending'
      },
      success: true
    });
  } catch (error: unknown) {
    console.error('Order creation error:', error);
    const errorMessage = error instanceof Error ? error.message : '주문 생성에 실패했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
