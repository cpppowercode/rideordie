# 통합 검증 브랜치 `cursor/combined-release-1124` 충돌 해결

## 머지 순서

1. `origin/master` → `cursor/combined-release-1124` 생성
2. PR **#30** (`cursor/guest-domain-rewrite-b8de`) 로컬 merge — **fast-forward**, 충돌 없음
3. PR **#29** (`cursor/customer-feedback-bd49`) 로컬 merge — **`package.json`만** 충돌

원 PR 브랜치(`cursor/guest-domain-rewrite-b8de`, `cursor/customer-feedback-bd49`)는 **미변경**.

## 충돌 파일

| 파일 | 원인 | 해결 |
|------|------|------|
| `package.json` `scripts.test` | #30이 `guest-proxy.test.ts` 추가, #29가 feedback 5개 테스트 추가 | 둘 다 유지: security 다음 `guest-proxy` → feedback 5개 순 |
| 그 외 | — | 자동 머지 (기능 경로 겹침 없음) |

## 유지한 #29 전용 스크립트

- `test:feedback`
- `mock:feedback-admin`

## 기능 경로 겹침

- #30 rewrite 화이트리스트: `/my-lesson`, `/e-contract`, `/rod-a` (+ 관련 API)
- #29 신규: `/feedback`, `/junior` — **화이트리스트에 없음** (의도)
