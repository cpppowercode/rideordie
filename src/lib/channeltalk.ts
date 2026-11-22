/** 채널톡 공개 플러그인 키. env가 있으면 우선, 없으면 기본값으로 배포만으로 동작. */
export const DEFAULT_CHANNELTALK_PLUGIN_KEY =
  "a7826be5-8e5c-4fe3-9cd1-47b044d4f503";

/** 공개 사이트 UI 언어 — 채널톡 boot 옵션에 고정. */
export const CHANNELTALK_LANGUAGE = "ko" as const;

/** 예약·결제 흐름 — 하단 CTA를 가리지 않도록 런처 숨김. ChatWidget과 동일 규칙. */
export const CHANNELTALK_HIDDEN_PATH =
  /^\/(book|checkout)(\/|$)/;

export function getChannelTalkPluginKey(
  envValue: string | undefined = process.env.NEXT_PUBLIC_CHANNELTALK_PLUGIN_KEY,
): string {
  const trimmed = envValue?.trim();
  return trimmed || DEFAULT_CHANNELTALK_PLUGIN_KEY;
}

/** ChannelIO("boot", options) 에 넘기는 공개 옵션. language 는 항상 한국어. */
export function getChannelTalkBootOptions(options: {
  pluginKey: string;
  hideChannelButtonOnBoot?: boolean;
}): {
  pluginKey: string;
  language: typeof CHANNELTALK_LANGUAGE;
  hideChannelButtonOnBoot: boolean;
} {
  return {
    pluginKey: options.pluginKey,
    language: CHANNELTALK_LANGUAGE,
    hideChannelButtonOnBoot: Boolean(options.hideChannelButtonOnBoot),
  };
}

export function isChannelTalkEnabled(
  envValue?: string | undefined,
): boolean {
  return getChannelTalkPluginKey(envValue).length > 0;
}

export function shouldHideChannelTalk(pathname: string): boolean {
  return CHANNELTALK_HIDDEN_PATH.test(pathname || "");
}

/** 상품 상세 모바일 하단 예약 바와 겹치지 않게 런처를 올릴 경로. */
export function shouldOffsetChannelTalkForMobileCta(pathname: string): boolean {
  return /^\/product(\/|$)/.test(pathname || "");
}
