# 트래픽 공격·남용 방어 가이드 (rideordie.kr)

코드로 넣은 방어와, **사장님이 Vercel 대시보드에서 직접 켜야 하는 무료 기능**을 정리합니다.  
이 문서는 적용 방법이 아니라 **무엇을 켜면 되는지** 안내입니다. 에이전트가 대시보드에 직접 적용하지 않습니다.

## 1. 코드로 이미 적용된 것

| 보호 | 대상 | 방식 |
|---|---|---|
| 레이트리밋 | `/api/bookings`, availability, 결제 prepare/confirm/return, 현금영수증, 문의, 챗, 웹훅 | 인스턴스 메모리 (추가 비용 없음, 유료 Redis 미사용) |
| 웹훅 서명 | `/api/webhooks/kcp` | 시크릿 없으면 **fail-closed(503)** |
| 본문 크기 | JSON API 32KiB, 웹훅/폼 64KiB | `Content-Length` + 실제 바이트 |
| 입력 검증 | 예약·결제·문의·현금영수증·챗 | 길이·형식 제한 |
| 업로드 | (현재 공개 업로드 없음) | MIME·2MiB 헬퍼 준비 |
| 봇 차단 | 예약 폼 → `/api/bookings`, 문의·현금영수증 | 허니팟 항상 ON / Turnstile은 env 있을 때만 |

### 웹훅 시크릿 (운영에 이름만 확인)

| 환경변수 | 운영 존재 여부 (이름만) | 배포 시 영향 |
|---|---|---|
| `KCP_NOTI_SECRET` | **없음** | 기존 결제(confirm / Ret_URL)는 **그대로 동작**. 새 `/api/webhooks/kcp` 만 시크릿 없으면 거부. KCP에 통보 URL을 등록하기 **전에** 시크릿을 넣어야 함. |

**KCP 키·모드(`NEXT_PUBLIC_KCP_*`, `KCP_ENV`, `KCP_CERT_INFO`)는 변경하지 않았습니다.**

### Turnstile (선택, 무료 티어)

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

둘 다 없으면 꺼진 상태 — **지금 예약이 깨지지 않습니다.**  
둘 다 넣으면 예약 확인 단계에 위젯이 뜨고 서버가 토큰을 검증합니다.

### 웹훅 시크릿 넣는 법 (나중에)

```env
KCP_NOTI_SECRET=긴랜덤문자열
```

채널톡은 공개 플러그인 키만 쓰며 인바운드 웹훅 시크릿/서명 검사는 없습니다.

호출 측은 `Authorization: Bearer <시크릿>` 또는 `X-Webhook-Secret: <시크릿>`  
또는 `X-Webhook-Signature: sha256=<HMAC-SHA256(body)>` 를 보냅니다.

## 2. Vercel 무료 방어 (대시보드에서 사장님이 켜기)

대상 프로젝트: **rideordie** → **Firewall**

### 자동 DDoS 완화
- 모든 플랜에 기본 포함. 별도 설정 없음.
- 차단된 공격 트래픽은 사용량에 잡히지 않음.

### 커스텀 방화벽 룰 (Hobby 최대 3개)
권장 예시 (직접 적용은 사장님):

1. **`/api/*` POST 레이트리밋** — path starts with `/api`, method POST, action `rate_limit` (예: IP당 1분 60회).  
   - Hobby에도 커스텀 룰·레이트리밋 허용 요청 할당이 있음. 유료 BotID Deep Analysis는 쓰지 말 것.
2. **웹훅 외 국가 제한(선택)** — 강습 예약이 한국 중심이면 `/api/bookings` 등에 `geo_country` 조건 검토.
3. **의심 UA deny/challenge** — 빈 User-Agent, 알려진 스크레이퍼 문자열.

적용 순서: 먼저 **Log** → 문제 없으면 **Challenge/Deny/Rate limit**.

### 봇 차단 (Bot Protection managed ruleset)
- 모든 플랜 포함, 기본 Off.
- Firewall → Bot Protection → **Log** 로 시작 후 **Challenge**.
- 검증된 검색엔진 봇은 제외됨.
- 앞단에 다른 CDN/리버스 프록시를 두면 정확도가 떨어짐.

### Attack Challenge Mode
- 모든 플랜 **무료**.
- 공격이 심할 때 Firewall 메뉴 → Enable Attack Mode (1/6/24시간).
- 브라우저 방문자는 챌린지, 검증된 봇·내부 Functions는 통과.
- **평소에는 끄고**, 공격 시에만 켠다. (결제·웹훅 자동화에 영향 줄 수 있어 장시간 ON 비권장)

### 쓰지 말 것 (유료/과금 주의)
- BotID **Deep Analysis** (과금)
- 유료 Redis/Upstash 레이트리밋
- Enterprise 전용 룰셋

## 3. Preview에 운영 비밀값이 붙어 있는지 (이름·타겟만)

Vercel 프로젝트 `rideordie` 환경변수 조사 결과 (값 미열람):

| 키 | Production | Preview | 비고 |
|---|---|---|---|
| `BOOKING_SIGNING_SECRET` | ✅ (별도) | ✅ (preview 전용 항목 있음) | 운영/프리뷰 분리됨 |
| `ADMIN_API_TOKEN` | ✅ | ✅ **동일 항목** | Preview가 운영 어드민 토큰을 공유 |
| `KCP_CERT_INFO` | ✅ | ✅ **동일 항목** | 테스트 PEM 공유(현재 테스트 모드) |
| `TOSS_SECRET_KEY` | ✅ | ✅ **동일 항목** | 레거시, 공유 |
| `KCP_ENV` / `NEXT_PUBLIC_KCP_*` | ✅ | ✅ | 테스트 설정 공유 |
| `KCP_NOTI_SECRET` | ❌ | ❌ | 미설정 |
| `TURNSTILE_*` | ❌ | ❌ | 미설정(봇 검증 OFF) |

### Preview 분리 제안 (문서만 — 지금 바꾸지 않음)

1. **`ADMIN_API_TOKEN`**: Production 전용으로 두고, Preview에는 목 URL(`ADMIN_RESERVATIONS_URL`) + Preview 전용 토큰 또는 `AVAILABILITY_OFFLINE=1` / 격리 어드민.
2. **`TOSS_SECRET_KEY`**: 레거시 — Preview·Production 모두 제거 후보(코드 경로 410).
3. **알림 웹훅(`SLACK_`, `DISCORD_`, `SOLAPI_`, `RESEND_`)**: 운영에 넣을 때 Production만. Preview에 붙이면 테스트 예약 알림이 사장에게 갈 수 있음.
4. **`BOOKING_SIGNING_SECRET`**: 이미 분리되어 있음 — 유지.
5. GitHub PR Preview가 외부에 열려 있으면, 운영 토큰 공유 시 프리뷰 URL로 어드민 API를 호출할 수 있음 → **Preview에서 Production 시크릿 제거**가 우선.

## 4. 채널톡

채널톡 언어는 코드에서 **한국어(`ko`) 고정**입니다. 이 PR에서 바꾸지 않았습니다.
