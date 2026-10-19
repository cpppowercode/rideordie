# RideOrDie - 프리미엄 스키 강습 예약 플랫폼

하이원 리조트 기반의 프리미엄 스키·스노보드 강습 예약 서비스입니다.

## 주요 기능

- 🎿 스키·스노보드 강습 상품 조회 및 예약
- 💳 토스페이먼츠 연동 실시간 결제
- 💬 채널톡 연동 실시간 상담
- 📱 반응형 디자인 (모바일/데스크톱)
- 🔒 비로그인 주문 지원
- 📊 Supabase 기반 주문 관리

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Payment**: 토스페이먼츠
- **Deployment**: Vercel

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 결제 시스템 설정

결제 연동을 위해서는 추가 설정이 필요합니다. 자세한 내용은 [PAYMENT_SETUP.md](PAYMENT_SETUP.md)를 참고하세요.

### 3. 채널톡 설정 (선택사항)

고객 상담을 위한 채널톡 연동 방법은 [CHANNEL_TALK_SETUP.md](CHANNEL_TALK_SETUP.md)를 참고하세요.

### 3. 개발 서버 실행

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 프로젝트 구조

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── orders/       # 주문 생성
│   │   └── payments/     # 결제 승인
│   ├── checkout/         # 결제 페이지
│   ├── product/          # 상품 상세
│   └── page.tsx          # 메인 페이지
├── components/           # React 컴포넌트
├── lib/                  # 유틸리티 (Supabase 클라이언트)
└── types/                # TypeScript 타입 정의
```

## 환경 변수

프로젝트 실행을 위해 다음 환경 변수가 필요합니다:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# Channel Talk (선택사항)
NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY=
```

자세한 설정 방법:
- 결제: [PAYMENT_SETUP.md](PAYMENT_SETUP.md)
- 채널톡: [CHANNEL_TALK_SETUP.md](CHANNEL_TALK_SETUP.md)

## 빌드

```bash
npm run build
```

## 배포

Vercel을 사용한 배포:

1. GitHub에 코드 푸시
2. Vercel과 연결
3. 환경 변수 설정
4. 자동 배포 완료

## 문의

- 이메일: contact@rideordie.kr
- 전화: 010-2028-2744
- 운영: 연중 무휴

## 라이선스

© 2025 RideOrDie. All rights reserved.

---

## 참고 문서

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [토스페이먼츠 개발자 센터](https://developers.tosspayments.com)
