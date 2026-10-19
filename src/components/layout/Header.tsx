import Link from "next/link";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tighter uppercase border-2 border-black px-2 py-0.5">
                        RideOrDie
                    </span>
                </Link>

                <nav className="flex items-center gap-4 text-sm font-medium sm:gap-6">
                    <Link href={`/product/ski-lesson-premium`} className="hover:text-primary transition-colors">
                        강습 안내
                    </Link>
                    <Link href="/service-policy" className="hover:text-primary transition-colors">
                        이용약관
                    </Link>
                    <a
                        href="https://rideordie.channel.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                    >
                        상담
                    </a>
                </nav>
            </div>
        </header>
    );
}
