import Link from "next/link";
import Image from "next/image";
import { PRODUCT_DATA } from "@/lib/mockData";
import { Star } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] w-full bg-black overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-60">
                    {/* Placeholder for a hero background if we had one, for now using black/gray pattern or we can reuse mainThumb blurred */}
                    <Image
                        src={PRODUCT_DATA.images.main}
                        alt="Hero Background"
                        fill
                        className="object-cover object-center blur-sm scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>

                <div className="relative z-10 container mx-auto h-full flex flex-col justify-center items-center text-center text-white p-4">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4 drop-shadow-xl">
                        Ride Or Die
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide mb-8 max-w-2xl drop-shadow-md">
                        Premium Ski & Snowboard Coaching
                    </p>
                    <Link
                        href={`/product/${PRODUCT_DATA.id}`}
                        className="px-8 py-4 bg-accent text-white font-bold text-lg uppercase tracking-wider hover:bg-accent/90 transition-all transform hover:scale-105"
                    >
                        Start Your Journey
                    </Link>
                </div>
            </section>

            {/* Featured Products (Since we only have one, we make it prominent) */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10 border-b pb-4 border-black/10">
                        <h2 className="text-3xl font-bold tracking-tight">Featured Lessons</h2>
                        <Link href="/" className="text-sm font-medium underline underline-offset-4">View All</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Product Card */}
                        <Link href={`/product/${PRODUCT_DATA.id}`} className="group block">
                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-4">
                                <Image
                                    src={PRODUCT_DATA.images.main}
                                    alt={PRODUCT_DATA.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 uppercase">
                                    Best Seller
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-medium leading-tight group-hover:underline decoration-1 underline-offset-4">
                                    {PRODUCT_DATA.title}
                                </h3>
                                <div className="flex items-center gap-1 text-sm text-yellow-500">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(PRODUCT_DATA.rating) ? 'fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <span className="text-muted-foreground ml-1 text-xs">({PRODUCT_DATA.reviewCount})</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xl font-bold">{PRODUCT_DATA.price.toLocaleString()} KRW</span>
                                    <span className="text-sm text-muted-foreground line-through">{PRODUCT_DATA.originalPrice.toLocaleString()} KRW</span>
                                    <span className="text-sm text-accent font-bold">{PRODUCT_DATA.discountRate}%</span>
                                </div>
                            </div>
                        </Link>

                        {/* Mocking other cards to fill the aesthetic, typically a smart store has more than one item */}
                        {[1, 2].map((i) => (
                            <div key={i} className="group block opacity-70 pointer-events-none grayscale">
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-4 flex items-center justify-center">
                                    <span className="text-muted-foreground">Coming Soon</span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-medium leading-tight text-muted-foreground">
                                        Advanced Techniques Vol.{i}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xl font-bold text-muted-foreground">Sold Out</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Brand Values / Trust Signals */}
            <section className="py-16 bg-secondary">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-4xl">
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold uppercase tracking-wider">Certified Pros</h3>
                        <p className="text-sm text-muted-foreground">Elite instructors with Level 2+ certifications.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold uppercase tracking-wider">Custom Curriculum</h3>
                        <p className="text-sm text-muted-foreground">Tailored lessons matching your exact skill level.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold uppercase tracking-wider">Safety First</h3>
                        <p className="text-sm text-muted-foreground">Comprehensive insurance and safety protocols.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
