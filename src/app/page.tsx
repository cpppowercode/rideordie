import Link from "next/link";
import Image from "next/image";
import { PRODUCT_DATA } from "@/lib/mockData";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="relative h-[60vh] w-full bg-black overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-60">
                    <Image
                        src={PRODUCT_DATA.images.main}
                        alt="하이원 스키 강습"
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
                        하이원 리조트 스키·스노보드 강습
                    </p>
                    <Link
                        href={`/product/${PRODUCT_DATA.id}`}
                        className="px-8 py-4 bg-accent text-white font-bold text-lg uppercase tracking-wider hover:bg-accent/90 transition-all"
                    >
                        강습 안내
                    </Link>
                </div>
            </section>

            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="mb-10 border-b pb-4 border-black/10">
                        <h2 className="text-3xl font-bold tracking-tight">강습</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Link href={`/product/${PRODUCT_DATA.id}`} className="group block">
                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-4">
                                <Image
                                    src={PRODUCT_DATA.images.main}
                                    alt={PRODUCT_DATA.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-medium leading-tight group-hover:underline decoration-1 underline-offset-4">
                                    {PRODUCT_DATA.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xl font-bold">{PRODUCT_DATA.price.toLocaleString()} 원</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-secondary">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold uppercase tracking-wider">공인 강사</h3>
                        <p className="text-sm text-muted-foreground">자격 보유 강사진이 레벨에 맞춰 진행합니다.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold uppercase tracking-wider">맞춤 커리큘럼</h3>
                        <p className="text-sm text-muted-foreground">입문부터 상급까지 실력에 맞는 강습.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold uppercase tracking-wider">상담 후 결제</h3>
                        <p className="text-sm text-muted-foreground">일정 확인 뒤에만 결제가 진행됩니다.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
