'use client';

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#1A1A1A]">
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 `}
      >
        <div className="text-center text-white">
          <div className="text-4xl md:text-6xl font-bold mb-4 tracking-wider">
            개발중
          </div>
          <div className="text-2xl md:text-4xl font-light mb-2 tracking-widest">
            —
          </div>
          <div className="text-xl md:text-3xl font-medium mb-2 tracking-wide">
            coming soon
          </div>
          <div className="text-lg md:text-2xl font-light tracking-wider">
            2025.11.
          </div>
        </div>
      </div>
    </main>
  );
}