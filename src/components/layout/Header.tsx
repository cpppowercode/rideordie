"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Menu, MessageCircle, X } from "lucide-react";
import { PRODUCT_DATA } from "@/lib/mockData";
import { INSTAGRAM_URL, KAKAO_CONSULT_URL } from "@/lib/site";

const NAV = [
  { href: `/product/${PRODUCT_DATA.id}`, label: "강습 안내" },
  { href: "/book", label: "강습 예약" },
  { href: "/#faq", label: "자주 묻는 질문" },
  { href: "/service-policy", label: "이용약관" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
        <Link href="/" aria-label="RideOrDie 홈" className="shrink-0">
          <Image src="/logo.svg" alt="RideOrDie" width={88} height={40} className="h-9 w-auto" priority />
        </Link>

        <nav className="hidden items-center gap-7 text-[15px] font-medium text-muted md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <a
            href={KAKAO_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="카톡 상담"
            data-testid="header-kakao"
            className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-ink transition-colors hover:bg-snow"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline">카톡 상담</span>
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="인스타그램"
            data-testid="header-instagram"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-snow"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <Link
            href="/book"
            data-testid="header-book"
            className="hidden h-11 items-center rounded-full bg-brand px-5 text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(49,130,246,0.25)] transition-colors hover:bg-brand-dark sm:inline-flex"
          >
            예약하기
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-snow md:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-[16px] font-medium hover:bg-snow"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={KAKAO_CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="btn-ghost mt-2"
            >
              카톡 상담
            </a>
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2"
            >
              예약하기
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
