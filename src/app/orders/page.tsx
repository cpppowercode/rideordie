"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { KakaoConsultLink } from "@/components/seo/KakaoConsultLink";
import {
  paymentStatusLabel,
  reservationStatusLabel,
  type OrderLookupPublic,
} from "@/lib/order-lookup";

const inputClass =
  "w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[16px] outline-none transition-colors focus:border-brand";

export default function OrdersLookupPage() {
  const [orderNo, setOrderNo] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<OrderLookupPublic | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBooking(null);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNo, customerPhone }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        booking?: OrderLookupPublic;
      };
      if (!res.ok || !data.booking) {
        setError(data.error || "예약 내역을 찾지 못했습니다.");
        return;
      }
      setBooking(data.booking);
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-snow" data-testid="orders-lookup-page">
      <div className="mx-auto max-w-lg px-5 py-12 md:py-16">
        <p className="text-[13px] font-semibold text-brand">예약 조회</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] md:text-[36px]">
          예약 내역 보기
        </h1>
        <p className="mt-3 text-[16px] leading-7 text-muted">
          결제 시 받은 주문번호와 예약할 때 남긴 휴대폰 번호로 조회합니다. 정보는 주소창에
          붙지 않고 안전하게 확인합니다.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-[16px] bg-white p-5 shadow-[0_8px_30px_rgba(25,31,40,0.04)] md:p-6"
          data-testid="orders-lookup-form"
        >
          <label className="block">
            <span className="mb-1.5 block text-[15px] font-medium">주문번호</span>
            <input
              type="text"
              name="orderNo"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              className={inputClass}
              placeholder="WEB_…"
              autoComplete="off"
              required
              data-testid="orders-input-order-no"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[15px] font-medium">연락처</span>
            <input
              type="tel"
              name="customerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className={inputClass}
              placeholder="010-1234-5678"
              autoComplete="tel"
              required
              data-testid="orders-input-phone"
            />
          </label>
          {error ? (
            <p className="rounded-[10px] bg-red-50 px-4 py-3 text-[15px] text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn-primary w-full min-h-12"
            disabled={loading}
            data-testid="orders-lookup-submit"
          >
            {loading ? "조회 중…" : "예약 내역 조회"}
          </button>
        </form>

        {booking ? (
          <div
            className="mt-6 overflow-hidden rounded-[16px] bg-white shadow-[0_8px_30px_rgba(25,31,40,0.04)]"
            data-testid="orders-lookup-result"
          >
            <dl className="divide-y divide-line text-left">
              <div className="flex justify-between gap-4 px-5 py-4">
                <dt className="text-[15px] text-muted">주문번호</dt>
                <dd className="font-semibold" data-testid="orders-result-order-no">
                  {booking.orderNo}
                </dd>
              </div>
              {booking.lessonDate ? (
                <div className="flex justify-between gap-4 px-5 py-4">
                  <dt className="text-[15px] text-muted">날짜</dt>
                  <dd className="font-semibold">{booking.lessonDate}</dd>
                </div>
              ) : null}
              {booking.timeLabel ? (
                <div className="flex justify-between gap-4 px-5 py-4">
                  <dt className="text-[15px] text-muted">시간</dt>
                  <dd className="font-semibold">{booking.timeLabel}</dd>
                </div>
              ) : null}
              {booking.skiResort ? (
                <div className="flex justify-between gap-4 px-5 py-4">
                  <dt className="text-[15px] text-muted">스키장</dt>
                  <dd className="font-semibold">{booking.skiResort}</dd>
                </div>
              ) : null}
              {booking.lessonType ? (
                <div className="flex justify-between gap-4 px-5 py-4">
                  <dt className="text-[15px] text-muted">종목</dt>
                  <dd className="font-semibold">{booking.lessonType}</dd>
                </div>
              ) : null}
              {booking.participants != null ? (
                <div className="flex justify-between gap-4 px-5 py-4">
                  <dt className="text-[15px] text-muted">인원</dt>
                  <dd className="font-semibold">{booking.participants}명</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 px-5 py-4">
                <dt className="text-[15px] text-muted">예약 상태</dt>
                <dd className="font-semibold">{reservationStatusLabel(booking.reservationStatus)}</dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-4">
                <dt className="text-[15px] text-muted">결제 상태</dt>
                <dd className="font-semibold">{paymentStatusLabel(booking.paymentStatus)}</dd>
              </div>
            </dl>
            {booking.detailUrl ? (
              <div className="border-t border-line px-5 py-4">
                <a
                  href={booking.detailUrl}
                  className="btn-ghost w-full min-h-12"
                  data-testid="orders-detail-link"
                >
                  자세히 보기
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3">
          <KakaoConsultLink className="btn-ghost min-h-12">카톡 상담</KakaoConsultLink>
          <Link href="/book" className="btn-primary min-h-12">
            새 예약하기
          </Link>
        </div>
      </div>
    </div>
  );
}
