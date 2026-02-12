'use client';

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Star, MessageCircle } from "lucide-react";
import { PRODUCT_DATA } from "@/lib/mockData";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { useRouter } from "next/navigation";

export default function ProductPage() {
    const router = useRouter();

    const handleBuyNow = () => {
        router.push('/checkout');
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8">

                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-black hover:underline">홈</Link>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <Link href="/" className="hover:text-black hover:underline">스키 강습</Link>
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
                            <span className="text-sm font-medium underline text-blue-600 cursor-pointer">리뷰 {PRODUCT_DATA.reviewCount}개</span>
                        </div>

                        <div className="flex items-baseline gap-3 mb-8 pb-8 border-b">
                            <span className="text-3xl font-bold">{PRODUCT_DATA.price.toLocaleString()}</span>
                            <span className="text-lg">원</span>
                            <span className="text-lg text-muted-foreground line-through ml-2">{PRODUCT_DATA.originalPrice.toLocaleString()} 원</span>
                            <span className="text-xl text-accent font-bold ml-auto">{PRODUCT_DATA.discountRate}% 할인</span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex">
                                <span className="w-24 text-muted-foreground">배송</span>
                                <span className="font-medium text-green-600">없음 (E-티켓)</span>
                            </div>
                            <div className="flex">
                                <span className="w-24 text-muted-foreground">장소</span>
                                <span>하이원 리조트, 강원도</span>
                            </div>
                        </div>

                        {/* 구매 및 상담 버튼 */}
                        <div className="mt-auto space-y-4">
                            {/* 안내 메시지 */}
                            <div className="bg-blue-50 p-4 rounded-sm border border-blue-200">
                                <div className="flex items-start gap-2">
                                    <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-900 mb-1">
                                            강습 옵션 상담
                                        </p>
                                        <p className="text-xs text-blue-700">
                                            결제 후 채널톡으로 강습 일정, 레벨, 시간대를 상담해드립니다.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 가격 요약 */}
                            <div className="bg-gray-50 p-4 rounded-sm border">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-muted-foreground">총 결제금액</span>
                                    <span className="text-2xl font-bold text-accent">
                                        {PRODUCT_DATA.price.toLocaleString()} 원
                                    </span>
                                </div>
                                
                                <div className="hidden lg:grid grid-cols-2 gap-2">
                                    <a
                                        href="https://rideordie.channel.io/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-3 border border-black font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span>상담하기</span>
                                    </a>
                                    <button
                                        onClick={handleBuyNow}
                                        className="py-3 bg-black text-white font-bold hover:bg-gray-900 transition-colors shadow-lg shadow-black/20"
                                    >
                                        바로 구매
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Detail Content with Tabs */}
                <div>
                    {/* Tabs */}
                    <div className="sticky top-16 z-40 bg-white border-b flex mb-8">
                        <button className="flex-1 py-4 text-center font-bold border-b-2 border-black text-black">상세정보</button>
                        <button className="flex-1 py-4 text-center font-medium text-muted-foreground hover:text-black transition-colors">리뷰 ({PRODUCT_DATA.reviewCount})</button>
                        <button className="flex-1 py-4 text-center font-medium text-muted-foreground hover:text-black transition-colors">Q&A</button>
                        <button className="flex-1 py-4 text-center font-medium text-muted-foreground hover:text-black transition-colors">교환/반품 안내</button>
                    </div>

                    {/* Detail Image */}
                    <div className="w-full relative min-h-[1000px] flex justify-center bg-gray-50 mb-12">
                        <div className="w-full max-w-4xl">
                            <Image
                                src={PRODUCT_DATA.images.detail}
                                alt="상품 상세"
                                width={1200}
                                height={5000}
                                className="w-full h-auto"
                                unoptimized
                            />
                        </div>
                    </div>

                    {/* Return/Exchange Info Block */}
                    <div className="bg-gray-50 p-8 rounded-sm text-sm text-muted-foreground space-y-2">
                        <h3 className="font-bold text-black mb-4 text-lg">예약 변경 및 취소 안내</h3>
                        <p>· 예약일 3일 전까지 날짜/시간 변경 시 위약금 없이 변경 가능합니다.</p>
                        <p>· 강습 당일 취소 시 환불되지 않습니다.</p>
                        <p>· 기상 악화 등 긴급 변경이 필요하시면 고객센터로 연락해 주세요.</p>
                    </div>
                </div>

                {/* Mobile Floating Action Bar */}
                <div className="fixed inset-x-0 bottom-0 z-40 bg-white border-t lg:hidden">
                    <div className="container mx-auto px-4 py-3 flex gap-2">
                        <a
                            href="https://rideordie.channel.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 border border-black font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>상담하기</span>
                        </a>
                        <button
                            onClick={handleBuyNow}
                            className="flex-1 py-3 bg-black text-white font-bold hover:bg-gray-900 transition-colors shadow-lg shadow-black/20"
                        >
                            바로 구매
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
