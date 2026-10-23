# RideOrDie - 프리미엄 스키 강습 예약 플랫폼

하이원 리조트 기반의 프리미엄 스키·스노보드 강습 예약 서비스입니다.

## 주요 기능

- 🎿 스키·스노보드 강습 상품 조회 및 예약
- 📅 날짜·시간대 선택 후 강습 예약 실저장 (admin.rideordie.kr 강습예약과 동기화)
- 💳 NHN KCP 표준결제
- 📱 반응형 디자인 (모바일/데스크톱)
- 🔒 비로그인 예약 지원

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: 관리자 패널과 공유하는 Supabase `payments` 테이블
- **Payment**: NHN KCP
- **Deployment**: Vercel

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

테스트:

```bash
npm test                 # 예약 로직 단위 테스트
npx playwright test      # 예약 화면 스크린샷·흐름 (서버 필요)
E2E_LIVE_ADMIN=1 BOOKING_SLOT_CAPACITY=1 npx playwright test e2e/booking.spec.ts
                         # 실제 admin.rideordie.kr 에 테스트 예약을 만들고 지웁니다
```

## 환경 변수

Vercel 프로젝트 환경 변수에 아래 값을 넣습니다. 예약 저장은 관리자 API가 기본이며, 알림은 키가 있는 채널만 발송합니다.

```env
# 관리자 패널 동기화 (기본값으로도 동작)
ADMIN_RESERVATIONS_URL=https://admin.rideordie.kr/api/reservations
ADMIN_TENANT_ID=rideordie
ADMIN_API_TOKEN=
BOOKING_SLOT_CAPACITY=6

# 사장 알림 — 이메일 (최소 권장)
RESEND_API_KEY=
RESEND_FROM_EMAIL=RideOrDie <noreply@rideordie.kr>
OWNER_NOTIFY_EMAIL=contact@rideordie.kr

# 사장 알림 — 선택
SLACK_WEBHOOK_URL=
DISCORD_WEBHOOK_URL=
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_FROM=
SOLAPI_TO=
SOLAPI_KAKAO_PFID=
SOLAPI_KAKAO_TEMPLATE_ID=

# 결제 (기존)
NEXT_PUBLIC_KCP_SITE_CD=
NEXT_PUBLIC_KCP_SITE_NAME=라이드올다이
NEXT_PUBLIC_KCP_ENV=test
KCP_CERT_INFO=
```

인스타그램 URL은 코드 상수입니다: `src/lib/site.ts`의 `INSTAGRAM_URL` (`https://www.instagram.com/ski.rideordie/`).

## 관리자 동기화

고객 사이트 예약은 **admin.rideordie.kr** 의 `POST /api/reservations` 로 저장됩니다.

- 대상 테이블: Supabase **`payments`** (관리자 화면 이름: 테이블 → **강습예약**)
- 테넌트: `rideordie` (`X-Tenant-Id`)
- 관리자 코드는 이 레포에 없습니다. Vercel 프로젝트 이름은 `admin` 입니다. GitHub 후보는 `cpppowercode/ski` 였으나 이 토큰으로는 private 레포에 접근하지 못했습니다.
- 새 마이그레이션을 이 DB에 적용할 필요는 없습니다. 이미 있는 `payments` 행 형식에 맞춰 씁니다.

저장 필드: `customer_name`, `customer_phone`, `lesson_type`, `ski_resort`, `lesson_date`, `lesson_start_hour`, `lesson_duration_hours`, `participants`, `notes`, `order_no`, `amount`, `payment_method=etc`, `payment_status=pending`, `reservation_status=pending`, `tenant_id=rideordie`.

## 사진 출처

히어로·갤러리는 사장님이 촬영한 실제 강습 사진입니다. 경로는 `src/lib/site.ts` 의 `LESSON_PHOTOS` 입니다. 스톡 사진은 쓰지 않습니다.

- 히어로: `photo_32` 민트 재킷 보더 카빙 (데스크톱·모바일 각각 크롭)
- 강습 안내: `photo_36` 강사와 아이들
- 갤러리: `photo_12`, `photo_10`, `photo_14`, `photo_37` 등

## 프로젝트 구조

```
src/
├── app/
│   ├── api/bookings/     # 예약 생성·잔여 슬롯
│   ├── book/             # 강습 예약 페이지
│   ├── checkout/         # 결제 페이지
│   └── product/          # 상품 상세
├── components/booking/
└── lib/                  # 예약 검증, 관리자 API, 알림
```

## 배포 후 확인할 일

1. Vercel에 `RESEND_API_KEY`(또는 Slack/Discord/Solapi) 설정 — 없으면 예약은 저장되지만 메일 알림은 안 갑니다.
2. `admin.rideordie.kr` → 테이블 → 강습예약에서 테스트 예약이 보이는지 확인.
3. 채널톡 플러그인 키(`NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY`)는 더 이상 쓰지 않습니다. Vercel에서 지워도 됩니다.

## 문의

- 이메일: contact@rideordie.kr
- 전화: 010-2028-2744
- 인스타그램: https://www.instagram.com/ski.rideordie/
- 운영: 연중 무휴
