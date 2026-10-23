'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LESSON_SLOTS, LESSON_TYPES, SKI_RESORTS } from '@/lib/site';
import { todayYmd } from '@/lib/booking';

type SlotAvailability = {
  id: string;
  label: string;
  timeLabel: string;
  available: boolean;
  remaining: number;
};

function monthMatrix(year: number, monthIndex: number): (string | null)[][] {
  const first = new Date(year, monthIndex, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const rows: (string | null)[][] = [];
  let day = 1;
  for (let r = 0; r < 6; r += 1) {
    const row: (string | null)[] = [];
    for (let c = 0; c < 7; c += 1) {
      if ((r === 0 && c < startWeekday) || day > daysInMonth) {
        row.push(null);
      } else {
        const m = String(monthIndex + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        row.push(`${year}-${m}-${d}`);
        day += 1;
      }
    }
    rows.push(row);
    if (day > daysInMonth) break;
  }
  return rows;
}

export function BookingForm() {
  const router = useRouter();
  const today = todayYmd();
  const initial = new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [lessonDate, setLessonDate] = useState(today);
  const [skiResort, setSkiResort] = useState<string>(SKI_RESORTS[0].value);
  const [slotId, setSlotId] = useState('');
  const [lessonType, setLessonType] = useState<string>('ski');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [participants, setParticipants] = useState(1);
  const [childCount, setChildCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [slots, setSlots] = useState<SlotAvailability[]>(
    LESSON_SLOTS.map((slot) => ({
      id: slot.id,
      label: slot.label,
      timeLabel: slot.timeLabel,
      available: true,
      remaining: 0,
    }))
  );
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const weeks = useMemo(() => monthMatrix(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthLabel = `${viewYear}년 ${viewMonth + 1}월`;

  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    setError('');
    fetch(`/api/bookings/availability?date=${lessonDate}&skiResort=${encodeURIComponent(skiResort)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '예약 현황을 불러오지 못했습니다.');
        if (!cancelled) {
          setSlots(data.slots);
          setSlotId((current) => {
            const stillOpen = data.slots.find((slot: SlotAvailability) => slot.id === current && slot.available);
            return stillOpen ? current : '';
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '예약 현황을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lessonDate, skiResort]);

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (childCount > participants) {
      setError('아이 인원은 총 인원 이하로 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          participants,
          childCount,
          skiResort,
          lessonType,
          lessonDate,
          slotId,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '예약 접수에 실패했습니다.');
      }
      const params = new URLSearchParams({
        orderNo: data.orderNo,
        date: lessonDate,
        resort: skiResort,
      });
      router.push(`/book/success?${params.toString()}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '예약 접수에 실패했습니다.');
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-line bg-white px-4 py-3.5 text-lg outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="card p-6 md:p-7">
          <h2 className="mb-4 text-xl font-bold">날짜 선택</h2>
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => shiftMonth(-1)} className="btn-ghost px-4 py-2 text-sm">
              이전 달
            </button>
            <p className="font-semibold">{monthLabel}</p>
            <button type="button" onClick={() => shiftMonth(1)} className="btn-ghost px-4 py-2 text-sm">
              다음 달
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm text-muted">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="py-2 font-medium">{day}</div>
            ))}
            {weeks.flat().map((ymd, index) => {
              if (!ymd) return <div key={`e-${index}`} />;
              const disabled = ymd < today;
              const selected = ymd === lessonDate;
              return (
                <button
                  key={ymd}
                  type="button"
                  disabled={disabled}
                  onClick={() => setLessonDate(ymd)}
                  className={`rounded-lg py-2.5 text-[15px] ${
                    selected
                      ? 'bg-brand font-bold text-white'
                      : disabled
                        ? 'cursor-not-allowed text-line'
                        : 'hover:bg-ice'
                  }`}
                >
                  {Number(ymd.slice(-2))}
                </button>
              );
            })}
          </div>
        </section>

        <section className="card p-6 md:p-7">
          <h2 className="mb-4 text-xl font-bold">스키장 · 시간대</h2>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-[15px] font-medium">스키장</span>
            <select value={skiResort} onChange={(e) => setSkiResort(e.target.value)} className={inputClass}>
              {SKI_RESORTS.map((resort) => (
                <option key={resort.value} value={resort.value}>{resort.label}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {slots.map((slot) => {
              const selected = slotId === slot.id;
              const disabled = loadingSlots || !slot.available;
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSlotId(slot.id)}
                  className={`rounded-xl border-2 px-4 py-4 text-left ${
                    selected
                      ? 'border-brand bg-ice'
                      : disabled
                        ? 'cursor-not-allowed border-line bg-snow text-muted'
                        : 'border-line hover:border-brand/40'
                  }`}
                >
                  <span className="block font-bold">{slot.label}</span>
                  <span className="mt-1 block text-sm">{slot.timeLabel}</span>
                  <span className="mt-2 block text-sm text-muted">
                    {loadingSlots ? '확인 중…' : slot.available ? `잔여 ${slot.remaining}팀` : '마감'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card p-6 md:p-7">
          <h2 className="mb-5 text-xl font-bold">예약자 정보</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-medium">이름</span>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className={inputClass} placeholder="홍길동" autoComplete="name" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-medium">연락처</span>
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required className={inputClass} placeholder="010-1234-5678" autoComplete="tel" inputMode="tel" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-medium">총 인원</span>
              <input type="number" min={1} max={8} value={participants} onChange={(e) => setParticipants(Number(e.target.value))} required className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-medium">아이 인원</span>
              <input type="number" min={0} max={8} value={childCount} onChange={(e) => setChildCount(Number(e.target.value))} required className={inputClass} />
            </label>
          </div>
          <fieldset className="mt-5">
            <legend className="mb-2 text-[15px] font-medium">강습 종목</legend>
            <div className="flex flex-wrap gap-2">
              {LESSON_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`cursor-pointer rounded-lg border-2 px-4 py-2 font-semibold ${
                    lessonType === type.value ? 'border-brand bg-ice text-brand' : 'border-line'
                  }`}
                >
                  <input type="radio" className="sr-only" checked={lessonType === type.value} onChange={() => setLessonType(type.value)} />
                  {type.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="mt-5 block">
            <span className="mb-1.5 block text-[15px] font-medium">요청 사항 (선택)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="아이 나이, 처음 타는지, 여강사 요청 등"
            />
          </label>
        </section>
      </div>

      <aside className="lg:col-span-1">
        <div className="card sticky top-24 p-6">
          <h3 className="mb-4 text-lg font-bold">예약 요약</h3>
          <dl className="space-y-3 text-[15px]">
            <div className="flex justify-between gap-4"><dt className="text-muted">날짜</dt><dd className="font-medium">{lessonDate}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">스키장</dt><dd className="font-medium">{SKI_RESORTS.find((r) => r.value === skiResort)?.label}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">시간</dt><dd className="font-medium">{LESSON_SLOTS.find((s) => s.id === slotId)?.timeLabel || '미선택'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">인원</dt><dd className="font-medium">{participants}명 / 아이 {childCount}명</dd></div>
          </dl>
          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={submitting || !slotId} className="btn-primary mt-6 w-full py-4 text-lg">
            {submitting ? '접수 중…' : '강습 예약하기'}
          </button>
          <p className="mt-3 text-center text-sm text-muted">예약 후 사장님이 일정 확인 전화를 드립니다.</p>
        </div>
      </aside>
    </form>
  );
}
