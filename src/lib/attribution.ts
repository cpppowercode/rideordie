import type { AttributionSource } from '@/types/attribution';

/**
 * URL 쿼리 파라미터와 referrer에서 어트리뷰션 데이터를 추출합니다.
 */
export function extractAttributionFromUrl(url: URL, referrer: string): AttributionSource | null {
  const params = url.searchParams;
  
  // UTM 파라미터
  const utm_source = params.get('utm_source');
  const utm_medium = params.get('utm_medium');
  const utm_campaign = params.get('utm_campaign');
  const utm_content = params.get('utm_content');
  const utm_term = params.get('utm_term');
  
  // 네이버 검색광고 자동추적 파라미터
  const n_media = params.get('n_media');
  const n_query = params.get('n_query');
  const n_rank = params.get('n_rank');
  const n_ad_group = params.get('n_ad_group');
  const n_ad = params.get('n_ad');
  const n_keyword_id = params.get('n_keyword_id');
  const n_keyword = params.get('n_keyword');
  const n_campaign_type = params.get('n_campaign_type');
  const n_match = params.get('n_match');
  const NaPm = params.get('NaPm');
  
  // 광고 플랫폼 클릭 ID
  const fbclid = params.get('fbclid');
  const ttclid = params.get('ttclid');
  const gclid = params.get('gclid');
  
  // 어트리뷰션 가능한 데이터가 있는지 확인
  const hasAttribution = 
    utm_source || utm_medium || 
    n_media || n_keyword_id || n_ad || 
    fbclid || ttclid || gclid ||
    referrer;
  
  if (!hasAttribution) {
    return null;
  }
  
  const source: AttributionSource = {
    ts: Date.now(),
    landing_path: url.pathname + url.search,
  };
  
  // UTM
  if (utm_source) source.source = utm_source;
  if (utm_medium) source.medium = utm_medium;
  if (utm_campaign) source.campaign = utm_campaign;
  if (utm_content) source.content = utm_content;
  if (utm_term) source.term = utm_term;
  
  // 네이버
  if (n_media) source.n_media = n_media;
  if (n_query) source.n_query = n_query;
  if (n_rank) source.n_rank = n_rank;
  if (n_ad_group) source.n_ad_group = n_ad_group;
  if (n_ad) source.n_ad = n_ad;
  if (n_keyword_id) source.n_keyword_id = n_keyword_id;
  if (n_keyword) source.n_keyword = n_keyword;
  if (n_campaign_type) source.n_campaign_type = n_campaign_type;
  if (n_match) source.n_match = n_match;
  if (NaPm) source.NaPm = NaPm;
  
  // 클릭 ID
  if (fbclid) source.fbclid = fbclid;
  if (ttclid) source.ttclid = ttclid;
  if (gclid) source.gclid = gclid;
  
  // Referrer (유입 소스가 명확하지 않을 때만 저장)
  if (referrer && !utm_source && !n_media) {
    source.referrer = referrer;
  }
  
  return source;
}

/**
 * 어트리뷰션 소스가 직접 유입(direct)인지 확인합니다.
 */
export function isDirect(source: AttributionSource | null | undefined): boolean {
  if (!source) return true;
  
  // 광고 파라미터나 referrer가 있으면 direct가 아님
  if (source.n_keyword_id || source.n_ad || source.fbclid || source.ttclid || source.gclid) {
    return false;
  }
  
  if (source.source || source.medium || source.referrer) {
    return false;
  }
  
  return true;
}

/**
 * 쿠키 문자열을 파싱합니다.
 */
export function parseAttributionCookie(cookieValue: string | undefined): {
  first?: AttributionSource | null;
  last?: AttributionSource | null;
} {
  if (!cookieValue) {
    return {};
  }
  
  try {
    const decoded = decodeURIComponent(cookieValue);
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

/**
 * 어트리뷰션 데이터를 쿠키 문자열로 직렬화합니다.
 */
export function serializeAttributionCookie(data: {
  first?: AttributionSource | null;
  last?: AttributionSource | null;
}): string {
  return encodeURIComponent(JSON.stringify(data));
}
