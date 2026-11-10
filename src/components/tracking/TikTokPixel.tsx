'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    ttq?: {
      load: (pixelId: string) => void;
      page: () => void;
      track: (eventName: string, params?: Record<string, unknown>) => void;
      _i?: Record<string, unknown>;
      _q?: unknown[];
    };
  }
}

type TikTokPixelProps = {
  pixelId: string;
};

export function TikTokPixel({ pixelId }: TikTokPixelProps) {
  useEffect(() => {
    if (!pixelId || typeof window === 'undefined') return;

    // ttq 초기화
    if (!window.ttq) {
      window.ttq = {
        load: function(id: string) {
          if (!window.ttq?._i) {
            window.ttq!._i = {};
          }
          window.ttq!._i[id] = true;
        },
        page: function() {
          window.ttq?._q?.push(['page']);
        },
        track: function(eventName: string, params?: Record<string, unknown>) {
          window.ttq?._q?.push(['track', eventName, params]);
        },
      };
      window.ttq._q = [];
    }

    window.ttq.load(pixelId);
    window.ttq.page();
  }, [pixelId]);

  if (!pixelId) return null;

  return (
    <Script
      id="tiktok-pixel"
      strategy="afterInteractive"
      src="https://analytics.tiktok.com/i18n/pixel/events.js"
    />
  );
}

/**
 * 틱톡 픽셀 전환 이벤트 전송
 */
export function sendTikTokConversion(data: {
  eventName: 'CompletePayment' | 'SubmitForm';
  value?: number;
  currency?: string;
  content_name?: string;
  content_id?: string;
}) {
  if (typeof window === 'undefined' || !window.ttq) {
    return;
  }

  try {
    window.ttq.track(data.eventName, {
      value: data.value,
      currency: data.currency || 'KRW',
      content_name: data.content_name,
      content_id: data.content_id,
    });
  } catch (error) {
    console.error('TikTok Pixel conversion error:', error);
  }
}
