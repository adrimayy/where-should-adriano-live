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
 const TR={fit:0,ok:1,caution:2,avoid:3,nodata:4};const cs=L.filter(e=>e.type==='city').sort((a,b)=>TR[a.ad.tier]-TR[b.ad.tier]||b.ad.lo-a.ad.lo);
 const by=n=>A.ents().find(e=>e.name===n);
 return {cross:L.filter(e=>band(r5(e.score))!==band(e.score)).length,
  fitBad:L.filter(e=>e.ad.tier==='fit'&&e.ad.score<70).length,
  top3:cs.slice(0,3).map(e=>e.name),
  austin:by('Austin').sc.pol, tampicoLo:by('Tampico').lo<=by('Tampico').score&&by('Tampico').score<=by('Tampico').hi+1,
  ranges:L.every(e=>e.lo<=e.hi), probs:L.every(e=>e.pFit>=0&&e.pFit<=1&&e.pTop>=0&&e.pTop<=1),
  likely:L.filter(e=>e.likely).map(e=>e.name).slice(0,5)};}"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME); pg = b.new_page(); pg.route('**/*', route)
    pg.goto('file://' + PAGE); pg.wait_for_timeout(800); pg.click('#skipQuiz'); pg.wait_for_timeout(300)
    r = pg.evaluate(JS); b.close()
check('no rounded score crosses its verdict line', r['cross'] == 0, r['cross'])
check('no Strong fit below 70', r['fitBad'] == 0)
check("Amsterdam is in Adriano's top 3", 'Amsterdam' in r['top3'], r['top3'])
check('Austin politics averages state (R+13.7 -> 1) and Travis County (D+39.1 -> 5) to 3', r['austin'] == 3, r['austin'])
check('every likely range is ordered', r['ranges'])
check('probabilities are between 0 and 1', r['probs'])
print(f"\n{len(fails)} failed" if fails else "\nall passed"); sys.exit(1 if fails else 0)
