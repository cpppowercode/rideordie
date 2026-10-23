import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/BookingForm";
import { bookingValueFromResortQuery } from "@/lib/resort-landings";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "강습 예약",
  description:
    "라이드올다이 스키·보드 강습 예약. 1:1·2:1·3:1, 1:1 2시간 정가 15만원. 숙소·리프트권·장비 별도. 카톡 상담도 가능합니다.",
  alternates: { canonical: `${SITE_URL}/book` },
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ resort?: string }>;
}) {
  const { resort } = await searchParams;
  const initialResort = bookingValueFromResortQuery(resort);

  return (
    <div className="bg-snow" data-testid="book-page">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <p className="eyebrow">라이드올다이</p>
        <h1 className="mt-2 text-[32px] font-bold tracking-tight md:text-[40px]">강습 예약</h1>
        <p className="mt-3 max-w-xl text-[16px] leading-7 text-muted">
          강습 시간과 시작 시간을 고르고 연락처만 남기면 끝나요. 예약은 바로 접수되고, 확인 후 연락드립니다.
        </p>
        <div className="mt-10">
          <BookingForm initialResort={initialResort} />
        </div>
      </div>
    </div>
  );
}
