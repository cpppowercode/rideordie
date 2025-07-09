'use client';

import Link from 'next/link';
import Image from 'next/image';


export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-neutral-900 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <Image 
              src="/rod_mountain.svg" 
              alt="teenagers Logo" 
              className="h-6 w-12"
              width={48}
              height={48}
            />
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-teal-500 text-white hover:bg-teal-600"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 