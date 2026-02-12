# 토스페이먼츠 결제 연동 설정 가이드

## 1. Supabase 프로젝트 설정

### 1.1 Supabase 계정 및 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입
2. 새 프로젝트 생성
3. 프로젝트 설정 완료 대기 (약 2분)

### 1.2 데이터베이스 테이블 생성

1. Supabase 대시보드에서 `SQL Editor` 메뉴로 이동
2. 프로젝트 루트의 `supabase-schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 실행

### 1.3 API 키 확인

1. Supabase 대시보드에서 `Settings` > `API` 메뉴로 이동
2. 다음 정보 복사:
   - `Project URL`
   - `anon public key`
   - `service_role key` (⚠️ 절대 노출 금지)

---

## 2. 토스페이먼츠 설정

### 2.1 가맹점 등록

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com) 가입
2. 테스트 연동 정보 확인:
   - 클라이언트 키 (test_ck_...)
   - 시크릿 키 (test_sk_...) (⚠️ 절대 노출 금지)

### 2.2 실제 운영 전환 (선택)

1. 사업자 정보 등록
2. 심사 완료 후 실제 키 발급
3. 환경 변수를 테스트 키에서 실제 키로 변경

---

## 3. 환경 변수 설정

### 3.1 .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용 입력:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_YOUR_CLIENT_KEY
TOSS_SECRET_KEY=test_sk_YOUR_SECRET_KEY
```

### 3.2 값 입력

- Supabase 값: 1.3에서 복사한 값 입력
- 토스페이먼츠 값: 2.1에서 복사한 값 입력

⚠️ **주의**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!

---

## 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 5. 테스트 결제

### 5.1 테스트 카드 정보

- **카드번호**: 4000-0000-0000-0008
- **유효기간**: 미래 날짜 (예: 12/28)
- **CVC**: 아무 숫자 3자리 (예: 123)
- **비밀번호**: 아무 숫자 2자리 (예: 12)

### 5.2 테스트 절차

1. 상품 페이지 접속
2. 옵션 선택 후 "바로 구매" 클릭
3. 주문자 정보 입력
4. "주문하기" 버튼 클릭
5. 토스페이먼츠 결제창에서 테스트 카드 정보 입력
6. 결제 완료 확인

### 5.3 결제 확인

1. Supabase 대시보드에서 `Table Editor` > `orders` 확인
2. `payment_logs` 테이블에서 결제 로그 확인

---

## 6. 배포 설정 (Vercel)

### 6.1 환경 변수 설정

Vercel 대시보드에서:

1. Project Settings > Environment Variables
2. `.env.local`의 모든 환경 변수 추가
3. Production, Preview, Development 모두 체크

### 6.2 배포

```bash
git add .
git commit -m "Add payment integration"
git push
```

Vercel이 자동으로 배포합니다.

---

## 7. 실제 운영 전환 체크리스트

- [ ] 토스페이먼츠 가맹점 심사 완료
- [ ] 실제 클라이언트 키/시크릿 키 발급
- [ ] 환경 변수를 테스트 키에서 실제 키로 변경
- [ ] Vercel 환경 변수 업데이트
- [ ] 실제 카드로 소액 테스트 결제
- [ ] Supabase RLS 정책 검토
- [ ] 에러 로깅 설정 (Sentry 등)
- [ ] 결제 웹훅 설정 (선택)

---

## 8. 문제 해결

### 결제창이 안 뜨는 경우

- 브라우저 콘솔에서 에러 확인
- `NEXT_PUBLIC_TOSS_CLIENT_KEY` 환경 변수 확인
- 개발 서버 재시작

### 결제 승인 실패

- Supabase 테이블이 생성되었는지 확인
- `TOSS_SECRET_KEY` 환경 변수 확인
- 네트워크 탭에서 API 응답 확인

### 주문이 DB에 저장 안 됨

- Supabase URL과 키 확인
- `supabase-schema.sql` 실행 여부 확인
- Supabase 대시보드에서 직접 테이블 확인

---

## 9. 보안 주의사항

1. **시크릿 키 절대 노출 금지**
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TOSS_SECRET_KEY`
   - 이 키들은 서버에서만 사용되며, 클라이언트에 노출되면 안 됨

2. **환경 변수 관리**
   - `.env.local`을 `.gitignore`에 포함
   - 팀원과는 안전한 방법으로 공유 (1Password, LastPass 등)

3. **Supabase RLS 설정**
   - `supabase-schema.sql`의 정책 검토
   - 필요시 추가 보안 정책 설정

---

## 10. 도움말

문제가 발생하면:

1. 개발자 콘솔 확인
2. Supabase 로그 확인
3. 토스페이먼츠 개발자 센터 문서 참고
4. 이슈 생성 또는 contact@rideordie.kr로 문의

---

**설정 완료!** 🎉

이제 실제 결제를 테스트해보세요.
