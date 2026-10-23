'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { LESSON_TYPES, SKI_RESORTS } from '@/lib/site';
import { formatPhoneDisplay, todayYmd } from '@/lib/booking';
import {
  generateLessonStarts,
  LESSON_DURATIONS,
  type LessonDurationHours,
} from '@/lib/hours';
import { formatWon, MAX_PARTICIPANTS_PER_INSTRUCTOR, quoteLessonPrice } from '@/lib/pricing';

type Step = 1 | 2 | 3;

type SlotAvailability = {
  id: string;
  startHour: number;
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

function Stepper({ value, min, max, onChange, testId }: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  testId: string;
}) {
  return (
    <div className="flex h-14 items-center justify-between rounded-2xl border border-line bg-white px-2">
      <button
        type="button"
        aria-label="줄이기"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-snow disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span data-testid={testId} className="min-w-8 text-center text-[20px] font-bold">{value}</span>
      <button
        type="button"
        aria-label="늘리기"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-snow disabled:opacity-30"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function BookingForm({ initialResort }: { initialResort?: string }) {
  const router = useRouter();
  const today = todayYmd();
  const initial = new Date();
  const [step, setStep] = useState<Step>(1);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [lessonDate, setLessonDate] = useState(today);
  const [skiResort, setSkiResort] = useState<string>(
    initialResort || SKI_RESORTS[0].value
  );
  const [durationHours, setDurationHours] = useState<LessonDurationHours>(2);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [lessonType, setLessonType] = useState<string>('ski');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [participants, setParticipants] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [notes, setNotes] = useState('');
  const [liveSlots, setLiveSlots] = useState<SlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const weeks = useMemo(() => monthMatrix(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthLabel = `${viewYear}년 ${viewMonth + 1}월`;
  const generatedStarts = useMemo(
    () => generateLessonStarts(skiResort, durationHours),
    [skiResort, durationHours]
  );
  const selectedStart = generatedStarts.find((slot) => slot.startHour === startHour) || null;
  const resortLabel = SKI_RESORTS.find((r) => r.value === skiResort)?.label;
  const typeLabel = LESSON_TYPES.find((t) => t.value === lessonType)?.label;
  const price = quoteLessonPrice({ durationHours, participants, lessonDate });

  const slots = useMemo(() => {
    return generatedStarts.map((slot) => {
      const live = liveSlots.find((item) => item.startHour === slot.startHour);
      return {
        id: slot.id,
        startHour: slot.startHour,
        timeLabel: slot.timeLabel,
        available: live ? live.available : true,
        remaining: live?.remaining ?? 0,
      };
    });
  }, [generatedStarts, liveSlots]);

  useEffect(() => {
    setStartHour((current) => {
      if (current == null) return current;
      return generatedStarts.some((slot) => slot.startHour === current) ? current : null;
    });
  }, [generatedStarts]);

  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    setLiveSlots([]);
    setError('');
    fetch(
      `/api/bookings/availability?date=${lessonDate}&skiResort=${encodeURIComponent(skiResort)}&duration=${durationHours}`
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '예약 현황을 불러오지 못했습니다.');
        if (!cancelled) {
          setLiveSlots(data.slots);
          setStartHour((current) => {
            if (current == null) return current;
            const stillOpen = data.slots.find(
              (slot: SlotAvailability) => slot.startHour === current && slot.available
            );
            return stillOpen ? current : null;
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
  }, [lessonDate, skiResort, durationHours]);

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const canGoNext = () => {
    if (step === 1) return Boolean(lessonDate && skiResort && durationHours && startHour != null);
    if (step === 2) {
      return customerName.trim().length >= 2 && customerPhone.replace(/\D/g, '').length >= 10 && childCount <= participants;
    }
    return true;
  };

  const goNext = () => {
    setError('');
    if (step === 1 && startHour == null) {
      setError('시작 시간을 선택해 주세요.');
      return;
    }
    if (step === 2) {
      if (customerName.trim().length < 2) {
        setError('이름을 두 글자 이상 입력해 주세요.');
        return;
      }
      if (customerPhone.replace(/\D/g, '').length < 10) {
        setError('휴대폰 번호를 확인해 주세요.');
        return;
      }
      if (childCount > participants) {
        setError('아이 인원은 총 인원 이하로 입력해 주세요.');
        return;
      }
    }
    setStep((s) => (s === 3 ? 3 : ((s + 1) as Step)));
  };

  const handleSubmit = async () => {
    setError('');
    if (startHour == null) {
      setError('시작 시간을 선택해 주세요.');
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
          durationHours,
          startHour,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '예약 접수에 실패했습니다.');
      }
      router.push(data.payPath || `/book/pay?orderNo=${encodeURIComponent(data.orderNo)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '예약 접수에 실패했습니다.');
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-2xl border border-line bg-white px-4 py-4 text-[17px] outline-none transition-shadow placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/15';

  const STEPS = [
    { n: 1, label: '일정' },
    { n: 2, label: '정보' },
    { n: 3, label: '확인' },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-[560px]" data-testid="booking-form">
      <ol className="mb-8 flex items-center gap-2" data-testid={`booking-step-${step}`}>
        {STEPS.map((item, i) => {
          const active = step === item.n;
          const done = step > item.n;
          return (
            <li key={item.n} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold ${
                    active || done ? 'bg-brand text-white' : 'bg-snow text-muted'
                  }`}
                >
                  {item.n}
                </span>
                <span className={`text-[14px] font-semibold ${active ? 'text-ink' : 'text-muted'}`}>{item.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <span className={`h-px flex-1 ${done ? 'bg-brand' : 'bg-line'}`} />
              )}
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
            data-testid="step-schedule"
          >
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[22px] font-bold tracking-tight">날짜를 골라 주세요</h2>
                <div className="flex items-center gap-1">
                  <button type="button" data-testid="cal-prev" onClick={() => shiftMonth(-1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-snow" aria-label="이전 달">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <p className="min-w-[7.5rem] text-center text-[15px] font-semibold">{monthLabel}</p>
                  <button type="button" data-testid="cal-next" onClick={() => shiftMonth(1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-snow" aria-label="다음 달">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="rounded-[24px] bg-white p-3 shadow-[0_8px_30px_rgba(25,31,40,0.04)] sm:p-4">
                <div className="grid grid-cols-7 gap-1 text-center text-[13px] font-medium text-muted">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <div key={day} className="py-2">{day}</div>
                  ))}
                  {weeks.flat().map((ymd, index) => {
                    if (!ymd) return <div key={`e-${index}`} className="h-12" />;
                    const disabled = ymd < today;
                    const selected = ymd === lessonDate;
                    return (
                      <button
                        key={ymd}
                        type="button"
                        data-testid={`day-${ymd}`}
                        disabled={disabled}
                        onClick={() => setLessonDate(ymd)}
                        className={`h-12 rounded-full text-[15px] transition-colors ${
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
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[22px] font-bold tracking-tight">스키장</h2>
              <div className="flex flex-wrap gap-2">
                {SKI_RESORTS.map((resort) => {
                  const selected = skiResort === resort.value;
                  return (
                    <button
                      key={resort.value}
                      type="button"
                      data-testid={`resort-${resort.value}`}
                      onClick={() => setSkiResort(resort.value)}
                      className={`min-h-12 rounded-full px-4 text-[15px] font-semibold transition-colors ${
                        selected ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-line hover:bg-snow'
                      }`}
                    >
                      {resort.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[22px] font-bold tracking-tight">강습 시간</h2>
              <div className="grid grid-cols-3 gap-2">
                {LESSON_DURATIONS.map((hours) => {
                  const selected = durationHours === hours;
                  return (
                    <button
                      key={hours}
                      type="button"
                      data-testid={`duration-${hours}`}
                      onClick={() => setDurationHours(hours)}
                      className={`min-h-14 rounded-2xl text-[16px] font-semibold ${
                        selected ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-line hover:bg-snow'
                      }`}
                    >
                      {hours}시간
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-1 text-[22px] font-bold tracking-tight">시작 시간</h2>
              <p className="mb-3 text-[14px] leading-5 text-muted">
                30분 단위입니다. 정설 시간과 겹치거나 영업 종료를 넘는 시간은 보이지 않아요.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" data-testid="start-grid">
                {slots.map((slot) => {
                  const selected = startHour === slot.startHour;
                  const disabled = loadingSlots ? false : !slot.available;
                  const badge = loadingSlots
                    ? '확인 중'
                    : slot.available
                      ? `잔여 ${slot.remaining}팀`
                      : '마감';
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      data-testid={`start-${slot.id}`}
                      disabled={disabled}
                      onClick={() => setStartHour(slot.startHour)}
                      className={`flex min-h-[72px] flex-col items-start justify-center rounded-[20px] px-4 py-3 text-left transition-all ${
                        selected
                          ? 'bg-ice ring-2 ring-brand'
                          : disabled
                            ? 'cursor-not-allowed bg-snow text-muted'
                            : 'bg-white ring-1 ring-line hover:ring-brand/40'
                      }`}
                    >
                      <span className="block text-[16px] font-bold leading-5">{slot.timeLabel}</span>
                      <span
                        data-testid={`start-badge-${slot.id}`}
                        className={`mt-1 text-[12px] font-semibold ${
                          !slot.available && !loadingSlots ? 'text-muted' : 'text-brand'
                        }`}
                      >
                        {badge}
                      </span>
                    </button>
                  );
                })}
              </div>
              {slots.length === 0 && (
                <p className="rounded-2xl bg-snow px-4 py-5 text-[14px] text-muted">
                  이 스키장에서 예약 가능한 시작 시간이 없습니다.
                </p>
              )}
            </section>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
            data-testid="step-info"
          >
            <h2 className="text-[22px] font-bold tracking-tight">예약자 정보를 알려 주세요</h2>
            <label className="block">
              <span className="mb-2 block text-[14px] font-semibold text-muted">이름</span>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className={inputClass}
                placeholder="홍길동"
                autoComplete="name"
                data-testid="input-name"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[14px] font-semibold text-muted">휴대폰 번호</span>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(formatPhoneDisplay(e.target.value))}
                required
                className={inputClass}
                placeholder="010-1234-5678"
                autoComplete="tel"
                inputMode="tel"
                data-testid="input-phone"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="mb-2 block text-[14px] font-semibold text-muted">총 인원 (강사 1명당 최대 {MAX_PARTICIPANTS_PER_INSTRUCTOR}명)</span>
                <Stepper value={participants} min={1} max={MAX_PARTICIPANTS_PER_INSTRUCTOR} onChange={(n) => {
                  setParticipants(n);
                  if (childCount > n) setChildCount(n);
                }} testId="input-participants" />
              </div>
              <div>
                <span className="mb-2 block text-[14px] font-semibold text-muted">아이 인원</span>
                <Stepper value={childCount} min={0} max={participants} onChange={setChildCount} testId="input-children" />
              </div>
            </div>
            <fieldset>
              <legend className="mb-2 text-[14px] font-semibold text-muted">강습 종목</legend>
              <div className="grid grid-cols-3 gap-2">
                {LESSON_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    data-testid={`type-${type.value}`}
                    onClick={() => setLessonType(type.value)}
                    className={`min-h-14 rounded-2xl text-[16px] font-semibold ${
                      lessonType === type.value ? 'bg-ink text-white' : 'bg-white ring-1 ring-line'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="mb-2 block text-[14px] font-semibold text-muted">요청 사항 (선택)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className={inputClass}
                placeholder="아이 나이, 처음 타는지, 여강사 요청 등"
                data-testid="input-notes"
              />
            </label>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            data-testid="step-confirm"
          >
            <h2 className="text-[22px] font-bold tracking-tight">이 내용으로 결제할까요?</h2>
            <p className="mt-2 text-[15px] text-muted">결제가 끝나야 예약이 확정됩니다.</p>
            <dl className="mt-6 overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgba(25,31,40,0.04)]" data-testid="booking-summary">
              {[
                ['날짜', lessonDate],
                ['스키장', resortLabel],
                ['강습 시간', `${durationHours}시간`],
                ['시간', selectedStart?.timeLabel],
                ['종목', typeLabel],
                ['이름', customerName.trim()],
                ['연락처', customerPhone],
                ['인원', `${participants}명 · ${price?.ratio || ''} · 아이 ${childCount}명`],
                ['요청', notes.trim() || '없음'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-6 border-b border-line px-5 py-4 last:border-0">
                  <dt className="shrink-0 text-[15px] text-muted">{k}</dt>
                  <dd className="text-right text-[16px] font-semibold">{v}</dd>
                </div>
              ))}
              {price && (
                <div className="flex items-start justify-between gap-6 px-5 py-4">
                  <dt className="shrink-0 text-[15px] text-muted">강습비</dt>
                  <dd className="text-right" data-testid="booking-price">
                    {price.earlyBird && (
                      <span className="mr-2 text-[14px] text-muted line-through" data-testid="price-regular">
                        {formatWon(price.regularAmount)}
                      </span>
                    )}
                    <span className="text-[18px] font-bold" data-testid="price-payable">{formatWon(price.payableAmount)}</span>
                    {price.earlyBird && (
                      <span className="ml-2 text-[13px] font-semibold text-brand" data-testid="price-early-bird">얼리버드</span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>

      {price && (
        <div className="mt-6 flex items-baseline justify-between rounded-[20px] bg-white px-5 py-4" data-testid="live-price">
          <p className="text-[14px] font-semibold text-muted">
            {durationHours}시간 · {price.ratio}
            {price.earlyBird ? ' · 얼리버드' : ''}
          </p>
          <p className="text-right">
            {price.earlyBird && (
              <span className="mr-2 text-[13px] text-muted line-through">{formatWon(price.regularAmount)}</span>
            )}
            <span className="text-[20px] font-bold">{formatWon(price.payableAmount)}</span>
          </p>
        </div>
      )}

      {error && (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600" data-testid="booking-error">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 mt-8 flex gap-2 bg-gradient-to-t from-snow via-snow to-snow/0 px-4 pb-5 pt-6">
        {step > 1 && (
          <button
            type="button"
            data-testid="booking-back"
            onClick={() => { setError(''); setStep((s) => (s - 1) as Step); }}
            className="btn-ghost min-h-14 flex-1"
          >
            이전
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            data-testid="booking-next"
            disabled={!canGoNext()}
            onClick={goNext}
            className="btn-primary min-h-14 flex-[2]"
          >
            다음
          </button>
        ) : (
          <button
            type="button"
            data-testid="booking-submit"
            disabled={submitting}
            onClick={handleSubmit}
            className="btn-primary min-h-14 flex-[2] text-[18px]"
          >
            {submitting ? '결제 준비 중…' : price ? `${formatWon(price.payableAmount)} 결제하기` : '결제하기'}
          </button>
        )}
      </div>
    </div>
  );
}
