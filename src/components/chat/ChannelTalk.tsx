"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  getChannelTalkBootOptions,
  getChannelTalkPluginKey,
  shouldHideChannelTalk,
  shouldOffsetChannelTalkForMobileCta,
} from "@/lib/channeltalk";

const PLUGIN_KEY = getChannelTalkPluginKey();

type ChannelIOFn = ((...args: unknown[]) => void) & {
  q?: unknown[][];
  c?: (a: unknown[]) => void;
};

declare global {
  interface Window {
    ChannelIO?: ChannelIOFn;
    ChannelIOInitialized?: boolean;
  }
}

/** 채널톡 공식 스니펫 — 스크립트·큐를 한 번만 설치. */
function ensureChannelIO(): ChannelIOFn | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window;
  if (w.ChannelIO) return w.ChannelIO;

  const ch: ChannelIOFn = (...args: unknown[]) => {
    ch.c?.(args);
  };
  ch.q = [];
  ch.c = (args) => {
    ch.q!.push(args);
  };
  w.ChannelIO = ch;

  if (w.ChannelIOInitialized) return ch;
  w.ChannelIOInitialized = true;

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = "https://cdn.channel.io/plugin/ch-plugin-web.js";
  const first = document.getElementsByTagName("script")[0];
  if (first?.parentNode) {
    first.parentNode.insertBefore(script, first);
  } else {
    document.head.appendChild(script);
  }
  return ch;
}

/**
 * 공개 사이트 채널톡 웹 메신저.
 * 기본 우하단 런처를 쓰고, /book·/checkout 에서는 숨긴다.
 */
export function ChannelTalk() {
  const pathname = usePathname() || "/";
  const hidden = shouldHideChannelTalk(pathname);
  const offsetForCta = shouldOffsetChannelTalkForMobileCta(pathname);

  useEffect(() => {
    if (!PLUGIN_KEY) return;

    const ch = ensureChannelIO();
    // 첫 페인트가 /book·/checkout 이면 기본 버튼이 잠깐 보이지 않게 한다.
    const startHidden = shouldHideChannelTalk(
      typeof window !== "undefined" ? window.location.pathname : pathname,
    );
    ch?.("boot", getChannelTalkBootOptions({
      pluginKey: PLUGIN_KEY,
      hideChannelButtonOnBoot: startHidden,
    }));

    return () => {
      window.ChannelIO?.("shutdown");
    };
    // boot는 마운트 시 한 번만. 경로 숨김은 아래 effect에서 처리.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!PLUGIN_KEY || !window.ChannelIO) return;

    if (hidden) {
      window.ChannelIO("hideChannelButton");
      window.ChannelIO("hideMessenger");
    } else {
      window.ChannelIO("showChannelButton");
    }
  }, [hidden]);

  useEffect(() => {
    // 상품 상세(모바일) 고정 하단 예약 바와 겹치지 않도록 런처만 위로 올린다.
    const id = "channeltalk-mobile-cta-offset";
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (offsetForCta) {
      if (!style) {
        style = document.createElement("style");
        style.id = id;
        document.head.appendChild(style);
      }
      style.textContent = `
        @media (max-width: 1023px) {
          #ch-plugin-entry {
            bottom: 4.5rem !important;
          }
        }
      `;
    } else if (style) {
      style.remove();
    }
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [offsetForCta]);

  return null;
}
