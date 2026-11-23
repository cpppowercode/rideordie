# KCP 결제 연동 설정 가이드

라이드올다이 공개 사이트는 **NHN KCP 표준결제**를 사용합니다.  
(구 Toss + 로컬 Supabase `orders` 경로는 `/api/orders/create` 가 410 Gone 이며 사용하지 않습니다. 예약·결제는 어드민 `payments` API로 접수됩니다.)

## 1. 현재 모드 (테스트)

| 환경변수 | 테스트 값 | 역할 |
|---|---|---|
| `NEXT_PUBLIC_KCP_SITE_CD` | `T0000` | KCP 테스트 사이트코드 |
| `NEXT_PUBLIC_KCP_ENV` | `test` | 클라이언트 허브 스크립트(testspay) |
| `KCP_ENV` | `test` | 서버 승인/거래등록 호스트(stg-spl / testsmpay) |
| `KCP_CERT_INFO` | T0000 공개 테스트 PEM | 승인 API `kcp_cert_info` |
| `NEXT_PUBLIC_KCP_SITE_NAME` | 상점명 | 결제창 표시명 |
| `BOOKING_SIGNING_SECRET` | ≥16자 | 예약 intent HMAC·AES |
| `ADMIN_API_TOKEN` | 서비스 토큰 | 어드민 예약 조회·접수 |
| `ADMIN_RESERVATIONS_URL` | (기본) `https://admin.rideordie.kr/api/reservations` | |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL | Ret_URL·절대경로 |

선택: `BOOKING_SLOT_CAPACITY`(기본 6), `ADMIN_SEASON_SETTINGS_URL`, 알림용 `RESEND_*` / `SLACK_WEBHOOK_URL` / `DISCORD_WEBHOOK_URL` / `BOOKING_WEBHOOK_*` / `SOLAPI_*`.

## 2. 결제 흐름

1. `/book` → `POST /api/bookings` (검증만, DB 미저장) → 서명된 intent + 쿠키 `rod_booking_intent`
2. `/checkout`
   - **PC**: KCP 허브 스크립트 → `m_Completepayment` → `POST /api/payments/confirm`
   - **모바일**: `POST /api/payments/kcp/register` → PayUrl → `POST /api/payments/kcp/return`
3. `approveAndFinalizeBooking`: 금액 재계산 → KCP 승인(`res_cd=0000`) → 어드민 예약 접수 → 사장 알림
4. `/book/success?r=<receipt>`

금액은 클라이언트 값을 믿지 않습니다. `payBreakdown`(강습비 + 패찰비)으로 서버가 다시 계산합니다.

## 3. 로컬 테스트

```bash
# .env.local (값은 커밋하지 말 것)
NEXT_PUBLIC_KCP_SITE_CD=T0000
NEXT_PUBLIC_KCP_ENV=test
KCP_ENV=test
KCP_CERT_INFO="-----BEGIN CERTIFICATE-----...T0000..."
BOOKING_SIGNING_SECRET=local-dev-signing-secret
# 운영 어드민에 쓰지 않으려면 로컬 목/격리 URL 사용
ADMIN_API_TOKEN=...
ADMIN_RESERVATIONS_URL=http://127.0.0.1:9/mock-reservations
SEASON_SETTINGS_OFFLINE=1

npm run dev
```

단위 테스트: `npm test` (결제 승인·intent·금액 계산 포함).  
브라우저 E2E 결제창은 KCP 테스트 카드로 PC/모바일 각각 확인합니다. **운영 어드민에 테스트 예약이 쌓이지 않게** `ADMIN_RESERVATIONS_URL` 을 격리하거나, 승인 전 단계까지만 검증하세요.

## 4. 실결제 전환 체크리스트 (가맹 승인 후)

- [ ] KCP 가맹 심사 승인 및 **실결제 site_cd** 발급
- [ ] 실결제 **서비스 인증서(PEM)** → `KCP_CERT_INFO` 교체 (기존 T0000 테스트 인증서 교체)
- [ ] `NEXT_PUBLIC_KCP_SITE_CD` = 실 site_cd
- [ ] `NEXT_PUBLIC_KCP_ENV=production`, `KCP_ENV=production` (**둘 다** 맞출 것 — 클라이언트/서버 불일치 주의)
- [ ] `NEXT_PUBLIC_KCP_SITE_NAME` 확인
- [ ] `BOOKING_SIGNING_SECRET` / `ADMIN_API_TOKEN` 유지(교체 금지 정책 시 그대로)
- [ ] 사이트 하단 **사업자 정보·통신판매업 신고번호·대표자·연락처** KCP/전자상거래 표기 요건 충족
- [ ] 소액 실카드 결제 1건 → 어드민 접수·알림 확인 후 환불

## 5. 사이트 푸터 사업자 표기 (현행)

푸터에 상호·대표·사업자등록번호·개인정보 보호책임자·호스팅이 있습니다.  
통신판매업 신고번호·사업장 주소·유선 연락처가 비어 있으면 가맹 심사에서 보완 요청이 날 수 있습니다(대표자 생년월일 등은 사이트에 올리지 않고 KCP 신청서에만).

## 6. 보안

- `KCP_CERT_INFO`, `ADMIN_API_TOKEN`, `BOOKING_SIGNING_SECRET` 은 서버 전용. 클라이언트·로그·PR에 출력하지 마세요.
- 기존 키/토큰을 임의로 교체하지 마세요(사장님 지시 후만).
