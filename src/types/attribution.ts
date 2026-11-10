export type AttributionSource = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  
  // 네이버 검색광고 자동추적 파라미터
  n_media?: string;
  n_query?: string;
  n_rank?: string;
  n_ad_group?: string;
  n_ad?: string;
  n_keyword_id?: string;
  n_keyword?: string;
  n_campaign_type?: string;
  n_match?: string;
  
  // 클릭 ID (광고 플랫폼별)
  fbclid?: string;
  ttclid?: string;
  gclid?: string;
  
  // NaPm (네이버 프리미엄로그분석)
  NaPm?: string;
  
  // 기타
  referrer?: string;
  landing_path?: string;
  ts?: number;
};

export type Attribution = {
  first?: AttributionSource | null;
  last?: AttributionSource | null;
  model?: 'last_non_direct' | 'first_touch' | 'linear';
};

export type AttributionData = {
  attr_first?: AttributionSource | null;
  attr_last?: AttributionSource | null;
  attr_model?: string;
};

export const ATTRIBUTION_COOKIE_NAME = 'rideordie_attr';
export const ATTRIBUTION_EXPIRY_DAYS = 30;
