"""One place for every control. On a phone: a bar that stays in reach (find, Filters, list or map, cities or countries),
one sheet with every filter and priority, and details that open over the page and close back to where the person was.
On a wide screen: the same panel as the left column and the find box on the map.
Run: python3 tests/test_controls.py"""
import sys
from harness import sync_playwright, CHROME, route, PAGE

fails = []
def check(name, ok, got=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else f'   got: {got}'))
    if not ok: fails.append(name)

DONE = "()=>document.documentElement.dataset.sim==='done'"
ANYROW = "()=>[...document.querySelectorAll('#list .row')].some(e=>{const r=e.getBoundingClientRect();return r.bottom>120&&r.top<innerHeight})"
VIS = "s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect(),c=getComputedStyle(e);return c.visibility!=='hidden'&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight}"

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    # ---------------- a phone
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.route('**/*', route)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file://' + PAGE); pg.wait_for_timeout(800)
    check('before a take there is no bar and no panel on screen', not pg.evaluate(VIS, '#bar') and not pg.evaluate(VIS, '#ppanel'))
    pg.evaluate("fillSample()"); pg.wait_for_function(DONE); pg.wait_for_timeout(300)
    first = {s: pg.evaluate(VIS, s) for s in ['#search', '#ctlBtn', '#vList', '#vMap', '#rCities', '#rCountries', '#list .row']}
    check('phone: find, Filters, list-or-map, cities-or-countries and the first result are all on the first screen', all(first.values()), first)
    one = pg.evaluate("""()=>{const P=$('ppanel');return {in:[!!P.querySelector('#scopeBar [data-s]'),!!P.querySelector('.pill'),!!P.querySelector('.pchip')],
      out:[...document.querySelectorAll('.pill,[data-s],.pchip')].filter(x=>!P.contains(x)).length, fab:!!document.querySelector('.pfab'),
      legend:$('legend').querySelectorAll('button,input,[role=button]').length}}""")
    check('every filter and priority is in the one panel, and nowhere else', one == {'in': [True, True, True], 'out': 0, 'fab': False, 'legend': 0}, one)
    pg.evaluate("window.scrollTo(0,1500)"); pg.wait_for_timeout(200)
    stuck = pg.evaluate("()=>{const r=$('bar').getBoundingClientRect();return [Math.round(r.top),r.bottom<200]}")
    check('phone: the bar stays in reach while the list scrolls', stuck[0] in (53, 54, 55) and stuck[1] and pg.evaluate(VIS, '#search') and pg.evaluate(VIS, '#vMap'), stuck)
    # the sheet
    y0 = pg.evaluate("scrollY"); n0 = pg.evaluate("ents.filter(e=>e.type==='city'&&listable(e)&&inScope(e)&&passes(e)).length")
    pg.tap('#ctlBtn'); pg.wait_for_timeout(350)
    sheet = pg.evaluate("()=>{const r=$('ppanel').getBoundingClientRect();return [$('ppanel').classList.contains('open'),r.bottom<=innerHeight+1,r.top>60,!$('sheetBg').hidden,$('ctlBtn').getAttribute('aria-expanded')]}")
    check('phone: Filters opens the panel as a sheet over the page', sheet == [True, True, True, True, 'true'], sheet)
    pg.tap('.pill[data-g=reg][data-v=eu]'); pg.wait_for_timeout(300); pg.tap('#pdone'); pg.wait_for_timeout(350)
    f1 = pg.evaluate("()=>({open:$('ppanel').classList.contains('open'),badge:($('ctlBtn').querySelector('b')||{}).textContent||'',n:ents.filter(e=>e.type==='city'&&listable(e)&&inScope(e)&&passes(e)).length,rows:[...document.querySelectorAll('#list .row')].length})")
    check('phone: a filter set in the sheet narrows the list, and the Filters button counts it', not f1['open'] and f1['badge'] == '1' and 0 < f1['n'] < n0 and f1['rows'] > 0, f1)
    pg.tap('#ctlBtn'); pg.wait_for_timeout(300); pg.tap('#scopeBar [data-s=away]'); pg.wait_for_timeout(300); pg.mouse.click(195, 30); pg.wait_for_timeout(350)
    f2 = pg.evaluate("()=>[$('ppanel').classList.contains('open'),($('ctlBtn').querySelector('b')||{}).textContent]")
    check('phone: a tap outside the sheet closes it; where-to-look counts as a filter too', f2 == [False, '2'], f2)
    pg.evaluate("()=>{ui.f.reg.clear();ui.scope='all';scopeUI();pillsUI();filtersChanged()}"); pg.wait_for_timeout(300)
    # list or map
    pg.evaluate("window.scrollTo(0,900)"); pg.wait_for_timeout(150); y1 = pg.evaluate("scrollY")
    pg.tap('#vMap'); pg.wait_for_timeout(350)
    mp = pg.evaluate("()=>{const r=$('mapbox').getBoundingClientRect(),b=$('bar').getBoundingClientRect();return {top:Math.round(r.top-b.bottom),h:Math.round(r.height),w:Math.round(r.width),list:$('listPane').getClientRects().length,pressed:$('vMap').getAttribute('aria-pressed')}}")
    check('phone: Map shows the map right under the bar, tall enough to use, in place of the list', 0 <= mp['top'] <= 40 and mp['h'] >= 420 and mp['w'] >= 350 and mp['list'] == 0 and mp['pressed'] == 'true', mp)
    pg.tap('#vList'); pg.wait_for_timeout(300)
    check('phone: List comes back where it was left', abs(pg.evaluate("scrollY") - y1) <= 2 and pg.evaluate(ANYROW), (y1, pg.evaluate("scrollY")))
    # find a place
    rows0 = pg.evaluate("[...document.querySelectorAll('#list .row')].map(r=>r.textContent).join('|')")
    pg.fill('#search', 'lis'); pg.wait_for_timeout(250)
    sg = pg.evaluate("()=>({open:!$('sugg').hidden,names:[...document.querySelectorAll('#sugg li[data-i]')].map(l=>l.querySelector('.snm').textContent.trim()),sel:[...document.querySelectorAll('#sugg li[aria-selected=true]')].length,exp:$('search').getAttribute('aria-expanded')})")
    check('find: typing suggests places, the best match first', sg['open'] and sg['names'] and sg['names'][0].startswith('Lisbon') and sg['sel'] == 1 and sg['exp'] == 'true', sg)
    check('find: typing does not take rows out of the list', pg.evaluate("[...document.querySelectorAll('#list .row')].map(r=>r.textContent).join('|')") == rows0)
    pg.fill('#search', 'zzzz'); pg.wait_for_timeout(200)
    check('find: nothing by that name says so', pg.evaluate("$('sugg').textContent") == 'No place by that name', pg.evaluate("$('sugg').textContent"))
    pg.fill('#search', 'san'); pg.wait_for_timeout(200); pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(100)
    want = pg.evaluate("document.querySelector('#sugg li[aria-selected=true] .snm').firstChild.textContent.trim()")
    y2 = pg.evaluate("scrollY"); pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
    det = pg.evaluate("()=>{const d=$('detail'),r=d.getBoundingClientRect();return {open:ui.open,name:d.querySelector('h2')?d.querySelector('h2').textContent:null,box:[r.left,r.top,r.width,r.height].map(Math.round),pos:getComputedStyle(d).position,y:scrollY,val:$('search').value,sugg:$('sugg').hidden}}")
    check('find: arrows move through the suggestions and Enter opens that place, and it stays open', det['open'] and det['name'] == want and det['val'] == '' and det['sugg'], (want, det))
    check('phone: a place opens over the whole screen; the page underneath does not move', det['box'] == [0, 0, 390, 844] and det['pos'] == 'fixed' and det['y'] == y2, det)
    pg.tap('#dBack'); pg.wait_for_timeout(300)
    check('phone: Back returns to exactly where the person was', not pg.evaluate("ui.open") and abs(pg.evaluate("scrollY") - y2) <= 2 and pg.evaluate(ANYROW), (y2, pg.evaluate("scrollY")))
    pg.fill('#search', 'portugal'); pg.wait_for_timeout(200); pg.tap('#sugg li[data-i]'); pg.wait_for_timeout(500)
    kind = pg.evaluate("()=>[ui.rankType,$('rCountries').getAttribute('aria-pressed'),ui.open,$('detail').querySelector('h2').textContent]")
    check('find: picking a country switches the list to countries and opens it', kind == ['country', 'true', True, 'Portugal'], kind)
    pg.evaluate("closePlace()"); pg.tap('#rCities'); pg.tap('#vMap'); pg.wait_for_timeout(300)
    pg.evaluate("openPlace(byKey['city:Lisbon'])"); pg.wait_for_timeout(300)
    back = pg.inner_text('#dBack'); pg.tap('#dBack'); pg.wait_for_timeout(300)
    check('phone: opened from the map, Back says Map and returns to the map', back.strip() == 'Map' and pg.evaluate("ui.pane") == 'map' and pg.evaluate(VIS, '#mapbox') and not pg.evaluate("$('pcard').hidden"), back)
    check('hours and minutes round together (no 9:60)', pg.evaluate("[hmOf(9.997).join(':'),hmOf(9.5).join(':'),hmOf(8.01).join(':')]") == ['10:00', '9:30', '8:01'])
    check('no script errors on the phone', not errs, errs[:3])
    ctx.close()
    # narrow phone, long words, right to left: nothing runs off the side, with the sheet shut or open
    for lang in ['en', 'de', 'ar', 'hi']:
        c2 = b.new_context(viewport={'width': 320, 'height': 640}, is_mobile=True, has_touch=True); q = c2.new_page(); q.route('**/*', route)
        q.goto('file://' + PAGE); q.wait_for_timeout(700)
        if lang != 'en': q.select_option('#langSel', lang); q.wait_for_timeout(700)
        q.evaluate("fillSample()"); q.wait_for_function(DONE); q.wait_for_timeout(200)
        o1 = q.evaluate("document.scrollingElement.scrollWidth-innerWidth"); q.tap('#ctlBtn'); q.wait_for_timeout(300)
        o2 = q.evaluate("()=>[document.scrollingElement.scrollWidth-innerWidth,$('ppanel').scrollWidth-$('ppanel').clientWidth,[...$('bar').querySelectorAll('button,input')].every(x=>{const r=x.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1})]")
        check(f'{lang} at 320 px: the bar and the sheet fit the screen', o1 <= 0 and o2[0] <= 0 and o2[1] <= 1 and o2[2], (o1, o2))
        c2.close()
    # ---------------- a wide screen
    ctx = b.new_context(viewport={'width': 1280, 'height': 860}); pg = ctx.new_page(); pg.route('**/*', route)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file://' + PAGE); pg.wait_for_timeout(800); pg.evaluate("fillSample()"); pg.wait_for_function(DONE); pg.wait_for_timeout(300)
    wide = pg.evaluate("""()=>({bar:$('bar').getClientRects().length,onMap:$('mapbox').contains($('search')),kind:$('ppanel').contains($('rCities')),
      scope:$('ppanel').contains($('scopeBar')),cols:['ppanel','list','mapbox'].map(i=>Math.round($(i).getBoundingClientRect().left)),
      sb:(r=>[Math.round(r.left-$('mapbox').getBoundingClientRect().left),Math.round(r.top-$('mapbox').getBoundingClientRect().top)])($('searchBox').getBoundingClientRect())})""")
    check('wide: the panel, the list and the map sit side by side; no bar is needed', wide['bar'] == 0 and wide['kind'] and wide['scope'] and wide['cols'][0] < wide['cols'][1] < wide['cols'][2] and all(pg.evaluate(VIS, s) for s in ['#ppanel', '#list .row', '#mapbox']), wide)
    check('wide: the find box is on the map, in its corner', wide['onMap'] and 0 < wide['sb'][0] < 30 and 0 < wide['sb'][1] < 30, wide['sb'])
    k0 = pg.evaluate("zoomK"); pg.fill('#search', 'tok'); pg.wait_for_timeout(250)
    inmap = pg.evaluate("()=>{const s=$('sugg').getBoundingClientRect(),m=$('mapbox').getBoundingClientRect();return s.height>40&&s.bottom<=m.bottom&&s.left>=m.left}")
    pg.keyboard.press('Enter'); pg.wait_for_timeout(900)
    tk = pg.evaluate("()=>[ui.open,$('detail').querySelector('h2').textContent,getComputedStyle($('detail')).position,ui.sel.key,zoomK]")
    check('wide: the suggestions drop down inside the map; picking one opens it beside the map and moves the map there', inmap and tk[:4] == [True, 'Tokyo', 'static', 'city:Tokyo'] and pg.evaluate(VIS, '#mapbox') and tk[4] != k0, (inmap, tk, k0))
    pg.evaluate("closePlace()")
    pg.set_viewport_size({'width': 800, 'height': 900}); pg.wait_for_timeout(400)
    moved = pg.evaluate("()=>[$('bar').contains($('search')),$('bar').contains($('rCities')),$('bar').getClientRects().length>0]")
    pg.set_viewport_size({'width': 1280, 'height': 860}); pg.wait_for_timeout(400)
    again = pg.evaluate("()=>[$('mapbox').contains($('search')),$('ppanel').contains($('rCities'))]")
    check('a window made narrower or wider moves the find box and the switch to where they belong', moved == [True, True, True] and again == [True, True], (moved, again))
    check('no script errors on the wide screen', not errs, errs[:3])
    b.close()
print(f"\n{len(fails)} failed" if fails else "\nall passed"); sys.exit(1 if fails else 0)
