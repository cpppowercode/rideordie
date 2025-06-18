'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function BusinessCardPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0, depth: 10 });

  useEffect(() => {
    const updateSize = () => {
      const width = Math.min(window.innerWidth * 0.8, 640); // 최대 640px
      const height = width * 0.625; // 640:400 비율
      setCardSize({ width, height, depth: 10 });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const clamp = (min: number, max: number, x: number) =>
      Math.min(max, Math.max(min, x));
  
    let startY = 0;
  
    const getCurrentRotation = () => {
      if (!cardRef.current) return 0;
      const currentTransform = cardRef.current.style.transform;
      const currentRotation = currentTransform.match(/rotateX\((-?\d+(?:\.\d+)?)deg\)/);
      return currentRotation ? parseFloat(currentRotation[1]) : 0;
    };
  
    const setRotation = (deg: number) => {
      if (!cardRef.current) return;
      cardRef.current.style.transform = `rotateX(${deg}deg)`;
    };
  
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentDeg = getCurrentRotation();
      const rotationStep = e.deltaY > 0 ? 5 : -5;
      setRotation(clamp(0, 180, currentDeg + rotationStep));
    };
  
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
  
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // 기본 스크롤 막음
      const deltaY = e.touches[0].clientY - startY;
      const currentDeg = getCurrentRotation();
      const rotationStep = deltaY > 0 ? -15 : 15; // 위로 쓸면 회전, 아래로 쓸면 반대로
      setRotation(clamp(0, 180, currentDeg + rotationStep));
      startY = e.touches[0].clientY; // 다음 비교를 위해 갱신
    };
  
    // wheel 이벤트 (PC)
    document.addEventListener('wheel', handleWheel, { passive: false });
  
    // touch 이벤트 (모바일)
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
  
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const { width, height, depth } = cardSize;

  return (
    <div className="h-screen bg-gray-950 overflow-hidden">
      <div className="flex items-center justify-center h-full px-4">
        <div
          className="scene"
          style={{ perspective: '4000px', width, height }}
        >
          <div
            ref={cardRef}
            className="relative w-full h-full transition-transform duration-300 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: `center center ${depth / 2}px`,
            }}
          >
            {/* Front */}
            <div
              className="absolute w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden"
              style={{ transform: `translateZ(${depth / 2}px)` }}
            >
              <Image src="/front.png" alt="Front" fill style={{ objectFit: 'cover' }} />
            </div>

            {/* Back */}
            <div
              className="absolute w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden"
              style={{
                transform: `rotateY(180deg) rotateZ(180deg) translateZ(${depth / 2}px)`,
              }}
            >
              <Image src="/back.svg" alt="Back" fill style={{ objectFit: 'cover' }} />
            </div>

            {/* Right */}
            <div
              className="absolute bg-gray-800"
              style={{
                width: `${depth}px`,
                height: `${height}px`,
                left: `calc(50% - ${depth / 2}px)`,
                transform: `rotateY(90deg) translateZ(${width / 2}px)`,
              }}
            />

            {/* Left */}
            <div
              className="absolute bg-gray-800"
              style={{
                width: `${depth}px`,
                height: `${height}px`,
                left: `calc(50% - ${depth / 2}px)`,
                transform: `rotateY(-90deg) translateZ(${width / 2}px)`,
              }}
            />

            {/* Top */}
            <div
              className="absolute bg-gray-700"
              style={{
                width: `${width}px`,
                height: `${depth}px`,
                top: `calc(50% - ${depth / 2}px)`,
                transform: `rotateX(90deg) translateZ(${height / 2}px)`,
              }}
            />

            {/* Bottom */}
            <div
              className="absolute bg-gray-700"
              style={{
                width: `${width}px`,
                height: `${depth}px`,
                top: `calc(50% - ${depth / 2}px)`,
                transform: `rotateX(-90deg) translateZ(${height / 2}px)`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
        <div className=''>
          <p className="text-lg font-medium mb-2">🖱️ scroll</p>
          <p className="text-sm opacity-75">Rotate the business card to see both sides</p>
        </div>
      </div>
    </div>
  );
}