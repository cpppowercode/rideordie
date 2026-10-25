'use client';
import { useEffect, useRef, useState } from 'react';

type Preset = { id: string; label: string };
type Msg = { role: 'user' | 'assistant'; content: string };

/** 오른쪽 아래 상담 버튼. 어드민에서 켜져 있을 때만 보인다(GET /api/chat). */
export function ChatWidget() {
  const [enabled, setEnabled] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', content: '안녕하세요, 라이드올다이 상담 도우미예요. 아래 버튼을 누르거나 궁금한 점을 적어 주세요.' }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const sid = useRef('');
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sid.current = sessionStorage.getItem('rd_chat_sid') || Math.random().toString(36).slice(2);
    sessionStorage.setItem('rd_chat_sid', sid.current);
    fetch('/api/chat').then((r) => r.json()).then((r) => { setEnabled(!!r.enabled); setPresets(r.presets || []); }).catch(() => {});
  }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, open]);
  if (!enabled) return null;

  const ask = async (payload: { question?: string; presetId?: string }, shown: string) => {
    if (busy) return;
    const history = msgs.slice(1);
    setMsgs((m) => [...m, { role: 'user', content: shown }]);
    setBusy(true);
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, history, sessionId: sid.current }) }).then((x) => x.json());
      setMsgs((m) => [...m, { role: 'assistant', content: r.text || '잠시 후 다시 시도해 주세요.' }]);
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', content: '잠시 후 다시 시도해 주세요.' }]);
    }
    setBusy(false);
  };
  const linkify = (s: string) => s.split(/(https:\/\/pf\.kakao\.com\/_xfWMxaG)/).map((p, i) => p.startsWith('https://') ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline">카카오톡 채널</a> : <span key={i}>{p}</span>);

  return (
    <div className="fixed bottom-5 right-5 z-[60]" data-testid="chat-widget">
      {open ? (
        <div className="mb-3 flex h-[560px] max-h-[75vh] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-[24px] border border-line bg-white shadow-2xl" data-testid="chat-panel">
          <div className="flex items-center justify-between bg-brand px-4 py-3 text-white">
            <b>라이드올다이 상담</b>
            <button onClick={() => setOpen(false)} aria-label="닫기" className="text-xl leading-none">×</button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto bg-snow p-3 text-[14px]">
            {msgs.map((m, i) => (
              <div key={i} className={`whitespace-pre-line rounded-2xl px-3 py-2 ${m.role === 'user' ? 'ml-10 bg-brand text-white' : 'mr-6 bg-white'}`}>{m.role === 'assistant' ? linkify(m.content) : m.content}</div>
            ))}
            {busy ? <div className="mr-6 rounded-2xl bg-white px-3 py-2 text-muted">답변 준비 중…</div> : null}
            <div ref={end} />
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-line p-2">
            {presets.map((p) => (
              <button key={p.id} onClick={() => ask({ presetId: p.id }, p.label)} className="rounded-full border border-line px-2.5 py-1 text-[12px] font-semibold" data-testid={`chat-preset-${p.id}`}>{p.label}</button>
            ))}
          </div>
          <form className="flex gap-2 border-t border-line p-2" onSubmit={(e) => { e.preventDefault(); const q = text.trim(); if (q) { setText(''); ask({ question: q }, q); } }}>
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder="궁금한 점을 적어 주세요" className="min-w-0 flex-1 rounded-full border border-line px-3 py-2 text-[14px]" data-testid="chat-input" />
            <button disabled={busy} className="shrink-0 rounded-full bg-brand px-4 text-[14px] font-bold text-white disabled:opacity-50">보내기</button>
          </form>
          <p className="px-3 pb-2 text-[11px] text-muted">자동 상담은 참고용이에요. 예약·결제 확인은 카카오톡 채널로 문의해 주세요.</p>
        </div>
      ) : null}
      <button onClick={() => setOpen((v) => !v)} className="ml-auto flex h-14 items-center gap-2 rounded-full bg-brand px-5 text-[15px] font-bold text-white shadow-xl" data-testid="chat-open">
        💬 {open ? '닫기' : '상담'}
      </button>
    </div>
  );
}
