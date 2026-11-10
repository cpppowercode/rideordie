# 라이드올다이 어트리뷰션 추적 시스템 — 최종 보고서

**작성일**: 2026년 11월 6일  
**PR**: [#16](https://github.com/cpppowercode/rideordie/pull/16)  
**브랜치**: `cursor/attribution-tracking-8216`  
**상태**: ✅ 구현 완료, 배포 전 대기 (환경변수 및 DB 마이그레이션 필요)

---

## 📋 요약

라이드올다이 고객 사이트에 마케팅 유입 추적(어트리뷰션) 시스템을 완전히 구현했습니다. 이제 네이버 키워드 광고, 인스타그램 광고, 틱톡 광고 등 어디서 들어와 예약·결제까지 이어졌는지 **키워드 단위로 정확하게** 추적할 수 있습니다.

### 핵심 성과
✅ **모든 구현 완료** (17개 파일 생성/수정)  
✅ **모든 테스트 통과** (기존 + 신규 테스트)  
✅ **개인정보 보호** (개인정보는 추적 데이터에 포함 안 됨)  
✅ **조건부 활성화** (환경변수 없으면 스크립트 로드 안 됨)

---

## 🎯 구현된 기능

### 1. 유입 데이터 자동 캡처

모든 페이지 방문 시 다음 정보를 자동으로 추출하여 쿠키에 저장합니다 (30일 유지):

#### UTM 파라미터
- `utm_source` (예: naver, instagram, facebook)
- `utm_medium` (예: searchad, social, cpc)
- `utm_campaign` (캠페인명)
- `utm_content` (광고 소재)
- `utm_term` (키워드)

#### 네이버 검색광고 자동추적 파라미터
- `n_keyword_id` ⭐ **핵심** (키워드 ID, 성과 분석의 키)
- `n_keyword` (키워드명, 예: "스키강습")
- `n_query` (실제 검색어, UTF-8 디코딩)
- `n_ad` (광고 ID)
- `n_ad_group` (광고그룹 ID)
- `n_media` (미디어 ID)
- `n_rank` (광고 순위)
- `n_campaign_type` (캠페인 타입: 1웹사이트, 2쇼핑, 4브랜드 등)
- `n_match` (매칭 타입: 1일치, 2확장, 3연관, 4유사, 5스마트블록)
- `NaPm` (프리미엄로그분석 쿠키 식별자)

#### 광고 플랫폼 클릭 ID
- `fbclid` (Facebook/Instagram)
- `ttclid` (TikTok)
- `gclid` (Google Ads)

#### 기타
- `referrer` (유입 경로 URL)
- `landing_path` (랜딩 페이지 경로)
- `ts` (타임스탬프)

### 2. First-touch + Last-touch 어트리뷰션

- **First-touch**: 최초 유입 정보 기록 (브랜드 인지 분석용)
- **Last-touch (non-direct)**: 마지막 비-다이렉트 유입 기록 (전환 귀속용)
- **창구**: 30일 (클릭 후 30일 이내 예약·결제 시 연결)
- **모델**: `last_non_direct` (기본값, 향후 변경 가능)

**예시**:
```
Day 1: 네이버 검색광고 "스키강습" 클릭 → First-touch 저장
Day 3: 직접 방문 (Direct) → Last-touch 업데이트 안 됨 (direct는 무시)
Day 5: 인스타 광고 클릭 → Last-touch 업데이트
Day 7: 예약·결제 → Last-touch (인스타 광고) 기준으로 전환 귀속
```

### 3. 예약·결제 시 DB 저장

KCP 결제 승인 후 예약 레코드(`payments` 테이블)에 다음 필드 저장:

| 필드 | 타입 | 설명 |
|------|------|------|
| `attr_first` | JSONB | 최초 유입 정보 (JSON) |
| `attr_last` | JSONB | 최종 유입 정보 (JSON) |
| `attr_model` | VARCHAR(50) | 어트리뷰션 모델 (기본: `last_non_direct`) |

**중요**: 결제 승인이 완료된 예약에만 저장되며, 실패·취소 건은 제외됩니다.

### 4. 추적 스크립트 (조건부 활성화)

#### 네이버 프리미엄로그분석 (WCS)
- **환경변수**: `NEXT_PUBLIC_NAVER_WCS_ID`
- **스크립트**: `wcslog.js`
- **전환 이벤트**: `wcs.trans({ type: 'purchase', value, id })`
- **효과**: 네이버 광고 보고서에 키워드별 전환수·매출 표시

#### 메타 픽셀
- **환경변수**: `NEXT_PUBLIC_META_PIXEL_ID`
- **스크립트**: `fbevents.js`
- **전환 이벤트**: `fbq('track', 'Purchase', { value, currency, ... })`
- **효과**: 메타 광고 매니저에서 전환 추적

#### 틱톡 픽셀
- **환경변수**: `NEXT_PUBLIC_TIKTOK_PIXEL_ID`
- **스크립트**: `events.js`
- **전환 이벤트**: `ttq.track('CompletePayment', { value, currency, ... })`
- **효과**: 틱톡 Ads Manager에서 전환 추적

**중요**: 환경변수가 설정되지 않으면 해당 스크립트는 로드되지 않습니다. 즉, 키가 없으면 아무것도 실행되지 않습니다.

### 5. 전환 이벤트 전송 (결제 승인 후에만)

결제 완료 페이지(`/book/success`)에서:
1. 결제 승인이 확인된 예약만 전환 이벤트 전송
2. 네이버 WCS, 메타 픽셀, 틱톡 픽셀 동시 전송
3. sessionStorage로 중복 전송 방지

**실패·취소 건은 전환 아님** (기존 규칙 유지).

---

## 📊 실제 저장 데이터 예시

### 시나리오: 네이버 검색광고 → 예약·결제

1. **광고 URL 클릭**
```
https://rideordie.kr/?n_keyword_id=1234567&n_keyword=%EC%8A%A4%ED%82%A4%EA%B0%95%EC%8A%B5&n_ad=890&n_ad_group=456&n_rank=1&n_query=%EC%8A%A4%ED%82%A4%EA%B0%95%EC%8A%B5&utm_source=naver&utm_medium=searchad
```

2. **쿠키 저장** (`rideordie_attr`, 30일)
```json
{
  "first": {
    "n_keyword_id": "1234567",
    "n_keyword": "스키강습",
    "n_query": "스키강습",
    "n_ad": "890",
    "n_ad_group": "456",
    "n_rank": "1",
    "source": "naver",
    "medium": "searchad",
    "landing_path": "/?n_keyword_id=1234567&...",
    "ts": 1699300000000
  },
  "last": {
    "n_keyword_id": "1234567",
    "n_keyword": "스키강습",
    "source": "naver",
    "medium": "searchad",
    "ts": 1699300000000
  }
}
```

3. **DB 저장** (`payments` 테이블)

| 컬럼 | 값 |
|------|-----|
| `order_no` | `WEB_1699301234567_ABC123` |
| `customer_name` | `홍길동` |
| `amount` | `150000` |
| `payment_status` | `paid` |
| `attr_first` | `{"n_keyword_id":"1234567","n_keyword":"스키강습",...}` |
| `attr_last` | `{"n_keyword_id":"1234567","source":"naver",...}` |
| `attr_model` | `last_non_direct` |

---

## 🔍 키워드 효율 분석 쿼리 예시

### 네이버 키워드별 예약 수 및 매출

```sql
SELECT 
  attr_last->>'n_keyword' as keyword,
  attr_last->>'n_keyword_id' as keyword_id,
  COUNT(*) as reservation_count,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_order_value,
  SUM(amount) / COUNT(*) as estimated_cpa
FROM payments
WHERE attr_last->>'n_keyword_id' IS NOT NULL
  AND payment_status = 'paid'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY keyword, keyword_id
ORDER BY reservation_count DESC;
```

**결과 예시**:

| keyword | keyword_id | reservation_count | total_revenue | avg_order_value | estimated_cpa |
|---------|------------|-------------------|---------------|-----------------|---------------|
| 스키강습 | 1234567 | 15 | 2,250,000 | 150,000 | 150,000 |
| 보드강습 | 2345678 | 8 | 1,200,000 | 150,000 | 150,000 |

### 채널별 전환율

```sql
SELECT 
  COALESCE(attr_last->>'source', 'direct') as source,
  COUNT(*) as conversions,
  SUM(amount) as revenue,
  SUM(amount) / COUNT(*) as avg_cpa
FROM payments
WHERE payment_status = 'paid'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY source
ORDER BY revenue DESC;
```

### 메타 광고 전환 추적

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as conversions,
  SUM(amount) as revenue
FROM payments
WHERE attr_last->>'fbclid' IS NOT NULL
  AND payment_status = 'paid'
GROUP BY date
ORDER BY date DESC;
```

---

## 🗂️ 파일 변경 목록

### 신규 파일 (11개)

1. `src/types/attribution.ts` - 어트리뷰션 타입 정의
2. `src/lib/attribution.ts` - 어트리뷰션 유틸리티 함수
3. `src/lib/attribution.test.ts` - 어트리뷰션 테스트
4. `src/middleware.ts` - 미들웨어 (쿠키 저장)
5. `src/components/tracking/NaverWCS.tsx` - 네이버 WCS 컴포넌트
6. `src/components/tracking/MetaPixel.tsx` - 메타 픽셀 컴포넌트
7. `src/components/tracking/TikTokPixel.tsx` - 틱톡 픽셀 컴포넌트
8. `src/components/tracking/ConversionTracker.tsx` - 전환 추적 컴포넌트
9. `migrations/001_add_attribution_fields.sql` - DB 마이그레이션
10. `docs/privacy-policy-attribution-addendum.md` - 개인정보처리방침 초안
11. `docs/ATTRIBUTION_IMPLEMENTATION_REPORT.md` - 구현 보고서 (영문)

### 수정 파일 (6개)

1. `src/app/layout.tsx` - 추적 스크립트 통합
2. `src/app/api/bookings/route.ts` - 어트리뷰션 데이터 읽기
3. `src/app/book/success/page.tsx` - 전환 이벤트 전송
4. `src/lib/booking-intent.ts` - BookingIntent에 attribution 추가
5. `src/lib/booking-finalize.ts` - 결제 완료 시 attribution 저장
6. `package.json` - 테스트 스크립트 업데이트

---

## ✅ 테스트 결과

```bash
npm test
```

**모든 테스트 통과** ✅

- `booking tests` - 예약 로직
- `resort landing tests` - 리조트 랜딩 페이지
- `yongpyong landing tests` - 용평 특수 케이스
- `badge-fee tests` - 패찰비 계산
- `pricing tests` - 가격 계산
- `yongpyong ratio tests` - 용평 구성 제한
- `season tests` - 시즌 설정
- `chatbot tests` - 챗봇 로직
- **`attribution tests`** - 어트리뷰션 (신규) ⭐

### 어트리뷰션 테스트 커버리지

- ✅ UTM 파라미터 추출
- ✅ 네이버 검색광고 파라미터 추출 (URL 디코딩 포함)
- ✅ 클릭 ID (fbclid, ttclid, gclid) 추출
- ✅ Referrer 추출
- ✅ Direct 유입 판별
- ✅ 쿠키 직렬화/파싱
- ✅ 빈 데이터 처리
- ✅ 잘못된 형식 처리

---

## 🔐 개인정보 보호

### 원칙

**개인정보는 어트리뷰션 데이터에 포함되지 않습니다.**

- ✅ 이름, 연락처 등은 어트리뷰션 필드에 저장 안 됨
- ✅ 광고 클릭 ID는 개인 식별 불가한 플랫폼 내부 식별자
- ✅ 네이버 검색어(`n_query`)는 사용자 입력 키워드이나, 개인정보가 아닌 것으로 간주
- ✅ 쿠키는 30일 후 자동 삭제
- ✅ DB 저장 데이터는 3년 후 파기 (내부 방침)

### 개인정보처리방침 업데이트 필요

`docs/privacy-policy-attribution-addendum.md`에 다음 내용을 추가해야 합니다:

1. **자동 수집 정보** (마케팅 유입 정보)
2. **수집 및 이용 목적** (마케팅 성과 분석)
3. **보유 기간** (3년)
4. **제3자 제공** (네이버/메타/틱톡 전환 추적)
5. **쿠키 사용 안내** (30일)

**⚠️ 법률 검토 필수**: 특히 광고 클릭 ID가 개인정보에 해당하는지 확인 필요.

---

## 🚀 배포 전 필요 사항

### 1. 환경변수 설정 (Vercel)

현재 환경변수가 **없으므로** 다음을 추가해야 합니다:

```env
# 네이버 프리미엄로그분석 (광고 켜기 전 필수)
NEXT_PUBLIC_NAVER_WCS_ID=your-wcs-id

# 메타 픽셀 (선택, 메타 광고 사용 시)
NEXT_PUBLIC_META_PIXEL_ID=your-pixel-id

# 틱톡 픽셀 (선택, 틱톡 광고 사용 시)
NEXT_PUBLIC_TIKTOK_PIXEL_ID=your-pixel-id
```

**참고**: 환경변수가 없으면 해당 스크립트는 로드되지 않습니다.

### 2. 네이버 프리미엄로그분석 신청

- [ ] 네이버 광고주센터 → 도구 → 프리미엄 로그 분석 → 사이트 신규 신청
- [ ] 네이버공통키(WCS ID) 발급
- [ ] 환경변수에 추가
- [ ] Chrome 확장 "네이버 전환 스크립트 어시스턴트"로 검수

**가이드**: https://ads.naver.com/help/faq/273

### 3. 네이버 검색광고 자동추적 URL 설정

- [ ] 광고 캠페인 수정 → 고급옵션 → 추적기능
- [ ] **자동 추적 URL 파라미터** 켜기
- [ ] 연결 URL: `https://rideordie.kr/` (전체 URL 권장)
- [ ] 테스트 필수 (단축URL, ? 파라미터 깨짐 확인)

**가이드**: https://ads.naver.com/help/faq/1217

**⚠️ 매우 중요**: 이 설정 없이 광고를 켜면 지출만 나가고 "어느 키워드가 전환까지 갔는지" 알 수 없습니다.

### 4. DB 마이그레이션 실행

- [ ] Admin 저장소 Supabase에서 `migrations/001_add_attribution_fields.sql` 실행
- [ ] 테스트 환경에서 먼저 검증
- [ ] 운영 DB 백업 후 실행

**⚠️ 주의**: 운영 DB에 직접 적용하지 말 것. 관리자 승인 후 실행.

### 5. 메타/틱톡 픽셀 설정 (선택)

#### 메타 (Facebook/Instagram 광고 사용 시)

- [ ] Events Manager에서 픽셀 생성
- [ ] Pixel ID 복사
- [ ] 환경변수에 추가

#### 틱톡 (틱톡 광고 사용 시)

- [ ] Ads Manager → Tools → Events → Web
- [ ] Pixel ID 복사
- [ ] 환경변수에 추가

**참고**: plan.md에 따르면 11월에는 틱톡 예산이 없으므로 일단 스킵 가능.

### 6. 개인정보처리방침 업데이트

- [ ] `docs/privacy-policy-attribution-addendum.md` 법률 검토
- [ ] 개인정보처리방침 페이지에 반영
- [ ] 고객에게 공지

---

## 🧪 검증 방법

### 로컬 테스트

```bash
# 1. 의존성 설치
npm install

# 2. 테스트 실행
npm test

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 테스트
http://localhost:3000/?utm_source=test&utm_medium=cpc&n_keyword_id=123

# 5. 쿠키 확인
개발자 도구 > Application > Cookies > rideordie_attr
```

### 스테이징 환경 테스트 (배포 후)

1. **네이버 검색광고 URL로 접속** (실제 자동추적 파라미터 포함)
   ```
   https://rideordie.kr/?n_keyword_id=1234567&n_keyword=스키강습&...
   ```

2. **쿠키 확인** (개발자 도구)
   - `rideordie_attr` 쿠키 존재 여부
   - `first`, `last` 객체에 `n_keyword_id` 등이 있는지

3. **예약 진행 → 결제 완료**

4. **Admin 대시보드에서 예약 확인**
   - `attr_last` 필드에 `n_keyword_id` 등이 JSON으로 저장되어 있는지

5. **네이버 전환 스크립트 검수**
   - Chrome 확장 "네이버 전환 스크립트 어시스턴트" 설치
   - NaPm 쿠키 확인
   - 결제 완료 페이지에서 `wcs.trans` 전환 이벤트 전송 확인

---

## 📈 Admin 저장소 필요 작업

### 현재 상태

- PR #20 (계약 유입경로 설문, marketing_costs, ROAS 화면) **미배포**

### 필요 작업

1. **DB 마이그레이션 적용**
   - `migrations/001_add_attribution_fields.sql` 실행 (승인 필요)
   
2. **API 확인** (선택사항)
   - Admin API가 `attr_first`, `attr_last`, `attr_model` 필드를 받을 수 있는지 확인
   - 현재는 `createAdminReservation()`에 그대로 전달하면 저장됨
   
3. **ROAS 화면 확장** (향후 작업)
   - 채널 합계 → **캠페인 → 키워드** 드릴다운
   - 네이버 API (StatReport) 연동 (plan.md 참고)
   - 설문 vs 어트리뷰션 데이터 불일치율 리포트

---

## 📚 관련 문서

1. **`docs/ATTRIBUTION_IMPLEMENTATION_REPORT.md`** - 구현 보고서 (영문, 상세)
2. **`docs/privacy-policy-attribution-addendum.md`** - 개인정보처리방침 초안
3. **`migrations/001_add_attribution_fields.sql`** - DB 마이그레이션
4. **`plan_872a.md`** - 설계안 (근거 링크 포함, 사장님 요청사항)

---

## 🎉 완료된 작업

- ✅ 어트리뷰션 데이터 캡처용 유틸 및 타입 작성
- ✅ First-touch/Last-touch 쿠키 저장 미들웨어 구현
- ✅ 예약/결제 API에 어트리뷰션 데이터 전달 구조 추가
- ✅ 네이버 WCS 스크립트 컴포넌트 구현
- ✅ 메타 픽셀 스크립트 컴포넌트 구현
- ✅ 틱톡 픽셀 스크립트 컴포넌트 구현
- ✅ layout.tsx에 추적 스크립트 통합
- ✅ 결제 승인 완료 시 전환 이벤트 전송
- ✅ DB 마이그레이션 SQL 파일 작성
- ✅ 테스트 추가 및 기존 테스트 통과 확인
- ✅ 개인정보처리방침 문구 초안 작성
- ✅ 최종 보고서 작성
- ✅ PR 생성 ([#16](https://github.com/cpppowercode/rideordie/pull/16))

---

## ⚠️ 중요 주의사항

### 운영 배포 금지

**이 PR은 바로 운영 배포하면 안 됩니다.**

배포 전 필수 작업:
1. 네이버 프리미엄로그분석 신청 및 검수
2. 네이버 자동 추적 URL 파라미터 설정
3. 환경변수 설정 (최소 `NEXT_PUBLIC_NAVER_WCS_ID`)
4. DB 마이그레이션 실행
5. 개인정보처리방침 업데이트

### 광고 ON 전 필수

**네이버 검색광고를 켜기 전에** 반드시:
- 프리미엄로그분석 신청 완료
- 자동 추적 URL 파라미터 설정 및 테스트
- 환경변수 설정 및 배포

**이유**: 위 작업 없이 광고를 켜면 지출만 나가고 "어느 키워드가 전환까지 갔는지" 알 수 없습니다. 사장님이 "신중하게" 하라고 하신 요구사항에 어긋납니다.

---

## 💬 문의

구현 관련 질문이나 이슈가 있으면 PR [#16](https://github.com/cpppowercode/rideordie/pull/16)에 코멘트로 남겨 주세요.

---

**작성자**: Cursor Agent  
**검토 필요**: 법률팀 (개인정보처리방침), 마케팅팀 (네이버 설정), Admin 개발팀 (DB 마이그레이션)  
**PR**: https://github.com/cpppowercode/rideordie/pull/16
