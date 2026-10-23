import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "이용약관 · 개인정보 처리방침",
  description: "라이드올다이 서비스 이용약관과 개인정보 처리방침. 환불은 제9조를 따릅니다.",
  path: "/service-policy",
});

export default function ServicePolicy() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <div className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <p className="eyebrow text-center">LEGAL</p>
        <h1 className="mt-3 text-center text-[32px] font-bold tracking-tight md:text-[40px]">서비스 이용약관</h1>
        <p className="mt-3 text-center text-muted">(전자상거래 표준약관 준용·스포츠 강습 특화)</p>
        
        {/* 서비스 이용약관 */}
        <section className="mb-12 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제1조 (목적)</h2>
            <p className="text-gray-600 leading-relaxed">
              본 약관은 RideOrDie(이하 &quot;회사&quot;)가 제공하는 스키·스노우보드 강습 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여, 회사와 이용자 간의 권리·의무 및 책임사항, 서비스 이용 조건, 결제·환불·분쟁 해결 절차 등 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제2조 (정의)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
                          <p>&quot;서비스&quot;란 회사가 제공하는 스키·스노우보드 강습, 부대 프로그램, 관련 제반 서비스를 말합니다.</p>
            <p>&quot;이용자&quot;란 본 약관에 따라 회사와 이용계약을 체결하고 서비스를 이용하는 회원 및 비회원을 말합니다.</p>
            <p>&quot;회원&quot;이란 회사에 개인정보를 제공하여 회원가입을 완료하고 지속적으로 서비스를 이용할 수 있는 자를 말합니다.</p>
            <p>&quot;비회원&quot;이란 회원가입 없이 서비스를 이용하는 자를 말합니다.</p>
            <p>&quot;유료서비스&quot;란 이용자가 일정 금액을 결제하고 사용하는 강습 서비스를 말합니다.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제3조 (약관의 명시와 개정)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>1. 회사는 본 약관을 서비스 초기화면 또는 연결화면에 게시하여 이용자가 확인할 수 있도록 합니다.</p>
              <p>2. 회사는 &quot;약관의 규제에 관한 법률&quot;, &quot;전자상거래법&quot;, &quot;정보통신망법&quot;, &quot;개인정보보호법&quot; 등 관계 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
              <p>3. 회사가 약관을 개정할 경우, 시행일자 및 개정사유를 명시하여 시행일자 7일 전부터 공지합니다.</p>
              <p>4. 이용자가 변경 약관에 동의하지 않는 경우, 변경된 약관의 효력 발생일 전까지 서비스 이용계약을 해지할 수 있습니다.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제4조 (이용계약의 성립)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>1. 이용계약은 이용자가 약관에 동의하고, 회사가 이를 승낙함으로써 성립합니다.</p>
              <p>2. 회사는 다음 각 호의 사유가 있는 경우 이용계약의 승낙을 거부할 수 있습니다.</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>허위 정보 기재</li>
                <li>타인의 명의 도용</li>
                <li>서비스 이용 목적이 법령 또는 사회질서에 반하는 경우</li>
              </ul>
              <p>3. 회사는 필요 시 이용자의 본인확인 절차를 요청할 수 있습니다.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제5조 (이용자의 권리와 의무)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>1. 이용자는 관련 법령, 본 약관, 서비스 이용안내를 준수해야 합니다.</p>
              <p>2. 이용자는 서비스 이용과 관련하여 다음 행위를 하여서는 안 됩니다.</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>타인의 개인정보 도용</li>
                <li>서비스 부정 이용 또는 해킹 시도</li>
                <li>회사의 승인 없이 상업적 광고, 홍보, 판매 행위</li>
                <li>저작권 등 제3자의 권리 침해 행위</li>
              </ul>
              <p>3. 이용자는 자신의 계정(ID, 비밀번호)을 안전하게 관리할 의무가 있으며, 이를 제3자에게 양도·대여할 수 없습니다.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제6조 (회사의 의무)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>1. 회사는 관련 법령과 본 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 지속적·안정적으로 서비스를 제공하기 위해 최선을 다합니다.</p>
              <p>2. 회사는 이용자의 개인정보를 관련 법령에 따라 안전하게 보호합니다.</p>
              <p>3. 회사는 서비스 제공과 관련하여 이용자가 제기한 의견이나 불만을 신속하게 처리합니다.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제7조 (서비스 제공 및 변경)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>1. 회사는 계절·날씨 등의 특성에 따라 강습 운영 일정을 조정할 수 있습니다.</p>
              <p>2. 회사는 운영상·기술상 필요에 따라 서비스의 일부 또는 전부를 변경할 수 있으며, 변경 사항은 사전 공지합니다.</p>
              <p>3. 회사는 무료로 제공되는 서비스의 일부 또는 전부를 회사의 정책에 따라 변경·중단할 수 있습니다.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제8조 (서비스의 중단)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>1. 회사는 다음 각 호의 경우 서비스 제공을 일시적으로 중단할 수 있습니다.</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>서비스 설비 점검·보수·교체</li>
                <li>통신사업자의 서비스 중단</li>
                <li>천재지변, 기상 악화, 정전, 서버 장애 등 불가항력 사유</li>
              </ul>
              <p>2. 회사는 경영상 중대한 사유로 서비스를 종료할 수 있으며, 최소 30일 전에 공지합니다.</p>
              <p>3. 유료 서비스 중단 시 잔여 이용 기간에 해당하는 금액을 환불합니다.</p>
            </div>
          </div>
          
          <div>
            <h2 id="article-9" className="scroll-mt-24 text-2xl font-semibold mb-4 text-gray-800">제9조 (결제 및 환불 규정)</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div>
                <p className="font-semibold mb-2">결제수단:</p>
                <p>신용카드, 체크카드, 계좌이체, 간편결제 등 회사가 제공하는 방법</p>
              </div>
              
              <div>
                <p className="font-semibold mb-2">예약 확정 시점:</p>
                <p>결제 완료 후 회사로부터 예약 확정 안내(문자·이메일·앱 알림 중 1개 이상)를 받은 시점에 예약이 확정됩니다.</p>
              </div>
              
              <div>
                <p className="font-semibold mb-2">환불 규정:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>서비스 이용일 7일 전까지 취소: 전액 환불</li>
                  <li>서비스 이용일 3~6일 전 취소: 결제 금액의 70% 환불</li>
                  <li>서비스 이용일 1~2일 전 취소: 결제 금액의 50% 환불</li>
                  <li>서비스 이용 당일 취소 또는 무단 불참: 환불 불가</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold mb-2">기상 악화·천재지변:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>스키장 운영 중단, 도로 통제 등 강습 불가 시: 전액 환불 또는 날짜 변경(택1)</li>
                  <li>강습 시작 이후 기상 악화로 중단된 경우: 환불 불가</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold mb-2">회사의 귀책 사유:</p>
                <p>강사의 부득이한 사정, 안전 문제, 내부 운영상 이유로 강습 불가 시: 전액 환불 또는 대체 강습 제공(택1)</p>
              </div>
              
              <div>
                <p className="font-semibold mb-2">이용자의 귀책 사유:</p>
                <p>지각, 준비 미흡, 안전 수칙 미준수 등으로 강습이 축소·중단된 경우: 환불 불가</p>
              </div>
              
              <div>
                <p className="font-semibold mb-2">청약철회 제한:</p>
                <p>&quot;전자상거래법&quot; 제17조 제2항에 따라, 예약 확정 후 강습 준비(강사 배정, 장비 예약, 리조트 일정 확정 등) 절차가 시작된 경우에는 본 조의 환불 규정이 적용됩니다.</p>
              </div>
              
              <div>
                <p className="font-semibold mb-2">환불 절차:</p>
                <p>고객센터 또는 지정 채널로 취소 신청 → 취소 가능 여부 확인 → 환불 승인 시 결제수단으로 환불(영업일 기준 3~5일 소요)</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제10조 (책임 제한)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>1. 회사는 천재지변, 기상 악화, 불가항력, 이용자 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</p>
              <p>2. 회사는 무료로 제공되는 서비스와 관련하여 법령에 특별한 규정이 없는 한 손해배상 책임을 지지 않습니다.</p>
              <p>3. 회사는 이용자가 서비스에 게재한 정보·자료의 신뢰성·정확성에 대해 보증하지 않으며, 그로 인한 손해에 대해 책임을 지지 않습니다.</p>
              <p>4. 회사는 강습 중 발생한 부상·사고에 대해 기본 안전 수칙을 준수한 범위 내에서만 책임을 부담하며, 그 외는 이용자가 가입한 보험 또는 본인의 책임으로 합니다.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제11조 (저작권의 귀속 및 이용제한)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>1. 회사가 작성한 저작물에 대한 저작권은 회사에 귀속됩니다.</p>
              <p>2. 이용자는 회사의 사전 동의 없이 콘텐츠를 복제, 전송, 배포, 방송, 기타 방법으로 이용할 수 없습니다.</p>
              <p>3. 이용자가 작성한 콘텐츠에 대한 저작권은 해당 이용자에게 귀속되며, 회사는 서비스 운영·홍보를 위해 이를 사용할 수 있습니다.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제12조 (개인정보 보호)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>1. 회사는 &quot;개인정보보호법&quot;에 따라 개인정보 처리방침을 수립·공개하며, 개인정보를 안전하게 관리합니다.</p>
              <p>2. 개인정보 수집 항목: 필수(이름, 휴대폰 번호), 상담 과정에서 일정·레벨 등 강습 진행에 필요한 정보, 자동수집(IP주소, 쿠키, 이용기록 등). 회원가입은 받지 않습니다.</p>
              <p>3. 이용 목적: 강습 예약·상담·결제·고객 응대 및 관련 법령에 따른 보존</p>
              <p>4. 보유 기간: 이용 목적 달성 시까지, 단 전자상거래법 등 법령에 따라 보존할 필요가 있는 경우 해당 기간까지 보관</p>
              <p>5. 개인정보 보호책임자: 정동진 (contact@rideordie.kr, 010-2028-2744)</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제13조 (분쟁 해결 및 준거법)</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>1. 회사와 이용자는 서비스 이용과 관련하여 발생한 분쟁을 원만히 해결하기 위해 노력합니다.</p>
              <p>2. 협의가 이루어지지 않을 경우, 민사소송법상의 관할법원에 소를 제기할 수 있습니다.</p>
              <p>3. 본 약관은 대한민국 법령에 따라 해석됩니다.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제14조 (법률 자문)</h2>
            <p className="text-gray-600 leading-relaxed">
              귀사는 노바법률사무소 이돈호 변호사의 법률 자문을 바탕으로 운영되고 있으며, 관련 법령 개정 시 지속적으로 검토·수정됩니다.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">부칙</h2>
            <div className="text-gray-600 leading-relaxed space-y-2">
              <p>1. 본 약관은 2025년 8월 11일부터 시행합니다.</p>
              <p>2. 본 약관에 명시되지 않은 사항은 관계 법령과 상관례에 따릅니다.</p>
            </div>
          </div>
        </section>

        {/* 문의처 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">문의처</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-gray-600 space-y-2">
              <p><strong>전화:</strong> 010-2028-2744</p>
              <p><strong>이메일:</strong> contact@rideordie.kr</p>
              <p><strong>운영시간:</strong> 연중 무휴</p>
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