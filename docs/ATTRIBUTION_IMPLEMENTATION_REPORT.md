# 라이드올다이 어트리뷰션 추적 구현 보고서

**작성일**: 2026년 11월 6일  
**브랜치**: `cursor/attribution-tracking-8216`  
**PR 상태**: 배포 전 (운영 배포 금지)

---

## 1. 구현 개요

라이드올다이 고객 사이트(rideordie.kr)에 마케팅 유입 추적(어트리뷰션) 시스템을 구현했습니다. 네이버 검색광고, 메타(인스타), 틱톡 등 어디서 들어와 예약·결제까지 이어졌는지 키워드 단위로 추적할 수 있습니다.

### 주요 목표
- 첫 방문 랜딩에서 UTM, 네이버 검색광고 자동추적 파라미터, fbclid/ttclid/gclid, referrer 캐치
- First-touch + Last-touch 방식으로 30일간 보관
- 예약 생성 및 결제(KCP) 시 어트리뷰션 정보를 예약 레코드에 저장
- 네이버 WCS, 메타 픽셀, 틱톡 픽셀 환경변수 조건부 활성화
- 결제 승인 완료 후에만 전환 이벤트 전송
- 개인정보는 추적 데이터에 포함하지 않음

---

## 2. 구현 내용

### 2.1 어트리뷰션 데이터 구조

#### 타입 정의 (`src/types/attribution.ts`)

```typescript
type AttributionSource = {
  // UTM 파라미터
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  
  // 네이버 검색광고 자동추적 파라미터
  n_media?: string;
  n_query?: string;          // 검색어 (UTF-8)
  n_rank?: string;           // 광고 순위
  n_ad_group?: string;       // 광고그룹 ID
  n_ad?: string;             // 광고 ID
  n_keyword_id?: string;     // 키워드 ID (핵심)
  n_keyword?: string;        // 키워드
  n_campaign_type?: string;  // 캠페인 타입
  n_match?: string;          // 매칭 타입 (1:일치, 2:확장, 3:연관, 4:유사, 5:스마트블록)
  
  // 광고 플랫폼 클릭 ID
  fbclid?: string;           // Facebook/Instagram
  ttclid?: string;           // TikTok
  gclid?: string;            // Google Ads
  
  // NaPm (네이버 프리미엄로그분석)
  NaPm?: string;
  
  // 기타
  referrer?: string;
  landing_path?: string;
  ts?: number;               // 타임스탬프
};
```

#### 쿠키 저장 형식

- **쿠키명**: `rideordie_attr`
- **유효기간**: 30일
- **저장 내용**: `{ first: AttributionSource, last: AttributionSource }`
- **httpOnly**: false (클라이언트에서도 읽기 가능)

---

### 2.2 미들웨어 구현 (`src/middleware.ts`)

모든 페이지 방문 시 실행되어 어트리뷰션 데이터를 추출하고 쿠키에 저장합니다.

**동작 방식**:
1. URL 쿼리 파라미터와 referrer에서 어트리뷰션 데이터 추출
2. 기존 쿠키 읽기
3. **First-touch**: 쿠키가 없고 새 유입이면 설정 (최초 유입 기록)
4. **Last-touch**: 새 유입이 direct가 아니면 업데이트 (마지막 비-다이렉트 유입)
5. 쿠키 저장 (30일 유효)

**제외 경로**: API routes, static files, images 등

---

### 2.3 예약 API 통합 (`src/app/api/bookings/route.ts`)

예약 확인 시 어트리뷰션 데이터를 읽어 BookingIntent에 포함합니다.

```typescript
// 어트리뷰션 데이터 추출
const attrCookie = request.cookies.get(ATTRIBUTION_COOKIE_NAME)?.value;
const attr = parseAttributionCookie(attrCookie);
const attribution = {
  attr_first: attr.first || null,
  attr_last: attr.last || null,
  attr_model: 'last_non_direct',
};

// Intent에 포함
const intent = createBookingIntent(orderNo, amount, checked.input, attribution);
```

---

### 2.4 결제 완료 시 DB 저장 (`src/lib/booking-finalize.ts`)

KCP 결제 승인 후 예약을 DB에 저장할 때 어트리뷰션 데이터를 함께 저장합니다.

```typescript
const payload = {
  ...base,
  amount,
  payment_method: payMethodLabel,
  payment_status: "paid",
  reservation_status: "pending",
  notes,
  // 어트리뷰션 데이터 추가
  ...(intent.attribution && {
    attr_first: intent.attribution.attr_first ? JSON.stringify(intent.attribution.attr_first) : null,
    attr_last: intent.attribution.attr_last ? JSON.stringify(intent.attribution.attr_last) : null,
    attr_model: intent.attribution.attr_model || 'last_non_direct',
  }),
};
```

---

### 2.5 추적 스크립트 (환경변수 조건부)

#### 네이버 프리미엄로그분석 (`src/components/tracking/NaverWCS.tsx`)

- **환경변수**: `NEXT_PUBLIC_NAVER_WCS_ID` (예: 네이버 공통키)
- **스크립트**: `wcslog.js`, `wcs_do()`
- **전환 이벤트**: `wcs.trans({ type: 'purchase', value, id })`

#### 메타 픽셀 (`src/components/tracking/MetaPixel.tsx`)

- **환경변수**: `NEXT_PUBLIC_META_PIXEL_ID`
- **스크립트**: `fbevents.js`
- **전환 이벤트**: `fbq('track', 'Purchase', { value, currency, content_name, content_ids })`

#### 틱톡 픽셀 (`src/components/tracking/TikTokPixel.tsx`)

- **환경변수**: `NEXT_PUBLIC_TIKTOK_PIXEL_ID`
- **스크립트**: `events.js`
- **전환 이벤트**: `ttq.track('CompletePayment', { value, currency, content_name, content_id })`

---

### 2.6 전환 이벤트 전송 (`src/components/tracking/ConversionTracker.tsx`)

결제 완료 페이지(`/book/success`)에서 전환 이벤트를 전송합니다.

**중요 규칙**:
- **결제 승인 완료 후에만** 전환 이벤트 전송
- 실패·취소 결제는 전환 아님 (기존 규칙 유지)
- sessionStorage로 중복 전송 방지 (`conversion_sent_{orderNo}`)

---

### 2.7 DB 마이그레이션 (`migrations/001_add_attribution_fields.sql`)

Admin 저장소의 Supabase `payments` 테이블에 다음 컬럼 추가:

```sql
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS attr_first JSONB;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS attr_last JSONB;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS attr_model VARCHAR(50) DEFAULT 'last_non_direct';
```

**인덱스**:
- `idx_payments_attr_last_n_keyword_id`: 네이버 키워드 ID 조회용
- `idx_payments_attr_last_source`: 채널별 조회용
- `idx_payments_attr_last_fbclid`: 메타 광고 추적용

**주의**: 운영 DB에 직접 적용 금지. 관리자 승인 후 실행.

---

## 3. 테스트 결과

### 3.1 단위 테스트 (`src/lib/attribution.test.ts`)

모든 테스트 통과 ✅

- UTM 파라미터 추출
- 네이버 검색광고 파라미터 추출 (URL 디코딩 포함)
- 클릭 ID (fbclid, ttclid, gclid) 추출
- Referrer 추출
- Direct 유입 판별
- 쿠키 직렬화/파싱

### 3.2 기존 테스트 통과

```bash
npm test
```

결과: 모든 테스트 통과 ✅
- booking tests
- resort landing tests
- badge-fee tests
- pricing tests
- season tests
- chatbot tests
- **attribution tests** (신규)

---

## 4. 실제 저장 데이터 예시

### 4.1 네이버 검색광고 URL 예시

```
https://rideordie.kr/?n_media=27758&n_query=%EC%8A%A4%ED%82%A4%EA%B0%95%EC%8A%B5&n_keyword_id=1234567&n_keyword=%EC%8A%A4%ED%82%A4%EA%B0%95%EC%8A%B5&n_ad=890&n_ad_group=456&n_rank=1&n_campaign_type=1&n_match=1&NaPm=ct%3Dm123
```

### 4.2 쿠키 저장 예시

```json
{
  "first": {
    "n_media": "27758",
    "n_query": "스키강습",
    "n_keyword_id": "1234567",
    "n_keyword": "스키강습",
    "n_ad": "890",
    "n_ad_group": "456",
    "n_rank": "1",
    "n_campaign_type": "1",
    "n_match": "1",
    "NaPm": "ct=m123",
    "landing_path": "/?n_media=27758&...",
    "ts": 1699300000000
  },
  "last": {
    "source": "naver",
    "medium": "searchad",
    "n_keyword_id": "1234567",
    "n_keyword": "스키강습",
    "landing_path": "/book?utm_source=naver&...",
    "ts": 1699301200000
  }
}
```

### 4.3 DB 저장 예시 (payments 테이블)

| 컬럼 | 값 |
|------|-----|
| `order_no` | `WEB_1699301234567_ABC123` |
| `amount` | `150000` |
| `payment_status` | `paid` |
| `attr_first` | `{"n_keyword_id":"1234567","n_keyword":"스키강습","n_media":"27758",...}` |
| `attr_last` | `{"source":"naver","medium":"searchad","n_keyword_id":"1234567",...}` |
| `attr_model` | `last_non_direct` |

---

## 5. 키워드 효율 분석 쿼리 예시

### 5.1 네이버 키워드별 예약 수 및 매출

```sql
SELECT 
  attr_last->>'n_keyword' as keyword,
  attr_last->>'n_keyword_id' as keyword_id,
  COUNT(*) as reservation_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  SUM(amount) / COUNT(*) as cpa_estimate
FROM payments
WHERE attr_last->>'n_keyword_id' IS NOT NULL
  AND payment_status = 'paid'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY keyword, keyword_id
ORDER BY reservation_count DESC;
```

### 5.2 채널별 전환율

```sql
SELECT 
  COALESCE(attr_last->>'source', 'direct') as source,
  COUNT(*) as conversions,
  SUM(amount) as revenue
FROM payments
WHERE payment_status = 'paid'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY source
ORDER BY revenue DESC;
```

---

## 6. Admin 저장소 필요 변경사항

### 6.1 PR #20 관련

현재 admin 저장소 PR #20 (계약 유입경로 설문, marketing_costs, ROAS 화면)이 미배포 상태입니다.

### 6.2 필요한 작업

1. **DB 마이그레이션 적용**
   - `migrations/001_add_attribution_fields.sql` 실행 (승인 필요)
   
2. **API 수정** (선택사항)
   - Admin API가 `attr_first`, `attr_last`, `attr_model` 필드를 받을 수 있도록 확인
   - 현재는 `createAdminReservation()`에 그대로 전달하면 저장됨
   
3. **ROAS 화면 확장** (향후 작업)
   - 채널 합계 → **캠페인 → 키워드** 드릴다운
   - 설문 vs 어트리뷰션 데이터 불일치율 리포트
   - 네이버 API (StatReport) 연동 (plan.md 참고)

---

## 7. 배포 전 필요 사항

### 7.1 환경변수 설정

다음 환경변수를 Vercel 프로젝트에 추가해야 합니다 (현재 없음):

```env
# 네이버 프리미엄로그분석 (광고 켜기 전 필수)
NEXT_PUBLIC_NAVER_WCS_ID=your-wcs-id

# 메타 픽셀 (선택, 메타 광고 사용 시)
NEXT_PUBLIC_META_PIXEL_ID=your-pixel-id

# 틱톡 픽셀 (선택, 틱톡 광고 사용 시)
NEXT_PUBLIC_TIKTOK_PIXEL_ID=your-pixel-id
```

**참고**: 환경변수가 없으면 해당 스크립트는 로드되지 않습니다 (조건부 활성화).

### 7.2 네이버 프리미엄로그분석 신청

1. 네이버 광고주센터 → 도구 → 프리미엄 로그 분석 → 사이트 신규 신청
2. 네이버공통키(WCS ID) 발급
3. 환경변수에 추가
4. Chrome 확장 프로그램 "네이버 전환 스크립트 어시스턴트"로 검수

**가이드**: https://ads.naver.com/help/faq/273

### 7.3 네이버 검색광고 자동추적 URL 설정

1. 광고 캠페인 수정 → 고급옵션 → 추적기능
2. **자동 추적 URL 파라미터** 켜기
3. 연결 URL: `https://rideordie.kr/` (전체 URL 권장)
4. 테스트 필수 (단축URL, ? 파라미터 깨짐 확인)

**가이드**: https://ads.naver.com/help/faq/1217

### 7.4 메타/틱톡 픽셀 설정 (선택)

- 메타: Events Manager에서 픽셀 생성 → Pixel ID 복사
- 틱톡: Ads Manager → Tools → Events → Web → Pixel ID 복사

---

## 8. 개인정보처리방침

`docs/privacy-policy-attribution-addendum.md`에 추가해야 할 문구 초안을 작성했습니다.

**주요 내용**:
- 자동 수집 정보 (마케팅 유입 정보)
- 수집 및 이용 목적 (마케팅 성과 분석)
- 보유 기간 (3년)
- 제3자 제공 (네이버/메타/틱톡 전환 추적)
- 쿠키 사용 안내 (30일)

**주의**: 법률 검토 필수. 특히 광고 클릭 ID가 개인정보에 해당하는지 확인 필요.

---

## 9. 제약 및 주의사항

### 9.1 개인정보 보호

- 이름, 연락처 등 개인정보는 어트리뷰션 데이터에 포함되지 않음
- 광고 클릭 ID는 개인 식별 불가한 광고 플랫폼 내부 식별자
- 네이버 검색어(`n_query`)는 사용자가 입력한 검색어이나, 개인정보가 아닌 키워드로 간주됨

### 9.2 운영 배포 금지

- 이 PR은 **운영 배포 금지**
- DB 마이그레이션은 관리자 승인 후 별도 실행
- 네이버 WCS, 메타/틱톡 픽셀은 환경변수가 없으면 작동하지 않음

### 9.3 광고 ON 전 필수 작업

1. 네이버 프리미엄로그분석 신청 및 검수
2. 자동 추적 URL 파라미터 설정 및 테스트
3. 메타/틱톡 픽셀 설치 (사용 시)
4. DB 마이그레이션 실행 및 확인

**이유**: 위 작업 없이 광고를 켜면 지출만 나가고 "어느 키워드가 전환까지 갔는지" 알 수 없음.

### 9.4 네이버 n_match 값

- 1: 일치
- 2: 키워드확장
- 3: 연관
- 4: 유사
- 5: 스마트블록

**출처**: https://ads.naver.com/notice/13446

---

## 10. 다음 단계 (향후 작업)

### 10.1 API 자동 수집 (plan.md 단계 4)

- 네이버 StatReport API 일배치 (키워드별 비용·클릭·전환)
- 메타 Insights API 일배치 (캠페인별 지출·전환)
- 틱톡 Marketing API (사용 시)

### 10.2 ROAS 리포트 확장

- 채널 합계 → 캠페인 → 키워드 드릴다운
- CPC, CVR, CPA, ROAS 자동 계산
- 설문(PR #20) vs 어트리뷰션 불일치율 주간 리포트

### 10.3 문의 채널 연동

- 카카오톡 채널 (visitor_id 연결)
- 숨고 요청·견적 (phone 연결)
- 사이트 ChatWidget (sessionId → phone)

---

## 11. 파일 변경 목록

### 신규 파일

- `src/types/attribution.ts` - 어트리뷰션 타입 정의
- `src/lib/attribution.ts` - 어트리뷰션 유틸리티
- `src/lib/attribution.test.ts` - 어트리뷰션 테스트
- `src/middleware.ts` - 미들웨어 (쿠키 저장)
- `src/components/tracking/NaverWCS.tsx` - 네이버 WCS 컴포넌트
- `src/components/tracking/MetaPixel.tsx` - 메타 픽셀 컴포넌트
- `src/components/tracking/TikTokPixel.tsx` - 틱톡 픽셀 컴포넌트
- `src/components/tracking/ConversionTracker.tsx` - 전환 추적 컴포넌트
- `migrations/001_add_attribution_fields.sql` - DB 마이그레이션
- `docs/privacy-policy-attribution-addendum.md` - 개인정보처리방침 초안
- `docs/ATTRIBUTION_IMPLEMENTATION_REPORT.md` - 이 보고서

### 수정 파일

- `src/app/layout.tsx` - 추적 스크립트 통합
- `src/app/api/bookings/route.ts` - 어트리뷰션 데이터 읽기
- `src/app/book/success/page.tsx` - 전환 이벤트 전송
- `src/lib/booking-intent.ts` - BookingIntent에 attribution 추가
- `src/lib/booking-finalize.ts` - 결제 완료 시 attribution 저장
- `package.json` - 테스트 스크립트에 attribution.test.ts 추가

---

## 12. 검증 방법

### 12.1 로컬 테스트

```bash
# 1. 의존성 설치
npm install

# 2. 테스트 실행
npm test

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 테스트
# http://localhost:3000/?utm_source=test&utm_medium=cpc&n_keyword_id=123
# → 쿠키 확인 (개발자 도구 > Application > Cookies > rideordie_attr)
```

### 12.2 스테이징 환경 테스트

1. 네이버 검색광고 URL로 접속 (실제 파라미터 포함)
2. 예약 진행 → 결제 완료
3. Admin 대시보드에서 예약 확인
4. `attr_last` 필드에 n_keyword_id 등이 저장되어 있는지 확인

### 12.3 네이버 전환 스크립트 검수

Chrome 확장 프로그램 "네이버 전환 스크립트 어시스턴트" 설치:
- https://naver.github.io/conversion-tracking/pages/06_script_assistant_guide/

**확인 항목**:
- NaPm 쿠키 확인
- wcs.trans 전환 이벤트 전송 확인 (결제 완료 페이지)

---

## 13. 문의 및 지원

구현 관련 질문이나 이슈가 있으면 이 PR의 코멘트로 남겨 주세요.

---

**구현 완료**: 2026-11-06  
**테스트**: 통과 ✅  
**배포 준비**: 환경변수 설정 및 DB 마이그레이션 필요
