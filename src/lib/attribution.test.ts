import { 
  extractAttributionFromUrl, 
  isDirect, 
  parseAttributionCookie, 
  serializeAttributionCookie 
} from './attribution';

function testExtractAttributionFromUrl() {
  // UTM 파라미터 테스트
  const url1 = new URL('https://rideordie.kr/?utm_source=naver&utm_medium=searchad&utm_campaign=winter2024');
  const attr1 = extractAttributionFromUrl(url1, '');
  if (!attr1 || attr1.source !== 'naver' || attr1.medium !== 'searchad' || attr1.campaign !== 'winter2024') {
    throw new Error('UTM parameter extraction failed');
  }

  // 네이버 검색광고 자동추적 파라미터 테스트
  const url2 = new URL('https://rideordie.kr/?n_keyword_id=123&n_keyword=%EC%8A%A4%ED%82%A4%EA%B0%95%EC%8A%B5&n_ad=456');
  const attr2 = extractAttributionFromUrl(url2, '');
  if (!attr2 || attr2.n_keyword_id !== '123' || attr2.n_keyword !== '스키강습' || attr2.n_ad !== '456') {
    throw new Error('Naver auto-tracking parameter extraction failed');
  }

  // 클릭 ID 테스트
  const url3 = new URL('https://rideordie.kr/?fbclid=abc123');
  const attr3 = extractAttributionFromUrl(url3, '');
  if (!attr3 || attr3.fbclid !== 'abc123') {
    throw new Error('fbclid extraction failed');
  }

  // Referrer 테스트
  const url4 = new URL('https://rideordie.kr/');
  const attr4 = extractAttributionFromUrl(url4, 'https://search.naver.com/search');
  if (!attr4 || !attr4.referrer) {
    throw new Error('Referrer extraction failed');
  }

  // 어트리뷰션 없음 테스트
  const url5 = new URL('https://rideordie.kr/');
  const attr5 = extractAttributionFromUrl(url5, '');
  if (attr5 !== null) {
    throw new Error('Should return null when no attribution data');
  }

  console.log('✓ extractAttributionFromUrl tests passed');
}

function testIsDirect() {
  // Direct 유입 테스트
  if (!isDirect(null) || !isDirect(undefined) || !isDirect({})) {
    throw new Error('isDirect should return true for empty sources');
  }

  // Non-direct 유입 테스트
  if (isDirect({ n_keyword_id: '123' })) {
    throw new Error('isDirect should return false for naver ad');
  }

  if (isDirect({ fbclid: 'abc' })) {
    throw new Error('isDirect should return false for meta ad');
  }

  if (isDirect({ source: 'naver', medium: 'searchad' })) {
    throw new Error('isDirect should return false for utm source');
  }

  if (isDirect({ referrer: 'https://search.naver.com' })) {
    throw new Error('isDirect should return false for referrer');
  }

  console.log('✓ isDirect tests passed');
}

function testCookieSerialization() {
  const data = {
    first: {
      source: 'naver',
      medium: 'searchad',
      n_keyword_id: '123',
      ts: Date.now(),
    },
    last: {
      fbclid: 'abc123',
      landing_path: '/book',
      ts: Date.now(),
    },
  };

  const serialized = serializeAttributionCookie(data);
  const parsed = parseAttributionCookie(serialized);

  if (!parsed.first || parsed.first.source !== 'naver' || parsed.first.n_keyword_id !== '123') {
    throw new Error('Cookie serialization/parsing failed for first');
  }

  if (!parsed.last || parsed.last.fbclid !== 'abc123' || parsed.last.landing_path !== '/book') {
    throw new Error('Cookie serialization/parsing failed for last');
  }

  // 빈 문자열 테스트
  const empty = parseAttributionCookie('');
  if (Object.keys(empty).length !== 0) {
    throw new Error('Empty cookie should return empty object');
  }

  // 잘못된 형식 테스트
  const invalid = parseAttributionCookie('invalid-data');
  if (Object.keys(invalid).length !== 0) {
    throw new Error('Invalid cookie should return empty object');
  }

  console.log('✓ Cookie serialization tests passed');
}

// 모든 테스트 실행
testExtractAttributionFromUrl();
testIsDirect();
testCookieSerialization();

console.log('attribution tests passed');
