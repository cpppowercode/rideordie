'use client';

import { useEffect } from 'react';
import { sendNaverConversion } from './NaverWCS';
import { sendMetaConversion } from './MetaPixel';
import { sendTikTokConversion } from './TikTokPixel';

type ConversionData = {
  orderNo: string;
  amount: number;
  resort: string;
  date: string;
};

export function ConversionTracker({ orderNo, amount, resort, date }: ConversionData) {
  useEffect(() => {
    // 결제 승인 완료 후에만 전환 이벤트 전송
    // 중복 전송 방지를 위해 sessionStorage 체크
    const key = `conversion_sent_${orderNo}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(key)) {
      return;
    }

    // 네이버 WCS 전환
    sendNaverConversion({
      type: 'purchase',
      value: amount,
      id: orderNo,
    });

    // 메타 픽셀 전환
    sendMetaConversion({
      eventName: 'Purchase',
      value: amount,
      currency: 'KRW',
      content_name: `${resort} 강습 예약 - ${date}`,
      content_ids: [orderNo],
    });

    // 틱톡 픽셀 전환
    sendTikTokConversion({
      eventName: 'CompletePayment',
      value: amount,
      currency: 'KRW',
      content_name: `${resort} 강습 예약`,
      content_id: orderNo,
    });

    // 전송 완료 표시
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, '1');
    }
  }, [orderNo, amount, resort, date]);

  return null;
}
