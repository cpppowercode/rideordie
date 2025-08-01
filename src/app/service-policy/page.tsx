

export default function ServicePolicy() {
  return (
    <main className="bg-white text-black min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mt-20 mb-8">서비스 이용약관</h1>
        
        {/* 서비스 이용약관 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">제1조 (목적)</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            본 약관은 RideOrDie(이하 "회사")가 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">제2조 (정의)</h2>
          <div className="text-gray-600 mb-4 leading-relaxed">
            <p className="mb-2">1. "서비스"라 함은 회사가 제공하는 모든 서비스를 의미합니다.</p>
            <p className="mb-2">2. "이용자"라 함은 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</p>
            <p className="mb-2">3. "회원"이라 함은 회사의 서비스에 접속하여 이 약관에 동의하고 회사와 이용계약을 체결한 자를 말합니다.</p>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">제3조 (약관의 효력 및 변경)</h2>
          <div className="text-gray-600 mb-4 leading-relaxed">
            <p className="mb-2">1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</p>
            <p className="mb-2">2. 회사는 필요한 경우 관련법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</p>
            <p className="mb-2">3. 약관이 변경되는 경우, 회사는 변경사항을 시행일자 7일 전부터 공지사항을 통해 공지합니다.</p>
          </div>
        </section>

        {/* 개인정보처리방침 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">개인정보처리방침</h2>
          
          <h3 className="text-xl font-semibold mb-3 text-gray-700">1. 개인정보의 수집 및 이용목적</h3>
          <div className="text-gray-600 mb-4 leading-relaxed">
            <p className="mb-2">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>서비스 제공 및 계정 관리</li>
              <li>고객 상담 및 문의 응대</li>
              <li>서비스 개선 및 신규 서비스 개발</li>
              <li>마케팅 및 광고 활용 (동의 시)</li>
            </ul>
          </div>
          
          <h3 className="text-xl font-semibold mb-3 text-gray-700">2. 수집하는 개인정보 항목</h3>
          <div className="text-gray-600 mb-4 leading-relaxed">
            <ul className="list-disc pl-6 space-y-1">
              <li>필수항목: 이메일 주소, 비밀번호, 이름</li>
              <li>선택항목: 휴대폰 번호, 생년월일, 성별</li>
              <li>자동수집항목: IP주소, 쿠키, 서비스 이용기록, 접속로그</li>
            </ul>
          </div>
          
          <h3 className="text-xl font-semibold mb-3 text-gray-700">3. 개인정보의 보유 및 이용기간</h3>
          <p className="text-gray-600 mb-4 leading-relaxed">
            회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.
          </p>
        </section>

        {/* 환불정책 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">환불정책</h2>
          
          <h3 className="text-xl font-semibold mb-3 text-gray-700">1. 환불 조건</h3>
          <div className="text-gray-600 mb-4 leading-relaxed">
            <ul className="list-disc pl-6 space-y-1">
              <li>서비스 이용 시작 후 7일 이내: 전액 환불</li>
              <li>서비스 이용 시작 후 7일 초과: 환불 불가</li>
              <li>회사의 서비스 장애로 인한 이용 불가: 전액 환불</li>
            </ul>
          </div>
          
          <h3 className="text-xl font-semibold mb-3 text-gray-700">2. 환불 절차</h3>
          <div className="text-gray-600 mb-4 leading-relaxed">
            <ol className="list-decimal pl-6 space-y-1">
              <li>고객센터를 통한 환불 신청</li>
              <li>환불 사유 확인 및 검토 (1-3일 소요)</li>
              <li>환불 승인 시 결제 수단으로 환불 처리 (3-5일 소요)</li>
            </ol>
          </div>
          
          <h3 className="text-xl font-semibold mb-3 text-gray-700">3. 환불 제외 사항</h3>
          <div className="text-gray-600 mb-4 leading-relaxed">
            <ul className="list-disc pl-6 space-y-1">
              <li>이용자의 고의적인 서비스 악용</li>
              <li>이용약관 위반으로 인한 서비스 이용 제한</li>
              <li>이용자가 제공한 정보의 허위 기재</li>
            </ul>
          </div>
        </section>

        {/* 문의처 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">문의처</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-gray-600 space-y-2">
              <p><strong>이메일:</strong> contact@rideordie.kr</p>
              <p><strong>운영시간:</strong> 평일 09:00 - 18:00 (주말 및 공휴일 휴무)</p>
            </div>
          </div>
        </section>

        {/* 약관 동의 */}
        <section className="border-t pt-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">약관 동의</h3>
            <p className="text-blue-700 mb-4">
              위 약관에 동의하시면 서비스를 이용하실 수 있습니다. 약관에 동의하지 않으시는 경우 서비스 이용이 제한될 수 있습니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}