"""How much of the ranking is just national wealth? (O'Neil.) Correlates every city's score with its country's GDP per person
(World Bank PPP, pipeline/sources/economy.py), for Adriano's take and for equal weights, and reports the share of the ranking that
wealth explains (R squared of score on log GDP per person). Run after build.py: python3 tests/wealth_bias.py"""
import sys, math, pathlib, numpy as np
from harness import sync_playwright, route, PAGE, CHROME
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'pipeline'))
from sources.economy import GDPPC_T
GDP = {a.strip(): float(b) for a, b in (p.split('|') for p in GDPPC_T.replace('\n', '').split(';'))}
ALIAS = {'Czechia': 'Czech Republic', 'Türkiye': 'Turkey', "Côte d'Ivoire": 'Ivory Coast', 'Hong Kong SAR': 'Hong Kong', 'Bosnia and Herz.': 'Bosnia and Herzegovina', 'Central African Rep.': 'Central African Republic', 'Dem. Rep. Congo': 'DR Congo', 'Dominican Rep.': 'Dominican Republic', 'Eq. Guinea': 'Equatorial Guinea', 'Solomon Is.': 'Solomon Islands', 'Timor-Leste': 'East Timor', 'eSwatini': 'Eswatini'}
def gdp(name): return GDP.get(name) or GDP.get(ALIAS.get(name, ''))
JS = """(mode)=>{const A=window.__atlas;return A.ents().filter(e=>A.listable(e)).map(e=>({t:e.type,n:e.name,c:e.type==='city'?(e.countryEnt?e.countryEnt.name:(e.iso===702?'Singapore':'')):e.name,
  s:mode==='ad'?e.ad.score:e.score}));}"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME); pg = b.new_page(); pg.route('**/*', route)
    pg.goto('file://' + PAGE); pg.wait_for_timeout(800)
    res = {'Adriano': pg.evaluate(JS, 'ad'), 'Everything equal': pg.evaluate(JS, 'cur')}
    b.close()
for label, rows in res.items():
    for t in ('city', 'country'):
        xs, ys, miss = [], [], []
        for r in rows:
            if r['t'] != t: continue
            g = gdp(r['c']) if r['c'] != 'Hong Kong' or t == 'country' else GDP['Hong Kong']
            if r['n'] == 'Hong Kong': g = GDP['Hong Kong']
            if g: xs.append(math.log(g)); ys.append(r['s'])
            else: miss.append(r['c'])
        xs, ys = np.array(xs), np.array(ys); rr = np.corrcoef(xs, ys)[0, 1]
        slope = np.polyfit(xs, ys, 1)[0]
        print(f"{label:<16} {t+'s':<10} n={len(xs):>3}  r={rr:+.2f}  R²={rr*rr:.2f}  (+{slope*math.log(2):.1f} points per doubling of GDP per person)" + (f"  no GDP: {sorted(set(miss))}" if miss else ''))
