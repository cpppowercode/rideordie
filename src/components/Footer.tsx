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

          {/* 개발자 */}
          <div className="space-y-4 relative">
            <h3 className="text-gray-300 font-medium">개발자 ❤️</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a
                  href="https://likegravity.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                  <span>likegravity</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </li>
              <li className="text-gray-500">웹사이트 개발</li>
              <li className="text-gray-500">UI/UX 디자인</li>
            </ul>
            {/* 모바일에서는 개발자 섹션 우측에 사인 표시 */}
            <div className="md:hidden absolute right-0 bottom-0">
              <Image
                src="/sign.svg"
                alt="Signature"
                width={60}
                height={60}
                className="opacity-40 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Ride or Die. 모든 권리 보유.
            <br/><br/>Made with ❤️ by likegravity
          </p>
        </div>

        {/* 데스크톱에서만 표시되는 사인 */}
        <div className="hidden md:block absolute bottom-0 right-0 -mb-2">
          <Image
            src="/sign.svg"
            alt="Signature"
            width={80}
            height={80}
            className="opacity-20 hover:opacity-100 transition-opacity duration-300"
          />
        </div>
        </div>
      </div>
    </footer>
  );
} 