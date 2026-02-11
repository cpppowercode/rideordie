import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Star, Share2, Heart } from "lucide-react";
import { PRODUCT_DATA } from "@/lib/mockData";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { OptionSelector } from "@/components/product/OptionSelector";

export default function ProductPage() {
    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8">

                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-black hover:underline">Home</Link>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <Link href="/" className="hover:text-black hover:underline">Ski Lessons</Link>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <span className="font-medium text-black truncate max-w-[200px]">{PRODUCT_DATA.title}</span>
                </nav>

                {/* Top Section: Gallery & Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                    {/* Left: Gallery */}
                    <ProductImageGallery />

                    {/* Right: Info & Options */}
                    <div className="flex flex-col h-full">
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
                            {PRODUCT_DATA.title}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(PRODUCT_DATA.rating) ? 'fill-current' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <span className="text-sm font-medium underline text-blue-600 cursor-pointer">{PRODUCT_DATA.reviewCount} Reviews</span>
                        </div>

                        <div className="flex items-baseline gap-3 mb-8 pb-8 border-b">
                            <span className="text-3xl font-bold">{PRODUCT_DATA.price.toLocaleString()}</span>
                            <span className="text-lg">KRW</span>
                            <span className="text-lg text-muted-foreground line-through ml-2">{PRODUCT_DATA.originalPrice.toLocaleString()} KRW</span>
                            <span className="text-xl text-accent font-bold ml-auto">{PRODUCT_DATA.discountRate}% OFF</span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex">
                                <span className="w-24 text-muted-foreground">Shipping</span>
                                <span className="font-medium text-green-600">N/A (E-Ticket)</span>
                            </div>
                            <div className="flex">
                                <span className="w-24 text-muted-foreground">Location</span>
                                <span>High1 Resort, Gangwon-do</span>
                            </div>
                        </div>

                        {/* Sticky Options Panel for Desktop - simplistic logic */}
                        <div className="mt-auto">
                            <OptionSelector />
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Detail Content with Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        {/* Tabs */}
                        <div className="sticky top-16 z-40 bg-white border-b flex mb-8">
                            <button className="flex-1 py-4 text-center font-bold border-b-2 border-black text-black">Detail</button>
                            <button className="flex-1 py-4 text-center font-medium text-muted-foreground hover:text-black transition-colors">Reviews ({PRODUCT_DATA.reviewCount})</button>
                            <button className="flex-1 py-4 text-center font-medium text-muted-foreground hover:text-black transition-colors">Q&A</button>
                            <button className="flex-1 py-4 text-center font-medium text-muted-foreground hover:text-black transition-colors">Return Info</button>
                        </div>

                        {/* Detail Image */}
                        <div className="w-full relative min-h-[1000px] flex justify-center bg-gray-50 mb-12">
                            {/* Using unoptimized to allow creating large images without blur, 
                        assuming detailPage.png is already optimized or handled by Next.js */}
                            <div className="w-full max-w-4xl">
                                <Image
                                    src={PRODUCT_DATA.images.detail}
                                    alt="Product Detail"
                                    width={1200}
                                    height={5000} // Approximate large height
                                    className="w-full h-auto"
                                    unoptimized
                                />
                            </div>
                        </div>

                        {/* Return/Exchange Info Block */}
                        <div className="bg-gray-50 p-8 rounded-sm text-sm text-muted-foreground space-y-2">
                            <h3 className="font-bold text-black mb-4 text-lg">Modification & Auto-Confirm</h3>
                            <p>· Modifications to the reservation date/time are allowed up to 3 days prior without penalty.</p>
                            <p>· Cancellations made on the day of the lesson are non-refundable.</p>
                            <p>· Please contact support for urgent changes due to weather conditions.</p>
                        </div>
                    </div>

                    {/* Right Side Sticky Scroller (Optional/Empty for now as Options are above) */}
                    <div className="hidden lg:block lg:col-span-1">
                        {/* Can put a mini-cart or related items here */}
                        <div className="sticky top-24 border p-4 rounded-sm shadow-sm bg-white">
                            <h4 className="font-bold mb-4">Best Sellers</h4>
                            <Link href="#" className="flex gap-4 mb-4 group">
                                <div className="relative w-24 aspect-square bg-gray-100">
                                    <Image src={PRODUCT_DATA.images.main} alt="thumb" fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium line-clamp-2 group-hover:underline">Premium Ski Lesson 1:1</p>
                                    <p className="text-sm font-bold mt-1">150,000 KRW</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
