import Link from "next/link";
import Image from "next/image";
import { PRODUCT_DATA } from "@/lib/mockData";

const STEPS = [
    "원하시는 날짜와 시간대를 선택합니다.",
    "이름, 연락처, 인원, 스키장을 남겨 예약을 접수합니다.",
    "사장님이 확인 전화를 드리고, 당일 스키장에서 만납니다.",
];

const FAQ = [
    { q: "상담 없이 바로 예약할 수 있나요?", a: "네. 홈페이지에서 날짜와 시간대를 고르면 바로 접수됩니다. 마감된 시간은 선택할 수 없고, 확인 후 연락드립니다." },
    { q: "강습은 어디서 진행하나요?", a: "하이원, 비발디파크, 웰리힐리파크, 용평, 지산, 곤지암, 오투 등 예약 시 선택한 스키장에서 진행합니다." },
    { q: "스키를 처음 타는데 괜찮을까요?", a: "네. 입문(첫 스키)부터 상급(카빙)까지 실력에 맞춰 진행합니다. 아이 강습도 가능합니다." },
    { q: "일정을 바꾸거나 취소하고 싶어요.", a: "예약일 3일 전까지는 위약금 없이 날짜·시간을 변경할 수 있습니다. 강습 당일 취소는 환불되지 않습니다. 기상 악화 등 긴급한 경우 고객센터로 연락해 주세요." },
];

export default function Home() {
    return (
        <div className="flex flex-col">
            <section className="relative isolate bg-ink text-white">
                <Image
                    src={PRODUCT_DATA.images.hero}
                    alt="슬로프에서 스키를 타는 강습 장면"
                    fill
                    priority
                    quality={85}
                    sizes="100vw"
                    className="-z-10 object-cover object-center"
                />
                <div className="absolute inset-0 -z-10 bg-black/45" />

                <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-32 md:pb-20">
                    <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                        스키·스노보드 강습
                    </h1>
                    <p className="mt-4 max-w-xl text-lg text-white/85 md:text-xl">
                        입문부터 상급까지, 레벨에 맞춰 1:1 또는 소그룹으로 진행합니다.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link href="/book" className="btn bg-white px-7 text-ink hover:bg-snow">
                            강습 예약하기
                        </Link>
                        <Link href={`/product/${PRODUCT_DATA.id}`} className="btn border border-white/60 px-7 text-white hover:bg-white/10">
                            강습 안내 보기
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
                <div className="relative aspect-square overflow-hidden rounded-xl">
                    <Image
                        src={PRODUCT_DATA.images.main}
                        alt={PRODUCT_DATA.title}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-bold md:text-3xl">강습 안내</h2>
                    <dl className="mt-6 divide-y divide-line border-y border-line text-[17px]">
                        <div className="flex gap-6 py-4">
                            <dt className="w-20 shrink-0 text-muted">장소</dt>
                            <dd>하이원 · 비발디 · 웰리힐리 · 용평 등</dd>
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
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/book" className="btn-primary">
                            예약하기
                        </Link>
                        <Link href={`/product/${PRODUCT_DATA.id}`} className="btn-dark">
                            자세히 보기
                        </Link>
                    </div>
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
                            <Image
                                src={src}
                                alt={`강습 현장 ${i + 1}`}
                                fill
                                sizes="(min-width: 768px) 25vw, 50vw"
                                className="object-cover"
                            />
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
