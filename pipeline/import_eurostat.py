"""Regional unemployment for European cities: writes pipeline/sources/regional_jobs.py.
Usage: python3 import_eurostat.py lfst_r_lfu3rt_spreadsheet.xlsx nutsrg_2.json
- Eurostat lfst_r_lfu3rt (Labour Force Survey): unemployment rate, ages 15-74, all education levels, NUTS 2 regions.
- Region boundaries: Eurostat GISCO NUTS 2024 at 1:3 million, as published in github.com/eurostat/Nuts2json (pub/v2/2024/4326/03M).
Each atlas city is placed in the NUTS 2 region that contains its centre (or the nearest one within 15 km, for coastal centres
that fall just outside the generalised outline). The rate is the mean of the two latest years published for that region."""
import json, os, sys, hashlib, datetime, warnings
import openpyxl
from shapely.geometry import shape, Point
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources.more_cities import WORLD, US_METROS
warnings.filterwarnings('ignore')
XL, GJ = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]

wb = openpyxl.load_workbook(XL)
rows = list(wb['Sheet 1'].iter_rows(values_only=True)); flags = list(wb['Flags 1'].iter_rows(values_only=True))
hdr = next(r for r in rows if r[0] == 'TIME'); years = [int(y) for y in hdr[2:] if y]
VAL, NAME, FLAG = {}, {}, {}
for r, f in zip(rows, flags):
    if r[0] and r[1] and r[0] != 'TIME' and not r[0].startswith('GEO') and isinstance(r[0], str) and len(r[0]) == 4:
        ys = [(y, v, (f[2 + i] or '')) for i, (y, v) in enumerate(zip(years, r[2:])) if isinstance(v, (int, float))]
        if ys:
            last = ys[-2:]
            VAL[r[0]] = (round(sum(v for _, v, _ in last) / len(last), 1), '–'.join(str(y) for y in sorted({last[0][0], last[-1][0]})))
            NAME[r[0]] = r[1]; FLAG[r[0]] = ''.join(sorted(set(''.join(fl for _, _, fl in last))))

geo = json.load(open(GJ))
REG = [(ft['properties']['id'], ft['properties'].get('na', ''), shape(ft['geometry'])) for ft in geo['features']]

# every city in the atlas, with its centre
base = json.load(open(os.path.join(HERE, 'input', 'base.json'), encoding='utf8'))
pts = {c[0]: (c[1], c[2]) for c in base['cities']}
for r in json.load(open(os.path.join(HERE, 'input', 'cities_added.json'), encoding='utf8')): pts.setdefault(r[0], (r[1], r[2]))
for n, (_c, la, lo, _s) in WORLD.items(): pts.setdefault(n, (la, lo))
for n in US_METROS: pts.pop(n, None)

LOCAL_UNEMP, miss = {}, []
for n, (la, lo) in sorted(pts.items()):
    p = Point(lo, la)
    hit = [rid for rid, _na, g in REG if g.contains(p)]
    if not hit:
        near = min(REG, key=lambda t: t[2].distance(p))
        if near[2].distance(p) * 111 <= 15: hit = [near[0]]   # degrees -> km, near enough at these latitudes for a 15 km cut-off
    if not hit: continue
    rid = hit[0]
    if rid in VAL: LOCAL_UNEMP[n] = (VAL[rid][0], 'eurostat', f'{NAME[rid]}, {VAL[rid][1]}' + (' ⚠' if 'u' in FLAG[rid] else ''))
    else: miss.append((n, rid))

fmt = lambda d: '{\n' + ''.join(f'    {k!r}: {v!r},\n' for k, v in sorted(d.items())) + '}\n'
open(os.path.join(HERE, 'sources', 'regional_jobs.py'), 'w').write(f'''"""Unemployment rate in the city's region (%, ages 15-74). Lower is better.
Made by pipeline/import_eurostat.py on {datetime.date.today()}; edit the source files and re-run it rather than editing these numbers.
Eurostat lfst_r_lfu3rt, NUTS 2 regions, last updated 30 Oct 2026 ({os.path.basename(XL)}, sha256 {sha(XL)}); mean of the two latest years.
  https://ec.europa.eu/eurostat/databrowser/view/lfst_r_lfu3rt/default/table
Regions: GISCO NUTS 2024, 1:3 million (github.com/eurostat/Nuts2json, {os.path.basename(GJ)}, sha256 {sha(GJ)}).
city -> (rate, 'eurostat', 'region, years'); ⚠ = Eurostat flags the figure as low reliability.
In a region with no published rate: {miss}
"""
LOCAL_UNEMP = {fmt(LOCAL_UNEMP)}''')
print(f'{len(LOCAL_UNEMP)} European cities placed; no rate for {len(miss)}: {miss}')
