"""Out-of-sample checks on the three shortcuts used for the cities added in November 2026.
Run after build.py. Writes docs/reports/VALIDATION.md.

1. BEA regional price parities converted to Numbeo's cost-of-living scale (US metros without Numbeo figures).
2. January/July means used as the coldest/hottest month (US metros with NOAA normals from Current Results).
3. The nearest station within 120 km used for a metro with no station of its own.
"""
import json, math, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'pipeline'))
from bands import b_cost, b_temp
from sources.climate import TEMPS
from sources.more_cities import BEA_RPP, CTT, US_METROS, WIKI_TEMPS, dist, jj_for
from sources.numbeo import NCOL

mean = lambda v: sum(v) / len(v)
out = ['# Validation of the sources added in November 2026', '',
       'Made by `tests/validate_sources.py`. Every check predicts places whose real value is known and was held out.', '']


def ols(pts):
    mx, my = mean([x for x, _ in pts]), mean([y for _, y in pts])
    b = sum((x - mx) * (y - my) for x, y in pts) / sum((x - mx) ** 2 for x, _ in pts)
    return my - b * mx, b


band_err = lambda pred, true: mean([abs(b_cost(p).c - b_cost(t).c) for p, t in zip(pred, true)])

# ---------- 1. price parities -> Numbeo cost index ----------
numbeo = {}
for part in NCOL.split(';'):
    k, v = part.split(':')
    numbeo[k.strip()] = [float(x) for x in v.split(',')]
alias = {'New York City': 'New York'}
pairs = sorted((BEA_RPP[n][0], numbeo[alias.get(n, n)][2], n) for n in BEA_RPP if alias.get(n, n) in numbeo)
logs = [(math.log(x), math.log(y)) for x, y, _ in pairs]
a, b = ols(logs)
my = mean([y for _, y in logs])
r2 = 1 - sum((a + b * x - y) ** 2 for x, y in logs) / sum((y - my) ** 2 for _, y in logs)
loo = []
for i in range(len(logs)):
    a_, b_ = ols(logs[:i] + logs[i + 1:])
    loo.append(math.exp(a_ + b_ * logs[i][0]))
out += ['## 1. BEA price parities on Numbeo\'s cost scale', '',
        f'{len(pairs)} US cities have both a BEA regional price parity (2023) and a Numbeo cost-of-living-plus-rent index. '
        f'Fit: ln(index) = {a:.2f} + {b:.2f} ln(RPP), R² = {r2:.2f}. Leaving each city out in turn, the predicted band is off by '
        f'{band_err(loo, [y for _, y, _ in pairs]):.2f} on average.', '',
        f'The calibration cities cover RPP {pairs[0][0]}–{pairs[-1][0]}. Most small metros are cheaper than that, so the fit was also '
        'tested in the direction it would be extrapolated: trained on the more expensive cities, used on the cheaper ones.', '',
        '| Trained on | Tested on | Extrapolating: bias (index points) | band error | Held flat at the edge: bias | band error |',
        '|---|---|---|---|---|---|']
for cut in (9, 13, 17):
    lo, hi = pairs[:cut], pairs[cut:]
    a_, b_ = ols([(math.log(x), math.log(y)) for x, y, _ in hi])
    edge = hi[0][0]
    ext = [math.exp(a_ + b_ * math.log(x)) for x, _, _ in lo]
    flat = [math.exp(a_ + b_ * math.log(max(x, edge))) for x, _, _ in lo]
    true = [y for _, y, _ in lo]
    out.append(f'| top {len(hi)} | bottom {cut} | {mean([p - t for p, t in zip(ext, true)]):+.1f} | {band_err(ext, true):.2f} | '
               f'{mean([p - t for p, t in zip(flat, true)]):+.1f} | {band_err(flat, true):.2f} |')
below = sum(1 for n, (x, _) in BEA_RPP.items() if alias.get(n, n) not in numbeo and x < pairs[0][0])
total = sum(1 for n in BEA_RPP if alias.get(n, n) not in numbeo)
out += ['', 'Extrapolating downward makes cheap cities look cheaper than they are in the two splits closest to the real use. '
        'Holding the conversion flat below the calibration range is closer and nearly unbiased there; it fails only when the '
        'calibration set is cut to the ten most expensive cities, which is not the real case.',
        f'**Rule used:** the fit inside the range ({total - below} metros); below it, the value at the edge of the range, shown as '
        f'"or less" ({below} metros). That is a ceiling on cost: it can understate how affordable a small metro is, never overstate it.',
        '']

# money left after rent from BEA income and prices: tested, not used
import re
from bands import b_money
from sources.more_cities import _RPP, _bea_name
_txt0 = (ROOT / 'data' / 'atlas.js').read_text()
RAW = json.loads(_txt0[_txt0.index('{'):_txt0.rindex('}') + 1])['raw']
pcpi = {l.split('|')[0]: float(l.strip().split('|')[1]) for l in open(ROOT / 'pipeline' / 'input' / 'bea_pcpi_2023.txt') if not l.startswith('#')}
rows = []
for n in US_METROS:
    bn = _bea_name(n)
    pay = [r for r in RAW.get('city:' + n, {}).get('pay', []) if r[0] in ('items', 'itemsn', 'nidx')]
    if bn and pay: rows.append((pcpi[bn] / _RPP[bn][0] * 100, float(re.sub(r'[^0-9.]', '', pay[0][1].split('=')[-1]))))
def loo_band(pts, const=False):
    e = []
    for i in range(len(pts)):
        rest = pts[:i] + pts[i + 1:]
        pred = mean([y for _, y in rest]) if const else (lambda ab: ab[0] + ab[1] * pts[i][0])(ols(rest))
        e.append(abs(b_money(pred).c - b_money(pts[i][1]).c))
    return mean(e)
a2, b2 = ols(rows)
my2 = mean([y for _, y in rows])
r2m = 1 - sum((a2 + b2 * x - y) ** 2 for x, y in rows) / sum((y - my2) ** 2 for _, y in rows)
out += ['### BEA income per person as money left after rent: tested, not used', '',
        f'BEA income per person divided by the price parity ("real income") was tried as a measure of money left after rent, on the '
        f'{len(rows)} cities that have both. It explains {100 * r2m:.0f}% of it; leaving each city out, the band is off by '
        f'{loo_band(rows):.2f}, against {loo_band(rows, True):.2f} for simply guessing the average. '
        'Personal income counts everyone and every kind of income (pensions, dividends, benefits); the atlas measures one '
        "worker's take-home pay minus a one-bedroom rent. They are different quantities, so BEA income is not used. "
        'Census earnings and rents are the right ingredients; see section 4.', '']

# ---------- 2. January/July means vs full normals ----------
both = [(n, jj_for(n), TEMPS[n]) for n in US_METROS if jj_for(n) and n in TEMPS]
hot = [j[1] - max(t) for _, j, t in both]
cold = [j[0] - min(t) for _, j, t in both]
worst = max(both, key=lambda r: abs(r[1][1] - max(r[2])))
out += ['## 2. January and July as the coldest and hottest month', '',
        f'{len(both)} US cities have both the January/July normals and full 12-month normals. Hottest month: bias '
        f'{mean(hot):+.2f} °C, mean absolute error {mean([abs(x) for x in hot]):.2f} °C. Coldest month: bias {mean(cold):+.2f} °C, '
        f'mean absolute error {mean([abs(x) for x in cold]):.2f} °C. The climate bands are several degrees wide.',
        f'The largest miss is {worst[0]} ({worst[1][1] - max(worst[2]):+.1f} °C on the hottest month): on the California coast '
        'September is warmer than July, so July understates the peak there. Coastal California metros with only January/July '
        'figures (Santa Cruz, Salinas, San Luis Obispo, Santa Barbara, Oxnard, Napa, Santa Rosa, Vallejo) carry that caveat.', '']

# ---------- 3. nearest station within 120 km ----------
_txt = (ROOT / 'data' / 'atlas.js').read_text()
D = json.loads(_txt[_txt.index('{'):_txt.rindex('}') + 1])
pos = {c[0]: (c[1], c[2]) for c in D['cities'] if c[3] == '840'}
own = {}
for n in pos:
    if n in TEMPS: own[n] = (max(TEMPS[n]), min(TEMPS[n]))
    elif n in WIKI_TEMPS and n not in CTT: own[n] = (max(WIKI_TEMPS[n]), min(WIKI_TEMPS[n]))
    elif n in US_METROS and jj_for(n) and jj_for(n)[2] == n: own[n] = (jj_for(n)[1], jj_for(n)[0])
errs = []
for n, v in own.items():
    near = min((k for k in own if k != n), key=lambda k: dist(pos[n], pos[k]))
    if dist(pos[n], pos[near]) <= 120:
        errs.append((abs(b_temp(*own[near])[1] - b_temp(*v)[1]), abs(own[near][0] - v[0]), abs(own[near][1] - v[1])))
out += ['## 3. Borrowing the nearest station', '',
        f'For each of {len(errs)} US places with their own temperatures and another station within 120 km, the neighbour\'s figures '
        f'were used instead. Hottest month off by {mean([e[1] for e in errs]):.2f} °C and coldest by {mean([e[2] for e in errs]):.2f} °C '
        f'on average; the climate band is off by {mean([e[0] for e in errs]):.2f}, and by a full band or more in '
        f'{100 * mean([e[0] >= 1 for e in errs]):.0f}% of cases. The pipeline also refuses to borrow across mountains, deserts and '
        'coasts (a fixed list of 33 places), where the error is largest.', '']

# ---------- 4. Census ACS figures on the atlas's scales ----------
from bands import b_av, b_co2, b_comm
from sources.housing import AV_US_MSA
from sources.more_cities import ACS, BEA_RPP as RPPM
num = lambda t: float(re.sub(r'[^0-9.\-]', '', t.split('=')[-1]))
def rawv(n, f, keys):
    r = [x for x in RAW.get('city:' + n, {}).get(f, []) if x[0] in keys]
    return num(r[0][1]) if r else None
def check(pts, band, log=False):
    """Leave-one-out band error of a straight-line fit, of guessing the average, and the rank correlation."""
    f = (lambda v: math.log(v)) if log else (lambda v: v)
    g = (lambda v: math.exp(v)) if log else (lambda v: v)
    fit, avg_ = [], []
    for i in range(len(pts)):
        rest = pts[:i] + pts[i + 1:]
        a_, b_ = ols([(f(x), f(y)) for x, y in rest])
        fit.append(abs(band(g(a_ + b_ * f(pts[i][0]))).c - band(pts[i][1]).c))
        avg_.append(abs(band(mean([y for _, y in rest])).c - band(pts[i][1]).c))
    rk = lambda v: [sorted(v).index(x) for x in v]
    rx, ry = rk([x for x, _ in pts]), rk([y for _, y in pts])
    mx, my_ = mean(rx), mean(ry)
    rho = sum((a_ - mx) * (b_ - my_) for a_, b_ in zip(rx, ry)) / math.sqrt(sum((a_ - mx) ** 2 for a_ in rx) * sum((b_ - my_) ** 2 for b_ in ry))
    return mean(fit), mean(avg_), rho
comm = [(ACS[n]['commute'], rawv(n, 'commute', ('nqolt',))) for n in ACS if ACS[n]['commute'] and rawv(n, 'commute', ('nqolt',))]
car = [(ACS[n]['drove'], rawv(n, 'move', ('ntr',))) for n in ACS if ACS[n]['drove'] and rawv(n, 'move', ('ntr',))]
vac = [(ACS[n]['vac'], AV_US_MSA[n]) for n in ACS if n in AV_US_MSA and ACS[n]['vac'] is not None]
MON = json.loads(_txt0[_txt0.index('{'):_txt0.rindex('}') + 1])['money']
mo = [n for n in ACS if n in MON and MON[n][3] != 'acs' and n in RPPM and ACS[n]['earn'] and ACS[n]['rent']]
true_m = [(MON[n][0] - MON[n][1]) / (MON[n][2] / 100) for n in mo]
def comp(train, n, clamp=False):
    def conv(xk, yi):
        pts = [(math.log(xk(t)), math.log(MON[t][yi])) for t in train]
        a_, b_ = ols(pts); x = xk(n)
        if clamp: x = min(max(x, min(xk(t) for t in train)), max(xk(t) for t in train))
        return math.exp(a_ + b_ * math.log(x))
    s_, r_, c_ = conv(lambda t: ACS[t]['earn'], 0), conv(lambda t: ACS[t]['rent'], 1), conv(lambda t: RPPM[t][0], 2)
    return (s_ - r_) / (c_ / 100)
loo_m = [comp([t for t in mo if t != n], n) for n in mo]
mb = lambda p, t: mean([abs(b_money(a_).c - b_money(b_).c) for a_, b_ in zip(p, t)])
avg_m = [mean([true_m[j] for j in range(len(mo)) if j != i]) for i in range(len(mo))]
order = sorted(range(len(mo)), key=lambda i: ACS[mo[i]]['rent'])
cheap, rest = order[:13], order[13:]
ext = [comp([mo[j] for j in rest], mo[i]) for i in cheap]
cf, ca, cr = check(comm, b_comm)
vf, va, vr = check(vac, lambda v: b_av('vac', v, None))
kf, ka, kr = check(car, b_co2)
n_pay = sum(1 for P in RAW.values() for r in P.get('pay', []) if r[0] == 'acspay')
n_vac = sum(1 for P in RAW.values() for r in P.get('home', []) if r[0] == 'acsvac')
n_com = sum(1 for P in RAW.values() for r in P.get('commute', []) if r[0] == 'acscomm')
sal = [(ACS[n]['earn'], MON[n][0]) for n in mo]
rnt = [(ACS[n]['rent'], MON[n][1]) for n in mo]
pear = lambda pts: (lambda mx, my_: sum((x - mx) * (y - my_) for x, y in pts) / math.sqrt(sum((x - mx) ** 2 for x, _ in pts) * sum((y - my_) ** 2 for _, y in pts)))(mean([x for x, _ in pts]), mean([y for _, y in pts]))
out += ['## 4. Census (ACS 2024) figures on the atlas\'s scales', '',
        'Inside one country the gap-filling model predicts close to the national city average for every city, so the benchmark '
        'here is "guess the US average". A Census figure is used only if it predicts held-out cities better than that.', '',
        '| Factor | Census figure | Cities with both | Rank correlation | Band error: conversion | Band error: US average | Decision |',
        '|---|---|---|---|---|---|---|',
        f'| Commute | mean travel time to work | {len(comm)} | {cr:.2f} | {cf:.2f} | {ca:.2f} | used ({n_com} metros) |',
        f'| Housing availability | rental vacancy rate | {len(vac)} | {vr:.2f} | {vf:.2f} | {va:.2f} | used inside the calibrated range ({n_vac} metros) |',
        f'| Car dependence | share driving alone | {len(car)} | {kr:.2f} | {kf:.2f} | {ka:.2f} | **not used** |',
        f'| Money left after rent | earnings, rent, BEA prices, converted one by one | {len(mo)} | | {mb(loo_m, true_m):.2f} | {mb(avg_m, true_m):.2f} | used inside the calibrated ranges ({n_pay} metros) |',
        '', '**Money left after rent.** Census earnings track Numbeo\'s salaries (correlation '
        f'{pear(sal):.2f}) and Census rents track Numbeo\'s rents ({pear(rnt):.2f}), but a single regression of the final figure on '
        'earnings and rent does poorly, because the figure is a difference of two large, correlated amounts and small errors in each '
        'dominate it. Converting salary, rent and prices separately and then applying the atlas\'s formula keeps each conversion '
        'where it is strong. Trained on the 14 higher-rent cities and applied to the 13 cheaper ones without limits, it overstates '
        f'money left by ${mean([e - true_m[i] for e, i in zip(ext, cheap)]):,.0f} a month on average, so it is applied only to metros '
        'whose earnings, rent and price level all lie inside the calibrated ranges. The rest stay filled in.', '',
        '**Car dependence.** The share of workers who drive alone has no relationship with the Numbeo traffic CO₂ index the atlas '
        'scores. Among large US metros the two do not measure the same thing, so the Census figure is not substituted. This is '
        'also a caution about the existing measure: it is kept because it is the only one available worldwide.', '',
        '**Housing availability.** The Census Bureau publishes rental vacancy from two surveys. The atlas used the Housing Vacancy '
        'Survey (75 large metros); the ACS covers every metro but reads about a point lower, so it is shifted onto the first survey\'s '
        'scale. Above the calibrated range (very high vacancy, mostly resort areas) the conversion was unreliable and is not used.', '']

(ROOT / 'docs' / 'reports').mkdir(exist_ok=True)
(ROOT / 'docs' / 'reports' / 'VALIDATION.md').write_text('\n'.join(out) + '\n')
print('\n'.join(out))
