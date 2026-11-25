# 시안 v4 생성기 (B안, 피그마 톤 토글). 가짜 데이터만 사용. python3 build.py
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
  function nameOf(li) { return li.querySelector('.step__name').firstChild.textContent.trim(); }
  function render() {
    var on = steps.filter(function (li) { return li.querySelector('.next-box').checked; });
    list.innerHTML = '';
    on.forEach(function (li) {
      var tag = li.dataset.auto === '1' ? ' <span class="check__tag">(' + (li.dataset.moved === '1' ? '자동으로 옮겨짐' : '미리 체크됨') + ')</span>' : '';
      var l = document.createElement('label'); l.className = 'check-chip';
      l.innerHTML = '<input type="checkbox" checked><span class="check-box">' + li.querySelector('.check-box').innerHTML + '</span><span>' + nameOf(li) + '</span>' + tag;
      l.querySelector('input').addEventListener('change', function () { li.querySelector('.next-box').checked = false; li.dataset.auto = '0'; render(); });
      list.appendChild(l);
    });
    if (!on.length) list.innerHTML = '<span class="note">체크한 단계가 없어요. 아래 목록에서 골라 주세요.</span>';
    steps.forEach(function (li) { li.classList.toggle('step--next', li.querySelector('.next-box').checked); });
  }
  steps.forEach(function (li, i) {
    li.querySelector('.next-box').addEventListener('change', function () { li.dataset.auto = '0'; var m = li.querySelector('.moved'); if (m) m.hidden = true; render(); });
    li.querySelectorAll('.marks input').forEach(function (r) {
      r.addEventListener('change', function () {
        var nb = li.querySelector('.next-box');
        if (nb.checked && li.dataset.auto === '1' && steps[i + 1]) {
          nb.checked = false; li.dataset.auto = '0';
          var n = steps[i + 1]; n.querySelector('.next-box').checked = true; n.dataset.auto = '1'; n.dataset.moved = '1';
          var m = n.querySelector('.moved'); m.textContent = nameOf(li) + '에 표시해서 다음 단계 체크가 여기로 옮겨졌어요.'; m.hidden = false;
          note.textContent = nameOf(li) + '에 오늘 표시를 해서 체크가 다음 단계인 ' + nameOf(n) + ' 단계로 자동으로 옮겨졌어요. 여러 단계를 함께 체크할 수 있어요.';
          var a = li.querySelector('.auto'); if (a) a.hidden = true;
        }
        render();
      });
    });
  });
  document.querySelectorAll('[data-clear]').forEach(function (b) {
    b.addEventListener('click', function () { b.closest('.step').querySelectorAll('.marks input').forEach(function (r) { r.checked = false; }); });
  });
  render();
})();
</script>"""

def instructor(error=False):
    o = [HEAD("피드백 작성 시안 v4" + (" 발행 오류 예시" if error else ""), "강사가 단계마다 표시와 코멘트를 남기고 그날 종합 피드백을 쓰는 화면 시안")]
    o.append('<header class="bar"><div class="container bar__in"><a class="mark" href="#" aria-label="Ride or Die 강사 홈">Ride or Die</a><a class="btn btn--quiet btn--sm" href="#">목록</a></div></header>')
    o.append('<main class="container page page--dock"><div class="write"><div>')
    o.append('<div class="head"><h1>피드백 작성</h1><dl class="meta"><div><dt>강습생</dt><dd>김민지(가명)</dd></div><div><dt>강습일</dt><dd>2026.12.13 (일)</dd></div><div><dt>회차</dt><dd>2회차</dd></div><div><dt>시안</dt><dd>v4, 가짜 데이터</dd></div></dl></div>')
    if error:
        o.append('<div class="alert" role="alert"><strong>발행하지 못했어요.</strong><p>표시한 단계는 코멘트가 꼭 있어야 해요. <a href="#c0">스노우플라우 코멘트</a>를 적고 다시 발행해 주세요.</p></div>')
    # the pre-checked next step, at the top
    o.append(f'<section class="nextsum" aria-labelledby="h-next"><h2 id="h-next">다음에 배울 단계</h2><div class="nextsum__list">{chk(NEXT, True, tag=" <span class=check__tag>(미리 체크됨)</span>")}</div>'
             f'<p>지난 회차까지 표시가 있는 마지막 단계({LAST}) 바로 다음이라 미리 체크했어요. 여러 단계를 함께 체크할 수 있고, 아래 목록에서 바꿀 수 있어요.</p></section>')
    o.append('<fieldset class="toggle toggle--wide" style="margin-bottom:var(--space-md)"><legend>종목</legend><input type="radio" name="sport" id="sp1" checked><label for="sp1">스키</label><input type="radio" name="sport" id="sp2"><label for="sp2">보드</label></fieldset>')
    o.append('<details class="prev"><summary>지난 회차 1개 보기 (1회차, 12.06)</summary><div>')
    for k,(m,c) in S1["marks"].items(): o.append(f'<p><strong>{k}</strong> {st(m)} {e(c)}</p>')
    o.append('</div></details>')
    o.append('<section aria-labelledby="h-steps"><h2 id="h-steps" style="margin-bottom:var(--space-xs)">단계별 평가</h2><p class="note" style="margin-bottom:var(--space-sm)">오늘 한 단계에 ○ △ ✕를 누르면 코멘트 칸이 열려요. 표시한 단계는 코멘트가 필수예요.</p><ol class="ladder">')
    for i, s_ in enumerate(STEPS):
        m, c = S2["marks"].get(s_, (None, ""))
        if error and i == 0: c = ""
        prev = S1["marks"].get(s_)
        nxt = s_ == NEXT
        o.append(f'<li class="step{" step--next" if nxt else ""}" data-auto="{1 if nxt else 0}"><div class="step__top"><div class="step__name">{s_}')
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
    o = [HEAD("민지 스키 기록 시안 v4" + ("" if guide else " 안내 글 없음 예시"), "손님이 보는 강습 피드백 화면 시안. 배운 단계, 다음에 배울 단계, 날짜별 피드백")]
    o.append('<header class="bar"><div class="container bar__in"><a class="mark" href="#" aria-label="Ride or Die 홈">Ride or Die</a><a class="btn btn--quiet btn--sm" href="#">로그아웃</a></div></header>')
    o.append('<main class="container page"><div class="customer">')
    o.append(f'<div class="head"><h1>민지 스키 기록</h1><dl class="meta"><div><dt>최근 강습</dt><dd>2026.12.13</dd></div><div><dt>기록</dt><dd>2회</dd></div><div><dt>시안</dt><dd>v4{"" if guide else ", 다음에 배울 것 빈 예시"}, 가짜 데이터</dd></div></dl></div>')
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
    o = [HEAD("토글 상태 시안 v4", "강습 피드백 화면의 토글 네 가지를 상태별로 보여 주는 시안")]
    o.append('<header class="bar"><div class="container bar__in"><a class="mark" href="#" aria-label="Ride or Die 홈">Ride or Die</a><a class="btn btn--quiet btn--sm" href="#">목록</a></div></header>')
    o.append('<main class="container page"><div class="states"><div class="head"><h1>토글 상태</h1><p class="note">피그마 컬러 시스템(blue, Neutral)과 알약 모양으로 다시 만든 토글이에요. 상태마다 강제로 그린 견본입니다.</p></div>')
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

open("instructor.html","w").write(instructor())
open("instructor_error.html","w").write(instructor(True))
open("customer.html","w").write(customer())
open("customer_noguide.html","w").write(customer(False))
open("states.html","w").write(states())
print("ok", NEXT, LAST)
