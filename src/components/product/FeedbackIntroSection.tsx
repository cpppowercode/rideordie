import Image from "next/image";
import { LESSON_PHOTOS } from "@/lib/site";

const EXAMPLE_PHOTOS = [
  { src: LESSON_PHOTOS.lesson, alt: "강습 사진 예시 1" },
  { src: LESSON_PHOTOS.carve, alt: "강습 사진 예시 2" },
  { src: LESSON_PHOTOS.jump, alt: "강습 사진 예시 3" },
  { src: LESSON_PHOTOS.lift, alt: "강습 사진 예시 4" },
] as const;

export function FeedbackIntroSection() {
  return (
    <section
      id="feedback-intro"
      className="mb-12"
      aria-labelledby="feedback-intro-title"
      data-testid="feedback-intro"
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
        <div className="min-w-0">
          <h2
            id="feedback-intro-title"
            className="text-[20px] font-bold leading-snug tracking-tight md:text-[24px]"
          >
            강습이 끝나면 글과 사진으로 남겨 드려요
          </h2>
          <p className="mt-3 max-w-[52ch] text-[17px] leading-7 text-muted">
            강습이 끝나면 강사가 그날 배운 내용을 글로 정리하고, 사진도 함께 올려 드려요. 회차마다 최대 20장까지, 피드백 페이지에서 사진을 크게 보고 내려받을 수도 있어요.
          </p>
        </div>

        <div className="min-w-0 rounded-[16px] border border-line bg-white p-5 md:p-6">
          <p className="text-[14px] font-medium text-muted">피드백 화면 예시</p>
          <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className="text-[20px] font-bold tracking-tight">2회차</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[15px] text-muted">
              <time dateTime="2026-12-13">2026.12.13</time>
              <span>담당 강사</span>
            </div>
          </div>
          <div className="mt-4 min-w-0">
            <h4 className="text-[14px] font-bold">그날 종합 피드백</h4>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink">
              지난주보다 속도를 훨씬 편하게 다뤄요. 스노우플라우턴은 이제 할 수 있어요.
            </p>
          </div>
          <div className="mt-4 min-w-0">
            <h4 className="text-[14px] font-bold">사진</h4>
            <ul className="mt-2.5 grid grid-cols-4 gap-2">
              {EXAMPLE_PHOTOS.map((photo) => (
                <li key={photo.src} className="min-w-0">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-snow">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <span className="btn-ghost pointer-events-none min-h-10 flex-none px-4 text-[15px]">
                사진 모두 받기
              </span>
            </div>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            예시 화면이에요. 이름은 넣지 않았고, 사진은 아이 얼굴이 보이지 않는 강습 사진입니다.
          </p>
        </div>
      </div>
    </section>
  );
}
