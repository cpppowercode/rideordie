'use client';

import Image from 'next/image';
import Link from 'next/link';


export function Footer() {
  return (
    <footer className="w-full bg-neutral-900 backdrop-blur-sm border-t border-white/10 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* 로고 및 설명 */}
            <div className="space-y-4">
              <Image src="/rod_mountain.svg" alt="logo" className="w-24 h-12" width={128} height={128} />
              <p className="text-gray-400 text-sm">
                Ride or Die
              </p>
            </div>

          {/* 연락처 */}
          <div className="space-y-4">
            <h3 className="text-gray-300 font-medium">문의하기</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>이메일: contact@rideordie.kr</li>
              <Link href="/card" className='underline'>대표 연락처</Link>
            </ul>
          </div>

          {/* 사업자 정보 */}
          <div className="space-y-4">
            <h3 className="text-gray-300 font-medium">사업자 정보</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>상호명: 라이드올다이(Ride or Die)</li>
              <li>대표자: 김대일</li>
              <li>사업자등록번호: 825-27-01614</li>
              <li>사업장 소재지: 강원특별자치도 태백시 대학길 80,<br />105동 1102호(황지동, 중앙하이츠)</li>
            </ul>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Ride or Die. 모든 권리 보유.
          </p>
        </div>

        </div>
      </div>
    </footer>
  );
} 