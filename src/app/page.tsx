'use client';

import Image from 'next/image';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#1A1A1A]">
      <Parallax pages={2.5} style={{ top: '0', left: '0' }}>
        {/* rideordie 이미지 레이어 */}
        <ParallaxLayer
          offset={0}
          speed={0.3}
          // flex를 이용해 자식 요소를 완벽한 중앙으로 정렬합니다.
          className="flex items-center justify-center"
          style={{ zIndex: 1 }} // 산 이미지 위에 겹치도록 z-index 설정
        >
          {/* 이미지 크기를 키우고 반응형으로 조절합니다. */}
          <Image
            src="/RIDEORDIE.svg"
            alt="rideordie"
            width={800} // 이미지 기본 너비 증가
            height={800} // 이미지 기본 높이 증가
            className="w-2/3 md:w-1/2 lg:w-1/3 select-none" // 화면 크기에 따라 너비 조절
            priority
          />
        </ParallaxLayer>

        {/* 산 이미지 레이어 */}
        <ParallaxLayer
          offset={0.55} // offset 값을 줄여 산이 더 일찍(더 위에서) 나타나도록 수정
          speed={2}
          style={{ zIndex: 2 }} // rideordie 이미지 아래에 오도록 z-index 설정
        >
          {/* bottom 위치를 조정해 산의 높이를 올립니다. */}
          <div className="absolute left-1/2 sm:bottom-[20vh] xl:scale-70 lg:bottom-[0vh] xl:bottom-[-200px] md:bottom-[20vh] -translate-x-1/2 w-[150vw] h-auto scale-150 md:scale-120 pointer-events-none select-none">
            <Image
              src="/mountain.png"
              alt="Mountain"
              width={4000}
              height={3000}
              className="w-full h-auto"
              priority
            />
          </div>
        </ParallaxLayer>

        {/* 스크롤 가능한 공간을 위한 더미 레이어 */}
        <ParallaxLayer offset={1.5} speed={0.5}>
          <div className="flex items-center justify-center h-screen bg-transparent text-white text-2xl">
            <p>Scroll down for more content!</p>
          </div>
        </ParallaxLayer>
      </Parallax>
    </main>
  );
}