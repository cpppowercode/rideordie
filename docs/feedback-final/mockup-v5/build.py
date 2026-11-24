# 시안 v5 생성기 (B안, 어드민 brand 파랑, 보강 체크). 가짜 데이터만 사용. python3 build.py
import html
e = html.escape
STEPS = ["스노우플라우","스노우플라우턴","스템턴","패러렐","베이직 숏턴","다이나믹턴","다이나믹 숏턴","베이직 카빙","카빙 롱턴","카빙 숏턴","모글","게이트","자율활강"]
GATES = {"베이직 숏턴": "레벨1, 티칭1 취득 도전", "게이트": "레벨2 취득 도전"}
WORD = {"o": "할 수 있어요", "t": "연습 중", "x": "아직 어려워요"}
SYM = {"o": "○", "t": "△", "x": "✕"}
S1 = {"date": "2026-12-06", "label": "2026.12.06 (토)", "short": "12.06", "no": 1,
      "marks": {"스노우플라우": ("o", "멈추는 자세가 안정적이에요. 혼자서도 멈출 수 있어요."),
                "스노우플라우턴": ("t", "왼쪽으로 돌 때 상체가 같이 돌아가요. 시선은 가는 방향, 몸통은 경사 아래를 보는 연습을 했어요."),
                "스템턴": ("x", "처음 해 봤어요. A자에서 스키를 모으는 순간 뒤로 앉는 버릇이 있어서 다음 시간에 다시 연습해요.")},
      "all": "첫날인데 겁먹지 않고 끝까지 잘 따라왔어요. 멈추기는 혼자서도 됩니다. 리프트 타고 내리기도 두 번째부터는 도움 없이 했어요.",
      "next": "스노우플라우턴을 양쪽 고르게 다듬고, 스템턴을 다시 연습해요.",
      "op": "초급 코스에서 리프트를 한두 번 더 타 보시면 다음 시간이 훨씬 편해요."}
S2 = {"date": "2026-12-13", "label": "2026.12.13 (일)", "short": "12.13", "no": 2,
      "marks": {"스노우플라우": ("o", "완전히 몸에 익었어요. 경사가 조금 있는 곳에서도 원하는 자리에 정확히 멈춰요."),
                "스노우플라우턴": ("o", "양쪽 턴 크기가 비슷해졌어요. 왼쪽 턴에서 상체가 따라 돌던 버릇이 거의 없어졌고, 속도 조절도 스스로 해요."),
                "스템턴": ("t", "A자로 시작해서 턴 가운데서 안쪽 스키를 모으는 흐름은 이해했어요.\n다만 경사가 세지면 모으는 타이밍이 늦어지고, 턴 끝에서 스키가 다시 살짝 벌어져요.\n완만한 경사에서 '모으고, 기다리고, 돌기' 리듬을 열 번 정도 더 반복하면 좋아요. 특히 오른쪽 턴에서 바깥 발 체중이 빠지는 순간이 있어서 무릎을 앞으로 내미는 느낌을 계속 기억해 주세요.")},
      "all": "지난주보다 속도를 훨씬 편하게 다뤄요. 스노우플라우턴은 이제 할 수 있어요.\n스템턴은 흐름을 이해했고, 완만한 경사에서는 거의 됩니다. 오늘은 초급 코스 전체를 쉬지 않고 세 번 내려왔어요.\n겁이 날 때 뒤로 앉는 버릇이 아직 조금 남아 있지만, 오늘 후반에는 스스로 알아채고 고쳤어요. 체력도 좋아서 마지막 시간까지 집중력이 유지됐습니다.",
      "next": "패러렐: 두 스키를 나란히 모은 채로 도는 연습부터 해요. 스템턴 리듬이 익숙해지면 바로 이어서 배울 수 있어요.",
      "op": "다음 강습 전에 한 번 더 타실 수 있다면, 초급 코스에서 스템턴만 연습해 주세요.\n급한 경사로 바로 올라가기보다는 완만한 곳에서 리듬을 몸에 익히는 게 훨씬 빨라요."}
SESS = [S1, S2]
# 모든 단계 완료 예시: 지난 회차까지 자율활강까지 표시가 있음
A1 = {"date": "2027-02-14", "label": "2027.02.14 (일)", "short": "02.14", "no": 11,
      "marks": {k: ("t" if k in ("모글", "게이트") else "o", "") for k in STEPS}}
A1["marks"]["자율활강"] = ("t", "")
A2 = {"date": "2027-02-21", "label": "2027.02.21 (일)", "short": "02.21", "no": 12,
      "marks": {"모글": ("t", "범프 위에서 무릎을 접는 타이밍은 맞아요. 골에서 스키가 벌어지는 버릇만 남았어요.")},
      "all": "오늘은 모글을 집중해서 탔어요.", "next": "모글 라인을 끝까지 이어서 타는 연습을 해요.", "op": "다음 시즌 레벨2 준비를 같이 해요."}
_last = max(STEPS.index(k) for S in SESS[:-1] for k in S["marks"])
NEXT = STEPS[_last + 1]  # 처음 열 때 미리 체크: 지난 회차까지 표시(✕ 포함)가 있는 마지막 단계 바로 다음
LAST = STEPS[_last]

def glyph(m):
    if m == "o": return '<svg class="glyph" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
    if m == "t": return '<svg class="glyph" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5 14 13H2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
    return '<svg class="glyph" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
CHECK_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHEV = '<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
def chk(text, on=False, cls="", extra="", tag=""):
    return f'<label class="check-chip{(" " + cls) if cls else ""}"><input type="checkbox"{" checked" if on else ""}{extra}><span class="check-box">{CHECK_SVG}</span><span>{text}</span>{tag}</label>'
def fold(body, label="강사 코멘트", open_=False, cls=""):
    return f'<details class="fold-toggle"{" open" if open_ else ""}><summary{(" class=" + chr(34) + cls + chr(34)) if cls else ""}><span>{label}</span><span class="when-shut">열기</span><span class="when-open">접기</span>{CHEV}</summary>{body}</details>'
def st(m): return f'<span class="st st--{m}">{glyph(m)}{WORD[m]}</span>'
def para(t): return "".join(f'<p class="say">{e(x)}</p>' for x in t.split("\n"))
def HEAD(title, desc): return f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}">
<link rel="stylesheet" href="./feedback.css"></head><body>'''


GROW = """<script>
document.querySelectorAll('textarea.input').forEach(function (t) {
  if (CSS.supports('field-sizing', 'content')) return;
  function fit() { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }
  t.addEventListener('input', fit); fit();
});
(function () {
  var steps = [].slice.call(document.querySelectorAll('.ladder .step'));
  var list = document.querySelector('.nextsum__list');
  var note = document.querySelector('.nextsum p');
  var allDone = document.querySelector('.nextsum').dataset.alldone === '1';
  function nameOf(li) { return li.querySelector('.step__name').firstChild.textContent.trim(); }
  function marked(li) { return !!li.querySelector('.marks input:checked'); }
  function render() {
    var on = steps.filter(function (li) { return li.querySelector('.next-box').checked; });
    list.innerHTML = '';
    on.forEach(function (li) {
      var t = marked(li) ? '오늘 표시한 단계, 보강' : li.dataset.back === '1' ? '다시 돌아옴' : li.dataset.moved === '1' ? '자동으로 옮겨짐' : li.dataset.auto === '1' ? '미리 체크됨' : '';
      var l = document.createElement('label'); l.className = 'check-chip';
      l.innerHTML = '<input type="checkbox" checked><span class="check-box">' + li.querySelector('.check-box').innerHTML + '</span><span>' + nameOf(li) + '</span>' + (t ? ' <span class="check__tag">(' + t + ')</span>' : '');
      l.querySelector('input').addEventListener('change', function () { li.querySelector('.next-box').checked = false; li.dataset.auto = '0'; render(); });
      list.appendChild(l);
    });
    if (allDone) { var d = document.createElement('span'); d.className = 'done'; d.textContent = '모든 단계 완료'; list.insertBefore(d, list.firstChild); }
    else if (!on.length) list.innerHTML = '<span class="note">체크한 단계가 없어요. 아래 목록에서 골라 주세요.</span>';
    steps.forEach(function (li) { li.classList.toggle('step--next', li.querySelector('.next-box').checked); });
  }
  function say(li, text) { var m = li.querySelector('.moved'); m.textContent = text; m.hidden = !text; }
  steps.forEach(function (li, i) {
    li.querySelector('.next-box').addEventListener('change', function () { li.dataset.auto = '0'; li.dataset.back = '0'; say(li, ''); render(); });
    li.querySelectorAll('.marks input').forEach(function (r) {
      r.addEventListener('change', function () {
        var nb = li.querySelector('.next-box');
        var first = li.dataset.had !== '1'; li.dataset.had = '1';
        var a = li.querySelector('.auto'); if (a) a.hidden = true;
        if (first && nb.checked) {
          nb.checked = false; li.dataset.auto = '0'; li.dataset.back = '0'; say(li, '');
          var n = steps[i + 1];
          if (n) {
            var was = n.querySelector('.next-box').checked;
            n.querySelector('.next-box').checked = true;
            if (!was) { n.dataset.auto = '1'; n.dataset.moved = '1'; li.dataset.to = String(i + 1); }
            say(n, nameOf(li) + '에 표시해서 다음 단계 체크가 여기로 옮겨졌어요.');
            note.textContent = nameOf(li) + '에 오늘 표시를 해서 체크가 다음 단계인 ' + nameOf(n) + ' 단계로 자동으로 옮겨졌어요. 오늘 표시한 단계도 보강할 단계로 다시 체크할 수 있어요.';
          } else {
            li.dataset.to = 'end'; allDone = true;
            note.textContent = nameOf(li) + '까지 표시해서 더 배울 다음 단계가 없어요. 보강할 단계는 아래 목록에서 직접 체크할 수 있어요.';
          }
        }
        render();
      });
    });
  });
  document.querySelectorAll('[data-clear]').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.closest('.step'); var had = li.dataset.had === '1';
      li.querySelectorAll('.marks input').forEach(function (r) { r.checked = false; });
      li.dataset.had = '0';
      if (had && li.dataset.to) {
        if (li.dataset.to === 'end') { allDone = document.querySelector('.nextsum').dataset.alldone === '1'; }
        else { var n = steps[+li.dataset.to]; if (n.dataset.moved === '1') { n.querySelector('.next-box').checked = false; n.dataset.moved = '0'; n.dataset.auto = '0'; say(n, ''); } }
        delete li.dataset.to;
        li.querySelector('.next-box').checked = true; li.dataset.back = '1';
        say(li, '표시를 지워서 다음 단계 체크가 이 단계로 돌아왔어요.');
        note.textContent = nameOf(li) + '의 표시를 지워서 체크가 원래 단계로 돌아왔어요. 이미 쓴 코멘트는 그대로 남아 있어요.';
      }
      render();
    });
  });
  render();
})();
</script>"""

def instructor(error=False, alldone=False):
    S1, S2, NEXT, LAST = (A1, A2, None, STEPS[-1]) if alldone else (globals()["S1"], globals()["S2"], globals()["NEXT"], globals()["LAST"])
    o = [HEAD("피드백 작성 시안 v5" + (" 발행 오류 예시" if error else "") + (" 모든 단계 완료 예시" if alldone else ""), "강사가 단계마다 표시와 코멘트를 남기고 그날 종합 피드백을 쓰는 화면 시안")]
    o.append('<header class="bar"><div class="container bar__in"><a class="mark" href="#" aria-label="Ride or Die 강사 홈">Ride or Die</a><a class="btn btn--quiet btn--sm" href="#">목록</a></div></header>')
    o.append('<main class="container page page--dock"><div class="write"><div>')
    o.append(f'<div class="head"><h1>피드백 작성</h1><dl class="meta"><div><dt>강습생</dt><dd>김민지(가명)</dd></div><div><dt>강습일</dt><dd>{S2["label"]}</dd></div><div><dt>회차</dt><dd>{S2["no"]}회차</dd></div><div><dt>시안</dt><dd>v5, 가짜 데이터</dd></div></dl></div>')
    if error:
        o.append('<div class="alert" role="alert"><strong>발행하지 못했어요.</strong><p>표시한 단계는 코멘트가 꼭 있어야 해요. <a href="#c0">스노우플라우 코멘트</a>를 적고 다시 발행해 주세요.</p></div>')
    # the pre-checked next step, at the top
    if NEXT:
        o.append(f'<section class="nextsum" aria-labelledby="h-next"><h2 id="h-next">다음에 배울 단계</h2><div class="nextsum__list">{chk(NEXT, True, tag=" <span class=check__tag>(미리 체크됨)</span>")}</div>'
                 f'<p>지난 회차까지 표시가 있는 마지막 단계({LAST}) 바로 다음이라 미리 체크했어요. 여러 단계를 함께 체크할 수 있고, 오늘 표시한 단계도 보강할 단계로 체크할 수 있어요.</p></section>')
    else:
        o.append('<section class="nextsum" data-alldone="1" aria-labelledby="h-next"><h2 id="h-next">다음에 배울 단계</h2><div class="nextsum__list"><span class="done">모든 단계 완료</span></div>'
                 '<p>지난 회차까지 자율활강까지 표시가 있어서 미리 체크할 다음 단계가 없어요. 보강할 단계는 아래 목록에서 직접 체크할 수 있어요.</p></section>')
    o.append('<fieldset class="toggle toggle--wide" style="margin-bottom:var(--space-md)"><legend>종목</legend><input type="radio" name="sport" id="sp1" checked><label for="sp1">스키</label><input type="radio" name="sport" id="sp2"><label for="sp2">보드</label></fieldset>')
    o.append(f'<details class="prev"><summary>지난 회차 1개 보기 ({S1["no"]}회차, {S1["short"]})</summary><div>')
    for k,(m,c) in S1["marks"].items(): o.append(f'<p><strong>{k}</strong> {st(m)} {e(c)}</p>')
    o.append('</div></details>')
    o.append('<section aria-labelledby="h-steps"><h2 id="h-steps" style="margin-bottom:var(--space-xs)">단계별 평가</h2><p class="note" style="margin-bottom:var(--space-sm)">오늘 한 단계에 ○ △ ✕를 누르면 코멘트 칸이 열려요. 표시한 단계는 코멘트가 필수예요.</p><ol class="ladder">')
    for i, s_ in enumerate(STEPS):
        m, c = S2["marks"].get(s_, (None, ""))
        if error and i == 0: c = ""
        prev = S1["marks"].get(s_)
        nxt = s_ == NEXT
        o.append(f'<li class="step{" step--next" if nxt else ""}" data-auto="{1 if nxt else 0}" data-had="{1 if m else 0}"><div class="step__top"><div class="step__name">{s_}')
        o.append(f'<span class="step__prev">지난 회차 {SYM[prev[0]]} {WORD[prev[0]]}</span>' if prev else '<span class="step__prev">아직 배우지 않음</span>')
        o.append(f'</div><fieldset class="toggle marks"><legend>{s_} 표시</legend>')
        for v in "otx":
            o.append(f'<input type="radio" name="m{i}" id="m{i}{v}" value="{v}"{" checked" if m == v else ""}><label for="m{i}{v}" aria-label="{WORD[v]}">{glyph(v)}</label>')
        o.append('</fieldset></div>')
        bad = error and i == 0
        o.append(f'<div class="field step__comment{" field--err" if bad else ""}"><label for="c{i}">{s_} 코멘트 <span class="req">(필수)</span></label>'
                 f'<textarea class="input" id="c{i}" name="c{i}" rows="1" maxlength="3000" aria-required="true" aria-describedby="h{i}"{" aria-invalid=" + chr(34) + "true" + chr(34) if bad else ""}>{e(c)}</textarea>'
                 f'<p class="help{" err" if bad else ""}" id="h{i}">{"코멘트가 비어 있어요. 오늘 이 단계에서 본 것을 한 줄이라도 적어 주세요." if bad else ""}</p></div>')
        o.append(f'<div class="step__tools">{chk("다음에 배울 단계", nxt, extra=" class=" + chr(34) + "next-box" + chr(34))}<button class="linkbtn" type="button" data-clear>표시 지우기</button></div>')
        o.append(f'<p class="auto"{"" if nxt else " hidden"}>미리 체크됨: 지난 회차까지 표시가 있는 마지막 단계({LAST}) 바로 다음이에요.</p>')
        o.append('<p class="moved" hidden></p></li>')
        if s_ in GATES: o.append(f'<li class="gate">{GATES[s_]}</li>')
    o.append('</ol><p class="note" style="margin-top:var(--space-md)">표시 지우기를 눌러도 이미 쓴 코멘트는 남아 있어요. 등급·뱃지 칸은 지금 화면 그대로 둡니다(이 시안에서는 생략).</p></section></div>')
    o.append('<section class="day" aria-labelledby="h-day"><h2 id="h-day">그날 종합 피드백</h2>')
    o.append(f'<div class="field"><label for="day">오늘 전체 피드백 <span class="req">(필수)</span></label><textarea class="input input--long" id="day" name="day" maxlength="3000" aria-required="true">{e(S2["all"])}</textarea><p class="help"></p></div>')
    o.append(f'<div class="field"><label for="nx">다음에 배울 것 <span class="req">(필수)</span></label><textarea class="input" id="nx" name="nx" rows="1" maxlength="3000" aria-required="true" aria-describedby="nxh">{e(S2["next"])}</textarea><p class="help" id="nxh">손님 화면의 주황색 다음 단계 안내에 이 글이 나가요.</p></div>')
    o.append(f'<div class="field"><label for="op">강사 의견 <span class="req">(필수)</span></label><textarea class="input" id="op" name="op" rows="1" maxlength="3000" aria-required="true">{e(S2["op"])}</textarea><p class="help"></p></div>')
    o.append('</section></div></main>')
    o.append('<div class="dock"><div class="actions"><button class="btn btn--quiet" type="button">임시저장</button><button class="btn" type="button">발행</button></div></div>')
    o.append(GROW + '</body></html>')
    return "".join(o)

TABJS = """<script>
document.querySelectorAll('[data-switch]').forEach(function (w) {
  var tabs = w.querySelectorAll('[role="tab"]');
  function pick(t) { tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; }); }
  tabs.forEach(function (t, i) { t.addEventListener('click', function () { pick(t); }); t.addEventListener('keydown', function (ev) { if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') { var n = tabs[(i + (ev.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; pick(n); n.focus(); } }); });
  pick(tabs[0]);
});
</script>"""

def customer(guide=True):
    cur = {}
    for S in SESS:
        for k,(m,c) in S["marks"].items(): cur[k] = m
    nx = S2["next"] if guide else ""
    o = [HEAD("민지 스키 기록 시안 v5" + ("" if guide else " 안내 글 없음 예시"), "손님이 보는 강습 피드백 화면 시안. 배운 단계, 다음에 배울 단계, 날짜별 피드백")]
    o.append('<header class="bar"><div class="container bar__in"><a class="mark" href="#" aria-label="Ride or Die 홈">Ride or Die</a><a class="btn btn--quiet btn--sm" href="#">로그아웃</a></div></header>')
    o.append('<main class="container page"><div class="customer">')
    o.append(f'<div class="head"><h1>민지 스키 기록</h1><dl class="meta"><div><dt>최근 강습</dt><dd>2026.12.13</dd></div><div><dt>기록</dt><dd>2회</dd></div><div><dt>시안</dt><dd>v5{"" if guide else ", 다음에 배울 것 빈 예시"}, 가짜 데이터</dd></div></dl></div>')
    n_o = sum(1 for v in cur.values() if v == "o")
    o.append(f'<section class="sum" aria-labelledby="h-sum"><h2 id="h-sum" class="visually-hidden">요약</h2><div class="sum__fig"><span class="big">{n_o}</span><span class="note">{len(STEPS)}단계 중 할 수 있는 단계</span></div><div class="bars" style="grid-template-columns:repeat({len(STEPS)}, minmax(0, 1fr))" aria-hidden="true">')
    for s_ in STEPS:
        c = {"o":"b-o","t":"b-t","x":"b-t"}.get(cur.get(s_), "b-next" if s_ == NEXT else "")
        o.append(f'<span class="{c}"></span>')
    o.append('</div>')
    o.append(f'<div class="nextwell"><span class="nexttag">다음에 배울 단계</span><strong>{NEXT}</strong>{f"<p>{e(nx)}</p>" if nx else ""}</div>')
    o.append('<dl class="legend"><div><dt>' + st("o") + '</dt></div><div><dt>' + st("t") + '</dt></div><div><dt>' + st("x") + '</dt></div><div><dt><span class="sw sw--next"></span></dt><dd>다음에 배울 단계</dd></div><div><dt><span class="sw sw--gray"></span></dt><dd>아직 배우지 않은 단계</dd></div></dl></section>')
    o.append('<div class="tabs" data-switch><div class="toggle toggle--wide" role="tablist" aria-label="보기"><button role="tab" type="button" aria-selected="true" aria-controls="p1" id="t1">단계별</button><button role="tab" type="button" aria-selected="false" aria-controls="p2" id="t2" tabindex="-1">날짜별</button></div></div>')
    o.append('<section role="tabpanel" id="p1" aria-labelledby="t1"><ol class="ladder">')
    for s_ in STEPS:
        hist = [(S, S["marks"][s_]) for S in SESS if s_ in S["marks"]]
        if hist:
            o.append(f'<li class="step"><div class="step__top"><span class="step__name">{s_}</span>{st(cur[s_])}</div><ul class="hist">')
            rows = []
            for idx,(S,(mm,c)) in enumerate(hist):
                ch = f'<span class="chg-tag">{SYM[hist[idx-1][1][0]]} → {SYM[mm]}</span>' if idx and hist[idx-1][1][0] != mm else ('<span class="chg-tag">첫 평가</span>' if idx == 0 else "")
                rows.append((S,mm,c,ch))
            for S,mm,c,ch in reversed(rows):
                o.append(f'<li><div class="hist__line"><time datetime="{S["date"]}">{S["short"]}</time><span>{S["no"]}회차</span>{st(mm)}{ch}</div>{fold(para(c))}</li>')
            o.append('</ul></li>')
        elif s_ == NEXT:
            o.append(f'<li class="step step--next"><div class="step__top"><span class="step__name">{s_}</span><span class="st st--next">다음에 배울 단계</span></div>{f"<p class=say>{e(nx)}</p>" if nx else ""}</li>')
        else:
            o.append(f'<li class="step step--gray"><div class="step__top"><span class="step__name">{s_}</span><span class="st st--none">배우기 전</span></div></li>')
        if s_ in GATES: o.append(f'<li class="gate">{GATES[s_]}</li>')
    o.append('</ol></section>')
    o.append('<section role="tabpanel" id="p2" aria-labelledby="t2">')
    for S in reversed(SESS):
        snx = S["next"] if (guide or S is not S2) else ""
        o.append(f'<article class="sess"><div class="sess__head"><h2>{S["no"]}회차</h2><time class="when" datetime="{S["date"]}">{S["label"]}</time><span class="who">담당 강사</span></div>')
        o.append(f'<div class="overall"><h3>그날 종합 피드백</h3>{"".join(f"<p>{e(x)}</p>" for x in S["all"].split(chr(10)))}</div>')
        if snx: o.append(f'<div class="sub sub--next"><h3>다음에 배울 것</h3><p class="say">{e(snx)}</p></div>')
        o.append(f'<div class="sub"><h3>강사 의견</h3>{para(S["op"])}</div>')
        o.append('<div class="sub"><h3>이날 배운 단계</h3><ul class="daylist">')
        for k,(m,c) in S["marks"].items():
            pv = S1["marks"].get(k) if S is S2 else None
            ch = f'<span class="chg-tag">{SYM[pv[0]]} → {SYM[m]}</span>' if pv and pv[0] != m else ""
            o.append(f'<li><div class="row"><span class="nm">{k}</span><span style="display:inline-flex;gap:var(--space-xs);align-items:center">{ch}{st(m)}</span></div>{fold(para(c))}</li>')
        o.append('</ul></div></article>')
    o.append('</section></div></main>' + TABJS + '</body></html>')
    return "".join(o)

def states():
    o = [HEAD("토글 상태 시안 v5", "강습 피드백 화면의 토글 네 가지를 상태별로 보여 주는 시안")]
    o.append('<header class="bar"><div class="container bar__in"><a class="mark" href="#" aria-label="Ride or Die 홈">Ride or Die</a><a class="btn btn--quiet btn--sm" href="#">목록</a></div></header>')
    o.append('<main class="container page"><div class="states"><div class="head"><h1>토글 상태</h1><p class="note">어드민 brand 파랑(#465fff)과 피그마 Neutral, 알약 모양 토글이에요. 흰 글자가 올라가는 바탕은 #1254CF예요. 상태마다 강제로 그린 견본입니다.</p></div>')
    def mk(i, sel=None, cls="", dis=False):
        r = [f'<fieldset class="toggle marks{" is-disabled" if dis else ""}"><legend>견본 {i}</legend>']
        for v in "otx":
            r.append(f'<input type="radio" name="s{i}" id="s{i}{v}" value="{v}"{" checked" if sel == v else ""}{" disabled" if dis else ""}><label for="s{i}{v}" aria-label="{WORD[v]}"{(" class=" + chr(34) + cls + chr(34)) if (cls and v == "t") else ""}>{glyph(v)}</label>')
        return "".join(r) + '</fieldset>'
    rows = [("기본", mk(1)), ("마우스 올림", mk(2, cls="is-hover")), ("누르는 중", mk(3, cls="is-active")), ("○ 선택", mk(4, "o")), ("△ 선택", mk(5, "t")), ("✕ 선택", mk(6, "x")), ("키보드 포커스", mk(7, cls="is-focus")), ("사용 불가", mk(8, "t", dis=True))]
    o.append('<section aria-labelledby="g1"><h2 id="g1" style="margin-bottom:var(--space-sm)">○ △ ✕ 표시</h2><table><tbody>' + "".join(f"<tr><th>{a}</th><td>{b}</td></tr>" for a,b in rows) + '</tbody></table></section>')
    def sp(i, cls="", dis=False):
        return f'<fieldset class="toggle{" is-disabled" if dis else ""}"><legend>종목 견본 {i}</legend><input type="radio" name="p{i}" id="p{i}a" checked{" disabled" if dis else ""}><label for="p{i}a">스키</label><input type="radio" name="p{i}" id="p{i}b"{" disabled" if dis else ""}><label for="p{i}b"{(" class=" + chr(34) + cls + chr(34)) if cls else ""}>보드</label></fieldset>'
    rows = [("선택됨(스키)", sp(1)), ("마우스 올림(보드)", sp(2, "is-hover")), ("누르는 중(보드)", sp(3, "is-active")), ("키보드 포커스(보드)", sp(4, "is-focus")), ("사용 불가", sp(5, dis=True))]
    o.append('<section aria-labelledby="g2"><h2 id="g2" style="margin-bottom:var(--space-sm)">스키·보드, 단계별·날짜별</h2><table><tbody>' + "".join(f"<tr><th>{a}</th><td>{b}</td></tr>" for a,b in rows) + '</tbody></table></section>')
    rows = [("기본", chk("다음에 배울 단계")), ("마우스 올림", chk("다음에 배울 단계", cls="is-hover")), ("누르는 중", chk("다음에 배울 단계", cls="is-active")), ("체크됨", chk("다음에 배울 단계", True)), ("미리 체크됨", chk("패러렐", True, tag=" <span class=check__tag>(미리 체크됨)</span>")), ("키보드 포커스", chk("다음에 배울 단계", cls="is-focus")), ("사용 불가", chk("다음에 배울 단계", True, extra=" disabled"))]
    o.append('<section aria-labelledby="g3"><h2 id="g3" style="margin-bottom:var(--space-sm)">다음에 배울 단계 체크</h2><table><tbody>' + "".join(f"<tr><th>{a}</th><td>{b}</td></tr>" for a,b in rows) + '</tbody></table></section>')
    body = '<p class="say">양쪽 턴 크기가 비슷해졌어요.</p>'
    rows = [("접힘", fold(body)), ("마우스 올림", fold(body, cls="is-hover")), ("누르는 중", fold(body, cls="is-active")), ("펼침", fold(body, open_=True)), ("키보드 포커스", fold(body, cls="is-focus")), ("사용 불가", fold(body, cls="is-disabled"))]
    o.append('<section aria-labelledby="g4"><h2 id="g4" style="margin-bottom:var(--space-sm)">강사 코멘트 열기·접기</h2><table><tbody>' + "".join(f"<tr><th>{a}</th><td>{b}</td></tr>" for a,b in rows) + '</tbody></table>')
    o.append('<p class="note" style="margin-top:var(--space-sm)">저장 중, 오류, 완료 상태는 토글 하나만으로는 서버에 요청하지 않아서 두지 않았어요(Hallmark 규칙 70). 발행 오류는 입력칸 쪽에서 보여 줍니다.</p></section>')
    o.append('</div></main></body></html>')
    return "".join(o)


CANDS = [("A", "한 번 더 연습"), ("B", "조금 더 다듬기"), ("C", "복습하기")]
R_NEXT = "베이직 숏턴: 짧은 리듬으로 폴 체킹을 넣어 보는 것부터 해요. 패러렐은 경사가 센 곳에서 두 스키가 벌어지지 않게 한 번 더 잡아요."
R_HIST = [("12.13", 2, "o", "o"), ("12.20", 3, "t", None)]
def reinforce():
    o = [HEAD("보강 단계 문구 후보 시안 v5", "손님 화면에서 오늘 배운 단계를 다음 단계로 다시 체크했을 때 붙일 문구 후보 세 가지")]
    o.append('<header class="bar"><div class="container bar__in"><a class="mark" href="#" aria-label="Ride or Die 홈">Ride or Die</a><a class="btn btn--quiet btn--sm" href="#">로그아웃</a></div></header>')
    o.append('<main class="container page"><div class="customer"><div class="head"><h1>보강 단계 문구 후보</h1><dl class="meta"><div><dt>상황</dt><dd>3회차에 패러렐 △, 강사가 베이직 숏턴과 패러렐을 함께 체크</dd></div><div><dt>시안</dt><dd>v5, 가짜 데이터</dd></div></dl></div><div class="cands">')
    for k, lab in CANDS:
        o.append(f'<section class="cand" aria-labelledby="cd{k}"><h2 id="cd{k}">후보 {k}. {lab}</h2>')
        o.append(f'<div class="nextwell"><span class="nexttag">다음에 배울 단계</span><strong>베이직 숏턴</strong><strong>패러렐 <span class="again">{lab}</span></strong><p>{e(R_NEXT)}</p></div>')
        o.append('<ol class="ladder">')
        o.append(f'<li class="step step--again"><div class="step__top"><span class="step__name">패러렐</span><span class="again">{lab}</span></div><ul class="hist"><li><div class="hist__line"><time datetime="2026-12-20">12.20</time><span>3회차</span>{st("t")}<span class="chg-tag">첫 평가</span></div></li></ul></li>')
        o.append('<li class="step step--next"><div class="step__top"><span class="step__name">베이직 숏턴</span><span class="st st--next">다음에 배울 단계</span></div></li>')
        o.append('</ol></section>')
    o.append('</div><p class="note">세 후보 모두 주황 다음 단계 칸 안에 들어가고, 지난 표시(△ 연습 중)는 그대로 보여요. 2026-11-25 02:00 사장님 확정: 후보 B 「조금 더 다듬기」.</p></div></main></body></html>')
    return "".join(o)

def compare():
    o = [HEAD("파랑 변경 전후 비교 시안 v5", "v4 피그마 blue-500과 v5 어드민 brand 파랑을 토글, 버튼, 포커스에서 나란히 비교")]
    o.append('<header class="bar"><div class="container bar__in"><a class="mark" href="#" aria-label="Ride or Die 홈">Ride or Die</a><a class="btn btn--quiet btn--sm" href="#">목록</a></div></header>')
    o.append('<main class="container page"><div class="states"><div class="head"><h1>파랑 변경 전후</h1><p class="note">왼쪽은 v4(피그마 blue-500 #327AFF), 오른쪽은 v5(어드민 brand-500 #465fff)예요. 흰 글자 버튼과 △ 선택 바탕은 둘 다 #1254CF예요. 상태는 강제로 그린 견본입니다.</p></div><div class="cmp">')
    for th, title in (("theme-v4", "v4 전"), ("", "v5 후")):
        q = th or "v5"
        def mk(i, sel=None, cls=""):
            r = [f'<fieldset class="toggle marks"><legend>{title} 표시 {i}</legend>']
            for v in "otx":
                r.append(f'<input type="radio" name="{q}m{i}" id="{q}m{i}{v}" value="{v}"{" checked" if sel == v else ""}><label for="{q}m{i}{v}" aria-label="{WORD[v]}"{(" class=" + chr(34) + cls + chr(34)) if (cls and v == "o") else ""}>{glyph(v)}</label>')
            return "".join(r) + '</fieldset>'
        o.append(f'<section class="{th}" aria-labelledby="h{q}"><h2 id="h{q}">{title}</h2>')
        o.append(f'<div class="row"><span class="lbl">○ △ ✕: △ 선택, ○ 누르는 중, ○ 키보드 포커스</span>{mk(1, "t")}{mk(2, cls="is-active")}{mk(3, cls="is-focus")}</div>')
        o.append(f'<div class="row"><span class="lbl">스키·보드: 보드 누르는 중, 보드 키보드 포커스</span><fieldset class="toggle"><legend>{title} 종목 1</legend><input type="radio" name="{q}p1" id="{q}p1a" checked><label for="{q}p1a">스키</label><input type="radio" name="{q}p1" id="{q}p1b"><label for="{q}p1b" class="is-active">보드</label></fieldset><fieldset class="toggle"><legend>{title} 종목 2</legend><input type="radio" name="{q}p2" id="{q}p2a" checked><label for="{q}p2a">스키</label><input type="radio" name="{q}p2" id="{q}p2b"><label for="{q}p2b" class="is-focus">보드</label></fieldset></div>')
        o.append(f'<div class="row"><span class="lbl">다음에 배울 단계 체크: 체크됨, 키보드 포커스</span>{chk("베이직 숏턴", True)}{chk("패러렐", cls="is-focus")}</div>')
        o.append(f'<div class="row"><span class="lbl">강사 코멘트 열기·접기: 펼침, 키보드 포커스</span>{fold("<p class=say>양쪽 턴 크기가 비슷해졌어요.</p>", open_=True)}{fold("<p class=say>양쪽 턴 크기가 비슷해졌어요.</p>", cls="is-focus")}</div>')
        o.append('<div class="overall"><h3>그날 종합 피드백 (옅은 바탕)</h3><p>옅은 파랑 바탕과 파란 제목 글자예요.</p></div><div class="row"><span class="lbl">버튼: 기본, 마우스 올림, 키보드 포커스</span><button class="btn" type="button">발행</button><button class="btn is-hover" type="button">발행</button><button class="btn is-focus" type="button">발행</button></div>')
        o.append('<div class="row"><span class="lbl">입력칸 포커스, 파란 글자(링크, 연습 중)</span><input class="input is-focus" aria-label="' + title + ' 입력 견본" value="스템턴 리듬 연습"><a class="linky" href="#">지난 회차 보기</a>' + st("t") + '</div>')
        o.append('</section>')
    o.append('</div></div></main></body></html>')
    return "".join(o)

open("instructor.html","w").write(instructor())
open("instructor_error.html","w").write(instructor(True))
open("customer.html","w").write(customer())
open("customer_noguide.html","w").write(customer(False))
open("states.html","w").write(states())
open("instructor_alldone.html","w").write(instructor(alldone=True))
open("reinforce_labels.html","w").write(reinforce())
open("compare_colors.html","w").write(compare())
print("ok", NEXT, LAST)
