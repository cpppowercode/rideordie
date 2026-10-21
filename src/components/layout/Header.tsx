import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { CHANNEL_URL, PRODUCT_DATA } from "@/lib/mockData";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-line bg-white/90 backdrop-blur">
            <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                <nav className="hidden items-center gap-6 text-[15px] font-medium text-muted md:flex">
                    <Link href={`/product/${PRODUCT_DATA.id}`} className="hover:text-ink">강습 안내</Link>
                    <Link href="/#faq" className="hover:text-ink">자주 묻는 질문</Link>
                    <Link href="/service-policy" className="hover:text-ink">이용약관</Link>
                </nav>

                <Link href="/" aria-label="RideOrDie 홈" className="absolute left-1/2 -translate-x-1/2">
                    <Image src="/logo.svg" alt="RideOrDie" width={80} height={40} className="h-10 w-20" priority />
                </Link>

                <a
                    href={CHANNEL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/85"
                >
                    <MessageCircle className="h-4 w-4" />
                    상담하기
                </a>
            </div>
        </header>
    );
}
