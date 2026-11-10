'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    wcs_add?: Record<string, string>;
    wcs?: {
      inflow: (domain: string) => void;
      trans?: (data: {
        type: 'purchase' | 'schedule' | 'lead';
        value?: number;
        id?: string;
      }) => void;
    };
    wcs_do?: () => void;
  }
}

type NaverWCSProps = {
  wcsId: string;
};

export function NaverWCS({ wcsId }: NaverWCSProps) {
  useEffect(() => {
    if (!wcsId) return;
    
    // 전역 객체 초기화
    if (!window.wcs_add) window.wcs_add = {};
    window.wcs_add['wa'] = wcsId;
    
    // wcs 객체 초기화
    if (!window.wcs) {
      window.wcs = {
        inflow: () => {},
      };
    }
  }, [wcsId]);

  if (!wcsId) return null;

  return (
    <>
      <Script
        id="naver-wcs-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
if (!wcs_add) var wcs_add = {};
wcs_add["wa"] = "${wcsId}";
if (!_nasa) var _nasa = {};
if (window.wcs) {
  wcs.inflow("rideordie.kr");
  wcs_do();
}
          `.trim(),
        }}
      />
      <Script
        id="naver-wcs-script"
        src="//wcs.naver.net/wcslog.js"
        strategy="afterInteractive"
      />
    </>
  );
}

/**
 * 결제 완료 시 전환 이벤트 전송
 */
export function sendNaverConversion(data: {
  type: 'purchase' | 'schedule' | 'lead';
  value?: number;
  id?: string;
}) {
  if (typeof window === 'undefined' || !window.wcs?.trans) {
    return;
  }

  try {
    window.wcs.trans(data);
  } catch (error) {
    console.error('Naver WCS conversion error:', error);
  }
}
