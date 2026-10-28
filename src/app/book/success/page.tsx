import Link from 'next/link';
import { Check, XCircle } from 'lucide-react';
import { KakaoConsultLink } from '@/components/seo/KakaoConsultLink';
import { readBookingReceipt } from '@/lib/booking-intent';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function BookSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = typeof params.r === 'string' ? params.r : '';
  // 서버가 결제 승인 후 서명한 영수증이 있을 때만 '접수' 화면을 보여 준다. URL만 고쳐서는 이 화면이 나오지 않는다.
  const receipt = readBookingReceipt(token);

  if (!receipt) {
    return (
      <div className="bg-snow" data-testid="booking-not-confirmed">
        <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center px-5 py-16 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight">결제가 확인되지 않았어요</h1>
          <p className="mt-3 text-[16px] leading-7 text-muted">
            결제가 끝나야 예약이 접수됩니다. 결제 화면에서 다시 진행해 주세요.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3">
            <Link href="/checkout" className="btn-primary min-h-14">다시 결제하기</Link>
            <KakaoConsultLink className="btn-ghost min-h-14">카톡 상담</KakaoConsultLink>
          </div>
        </div>
      </div>
    );
  }

  const orderNo = receipt.orderNo;
  const date = receipt.date;
  const resort = receipt.resort;
  const time = receipt.time;
  const name = receipt.name;
  const people = String(receipt.people);
  const amount = receipt.amount;

  return (
    <div className="bg-snow" data-testid="booking-success">
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center px-5 py-16 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgba(49,130,246,0.35)]">
          <Check className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <p className="eyebrow">예약 접수</p>
        <h1 className="mt-2 text-[32px] font-bold tracking-tight md:text-[40px]">예약이 접수됐어요</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted">
          결제가 확인됐어요. 남겨 주신 번호로 일정 확인 연락을 드립니다.
        </p>

        <dl className="mt-8 w-full overflow-hidden rounded-[24px] bg-white text-left shadow-[0_8px_30px_rgba(25,31,40,0.04)]">
          {orderNo && (
            <div className="flex justify-between gap-4 border-b border-line px-5 py-4">
              <dt className="text-[15px] text-muted">예약번호</dt>
              <dd className="font-semibold" data-testid="success-order-no">{orderNo}</dd>
            </div>
          )}
          {name && (
            <div className="flex justify-between gap-4 border-b border-line px-5 py-4">
              <dt className="text-[15px] text-muted">이름</dt>
              <dd className="font-semibold">{name}</dd>
            </div>
          )}
          {date && (
            <div className="flex justify-between gap-4 border-b border-line px-5 py-4">
              <dt className="text-[15px] text-muted">날짜</dt>
              <dd className="font-semibold">{date}</dd>
            </div>
          )}
          {time && (
            <div className="flex justify-between gap-4 border-b border-line px-5 py-4">
              <dt className="text-[15px] text-muted">시간</dt>
              <dd className="font-semibold">{time}</dd>
            </div>
          )}
          {resort && (
            <div className="flex justify-between gap-4 border-b border-line px-5 py-4">
              <dt className="text-[15px] text-muted">스키장</dt>
              <dd className="font-semibold">{resort}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-b border-line px-5 py-4">
            <dt className="text-[15px] text-muted">결제금액</dt>
            <dd className="font-semibold" data-testid="success-amount">{amount.toLocaleString('ko-KR')}원</dd>
          </div>
          {people && (
            <div className="flex justify-between gap-4 px-5 py-4">
              <dt className="text-[15px] text-muted">인원</dt>
              <dd className="font-semibold">{people}명</dd>
            </div>
          )}
        </dl>

        <div className="mt-8 flex w-full flex-col gap-3">
          <KakaoConsultLink className="btn-ghost min-h-14">
            카톡 상담
          </KakaoConsultLink>
          <Link href="/" className="btn-primary min-h-14">홈으로</Link>
        </div>
      </div>
    </div>
  );
}
