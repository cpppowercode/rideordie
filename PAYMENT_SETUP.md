# NHN KCP 결제 설정

`/book` 예약 마법사 끝의 **결제하기**가 KCP 결제창을 엽니다. 승인(`res_cd=0000`)이 끝난 뒤에만 관리자 DB를 확정하고 사장 알림을 보냅니다. 실패·취소는 미확정입니다.

금액은 서버에서만 계산합니다. 클라이언트 금액을 믿지 않습니다.

- 가격표: `src/lib/pricing.ts` (`REGULAR_PRICES`, `EARLY_BIRD_PRICES`)
- 얼리버드: 개장 후 첫 2주 안에 예약하거나 2월 중순 이후 강습
- 지산·비발디 패찰비: 관리자 계산기(`/Calculator`) 요율, 실패 시 fallback

장비·리프트·숙소는 별도입니다. 결제 화면에는 전화·주소를 넣지 않습니다.

## 환경 변수

테스트(기본):

```env
NEXT_PUBLIC_KCP_SITE_CD=T0000
NEXT_PUBLIC_KCP_SITE_NAME=라이드올다이
NEXT_PUBLIC_KCP_ENV=test
KCP_ENV=test
# 비워 두면 T0000 공개 테스트 인증서를 씁니다.
KCP_CERT_INFO=
```

라이브 전환 — 코드 수정 없이 아래만 바꿉니다.

```env
NEXT_PUBLIC_KCP_SITE_CD=계약_사이트코드
NEXT_PUBLIC_KCP_SITE_NAME=라이드올다이
NEXT_PUBLIC_KCP_ENV=production
KCP_ENV=production
KCP_CERT_INFO=-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----
```

`KCP_CERT_INFO`는 파트너관리자 → 기술관리센터 → 인증센터 → KCP-PG API에서 받은 PEM을 한 줄로 넣습니다.

## 테스트 결제

1. `/book`에서 날짜·시간·연락처를 고른 뒤 **결제하기**
2. KCP 테스트 사이트코드 `T0000` 결제창이 열립니다
3. 승인되면 `/book/pay/success` 및 관리자 `payments` 행이 `confirmed` / `completed`
4. 창을 닫거나 실패하면 `/book/pay/fail`, 예약은 `pending`

실제 출금은 되지 않습니다. 카카오머니만 당일 취소가 필요합니다.

## 관련 API

- `POST /api/bookings` — 미확정 예약 생성, 서버 금액
- `GET /api/payments/kcp/order` — 결제 화면용 주문
- `POST /api/payments/kcp/register` — 모바일 거래등록
- `POST /api/payments/confirm` — PC 승인 + 예약 확정
- `POST /api/payments/kcp/return` — 모바일 콜백 + 예약 확정
