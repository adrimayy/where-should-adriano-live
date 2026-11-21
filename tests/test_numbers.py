"""Checks that specific numbers come out right, not just that the page renders (Beck). Run after changing data or code:
python3 tests/test_numbers.py   -- prints each check and exits 1 if any fails."""
import sys, json, pathlib
from harness import sync_playwright, route, PAGE, CHROME
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'pipeline'))
from bands import b_uhc, b_heat, b_money, money_left
D = json.load(open(ROOT / 'build' / 'final.json', encoding='utf8'))
fails = []
def check(name, ok, got=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  (got {got})' if got != '' else ''))
    if not ok: fails.append(name)
# ---- bands and continuous values
check('UHC 88 is band 5, sitting on the cut-off (4.5)', int(b_uhc(88)) == 5 and b_uhc(88).c == 4.5, (int(b_uhc(88)), b_uhc(88).c))
check('UHC 80 is band 3, exact 3.125', int(b_uhc(80)) == 3 and abs(b_uhc(80).c - 3.125) < 1e-9, b_uhc(80).c)
check('hottest month 28.6 C is the lowest heat band', int(b_heat(28.6)) == 1)
check('money: $1,686 left in New York is band 3', int(b_money(1686)) == 3)
# ---- money left after rent (Numbeo item prices, Apr 2026)
M = D['money']
check('New York: (5,736 - 4,050) / 100% = 1,686', round(money_left(*M['New York City'][:3])) == 1686)
check('Valencia: (2,057 - 1,420) / 50.6% = 1,259', round(money_left(*M['Valencia'][:3])) == 1259)
check('index route calibrated on 45 cities', D['money_cal'][2] == 45, D['money_cal'])
# ---- gap filling
skip = D['meta']['skip']
# (a country can still get these from the average of its own cities' published figures: that's data, not a model guess, and has no draws)
check('factors with test error above 1.0 are never model-filled for countries', all(not (f in (v[6] or {}) and len(v[6][f]) > 2) for v in D['countries'].values() for f in skip), skip)
imp_draws = [x for v in D['countries'].values() for x in (v[6] or {}).values() if len(x) > 2]
check('every country gap has 20 imputed draws', imp_draws and all(len(x[2]) == 20 for x in imp_draws), len(imp_draws))
# ---- the page
JS = r"""()=>{const A=window.__atlas,L=A.ents().filter(e=>A.listable(e));const band=x=>x>=70?3:x>=60?2:x>=48?1:0;
 const r5=x=>{const r=Math.round(x/5)*5;return band(r)===band(x)?r:Math.floor(x/5)*5;};
 const TR={fit:0,ok:1,caution:2,avoid:3,nodata:4};const cs=L.filter(e=>e.type==='city').sort(byRank);
 const by=n=>A.ents().find(e=>e.name===n);
 return {cross:L.filter(e=>band(r5(e.score))!==band(e.score)).length,
  fitBad:L.filter(e=>e.tier==='fit'&&e.score<70).length,
  top3:cs.slice(0,3).map(e=>e.name),
  austin:by('Austin').sc.pol, tampicoLo:by('Tampico').lo<=by('Tampico').score&&by('Tampico').score<=by('Tampico').hi+1,
  ranges:L.every(e=>e.lo<=e.hi), probs:L.every(e=>e.pFit>=0&&e.pFit<=1&&e.pTop>=0&&e.pTop<=1),
  likely:L.filter(e=>e.likely).map(e=>e.name).slice(0,5)};}"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME); pg = b.new_page(); pg.route('**/*', route)
    pg.goto('file://' + PAGE); pg.wait_for_timeout(800)
    # before there is a take, nothing is scored on screen: the first card and the quiz button only
    vis = "()=>['#work','#mapSec','#rankSec','#detail','#weightsBox','#pfab','#resPanel'].filter(s=>document.querySelector(s).getClientRects().length)"
    start = {'shown': pg.evaluate(vis), 'quiz': pg.is_visible('#startQuiz'), 'rows': pg.evaluate("()=>[...document.querySelectorAll('#list .row')].filter(r=>r.getClientRects().length).length")}
    pg.select_option('#langSel', 'fr'); pg.wait_for_timeout(600); fr = pg.inner_text('#start'); pg.select_option('#langSel', 'en'); pg.wait_for_timeout(300)
    pg.evaluate("fillSample()"); pg.wait_for_timeout(300)   # the fixed case: one filled-in set of answers (SAMPLE, js/07-quiz.js)
    after = pg.evaluate(vis)
    same = pg.evaluate("()=>{const w=weightsFromQuiz(SAMPLE);return Object.keys(w).every(k=>w[k]===W[k])&&MODE==='yours'}")
    pg.wait_for_function("()=>document.documentElement.dataset.sim==='done'")   # the likely ranges are worked out in the background
    r = pg.evaluate(JS)
    # compared with where you live now: the sample's answers with New York City as home
    vs = pg.evaluate("""()=>{ANS=JSON.parse(JSON.stringify(SAMPLE));ANS.where={keys:['city:New York City']};QMORE=true;finishQuiz();
      const H=HOMES[0],cs=ents.filter(e=>e.type==='city'&&listable(e)&&e!==H),bad=[];let n=0;
      cs.forEach(e=>homeFigures(e).forEach(x=>{n++;const A=byKey[x.a],B=byKey[x.b];
        // the same kind of place on both sides, both named, and never against the page's own score for the factor
        const w=X=>X.how&&X.how[x.k]==='obs'&&X.v[x.k]!=null?X.v[x.k]:null,D=w(A)!=null&&w(B)!=null?w(B)-w(A):0;
        if(!A||!B||A===B||A.type!==B.type||!x.t.includes(dn(A))||!x.t.includes(dn(B))||(Math.abs(D)>=(ME[x.k]||0.25)&&!['day','sea'].includes(x.k)&&(D>0)!==x.good))bad.push(e.name+':'+x.k);}));
      const ams=homeFigures(byKey['city:Amsterdam']);
      openPlace(byKey['city:Amsterdam']);
      return {n,bad:bad.slice(0,5),nbad:bad.length,ams:ams.map(x=>[x.k,x.good,x.same,x.t]),self:homeFigures(H).length};}""")
    pg.wait_for_timeout(300)
    vs['shown'] = pg.evaluate("()=>[...document.querySelectorAll('#detail .vshome li')].filter(l=>l.getClientRects().length).length")
    # ---- the list and a place's details (v64)
    pg.wait_for_function("()=>document.documentElement.dataset.sim==='done'")   # the order settles when the likely ranges are in
    pg.evaluate("closePlace()"); pg.click('#more'); pg.wait_for_timeout(400)
    ls = pg.evaluate("""()=>{const kids=[...document.querySelectorAll('#list > *')];let last=null,bad=[],nums=[],div=0;
      kids.forEach(k=>{if(k.classList.contains('lgroup')){last=null;div++;return;}
        const s=+k.querySelector('.sn').textContent,n=k.querySelector('.n');if(n)nums.push(+n.textContent);
        if(last!=null&&s>last)bad.push(k.querySelector('b').textContent+' '+s+' under '+last);last=s;});
      return {rows:kids.length-div,div,bad:bad.slice(0,5),seq:nums.every((n,i)=>n===i+2),first:nums.slice(0,3)}}""")
    pg.evaluate("document.querySelectorAll('#list .row')[14].scrollIntoView({block:'center',behavior:'instant'})"); pg.wait_for_timeout(200)
    y0 = pg.evaluate('scrollY'); pg.locator('#list .row').nth(14).click(); pg.wait_for_timeout(400)
    op = {'detail': pg.is_visible('#detail'), 'list': pg.is_visible('#list'), 'name': pg.inner_text('#detail h2'), 'row': pg.evaluate("ui.order[14]"), 'pos': pg.inner_text('#detail .dsteps .meta')}
    pg.click('.dsteps .dstep >> nth=1'); pg.wait_for_timeout(300); op['next'] = pg.evaluate("ui.sel.key === ui.order[15]")
    pg.go_back(); pg.wait_for_timeout(400)
    op.update(back_list=pg.is_visible('#list'), back_detail=pg.is_visible('#detail'), y=(y0, pg.evaluate('scrollY')), here=pg.url.startswith('file:'))
    for i in (0, 1, 2): pg.locator('#list [data-heart]').nth(i).click(); pg.wait_for_timeout(150)
    cmp = pg.evaluate("()=>[[...document.querySelectorAll('#cmp .cell b')].map(b=>b.textContent),[...document.querySelectorAll('#list .sn')].slice(0,3).map(b=>b.textContent)]")
    b.close()
check('no rounded score crosses its verdict line', r['cross'] == 0, r['cross'])
check('no Strong fit below 70', r['fitBad'] == 0)
check('nothing is scored on screen before a take', start['shown'] == [] and start['rows'] == 0 and start['quiz'], start)
check('a translated first card has the number of cities filled in', '{' not in fr and str(len(D['cities'])) in fr, fr.replace('\n', ' ')[:90])
check('the map, ranking and details appear with the take', all(x in after for x in ('#work', '#mapSec', '#rankSec', '#resPanel')), after)
check('the sample take is what the quiz gives for its answers', same)
check("Amsterdam is in the sample take's top 3", 'Amsterdam' in r['top3'], r['top3'])
check('Austin politics averages state (R+13.7 -> 1) and Travis County (D+39.1 -> 5) to 3', r['austin'] == 3, r['austin'])
check('every likely range is ordered', r['ranges'])
# ---- the list and a place's details
check('the list never shows a higher score under a lower one without a line saying why', ls['rows'] > 700 and not ls['bad'] and ls['div'] >= 2, ls)
check('rows are numbered 2, 3, 4 … after the best match', ls['seq'], ls['first'])
check('a row opens its details in the list\'s place, at the right spot in the order', op['detail'] and not op['list'] and op['row'].endswith(op['name']) and op['pos'].startswith('15 /'), op)
check('the arrow steps to the next place; Back returns to the list at the same spot, still on the page', op['next'] and op['back_list'] and not op['back_detail'] and op['here'] and abs(op['y'][0] - op['y'][1]) < 3, op)
check('Compare shows the same rounded scores as the list', cmp[0] == cmp[1] and len(cmp[0]) == 3, cmp)
# ---- compared with where you live now
RAWC = lambda city: float(D['raw']['city:' + city]['commute'][0][1])
com = next((x for x in vs['ams'] if x[0] == 'commute'), None)
check('home comparison: the commute line carries both published figures (New York 43, Amsterdam 23) and says better',
      com and str(round(RAWC('New York City'))) in com[3] and str(round(RAWC('Amsterdam'))) in com[3] and com[1] and not com[2], com)
check('home comparison: healthcare is left out where the one figure and the whole score disagree', not any(x[0] == 'hlth' for x in vs['ams']), [x[0] for x in vs['ams']])
check('home comparison: every line compares like with like and agrees with the factor score', vs['n'] > 3000 and vs['nbad'] == 0, (vs['n'], vs['bad']))
check('home comparison: nothing for the home itself; five lines on screen in the plain view', vs['self'] == 0 and vs['shown'] == 5, (vs['self'], vs['shown']))
check('probabilities are between 0 and 1', r['probs'])
print(f"\n{len(fails)} failed" if fails else "\nall passed"); sys.exit(1 if fails else 0)
