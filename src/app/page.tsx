import Link from "next/link";
import Image from "next/image";
import { PRODUCT_DATA } from "@/lib/mockData";
import { INSTAGRAM_URL } from "@/lib/site";

const STEPS = [
  { title: "날짜와 시간", body: "원하는 스키장과 시간대를 고릅니다. 마감된 슬롯은 바로 보이지 않아요." },
  { title: "연락처만", body: "이름과 휴대폰 번호, 인원을 남기면 접수가 끝납니다." },
  { title: "확인 전화", body: "사장님이 일정을 확인하고, 당일 스키장에서 만납니다." },
];

const HIGHLIGHTS = [
  { k: "레벨", v: "입문부터 상급 카빙까지" },
  { k: "구성", v: "1:1 · 소그룹 현장 강습" },
  { k: "장소", v: "하이원 · 비발디 · 용평 등" },
  { k: "운영", v: "연중무휴 010-2028-2744" },
];

const FAQ = [
  { q: "상담 없이 바로 예약할 수 있나요?", a: "네. 홈페이지에서 날짜와 시간대를 고르면 바로 접수됩니다. 마감된 시간은 선택할 수 없고, 확인 후 연락드립니다." },
  { q: "강습은 어디서 진행하나요?", a: "하이원, 비발디파크, 웰리힐리파크, 용평, 지산, 곤지암, 오투 등 예약 시 선택한 스키장에서 진행합니다." },
  { q: "스키를 처음 타는데 괜찮을까요?", a: "네. 입문(첫 스키)부터 상급(카빙)까지 실력에 맞춰 진행합니다. 아이 강습도 가능합니다." },
  { q: "일정을 바꾸거나 취소하고 싶어요.", a: "예약일 3일 전까지는 위약금 없이 날짜·시간을 변경할 수 있습니다. 강습 당일 취소는 환불되지 않습니다. 기상 악화 등 긴급한 경우 고객센터로 연락해 주세요." },
];

export default function Home() {
  return (
    <div className="flex flex-col" data-testid="home-page">
      <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-ink text-white">
        <Image
          src={PRODUCT_DATA.images.hero}
          alt="슬로프에서 스키를 타는 강습 장면"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="-z-10 object-cover object-[center_40%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />

        <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-end px-5 pb-10 pt-16 md:pb-24">
          <p className="animate-fade-up text-[13px] font-semibold tracking-[0.18em] text-white/80">
            RIDE OR DIE
          </p>
          <h1 className="animate-fade-up mt-3 max-w-3xl text-[34px] font-bold leading-[1.2] tracking-tight drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] md:mt-4 md:text-[64px] md:leading-[1.15]" style={{ animationDelay: "80ms" }}>
            스키를 가르치는 게 아니라,
            <br />
            라이딩을 가르칩니다.
          </h1>
          <p className="animate-fade-up mt-4 max-w-xl text-[16px] leading-7 text-white/85 md:mt-5 md:text-[20px]" style={{ animationDelay: "160ms" }}>
            입문부터 상급까지, 레벨에 맞춰 1:1 또는 소그룹으로 진행합니다.
            날짜와 시간만 고르면 예약이 끝나요.
          </p>
          <div className="animate-fade-up mt-7 flex flex-col gap-3 sm:flex-row md:mt-9" style={{ animationDelay: "240ms" }}>
            <Link href="/book" className="btn-primary px-8 py-4 text-[18px]" data-testid="home-cta-book">
              강습 예약하기
            </Link>
            <Link
              href={`/product/${PRODUCT_DATA.id}`}
              className="btn border border-white/30 bg-white/10 px-8 py-4 text-[18px] text-white backdrop-blur hover:bg-white/20"
            >
              강습 안내 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-line md:grid-cols-4">
          {HIGHLIGHTS.map((item) => (
            <div key={item.k} className="bg-white px-5 py-7 md:px-8 md:py-9">
              <p className="text-[13px] font-semibold text-muted">{item.k}</p>
              <p className="mt-1.5 text-[16px] font-semibold tracking-tight md:text-[18px]">{item.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:gap-16 md:py-28">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-snow">
          <Image
            src={PRODUCT_DATA.images.main}
            alt={PRODUCT_DATA.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="eyebrow">LESSON</p>
          <h2 className="mt-3 text-[32px] font-bold tracking-tight md:text-[40px]">강습 안내</h2>
          <p className="mt-4 text-[17px] leading-7 text-muted">
            {PRODUCT_DATA.description}
          </p>
          <dl className="mt-8 divide-y divide-line border-y border-line text-[16px]">
            <div className="flex gap-8 py-5">
              <dt className="w-16 shrink-0 text-muted">장소</dt>
              <dd className="font-medium">하이원 · 비발디 · 웰리힐리 · 용평 등</dd>
            </div>
            {PRODUCT_DATA.options.map((opt) => (
              <div key={opt.id} className="flex gap-8 py-5">
                <dt className="w-16 shrink-0 text-muted">{opt.name}</dt>
                <dd className="font-medium">{opt.values.join(" · ")}</dd>
              </div>
            ))}
            <div className="flex gap-8 py-5">
              <dt className="w-16 shrink-0 text-muted">강습비</dt>
              <dd className="text-[22px] font-bold tracking-tight">{PRODUCT_DATA.price.toLocaleString()}원</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="btn-primary">예약하기</Link>
            <Link href={`/product/${PRODUCT_DATA.id}`} className="btn-ghost">자세히 보기</Link>
          </div>
        </div>
      </section>

      <section className="bg-snow py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <p className="eyebrow">HOW TO BOOK</p>
          <h2 className="mt-3 text-[32px] font-bold tracking-tight md:text-[40px]">예약은 세 단계면 끝나요</h2>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-[24px] bg-white p-8 shadow-[0_8px_30px_rgba(25,31,40,0.04)]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ice text-[15px] font-bold text-brand">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-[22px] font-bold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-[16px] leading-7 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-[16px] text-muted">
            부모님 전화 상담도 가능합니다. 연중 무휴{" "}
            <a href="tel:010-2028-2744" className="font-semibold text-ink underline decoration-line underline-offset-4">
              010-2028-2744
            </a>
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">GALLERY</p>
            <h2 className="mt-3 text-[32px] font-bold tracking-tight md:text-[40px]">강습 사진</h2>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-[15px] font-semibold text-brand hover:underline sm:inline"
          >
            인스타그램 보기
          </a>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {PRODUCT_DATA.images.sub.slice(0, 4).map((src, i) => (
            <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-[24px]">
              <Image
                src={src}
                alt={`강습 현장 ${i + 1}`}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 mx-auto w-full max-w-3xl px-5 pb-20 md:pb-28">
        <p className="eyebrow">FAQ</p>
        <h2 className="mt-3 text-[32px] font-bold tracking-tight md:text-[40px]">자주 묻는 질문</h2>
        <div className="mt-8 border-t border-line">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group border-b border-line py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[18px] font-semibold tracking-tight">
                {q}
                <span className="text-2xl font-light text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[16px] leading-7 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink py-16 text-white md:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-[28px] font-bold tracking-tight md:text-[36px]">이번 시즌, 슬로프에서 만나요</h2>
            <p className="mt-3 text-[16px] text-white/70">날짜만 고르면 바로 접수됩니다. 확인 전화는 사장님이 드려요.</p>
          </div>
          <Link href="/book" className="btn-primary px-8 py-4 text-[18px]">
            강습 예약하기
          </Link>
        </div>
      </section>
    </div>
  );
}
