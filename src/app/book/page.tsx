import { BookingForm } from "@/components/booking/BookingForm";

export default function BookPage() {
  return (
    <div className="bg-snow" data-testid="book-page">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <p className="eyebrow">라이드올다이</p>
        <h1 className="mt-2 text-[32px] font-bold tracking-tight md:text-[40px]">강습 예약</h1>
        <p className="mt-3 max-w-xl text-[16px] leading-7 text-muted">
          날짜와 시간대를 고르고 연락처만 남기면 끝나요. 예약은 바로 접수되고, 사장님이 확인 후 연락드립니다.
        </p>
        <div className="mt-10">
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
