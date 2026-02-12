import Link from "next/link";
import { Search, ShoppingBag, Menu } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Mobile Menu & Logo */}
                <div className="flex items-center gap-4">
                    <button className="lg:hidden p-2 -ml-2 hover:bg-secondary rounded-md">
                        <Menu className="h-6 w-6" />
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tighter uppercase border-2 border-black px-2 py-0.5">
                            RideOrDie
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
                    <Link href="/" className="hover:text-primary transition-colors">베스트</Link>
                    <Link href="/" className="hover:text-primary transition-colors">신상</Link>
                    <Link href="/" className="text-accent hover:text-accent/80 transition-colors">세일</Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Search Bar (Visual Only) */}
                    <div className="hidden md:flex items-center relative mr-2">
                        <input
                            type="text"
                            placeholder="검색"
                            className="h-9 w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>

                    <button className="p-2 hover:bg-secondary rounded-full relative">
                        <ShoppingBag className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
                    </button>
                </div>
            </div>
        </header>
    );
}
