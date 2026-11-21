"""A walk through the page the way a visitor meets it, on a phone, in every language: the first card, the results, a
place's details, the calculations; then the quiz's Close and the phone's Back button, a reload, a reset, and shared links
old and new. Prints each check and exits 1 if any fails. Run: python3 tests/test_walk.py"""
import sys, json, base64, re
from harness import sync_playwright, route, PAGE, CHROME
def enc(o): return base64.urlsafe_b64encode(json.dumps(o).encode()).decode().rstrip('=')
bad = []
def ck(name, ok, got=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  (got {got})' if got != '' else ''))
    if not ok: bad.append(name)
PHONE = dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
DONE = "()=>document.documentElement.dataset.sim==='done'"
# an old link: weights and settings only, as links were before the quiz answers travelled with them
OLD = {'v': 3, 'w': {'home': 2, 'jobs': 2, 'hlth': 3, 'commute': 2, 'move': 2, 'pay': 2, 'safe': 2, 'clim': 1}, 'h': ['city:Chicago'], 'lm': 'en', 'pm': 'us', 'fd': 'tech', 'cm': 'mild', 'a': {}}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    # ---- every language
    for lang in ['en', 'es', 'fr', 'pt', 'de', 'hi', 'zh', 'ar']:
        ctx = b.new_context(**PHONE); pg = ctx.new_page(); pg.route('**/*', route)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.goto('file://' + PAGE); pg.wait_for_timeout(700)
        pg.select_option('#langSel', lang); pg.wait_for_timeout(600)
        t0 = pg.evaluate("document.body.innerText")
        vis = pg.evaluate("()=>['#work','#pfab','#resPanel','#list','#map'].filter(s=>document.querySelector(s).getClientRects().length)")
        pg.evaluate("fillSample()"); pg.wait_for_function(DONE); pg.wait_for_timeout(200)
        top = pg.evaluate("()=>{const r=document.querySelector('#list .row').getBoundingClientRect();return r.top<innerHeight}")
        pg.locator('#list .row').nth(1).tap(); pg.wait_for_timeout(400)
        t1 = pg.evaluate("document.body.innerText"); det = pg.is_visible('#detail') and pg.locator('#detail .vshome li').count() > 0
        pg.tap('#dBack'); pg.wait_for_timeout(200)
        pg.evaluate("setAdv(true)"); pg.wait_for_timeout(300); pg.locator('#list .row').first.tap(); pg.wait_for_timeout(400)
        pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
        t2 = pg.evaluate("document.body.innerText") + pg.evaluate("()=>[...document.querySelectorAll('option')].map(o=>o.textContent).join('|')")
        text = t0 + t1 + t2
        ck(f'{lang}: the start is one card and nothing else', vis == [] and len(t0) < 700, (vis, len(t0)))
        ck(f'{lang}: the best match is on the first screen after the quiz; a row opens details with the comparison to home', top and det)
        ck(f'{lang}: no stray text, no errors', not re.search(r'undefined|\{[A-Za-z]+\}|NaN', text) and not errs, (errs[:2], re.findall(r'.{30}(?:undefined|\{[A-Za-z]+\}|NaN).{20}', text)[:2]))
        ck(f'{lang}: nothing wider than the screen', pg.evaluate("document.scrollingElement.scrollWidth-innerWidth") <= 0)
        ctx.close()
    # ---- the quiz: Close, and the phone's Back button
    ctx = b.new_context(**PHONE); pg = ctx.new_page(); pg.route('**/*', route)
    pg.goto('about:blank'); pg.goto('file://' + PAGE); pg.wait_for_timeout(700)
    pg.tap('#startQuiz'); pg.wait_for_timeout(300)
    ck('quiz: no tip about weather on the question about where you live', pg.locator('.qtip').count() == 0)
    pg.tap('#qSkip'); pg.wait_for_timeout(300)
    ck('Close on an unfinished first quiz goes back to the start, nothing shown', pg.is_visible('#startQuiz') and not pg.is_visible('#work') and pg.evaluate("MODE") == 'neutral')
    pg.tap('#startQuiz'); pg.wait_for_timeout(300)
    pg.tap('.hpbtn[data-for="qh1"]'); pg.wait_for_timeout(300); pg.go_back(); pg.wait_for_timeout(300)
    ck('Back with a list open closes the list, not the page', not pg.evaluate("document.getElementById('hpDialog').open") and pg.is_visible('#quizPanel'))
    pg.tap('#qUnsure'); pg.wait_for_timeout(1100); step = pg.evaluate("QLIST[QSTEP].id"); pg.go_back(); pg.wait_for_timeout(300)
    ck('Back inside the quiz goes to the question before', step != 'where' and pg.evaluate("QLIST[QSTEP].id") == 'where' and pg.is_visible('#quizPanel'), step)
    pg.go_back(); pg.wait_for_timeout(300)
    ck('Back on the first question leaves the quiz, still on the page', pg.url.startswith('file:') and not pg.is_visible('#quizPanel') and pg.is_visible('#startQuiz'))
    # the whole short quiz by hand: straight to the results, no stop in between
    pg.tap('#startQuiz'); pg.wait_for_timeout(300); i = 0
    while pg.is_visible('#quizPanel') and i < 40:
        if pg.locator('#qwrap .opt').count(): pg.locator('#qwrap .opt').first.tap(); pg.wait_for_timeout(450)
        elif pg.locator('#qNext').count(): pg.tap('#qNext'); pg.wait_for_timeout(250)
        else: pg.tap('#qUnsure'); pg.wait_for_timeout(1000)
        i += 1
    pg.wait_for_timeout(500)
    ck('the last answer opens the results at the top', pg.is_visible('#resPanel') and pg.is_visible('#list') and pg.evaluate('scrollY') == 0 and pg.evaluate('history.state') is None, i)
    ck('after the answer: how many answers it rests on, and the offer to answer more', pg.is_visible('#sharpen') and pg.is_visible('#fullQuiz') and bool(re.search(r'\d', pg.inner_text('#sharpenNote'))), pg.inner_text('#sharpen').replace('\n', ' ')[:80])
    a0 = pg.evaluate("JSON.stringify(ANS)"); w0 = pg.evaluate("JSON.stringify(W)")
    pg.tap('#retake'); pg.wait_for_timeout(300); pg.tap('#qSkip'); pg.wait_for_timeout(300)
    ck('Close on a retake keeps the results and their answers', pg.is_visible('#resPanel') and pg.evaluate("JSON.stringify(ANS)") == a0 and pg.evaluate("JSON.stringify(W)") == w0)
    ck('phone: the priorities button shows with the results', pg.is_visible('#pfab'))
    link = pg.evaluate("location.href.split('#')[0]+'#t='+enc(takeState())")
    pg.reload(); pg.wait_for_timeout(800)
    ck('reload: a saved take opens straight on its results', pg.is_visible('#resPanel') and pg.is_visible('#list') and not pg.is_visible('#start'))
    pg.goto('file://' + PAGE + '#reset'); pg.reload(); pg.wait_for_timeout(800)
    ck('#reset: back to the empty start', pg.is_visible('#startQuiz') and not pg.is_visible('#work'))
    ctx.close()
    # ---- shared links in a fresh browser
    for nm, url in [('a new link', link), ('an old link', 'file://' + PAGE + '#t=' + enc(OLD))]:
        ctx = b.new_context(viewport={'width': 1280, 'height': 800}); pg = ctx.new_page(); pg.route('**/*', route)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(url); pg.wait_for_timeout(900)
        ck(f'{nm} opens on its results and is not saved as the visitor\'s own', pg.is_visible('#resPanel') and pg.is_visible('#list') and not errs and not pg.evaluate("!!store.get('take',null)"), errs[:2])
        ctx.close()
    b.close()
print(f"\n{len(bad)} failed: " + '; '.join(bad) if bad else "\nall passed"); sys.exit(1 if bad else 0)
