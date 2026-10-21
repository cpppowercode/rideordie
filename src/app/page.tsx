import Link from "next/link";
import Image from "next/image";
import { CHANNEL_URL, PRODUCT_DATA } from "@/lib/mockData";

const STEPS = [
    "채널톡으로 희망 날짜, 실력, 인원을 알려주세요.",
    "레벨에 맞는 강습 유형과 시간을 함께 정합니다.",
    "확정된 내용으로 결제하고, 당일 하이원에서 만납니다.",
];

const FAQ = [
    { q: "상담 없이 바로 결제할 수 있나요?", a: "아니요. 채널톡으로 일정·레벨·시간을 먼저 확인한 뒤에만 결제가 진행됩니다. 상담 없이 결제하면 일정 조율과 환불이 어려울 수 있습니다." },
    { q: "강습은 어디서 진행하나요?", a: "강원도 하이원 리조트 현장에서 진행합니다." },
    { q: "스키를 처음 타는데 괜찮을까요?", a: "네. 입문(첫 스키)부터 상급(카빙)까지 실력에 맞춰 진행합니다." },
    { q: "일정을 바꾸거나 취소하고 싶어요.", a: "예약일 3일 전까지는 위약금 없이 날짜·시간을 변경할 수 있습니다. 강습 당일 취소는 환불되지 않습니다. 기상 악화 등 긴급한 경우 고객센터로 연락해 주세요." },
];

export default function Home() {
    return (
        <div className="flex flex-col">
            <section className="relative isolate bg-ink text-white">
                <Image
                    src={PRODUCT_DATA.images.sub[0]}
                    alt="하이원 슬로프 위 강습생"
                    fill
                    priority
                    className="-z-10 object-cover object-center"
                />
                <div className="absolute inset-0 -z-10 bg-black/45" />

                <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-32 md:pb-20">
                    <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                        하이원 스키·스노보드 강습
                    </h1>
                    <p className="mt-4 max-w-xl text-lg text-white/85 md:text-xl">
                        입문부터 상급까지, 레벨에 맞춰 1:1 또는 소그룹으로 진행합니다.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link href={`/product/${PRODUCT_DATA.id}`} className="btn bg-white px-7 text-ink hover:bg-snow">
                            강습 안내 보기
                        </Link>
                        <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="btn border border-white/60 px-7 text-white hover:bg-white/10">
                            채널톡 상담
                        </a>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
                <div className="relative aspect-square overflow-hidden rounded-xl">
                    <Image src={PRODUCT_DATA.images.main} alt={PRODUCT_DATA.title} fill className="object-cover" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold md:text-3xl">강습 안내</h2>
                    <dl className="mt-6 divide-y divide-line border-y border-line text-[17px]">
                        <div className="flex gap-6 py-4">
                            <dt className="w-20 shrink-0 text-muted">장소</dt>
                            <dd>하이원 리조트, 강원도</dd>
                        </div>
                        {PRODUCT_DATA.options.map((opt) => (
                            <div key={opt.id} className="flex gap-6 py-4">
                                <dt className="w-20 shrink-0 text-muted">{opt.name}</dt>
                                <dd>{opt.values.join(" · ")}</dd>
                            </div>
                        ))}
                        <div className="flex gap-6 py-4">
                            <dt className="w-20 shrink-0 text-muted">강습비</dt>
                            <dd className="font-bold">{PRODUCT_DATA.price.toLocaleString()}원</dd>
                        </div>
                    </dl>
                    <Link href={`/product/${PRODUCT_DATA.id}`} className="btn-dark mt-8">
                        자세히 보기
                    </Link>
                </div>
            </section>

            <section className="bg-snow py-16 md:py-24">
                <div className="mx-auto max-w-6xl px-4">
                    <h2 className="text-2xl font-bold md:text-3xl">예약 방법</h2>
                    <ol className="mt-8 grid gap-8 md:grid-cols-3">
                        {STEPS.map((step, i) => (
                            <li key={step} className="border-t-2 border-ink pt-4 text-[17px] leading-relaxed">
                                <span className="mb-2 block font-bold">{i + 1}단계</span>
                                {step}
                            </li>
                        ))}
                    </ol>
                    <p className="mt-10 text-[17px] text-muted">
                        부모님 전화 상담도 가능합니다. 연중 무휴{" "}
                        <a href="tel:010-2028-2744" className="font-semibold text-ink underline">010-2028-2744</a>
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
                <h2 className="text-2xl font-bold md:text-3xl">강습 사진</h2>
                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {PRODUCT_DATA.images.sub.slice(0, 4).map((src, i) => (
                        <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-xl">
                            <Image src={src} alt={`강습 현장 ${i + 1}`} fill className="object-cover" sizes="(min-width: 768px) 25vw, 50vw" />
                        </div>
                    ))}
                </div>
            </section>

            <section id="faq" className="scroll-mt-20 mx-auto w-full max-w-3xl px-4 pb-16 md:pb-24">
                <h2 className="text-2xl font-bold md:text-3xl">자주 묻는 질문</h2>
                <div className="mt-6 border-t border-line">
                    {FAQ.map(({ q, a }) => (
                        <details key={q} className="group border-b border-line py-5">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                                {q}
                                <span className="text-xl text-muted group-open:hidden">+</span>
                                <span className="hidden text-xl text-muted group-open:inline">−</span>
                            </summary>
                            <p className="mt-3 text-[17px] leading-relaxed text-muted">{a}</p>
                        </details>
                    ))}
                </div>
            </section>
        </div>
    );
}
