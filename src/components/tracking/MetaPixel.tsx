'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    fbq?: (
      action: 'init' | 'track' | 'trackCustom',
      eventName?: string,
      params?: Record<string, unknown>
    ) => void;
    _fbq?: unknown;
  }
}

type MetaPixelProps = {
  pixelId: string;
};

export function MetaPixel({ pixelId }: MetaPixelProps) {
  useEffect(() => {
    if (!pixelId || typeof window === 'undefined') return;

    // fbq 초기화
    if (!window.fbq) {
      window.fbq = function() {
        // eslint-disable-next-line prefer-rest-params
        (window.fbq as any).callMethod?.apply(window.fbq, arguments) ||
          (window.fbq as any).queue?.push(arguments);
      };
      if (!window._fbq) window._fbq = window.fbq;
      (window.fbq as any).push = window.fbq;
      (window.fbq as any).loaded = true;
      (window.fbq as any).version = '2.0';
      (window.fbq as any).queue = [];
    }

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }, [pixelId]);

  if (!pixelId) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        src="https://connect.facebook.net/en_US/fbevents.js"
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * 메타 픽셀 전환 이벤트 전송
 */
export function sendMetaConversion(data: {
  eventName: 'Purchase' | 'Lead' | 'Schedule';
  value?: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
}) {
  if (typeof window === 'undefined' || !window.fbq) {
    return;
  }

  try {
    window.fbq('track', data.eventName, {
      value: data.value,
      currency: data.currency || 'KRW',
      content_name: data.content_name,
      content_ids: data.content_ids,
    });
  } catch (error) {
    console.error('Meta Pixel conversion error:', error);
  }
}
