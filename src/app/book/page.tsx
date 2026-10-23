import { BookingForm } from "@/components/booking/BookingForm";

export default function BookPage() {
  return (
    <div className="bg-snow">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <p className="eyebrow">라이드올다이</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">강습 예약</h1>
        <p className="mt-3 max-w-2xl text-[17px] text-muted">
          날짜와 시간대를 고르고 연락처를 남겨 주세요. 예약은 바로 접수되고, 사장님이 확인 후 연락드립니다.
        </p>
        <div className="mt-8">
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
