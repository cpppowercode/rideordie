# 채널톡 연동 가이드

## 채널톡이란?

채널톡은 고객 상담을 위한 실시간 채팅 서비스입니다. 결제 후 강습 일정, 레벨, 옵션 등을 상담하기 위해 사용됩니다.

## 설정 방법

### 1. 채널톡 계정 생성

1. [채널톡 웹사이트](https://channel.io)에 접속
2. 무료로 가입
3. 새 채널 생성

### 2. 플러그인 키 확인

1. 채널톡 대시보드 접속
2. 설정 > 개발자 설정 > 플러그인 키 복사

### 3. 코드에 적용

`src/app/layout.tsx` 파일에서 다음 부분을 수정:

```typescript
ChannelIO('boot', {
  "pluginKey": "YOUR_CHANNEL_TALK_PLUGIN_KEY"  // ← 여기에 실제 플러그인 키 입력
});
```

### 4. 환경 변수로 관리 (권장)

보안을 위해 환경 변수로 관리하는 것을 권장합니다:

1. `.env.local`에 추가:
```env
NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY=your_plugin_key_here
```

2. `src/app/layout.tsx` 수정:
```typescript
ChannelIO('boot', {
  "pluginKey": "${process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY}"
});
```

## 기능

### 1. 자동 상담 시작 버튼

다음 위치에서 채널톡을 열 수 있습니다:

- **상품 페이지**: "상담하기" 버튼
- **체크아웃 페이지**: "지금 바로 문의하기" 링크
- **결제 완료 페이지**: "지금 바로 상담하기" 버튼
- **우측 하단**: 채널톡 플러그인 아이콘 (자동 표시)

### 2. 결제 후 자동 안내

결제가 완료되면 성공 페이지에서 채널톡으로 상담할 수 있도록 안내합니다.

## 상담 내용

고객과 상담할 주요 내용:

1. **강습 일정**: 희망하는 날짜와 시간대
2. **강습 레벨**: 입문, 초급, 중급, 상급
3. **강습 유형**: 1:1 프라이빗, 2:1 파트너, 그룹
4. **추가 요청사항**: 장비 대여, 특별 요청 등

## 채널톡 대시보드 활용

### 주문 정보 연동 (선택사항)

채널톡에서 고객 정보를 더 잘 관리하려면:

1. 채널톡 API를 사용하여 주문 정보 전송
2. 고객 프로필에 주문 번호, 결제 금액 등 표시

예시 코드 (선택사항):

```typescript
ChannelIO('updateUser', {
  profile: {
    name: customerName,
    email: customerEmail,
    mobileNumber: customerPhone,
  },
  profileOnce: {
    orderId: orderId,
    amount: amount,
  }
});
```

## 운영 팁

1. **빠른 응답**: 결제 후 30분 이내에 응답하는 것을 목표로 설정
2. **템플릿 활용**: 자주 사용하는 답변은 템플릿으로 저장
3. **영업시간 설정**: 채널톡 설정에서 영업시간 및 자동 응답 메시지 설정
4. **모바일 앱**: 채널톡 모바일 앱을 설치하여 빠른 응답

## 문제 해결

### 채널톡이 로드되지 않는 경우

1. 플러그인 키가 올바른지 확인
2. 브라우저 콘솔에서 에러 확인
3. 개발자 도구 Network 탭에서 `ch-plugin-web.js` 로드 확인

### 채널톡 버튼이 작동하지 않는 경우

1. `window.ChannelIO`가 정의되었는지 확인
2. 페이지가 완전히 로드된 후 버튼 클릭
3. 브라우저 콘솔에서 `ChannelIO('show')` 직접 실행하여 테스트

## 참고 문서

- [채널톡 개발자 문서](https://developers.channel.io)
- [채널톡 웹 플러그인 가이드](https://developers.channel.io/docs/web-installation)

---

**설정 완료 후 테스트하세요!** 💬
