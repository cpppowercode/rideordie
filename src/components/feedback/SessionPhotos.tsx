"use client";

/**
 * 회차 사진: 격자 → 누르면 크게 보기(이전/다음, 옆으로 밀기, Esc 닫기) → 압축본 받기.
 * 주소는 어드민이 준 Supabase 서명 URL(1시간). 지나면 새로고침 안내.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedbackPhoto } from "@/lib/customer-feedback/types";

export function SessionPhotos({ photos, label }: { photos: FeedbackPhoto[]; label: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  const n = photos.length;

  const show = (i: number) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setOpen(i);
  };
  const close = useCallback(() => {
    setOpen(null);
    lastFocus.current?.focus?.();
  }, []);
  const step = useCallback((d: number) => setOpen((i) => (i == null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (open == null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  const saveAll = async () => {
    // 휴대폰 브라우저는 여러 장 동시 받기를 막는 경우가 있어 한 장씩 차례로 받는다.
    for (let i = 0; i < n; i++) {
      setSaving(`${i + 1} / ${n}장 받는 중`);
      const a = document.createElement("a");
      a.href = photos[i]!.download_url;
      a.rel = "noopener";
      a.setAttribute("download", "");
      document.body.appendChild(a);
      a.click();
      a.remove();
      await new Promise((r) => setTimeout(r, 700));
    }
    setSaving(`${n}장 받기를 시작했어요. 사진 앱이나 다운로드 폴더를 확인해 주세요.`);
  };

  if (!n) return null;
  const cur = open == null ? null : photos[open];

  return (
    <div className="sub photos" data-testid="session-photos">
      <h3>사진 {n}장</h3>
      <p className="note">누르면 크게 볼 수 있어요. 받는 사진은 긴 변 2048px로 줄인 파일이에요.</p>
      {expired ? (
        <p className="photos__warn" role="status">
          사진 주소 시간이 지났어요. 화면을 새로고침해 주세요.
        </p>
      ) : null}
      <ul className="pgallery">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button type="button" onClick={() => show(i)} aria-label={`${label} 사진 ${i + 1} 크게 보기`} data-testid="photo-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" loading="lazy" decoding="async" onError={() => setExpired(true)} />
            </button>
          </li>
        ))}
      </ul>
      <div className="photos__act">
        <button type="button" className="btn btn--quiet btn--sm" onClick={() => void saveAll()} data-testid="photo-save-all">
          사진 모두 받기 ({n}장)
        </button>
        {saving ? (
          <span className="note" role="status">
            {saving}
          </span>
        ) : null}
      </div>

      {cur ? (
        <div
          className="pviewer"
          role="dialog"
          aria-modal="true"
          aria-label={`사진 ${open! + 1} / ${n}`}
          data-testid="photo-viewer"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const x0 = touchX.current;
            const x1 = e.changedTouches[0]?.clientX;
            touchX.current = null;
            if (x0 == null || x1 == null || Math.abs(x1 - x0) < 40) return;
            step(x1 < x0 ? 1 : -1);
          }}
        >
          <div className="pviewer__top">
            <span>
              사진 {open! + 1} / {n}
            </span>
            <button ref={closeRef} type="button" className="linkbtn pviewer__close" onClick={close}>
              닫기
            </button>
          </div>
          <div className="pviewer__frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.url} alt={`${label} 사진 ${open! + 1}`} onError={() => setExpired(true)} />
          </div>
          <div className="pviewer__nav">
            <button type="button" className="btn btn--quiet btn--sm pviewer__btn" onClick={() => step(-1)} disabled={n < 2}>
              이전
            </button>
            <a className="btn btn--quiet btn--sm pviewer__btn" href={cur.download_url} download rel="noopener" data-testid="photo-download">
              이 사진 받기
            </a>
            <button type="button" className="btn btn--quiet btn--sm pviewer__btn" onClick={() => step(1)} disabled={n < 2}>
              다음
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
