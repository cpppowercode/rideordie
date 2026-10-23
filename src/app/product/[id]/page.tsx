'use client';

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, CalendarCheck, MountainSnow, Info } from "lucide-react";
import { PRODUCT_DATA } from "@/lib/mockData";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { useRouter } from "next/navigation";

const FACTS = [
    { icon: MountainSnow, label: "형태", value: "현장 강습 (선택한 스키장)" },
    { icon: MapPin, label: "장소", value: "하이원 · 비발디 · 웰리힐리 · 용평 등" },
    { icon: CalendarCheck, label: "진행", value: "날짜·시간대를 고르면 바로 접수" },
];

export default function ProductPage() {
    const router = useRouter();

    const handleCheckout = () => {
        router.push('/book');
    };

    const actions = (
        <>
            <Link href="/book" className="btn-ghost flex-1">
                강습 안내 후 문의
            </Link>
            <button onClick={handleCheckout} className="btn-primary flex-1">
                예약하기
            </button>
        </>
    );

    return (
        <div className="min-h-screen bg-white pb-28 lg:pb-20">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <nav className="mb-8 flex items-center text-sm text-muted">
                    <Link href="/" className="hover:text-ink">홈</Link>
                    <ChevronRight className="mx-1.5 h-4 w-4" />
                    <span className="max-w-[220px] truncate font-medium text-ink">{PRODUCT_DATA.title}</span>
                </nav>

                <div className="mb-20 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
                    <ProductImageGallery />

                    <div className="flex flex-col">
                        <p className="eyebrow">스키·보드 강습</p>
                        <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight md:text-[40px]">{PRODUCT_DATA.title}</h1>
                        <p className="mt-4 text-[17px] leading-7 text-muted">{PRODUCT_DATA.description}</p>

                        <p className="mt-6">
                            <span className="text-[40px] font-extrabold tracking-tight">{PRODUCT_DATA.price.toLocaleString()}</span>
                            <span className="ml-1 text-xl text-muted">원</span>
                        </p>

                        <ul className="mt-8 divide-y divide-line rounded-[24px] border border-line">
                            {FACTS.map(({ icon: Icon, label, value }) => (
                                <li key={label} className="flex items-center gap-4 px-5 py-4 text-[17px]">
                                    <Icon className="h-5 w-5 shrink-0 text-brand" />
                                    <span className="w-12 shrink-0 text-muted">{label}</span>
                                    <span className="font-medium">{value}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 space-y-3">
                            {PRODUCT_DATA.options.map((opt) => (
                                <div key={opt.id}>
                                    <h3 className="mb-2 text-sm font-bold text-muted">{opt.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {opt.values.map((v) => (
                                            <span key={v} className="rounded-md bg-snow px-3 py-1.5 text-[15px]">{v}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex gap-3 rounded-[20px] bg-ice p-5">
                            <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                            <div>
                                <p className="font-bold">날짜와 시간을 고르면 바로 접수됩니다</p>
                                <p className="mt-1 text-[15px] leading-relaxed text-ink/75">
                                    마감된 시간대는 선택할 수 없습니다. 접수 후 사장님이 확인 전화를 드립니다.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 hidden gap-3 lg:flex">{actions}</div>
                    </div>
                </div>

                <div>
                    <div className="sticky top-16 z-40 mb-8 flex border-b border-line bg-white">
                        <div className="border-b-2 border-ink py-4 font-bold">상세정보</div>
                    </div>

                    <div className="mb-12 grid gap-3 sm:grid-cols-2">
                        {PRODUCT_DATA.images.detail.map((src, i) => (
                            <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-snow sm:aspect-[3/4]">
                                <Image
                                    src={src}
                                    alt={`강습 상세 ${i + 1}`}
                                    fill
                                    sizes="(min-width: 640px) 50vw, 100vw"
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl bg-snow p-8 text-[17px] leading-relaxed text-muted">
                        <h3 className="mb-4 text-xl font-bold text-ink">예약 변경 및 취소 안내</h3>
                        <p>· 예약일 3일 전까지 날짜/시간 변경 시 위약금 없이 변경 가능합니다.</p>
                        <p>· 강습 당일 취소 시 환불되지 않습니다.</p>
                        <p>· 기상 악화 등 긴급 변경이 필요하시면 고객센터(<a href="tel:010-2028-2744" className="font-semibold text-ink underline">010-2028-2744</a>)로 연락해 주세요.</p>
                    </div>
                </div>

                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 backdrop-blur-xl lg:hidden">
                    <div className="mx-auto flex max-w-6xl gap-3 px-4 py-3">{actions}</div>
                </div>
            </div>
        </div>
    );
}
